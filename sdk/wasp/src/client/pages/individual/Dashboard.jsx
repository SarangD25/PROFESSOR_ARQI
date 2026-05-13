import { useState, useMemo } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getCampaigns, getStudentPapers, deleteCampaign } from 'wasp/client/operations';
import { generateSecureQR } from 'wasp/client/operations';
import { useAuth } from 'wasp/client/auth';
import { useNavigate, Link } from 'react-router';
import { QRCodeSVG } from 'qrcode.react';

export function IndividualDashboard() {
  const { data: user } = useAuth();
  const { data: campaigns } = useQuery(getCampaigns);
  const { data: papers } = useQuery(getStudentPapers);
  const generateQR = useAction(generateSecureQR);
  const delCampaign = useAction(deleteCampaign);
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(null);
  const [qrModal, setQrModal] = useState(null);

  const conceptPerf = useMemo(() => {
    if (!papers?.length) return [];
    const conceptMap = {};
    papers.forEach(p => {
      const qs = p.questionSets?.[0];
      const attempt = qs?.attempts?.[0];
      if (!qs || !attempt) return;
      let questions = [], answers = [];
      try { questions = typeof qs.questions === 'string' ? JSON.parse(qs.questions) : qs.questions; } catch { return; }
      try { answers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : attempt.answers; } catch { return; }
      questions.forEach((q, idx) => {
        const concept = q.concept || p.campaign?.topic || 'General';
        if (!conceptMap[concept]) conceptMap[concept] = { correct: 0, total: 0 };
        conceptMap[concept].total++;
        const userAns = answers[idx];
        if (q.type === 'MCQ' && userAns === q.correctAnswer) conceptMap[concept].correct++;
        else if (q.type === 'NAT') { const u = parseFloat(userAns), c = parseFloat(q.correctAnswer); if (!isNaN(u) && !isNaN(c) && Math.abs(u-c) < 0.01) conceptMap[concept].correct++; }
        else if (q.type === 'MSQ' && Array.isArray(userAns) && Array.isArray(q.correctAnswer) && JSON.stringify([...userAns].sort()) === JSON.stringify([...q.correctAnswer].sort())) conceptMap[concept].correct++;
      });
    });
    return Object.entries(conceptMap)
      .map(([name, d]) => ({ concept: name, strength: d.total > 0 ? d.correct / d.total : 0, correct: d.correct, total: d.total }))
      .sort((a, b) => a.strength - b.strength);
  }, [papers]);

  const handleGenerateQR = async (campaignId, campaignTitle) => {
    try {
      setGenerating(campaignId);
      const { rawToken } = await generateQR({ campaignId, studentId: user.id });
      const paperUrl = window.location.origin + '/paper/' + rawToken;
      setQrModal({ url: paperUrl, token: rawToken, campaignTitle });
    } catch (err) { alert('Error: ' + err.message); }
    finally { setGenerating(null); }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">My Dashboard</div>
            <div className="page-subtitle">Your learning progress</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/individual/papers" className="btn btn-outline btn-sm">My Papers</Link>
            <Link to="/individual/new" className="btn btn-primary btn-sm">New Session</Link>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card-static" style={{ padding: '28px', textAlign: 'center', maxWidth: '360px', width: '100%' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{qrModal.campaignTitle}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>Scan QR or click Start Test</p>
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '16px' }}>
              <QRCodeSVG value={qrModal.url} size={180} />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button onClick={() => { setQrModal(null); navigate('/paper/' + qrModal.token); }} className="btn btn-primary">Start Test</button>
              <button onClick={() => setQrModal(null)} className="btn btn-outline">Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="px">
        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '28px' }}>
          <div className="stat-card"><div className="stat-num">{papers?.length || 0}</div><div className="stat-label">Papers Attempted</div></div>
          <div className="stat-card"><div className="stat-num">{conceptPerf.filter(c => c.strength < 0.5).length}</div><div className="stat-label">Weak Areas</div></div>
          <div className="stat-card"><div className="stat-num">{conceptPerf.filter(c => c.strength >= 0.5).length}</div><div className="stat-label">Strong Areas</div></div>
          <Link to="/individual/analytics" className="stat-card" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blue)' }}>View Analytics</div>
            <div className="stat-label">Detailed Insights →</div>
          </Link>
        </div>

        {/* Concept Performance */}
        {conceptPerf.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontSize: '13px', fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
              Performance by Concept
            </div>
            <div className="grid-2">
              {conceptPerf.map(c => (
                <div key={c.concept} className="card-static" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text1)' }}>{c.concept}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{c.correct}/{c.total} correct</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="progress-track" style={{ width: '80px' }}>
                      <div className="progress-fill" style={{
                        width: Math.max(c.strength * 100, 3) + '%',
                        background: c.strength < 0.5 ? 'var(--red)' : c.strength < 0.7 ? 'var(--amber)' : 'var(--green)'
                      }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, width: '36px', textAlign: 'right',
                      color: c.strength < 0.5 ? 'var(--red)' : c.strength < 0.7 ? 'var(--amber)' : 'var(--green)'
                    }}>{(c.strength * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaigns */}
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: '13px', fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Available Campaigns</div>
        {!campaigns?.length ? (
          <div className="card-static" style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text3)', fontSize: '14px' }}>No campaigns available yet.</p>
          </div>
        ) : (
          <div className="grid-2" style={{ paddingBottom: '32px' }}>
            {campaigns.map(c => {
              const isActive = new Date(c.deadline) > new Date();
              const campaignPapers = papers?.filter(p => p.campaignId === c.id) || [];
              return (
                <div key={c.id} className="campaign-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div className="campaign-title">{c.title}</div>
                    <span className={isActive ? 'badge badge-green' : 'badge badge-red'}>{isActive ? 'Active' : 'Expired'}</span>
                  </div>
                  <div className="campaign-meta">
                    <span className="badge badge-blue">{c.examName}</span>
                    <span className="badge badge-purple">{c.topic}</span>
                  </div>
                  <div className="campaign-info" style={{ marginBottom: '12px' }}>
                    <span>{c.difficulty}</span>
                    <span>{new Date(c.deadline).toLocaleDateString()}</span>
                    {campaignPapers.length > 0 && <span>{campaignPapers.length} paper{campaignPapers.length > 1 ? 's' : ''}</span>}
                  </div>
                  <hr className="sep" style={{ margin: '12px 0' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to="/individual/papers" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      View Questions
                    </Link>
                    <button onClick={() => handleGenerateQR(c.id, c.title)} disabled={generating === c.id || !isActive}
                      className="btn btn-primary btn-sm" style={{ justifyContent: 'center', opacity: (generating === c.id || !isActive) ? 0.5 : 1 }}>
                      {generating === c.id ? '...' : '+ New'}
                    </button>
                    <button onClick={async () => { if (confirm('Delete?')) await delCampaign({ campaignId: c.id }); }}
                      className="btn btn-danger btn-sm">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
