import { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getMyOrganization, getOrgStudents } from 'wasp/client/operations';
import { createAssessment } from 'wasp/client/operations';
import { useNavigate, Link } from 'react-router';
export function OrgAddAssessment() {
    const { data: org } = useQuery(getMyOrganization);
    const { data: students } = useQuery(getOrgStudents, { orgId: org?.id }, { enabled: !!org?.id });
    const create = useAction(createAssessment);
    const navigate = useNavigate();
    const [form, setForm] = useState({ type: 'assignment', title: '', maxMarks: 10, date: '' });
    const [marks, setMarks] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const entries = Object.entries(marks).filter(([_, m]) => m !== '' && m !== undefined)
            .map(([studentId, m]) => ({ orgStudentId: studentId, type: form.type, title: form.title, maxMarks: parseFloat(form.maxMarks), marks: parseFloat(m), date: form.date || undefined }));
        if (entries.length === 0) {
            setError('Enter marks for at least one student');
            return;
        }
        setLoading(true);
        try {
            await create({ orgId: org.id, entries });
            navigate('/org/assessments');
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div><div className="page-title">Add Assessment</div><div className="page-subtitle">Record student marks</div></div>
          <Link to="/org/assessments" className="btn btn-outline btn-sm">Back</Link>
        </div>
      </div>
      <div className="px" style={{ maxWidth: '700px' }}>
        {error && <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', background: '#ef444415', color: 'var(--red)', border: '1px solid #ef444430' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="card card-glow" style={{ marginBottom: '16px' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="form-select">
                  <option value="assignment">Assignment</option>
                  <option value="behavior">Class Behavior</option>
                  <option value="performance">Class Performance</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Assignment 1 - DBMS" className="form-input" required/>
              </div>
              <div className="form-group">
                <label className="form-label">Max Marks *</label>
                <input type="number" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} className="form-input" required min="1"/>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="form-input"/>
              </div>
            </div>
          </div>
          <div className="card card-glow" style={{ marginBottom: '16px' }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Student Marks</div>
            <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>Fill marks for each student. Leave blank to skip.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {students?.map(s => (<div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg0)', borderRadius: '8px', border: '1px solid var(--border2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>{s.name.charAt(0).toUpperCase()}</div>
                    <span style={{ fontSize: '14px' }}>{s.name} <span style={{ color: 'var(--text3)', fontSize: '12px' }}>({s.rollNo})</span></span>
                  </div>
                  <input type="number" placeholder="—" value={marks[s.id] || ''} onChange={e => setMarks({ ...marks, [s.id]: e.target.value })} className="form-input" style={{ width: '80px', textAlign: 'center', padding: '6px' }} min="0" max={form.maxMarks} step="0.5"/>
                  <span style={{ color: 'var(--text3)', fontSize: '13px', width: '40px' }}>/ {form.maxMarks}</span>
                </div>))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : 'Save Assessment'}
          </button>
        </form>
      </div>
      <div style={{ height: '32px' }}/>
    </div>);
}
//# sourceMappingURL=AddAssessment.jsx.map