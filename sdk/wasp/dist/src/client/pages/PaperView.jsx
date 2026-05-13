import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useAction } from 'wasp/client/operations';
import { getPaper, submitAttempt } from 'wasp/client/operations';
// ── PDF GENERATION ──
function generatePDF(paper, answers, result) {
    const questions = paper?.questions || [];
    const title = paper?.campaign?.title || 'Question Paper';
    const topic = paper?.campaign?.topic || '';
    const examName = paper?.campaign?.examName || '';
    const date = new Date().toLocaleDateString();
    let html = `<html><head><title>${title}</title><style>
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #222; margin: 30px; }
    h1 { text-align: center; font-size: 22px; margin-bottom: 4px; }
    .subtitle { text-align: center; color: #555; margin-bottom: 20px; font-size: 14px; }
    .score-box { text-align: center; background: #f0f8ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 15px; margin-bottom: 25px; }
    .score-box .big { font-size: 28px; font-weight: bold; color: #2563eb; }
    .q-block { margin-bottom: 16px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; page-break-inside: avoid; }
    .q-title { font-weight: bold; margin-bottom: 6px; }
    .q-type { background: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-size: 11px; float: right; }
    .opt { margin: 3px 0 3px 20px; }
    .nat-input { margin: 4px 0 0 20px; color: #555; }
    .answer-key { margin-top: 30px; border-top: 3px solid #333; padding-top: 15px; page-break-before: always; }
    .answer-key h2 { text-align: center; margin-bottom: 15px; }
    .ak-row { display: flex; gap: 10px; padding: 5px 0; border-bottom: 1px solid #eee; }
    .ak-num { font-weight: bold; width: 40px; }
    .ak-ans { flex: 1; color: #16a34a; font-weight: bold; }
    @media print { body { margin: 15px; } }
  </style></head><body>`;
    html += `<h1>${title}</h1>`;
    html += `<div class="subtitle">${examName} | Topic: ${topic} | Date: ${date}</div>`;
    if (paper?.student) {
        html += `<div style="border:1px solid #ccc;padding:10px;border-radius:6px;margin-bottom:15px;">
      <strong>Student:</strong> ${paper.student.name} &nbsp;|&nbsp;
      <strong>Roll No:</strong> ${paper.student.rollNo} &nbsp;|&nbsp;
      <strong>Section:</strong> ${paper.student.section || 'N/A'}</div>`;
    }
    if (result) {
        const pct = Math.round((result.score / result.totalMarks) * 100);
        html += `<div class="score-box"><div class="big">${result.score} / ${result.totalMarks}</div><div>Score: ${pct}%</div></div>`;
    }
    html += `<h2>Questions</h2>`;
    questions.forEach((q, idx) => {
        html += `<div class="q-block"><div class="q-title"><span class="q-type">${q.type}</span>Q${idx + 1}. ${q.text}</div>`;
        if (q.type === 'NAT') {
            const userAns = answers?.[idx];
            html += `<div class="nat-input">${userAns !== undefined ? `Your answer: <strong>${userAns}</strong>` : '<em>Enter numerical answer</em>'}</div>`;
        }
        else {
            (q.options || []).forEach((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const userAns = answers?.[idx];
                const isUserPick = q.type === 'MSQ' ? (Array.isArray(userAns) && userAns.includes(opt)) : userAns === opt;
                html += `<div class="opt">${letter}. ${opt}${isUserPick ? ' ◄' : ''}</div>`;
            });
        }
        html += `<div style="font-size:11px;color:#888;margin-top:4px;">Marks: +${q.marks} | Negative: -${q.negativeMarks || 0}</div></div>`;
    });
    html += `<div class="answer-key"><h2>Answer Key</h2>`;
    questions.forEach((q, idx) => {
        const ans = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer;
        html += `<div class="ak-row"><div class="ak-num">Q${idx + 1}.</div><div class="ak-ans">${ans}</div></div>`;
    });
    html += `</div></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
}
function checkAnswerClient(userAns, correctAns, type) {
    if (!userAns)
        return false;
    if (type === 'MCQ')
        return userAns === correctAns;
    if (type === 'NAT') {
        const u = parseFloat(userAns), c = parseFloat(correctAns);
        return !isNaN(u) && !isNaN(c) && Math.abs(u - c) < 0.001;
    }
    if (type === 'MSQ') {
        if (!Array.isArray(userAns) || !Array.isArray(correctAns))
            return false;
        return JSON.stringify([...userAns].sort()) === JSON.stringify([...correctAns].sort());
    }
    return false;
}
export function PaperView() {
    const { token } = useParams();
    const { data: paper, isLoading, error } = useQuery(getPaper, { token });
    const submit = useAction(submitAttempt);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const navigate = useNavigate();
    if (isLoading)
        return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 56px)', color: 'var(--text3)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border2)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}/>
        <p style={{ fontSize: '15px', color: 'var(--text2)' }}>Generating your personalized questions...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>);
    if (error)
        return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 56px)' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--red)', marginBottom: '16px' }}>Error: {error.message}</p>
        <button onClick={() => navigate('/individual')} className="btn btn-primary">Back to Dashboard</button>
      </div>
    </div>);
    // ── RESULT + REVIEW SCREEN ──
    if (result) {
        const scorePercent = Math.round((result.score / result.totalMarks) * 100);
        const scoreColor = scorePercent >= 70 ? 'var(--green)' : scorePercent >= 40 ? 'var(--amber)' : 'var(--red)';
        return (<div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 32px' }} className="animate-in">
        {/* Score Card */}
        <div className="card-static" style={{ textAlign: 'center', marginBottom: '24px', padding: '32px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>Test Complete</h2>
          <div className="stat-num" style={{ fontSize: '48px' }}>{result.score}/{result.totalMarks}</div>
          <p style={{ color: 'var(--text3)', marginTop: '4px', marginBottom: '16px' }}>Score ({scorePercent}%)</p>
          <div className="progress-track" style={{ maxWidth: '300px', margin: '0 auto 20px' }}>
            <div className="progress-fill" style={{ width: scorePercent + '%', background: scoreColor }}/>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/individual')} className="btn btn-outline">Back to Dashboard</button>
            <button onClick={() => generatePDF(paper, answers, result)} className="btn btn-primary">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PDF
            </button>
          </div>
        </div>

        {/* Weak Areas */}
        {result.weakTopics && result.weakTopics.length > 0 && (<div className="tier-card tier-low" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--red)', marginBottom: '12px' }}>Topics to Improve</h3>
            {result.weakTopics.map((wt, i) => (<div key={i} className="card-static" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 500 }}>{wt.concept}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{wt.correct}/{wt.total}</span>
                  <span className="badge badge-red">{wt.accuracy}%</span>
                </div>
              </div>))}
          </div>)}

        {/* Strong Areas */}
        {result.conceptResults && (<div className="tier-card tier-excellent" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--green)', marginBottom: '12px' }}>Strong Topics</h3>
            {Object.entries(result.conceptResults)
                    .filter(([_, stats]) => (stats.correct / stats.total) >= 0.5)
                    .map(([concept, stats], i) => {
                    const acc = Math.round((stats.correct / stats.total) * 100);
                    return (<div key={i} className="card-static" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 500 }}>{concept}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{stats.correct}/{stats.total}</span>
                      <span className="badge badge-green">{acc}%</span>
                    </div>
                  </div>);
                })}
          </div>)}

        {/* Answer Review */}
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: '13px', fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
          Answer Review
        </div>
        {paper?.questions?.map((q, idx) => {
                const userAns = answers[idx];
                const isCorrect = checkAnswerClient(userAns, q.correctAnswer, q.type);
                return (<div key={idx} className="card-static" style={{ marginBottom: '10px', borderLeft: `3px solid ${isCorrect ? 'var(--green)' : 'var(--red)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <p style={{ fontWeight: 600, flex: 1, fontSize: '14px' }}>Q{idx + 1}. {q.text}</p>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: '12px' }}>
                  <span className={`badge ${q.type === 'MSQ' ? 'badge-amber' : q.type === 'NAT' ? 'badge-cyan' : 'badge-blue'}`}>{q.type}</span>
                  <span className={`badge ${isCorrect ? 'badge-green' : 'badge-red'}`}>{isCorrect ? 'Correct' : 'Wrong'}</span>
                </div>
              </div>
              {q.type === 'NAT' ? (<div style={{ fontSize: '13px', marginTop: '8px' }}>
                  <p>Your answer: <span style={{ color: isCorrect ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{userAns || 'Not answered'}</span></p>
                  <p>Correct answer: <span style={{ color: 'var(--green)', fontWeight: 600 }}>{q.correctAnswer}</span></p>
                </div>) : (<div style={{ marginTop: '8px' }}>
                  {q.options?.map((opt, i) => {
                            const isUserPick = q.type === 'MSQ' ? (Array.isArray(userAns) && userAns.includes(opt)) : userAns === opt;
                            const isCorrectOpt = q.type === 'MSQ' ? (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt)) : q.correctAnswer === opt;
                            let borderColor = 'var(--border2)';
                            let bg = 'transparent';
                            if (isCorrectOpt) {
                                borderColor = 'var(--green)';
                                bg = '#22c55e12';
                            }
                            else if (isUserPick) {
                                borderColor = 'var(--red)';
                                bg = '#ef444412';
                            }
                            return (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', border: `1px solid ${borderColor}`, borderRadius: '10px', marginBottom: '6px', background: bg, fontSize: '13.5px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0,
                                    background: isCorrectOpt ? 'var(--green)' : isUserPick ? 'var(--red)' : 'var(--bg4)', color: (isCorrectOpt || isUserPick) ? '#fff' : 'var(--text2)' }}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span style={{ flex: 1 }}>{opt}</span>
                        {isCorrectOpt && <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>Correct</span>}
                        {isUserPick && !isCorrectOpt && <span style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 600 }}>Your pick</span>}
                      </div>);
                        })}
                </div>)}
            </div>);
            })}
      </div>);
    }
    // ── TEST TAKING SCREEN ──
    const handleSubmit = async () => {
        const answersArray = paper.questions.map((_, idx) => answers[idx] || null);
        try {
            const res = await submit({ questionSetId: paper.questionSetId, answers: answersArray });
            setResult(res);
            setSubmitted(true);
        }
        catch (err) {
            alert('Error submitting: ' + err.message);
        }
    };
    const answeredCount = Object.values(answers).filter(a => a !== null && a !== '' && a !== undefined && (!Array.isArray(a) || a.length > 0)).length;
    const totalQ = paper?.questions?.length || 0;
    return (<div className="test-wrap">
      {/* Main Content */}
      <div className="test-main">
        {/* Student Details */}
        <div className="card-static" style={{ marginBottom: '20px', padding: '14px 18px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px' }}>
            {paper?.student && <>
              <div><span style={{ color: 'var(--text3)' }}>Student:</span> <strong style={{ color: 'var(--blue)' }}>{paper.student.name}</strong></div>
              <div><span style={{ color: 'var(--text3)' }}>Roll No:</span> <strong>{paper.student.rollNo}</strong></div>
              <div><span style={{ color: 'var(--text3)' }}>Section:</span> <strong>{paper.student.section || 'A'}</strong></div>
            </>}
            <div><span style={{ color: 'var(--text3)' }}>Exam:</span> <strong>{paper?.campaign?.examName}</strong></div>
            <div><span style={{ color: 'var(--text3)' }}>Topic:</span> <strong>{paper?.campaign?.topic}</strong></div>
            <div><span style={{ color: 'var(--text3)' }}>Date:</span> <strong>{new Date().toLocaleDateString()}</strong></div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{paper?.campaign?.title || 'Test Paper'}</h2>
          <span className="badge badge-blue" style={{ fontSize: '12px' }}>{answeredCount}/{totalQ} answered</span>
        </div>

        {/* Questions */}
        {paper?.questions?.map((q, idx) => (<div key={idx} className="card-static" style={{ marginBottom: '14px', borderLeft: answers[idx] !== undefined && answers[idx] !== null && answers[idx] !== '' ? '3px solid var(--green)' : '3px solid var(--border2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <p style={{ fontWeight: 600, flex: 1, fontSize: '14px', lineHeight: 1.5 }}>Q{idx + 1}. {q.text}</p>
              <span className={`badge ${q.type === 'MSQ' ? 'badge-amber' : q.type === 'NAT' ? 'badge-cyan' : 'badge-blue'}`} style={{ marginLeft: '12px', flexShrink: 0 }}>{q.type}</span>
            </div>

            {q.type === 'MSQ' && (<p style={{ fontSize: '11px', color: 'var(--amber)', marginBottom: '8px' }}>Select ALL correct answers (multiple may be correct)</p>)}

            {/* NAT */}
            {q.type === 'NAT' ? (<div>
                <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>Enter numerical answer (up to 3 decimal places)</p>
                <input type="number" step="0.001" placeholder="e.g., 3.142" value={answers[idx] || ''} onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })} className="form-input" style={{ maxWidth: '300px' }}/>
              </div>
            /* MSQ */
            ) : q.type === 'MSQ' ? (<div>
                {q.options?.map((opt, i) => {
                    const selected = Array.isArray(answers[idx]) && answers[idx].includes(opt);
                    return (<div key={i} className={`mcq-option${selected ? ' selected' : ''}`} onClick={() => {
                            const current = Array.isArray(answers[idx]) ? [...answers[idx]] : [];
                            if (selected)
                                setAnswers({ ...answers, [idx]: current.filter(a => a !== opt) });
                            else
                                setAnswers({ ...answers, [idx]: [...current, opt] });
                        }}>
                      <div className="mcq-letter">{String.fromCharCode(65 + i)}</div>
                      <span style={{ fontSize: '13.5px' }}>{opt}</span>
                    </div>);
                })}
              </div>
            /* MCQ */
            ) : (<div>
                {q.options?.map((opt, i) => (<div key={i} className={`mcq-option${answers[idx] === opt ? ' selected' : ''}`} onClick={() => setAnswers({ ...answers, [idx]: opt })}>
                    <div className="mcq-letter">{String.fromCharCode(65 + i)}</div>
                    <span style={{ fontSize: '13.5px' }}>{opt}</span>
                  </div>))}
              </div>)}

            <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text3)' }}>Marks: +{q.marks} | Negative: -{q.negativeMarks || 0}</div>
          </div>))}

        <button onClick={handleSubmit} disabled={submitted} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', marginTop: '8px', marginBottom: '32px', opacity: submitted ? 0.5 : 1 }}>
          Submit Test ({answeredCount}/{totalQ} answered)
        </button>
      </div>

      {/* Sidebar */}
      <div className="test-sidebar">
        <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>Question Palette</div>
        <div className="q-palette">
          {paper?.questions?.map((_, idx) => {
            const isAnswered = answers[idx] !== undefined && answers[idx] !== null && answers[idx] !== '' && (!Array.isArray(answers[idx]) || answers[idx].length > 0);
            return (<div key={idx} className={`q-num${isAnswered ? ' answered' : ''}${currentQ === idx ? ' current' : ''}`} onClick={() => { setCurrentQ(idx); document.querySelectorAll('.card-static')[idx + 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>
                {idx + 1}
              </div>);
        })}
        </div>
        <hr className="sep"/>
        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#22c55e25', border: '1px solid var(--green)' }}/>
            Answered ({answeredCount})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1px solid var(--border2)' }}/>
            Unanswered ({totalQ - answeredCount})
          </div>
        </div>
        <hr className="sep"/>
        <button onClick={handleSubmit} disabled={submitted} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: submitted ? 0.5 : 1 }}>
          Submit Test
        </button>
      </div>
    </div>);
}
//# sourceMappingURL=PaperView.jsx.map