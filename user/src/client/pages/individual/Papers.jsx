import { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getStudentPapers, deletePaper } from 'wasp/client/operations';
import { Link } from 'react-router';
function generatePDFFromPaper(paper) {
    const qs = paper.questionSets?.[0];
    const attempt = qs?.attempts?.[0];
    let questions = [], userAnswers = [];
    try {
        questions = typeof qs?.questions === 'string' ? JSON.parse(qs.questions) : (qs?.questions || []);
    }
    catch {
        questions = [];
    }
    if (attempt) {
        try {
            userAnswers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : (attempt.answers || []);
        }
        catch {
            userAnswers = [];
        }
    }
    const title = paper.campaign?.title || 'Question Paper';
    const topic = paper.campaign?.topic || '';
    const examName = paper.campaign?.examName || '';
    const date = new Date(paper.createdAt).toLocaleDateString();
    let html = `<html><head><title>${title}</title><style>
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#222;margin:30px}
    h1{text-align:center;font-size:22px;margin-bottom:4px}
    .subtitle{text-align:center;color:#555;margin-bottom:20px;font-size:14px}
    .score-box{text-align:center;background:#f0f8ff;border:2px solid #3b82f6;border-radius:8px;padding:15px;margin-bottom:25px}
    .score-box .big{font-size:28px;font-weight:bold;color:#2563eb}
    .q-block{margin-bottom:16px;padding:10px;border:1px solid #ddd;border-radius:6px;page-break-inside:avoid}
    .q-title{font-weight:bold;margin-bottom:6px}
    .q-type{background:#e5e7eb;padding:2px 8px;border-radius:4px;font-size:11px;float:right}
    .opt{margin:3px 0 3px 20px}
    .answer-key{margin-top:30px;border-top:3px solid #333;padding-top:15px;page-break-before:always}
    .ak-row{display:flex;gap:10px;padding:5px 0;border-bottom:1px solid #eee}
    .ak-num{font-weight:bold;width:40px}.ak-ans{flex:1;color:#16a34a;font-weight:bold}
  </style></head><body>`;
    html += `<h1>${title}</h1><div class="subtitle">${examName} | ${topic} | ${date}</div>`;
    if (attempt) {
        const pct = Math.round((attempt.score / attempt.totalMarks) * 100);
        html += `<div class="score-box"><div class="big">${attempt.score}/${attempt.totalMarks}</div><div>${pct}%</div></div>`;
    }
    questions.forEach((q, idx) => {
        html += `<div class="q-block"><div class="q-title"><span class="q-type">${q.type}</span>Q${idx + 1}. ${q.text}</div>`;
        if (q.type === 'NAT') {
            html += `<div style="margin-left:20px;color:#555">Answer: ${q.correctAnswer}</div>`;
        }
        else {
            (q.options || []).forEach((opt, i) => { html += `<div class="opt">${String.fromCharCode(65 + i)}. ${opt}</div>`; });
        }
        html += `</div>`;
    });
    html += `<div class="answer-key"><h2>Answer Key</h2>`;
    questions.forEach((q, idx) => { const a = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer; html += `<div class="ak-row"><div class="ak-num">Q${idx + 1}.</div><div class="ak-ans">${a}</div></div>`; });
    html += `</div></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
}
function checkClient(user, correct, type) {
    if (!user && user !== 0)
        return false;
    if (type === 'MCQ')
        return user === correct;
    if (type === 'NAT') {
        const u = parseFloat(user), c = parseFloat(correct);
        return !isNaN(u) && !isNaN(c) && Math.abs(u - c) < 0.001;
    }
    if (type === 'MSQ') {
        if (!Array.isArray(user) || !Array.isArray(correct))
            return false;
        return JSON.stringify([...user].sort()) === JSON.stringify([...correct].sort());
    }
    return false;
}
function formatAnswer(ans) { if (Array.isArray(ans))
    return ans.join(', '); return String(ans ?? 'Not answered'); }
export function IndividualPapers() {
    const { data: papers, isLoading, refetch } = useQuery(getStudentPapers);
    const deleteAction = useAction(deletePaper);
    const [expanded, setExpanded] = useState(null);
    const handleDelete = async (paperId) => {
        if (confirm('Delete this paper? This cannot be undone.')) {
            await deleteAction({ paperId });
            refetch();
        }
    };
    return (<div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">My Papers</div>
            <div className="page-subtitle">{papers?.length || 0} papers generated</div>
          </div>
          <Link to="/individual" className="btn btn-outline btn-sm">Back to Dashboard</Link>
        </div>
      </div>
      <div className="px">
        {isLoading && <p style={{ color: 'var(--text3)' }}>Loading...</p>}
        {!papers?.length ? (<div className="card-static" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text3)', marginBottom: '16px' }}>No papers yet. Generate your first paper!</p>
            <Link to="/individual/new" className="btn btn-primary btn-sm">New Session</Link>
          </div>) : (<div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '32px' }}>
            {papers.map(paper => {
                const qs = paper.questionSets?.[0];
                const attempt = qs?.attempts?.[0];
                const isExpanded = expanded === paper.id;
                let questions = [], userAnswers = [];
                if (isExpanded && qs) {
                    try {
                        questions = typeof qs.questions === 'string' ? JSON.parse(qs.questions) : qs.questions;
                    }
                    catch {
                        questions = [];
                    }
                    if (attempt) {
                        try {
                            userAnswers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : attempt.answers;
                        }
                        catch {
                            userAnswers = [];
                        }
                    }
                }
                return (<div key={paper.id} className="card card-glow" style={{ overflow: 'hidden', padding: 0 }}>
                  {/* Header */}
                  <div style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : paper.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{paper.campaign?.title}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text3)' }}>
                          <span className="badge badge-blue" style={{ marginRight: '6px' }}>{paper.campaign?.examName}</span>
                          <span className="badge badge-purple">{paper.campaign?.topic}</span>
                          <span style={{ marginLeft: '10px' }}>{new Date(paper.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {attempt ? (<div style={{ textAlign: 'right' }}>
                            <div className="stat-num" style={{ fontSize: '22px' }}>{attempt.score}/{attempt.totalMarks}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Score</div>
                          </div>) : (<span className="badge badge-amber">Not attempted</span>)}
                        <svg width="14" height="14" fill="none" stroke="var(--text3)" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (<div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
                      <div style={{ fontFamily: "'Space Grotesk'", fontSize: '13px', fontWeight: 700, color: 'var(--text2)', marginBottom: '12px' }}>
                        Questions ({questions.length})
                      </div>
                      {questions.map((q, idx) => {
                            const userAns = userAnswers[idx];
                            const isCorrect = attempt && checkClient(userAns, q.correctAnswer, q.type);
                            return (<div key={idx} className="card-static" style={{ marginBottom: '8px', borderLeft: `3px solid ${attempt ? (isCorrect ? 'var(--green)' : 'var(--red)') : 'var(--border2)'}`, padding: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                              <p style={{ fontSize: '13px', flex: 1 }}><strong>Q{idx + 1}.</strong> {q.text}</p>
                              <span className={`badge ${q.type === 'MSQ' ? 'badge-amber' : q.type === 'NAT' ? 'badge-cyan' : 'badge-blue'}`} style={{ marginLeft: '8px', flexShrink: 0 }}>{q.type}</span>
                            </div>
                            {q.type !== 'NAT' && q.options?.map((opt, i) => {
                                    const isCor = q.type === 'MSQ' ? Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt) : q.correctAnswer === opt;
                                    return (<div key={i} style={{ fontSize: '12px', padding: '4px 0 4px 16px', color: isCor ? 'var(--green)' : 'var(--text3)' }}>
                                  {String.fromCharCode(65 + i)}. {opt} {isCor && <span style={{ fontWeight: 600 }}>✓</span>}
                                </div>);
                                })}
                            {q.type === 'NAT' && <div style={{ fontSize: '12px', color: 'var(--green)', paddingLeft: '16px' }}>Answer: {q.correctAnswer}</div>}
                            {attempt && (<div style={{ fontSize: '12px', paddingLeft: '16px', marginTop: '4px' }}>
                                <span style={{ color: 'var(--text3)' }}>Your answer: </span>
                                <span style={{ color: isCorrect ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{formatAnswer(userAns)}</span>
                                <span style={{ marginLeft: '6px' }}>{isCorrect ? '✓' : '✗'}</span>
                              </div>)}
                          </div>);
                        })}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button onClick={() => generatePDFFromPaper(paper)} className="btn btn-primary btn-sm">
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          Download PDF
                        </button>
                        <button onClick={() => handleDelete(paper.id)} className="btn btn-danger btn-sm">Delete</button>
                      </div>
                    </div>)}
                </div>);
            })}
          </div>)}
      </div>
    </div>);
}
