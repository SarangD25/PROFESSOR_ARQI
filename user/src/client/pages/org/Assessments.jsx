import { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getMyOrganization, getOrgAssessments } from 'wasp/client/operations';
import { deleteAssessment } from 'wasp/client/operations';
import { Link } from 'react-router';
const typeLabels = { assignment: 'Assignment', behavior: 'Behavior', performance: 'Performance' };
export function OrgAssessments() {
    const { data: org } = useQuery(getMyOrganization);
    const { data: assessments, refetch } = useQuery(getOrgAssessments, { orgId: org?.id }, { enabled: !!org?.id });
    const deleteAction = useAction(deleteAssessment);
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? assessments : assessments?.filter(a => a.type === filter);
    const handleDelete = async (id) => {
        if (confirm('Delete this assessment?')) {
            await deleteAction({ id });
            refetch();
        }
    };
    return (<div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div><div className="page-title">Assessments</div><div className="page-subtitle">{assessments?.length || 0} records</div></div>
          <Link to="/org/assessments/add" className="btn btn-primary">Add Assessment</Link>
        </div>
      </div>
      <div className="px">
        {/* Filters */}
        <div className="tabs" style={{ marginBottom: '20px' }}>
          {['all', 'assignment', 'behavior', 'performance'].map(t => (<button key={t} onClick={() => setFilter(t)} className={`tab${filter === t ? ' active' : ''}`}>
              {t === 'all' ? 'All' : typeLabels[t]}
            </button>))}
        </div>

        {!filtered?.length ? (<div className="card-static" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text3)', marginBottom: '16px', fontSize: '14px' }}>No assessments yet.</p>
            <Link to="/org/assessments/add" className="btn btn-primary btn-sm">Add First Assessment</Link>
          </div>) : (<div className="card card-glow" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Type</th><th>Title</th><th>Marks</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {filtered.map(a => (<tr key={a.id}>
                      <td>{a.orgStudent?.name} <span className="td-muted" style={{ fontSize: '12px' }}>({a.orgStudent?.rollNo})</span></td>
                      <td><span className="badge badge-blue">{typeLabels[a.type] || a.type}</span></td>
                      <td>{a.title}</td>
                      <td style={{ fontWeight: 600 }}>{a.marks}/{a.maxMarks}</td>
                      <td className="td-muted">{new Date(a.date).toLocaleDateString()}</td>
                      <td><button onClick={() => handleDelete(a.id)} style={{ fontSize: '12px', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button></td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>)}
      </div>
      <div style={{ height: '32px' }}/>
    </div>);
}
