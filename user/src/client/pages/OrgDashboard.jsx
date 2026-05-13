import { useQuery } from 'wasp/client/operations';
import { getOrganization, getCampaigns } from 'wasp/client/operations';
import { Link } from 'react-router';
import { logout } from 'wasp/client/auth';
export function OrgDashboard() {
    const { data: org, isLoading: loadingOrg } = useQuery(getOrganization);
    const { data: campaigns, isLoading: loadingCampaigns } = useQuery(getCampaigns);
    return (<div className="min-h-screen bg-gray-900 text-white">

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Organization Dashboard</h2>

        {loadingOrg ? <p className="text-gray-400">Loading...</p> : !org ? (<div className="bg-gray-800 p-8 rounded-lg text-center">
            <p className="text-gray-400 mb-4">You haven't set up an organization yet.</p>
            <Link to="/org/students" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg">
              Set Up Organization
            </Link>
          </div>) : (<>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 text-sm">Organization</p>
                <p className="text-2xl font-bold">{org.name}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 text-sm">Total Students</p>
                <p className="text-2xl font-bold">{org._count?.students || 0}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 text-sm">Total Campaigns</p>
                <p className="text-2xl font-bold">{org._count?.campaigns || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link to="/org/students" className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg text-center">
                <div className="text-3xl mb-2">👥</div>
                <p className="font-bold">Manage Students</p>
                <p className="text-sm text-blue-200">Add/view student roster</p>
              </Link>
              <Link to="/org/bulk-qr" className="bg-green-600 hover:bg-green-700 p-4 rounded-lg text-center">
                <div className="text-3xl mb-2">📱</div>
                <p className="font-bold">Generate Bulk QR</p>
                <p className="text-sm text-green-200">Create unique QR for all students</p>
              </Link>
              <Link to="/teacher/campaigns/new" className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg text-center">
                <div className="text-3xl mb-2">📝</div>
                <p className="font-bold">New Campaign</p>
                <p className="text-sm text-purple-200">Create a new test campaign</p>
              </Link>
            </div>

            <h3 className="text-xl font-bold mb-4">Recent Campaigns</h3>
            {loadingCampaigns ? <p className="text-gray-400">Loading...</p> : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns?.map(c => (<div key={c.id} className="bg-gray-800 border border-gray-700 rounded p-4">
                    <h4 className="font-bold">{c.title}</h4>
                    <p className="text-gray-400 text-sm">{c.examName} • {c.topic} • {c.difficulty}</p>
                    <p className="text-gray-400 text-sm">Deadline: {new Date(c.deadline).toLocaleDateString()}</p>
                    <Link to="/org/bulk-qr" className="mt-2 inline-block text-blue-400 text-sm hover:text-blue-300">
                      Generate QR for this campaign →
                    </Link>
                  </div>))}
              </div>)}
          </>)}
      </div>
    </div>);
}
