import { useQuery, useAction } from 'wasp/client/operations';
import { getMyOrganization, getMyCampaigns, deleteCampaign } from 'wasp/client/operations';
import { createOrganization } from 'wasp/client/operations';
import { Link } from 'react-router';
import { useState } from 'react';
const quickActions = [
    { to: '/org/papers', label: 'Papers', bg: '#4f8ef720', stroke: '#4f8ef7', icon: <svg width="20" height="20" fill="none" stroke="#4f8ef7" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { to: '/org/students', label: 'Students', bg: '#8b5cf620', icon: <svg width="20" height="20" fill="none" stroke="#8b5cf6" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { to: '/org/campaigns', label: 'Campaigns', bg: '#22d3ee20', icon: <svg width="20" height="20" fill="none" stroke="#22d3ee" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { to: '/org/bulk-qr', label: 'QR Generate', bg: '#22c55e20', icon: <svg width="20" height="20" fill="none" stroke="#22c55e" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { to: '/org/assessments', label: 'Assessments', bg: '#f59e0b20', icon: <svg width="20" height="20" fill="none" stroke="#f59e0b" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
    { to: '/org/segregation', label: 'Segregation', bg: '#ec489920', icon: <svg width="20" height="20" fill="none" stroke="#ec4899" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { to: '/org/settings', label: 'Settings', bg: '#ffffff10', icon: <svg width="20" height="20" fill="none" stroke="#a0a0c0" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];
export function OrgDashboard() {
    const { data: org, isLoading, refetch } = useQuery(getMyOrganization);
    const { data: campaigns } = useQuery(getMyCampaigns);
    const createOrg = useAction(createOrganization);
    const delCampaign = useAction(deleteCampaign);
    const [orgName, setOrgName] = useState('');
    const [error, setError] = useState('');
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createOrg({ name: orgName });
            refetch();
        }
        catch (err) {
            setError(err.message);
        }
    };
    if (isLoading)
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text3)' }}>Loading...</div>;
    if (!org)
        return (<div style={{ maxWidth: '480px', margin: '80px auto', padding: '0 24px' }} className="animate-in">
      <h1 className="page-title" style={{ marginBottom: '8px' }}>Setup Your Organization</h1>
      <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '24px' }}>Create your organization to start managing students and generating QR-based question papers.</p>
      {error && <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', background: '#ef444415', color: 'var(--red)', border: '1px solid #ef444430' }}>{error}</div>}
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px' }}>
        <input type="text" placeholder="e.g., ABC Coaching Centre" value={orgName} onChange={e => setOrgName(e.target.value)} className="form-input" style={{ flex: 1 }} required/>
        <button type="submit" className="btn btn-primary">Create</button>
      </form>
    </div>);
    const activeCampaigns = campaigns?.filter(c => new Date(c.deadline) > new Date()).length || 0;
    return (<div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">{org.name}</div>
            <div className="page-subtitle">Organization Dashboard</div>
          </div>
          <Link to="/org/campaigns/new" className="btn btn-primary">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Campaign
          </Link>
        </div>
      </div>

      <div className="px">
        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '28px' }}>
          {[
            { num: org._count?.students || 0, label: 'Total Students' },
            { num: activeCampaigns, label: 'Active Campaigns' },
            { num: org._count?.campaigns || 0, label: 'Total Campaigns' },
            { num: '—', label: 'Avg Performance' },
        ].map((s, i) => (<div key={i} className="stat-card"><div className="stat-num">{s.num}</div><div className="stat-label">{s.label}</div></div>))}
        </div>

        {/* Quick Actions */}
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: '13px', fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Quick Actions</div>
        <div className="grid-7" style={{ marginBottom: '28px' }}>
          {quickActions.map((a, i) => (<Link key={i} to={a.to} className="quick-action">
              <div className="quick-action-icon" style={{ background: a.bg }}>{a.icon}</div>
              <div className="quick-action-label">{a.label}</div>
            </Link>))}
        </div>

        {/* Recent Campaigns */}
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: '13px', fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Recent Campaigns</div>
        {!campaigns?.length ? (<div className="card-static" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text3)', marginBottom: '16px', fontSize: '14px' }}>No campaigns yet.</p>
            <Link to="/org/campaigns/new" className="btn btn-primary btn-sm">Create First Campaign</Link>
          </div>) : (<div className="grid-2" style={{ paddingBottom: '32px' }}>
            {campaigns.map(c => {
                const isActive = new Date(c.deadline) > new Date();
                return (<div key={c.id} className="campaign-card">
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
                    <span>{c._count?.qrPapers || 0} papers</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/org/papers?campaign=${c.id}`} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      View Questions
                    </Link>
                    <button onClick={async () => { if (confirm('Delete?'))
                    await delCampaign({ campaignId: c.id }); }} className="btn btn-danger btn-sm">Delete</button>
                  </div>
                </div>);
            })}
          </div>)}
      </div>
    </div>);
}
//# sourceMappingURL=Dashboard.jsx.map