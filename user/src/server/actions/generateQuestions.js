import { getRelevantContext } from '../utils/rag.js';
import { callAI } from '../utils/aiProvider.js';
import { getSubjectKnowledge } from '../utils/subjectKnowledge.js';
const MAX_RETRIES = 2;
export async function generateQuestions(args, context) {
    const { qrPaperId, studentId } = args;
    // Get QR paper
    const qrPaper = await context.entities.QRPaper.findUnique({
        where: { id: qrPaperId },
        include: { campaign: true }
    });
    if (!qrPaper)
        throw new Error('QR paper not found');
    const campaign = qrPaper.campaign;
    // Fetch student's weak areas
    const weakAreas = await context.entities.WeakArea.findMany({
        where: { studentId }
    });
    const weakConcepts = weakAreas.filter(w => w.strength < 0.5).map(w => w.concept);
    // Get relevant PYQ/syllabus context using RAG
    const contextText = await getRelevantContext(campaign.examName, campaign.topic, weakConcepts);
    // Get subject-specific knowledge
    const subjectInfo = getSubjectKnowledge(campaign.topic);
    // Build the prompt
    const prompt = buildPrompt(campaign, subjectInfo, contextText, weakConcepts);
    // Generate with validation + retry
    let questions = null;
    let lastError = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await callAI(prompt);
            questions = parseAndValidate(response, subjectInfo, campaign.topic);
            break; // Success
        }
        catch (err) {
            lastError = err;
            console.warn(`[generateQuestions] Attempt ${attempt + 1} failed: ${err.message}`);
            if (attempt === MAX_RETRIES) {
                throw new Error(`Failed to generate valid questions after ${MAX_RETRIES + 1} attempts: ${lastError.message}`);
            }
        }
    }
    // Store question set
    const questionSet = await context.entities.QuestionSet.create({
        data: {
            qrPaperId,
            questions: JSON.stringify(questions),
            version: 1,
            weakConcepts: weakConcepts
        }
    });
    // Mark QR as used (one-time use)
    await context.entities.QRPaper.update({
        where: { id: qrPaperId },
        data: { isUsed: true }
    });
    return { questionSetId: questionSet.id, questions };
}
/**
 * Build a highly specific prompt that forces the AI to generate
 * questions ONLY about the specified subject/topic.
 */
