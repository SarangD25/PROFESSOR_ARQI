import { hashToken, verifyQRSignature } from '../utils/crypto.js';
import { callAI } from '../utils/aiProvider.js';
import { getSubjectKnowledge, pickRandomPYQs, buildParaphrasePrompt } from '../utils/subjectKnowledge.js';
function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ]);
}
// ---------------------------------------------------------------------------
// parseQuestions — handles Groq object wrapping, strips reasoning field,
// normalises correctAnswer to full option text (never a bare letter).
// ---------------------------------------------------------------------------
function parseQuestions(response) {
    if (!response)
        return null;
    let cleaned = response.replace(/```json/gi, '').replace(/```/g, '').trim();
    // ── Fix 3: Groq sometimes wraps the array in {"questions":[...]} ──────────
    if (cleaned.startsWith('{')) {
        try {
            const obj = JSON.parse(cleaned);
            for (const key of Object.keys(obj)) {
                if (Array.isArray(obj[key])) {
                    cleaned = JSON.stringify(obj[key]);
                    break;
                }
            }
        }
        catch (_) { /* fall through to regex extraction */ }
    }
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match)
        return null;
    try {
        const parsed = JSON.parse(match[0]);
        if (!Array.isArray(parsed))
            return null;
        return parsed.filter(q => {
            if (!q.text || q.text.length < 20)
                return false;
            if (!Array.isArray(q.options) || q.options.length < 2)
                return false;
            // Strip option prefixes like "A. ", "B) " etc.
            q.options = q.options.map(o => {
                if (typeof o !== 'string')
                    return '';
                return o.replace(/^[A-Da-d][.):\s]+/, '').trim();
            });
            // Reject placeholder / garbage options
            const badOption = q.options.some(o => {
                if (!o || o.length === 0)
                    return true;
                if (/^option\s*\d*$/i.test(o))
                    return true;
                return false;
            });
            if (badOption) {
                console.error('[QParse] Rejected bad options:', q.text.substring(0, 50), q.options);
                return false;
            }
            // ── Fix 4: normalise correctAnswer to full option text ─────────────────
            if (q.type === 'MCQ') {
                if (typeof q.correctAnswer === 'string') {
                    // Strip any "A. " prefix that leaked through
                    let ca = q.correctAnswer.replace(/^[A-Da-d][.):\s]+/, '').trim();
                    // If AI returned just a bare letter ("A", "B", "C", "D") map → option text
                    if (/^[A-Da-d]$/.test(ca)) {
                        const idx = ca.toUpperCase().charCodeAt(0) - 65;
                        if (q.options[idx])
                            ca = q.options[idx];
                    }
                    // If still not matching an option exactly, try case-insensitive match
                    if (!q.options.includes(ca)) {
                        const ci = q.options.find(o => o.toLowerCase() === ca.toLowerCase());
                        if (ci)
                            ca = ci;
                    }
                    q.correctAnswer = ca;
                }
            }
            else if (q.type === 'MSQ') {
                if (Array.isArray(q.correctAnswer)) {
                    q.correctAnswer = q.correctAnswer.map(ca => {
                        if (typeof ca !== 'string')
                            return ca;
                        let s = ca.replace(/^[A-Da-d][.):\s]+/, '').trim();
                        if (/^[A-Da-d]$/.test(s)) {
                            const idx = s.toUpperCase().charCodeAt(0) - 65;
                            if (q.options[idx])
                                s = q.options[idx];
                        }
                        const ci = q.options.find(o => o.toLowerCase() === s.toLowerCase());
                        return ci || s;
                    });
                }
            }
            // Drop the chain-of-thought reasoning field — we don't store it
            delete q.reasoning;
            return true;
        });
    }
    catch (e) {
        return null;
    }
}
// ---------------------------------------------------------------------------
// verifyQuestions — one batch call; verifier solves each question from scratch
// and returns the correct answer. If it disagrees, we use the verifier's answer.
// ---------------------------------------------------------------------------
async function verifyQuestions(questions, campaign = {}) {
    if (!questions || questions.length === 0)
        return questions;
    const qList = questions.map((q, i) => {
        if (q.type === 'MCQ') {
            const opts = q.options.map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`).join(' | ');
            return `Q${i + 1} [MCQ] ${q.text}\nOptions: ${opts}`;
        }
        else if (q.type === 'MSQ') {
            const opts = q.options.map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`).join(' | ');
            return `Q${i + 1} [MSQ — select ALL correct] ${q.text}\nOptions: ${opts}`;
        }
        else {
            return `Q${i + 1} [NAT — numerical] ${q.text}`;
        }
    }).join('\n\n');
    // ── Fix 2: Verifier SOLVES from scratch; uses dynamic exam/topic context ────
    const examLabel = campaign.examName || 'competitive exam';
    const topicLabel = campaign.topic || 'the given subject';
    const subjectInfo = getSubjectKnowledge(topicLabel);
    const isDBAMS = topicLabel.toLowerCase().includes('dbms') ||
        topicLabel.toLowerCase().includes('database') ||
        subjectInfo.domain === 'DBMS';
    // Only include DBMS-specific rules if the topic is actually DBMS
    const dbmsVerifyRules = isDBAMS ? `
NORMALIZATION — MANDATORY ALGORITHM (apply to EVERY normalization question):
Step 1 — Find ALL candidate keys by computing closures.
Step 2 — Identify prime and non-prime attributes.
Step 3 — Check 2NF: partial dependencies on candidate key?
Step 4 — Check 3NF: transitive dependencies (non-prime → non-prime)?
Step 5 — Check BCNF: every determinant must be a superkey.
CRITICAL: Single-attribute CK → 2NF auto-satisfied, but 3NF can still be violated.

CONCURRENCY/TRANSACTIONS:
- Conflict serializable = serial schedule via swapping non-conflicting ops.
- Recoverable = Tj reads from Ti → Tj commits after Ti.
- 2PL: shared lock allows concurrent reads; exclusive requires no other locks.

SQL:
- AND = both conditions simultaneously. OR = at least one.
- σ (selection) ≡ WHERE clause.

FUNCTIONAL DEPENDENCIES:
- X→Y: for each X value, exactly one Y value.
- X→Y does NOT imply Y→X.` : '';
    const verifyPrompt = `You are a ${examLabel} examiner and subject matter expert in "${topicLabel}" (${subjectInfo.domain}).

Solve each question INDEPENDENTLY from scratch. The stated answer may be WRONG — your job is to find the TRUE correct answer.

MANDATORY SOLVING PROCESS per question:
1. Identify the concept being tested.
2. Show your working in "reasoning" (3-5 sentences minimum).
3. Arrive at the answer from first principles.
4. Return the exact option text — never a letter.
${dbmsVerifyRules}

IMPORTANT: You are verifying questions about "${topicLabel}" for the "${examLabel}" exam. ALL questions MUST be about this subject domain. If a question appears to be about a completely different subject, flag it in your reasoning.

QUESTIONS:
${qList}

Return ONLY a JSON array — no preamble, no trailing text, no markdown fences:
[{"q":1,"answer":"full option text or number","reasoning":"3-5 sentence working showing how you arrived at this answer"},...]`;
    try {
        console.log('[Verify] Starting answer verification for', questions.length, 'questions...');
        const verifyResponse = await withTimeout(callAI(verifyPrompt), 120000);
        let vCleaned = verifyResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        // Handle Groq object wrapping in verify response too
        if (vCleaned.startsWith('{')) {
            try {
                const obj = JSON.parse(vCleaned);
                for (const key of Object.keys(obj)) {
                    if (Array.isArray(obj[key])) {
                        vCleaned = JSON.stringify(obj[key]);
                        break;
                    }
                }
            }
            catch (_) { }
        }
        const match = vCleaned.match(/\[[\s\S]*\]/);
        if (!match) {
            console.log('[Verify] Could not parse verification response, keeping all questions');
            return questions;
        }
        const verified = JSON.parse(match[0]);
        let kept = 0, fixed = 0, dropped = 0;
        const result = questions.map((q, i) => {
            const v = verified.find(a => a.q === i + 1);
            if (!v) {
                kept++;
                return q;
            }
            const vAnswer = v.answer;
            if (q.type === 'MCQ') {
                const origNorm = (q.correctAnswer || '').toLowerCase().trim();
                const verifyNorm = (vAnswer || '').toLowerCase().trim();
                if (origNorm === verifyNorm) {
                    kept++;
                    return q;
                }
                // Exact match first
                const exactMatch = q.options.find(o => o.toLowerCase().trim() === verifyNorm);
                if (exactMatch) {
                    console.log(`[Verify] FIXED MCQ Q${i + 1}: "${q.correctAnswer}" → "${exactMatch}" | ${v.reasoning || ''}`);
                    fixed++;
                    return { ...q, correctAnswer: exactMatch };
                }
                // Partial/substring match — verifier may return slightly different phrasing
                const partialMatch = q.options.find(o => o.toLowerCase().includes(verifyNorm) || verifyNorm.includes(o.toLowerCase().trim()));
                if (partialMatch) {
                    console.log(`[Verify] FIXED MCQ Q${i + 1} (partial): "${q.correctAnswer}" → "${partialMatch}" | ${v.reasoning || ''}`);
                    fixed++;
                    return { ...q, correctAnswer: partialMatch };
                }
                // Verifier answer doesn't match any option — drop the question
                console.log(`[Verify] DROPPED MCQ Q${i + 1}: orig="${origNorm}", verify="${verifyNorm}" — conflict, no match in options`);
                dropped++;
                return null;
            }
            else if (q.type === 'MSQ') {
                const origArr = Array.isArray(q.correctAnswer)
                    ? q.correctAnswer.map(a => a.toLowerCase().trim()).sort()
                    : [];
                let verifyArr = [];
                if (Array.isArray(vAnswer)) {
                    verifyArr = vAnswer.map(a => String(a).trim().toLowerCase()).sort();
                }
                else if (typeof vAnswer === 'string') {
                    verifyArr = vAnswer.split(',').map(a => a.trim().toLowerCase()).sort();
                }
                if (JSON.stringify(origArr) === JSON.stringify(verifyArr)) {
                    kept++;
                    return q;
                }
                // Map verified answers back to exact option texts — try exact then partial match
                const fixedAnswers = verifyArr.map(va => {
                    const exact = q.options.find(o => o.toLowerCase().trim() === va);
                    if (exact)
                        return exact;
                    const partial = q.options.find(o => o.toLowerCase().includes(va) || va.includes(o.toLowerCase().trim()));
                    return partial || null;
                }).filter(Boolean);
                // Deduplicate
                const uniqueFixed = [...new Set(fixedAnswers)];
                // CRITICAL: If verifier returns FEWER answers than original, the verifier
                // is likely being lazy (only mentioning one). Keep the original in that case.
                // Only "fix" if verifier returns same count or more.
                if (uniqueFixed.length < origArr.length) {
                    console.log(`[Verify] KEPT MSQ Q${i + 1}: verifier returned ${uniqueFixed.length} answers but original had ${origArr.length} — keeping original`);
                    kept++;
                    return q;
                }
                if (uniqueFixed.length >= 1) {
                    console.log(`[Verify] FIXED MSQ Q${i + 1}: ${JSON.stringify(q.correctAnswer)} → ${JSON.stringify(uniqueFixed)} | ${v.reasoning || ''}`);
                    fixed++;
                    return { ...q, correctAnswer: uniqueFixed };
                }
                console.log(`[Verify] DROPPED MSQ Q${i + 1}: answers conflict, cannot map verifier answers to options`);
                dropped++;
                return null;
            }
            else if (q.type === 'NAT') {
                const origNum = parseFloat(q.correctAnswer);
                const verifyNum = parseFloat(vAnswer);
                if (!isNaN(origNum) && !isNaN(verifyNum)) {
                    // ── Fix 2 (NAT): if verifier differs by >1% use verifier's value ──
                    const pctDiff = origNum !== 0 ? Math.abs(origNum - verifyNum) / Math.abs(origNum) : Math.abs(origNum - verifyNum);
                    if (pctDiff < 0.01) {
                        kept++;
                        return q;
                    }
                    console.log(`[Verify] FIXED NAT Q${i + 1}: ${q.correctAnswer} → ${verifyNum} | ${v.reasoning || ''}`);
                    fixed++;
                    return { ...q, correctAnswer: String(verifyNum) };
                }
                kept++; // Can't verify, keep original
                return q;
            }
            kept++;
            return q;
        }).filter(Boolean);
        console.log(`[Verify] Results: ${kept} kept, ${fixed} fixed, ${dropped} dropped. Final: ${result.length} questions.`);
        return result;
    }
    catch (e) {
        console.error('[Verify] Verification failed:', e.message, '— keeping original questions');
        return questions;
    }
}
// ---------------------------------------------------------------------------
// generateQuestions — improved prompt with chain-of-thought "reasoning" field
// (stripped after parsing) and subject-specific verification rules.
// globalPoolQuestions: array of {text, concept} from GeneratedQuestionPool
// ---------------------------------------------------------------------------
async function generateQuestions(campaign, weakConcepts, previousQuestions, uniqueSeed = '', globalPoolQuestions = []) {
    const subjectInfo = getSubjectKnowledge(campaign.topic);
    const { domain, subtopic, concepts, questionStarters, exampleQuestion, forbiddenContent } = subjectInfo;
    const weakStr = weakConcepts.length > 0
        ? `Student weak areas to focus on: ${weakConcepts.join(', ')}.`
        : '';
    // Merge per-student previous questions + global pool into one "avoid" list.
    // Deduplicate by text so we don't send duplicate lines to the prompt.
    const allPreviousTexts = new Set();
    const avoidList = [];
    for (const q of [...previousQuestions, ...globalPoolQuestions]) {
        const key = (q.text || '').substring(0, 100);
        if (!allPreviousTexts.has(key)) {
            allPreviousTexts.add(key);
            avoidList.push(q);
        }
    }
    // Send up to 40 "avoid" questions to the prompt (tokens permitting).
    // Group by concept so the model can see which concepts are saturated.
    const conceptGroups = {};
    for (const q of avoidList.slice(0, 40)) {
        const c = q.concept || 'General';
        if (!conceptGroups[c])
            conceptGroups[c] = [];
        conceptGroups[c].push(q.text.substring(0, 90));
    }
    const prevStr = Object.keys(conceptGroups).length > 0
        ? `PREVIOUSLY USED QUESTIONS — DO NOT reuse these scenarios or rephrase them:\n` +
            Object.entries(conceptGroups)
                .map(([concept, texts]) => `[${concept}]:\n${texts.map(t => '  - ' + t).join('\n')}`)
                .join('\n')
        : '';
    // Figure out which concepts are already well-covered in the pool so we
    // can steer the model toward under-represented concepts.
    const coveredConcepts = new Set(avoidList.map(q => q.concept).filter(Boolean));
    const shuffledConcepts = [...concepts].sort(() => Math.random() - 0.5);
    // Prefer concepts NOT already in the pool; fall back to all concepts
    const freshConcepts = shuffledConcepts.filter(c => !coveredConcepts.has(c));
    const selectedConcepts = (freshConcepts.length >= 4 ? freshConcepts : shuffledConcepts)
        .slice(0, Math.min(15, concepts.length));
    let starterHints = '';
    if (questionStarters && questionStarters.length > 0) {
        const randomStarters = [...questionStarters].sort(() => Math.random() - 0.5).slice(0, 4);
        starterHints = `\nQuestions could start with phrases like:\n${randomStarters.map(s => '- "' + s + '"').join('\n')}`;
    }
    let exampleSection = '';
    if (exampleQuestion) {
        exampleSection = `
EXAMPLE (do NOT copy — for format reference only):
{"text": "${exampleQuestion.text}", "type": "${exampleQuestion.type}", "options": ${JSON.stringify(exampleQuestion.options)}, "correctAnswer": ${JSON.stringify(exampleQuestion.correctAnswer)}, "marks": ${exampleQuestion.marks}, "negativeMarks": ${exampleQuestion.negativeMarks}, "concept": "${exampleQuestion.concept}"}`;
    }
    // ── Diversity engine: pre-assign one concept per question slot ────────────
    // This is the KEY fix. Instead of letting the AI freely pick concepts
    // (which causes it to always pick Normalization + SQL + Concurrency),
    // we assign exactly which concept each of the 15 questions must cover.
    // We also inject randomized relation schemas, table names, and SQL templates
    // so even same-concept questions look completely different across papers.
    // Large DBMS-specific concept pool to assign from
    const dbmsConceptPool = [
        'Normalization (1NF)', 'Normalization (2NF)', 'Normalization (3NF)', 'Normalization (BCNF)',
        'Functional Dependencies', 'Candidate Keys', 'Armstrong Axioms',
        'SQL SELECT with WHERE', 'SQL JOIN (INNER)', 'SQL JOIN (LEFT/RIGHT)', 'SQL GROUP BY and HAVING',
        'SQL Aggregate Functions', 'SQL Subqueries', 'SQL IN and EXISTS',
        'Relational Algebra (Selection)', 'Relational Algebra (Projection)', 'Relational Algebra (Join)',
        'Conflict Serializability', 'View Serializability', 'Recoverable Schedules',
        'Cascadeless Schedules', 'Two-Phase Locking (2PL)', 'Deadlock in DBMS',
        'B+ Tree Indexing', 'Hash Indexing', 'Dense vs Sparse Index',
        'ER Model (Entities and Attributes)', 'ER Model (Relationships and Cardinality)',
        'Weak Entities', 'Participation Constraints',
        'ACID Properties', 'Transaction States',
        'Lossless Join Decomposition', 'Dependency Preservation',
        'Query Optimization', 'Query Processing Pipeline',
        'File Organization (Heap, Sequential, Hash)',
        'Bitmap Index', 'Clustered vs Unclustered Index',
        'Concurrency Control (Timestamp Ordering)',
        'Log-Based Recovery', 'Checkpointing',
        'Stored Procedures', 'Triggers', 'Views',
        'SQL NULL handling', 'SQL DISTINCT and ORDER BY',
    ];
    // Randomized relation schemas — inject one per normalization question
    // so R(A,B,C) with A→B,B→C never repeats
    const relationSchemas = [
        { attrs: 'P, Q, R, S', fds: 'P→Q, Q→R, R→S', hint: 'chain FDs' },
        { attrs: 'X, Y, Z', fds: 'XY→Z, Z→X', hint: 'composite key scenario' },
        { attrs: 'E, F, G, H', fds: 'E→F, EF→G, G→H', hint: 'multi-step closure' },
        { attrs: 'M, N, O', fds: 'MN→O, O→M', hint: 'overlapping keys' },
        { attrs: 'A, B, C, D, E', fds: 'AB→C, C→D, D→E, E→B', hint: 'cycle in FDs' },
        { attrs: 'StudentID, CourseID, Grade, InstructorID, Room', fds: 'StudentID CourseID→Grade, CourseID→InstructorID, InstructorID→Room', hint: 'real-world university schema' },
        { attrs: 'OrderID, ProductID, Qty, Price, CustomerID, City', fds: 'OrderID ProductID→Qty, ProductID→Price, OrderID→CustomerID, CustomerID→City', hint: 'e-commerce schema' },
        { attrs: 'EmpID, DeptID, DeptName, ManagerID, Salary', fds: 'EmpID→DeptID Salary, DeptID→DeptName ManagerID', hint: 'HR schema' },
        { attrs: 'BookID, AuthorID, AuthorName, PublisherID, PublisherCity', fds: 'BookID→AuthorID PublisherID, AuthorID→AuthorName, PublisherID→PublisherCity', hint: 'library schema' },
        { attrs: 'FlightNo, Date, SeatNo, PassengerID, Gate', fds: 'FlightNo Date→Gate, FlightNo Date SeatNo→PassengerID', hint: 'airline schema' },
    ];
    // Randomized SQL table contexts
    const sqlContexts = [
        { table: 'Employees', cols: 'EmpID, Name, Dept, Salary, JoinDate', sample: 'WHERE Dept = "HR" AND Salary > 50000' },
        { table: 'Orders', cols: 'OrderID, CustomerID, Product, Amount, OrderDate', sample: 'WHERE Amount > 1000 AND OrderDate > "2023-01-01"' },
        { table: 'Students', cols: 'StudentID, Name, Course, Marks, Year', sample: 'WHERE Marks >= 60 AND Year = 3' },
        { table: 'Products', cols: 'ProductID, Name, Category, Price, Stock', sample: 'WHERE Category = "Electronics" AND Price < 500' },
        { table: 'Flights', cols: 'FlightNo, Origin, Destination, Seats, Price', sample: 'WHERE Origin = "DEL" AND Seats > 0' },
        { table: 'Transactions', cols: 'TxnID, AccountID, Amount, Type, TxnDate', sample: 'WHERE Type = "Credit" AND Amount > 10000' },
        { table: 'Patients', cols: 'PatientID, Name, Disease, Doctor, AdmitDate', sample: 'WHERE Disease = "Diabetes" AND AdmitDate > "2024-01-01"' },
    ];
    // Pick random schemas and contexts for this paper
    const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
    const pickedSchemas = shuffle(relationSchemas).slice(0, 4);
    const pickedSqlCtx = shuffle(sqlContexts).slice(0, 3);
    // Assign exactly one concept to each of the 15 question slots
    // Pull from: freshConcepts first, then fill from dbmsConceptPool
    const isDBAMS = campaign.topic.toLowerCase().includes('dbms') ||
        campaign.topic.toLowerCase().includes('database') ||
        domain === 'DBMS';
    let conceptSlots;
    if (isDBAMS) {
        // For DBMS: use the rich pool, ensure no concept repeats
        const poolShuffled = shuffle(dbmsConceptPool);
        const alreadyUsed = new Set(avoidList.map(q => q.concept).filter(Boolean));
        const fresh = poolShuffled.filter(c => !alreadyUsed.has(c));
        const fallback = poolShuffled.filter(c => alreadyUsed.has(c));
        conceptSlots = [...fresh, ...fallback].slice(0, 15);
    }
    else {
        // For non-DBMS: use subject concepts + freshConcepts
        const all = shuffle([...selectedConcepts, ...concepts]);
        const seen = new Set();
        conceptSlots = all.filter(c => { if (seen.has(c))
            return false; seen.add(c); return true; }).slice(0, 15);
    }
    // ── Bloom's Taxonomy level assignment per question slot ───────────────────
    // Distribute cognitive levels across the 15 questions to ensure the paper
    // tests multiple depths of understanding, as required by the report.
    // Distribution: 3 Remember, 3 Understand, 4 Apply, 3 Analyze, 1 Evaluate, 1 Create
    const bloomLevels = [
        'Remember', // Q1  — recall facts, definitions
        'Understand', // Q2  — explain concepts, summarize
        'Apply', // Q3  — use knowledge in new situations
        'Analyze', // Q4  — compare, differentiate, break down
        'Remember', // Q5
        'Apply', // Q6
        'Understand', // Q7
        'Apply', // Q8
        'Apply', // Q9  (NAT — typically calculation/application)
        'Analyze', // Q10 (NAT)
        'Evaluate', // Q11 (NAT — justify, assess)
        'Analyze', // Q12 (NAT)
        'Understand', // Q13 (MSQ — multiple correct = deeper understanding)
        'Create', // Q14 (MSQ — design/construct scenarios)
        'Remember', // Q15 (MSQ)
    ];
    // Build the per-question assignment list with Bloom's level
    const questionAssignments = conceptSlots.map((concept, i) => {
        const type = i < 8 ? 'MCQ' : i < 12 ? 'NAT' : 'MSQ';
        const bloom = bloomLevels[i] || 'Apply';
        return `Q${i + 1} [${type}] → concept: "${concept}" | Bloom's level: ${bloom}`;
    }).join('\n');
    // Build schema hints for normalization questions
    const schemaHints = pickedSchemas.map((s, i) => `Normalization scenario ${i + 1}: R(${s.attrs}) with FDs: ${s.fds}`).join('\n');
    // Build SQL hints
    const sqlHints = pickedSqlCtx.map((s, i) => `SQL scenario ${i + 1}: table ${s.table}(${s.cols})`).join('\n');
    // Build domain-specific rules block — only include DBMS rules for DBMS topics
    let domainRules = '';
    if (isDBAMS) {
        domainRules = `
VARIETY CONSTRAINTS — STRICTLY ENFORCED:
- For normalization questions, use ONLY the schemas provided below — do NOT invent R(A,B,C) with A→B,B→C.
- For SQL questions, use ONLY the table contexts provided below.
- Use REAL-WORLD attribute names (StudentID, CourseID, Salary, etc.).

NORMALIZATION SCHEMAS TO USE:
${schemaHints}

SQL TABLE CONTEXTS TO USE:
${sqlHints}

NORMALIZATION RULES:
- Single-attribute CK → 2NF is automatically satisfied.
- Check 3NF: if any non-prime X→Y where X is not a superkey → 3NF VIOLATED.
- BCNF: every determinant must be a superkey.
- NEVER conclude 3NF or BCNF without checking transitive dependencies.

CONCURRENCY RULES:
- Conflict serializable = serial schedule by swapping NON-CONFLICTING ops.
- Recoverable = Tj reads from Ti → Tj commits AFTER Ti.

SQL RULES:
- AND = both conditions simultaneously. OR = at least one.
- Trace query on sample rows in reasoning.`;
    }
    else {
        domainRules = `
VARIETY CONSTRAINTS — STRICTLY ENFORCED:
- Each question MUST test a DIFFERENT scenario.
- NEVER generate questions about DBMS, SQL, normalization, databases, B+ trees, or any computer science topic unless "${campaign.topic}" IS a computer science topic.
- ALL 15 questions MUST be strictly about "${campaign.topic}" for the "${campaign.examName}" exam.
- Use real-world, factual scenarios relevant to the subject domain.
- Questions should match the style and difficulty of actual "${campaign.examName}" exam papers.`;
    }
    const prompt = `You are a senior ${campaign.examName} exam paper setter and subject matter expert in "${campaign.topic}" (${domain}).

TASK: Generate exactly 15 exam questions about "${campaign.topic}" ONLY. Each question's concept AND Bloom's Taxonomy cognitive level are PRE-ASSIGNED below — you MUST follow these assignments exactly.

BLOOM'S TAXONOMY GUIDE (match the cognitive level for each question):
- Remember: Test recall of facts, definitions, terms. Use "Which of the following is...", "Define...", "State...".
- Understand: Test comprehension. Use "Explain why...", "What is the significance of...", "Summarize...".
- Apply: Test application to new situations. Use "Calculate...", "Given the following, solve...", "Using X, determine...".
- Analyze: Test comparison and breakdown. Use "Compare...", "Differentiate between...", "What would happen if...".
- Evaluate: Test judgement and critique. Use "Which approach is better and why...", "Justify...", "Assess...".
- Create: Test design and construction. Use "Design a...", "Propose a solution for...", "Construct...".

QUESTION ASSIGNMENTS (concept AND Bloom's level are mandatory for each slot):
${questionAssignments}
${domainRules}

MANDATORY SOLVING PROCESS for every question:
1. Draft the question using the pre-assigned concept AND matching the assigned Bloom's Taxonomy level.
2. In "reasoning": solve step-by-step (3-5 sentences).
3. Set correctAnswer ONLY after completing reasoning.
4. Create distractors that are plausible but wrong.

CRITICAL:
- correctAnswer MUST exactly match one option text (MCQ) or a subset (MSQ).
- Options must be full descriptive text — NEVER bare letters.
- NEVER guess. If uncertain about a concept slot, pick the closest concept you know well.
- ALL questions MUST be about "${campaign.topic}" — generating questions on a different subject is a FAILURE.
- Each question MUST match its assigned Bloom's Taxonomy level — a "Remember" slot should NOT ask for analysis, and an "Analyze" slot should NOT ask for simple recall.

${weakStr}
${prevStr}
Difficulty: ${campaign.difficulty || 'Medium'}

Mix is fixed: Q1-Q8 are MCQ (4 options, 1 correct), Q9-Q12 are NAT (options=[], numerical), Q13-Q15 are MSQ (4 options, 2-3 correct array).

Return ONLY a valid JSON array, no text before or after:
[
  {"text":"...","type":"MCQ","options":["...","...","...","..."],"correctAnswer":"...","reasoning":"step-by-step...","marks":2,"negativeMarks":0.67,"concept":"..."},
  {"text":"...","type":"NAT","options":[],"correctAnswer":"42","reasoning":"Calculation: ...","marks":2,"negativeMarks":0,"concept":"..."},
  {"text":"...","type":"MSQ","options":["...","...","...","..."],"correctAnswer":["...","..."],"reasoning":"opt1 correct because... opt3 wrong because...","marks":2,"negativeMarks":0.67,"concept":"..."}
]`;
    try {
        console.log('[AI] Sending prompt for topic:', campaign.topic);
        const response = await withTimeout(callAI(prompt), 300000);
        console.log('[AI] Raw response length:', response?.length, 'First 200 chars:', response?.substring(0, 200));
        let questions = parseQuestions(response);
        console.log('[AI] Parsed questions count:', questions?.length || 0);
        // Filter forbidden content
        if (questions && forbiddenContent.length > 0) {
            const filtered = questions.filter(q => {
                const textLower = q.text.toLowerCase();
                return !forbiddenContent.some(term => textLower.includes(term.toLowerCase()));
            });
            console.log('[AI] After forbidden-content filter:', filtered.length, 'of', questions.length, 'passed');
            questions = filtered.length >= 3 ? filtered : questions;
        }
        // ── PYQ Paraphrasing Pipeline ──────────────────────────────────────────
        // Pick random PYQs from the bank and send to AI for paraphrasing.
        // Merge paraphrased PYQs with AI-generated originals for a hybrid paper.
        const pyqOriginals = pickRandomPYQs(campaign.examName, campaign.topic, 8);
        let paraphrasedPYQs = [];
        if (pyqOriginals.length > 0) {
            try {
                console.log('[PYQ] Paraphrasing', pyqOriginals.length, 'PYQs for', campaign.examName, '-', campaign.topic);
                const paraphrasePrompt = buildParaphrasePrompt(pyqOriginals, campaign.examName, campaign.topic);
                const pyqResponse = await withTimeout(callAI(paraphrasePrompt), 20000);
                const parsed = parseQuestions(pyqResponse);
                if (parsed && parsed.length > 0) {
                    paraphrasedPYQs = parsed;
                    console.log('[PYQ] Successfully paraphrased', paraphrasedPYQs.length, 'questions');
                }
            }
            catch (pyqErr) {
                console.error('[PYQ] Paraphrasing failed:', pyqErr.message, '— using AI-only questions');
            }
        }
        // Merge: take AI originals + paraphrased PYQs, shuffle, trim to 15
        if (paraphrasedPYQs.length > 0 && questions && questions.length > 0) {
            // Keep 7 AI originals + up to 8 paraphrased PYQs = 15 total
            const aiSlice = questions.slice(0, 7);
            const pyqSlice = paraphrasedPYQs.slice(0, 8);
            questions = [...aiSlice, ...pyqSlice].sort(() => Math.random() - 0.5);
            console.log('[PYQ] Merged paper:', aiSlice.length, 'AI +', pyqSlice.length, 'PYQ =', questions.length, 'total');
        }
        // Batch verification pass (1 extra API call) — runs on ALL questions
        if (questions && questions.length > 0) {
            questions = await verifyQuestions(questions, campaign);
        }
        return questions;
    }
    catch (e) {
        console.error('[AI] Generation error:', e.message);
        console.error('[AI] Full error:', e);
        return null;
    }
}
// ---------------------------------------------------------------------------
// getPaper — main Wasp query export (DO NOT RENAME)
// ---------------------------------------------------------------------------
export async function getPaper(args, context) {
    const { token } = args;
    const tokenHash = hashToken(token);
    const qrPaper = await context.entities.QRPaper.findUnique({
        where: { token: tokenHash },
        include: { campaign: true, orgStudent: true }
    });
    if (!qrPaper)
        throw new Error('Invalid or expired QR code');
    const payload = await verifyQRSignature(qrPaper.signature);
    if (!payload)
        throw new Error('Invalid QR signature');
    let questionSet = await context.entities.QuestionSet.findFirst({
        where: { qrPaperId: qrPaper.id }
    });
    if (qrPaper.isUsed && !questionSet)
        throw new Error('QR code already used');
    if (!questionSet) {
        const campaign = qrPaper.campaign;
        // Adaptive learning — works for BOTH individual and org modes
        const adaptiveId = qrPaper.studentId || qrPaper.orgStudentId || 'none';
        const weakAreas = await context.entities.WeakArea.findMany({
            where: { studentId: adaptiveId }
        });
        const weakConcepts = weakAreas.filter(w => w.strength < 0.5).map(w => w.concept);
        // Find previous papers for this student
        const previousPapersWhere = {
            campaign: { topic: campaign.topic },
            isUsed: true,
            id: { not: qrPaper.id }
        };
        if (qrPaper.studentId)
            previousPapersWhere.studentId = qrPaper.studentId;
        else if (qrPaper.orgStudentId)
            previousPapersWhere.orgStudentId = qrPaper.orgStudentId;
        const previousPapers = await context.entities.QRPaper.findMany({
            where: previousPapersWhere,
            include: { questionSets: true },
            take: 3
        });
        const previousQuestions = previousPapers
            .flatMap(p => p.questionSets)
            .flatMap(qs => {
            try {
                return JSON.parse(qs.questions);
            }
            catch (e) {
                return [];
            }
        });
        const uniqueSeed = `${qrPaper.studentId || qrPaper.orgStudentId || 'anon'}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        // ── Global question pool: fetch all previously generated questions for
        //    this topic so the AI avoids repeating them across ALL students. ──────
        const poolRecords = await context.entities.GeneratedQuestionPool.findMany({
            where: {
                topic: campaign.topic,
                examName: campaign.examName
            },
            orderBy: { createdAt: 'desc' },
            take: 120, // last 120 questions = ~8 full papers worth
            select: { text: true, concept: true, type: true }
        });
        console.log(`[Pool] Loaded ${poolRecords.length} previous questions for topic "${campaign.topic}"`);
        const questions = await generateQuestions(campaign, weakConcepts, previousQuestions, uniqueSeed, poolRecords);
        if (!questions || questions.length === 0) {
            console.error('[QParse] AI failed, using subject-specific fallback');
            const fallback = generateFallbackQuestions(campaign.topic, campaign.examName, campaign.difficulty);
            questionSet = await context.entities.QuestionSet.create({
                data: {
                    qrPaperId: qrPaper.id,
                    questions: JSON.stringify(fallback),
                    version: 1,
                    weakConcepts: weakConcepts
                }
            });
            await context.entities.QRPaper.update({ where: { id: qrPaper.id }, data: { isUsed: true } });
            return {
                paperId: qrPaper.id,
                campaign: qrPaper.campaign,
                questions: fallback,
                questionSetId: questionSet.id,
                student: qrPaper.orgStudent
                    ? { name: qrPaper.orgStudent.name, rollNo: qrPaper.orgStudent.rollNo, section: qrPaper.orgStudent.section }
                    : null
            };
        }
        questionSet = await context.entities.QuestionSet.create({
            data: {
                qrPaperId: qrPaper.id,
                questions: JSON.stringify(questions),
                version: 1,
                weakConcepts: weakConcepts
            }
        });
        // ── Save newly generated questions to the global pool so future papers
        //    avoid them. Fire-and-forget — don't block the response. ──────────────
        context.entities.GeneratedQuestionPool.createMany({
            data: questions.map(q => ({
                topic: campaign.topic,
                examName: campaign.examName,
                text: q.text,
                concept: q.concept || campaign.topic,
                type: q.type || 'MCQ'
            })),
            skipDuplicates: true
        }).catch(err => console.error('[Pool] Failed to save questions to pool:', err.message));
        await context.entities.QRPaper.update({
            where: { id: qrPaper.id },
            data: { isUsed: true }
        });
    }
    return {
        paperId: qrPaper.id,
        campaign: qrPaper.campaign,
        questions: JSON.parse(questionSet.questions),
        questionSetId: questionSet.id,
        student: qrPaper.orgStudent
            ? { name: qrPaper.orgStudent.name, rollNo: qrPaper.orgStudent.rollNo, section: qrPaper.orgStudent.section }
            : null
    };
}
// ---------------------------------------------------------------------------
// generateFallbackQuestions — used ONLY when the AI fails completely.
// Unchanged from the original — all subject pools preserved.
// ---------------------------------------------------------------------------
function generateFallbackQuestions(topic, examName, difficulty) {
    const subjectInfo = getSubjectKnowledge(topic);
    const pick = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const fallbackPools = {
        'Mathematics': [
            { q: `If f(x) = x³ - 3x² + 2x + 1, then f'(2) equals:`, o: ['f\'(2) = 2', 'f\'(2) = 3', 'f\'(2) = 1', 'f\'(2) = 0'], correct: 'f\'(2) = 2', concept: 'Derivatives' },
            { q: `The value of ∫₀¹ x²dx is:`, o: ['1/3', '1/2', '2/3', '1/4'], correct: '1/3', concept: 'Definite Integrals' },
            { q: `lim(x→0) (sin x)/x equals:`, o: ['The limit is 1', 'The limit is 0', 'The limit is ∞', 'The limit is -1'], correct: 'The limit is 1', concept: 'Limits' },
            { q: `The derivative of eˣ sin x is:`, o: ['eˣ(sin x + cos x)', 'eˣ sin x', 'eˣ cos x', 'eˣ(sin x - cos x)'], correct: 'eˣ(sin x + cos x)', concept: 'Product Rule' },
            { q: `∫ (1/x) dx equals:`, o: ['ln|x| + C', 'x² + C', '1/x² + C', '-1/x² + C'], correct: 'ln|x| + C', concept: 'Integration' },
            { q: `If y = x² + 3x, then dy/dx at x = 1 is:`, o: ['dy/dx = 5', 'dy/dx = 4', 'dy/dx = 3', 'dy/dx = 6'], correct: 'dy/dx = 5', concept: 'Differentiation' },
            { q: `The order of the differential equation d²y/dx² + 3(dy/dx) + y = 0 is:`, o: ['Order 2', 'Order 1', 'Order 3', 'Order 0'], correct: 'Order 2', concept: 'Differential Equations' },
            { q: `The area under y = x² from x = 0 to x = 2 is:`, o: ['8/3 sq. units', '4 sq. units', '2 sq. units', '4/3 sq. units'], correct: '8/3 sq. units', concept: 'Area under Curves' },
        ],
        'Physics': [
            { q: `A ball is dropped from height 80m. Time to reach ground is (g=10 m/s²):`, o: ['4 seconds', '2 seconds', '8 seconds', '6 seconds'], correct: '4 seconds', concept: 'Kinematics' },
            { q: `A 2kg block on a frictionless surface is pushed with 10N force. Its acceleration is:`, o: ['5 m/s²', '10 m/s²', '20 m/s²', '2 m/s²'], correct: '5 m/s²', concept: 'Newton\'s Laws' },
            { q: `The work done in moving a 5kg object through 4m against gravity is (g=10 m/s²):`, o: ['200 J', '100 J', '50 J', '400 J'], correct: '200 J', concept: 'Work and Energy' },
            { q: `Two charges of +2μC and -2μC are separated by 0.1m. The force between them is (k=9×10⁹):`, o: ['3.6 N', '36 N', '0.36 N', '360 N'], correct: '3.6 N', concept: 'Coulomb\'s Law' },
            { q: `A convex lens of focal length 20cm forms an image of an object at 30cm. The image distance is:`, o: ['60 cm', '40 cm', '30 cm', '120 cm'], correct: '60 cm', concept: 'Optics' },
            { q: `The de Broglie wavelength of an electron with KE = 100 eV is approximately:`, o: ['1.227 Å', '12.27 Å', '0.1227 Å', '122.7 Å'], correct: '1.227 Å', concept: 'Modern Physics' },
        ],
        'Chemistry': [
            { q: `The IUPAC name of CH₃CH(OH)CH₃ is:`, o: ['Propan-2-ol', 'Propan-1-ol', 'Isopropyl alcohol', 'Propanol'], correct: 'Propan-2-ol', concept: 'Nomenclature' },
            { q: `The pH of 0.01 M HCl solution is:`, o: ['pH = 2', 'pH = 1', 'pH = 3', 'pH = 0.01'], correct: 'pH = 2', concept: 'Ionic Equilibrium' },
            { q: `The hybridization of carbon in CO₂ is:`, o: ['sp hybridization', 'sp² hybridization', 'sp³ hybridization', 'sp³d hybridization'], correct: 'sp hybridization', concept: 'Chemical Bonding' },
            { q: `For a first-order reaction with k = 0.693 s⁻¹, the half-life is:`, o: ['1 second', '0.693 seconds', '2 seconds', '0.5 seconds'], correct: '1 second', concept: 'Chemical Kinetics' },
            { q: `The number of moles in 36g of water (M = 18) is:`, o: ['2 moles', '1 mole', '0.5 moles', '4 moles'], correct: '2 moles', concept: 'Mole Concept' },
            { q: `The oxidation state of Mn in KMnO₄ is:`, o: ['+7', '+5', '+6', '+4'], correct: '+7', concept: 'Oxidation States' },
        ],
        'Biology': [
            { q: `The site of light-dependent reactions of photosynthesis is:`, o: ['Thylakoid membrane', 'Stroma', 'Outer membrane of chloroplast', 'Cytoplasm'], correct: 'Thylakoid membrane', concept: 'Photosynthesis' },
            { q: `Crossing over occurs during which stage of meiosis?`, o: ['Pachytene of Prophase I', 'Metaphase I', 'Anaphase II', 'Telophase I'], correct: 'Pachytene of Prophase I', concept: 'Cell Division' },
            { q: `The Glomerular Filtration Rate (GFR) in a healthy human is approximately:`, o: ['125 mL/min', '200 mL/min', '75 mL/min', '50 mL/min'], correct: '125 mL/min', concept: 'Excretory System' },
            { q: `Which hormone is responsible for maintaining pregnancy?`, o: ['Progesterone', 'Estrogen', 'FSH', 'LH'], correct: 'Progesterone', concept: 'Reproductive System' },
            { q: `The functional unit of a kidney is:`, o: ['Nephron', 'Neuron', 'Alveolus', 'Hepatocyte'], correct: 'Nephron', concept: 'Excretory System' },
            { q: `DNA replication is:`, o: ['Semi-conservative', 'Conservative', 'Dispersive', 'Non-conservative'], correct: 'Semi-conservative', concept: 'Molecular Biology' },
            { q: `In the lac operon, the inducer molecule is:`, o: ['Allolactose', 'Glucose', 'Galactose', 'Lactose'], correct: 'Allolactose', concept: 'Gene Regulation' },
            { q: `Which blood group is called the universal donor?`, o: ['O negative', 'AB positive', 'A positive', 'B negative'], correct: 'O negative', concept: 'Blood Groups' },
        ],
        'Compiler Design': [
            { q: `For the grammar S → AB, A → a | ε, B → b | ε, the FOLLOW(A) is:`, o: ['{b, $}', '{b}', '{a, b, $}', '{$}'], correct: '{b, $}', concept: 'FOLLOW Sets' },
            { q: `Which parsing technique uses a stack and reads input left-to-right producing a rightmost derivation in reverse?`, o: ['Bottom-up (LR) parsing', 'Top-down (LL) parsing', 'Recursive descent parsing', 'Operator precedence parsing'], correct: 'Bottom-up (LR) parsing', concept: 'LR Parsing' },
            { q: `The FIRST set of a non-terminal A where A → aB | ε is:`, o: ['{a, ε}', '{a}', '{ε}', '{a, b}'], correct: '{a, ε}', concept: 'FIRST Sets' },
            { q: `An SLR(1) parser uses which set to decide reduce actions?`, o: ['FOLLOW set of the LHS non-terminal', 'FIRST set of the RHS', 'Lookahead tokens only', 'The entire grammar'], correct: 'FOLLOW set of the LHS non-terminal', concept: 'SLR Parsing' },
            { q: `Which phase of a compiler converts a stream of characters into tokens?`, o: ['Lexical Analysis', 'Syntax Analysis', 'Semantic Analysis', 'Code Generation'], correct: 'Lexical Analysis', concept: 'Compiler Phases' },
            { q: `A grammar is ambiguous if:`, o: ['A string has more than one parse tree', 'The grammar has no start symbol', 'All productions are left-recursive', 'FIRST and FOLLOW sets are disjoint'], correct: 'A string has more than one parse tree', concept: 'Ambiguity' },
            { q: `Left factoring is used to make a grammar suitable for:`, o: ['Predictive (LL) parsing', 'LR parsing', 'Operator precedence parsing', 'CYK algorithm'], correct: 'Predictive (LL) parsing', concept: 'Left Factoring' },
            { q: `Three-address code is a form of:`, o: ['Intermediate representation', 'Machine code', 'Assembly language', 'Source code optimization'], correct: 'Intermediate representation', concept: 'Intermediate Code' },
        ],
        'Theory of Computation': [
            { q: `Which of the following languages is NOT context-free?`, o: ['aⁿbⁿcⁿ (n ≥ 1)', 'aⁿbⁿ (n ≥ 0)', 'Palindromes over {a,b}', 'Balanced parentheses'], correct: 'aⁿbⁿcⁿ (n ≥ 1)', concept: 'Formal Languages' },
            { q: `A DFA for strings over {0,1} ending in 01 requires at least how many states?`, o: ['3 states', '2 states', '4 states', '5 states'], correct: '3 states', concept: 'Finite Automata' },
            { q: `The pumping lemma is used to prove that a language is:`, o: ['NOT regular', 'Regular', 'Context-free', 'Recursive'], correct: 'NOT regular', concept: 'Pumping Lemma' },
            { q: `Which of the following is equivalent to a Turing Machine in computational power?`, o: ['Post correspondence problem', 'Pushdown automaton', 'Finite automaton', 'Mealy machine'], correct: 'Post correspondence problem', concept: 'Computability' },
            { q: `Which of the following problems is undecidable?`, o: ['Halting problem', 'Membership in a regular language', 'Emptiness of a CFL', 'Equivalence of DFAs'], correct: 'Halting problem', concept: 'Decidability' },
            { q: `A context-free grammar that generates the empty string must have:`, o: ['A nullable start symbol or ε-productions', 'Only terminal rules', 'No recursive rules', 'Exactly one production'], correct: 'A nullable start symbol or ε-productions', concept: 'Context-Free Grammars' },
        ],
        'Operating Systems': [
            { q: `In a page replacement algorithm, which strategy is optimal but not implementable?`, o: ['Belady\'s optimal algorithm', 'LRU', 'FIFO', 'Clock algorithm'], correct: 'Belady\'s optimal algorithm', concept: 'Page Replacement' },
            { q: `Which scheduling algorithm may cause starvation?`, o: ['Shortest Job First (SJF)', 'Round Robin', 'FCFS', 'Round Robin with priority aging'], correct: 'Shortest Job First (SJF)', concept: 'Process Scheduling' },
            { q: `A system with 3 processes and 3 resource types uses the Banker's algorithm. This algorithm prevents:`, o: ['Deadlock', 'Starvation', 'Race condition', 'Thrashing'], correct: 'Deadlock', concept: 'Deadlock Avoidance' },
            { q: `The working set model in virtual memory is used to:`, o: ['Determine the set of pages a process is actively using', 'Calculate CPU utilization', 'Optimize disk scheduling', 'Manage file permissions'], correct: 'Determine the set of pages a process is actively using', concept: 'Virtual Memory' },
            { q: `Which of the following is NOT a necessary condition for deadlock?`, o: ['Preemption', 'Mutual exclusion', 'Hold and wait', 'Circular wait'], correct: 'Preemption', concept: 'Deadlock Conditions' },
            { q: `The convoy effect is associated with which CPU scheduling algorithm?`, o: ['First Come First Served (FCFS)', 'Round Robin', 'Shortest Job First', 'Priority Scheduling'], correct: 'First Come First Served (FCFS)', concept: 'CPU Scheduling' },
        ],
        'DBMS': [
            { q: `A relation R(A,B,C,D) with FDs AB→C, C→D, D→A is in which normal form?`, o: ['2NF but not 3NF', '3NF', 'BCNF', '1NF only'], correct: '2NF but not 3NF', concept: 'Normalization' },
            { q: `In a B+ tree of order m, each internal node can have at most how many children?`, o: ['m children', 'm-1 children', 'm+1 children', '2m children'], correct: 'm children', concept: 'B+ Trees' },
            { q: `Two schedules are conflict equivalent if:`, o: ['They have the same set of conflicting operation pairs in the same order', 'They produce the same final result', 'They have the same number of operations', 'They use the same transactions'], correct: 'They have the same set of conflicting operation pairs in the same order', concept: 'Serializability' },
            { q: `The ACID property that ensures a transaction is all-or-nothing is:`, o: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], correct: 'Atomicity', concept: 'ACID Properties' },
            { q: `Which SQL clause is used to filter groups created by GROUP BY?`, o: ['HAVING', 'WHERE', 'FILTER', 'GROUP FILTER'], correct: 'HAVING', concept: 'SQL' },
            { q: `A lossless join decomposition ensures:`, o: ['No information is lost during decomposition', 'All FDs are preserved', 'The decomposition is in BCNF', 'No redundancy exists'], correct: 'No information is lost during decomposition', concept: 'Decomposition' },
        ],
        'Data Structures': [
            { q: `The time complexity of searching in a balanced BST with n nodes is:`, o: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'], correct: 'O(log n)', concept: 'Binary Search Trees' },
            { q: `The maximum number of nodes in a binary tree of height h is:`, o: ['2^(h+1) - 1 nodes', '2^h nodes', '2^h - 1 nodes', 'h² nodes'], correct: '2^(h+1) - 1 nodes', concept: 'Binary Trees' },
            { q: `In a max-heap, the parent node is always:`, o: ['Greater than or equal to its children', 'Less than its children', 'Equal to its children', 'Greater than only the left child'], correct: 'Greater than or equal to its children', concept: 'Heaps' },
            { q: `The worst-case time complexity of searching in a hash table with chaining is:`, o: ['O(n)', 'O(1)', 'O(log n)', 'O(n log n)'], correct: 'O(n)', concept: 'Hashing' },
            { q: `Which traversal of a BST gives nodes in sorted order?`, o: ['Inorder traversal', 'Preorder traversal', 'Postorder traversal', 'Level-order traversal'], correct: 'Inorder traversal', concept: 'Tree Traversals' },
            { q: `The minimum number of nodes in an AVL tree of height h is:`, o: ['N(h) = N(h-1) + N(h-2) + 1', 'N(h) = 2^h', 'N(h) = h²', 'N(h) = 2h + 1'], correct: 'N(h) = N(h-1) + N(h-2) + 1', concept: 'AVL Trees' },
        ],
        'Computer Networks': [
            { q: `In TCP, the 3-way handshake uses which flags in order?`, o: ['SYN, SYN-ACK, ACK', 'ACK, SYN, FIN', 'FIN, ACK, SYN', 'SYN, ACK, FIN'], correct: 'SYN, SYN-ACK, ACK', concept: 'TCP Handshake' },
            { q: `The maximum number of hosts in a Class C network is:`, o: ['254 hosts', '256 hosts', '128 hosts', '512 hosts'], correct: '254 hosts', concept: 'IP Addressing' },
            { q: `Which layer of the OSI model handles routing?`, o: ['Network Layer (Layer 3)', 'Data Link Layer (Layer 2)', 'Transport Layer (Layer 4)', 'Session Layer (Layer 5)'], correct: 'Network Layer (Layer 3)', concept: 'OSI Model' },
            { q: `CSMA/CD is used in which type of network?`, o: ['Ethernet (wired LAN)', 'Wi-Fi (wireless LAN)', 'Bluetooth', 'Satellite networks'], correct: 'Ethernet (wired LAN)', concept: 'MAC Protocols' },
            { q: `The purpose of ARP (Address Resolution Protocol) is:`, o: ['Map IP addresses to MAC addresses', 'Map domain names to IP addresses', 'Route packets between networks', 'Encrypt network traffic'], correct: 'Map IP addresses to MAC addresses', concept: 'ARP' },
            { q: `In Go-Back-N protocol, if the window size is N, the sender can send:`, o: ['Up to N frames without waiting for ACK', 'Only 1 frame at a time', 'N² frames at a time', 'Unlimited frames'], correct: 'Up to N frames without waiting for ACK', concept: 'Flow Control' },
        ],
        'Digital Logic': [
            { q: `The number of flip-flops needed to design a mod-16 counter is:`, t: 'MCQ', o: ['4 flip-flops', '8 flip-flops', '16 flip-flops', '3 flip-flops'], correct: '4 flip-flops', concept: 'Counters' },
            { q: `The simplified form of F = AB + AB' using Boolean algebra is:`, t: 'MCQ', o: ['F = A', 'F = B', 'F = AB', 'F = A + B'], correct: 'F = A', concept: 'Boolean Simplification' },
            { q: `A 4:1 multiplexer has how many select lines?`, t: 'MCQ', o: ['2 select lines', '4 select lines', '1 select line', '3 select lines'], correct: '2 select lines', concept: 'Multiplexer' },
            { q: `In a K-map, adjacent cells differ by:`, t: 'MCQ', o: ['Exactly 1 variable', 'Exactly 2 variables', 'All variables', 'No variables'], correct: 'Exactly 1 variable', concept: 'K-maps' },
            { q: `The characteristic equation of a JK flip-flop is:`, t: 'MCQ', o: ['Q(next) = JQ\' + K\'Q', 'Q(next) = JQ + KQ\'', 'Q(next) = J + K', 'Q(next) = JK'], correct: 'Q(next) = JQ\' + K\'Q', concept: 'Flip-flops' },
            { q: `De Morgan's theorem states that (A+B)' equals:`, t: 'MCQ', o: ['A\' · B\'', 'A\' + B\'', 'A · B', '(AB)\''], correct: 'A\' · B\'', concept: 'Boolean Algebra' },
            { q: `A full adder has how many inputs?`, t: 'MCQ', o: ['3 inputs (A, B, Carry-in)', '2 inputs (A, B)', '4 inputs', '1 input'], correct: '3 inputs (A, B, Carry-in)', concept: 'Adders' },
            { q: `The universal gate(s) from which any logic gate can be constructed:`, t: 'MSQ', o: ['NAND gate', 'NOR gate', 'AND gate', 'XOR gate'], correct: ['NAND gate', 'NOR gate'], concept: 'Universal Gates' },
            { q: `A 3-to-8 decoder has how many output lines?`, t: 'MCQ', o: ['8 output lines', '3 output lines', '16 output lines', '6 output lines'], correct: '8 output lines', concept: 'Decoders' },
            { q: `The output of an XOR gate is 1 when:`, t: 'MCQ', o: ['Inputs are different', 'Both inputs are 1', 'Both inputs are 0', 'At least one input is 1'], correct: 'Inputs are different', concept: 'XOR Gate' },
            { q: `How many minterms are present in a 4-variable Boolean function?`, t: 'NAT', o: [], correct: '16', concept: 'Minterms' },
            { q: `A mod-10 counter requires how many flip-flops?`, t: 'NAT', o: [], correct: '4', concept: 'Counters' },
            { q: `In an 8:1 multiplexer, how many select lines are needed?`, t: 'NAT', o: [], correct: '3', concept: 'Multiplexer Design' },
            { q: `The number of cells in a 4-variable K-map is:`, t: 'NAT', o: [], correct: '16', concept: 'K-map Size' },
            { q: `Which of the following are properties of Boolean algebra?`, t: 'MSQ', o: ['Commutative law', 'Distributive law', 'Associative law', 'Logarithmic law'], correct: ['Commutative law', 'Distributive law', 'Associative law'], concept: 'Boolean Properties' },
            { q: `A Moore machine's output depends on:`, t: 'MCQ', o: ['Only the current state', 'Current state and input', 'Only the input', 'Previous output'], correct: 'Only the current state', concept: 'Moore Machine' },
            { q: `A Mealy machine differs from a Moore machine because its output depends on:`, t: 'MCQ', o: ['Both current state and input', 'Only the current state', 'Only the input', 'The clock signal'], correct: 'Both current state and input', concept: 'Mealy Machine' },
            { q: `Which of the following flip-flops can be used as a toggle flip-flop?`, t: 'MSQ', o: ['JK flip-flop with J=K=1', 'T flip-flop with T=1', 'D flip-flop with D=Q\'', 'SR flip-flop with S=R=1'], correct: ['JK flip-flop with J=K=1', 'T flip-flop with T=1', 'D flip-flop with D=Q\''], concept: 'Toggle Behavior' },
            { q: `The don't-care conditions in a K-map can be treated as:`, t: 'MCQ', o: ['Either 0 or 1 for simplification', 'Always 1', 'Always 0', 'They must be ignored'], correct: 'Either 0 or 1 for simplification', concept: 'Don\'t Care Conditions' },
            { q: `A priority encoder with 8 inputs produces how many output bits?`, t: 'NAT', o: [], correct: '3', concept: 'Priority Encoder' },
        ],
        'Algorithms': [
            { q: `The recurrence T(n) = 2T(n/2) + n has solution:`, t: 'MCQ', o: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], correct: 'O(n log n)', concept: 'Divide and Conquer' },
            { q: `The worst-case time complexity of QuickSort is:`, t: 'MCQ', o: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'], correct: 'O(n²)', concept: 'Sorting' },
            { q: `Dijkstra's algorithm does NOT work correctly with:`, t: 'MCQ', o: ['Negative edge weights', 'Undirected graphs', 'Sparse graphs', 'Weighted graphs'], correct: 'Negative edge weights', concept: 'Shortest Path' },
            { q: `The minimum number of edges in a connected graph with n vertices is:`, t: 'MCQ', o: ['n − 1 edges', 'n edges', 'n + 1 edges', 'n/2 edges'], correct: 'n − 1 edges', concept: 'Graph Theory' },
            { q: `Dynamic programming is applicable when a problem has:`, t: 'MCQ', o: ['Optimal substructure and overlapping subproblems', 'Only optimal substructure', 'No overlapping subproblems', 'Greedy choice property only'], correct: 'Optimal substructure and overlapping subproblems', concept: 'Dynamic Programming' },
            { q: `The number of minimum spanning trees of a complete graph K₄ with all distinct edge weights is:`, t: 'MCQ', o: ['Exactly 1', 'Exactly 4', 'Exactly 16', 'Exactly 8'], correct: 'Exactly 1', concept: 'MST' },
        ],
        'Computer Architecture': [
            { q: `A 5-stage pipeline can have at most how many instructions in execution simultaneously?`, t: 'MCQ', o: ['5 instructions', '4 instructions', '10 instructions', '1 instruction'], correct: '5 instructions', concept: 'Pipelining' },
            { q: `In a direct-mapped cache, each memory block maps to:`, t: 'MCQ', o: ['Exactly one cache line', 'Any cache line', 'Two cache lines', 'Half the cache lines'], correct: 'Exactly one cache line', concept: 'Cache Mapping' },
            { q: `A data hazard in pipelining occurs when:`, t: 'MCQ', o: ['An instruction depends on the result of a previous instruction still in the pipeline', 'Two instructions access different memory locations', 'The branch prediction is always correct', 'The cache is fully associative'], correct: 'An instruction depends on the result of a previous instruction still in the pipeline', concept: 'Pipeline Hazards' },
            { q: `The effective CPI with a cache miss rate of 5% and miss penalty of 20 cycles (base CPI = 1) is:`, t: 'MCQ', o: ['2.0 cycles', '1.5 cycles', '1.05 cycles', '5.0 cycles'], correct: '2.0 cycles', concept: 'Cache Performance' },
            { q: `DMA (Direct Memory Access) is used to:`, t: 'MCQ', o: ['Transfer data between I/O and memory without CPU intervention', 'Increase CPU clock speed', 'Manage virtual memory pages', 'Handle interrupts'], correct: 'Transfer data between I/O and memory without CPU intervention', concept: 'I/O Systems' },
        ],
        'Discrete Mathematics': [
            { q: `The number of distinct equivalence relations on a set of 3 elements is:`, t: 'MCQ', o: ['5 relations', '3 relations', '8 relations', '6 relations'], correct: '5 relations', concept: 'Equivalence Relations' },
            { q: `The chromatic number of a complete graph K₅ is:`, t: 'MCQ', o: ['5 colors', '4 colors', '3 colors', '6 colors'], correct: '5 colors', concept: 'Graph Coloring' },
            { q: `The number of onto functions from a set of 4 elements to a set of 2 elements is:`, t: 'MCQ', o: ['14 functions', '16 functions', '8 functions', '12 functions'], correct: '14 functions', concept: 'Functions' },
            { q: `A planar graph with 6 vertices can have at most how many edges?`, t: 'MCQ', o: ['12 edges', '15 edges', '10 edges', '18 edges'], correct: '12 edges', concept: 'Planar Graphs' },
            { q: `If R is a reflexive and transitive relation that is also symmetric, then R is:`, t: 'MCQ', o: ['An equivalence relation', 'A partial order', 'An antisymmetric relation', 'A total order'], correct: 'An equivalence relation', concept: 'Relations' },
        ],
        'Economy': [
            { q: 'If the RBI increases CRR, the most likely immediate effect is:', o: ['Decrease in money supply', 'Increase in money supply', 'No effect on money supply', 'Increase in government spending'], correct: 'Decrease in money supply', concept: 'Monetary Policy' },
            { q: 'The Fiscal Responsibility and Budget Management (FRBM) Act aims to:', o: ['Reduce fiscal deficit', 'Increase exports', 'Control inflation only', 'Privatize banks'], correct: 'Reduce fiscal deficit', concept: 'Fiscal Policy' },
            { q: 'Which of the following is NOT included in GDP calculation?', o: ['Household unpaid work', 'Government spending', 'Net exports', 'Private consumption'], correct: 'Household unpaid work', concept: 'National Income' },
            { q: 'Open Market Operations by the RBI involve:', o: ['Buying/selling government securities', 'Printing new currency', 'Changing tax rates', 'Setting minimum wages'], correct: 'Buying/selling government securities', concept: 'Monetary Policy' },
            { q: 'GST in India is a:', o: ['Destination-based consumption tax', 'Origin-based production tax', 'Direct tax on income', 'Tax on agricultural produce'], correct: 'Destination-based consumption tax', concept: 'Taxation' },
            { q: 'The primary deficit equals:', o: ['Fiscal deficit minus interest payments', 'Revenue deficit plus capital expenditure', 'Total expenditure minus revenue', 'GDP minus GNP'], correct: 'Fiscal deficit minus interest payments', concept: 'Public Finance' },
        ],
        'History': [
            { q: 'The Simon Commission was boycotted because:', o: ['It had no Indian members', 'It supported partition', 'It was led by Congress', 'It proposed monarchy'], correct: 'It had no Indian members', concept: 'Freedom Struggle' },
            { q: 'The Permanent Settlement of 1793 was introduced by:', o: ['Lord Cornwallis', 'Lord Wellesley', 'Warren Hastings', 'Lord Dalhousie'], correct: 'Lord Cornwallis', concept: 'British Rule' },
            { q: 'Which Round Table Conference did Gandhi attend?', o: ['Second (1931)', 'First (1930)', 'Third (1932)', 'None'], correct: 'Second (1931)', concept: 'Freedom Struggle' },
            { q: 'The Quit India Movement was launched in:', o: ['1942', '1940', '1944', '1939'], correct: '1942', concept: 'Freedom Struggle' },
            { q: 'Who founded the Indian National Congress?', o: ['A.O. Hume', 'Dadabhai Naoroji', 'Surendranath Banerjee', 'W.C. Bonnerjee'], correct: 'A.O. Hume', concept: 'Modern India' },
            { q: 'The Doctrine of Lapse was introduced by:', o: ['Lord Dalhousie', 'Lord Wellesley', 'Lord Cornwallis', 'Lord Ripon'], correct: 'Lord Dalhousie', concept: 'British Rule' },
        ],
        'Polity': [
            { q: 'Which writ prevents a person from holding an office they are not entitled to?', o: ['Quo Warranto', 'Mandamus', 'Certiorari', 'Habeas Corpus'], correct: 'Quo Warranto', concept: 'Constitutional Remedies' },
            { q: 'Article 32 of the Indian Constitution deals with:', o: ['Right to Constitutional Remedies', 'Right to Equality', 'Right to Freedom', 'Right to Education'], correct: 'Right to Constitutional Remedies', concept: 'Fundamental Rights' },
            { q: 'The 73rd Amendment relates to:', o: ['Panchayati Raj', 'Municipalities', 'Anti-Defection', 'Right to Education'], correct: 'Panchayati Raj', concept: 'Local Government' },
            { q: 'Who appoints the Chief Justice of India?', o: ['President of India', 'Prime Minister', 'Parliament', 'Law Minister'], correct: 'President of India', concept: 'Judiciary' },
            { q: 'Money Bills can only be introduced in:', o: ['Lok Sabha', 'Rajya Sabha', 'Either House', 'Joint Session'], correct: 'Lok Sabha', concept: 'Parliament' },
            { q: 'The concept of Judicial Review in India is derived from:', o: ['Constitution of USA', 'British Parliament', 'French Constitution', 'Canadian Constitution'], correct: 'Constitution of USA', concept: 'Judiciary' },
        ],
        'Geography': [
            { q: 'The Tropic of Cancer does NOT pass through:', o: ['Karnataka', 'Rajasthan', 'Madhya Pradesh', 'West Bengal'], correct: 'Karnataka', concept: 'Indian Geography' },
            { q: 'Which Indian state has the longest coastline?', o: ['Gujarat', 'Maharashtra', 'Andhra Pradesh', 'Tamil Nadu'], correct: 'Gujarat', concept: 'Physical Geography' },
            { q: 'Laterite soil is formed due to:', o: ['Leaching in heavy rainfall areas', 'Volcanic activity', 'River deposition', 'Glacial action'], correct: 'Leaching in heavy rainfall areas', concept: 'Soil Types' },
            { q: 'The Western Ghats are also known as:', o: ['Sahyadri', 'Vindhya', 'Satpura', 'Aravalli'], correct: 'Sahyadri', concept: 'Physiographic Divisions' },
            { q: 'Which river is known as the Sorrow of Bihar?', o: ['Kosi', 'Gandak', 'Son', 'Damodar'], correct: 'Kosi', concept: 'Drainage System' },
            { q: 'The Coriolis effect causes winds to deflect to the:', o: ['Right in Northern Hemisphere', 'Left in Northern Hemisphere', 'Same direction everywhere', 'Upward'], correct: 'Right in Northern Hemisphere', concept: 'Climatology' },
        ],
        'Science and Technology': [
            { q: 'ISRO\'s launch vehicle for heavy payloads to GTO is:', o: ['GSLV Mk III (LVM3)', 'PSLV', 'SSLV', 'SLV-3'], correct: 'GSLV Mk III (LVM3)', concept: 'Space Technology' },
            { q: 'CRISPR-Cas9 technology is used for:', o: ['Gene editing', 'Nuclear fusion', 'Satellite navigation', 'Quantum computing'], correct: 'Gene editing', concept: 'Biotechnology' },
            { q: 'India\'s three-stage nuclear programme was conceived by:', o: ['Homi Bhabha', 'A.P.J. Abdul Kalam', 'Vikram Sarabhai', 'C.V. Raman'], correct: 'Homi Bhabha', concept: 'Nuclear Technology' },
            { q: 'UPI stands for:', o: ['Unified Payments Interface', 'Universal Payment Integration', 'United Payment Initiative', 'Unified Processing Infrastructure'], correct: 'Unified Payments Interface', concept: 'Digital India' },
            { q: '5G technology operates in which frequency band?', o: ['Millimeter wave (30-300 GHz)', 'Only 2.4 GHz', 'Only 900 MHz', 'Infrared spectrum'], correct: 'Millimeter wave (30-300 GHz)', concept: 'Information Technology' },
            { q: 'The Chandrayaan-3 mission successfully landed on:', o: ['Lunar south pole', 'Lunar north pole', 'Lunar equator', 'Mars surface'], correct: 'Lunar south pole', concept: 'Space Technology' },
        ],
    };
    const topicLower = topic.toLowerCase();
    let pool = null;
    for (const [key, value] of Object.entries(fallbackPools)) {
        if (topicLower === key.toLowerCase() || topicLower.includes(key.toLowerCase()) || key.toLowerCase().includes(topicLower)) {
            pool = value;
            break;
        }
    }
    if (!pool) {
        const domain = subjectInfo.domain || '';
        pool = fallbackPools[domain];
    }
    if (!pool) {
        if (['compiler'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Compiler Design'];
        else if (['automata', 'computation', 'turing', 'chomsky'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Theory of Computation'];
        else if (['operating system', ' os '].some(k => topicLower.includes(k)))
            pool = fallbackPools['Operating Systems'];
        else if (['database', 'dbms', 'sql', 'normalization'].some(k => topicLower.includes(k)))
            pool = fallbackPools['DBMS'];
        else if (['data structure', 'tree', 'heap', 'stack', 'queue', 'linked list', 'hash'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Data Structures'];
        else if (['network theory', 'kvl', 'kcl', 'thevenin', 'norton'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Physics'];
        else if (['signal', 'fourier', 'laplace', 'z-transform', 'nyquist'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Physics'];
        else if (['communication', 'modulation', 'am ', 'fm ', 'pcm'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Physics'];
        else if (['control system', 'bode', 'root locus', 'routh'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Physics'];
        else if (['digital circuit', 'digital logic', 'logic gate', 'boolean', 'flip-flop', 'k-map'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Digital Logic'];
        else if (['network', 'tcp', 'ip address', 'routing', 'osi'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Computer Networks'];
        else if (['algorithm', 'sorting', 'dynamic programming', 'graph algorithm', 'complexity'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Algorithms'];
        else if (['architecture', 'pipeline', 'cache', 'cpu', 'risc', 'cisc'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Computer Architecture'];
        else if (['discrete', 'combinatorics', 'relation', 'propositional'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Discrete Mathematics'];
        else if (['economy', 'gdp', 'rbi', 'fiscal', 'monetary', 'inflation', 'banking'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Economy'];
        else if (['history', 'freedom struggle', 'mughal', 'british', 'independence'].some(k => topicLower.includes(k)))
            pool = fallbackPools['History'];
        else if (['polity', 'constitution', 'fundamental right', 'parliament', 'judiciary'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Polity'];
        else if (['geography', 'river', 'soil', 'climate', 'monsoon', 'mountain'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Geography'];
        else if (['science and technology', 'isro', 'space', 'biotechnology', 'nuclear'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Science and Technology'];
        else if (['english', 'synonym', 'antonym', 'grammar', 'vocabulary', 'comprehension'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Chemistry']; // safe general fallback
        else if (['physics', 'mechanics', 'optics', 'electro', 'thermo', 'waves', 'modern physics', 'kinematics'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Physics'];
        else if (['chemistry', 'organic', 'inorganic', 'physical chemistry', 'chemical'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Chemistry'];
        else if (['math', 'calculus', 'algebra', 'trigonometry', 'geometry', 'probability', 'statistics', 'vector'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Mathematics'];
        else if (['biology', 'botany', 'zoology', 'genetics', 'ecology', 'anatomy', 'physiology'].some(k => topicLower.includes(k)))
            pool = fallbackPools['Biology'];
        else
            pool = [];
    }
    console.error(`[FALLBACK] ⚠️ AI FAILED — Using hardcoded ${pool.length} questions for "${topic}". Check your AI API key!`);
    if (!pool || pool.length === 0) {
        throw new Error(`AI generation failed and no fallback questions available for "${topic}". Please try again in a few seconds — the AI may be rate limited.`);
    }
    const count = Math.min(15, pool.length);
    const selected = pick(pool, count);
    return selected.map(m => {
        const opts = m.t === 'NAT' ? [] : shuffle([...m.o]);
        return {
            text: m.q,
            type: m.t || 'MCQ',
            options: opts,
            correctAnswer: m.t === 'MSQ' ? m.correct : m.correct,
            marks: 2,
            negativeMarks: m.t === 'NAT' ? 0 : 0.67,
            concept: m.concept || topic
        };
    });
}
//# sourceMappingURL=getPaper.js.map