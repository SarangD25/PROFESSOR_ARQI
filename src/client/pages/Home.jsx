import { Link } from 'react-router';
import { useAuth } from 'wasp/client/auth';

const OwlMini = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
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
  </svg>
);

const features = [
  { icon: <svg width="22" height="22" fill="none" stroke="#4f8ef7" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>, bg: '#4f8ef720', title: 'AI Question Generation', desc: 'Instantly generate unique, curriculum-aligned questions for every student using advanced language models.' },
  { icon: <svg width="22" height="22" fill="none" stroke="#8b5cf6" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, bg: '#8b5cf620', title: 'QR Distribution', desc: 'Print and distribute personalised QR-coded papers instantly. Each student gets a unique paper linked to their profile.' },
  { icon: <svg width="22" height="22" fill="none" stroke="#22d3ee" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, bg: '#22d3ee20', title: 'Live Analytics', desc: 'Track performance trends across classes, concepts, and individual students with beautiful real-time dashboards.' },
  { icon: <svg width="22" height="22" fill="none" stroke="#22c55e" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, bg: '#22c55e20', title: 'Organisation Mode', desc: 'Manage multiple classes, sections, and batches under one institution with role-based access control.' },
  { icon: <svg width="22" height="22" fill="none" stroke="#f59e0b" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, bg: '#f59e0b20', title: 'Adaptive Learning', desc: 'Questions adapt to each student\'s weak areas automatically, closing knowledge gaps with precision.' },
  { icon: <svg width="22" height="22" fill="none" stroke="#ef4444" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, bg: '#ef444420', title: 'Bank-Level Security', desc: 'End-to-end encryption, GDPR compliance, and zero paper duplication — every paper is uniquely signed.' },
];

export function Home() {
  const { data: user } = useAuth();
  return (
    <div style={{ background: 'var(--bg0)' }}>
      {/* Hero */}
      <div className="hero" style={{ position: 'relative' }}>
        <div className="hero-orbs">
          <div className="orb orb1" />
          <div className="orb orb2" />
        </div>
        <div className="hero-bg" />
        <h1 className="hero-title">
          Adaptive exams,<br />
          <span className="grad">generated in seconds</span>
        </h1>
        <p className="hero-sub">
          Professor ARQI uses AI to create unique, QR-coded question papers for every student — personalised by performance, deployed at scale.
        </p>
        <div className="hero-ctas">
          <Link to={user ? '/individual' : '/register'} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }}>
            {user ? 'Go to Dashboard' : 'Get Started'}
          </Link>
          <Link to={user ? '/org' : '/login'} className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '15px' }}>
            {user ? 'Organization Mode' : 'Sign In'}
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="features">
        <div style={{ textAlign: 'center' }}>
          <div className="section-label">Why Professor ARQI</div>
          <h2 className="section-title" style={{ margin: '0 auto 48px', textAlign: 'center' }}>
            Everything you need for modern assessment
          </h2>
        </div>
        <div className="grid-3" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <OwlMini />
          <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, color: 'var(--text2)' }}>Professor ARQI</span>
        </div>
        <p>&copy; 2025 Professor ARQI. Built for educators who believe every student deserves a personalised path.</p>
      </footer>
    </div>
  );
}