import { useState } from 'react';
import { useAction, useQuery } from 'wasp/client/operations';
import { createCampaign, getMyOrganization } from 'wasp/client/operations';
import { useNavigate, Link } from 'react-router';

const examTopics = {
  'GATE CS': ['Data Structures', 'Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks', 'Theory of Computation', 'Compiler Design', 'Digital Logic'],
  'GATE ECE': ['Network Theory', 'Signals and Systems', 'Digital Circuits', 'Communications', 'Control Systems'],
  'JEE Main': ['Physics - Mechanics', 'Physics - Electromagnetism', 'Chemistry - Organic', 'Chemistry - Inorganic', 'Mathematics - Calculus', 'Mathematics - Algebra'],
  'JEE Advanced': ['Physics', 'Chemistry', 'Mathematics'],
  'NEET': ['Biology - Botany', 'Biology - Zoology', 'Physics', 'Chemistry'],
  'UPSC': ['History', 'Geography', 'Polity', 'Economy', 'Science and Technology'],
};

export function OrgNewCampaign() {
  const { data: org } = useQuery(getMyOrganization);
  const create = useAction(createCampaign);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', examName: 'GATE CS', topic: '', difficulty: 'medium', deadline: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await create({ ...form, orgId: org?.id, mode: 'org' });
      navigate('/org/campaigns');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div><div className="page-title">New Campaign</div><div className="page-subtitle">Configure your adaptive exam campaign</div></div>
          <Link to="/org/campaigns" className="btn btn-outline">Cancel</Link>
        </div>
      </div>
      <div className="px">
        <div style={{ maxWidth: '640px' }}>
          {error && <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', background: '#ef444415', color: 'var(--red)', border: '1px solid #ef444430' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="card card-glow" style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '14px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border2)' }}>Campaign Details</div>
              <div className="form-group">
                <label className="form-label">Campaign Title</label>
                <input className="form-input" placeholder="e.g. DBMS Test" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="grid-2" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Exam Board</label>
                  <select className="form-select" value={form.examName} onChange={e => setForm({ ...form, examName: e.target.value, topic: '' })}>
                    {Object.keys(examTopics).map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Topic / Chapter</label>
                  <select className="form-select" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} required>
                    <option value="">Select topic...</option>
                    {(examTopics[form.examName] || []).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  {['easy', 'medium', 'hard'].map(d => (
                    <button key={d} type="button" onClick={() => setForm({ ...form, difficulty: d })}
                      className={`diff-btn${form.difficulty === d ? (d === 'easy' ? ' selected-easy' : d === 'hard' ? ' selected-hard' : ' selected-med') : ''}`}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input className="form-input" type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
              <Link to="/org/campaigns" className="btn btn-outline">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
      <div style={{ height: '32px' }} />
    </div>
  );
}
