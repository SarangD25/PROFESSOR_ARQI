import { Link, useNavigate, useLocation } from 'react-router';
import { logout, useAuth } from 'wasp/client/auth';
const OwlLogo = () => (<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ear tufts */}
    <path d="M7 6L10 12" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M25 6L22 12" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
    {/* Head */}
    <ellipse cx="16" cy="17" rx="11" ry="10" fill="#4f8ef715" stroke="#4f8ef7" strokeWidth="1.2"/>
    {/* Left eye ring */}
    <circle cx="12" cy="16" r="4.5" fill="#0d0d15" stroke="#4f8ef7" strokeWidth="1"/>
    {/* Right eye ring */}
    <circle cx="20" cy="16" r="4.5" fill="#0d0d15" stroke="#4f8ef7" strokeWidth="1"/>
    {/* Left pupil */}
    <circle cx="12" cy="16" r="2.5" fill="#4f8ef7"/>
    <circle cx="13" cy="15" r="1" fill="#fff"/>
    {/* Right pupil */}
    <circle cx="20" cy="16" r="2.5" fill="#4f8ef7"/>
    <circle cx="21" cy="15" r="1" fill="#fff"/>
    {/* Beak */}
    <path d="M14.5 20.5 L16 23 L17.5 20.5" fill="#f59e0b" stroke="#f59e0b" strokeWidth="0.5" strokeLinejoin="round"/>
    {/* Brow bridge */}
    <path d="M7.5 13 Q12 10 16 13 Q20 10 24.5 13" stroke="#8b5cf6" strokeWidth="1" fill="none" strokeLinecap="round"/>
  </svg>);
export function Navbar() {
    const { data: user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname;
    const isActive = (p) => path.startsWith(p);
    const navStyle = {
        position: 'sticky', top: 0, zIndex: 100, padding: '12px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#07070dee', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)'
    };
    const linkStyle = (active) => ({
        color: active ? 'var(--blue)' : 'var(--text2)', fontSize: '14px',
        textDecoration: 'none', transition: '0.2s', fontWeight: active ? 600 : 400
    });
    return (<nav style={navStyle}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <OwlLogo />
        <span style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '16px',
            background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>Professor ARQI</span>
      </Link>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {user ? (<>
            <Link to="/org" style={linkStyle(isActive('/org'))}>Organization</Link>
            <Link to="/individual" style={linkStyle(isActive('/individual'))}>Individual</Link>
            <Link to="/individual/new" style={linkStyle(isActive('/individual/new'))}>Practice</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px' }}>
              <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                {(user.identities?.email?.id || user.email || 'U')[0].toUpperCase()}
              </div>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-outline btn-sm">
                Sign Out
              </button>
            </div>
          </>) : (<>
            <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>)}
      </div>
    </nav>);
}
//# sourceMappingURL=Navbar.jsx.map