import { useState, useMemo } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getStudentPapers } from 'wasp/client/operations';
import { Link } from 'react-router';
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
function HBar({ data, color = '#4f8ef7', maxVal }) {
    const max = maxVal || Math.max(...data.map(d => d.value), 1);
    return (<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {data.map((d, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text3)', width: '110px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.label}>{d.label}</span>
          <div style={{ flex: 1, background: 'var(--bg0)', borderRadius: '8px', height: '22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ height: '22px', borderRadius: '8px', transition: 'width 0.5s', width: `${Math.max((d.value / max) * 100, 2)}%`, background: color }}/>
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>{d.display || d.value}</span>
          </div>
        </div>))}
    </div>);
}
function TrendChart({ points, width = 600, height = 200 }) {
    if (points.length < 2)
        return <p style={{ color: 'var(--text3)', fontSize: '13px' }}>Need at least 2 tests for trend chart</p>;
    const padding = 40;
    const w = width - padding * 2;
    const h = height - padding * 2;
    const maxY = Math.max(...points.map(p => p.y), 100);
    const xStep = w / (points.length - 1);
    const coords = points.map((p, i) => ({ x: padding + i * xStep, y: padding + h - ((p.y) / maxY) * h, label: p.label, value: p.y }));
    const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    const areaD = pathD + ` L ${coords[coords.length - 1].x} ${padding + h} L ${coords[0].x} ${padding + h} Z`;
    return (<svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxHeight: height }}>
      {[0, 25, 50, 75, 100].map(pct => {
            const y = padding + h - (pct / maxY) * h;
            return <g key={pct}><line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1a1a2e" strokeWidth="1"/><text x={padding - 5} y={y + 4} textAnchor="end" fill="#6b7280" fontSize="10">{pct}%</text></g>;
        })}
      <defs><linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4f8ef7"/><stop offset="100%" stopColor="#0d0d15" stopOpacity="0"/></linearGradient></defs>
      <path d={areaD} fill="url(#trendGrad)" opacity="0.3"/>
      <path d={pathD} fill="none" stroke="#4f8ef7" strokeWidth="2.5" strokeLinejoin="round"/>
      {coords.map((c, i) => (<g key={i}>
          <circle cx={c.x} cy={c.y} r="5" fill="#4f8ef7" stroke="#0d0d15" strokeWidth="2"/>
          <text x={c.x} y={c.y - 12} textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="bold">{c.value}%</text>
          <text x={c.x} y={padding + h + 15} textAnchor="middle" fill="#6b7280" fontSize="9">{c.label}</text>
        </g>))}
    </svg>);
}
export function IndividualAnalytics() {
    const { data: papers, isLoading } = useQuery(getStudentPapers);
    const analytics = useMemo(() => {
        if (!papers?.length)
            return null;
        const attempted = papers.filter(p => p.questionSets?.[0]?.attempts?.length > 0);
        if (!attempted.length)
            return null;
        const scoreTrend = attempted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(p => {
            const att = p.questionSets[0].attempts[0];
            return { label: new Date(p.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }), y: Math.round((att.score / att.totalMarks) * 100) };
        });
        const topicMap = {};
        attempted.forEach(p => {
            const topic = p.campaign?.topic || 'Unknown';
            const att = p.questionSets[0].attempts[0];
            const pct = Math.round((att.score / att.totalMarks) * 100);
            if (!topicMap[topic])
                topicMap[topic] = { total: 0, count: 0 };
            topicMap[topic].total += pct;
            topicMap[topic].count++;
        });
        const topicPerf = Object.entries(topicMap).map(([name, data]) => ({ label: name, value: Math.round(data.total / data.count), display: `${Math.round(data.total / data.count)}% (${data.count})` }));
        const typeStats = { MCQ: { correct: 0, total: 0 }, MSQ: { correct: 0, total: 0 }, NAT: { correct: 0, total: 0 } };
        attempted.forEach(p => {
            const qs = p.questionSets[0];
            let questions = [], answers = [];
            try {
                questions = typeof qs.questions === 'string' ? JSON.parse(qs.questions) : qs.questions;
            }
            catch {
                questions = [];
            }
            try {
                answers = typeof qs.attempts[0].answers === 'string' ? JSON.parse(qs.attempts[0].answers) : qs.attempts[0].answers;
            }
            catch {
                answers = [];
            }
            questions.forEach((q, idx) => { const t = q.type || 'MCQ'; if (typeStats[t]) {
                typeStats[t].total++;
                if (checkClient(answers[idx], q.correctAnswer, t))
                    typeStats[t].correct++;
            } });
        });
        const typePerf = Object.entries(typeStats).filter(([_, d]) => d.total > 0).map(([type, data]) => ({ label: type, value: Math.round((data.correct / data.total) * 100), display: `${data.correct}/${data.total} (${Math.round((data.correct / data.total) * 100)}%)` }));
        const conceptMap = {};
        attempted.forEach(p => {
            const qs = p.questionSets[0];
            let questions = [], answers = [];
            try {
                questions = typeof qs.questions === 'string' ? JSON.parse(qs.questions) : qs.questions;
            }
            catch {
                questions = [];
            }
            try {
                answers = typeof qs.attempts[0].answers === 'string' ? JSON.parse(qs.attempts[0].answers) : qs.attempts[0].answers;
            }
            catch {
                answers = [];
            }
            questions.forEach((q, idx) => { const c = q.concept || p.campaign?.topic || 'General'; if (!conceptMap[c])
                conceptMap[c] = { correct: 0, total: 0 }; conceptMap[c].total++; if (checkClient(answers[idx], q.correctAnswer, q.type))
                conceptMap[c].correct++; });
        });
        const concepts = Object.entries(conceptMap).filter(([_, d]) => d.total >= 2).map(([name, data]) => ({ name, accuracy: Math.round((data.correct / data.total) * 100), correct: data.correct, total: data.total })).sort((a, b) => a.accuracy - b.accuracy);
        const weakAreas = concepts.filter(c => c.accuracy < 50);
        const strongAreas = concepts.filter(c => c.accuracy >= 70);
        const avgScore = Math.round(scoreTrend.reduce((s, p) => s + p.y, 0) / scoreTrend.length);
        let recommendation = '', recLevel = '';
        if (avgScore >= 80) {
            recommendation = 'Excellent performance! Try harder difficulty to push your limits.';
            recLevel = 'hard';
        }
        else if (avgScore >= 60) {
            recommendation = 'Good progress! Focus on weak areas and try medium-hard questions.';
            recLevel = 'medium-hard';
        }
        else if (avgScore >= 40) {
            recommendation = 'Keep practicing! Review fundamentals, then attempt medium difficulty.';
            recLevel = 'medium';
        }
        else {
            recommendation = 'Start with basics. Review theory before attempting questions. Try easy difficulty.';
            recLevel = 'easy';
        }
        return { totalTests: attempted.length, avgScore, bestScore: Math.max(...scoreTrend.map(s => s.y)), scoreTrend, topicPerf, typePerf, weakAreas, strongAreas, concepts, recommendation, recLevel };
    }, [papers]);
    if (isLoading)
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text3)' }}>Loading analytics...</div>;
    return (<div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div><div className="page-title">My Analytics</div><div className="page-subtitle">Performance insights & adaptive recommendations</div></div>
          <Link to="/individual" className="btn btn-outline btn-sm">Dashboard</Link>
        </div>
      </div>
      <div className="px">
        {!analytics ? (<div className="card-static" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text3)', marginBottom: '8px', fontSize: '15px' }}>No test data yet</p>
            <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '16px' }}>Complete at least one test to see analytics</p>
            <Link to="/individual" className="btn btn-primary btn-sm">Go to Dashboard</Link>
          </div>) : (<>
            {/* Summary Cards */}
            <div className="grid-4" style={{ marginBottom: '20px' }}>
              <div className="stat-card"><div className="stat-num">{analytics.totalTests}</div><div className="stat-label">Tests Taken</div></div>
              <div className="stat-card"><div className="stat-num" style={{ color: 'var(--green)' }}>{analytics.avgScore}%</div><div className="stat-label">Avg Score</div></div>
              <div className="stat-card"><div className="stat-num" style={{ color: 'var(--amber)' }}>{analytics.bestScore}%</div><div className="stat-label">Best Score</div></div>
              <div className="stat-card"><div className="stat-num" style={{ color: 'var(--purple)', textTransform: 'capitalize' }}>{analytics.recLevel}</div><div className="stat-label">Suggested Level</div></div>
            </div>

            {/* Adaptive Recommendation */}
            <div className="card card-glow" style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(79,142,247,0.2)', marginBottom: '16px' }}>
              <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Adaptive Learning Recommendation</div>
              <p style={{ color: 'var(--text2)', fontSize: '13px' }}>{analytics.recommendation}</p>
              {analytics.weakAreas.length > 0 && (<div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--amber)', fontWeight: 600, marginBottom: '6px' }}>Priority focus areas:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {analytics.weakAreas.map(w => <span key={w.name} className="badge badge-red">{w.name} ({w.accuracy}%)</span>)}
                  </div>
                </div>)}
            </div>

            {/* Score Trend */}
            <div className="card card-glow" style={{ marginBottom: '16px' }}>
              <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>Score Trend</div>
              <TrendChart points={analytics.scoreTrend}/>
            </div>

            {/* Topic & Type Performance */}
            <div className="grid-2" style={{ marginBottom: '16px' }}>
              <div className="card card-glow">
                <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>Topic Performance</div>
                <HBar data={analytics.topicPerf} color="#8b5cf6" maxVal={100}/>
              </div>
              <div className="card card-glow">
                <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>By Question Type</div>
                <HBar data={analytics.typePerf} color="#22c55e" maxVal={100}/>
              </div>
            </div>

            {/* Strong & Weak */}
            <div className="grid-2" style={{ marginBottom: '16px' }}>
              <div className="tier-card tier-low" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '16px' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--red)', fontSize: '14px', marginBottom: '8px' }}>Weak Areas</h3>
                {analytics.weakAreas.length === 0 ? <p style={{ fontSize: '13px', color: 'var(--text3)' }}>No weak areas — great job!</p> :
                analytics.weakAreas.map(c => (<div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                      <span>{c.name}</span><div><span style={{ fontWeight: 700, color: 'var(--red)' }}>{c.accuracy}%</span> <span style={{ color: 'var(--text3)', fontSize: '11px' }}>({c.correct}/{c.total})</span></div>
                    </div>))}
              </div>
              <div className="tier-card tier-excellent" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '16px' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--green)', fontSize: '14px', marginBottom: '8px' }}>Strong Areas</h3>
                {analytics.strongAreas.length === 0 ? <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Keep practicing!</p> :
                analytics.strongAreas.map(c => (<div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                      <span>{c.name}</span><div><span style={{ fontWeight: 700, color: 'var(--green)' }}>{c.accuracy}%</span> <span style={{ color: 'var(--text3)', fontSize: '11px' }}>({c.correct}/{c.total})</span></div>
                    </div>))}
              </div>
            </div>

            {/* All Concepts Table */}
            <div className="card card-glow" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '14px' }}>All Concepts Breakdown</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Concept</th><th>Accuracy</th><th>Correct</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {analytics.concepts.map(c => (<tr key={c.name}>
                        <td>{c.name}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="progress-track" style={{ width: '60px' }}><div className="progress-fill" style={{ width: c.accuracy + '%', background: c.accuracy >= 70 ? 'var(--green)' : c.accuracy >= 50 ? 'var(--amber)' : 'var(--red)' }}/></div>
                            <span style={{ fontSize: '12px' }}>{c.accuracy}%</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--green)' }}>{c.correct}</td>
                        <td className="td-muted">{c.total}</td>
                        <td>
                          {c.accuracy >= 70 ? <span className="badge badge-green">Strong</span> :
                    c.accuracy >= 50 ? <span className="badge badge-amber">Moderate</span> :
                        <span className="badge badge-red">Weak</span>}
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          </>)}
      </div>
      <div style={{ height: '32px' }}/>
    </div>);
}
//# sourceMappingURL=Analytics.jsx.map