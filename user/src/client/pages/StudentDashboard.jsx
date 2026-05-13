import { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getStudentWeakAreas, getCampaigns } from 'wasp/client/operations';
import { generateSecureQR } from 'wasp/client/operations';
import { logout, useAuth } from 'wasp/client/auth';
import { useNavigate } from 'react-router';
import { QRCodeSVG } from 'qrcode.react';
export function StudentDashboard() {
    const { data: user } = useAuth();
    const { data: weakAreas, isLoading: loadingAreas } = useQuery(getStudentWeakAreas);
    const { data: campaigns, isLoading: loadingCampaigns } = useQuery(getCampaigns);
    const generateQR = useAction(generateSecureQR);
    const navigate = useNavigate();
    const [generating, setGenerating] = useState(null);
    const [qrData, setQrData] = useState(null); // { token, campaignTitle }
    const handleGenerateQR = async (campaignId, campaignTitle) => {
        try {
            setGenerating(campaignId);
            const { rawToken } = await generateQR({ campaignId, studentId: user.id });
            const paperUrl = `${window.location.origin}/paper/${rawToken}`;
            setQrData({ url: paperUrl, token: rawToken, campaignTitle });
        }
        catch (err) {
            alert('Error generating QR: ' + err.message);
        }
        finally {
            setGenerating(null);
        }
    };
    return (<div className="min-h-screen bg-gray-900 text-white">

      <div className="max-w-5xl mx-auto p-6">

        {/* QR Modal */}
        {qrData && (<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg text-center max-w-sm w-full">
              <h2 className="text-xl font-bold mb-2">{qrData.campaignTitle}</h2>
              <p className="text-gray-400 text-sm mb-4">Scan the QR code or click the button to start</p>
              <div className="bg-white p-4 rounded inline-block mb-4">
                <QRCodeSVG value={qrData.url} size={200}/>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate(`/paper/${qrData.token}`)} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
                  Start Test
                </button>
                <button onClick={() => setQrData(null)} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">
                  Close
                </button>
              </div>
            </div>
          </div>)}

        {/* Weak Areas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Weak Concepts</h2>
          {loadingAreas ? (<p className="text-gray-400">Loading...</p>) : weakAreas?.length === 0 ? (<p className="text-gray-400 bg-gray-800 p-4 rounded">No weak areas tracked yet. Complete a test to see results.</p>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weakAreas?.map(w => (<div key={w.concept} className="bg-gray-800 p-4 rounded flex justify-between items-center">
                  <span>{w.concept}</span>
                  <span className={`font-bold ${w.strength < 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                    {(w.strength * 100).toFixed(0)}%
                  </span>
                </div>))}
            </div>)}
        </div>

        {/* Campaigns */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Campaigns</h2>
          {loadingCampaigns ? (<p className="text-gray-400">Loading campaigns...</p>) : campaigns?.length === 0 ? (<p className="text-gray-400 bg-gray-800 p-4 rounded">No campaigns available yet.</p>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns?.map(c => (<div key={c.id} className="bg-gray-800 p-4 rounded border border-gray-700">
                  <h3 className="font-bold text-lg">{c.title}</h3>
                  <p className="text-gray-400 text-sm">Exam: {c.examName}</p>
                  <p className="text-gray-400 text-sm">Topic: {c.topic}</p>
                  <p className="text-gray-400 text-sm">Difficulty: {c.difficulty}</p>
                  <p className="text-gray-400 text-sm">Deadline: {new Date(c.deadline).toLocaleDateString()}</p>
                  <button onClick={() => handleGenerateQR(c.id, c.title)} disabled={generating === c.id} className="mt-3 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-medium disabled:opacity-50">
                    {generating === c.id ? 'Generating...' : 'Generate QR & Start Test'}
                  </button>
                </div>))}
            </div>)}
        </div>
      </div>
    </div>);
}
