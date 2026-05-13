import { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getMyOrganization, getMyCampaigns } from 'wasp/client/operations';
import { generateBulkQR } from 'wasp/client/operations';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router';
export function OrgBulkQR() {
    const { data: org } = useQuery(getMyOrganization);
    const { data: campaigns } = useQuery(getMyCampaigns);
    const generateQRs = useAction(generateBulkQR);
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [results, setResults] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [adaptive, setAdaptive] = useState(true);
    const handleGenerate = async () => {
        if (!selectedCampaign || !org)
            return;
        setGenerating(true);
        setError('');
        try {
            const data = await generateQRs({ campaignId: selectedCampaign, orgId: org.id, adaptive });
            setResults(data);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setGenerating(false);
        }
    };
    const selectedCampaignData = campaigns?.find(c => c.id === selectedCampaign);
    return (<div className="animate-in">
      <div className="page-header print:hidden">
        <div className="page-header-row">
          <div><div className="page-title">Generate QR Papers</div><div className="page-subtitle">Unique papers for each student via QR code</div></div>
        </div>
      </div>
      <div className="px">
        {error && <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', background: '#ef444415', color: 'var(--red)', border: '1px solid #ef444430' }}>{error}</div>}

        {results.length === 0 ? (<div className="card card-glow" style={{ maxWidth: '640px' }}>
            <div className="form-group">
              <label className="form-label">Select Campaign</label>
              <select value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)} className="form-select">
                <option value="">Choose a campaign...</option>
                {campaigns?.map(c => <option key={c.id} value={c.id}>{c.title} — {c.examName} ({c.topic})</option>)}
              </select>
            </div>
            {org && (<p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>
                Will generate unique QR papers for all <strong style={{ color: 'var(--text1)' }}>{org._count?.students || 0} students</strong> in {org.name}.
              </p>)}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '20px', cursor: 'pointer' }}>
              <input type="checkbox" checked={adaptive} onChange={e => setAdaptive(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--blue)' }}/>
              <span>Adaptive Difficulty</span>
              <span style={{ color: 'var(--text3)', fontSize: '12px' }}>(auto-adjust per student)</span>
            </label>
            <button onClick={handleGenerate} disabled={!selectedCampaign || generating || !org?._count?.students} className="btn btn-primary" style={{ opacity: (!selectedCampaign || generating) ? 0.5 : 1 }}>
              {generating ? 'Generating...' : 'Generate QR for All Students'}
            </button>
          </div>) : (<>
            <div className="print:hidden" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--green)' }}>Generated {results.length} unique QR papers!</p>
                <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Campaign: {selectedCampaignData?.title}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => window.print()} className="btn btn-primary btn-sm">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print All
                </button>
                <button onClick={() => setResults([])} className="btn btn-outline btn-sm">Generate New</button>
              </div>
            </div>
            <div className="grid-4">
              {results.map((r, i) => (<div key={i} className="qr-card">
                  <div className="qr-student-name">{r.student.name}</div>
                  <div className="qr-roll">Roll: {r.student.rollNo}{r.student.section ? ` | Sec: ${r.student.section}` : ''}</div>
                  {r.difficulty && <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>Difficulty: <strong>{r.difficulty}</strong></div>}
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                    <QRCodeSVG value={window.location.origin + r.paperUrl} size={130}/>
                  </div>
                  <div className="qr-instruction">Scan to start test</div>
                  <a href={r.paperUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#3b82f6', wordBreak: 'break-all', display: 'inline-block', marginTop: '4px' }}>Open Link</a>
                </div>))}
            </div>
          </>)}
      </div>
      <div style={{ height: '32px' }}/>
    </div>);
}
//# sourceMappingURL=BulkQR.jsx.map