'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = user
    ? [
      { href: '/dashboard', label: '📊 Dashboard', icon: '📊' },
      { href: '/flashcards', label: '🗂️ Flashcards', icon: '🗂️' },
      { href: '/doubt', label: '🤖 Doubt AI', icon: '🤖' },
      { href: '/summary', label: '📝 Summary', icon: '📝' },
      { href: '/quiz', label: '🎯 Quiz', icon: '🎯' },
      { href: '/grade', label: '✅ Grade', icon: '✅' },
      { href: '/resources', label: '📚 Resources', icon: '📚' },
      { href: '/notes', label: '📘 Notes', icon: '📘' },
      { href: '/leaderboard', label: '🏆 Board', icon: '🏆' },
    ]
    : [];

  return (
    <nav className="glass-card" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link href={user ? '/dashboard' : '/'} style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '24px' }}>🎓</span>
          <span className="gradient-text" style={{
            fontSize: '20px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
          }}>
            BoardPrep AI
          </span>
        </Link>

        {/* Nav Links */}
        {user && (
          <div style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
          }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: 'none',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: pathname === item.href ? '#fff' : 'rgba(255,255,255,0.6)',
                  background: pathname === item.href
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'transparent',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* User section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              <span style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.5)',
              }}>
                Hi, <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{user.name}</span>
              </span>
              <button
                onClick={logout}
                className="btn-secondary"
                style={{ padding: '6px 16px', fontSize: '13px' }}
              >
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href="/login">
                <button className="btn-secondary" style={{ padding: '8px 20px', fontSize: '14px' }}>
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
