import { useState } from 'react';
import { useAuth } from 'wasp/client/auth';
import { useAction } from 'wasp/client/operations';
import { createIndividualSession, generateSecureQR } from 'wasp/client/operations';
import { useNavigate, Link } from 'react-router';
import { QRCodeSVG } from 'qrcode.react';
const examTopics = {
    'GATE CS': ['Data Structures', 'Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks', 'Theory of Computation', 'Compiler Design', 'Digital Logic'],
    'GATE ECE': ['Network Theory', 'Signals and Systems', 'Digital Circuits', 'Communications', 'Control Systems'],
    'JEE Main': ['Physics - Mechanics', 'Physics - Electromagnetism', 'Chemistry - Organic', 'Chemistry - Inorganic', 'Mathematics - Calculus', 'Mathematics - Algebra'],
    'JEE Advanced': ['Physics', 'Chemistry', 'Mathematics'],
    'NEET': ['Biology - Botany', 'Biology - Zoology', 'Physics', 'Chemistry'],
    'UPSC': ['History', 'Geography', 'Polity', 'Economy', 'Science and Technology'],
    'SSC CGL': ['General Awareness', 'Quantitative Aptitude', 'English', 'Reasoning'],
    'CAT': ['Quantitative Ability', 'Verbal Ability', 'Data Interpretation', 'Logical Reasoning'],
};
export function IndividualNewSession() {
    const { data: user } = useAuth();
    const createSession = useAction(createIndividualSession);
    const generateQR = useAction(generateSecureQR);
    const navigate = useNavigate();
    const [form, setForm] = useState({ examName: 'GATE CS', topic: '', difficulty: 'medium' });
    const [loading, setLoading] = useState(false);
    const [qrModal, setQrModal] = useState(null);
    const [error, setError] = useState('');
    const handleStart = async (e) => {
        e.preventDefault();
        if (!form.topic) {
            setError('Please select a topic');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const campaign = await createSession({ examName: form.examName, topic: form.topic, difficulty: form.difficulty });
            const { rawToken } = await generateQR({ campaignId: campaign.id, studentId: user.id });
            const paperUrl = window.location.origin + '/paper/' + rawToken;
            setQrModal({ url: paperUrl, token: rawToken, topic: form.topic, examName: form.examName });
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
          <div><div className="page-title">New Practice Session</div><div className="page-subtitle">Generate a personalized question paper</div></div>
          <Link to="/individual" className="btn btn-outline">Back</Link>
        </div>
      </div>

      {/* QR Modal */}
      {qrModal && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card-static" style={{ padding: '28px', textAlign: 'center', maxWidth: '360px', width: '100%' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{qrModal.examName}</h2>
            <p style={{ color: 'var(--blue)', fontSize: '14px', marginBottom: '4px' }}>{qrModal.topic}</p>
            <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>Scan QR or click Start Test</p>
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '16px' }}>
              <QRCodeSVG value={qrModal.url} size={180}/>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button onClick={() => { setQrModal(null); navigate('/paper/' + qrModal.token); }} className="btn btn-primary">Start Test Now</button>
              <button onClick={() => setQrModal(null)} className="btn btn-outline">Close</button>
            </div>
          </div>
        </div>)}

      <div className="px" style={{ maxWidth: '640px' }}>
        {error && <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', background: '#ef444415', color: 'var(--red)', border: '1px solid #ef444430' }}>{error}</div>}

        <form onSubmit={handleStart}>
          <div className="card card-glow" style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '14px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border2)' }}>Select Exam</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
              {Object.keys(examTopics).map(exam => (<button key={exam} type="button" onClick={() => setForm({ ...form, examName: exam, topic: '' })} className={`toggle-opt${form.examName === exam ? ' selected' : ''}`}>{exam}</button>))}
            </div>

            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>Select Topic</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '24px' }}>
              {(examTopics[form.examName] || []).map(topic => (<button key={topic} type="button" onClick={() => setForm({ ...form, topic })} className={`toggle-opt${form.topic === topic ? ' selected' : ''}`} style={{ textAlign: 'left' }}>{topic}</button>))}
            </div>

            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>Difficulty</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['easy', 'medium', 'hard'].map(d => (<button key={d} type="button" onClick={() => setForm({ ...form, difficulty: d })} className={`diff-btn${form.difficulty === d ? (d === 'easy' ? ' selected-easy' : d === 'hard' ? ' selected-hard' : ' selected-med') : ''}`} style={{ flex: 1, textAlign: 'center' }}>{d.charAt(0).toUpperCase() + d.slice(1)}</button>))}
            </div>
          </div>

          <div className="card-static" style={{ padding: '16px', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text2)' }}>
              <strong style={{ color: 'var(--text1)' }}>What happens:</strong> AI generates 5 unique {form.difficulty} questions
              on <strong style={{ color: 'var(--blue)' }}>{form.topic || '...'}</strong> for <strong style={{ color: 'var(--blue)' }}>{form.examName}</strong>.
            </p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !form.topic} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', opacity: (loading || !form.topic) ? 0.5 : 1 }}>
            {loading ? 'Generating...' : 'Generate My Paper'}
          </button>
        </form>
      </div>
      <div style={{ height: '32px' }}/>
    </div>);
}
//# sourceMappingURL=NewSession.jsx.map