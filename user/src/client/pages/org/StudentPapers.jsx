import { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getOrgStudentPapers, deletePaper } from 'wasp/client/operations';
import { useParams, Link } from 'react-router';
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
    let html = `<html><head><title>${title}</title><style>body{font-family:'Segoe UI',sans-serif;font-size:13px;color:#222;margin:30px}h1{text-align:center;font-size:22px}
  .q-block{margin-bottom:16px;padding:10px;border:1px solid #ddd;border-radius:6px;page-break-inside:avoid}.q-title{font-weight:bold;margin-bottom:6px}
  .opt{margin:3px 0 3px 20px}.answer-key{margin-top:30px;border-top:3px solid #333;padding-top:15px;page-break-before:always}
  .ak-row{display:flex;gap:10px;padding:5px 0;border-bottom:1px solid #eee}.ak-num{font-weight:bold;width:40px}.ak-ans{flex:1;color:#16a34a;font-weight:bold}</style></head><body>`;
    html += `<h1>${title}</h1><p style="text-align:center;color:#555">${paper.campaign?.examName} | ${paper.campaign?.topic} | ${new Date(paper.createdAt).toLocaleDateString()}</p>`;
    if (attempt) {
        html += `<div style="text-align:center;background:#f0f8ff;border:2px solid #3b82f6;border-radius:8px;padding:15px;margin:20px 0"><div style="font-size:28px;font-weight:bold;color:#2563eb">${attempt.score}/${attempt.totalMarks}</div></div>`;
    }
    questions.forEach((q, i) => {
        html += `<div class="q-block"><div class="q-title">Q${i + 1}. ${q.text}</div>`;
        if (q.type === 'NAT')
            html += `<div class="opt"><em>Numerical</em></div>`;
        else
            (q.options || []).forEach((o, j) => html += `<div class="opt">${String.fromCharCode(65 + j)}. ${o}</div>`);
        html += `</div>`;
    });
    html += `<div class="answer-key"><h2>Answer Key</h2>`;
    questions.forEach((q, i) => { const a = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer; html += `<div class="ak-row"><div class="ak-num">Q${i + 1}.</div><div class="ak-ans">${a}</div></div>`; });
    html += `</div></body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
}
function formatAnswer(ans) { if (Array.isArray(ans))
    return ans.join(', '); return String(ans ?? 'Not answered'); }
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
export function OrgStudentPapers() {
    const { studentId } = useParams();
    const { data: papers, isLoading, refetch } = useQuery(getOrgStudentPapers, { orgStudentId: studentId });
    const deleteAction = useAction(deletePaper);
    const [expanded, setExpanded] = useState(null);
    const handleDelete = async (paperId) => { if (confirm('Delete this paper?')) {
        await deleteAction({ paperId });
        refetch();
    } };
    const studentName = papers?.[0]?.orgStudent?.name || 'Student';
    return (<div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div><div className="page-title">{studentName}'s Papers</div><div className="page-subtitle">{papers?.length || 0} papers</div></div>
          <Link to="/org/students" className="btn btn-outline btn-sm">Back to Students</Link>
        </div>
      </div>
      <div className="px">
        {isLoading && <p style={{ color: 'var(--text3)' }}>Loading...</p>}
        {!papers?.length ? (<div className="card-static" style={{ padding: '40px', textAlign: 'center' }}><p style={{ color: 'var(--text3)' }}>No papers for this student yet.</p></div>) : (<div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '32px' }}>
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
                  <div style={{ padding: '14px 20px', cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : paper.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{paper.campaign?.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                          <span className="badge badge-blue" style={{ marginRight: '6px' }}>{paper.campaign?.examName}</span>
                          <span className="badge badge-purple">{paper.campaign?.topic}</span>
                          <span style={{ marginLeft: '10px' }}>{new Date(paper.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {attempt ? (<div style={{ textAlign: 'right' }}><div className="stat-num" style={{ fontSize: '20px' }}>{attempt.score}/{attempt.totalMarks}</div><div style={{ fontSize: '11px', color: 'var(--text3)' }}>Score</div></div>) : (<span className="badge badge-amber">Not attempted</span>)}
                        <svg width="14" height="14" fill="none" stroke="var(--text3)" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (<div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text2)', marginBottom: '10px' }}>Questions ({questions.length})</div>
                      {questions.map((q, idx) => {
                            const userAns = userAnswers[idx];
                            const isCorrect = attempt && checkClient(userAns, q.correctAnswer, q.type);
                            return (<div key={idx} className="card-static" style={{ marginBottom: '6px', borderLeft: `3px solid ${attempt ? (isCorrect ? 'var(--green)' : 'var(--red)') : 'var(--border2)'}`, padding: '10px 12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <p style={{ fontSize: '13px', flex: 1 }}><strong>Q{idx + 1}.</strong> {q.text}</p>
                              <span className={`badge ${q.type === 'MSQ' ? 'badge-amber' : q.type === 'NAT' ? 'badge-cyan' : 'badge-blue'}`} style={{ marginLeft: '8px', flexShrink: 0 }}>{q.type}</span>
                            </div>
                            {q.type !== 'NAT' && q.options?.map((opt, i) => {
                                    const isCor = q.type === 'MSQ' ? Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt) : q.correctAnswer === opt;
                                    return <div key={i} style={{ fontSize: '12px', padding: '2px 0 2px 16px', color: isCor ? 'var(--green)' : 'var(--text3)' }}>{String.fromCharCode(65 + i)}. {opt} {isCor && '✓'}</div>;
                                })}
                            {q.type === 'NAT' && <div style={{ fontSize: '12px', color: 'var(--green)', paddingLeft: '16px' }}>Answer: {q.correctAnswer}</div>}
                            {attempt && <div style={{ fontSize: '12px', paddingLeft: '16px', marginTop: '4px' }}>
                              <span style={{ color: 'var(--text3)' }}>Your answer: </span>
                              <span style={{ color: isCorrect ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{formatAnswer(userAns)}</span>
                            </div>}
                          </div>);
                        })}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button onClick={() => generatePDFFromPaper(paper)} className="btn btn-primary btn-sm">Download PDF</button>
                        <button onClick={() => handleDelete(paper.id)} className="btn btn-danger btn-sm">Delete</button>
                      </div>
                    </div>)}
                </div>);
            })}
          </div>)}
      </div>
    </div>);
}
