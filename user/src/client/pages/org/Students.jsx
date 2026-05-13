import { useQuery, useAction } from 'wasp/client/operations';
import { getMyOrganization, getOrgStudents } from 'wasp/client/operations';
import { addOrgStudents } from 'wasp/client/operations';
import { Link } from 'react-router';
import { useState } from 'react';
export function OrgStudents() {
    const { data: org } = useQuery(getMyOrganization);
    const { data: students, refetch } = useQuery(getOrgStudents, { orgId: org?.id }, { enabled: !!org });
    const addStudents = useAction(addOrgStudents);
    const [csv, setCsv] = useState('');
    const [error, setError] = useState('');
    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const rows = csv.trim().split('\n').map(r => {
                const parts = r.split(',').map(p => p.trim());
                return { name: parts[0], rollNo: parts[1], section: parts[2] || '' };
            });
            await addStudents({ orgId: org.id, students: rows });
            setCsv('');
            refetch();
        }
        catch (err) {
            setError(err.message);
        }
    };
    if (!org)
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text3)' }}>Loading...</div>;
    return (<div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Students</div>
            <div className="page-subtitle">{students?.length || 0} students enrolled</div>
          </div>
        </div>
      </div>
      <div className="px">
        {/* Bulk Import */}
        <div className="card card-glow" style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)', marginBottom: '8px' }}>BULK IMPORT — Paste CSV (Name, Roll, Section)</div>
          {error && <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', background: '#ef444415', color: 'var(--red)', border: '1px solid #ef444430' }}>{error}</div>}
          <form onSubmit={handleAdd}>
            <textarea className="form-textarea" value={csv} onChange={e => setCsv(e.target.value)} placeholder={"Aarav Singh, 001, 10A\nPriya Kapoor, 002, 10A\nRohan Mehta, 003, 10B"} style={{ minHeight: '80px', marginBottom: '12px' }} required/>
            <button type="submit" className="btn btn-primary btn-sm">Import Students</button>
          </form>
        </div>

        {/* Table */}
        {!students?.length ? (<div className="card-static" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text3)', fontSize: '14px' }}>No students yet. Import them above.</p>
          </div>) : (<div className="card card-glow" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Student</th><th>Roll No.</th><th>Section</th><th>Papers</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {students.map(s => (<tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '10px' }}>
                            {s.name.substring(0, 2).toUpperCase()}
                          </div>
                          {s.name}
                        </div>
                      </td>
                      <td className="td-muted">{s.rollNo}</td>
                      <td><span className="badge badge-blue">{s.section || '—'}</span></td>
                      <td><span className="badge badge-purple">{s._count?.qrPapers || 0}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <Link to={'/org/student/' + s.id + '/papers'} style={{ color: 'var(--blue)', fontSize: '13px', textDecoration: 'none' }}>Papers</Link>
                          {(s._count?.qrPapers || 0) > 0 ? (<Link to={'/org/student/' + s.id + '/report'} style={{ color: 'var(--green)', fontSize: '13px', textDecoration: 'none' }}>Report</Link>) : (<span style={{ fontSize: '13px', color: 'var(--text3)', cursor: 'not-allowed' }}>Report</span>)}
                        </div>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>)}
      </div>
      <div style={{ height: '32px' }}/>
    </div>);
}
