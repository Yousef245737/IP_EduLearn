// src/components/TopNavbar.jsx
import { Link, useNavigate } from 'react-router-dom';

export default function TopNavbar() {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 8%',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 38, height: 38, background: '#00ff88',
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#000', fontWeight: 800, fontSize: 18 }}>U</span>
        </div>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 18, letterSpacing: 0.5 }}>
          EduLearn
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link
          to="/"
          style={{ color: '#ccc', textDecoration: 'none', fontSize: 14, padding: '6px 12px' }}
        >
          Home
        </Link>

        {/* Sign Up button → opens Registration tab */}
        <button
          onClick={() => navigate('/login?tab=register')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: 20,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            transition: '0.3s',
          }}
          onMouseEnter={e => { e.target.style.borderColor = '#00ff88'; e.target.style.color = '#00ff88'; }}
          onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.color = 'white'; }}
        >
          Sign Up
        </button>

        {/* Login button → opens Login tab */}
        <button
          onClick={() => navigate('/login?tab=login')}
          style={{
            background: '#00ff88',
            border: '1px solid #00ff88',
            color: '#000',
            padding: '8px 20px',
            borderRadius: 20,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            transition: '0.3s',
          }}
          onMouseEnter={e => { e.target.style.opacity = '0.85'; }}
          onMouseLeave={e => { e.target.style.opacity = '1'; }}
        >
          Login
        </button>
      </div>
    </nav>
  );
}
