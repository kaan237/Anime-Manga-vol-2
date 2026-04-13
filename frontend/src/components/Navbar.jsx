import { useState } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiGrid, FiUser, FiLogOut, FiMenu, FiX, FiStar, FiList } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/search', label: 'Keşfet', icon: <FiSearch size={16} /> },
    { to: '/library', label: 'Listem', icon: <FiGrid size={16} /> },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(8, 8, 8, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      height: '64px',
      display: 'flex', alignItems: 'center'
    }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto', padding: '0 24px',
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
          }}>
            <FiStar size={18} style={{ color: 'white' }} />
          </div>
          <span style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.3rem',
            background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            AniTrack
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '8px',
                textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500',
                transition: 'all 0.2s',
                background: isActive ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                color: isActive ? '#a78bfa' : '#a1a1aa',
                border: isActive ? '1px solid rgba(124, 58, 237, 0.25)' : '1px solid transparent'
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', padding: '7px 12px',
                  color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: '700'
                }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <span style={{ color: '#e4e4e7' }}>{user?.username}</span>
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: '#141414', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', padding: '8px', minWidth: '180px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  zIndex: 200
                }}>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: '8px',
                      textDecoration: 'none', color: '#a1a1aa', fontSize: '0.875rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <FiUser size={16} /> Profilim
                  </Link>
                  <Link
                    to="/library"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: '8px',
                      textDecoration: 'none', color: '#a1a1aa', fontSize: '0.875rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <FiList size={16} /> Listem
                  </Link>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                  <button
                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                      padding: '10px 12px', borderRadius: '8px',
                      background: 'transparent', border: 'none',
                      color: '#f87171', fontSize: '0.875rem', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <FiLogOut size={16} /> Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                to="/login"
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent', color: '#a1a1aa',
                  textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500'
                }}
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: 'white', textDecoration: 'none',
                  fontSize: '0.875rem', fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
                }}
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
