import { useParams } from 'react-router';
export function QRDisplay() {
    const { token } = useParams();
    const paperUrl = `${window.location.origin}/paper/${token}`;
    return (<div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Your QR Code</h1>
      <p className="mb-2">Share this link with your student:</p>
      <a href={paperUrl} className="text-blue-400 break-all">{paperUrl}</a>
    </div>);
}
