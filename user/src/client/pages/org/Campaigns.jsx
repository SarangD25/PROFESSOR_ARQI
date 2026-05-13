import { useQuery } from 'wasp/client/operations';
import { getMyCampaigns } from 'wasp/client/operations';
import { Link } from 'react-router';
export function OrgCampaigns() {
    const { data: campaigns, isLoading } = useQuery(getMyCampaigns);
    return (<div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div><div className="page-title">Campaigns</div><div className="page-subtitle">Manage your exam campaigns</div></div>
          <Link to="/org/campaigns/new" className="btn btn-primary">New Campaign</Link>
        </div>
      </div>
      <div className="px">
        {isLoading && <p style={{ color: 'var(--text3)' }}>Loading...</p>}
        {!campaigns?.length ? (<div className="card-static" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text3)', marginBottom: '16px', fontSize: '14px' }}>No campaigns yet.</p>
            <Link to="/org/campaigns/new" className="btn btn-primary btn-sm">Create First Campaign</Link>
          </div>) : (<div className="grid-3">
            {campaigns.map(c => {
                const isActive = new Date(c.deadline) > new Date();
                return (<div key={c.id} className="campaign-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div className="campaign-title">{c.title}</div>
                    <span className={isActive ? 'badge badge-green' : 'badge badge-red'}>{isActive ? 'Active' : 'Expired'}</span>
                  </div>
                  <div className="campaign-meta">
                    <span className="badge badge-blue">{c.examName}</span>
                    <span className="badge badge-purple">{c.topic}</span>
                    <span className={c.difficulty === 'easy' ? 'badge badge-green' : c.difficulty === 'hard' ? 'badge badge-red' : 'badge badge-amber'}>{c.difficulty}</span>
                  </div>
                  <div className="campaign-info" style={{ marginBottom: '12px' }}>
                    <span>{c._count?.qrPapers || 0} papers</span>
                    <span>Due {new Date(c.deadline).toLocaleDateString()}</span>
                  </div>
                  <hr className="sep" style={{ margin: '12px 0' }}/>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to="/org/bulk-qr" className="btn btn-outline btn-sm">Generate QR</Link>
                    {!isActive && <button className="btn btn-danger btn-sm">Delete</button>}
                  </div>
                </div>);
            })}
            {/* New Campaign placeholder card */}
            <Link to="/org/campaigns/new" className="campaign-card" style={{ borderStyle: 'dashed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', opacity: 0.5, textDecoration: 'none' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px dashed var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <svg width="18" height="18" fill="none" stroke="var(--text3)" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text3)' }}>New Campaign</span>
            </Link>
          </div>)}
      </div>
      <div style={{ height: '32px' }}/>
    </div>);
}
