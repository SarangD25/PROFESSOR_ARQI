import { useQuery } from 'wasp/client/operations';
import { getStudentReport } from 'wasp/client/operations';
import { useParams, Link } from 'react-router';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const typeLabels = { assignment: 'Assignments', behavior: 'Behavior', performance: 'Performance', classTest: 'Class Tests' };
const tierMap = { green: { bg: 'tier-excellent', color: 'var(--green)', badge: 'badge-green' }, blue: { bg: 'tier-good', color: 'var(--blue)', badge: 'badge-blue' }, yellow: { bg: 'tier-avg', color: 'var(--amber)', badge: 'badge-amber' }, red: { bg: 'tier-low', color: 'var(--red)', badge: 'badge-red' } };
export function OrgStudentReport() {
    const { studentId } = useParams();
    const { data: report, isLoading } = useQuery(getStudentReport, { orgStudentId: studentId });
    if (isLoading)
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text3)' }}>Loading report...</div>;
    if (!report)
        return <div style={{ padding: '32px', color: 'var(--red)' }}>Report not found</div>;
    const { student, breakdown, combinedScore, tier, recommendedDifficulty, assessments, classTests } = report;
    const tm = tierMap[tier.color] || tierMap.blue;
    const timelineData = [];
    assessments?.forEach(a => { timelineData.push({ date: new Date(a.date).toLocaleDateString(), timestamp: new Date(a.date).getTime(), score: Math.round((a.marks / a.maxMarks) * 100), label: a.title }); });
    classTests?.forEach(paper => { paper.questionSets?.forEach(qs => { qs.attempts?.forEach(attempt => { timelineData.push({ date: new Date(attempt.submittedAt).toLocaleDateString(), timestamp: new Date(attempt.submittedAt).getTime(), score: Math.round((attempt.score / attempt.totalMarks) * 100), label: paper.campaign?.title }); }); }); });
    timelineData.sort((a, b) => a.timestamp - b.timestamp);
    const categoryData = Object.entries(breakdown).map(([key, data]) => ({ name: typeLabels[key] || key, score: Math.round(data.percent), fill: data.percent >= 70 ? '#22c55e' : data.percent >= 50 ? '#4f8ef7' : data.percent >= 30 ? '#f59e0b' : '#ef4444' }));
    const strongAreas = Object.entries(breakdown).filter(([_, d]) => d.percent >= 70);
    const weakAreas = Object.entries(breakdown).filter(([_, d]) => d.percent < 50);
    let trendText = '', trendColor = 'var(--text3)';
    if (timelineData.length >= 2) {
        const recent = timelineData.slice(-3).reduce((s, d) => s + d.score, 0) / Math.min(3, timelineData.length);
        const older = timelineData.slice(0, Math.max(1, timelineData.length - 3)).reduce((s, d) => s + d.score, 0) / Math.max(1, timelineData.length - 3);
        const diff = Math.round(recent - older);
        if (diff > 5) {
            trendText = `Improving (+${diff}%)`;
            trendColor = 'var(--green)';
        }
        else if (diff < -5) {
            trendText = `Declining (${diff}%)`;
            trendColor = 'var(--red)';
        }
        else {
            trendText = 'Stable';
            trendColor = 'var(--blue)';
        }
    }
    return (<div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div><div className="page-title">{student.name}</div><div className="page-subtitle">Roll: {student.rollNo} | Section: {student.section || '-'}</div></div>
          <Link to="/org/students" className="btn btn-outline btn-sm">Back to Students</Link>
        </div>
      </div>
      <div className="px" style={{ maxWidth: '900px' }}>
        {/* Combined Score */}
        <div className={`tier-card ${tm.bg}`} style={{ flexDirection: 'column', alignItems: 'center', padding: '28px', marginBottom: '20px', textAlign: 'center' }}>
          <div className="stat-num" style={{ fontSize: '48px' }}>{combinedScore}%</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: tm.color, marginTop: '4px' }}>{tier.name}</div>
          <div style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '4px' }}>Recommended Difficulty: <strong style={{ color: 'var(--text1)', textTransform: 'capitalize' }}>{recommendedDifficulty}</strong></div>
          {trendText && <div style={{ fontSize: '13px', fontWeight: 600, color: trendColor, marginTop: '6px' }}>{trendText}</div>}
        </div>

        {/* Performance Timeline */}
        {timelineData.length > 0 && (<div className="card card-glow" style={{ marginBottom: '16px' }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>Performance Over Time</div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e"/>
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11}/>
                <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={11} unit="%"/>
                <Tooltip contentStyle={{ backgroundColor: '#0d0d15', border: '1px solid #1e293b', borderRadius: 10, color: '#e2e8f0' }} formatter={(val) => [`${val}%`, 'Score']}/>
                <Line type="monotone" dataKey="score" stroke="#4f8ef7" strokeWidth={2} dot={{ fill: '#4f8ef7', r: 4 }} activeDot={{ r: 6 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>)}

        {/* Category Bar Chart */}
        {categoryData.length > 0 && (<div className="card card-glow" style={{ marginBottom: '16px' }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>Category Breakdown</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e"/>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11}/>
                <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={11} unit="%"/>
                <Tooltip contentStyle={{ backgroundColor: '#0d0d15', border: '1px solid #1e293b', borderRadius: 10, color: '#e2e8f0' }} formatter={(val) => [`${val}%`, 'Score']}/>
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>{categoryData.map((entry, idx) => (<rect key={idx} fill={entry.fill}/>))}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>)}

        {/* Category Progress Bars */}
        <div className="grid-2" style={{ marginBottom: '20px' }}>
          {Object.entries(breakdown).map(([key, data]) => (<div key={key} className="card-static">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 500, fontSize: '14px' }}>{typeLabels[key]}</span>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>{data.scored.toFixed(1)}/{data.total}</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: Math.min(data.percent, 100) + '%', background: data.percent >= 70 ? 'var(--green)' : data.percent >= 50 ? 'var(--blue)' : 'var(--red)' }}/></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                <span>{data.percent.toFixed(1)}%</span>
                <span>Weight: {(data.adjustedWeight * 100).toFixed(0)}% → {data.weighted.toFixed(1)} pts</span>
              </div>
            </div>))}
        </div>

        {/* Strong & Weak Areas */}
        <div className="grid-2" style={{ marginBottom: '20px' }}>
          <div className="tier-card tier-excellent" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '16px' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--green)', fontSize: '14px', marginBottom: '8px' }}>Strong Areas</h3>
            {strongAreas.length > 0 ? strongAreas.map(([key, d]) => (<div key={key} style={{ fontSize: '13px', color: 'var(--green)', padding: '2px 0' }}>{typeLabels[key]} — {d.percent.toFixed(0)}%</div>)) : <p style={{ fontSize: '13px', color: 'var(--text3)' }}>No strong areas yet</p>}
          </div>
          <div className="tier-card tier-low" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '16px' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--red)', fontSize: '14px', marginBottom: '8px' }}>Needs Improvement</h3>
            {weakAreas.length > 0 ? weakAreas.map(([key, d]) => (<div key={key} style={{ fontSize: '13px', color: 'var(--red)', padding: '2px 0' }}>{typeLabels[key]} — {d.percent.toFixed(0)}%</div>)) : <p style={{ fontSize: '13px', color: 'var(--text3)' }}>All areas performing well!</p>}
          </div>
        </div>

        {/* Assessment History */}
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: '13px', fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Assessment History</div>
        {!assessments?.length ? (<div className="card-static" style={{ padding: '20px', marginBottom: '20px' }}><p style={{ color: 'var(--text3)', fontSize: '13px' }}>No manual assessments yet.</p></div>) : (<div className="card card-glow" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Type</th><th>Title</th><th>Marks</th><th>Date</th></tr></thead>
                <tbody>{assessments.map(a => (<tr key={a.id}>
                    <td><span className="badge badge-blue">{typeLabels[a.type] || a.type}</span></td>
                    <td>{a.title}</td>
                    <td style={{ fontWeight: 600 }}>{a.marks}/{a.maxMarks}</td>
                    <td className="td-muted">{new Date(a.date).toLocaleDateString()}</td>
                  </tr>))}</tbody>
              </table>
            </div>
          </div>)}

        {/* Class Test History */}
        <ClassTestHistory classTests={classTests}/>
      </div>
      <div style={{ height: '32px' }}/>
    </div>);
}
function ClassTestHistory({ classTests }) {
    const [expanded, setExpanded] = useState(null);
    return (<>
      <div style={{ fontFamily: "'Space Grotesk'", fontSize: '13px', fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Class Test History</div>
      {!classTests?.length ? (<div className="card-static" style={{ padding: '20px' }}><p style={{ color: 'var(--text3)', fontSize: '13px' }}>No class tests yet.</p></div>) : (<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {classTests.map(paper => {
                const qs = paper.questionSets?.[0];
                const attempt = qs?.attempts?.[0];
                const isOpen = expanded === paper.id;
                const questions = qs ? (() => { try {
                    return JSON.parse(qs.questions);
                }
                catch {
                    return [];
                } })() : [];
                const answers = attempt ? (() => { try {
                    return JSON.parse(attempt.answers);
                }
                catch {
                    return [];
                } })() : [];
                const weakAreas = attempt?.weakAreas || {};
                const weakTopics = Object.entries(weakAreas).filter(([_, s]) => (s.correct / s.total) < 0.5);
                const strongTopics = Object.entries(weakAreas).filter(([_, s]) => (s.correct / s.total) >= 0.5);
                return (<div key={paper.id} className="card card-glow" style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '14px 20px', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : paper.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{paper.campaign?.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{paper.campaign?.examName} — {paper.campaign?.topic}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {attempt ? <div className="stat-num" style={{ fontSize: '20px' }}>{attempt.score}/{attempt.totalMarks}</div> : <span className="badge badge-amber">Not attempted</span>}
                      <svg width="14" height="14" fill="none" stroke="var(--text3)" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
                </div>
                {isOpen && attempt && (<div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
                    <div className="grid-2" style={{ marginBottom: '12px' }}>
                      {weakTopics.length > 0 && (<div className="tier-card tier-low" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '12px' }}>
                          <h4 style={{ fontWeight: 700, color: 'var(--red)', fontSize: '12px', marginBottom: '6px' }}>Weak Topics</h4>
                          {weakTopics.map(([concept, s], i) => (<div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '2px 0' }}>
                              <span>{concept}</span><span className="badge badge-red">{Math.round((s.correct / s.total) * 100)}%</span>
                            </div>))}
                        </div>)}
                      {strongTopics.length > 0 && (<div className="tier-card tier-excellent" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '12px' }}>
                          <h4 style={{ fontWeight: 700, color: 'var(--green)', fontSize: '12px', marginBottom: '6px' }}>Strong Topics</h4>
                          {strongTopics.map(([concept, s], i) => (<div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '2px 0' }}>
                              <span>{concept}</span><span className="badge badge-green">{Math.round((s.correct / s.total) * 100)}%</span>
                            </div>))}
                        </div>)}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text2)', marginBottom: '8px' }}>Answer Review</div>
                    {questions.map((q, idx) => {
                            const userAns = answers[idx];
                            const isCorrect = checkAns(userAns, q.correctAnswer, q.type);
                            return (<div key={idx} className="card-static" style={{ marginBottom: '6px', borderLeft: `3px solid ${isCorrect ? 'var(--green)' : 'var(--red)'}`, padding: '10px 12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <p style={{ fontSize: '12px', flex: 1 }}><strong>Q{idx + 1}.</strong> {q.text}</p>
                            <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                              <span className={`badge ${q.type === 'MSQ' ? 'badge-amber' : q.type === 'NAT' ? 'badge-cyan' : 'badge-blue'}`}>{q.type}</span>
                              <span className={`badge ${isCorrect ? 'badge-green' : 'badge-red'}`}>{isCorrect ? '✓' : '✗'}</span>
                            </div>
                          </div>
                          {q.type === 'NAT' ? (<div style={{ fontSize: '11px', marginTop: '4px' }}>
                              <span style={{ color: isCorrect ? 'var(--green)' : 'var(--red)' }}>Your answer: {userAns ?? 'N/A'}</span>
                              {!isCorrect && <span style={{ color: 'var(--green)', marginLeft: '12px' }}>Correct: {q.correctAnswer}</span>}
                            </div>) : (<div style={{ marginTop: '4px' }}>
                              {q.options?.map((opt, i) => {
                                        const picked = q.type === 'MSQ' ? (Array.isArray(userAns) && userAns.includes(opt)) : userAns === opt;
                                        const correct = q.type === 'MSQ' ? (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt)) : q.correctAnswer === opt;
                                        return (<div key={i} style={{ fontSize: '11px', padding: '3px 0 3px 14px', color: correct ? 'var(--green)' : picked ? 'var(--red)' : 'var(--text3)' }}>
                                    {String.fromCharCode(65 + i)}. {opt} {correct && '✓'} {picked && !correct && '✗'}
                                  </div>);
                                    })}
                            </div>)}
                        </div>);
                        })}
                  </div>)}
              </div>);
            })}
        </div>)}
    </>);
}
function checkAns(user, correct, type) {
    if (!user && user !== 0)
        return false;
    if (type === 'MCQ')
        return user === correct;
    if (type === 'NAT') {
        const u = parseFloat(user), c = parseFloat(correct);
        return !isNaN(u) && !isNaN(c) && Math.abs(u - c) < 0.01;
    }
    if (type === 'MSQ') {
        if (!Array.isArray(user) || !Array.isArray(correct))
            return false;
        return JSON.stringify([...user].sort()) === JSON.stringify([...correct].sort());
    }
    return false;
}
