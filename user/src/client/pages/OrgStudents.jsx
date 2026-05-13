import { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getOrganization, getOrgStudents } from 'wasp/client/operations';
import { createOrganization, addOrgStudents } from 'wasp/client/operations';
import { Link } from 'react-router';
import { logout } from 'wasp/client/auth';
export function OrgStudents() {
    const { data: org, isLoading, refetch } = useQuery(getOrganization);
    const { data: students, refetch: refetchStudents } = useQuery(getOrgStudents, { orgId: org?.id }, { enabled: !!org?.id });
    const createOrg = useAction(createOrganization);
    const addStudents = useAction(addOrgStudents);
    const [orgName, setOrgName] = useState('');
    const [csvText, setCsvText] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const handleCreateOrg = async (e) => {
        e.preventDefault();
        try {
            await createOrg({ name: orgName });
            setSuccess('Organization created!');
            refetch();
        }
        catch (err) {
            setError(err.message);
        }
    };
    const handleAddStudents = async (e) => {
        e.preventDefault();
        try {
            const lines = csvText.trim().split('\n');
            const students = lines.map(line => {
                const [name, rollNo, section] = line.split(',').map(s => s.trim());
                return { name, rollNo, section };
            }).filter(s => s.name && s.rollNo);
            await addStudents({ orgId: org.id, students });
            setSuccess(`${students.length} students added!`);
            setCsvText('');
            refetchStudents();
        }
        catch (err) {
            setError(err.message);
        }
    };
    return (<div className="min-h-screen bg-gray-900 text-white">

      <div className="max-w-4xl mx-auto p-6">
        {error && <div className="bg-red-800 text-red-200 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-800 text-green-200 p-3 rounded mb-4">{success}</div>}

        {!org ? (<div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">Create Your Organization</h2>
            <form onSubmit={handleCreateOrg} className="flex gap-3">
              <input type="text" placeholder="Organization name (e.g., ABC Coaching Centre)" value={orgName} onChange={e => setOrgName(e.target.value)} className="flex-1 p-2 rounded bg-gray-700 text-white" required/>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Create</button>
            </form>
          </div>) : (<>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{org.name} — Students</h2>
              <Link to="/org" className="text-blue-400 hover:text-blue-300">← Back to Org Dashboard</Link>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-bold mb-3">Add Students (CSV format)</h3>
              <p className="text-gray-400 text-sm mb-3">Enter one student per line: <code className="bg-gray-700 px-1 rounded">Name, Roll Number, Section</code></p>
              <form onSubmit={handleAddStudents}>
                <textarea value={csvText} onChange={e => setCsvText(e.target.value)} placeholder="John Doe, CS001, A&#10;Jane Smith, CS002, B&#10;Bob Johnson, CS003, A" className="w-full p-3 rounded bg-gray-700 text-white h-40 font-mono text-sm mb-3"/>
                <button type="submit" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Add Students</button>
              </form>
            </div>

            <h3 className="text-xl font-bold mb-4">Student Roster ({students?.length || 0} students)</h3>
            {students?.length === 0 ? (<p className="text-gray-400 bg-gray-800 p-4 rounded">No students added yet.</p>) : (<div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Roll No</th>
                      <th className="p-3 text-left">Section</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students?.map(s => (<tr key={s.id} className="border-t border-gray-700">
                        <td className="p-3">{s.name}</td>
                        <td className="p-3">{s.rollNo}</td>
                        <td className="p-3">{s.section || '-'}</td>
                      </tr>))}
                  </tbody>
                </table>
              </div>)}
          </>)}
      </div>
    </div>);
}