function buildPrompt(campaign, subjectInfo, contextText, weakConcepts) {
    const { examName, topic, difficulty } = campaign;
    const { domain, subtopic, concepts, questionStarters, exampleQuestion, forbiddenContent } = subjectInfo;
    // Pick a random subset of concepts to add variety
    const shuffledConcepts = concepts.sort(() => Math.random() - 0.5);
    const selectedConcepts = shuffledConcepts.slice(0, Math.min(8, concepts.length));
    // Build the example section
    let exampleSection = '';
    if (exampleQuestion) {
        exampleSection = `
Here is an example of the KIND of question expected (do NOT copy this, create ORIGINAL questions):
{
  "text": "${exampleQuestion.text}",
  "type": "${exampleQuestion.type}",
  "options": ${JSON.stringify(exampleQuestion.options)},
  "correctAnswer": "${exampleQuestion.correctAnswer}",
  "marks": ${exampleQuestion.marks},
  "negativeMarks": ${exampleQuestion.negativeMarks},
  "concept": "${exampleQuestion.concept}"
}`;
    }
    // Build question starter hints
    let starterHints = '';
    if (questionStarters && questionStarters.length > 0) {
        const randomStarters = questionStarters.sort(() => Math.random() - 0.5).slice(0, 4);
        starterHints = `
Questions could start with phrases like:
${randomStarters.map(s => `- "${s}"`).join('\n')}`;
    }
    return `You are an expert ${examName} exam question paper setter specializing EXCLUSIVELY in ${domain} — specifically the topic: ${subtopic}.

═══════════════════════════════════════════════════
CRITICAL RULES (MUST FOLLOW):
═══════════════════════════════════════════════════
1. EVERY question MUST be about ${topic}. No exceptions.
2. NEVER generate questions about: ${forbiddenContent.join(', ')}.
3. NEVER generate generic or template questions. Each question must involve actual ${domain} concepts, formulas, equations, or calculations.
4. Questions must be at ${examName} competitive exam level — challenging, conceptual, and numerically precise.
5. Each question must have ONE unambiguously correct answer.
6. Use proper mathematical/scientific notation in question text (Unicode symbols like ∫, ∑, √, π, θ, α, β, ², ³, ₀, ₁, etc.)

═══════════════════════════════════════════════════
TOPIC DETAILS:
═══════════════════════════════════════════════════
Subject: ${domain}
Topic: ${subtopic}
Difficulty: ${difficulty || 'Medium'}
Key concepts to cover: ${selectedConcepts.join(', ')}
${weakConcepts.length > 0 ? `Student weak areas (emphasize these): ${weakConcepts.join(', ')}` : ''}

Reference context:
${contextText}
${starterHints}
${exampleSection}

═══════════════════════════════════════════════════
GENERATION TASK:
═══════════════════════════════════════════════════
Generate exactly 5 ORIGINAL ${examName}-style questions on ${topic}.
- Each question must test a DIFFERENT concept from the list above.
- Include numerical problems, conceptual questions, and application-based questions.
- For MCQ: provide exactly 4 options labeled A, B, C, D. Only ONE is correct.
- For NAT (Numerical Answer Type): no options, just the numerical answer.

Return ONLY a valid JSON array with this EXACT structure:
[
  {
    "text": "The actual ${subtopic} question with proper math notation...",
    "type": "MCQ",
    "options": ["A. first option", "B. second option", "C. third option", "D. fourth option"],
    "correctAnswer": "A",
    "marks": 2,
    "negativeMarks": 0.67,
    "concept": "Specific ${subtopic} concept tested"
  }
]

REMEMBER: You are generating a ${topic} paper. Every single question must be a genuine ${domain} problem involving real formulas, equations, and calculations. Do NOT generate programming, computer science, or generic questions.`;
}
/**
 * Parse the AI response and validate that questions are actually about the specified topic.
 */
function parseAndValidate(response, subjectInfo, topic) {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response;
    // Remove markdown code fences if present
    const jsonMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
        jsonStr = jsonMatch[1];
    }
    // Try to find JSON array in the response
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
        jsonStr = arrayMatch[0];
    }
    let questions;
    try {
        questions = JSON.parse(jsonStr);
    }
    catch (e) {
        throw new Error(`Failed to parse AI response as JSON: ${e.message}`);
    }
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('AI returned empty or non-array response');
    }
    // Validate each question
    const { forbiddenContent } = subjectInfo;
    const validQuestions = [];
    for (const q of questions) {
        // Basic structure validation
        if (!q.text || !q.type || !q.correctAnswer) {
            console.warn('[Validation] Skipping question with missing fields:', q);
            continue;
        }
        // Check for forbidden content (CS/programming terms in the question text)
        const textLower = q.text.toLowerCase();
        const hasForbidden = forbiddenContent.some(term => textLower.includes(term.toLowerCase()));
        if (hasForbidden) {
            console.warn(`[Validation] Rejecting off-topic question: "${q.text.substring(0, 80)}..."`);
            continue;
        }
        // Check that the topic name isn't used as a placeholder pattern
        // e.g., "In Mathematics - Calculus, what determines..."
        if (textLower.includes(topic.toLowerCase()) && textLower.includes('what determines')) {
            console.warn(`[Validation] Rejecting template question: "${q.text.substring(0, 80)}..."`);
            continue;
        }
        // Ensure MCQ has options
        if ((q.type === 'MCQ' || q.type === 'MSQ') && (!Array.isArray(q.options) || q.options.length < 4)) {
            console.warn('[Validation] Skipping MCQ without 4 options');
            continue;
        }
        // Set defaults
        q.marks = q.marks || 2;
        q.negativeMarks = q.negativeMarks || 0.67;
        q.concept = q.concept || topic;
        validQuestions.push(q);
    }
    if (validQuestions.length < 3) {
        throw new Error(`Only ${validQuestions.length} valid questions passed validation (need at least 3). Questions may be off-topic.`);
    }
    return validQuestions;
}
