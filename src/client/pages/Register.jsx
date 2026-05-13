import { useState } from 'react';
import { useNavigate } from 'react-router';
import { signup } from 'wasp/client/auth';

const OwlLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M7 6L10 12" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
    <path d="M25 6L22 12" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="16" cy="17" rx="11" ry="10" fill="#4f8ef715" stroke="#4f8ef7" strokeWidth="1.2" />
    <circle cx="12" cy="16" r="4.5" fill="#0d0d15" stroke="#4f8ef7" strokeWidth="1" />
    <circle cx="20" cy="16" r="4.5" fill="#0d0d15" stroke="#4f8ef7" strokeWidth="1" />
    <circle cx="12" cy="16" r="2.5" fill="#4f8ef7" />
    <circle cx="13" cy="15" r="1" fill="#fff" />
    <circle cx="20" cy="16" r="2.5" fill="#4f8ef7" />
    <circle cx="21" cy="15" r="1" fill="#fff" />
    <path d="M14.5 20.5 L16 23 L17.5 20.5" fill="#f59e0b" strokeLinejoin="round" />
    <path d="M7.5 13 Q12 10 16 13 Q20 10 24.5 13" stroke="#8b5cf6" strokeWidth="1" fill="none" strokeLinecap="round" />
  </svg>
);

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await signup({ email, password }); navigate('/login'); }
    catch (err) { setError(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-pattern" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
            <OwlLogo />
            <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '18px', background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Professor ARQI
            </span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.2, marginBottom: '20px', maxWidth: '360px' }}>
            Start your adaptive journey.
          </h2>
          <p className="auth-quote">
            Join thousands of educators generating smarter, fairer assessments with the power of AI.
          </p>
        </div>
        <div className="auth-tagline">Free for 30 days — no credit card required</div>
      </div>
      <div className="auth-right">
        <div className="auth-form-box animate-in">
          <h2 className="auth-heading">Create account</h2>
          <p className="auth-sub">Set up your account in under 2 minutes</p>
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px',
              background: '#ef444415', color: 'var(--red)', border: '1px solid #ef444430' }}>{error}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Create a strong password"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text2)' }}>
            Already have an account? <a href="/login" className="auth-link">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
