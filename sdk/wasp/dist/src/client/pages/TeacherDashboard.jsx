import { Link } from 'react-router';
import { useQuery } from 'wasp/client/operations';
import { getCampaigns } from 'wasp/client/operations';
import { logout } from 'wasp/client/auth';
export function TeacherDashboard() {
    const { data: campaigns, isLoading, error } = useQuery(getCampaigns);
    return (<div className="min-h-screen bg-gray-900 text-white">

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/teacher/campaigns/new" className="bg-blue-700 hover:bg-blue-600 p-5 rounded-lg flex items-center gap-4">
            <div className="text-3xl">📝</div>
            <div>
              <p className="font-bold text-lg">Individual Mode</p>
              <p className="text-blue-200 text-sm">Create campaigns for self-paced students</p>
            </div>
          </Link>
          <Link to="/org" className="bg-purple-700 hover:bg-purple-600 p-5 rounded-lg flex items-center gap-4">
            <div className="text-3xl">🏫</div>
            <div>
              <p className="font-bold text-lg">Organization Mode</p>
              <p className="text-purple-200 text-sm">Bulk QR generation for coaching centres</p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded">
            <p className="text-gray-400 text-sm">Total Campaigns</p>
            <p className="text-3xl font-bold">{campaigns?.length || 0}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <p className="text-gray-400 text-sm">Total Papers</p>
            <p className="text-3xl font-bold">{campaigns?.reduce((s, c) => s + (c._count?.qrPapers || 0), 0) || 0}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <p className="text-gray-400 text-sm">Active Campaigns</p>
            <p className="text-3xl font-bold">{campaigns?.filter(c => new Date(c.deadline) > new Date()).length || 0}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Campaigns</h2>
          <Link to="/teacher/campaigns/new" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">+ Create</Link>
        </div>

        {isLoading && <p className="text-gray-400">Loading...</p>}
        {error && <p className="text-red-400">Error: {error.message}</p>}

        {campaigns?.length === 0 ? (<div className="bg-gray-800 p-8 text-center rounded">
            <p className="text-gray-400 mb-4">No campaigns yet.</p>
            <Link to="/teacher/campaigns/new" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Create your first campaign</Link>
          </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns?.map(c => (<div key={c.id} className="bg-gray-800 border border-gray-700 rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{c.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${new Date(c.deadline) > new Date() ? 'bg-green-800 text-green-300' : 'bg-red-800 text-red-300'}`}>
                    {new Date(c.deadline) > new Date() ? 'Active' : 'Expired'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">📚 {c.examName} — {c.topic}</p>
                <p className="text-gray-400 text-sm">⚡ Difficulty: {c.difficulty}</p>
                <p className="text-gray-400 text-sm">📅 Deadline: {new Date(c.deadline).toLocaleDateString()}</p>
                <p className="text-gray-400 text-sm">📄 Papers: {c._count?.qrPapers || 0}</p>
              </div>))}
          </div>)}
      </div>
    </div>);
}
//# sourceMappingURL=TeacherDashboard.jsx.map