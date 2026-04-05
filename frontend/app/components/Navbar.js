'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Main nav — lean and clean
  const mainNavItems = user
    ? [
        { href: '/dashboard', label: '📊 Dashboard' },
        { href: '/doubt',     label: '🤖 Doubt AI'  },
        { href: '/summary',   label: '📝 Summary'   },
        { href: '/quiz',      label: '🎯 Quiz'       },
        { href: '/resources', label: '📚 Resources'  },
        { href: '/notes',     label: '📘 Notes'      },
        { href: '/mock-test', label: '📄 Mock Test' },
{ href: '/study-planner', label: '🗓️ Study Planner' },
      ]
    : [];

  // Profile dropdown items
  const dropdownItems = [
    { href: '/flashcards',  label: '🗂️ Flashcards'  },
    { href: '/grade',       label: '✅ Grade'        },
    { href: '/leaderboard', label: '🏆 Leaderboard'  },
    { href: '/badges',      label: '🏅 Badges'       },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => { setDropdownOpen(false); }, [pathname]);

  // First letter avatar
  const avatar = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <nav className="glass-card" style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px',
      }}>

        {/* Logo */}
        <Link href={user ? '/dashboard' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🎓</span>
          <span className="gradient-text" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            BoardPrep AI
          </span>
        </Link>

        {/* Main Nav Links */}
        {user && (
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            {mainNavItems.map((item) => (
              <Link key={item.href} href={item.href} style={{
                textDecoration: 'none', padding: '8px 13px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                color: pathname === item.href ? '#fff' : 'rgba(255,255,255,0.6)',
                background: pathname === item.href ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
              }}>
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>

              {/* Profile Button */}
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: dropdownOpen
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'rgba(99,102,241,0.2)',
                  border: '2px solid rgba(99,102,241,0.5)',
                  color: '#fff', fontWeight: 800, fontSize: '15px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title={user.name}
              >
                {avatar}
              </button>

              {/* Dropdown Panel */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  width: '220px',
                  background: '#1e1b4b',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: '14px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  animation: 'dropIn 0.15s ease',
                }}>
                  <style>{`@keyframes dropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

                  {/* User info */}
                  <div style={{
                    padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '15px', color: '#fff', flexShrink: 0,
                    }}>
                      {avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#f1f5f9' }}>{user.name}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{user.email}</div>
                    </div>
                  </div>

                  {/* Nav items */}
                  <div style={{ padding: '8px' }}>
                    {dropdownItems.map((item) => (
                      <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                        <div style={{
                          padding: '10px 12px', borderRadius: '8px',
                          fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                          color: pathname === item.href ? '#a5b4fc' : 'rgba(255,255,255,0.7)',
                          background: pathname === item.href ? 'rgba(99,102,241,0.15)' : 'transparent',
                          transition: 'all 0.15s',
                          display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = pathname === item.href ? 'rgba(99,102,241,0.15)' : 'transparent'; e.currentTarget.style.color = pathname === item.href ? '#a5b4fc' : 'rgba(255,255,255,0.7)'; }}
                        >
                          {item.label}
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        background: 'transparent', border: 'none',
                        color: '#fca5a5', fontSize: '14px', fontWeight: 500,
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href="/login">
                <button className="btn-secondary" style={{ padding: '8px 20px', fontSize: '14px' }}>Login</button>
              </Link>
              <Link href="/register">
                <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>Sign Up</button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}