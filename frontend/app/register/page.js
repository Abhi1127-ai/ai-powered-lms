'use client';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    studentClass: '12',
    board: 'CBSE',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 64px)',
      padding: '24px',
    }}>
      <div className="glass-card animate-fade-in" style={{
        padding: '48px 40px',
        width: '100%',
        maxWidth: '480px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '40px' }}>🎓</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '12px' }}>
            Create Account
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: '8px', fontSize: '15px' }}>
            Start your board exam preparation today
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#fca5a5',
            fontSize: '14px',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' }}>
              Full Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Your full name"
              value={form.name}
              onChange={update('name')}
              required
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' }}>
              Email
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              required
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' }}>
              Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={update('password')}
              required
              minLength={6}
            />
          </div>
          <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' }}>
                Class
              </label>
              <select
                className="input-field"
                value={form.studentClass}
                onChange={update('studentClass')}
                style={{ cursor: 'pointer' }}
              >
                <option value="10" style={{ background: '#1a1a2e' }}>Class 10</option>
                <option value="12" style={{ background: '#1a1a2e' }}>Class 12</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' }}>
                Board
              </label>
              <select
                className="input-field"
                value={form.board}
                onChange={update('board')}
                style={{ cursor: 'pointer' }}
              >
                <option value="CBSE" style={{ background: '#1a1a2e' }}>CBSE</option>
                <option value="ICSE" style={{ background: '#1a1a2e' }}>ICSE</option>
                <option value="State" style={{ background: '#1a1a2e' }}>State Board</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '16px' }}
          >
            {loading ? '⏳ Creating account...' : '🚀 Sign Up'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          color: 'rgba(255,255,255,0.45)',
          fontSize: '14px',
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
