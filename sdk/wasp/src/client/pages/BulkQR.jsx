import { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getOrganization, getCampaigns } from 'wasp/client/operations';
import { generateBulkQR } from 'wasp/client/operations';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router';
import { logout } from 'wasp/client/auth';

export function BulkQR() {
  const { data: org } = useQuery(getOrganization);
  const { data: campaigns } = useQuery(getCampaigns);
  const generateQRs = useAction(generateBulkQR);

  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [qrResults, setQrResults] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!selectedCampaign || !org) return;
    setGenerating(true);
    setError('');
    try {
      const results = await generateQRs({ campaignId: selectedCampaign, orgId: org.id });
      setQrResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 print:hidden">Generate Bulk QR Codes</h2>

        {error && <div className="bg-red-800 text-red-200 p-3 rounded mb-4 print:hidden">{error}</div>}

        {qrResults.length === 0 ? (
          <div className="bg-gray-800 p-6 rounded-lg print:hidden">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Campaign</label>
              <select
                value={selectedCampaign}
                onChange={e => setSelectedCampaign(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                <option value="">Select a campaign...</option>
                {campaigns?.map(c => (
                  <option key={c.id} value={c.id}>{c.title} — {c.examName} ({c.topic})</option>
                ))}
              </select>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              This will generate unique QR codes for all {org?._count?.students || 0} students in your organization.
              Each student gets a different question paper on the same topic.
            </p>
            <button
              onClick={handleGenerate}
              disabled={!selectedCampaign || generating}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg disabled:opacity-50 font-bold"
            >
              {generating ? 'Generating...' : `Generate QR for All Students`}
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6 print:hidden">
              <p className="text-green-400 font-bold">✅ Generated {qrResults.length} unique QR codes!</p>
              <div className="flex gap-3">
                <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">🖨️ Print All</button>
                <button onClick={() => setQrResults([])} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Generate New</button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {qrResults.map((r, i) => (
                <div key={i} className="bg-white text-black p-4 rounded-lg text-center">
                  <p className="font-bold text-sm mb-1">{r.student.name}</p>
                  <p className="text-xs text-gray-600 mb-2">Roll: {r.student.rollNo} | Sec: {r.student.section}</p>
                  <div className="flex justify-center mb-2">
                    <QRCodeSVG value={`${window.location.origin}${r.paperUrl}`} size={120} />
                  </div>
                  <p className="text-xs text-gray-500">Scan to start test</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
