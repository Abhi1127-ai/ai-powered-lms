'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../lib/api';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user) {
      dashboardAPI.getLeaderboard()
        .then((data) => setLeaders(data.leaderboard || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading) return null;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ padding: '40px 24px 80px', maxWidth: '700px', margin: '0 auto' }}>
      <div className="animate-fade-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
          🏆 <span className="gradient-text">Knowledge Leaderboard</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
          Compete with fellow students and climb the ranks!
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: '60px' }}></div>)}
        </div>
      ) : leaders.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            No rankings yet. Be the first to earn points!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {leaders.map((l, i) => {
            const isMe = l._id === user?._id;
            return (
              <div
                key={l._id}
                className="glass-card animate-fade-in"
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  animationDelay: `${i * 0.05}s`,
                  animationFillMode: 'backwards',
                  border: isMe ? '1px solid rgba(99,102,241,0.4)' : undefined,
                  background: isMe ? 'rgba(99,102,241,0.1)' : undefined,
                }}
              >
                <div style={{
                  width: '36px',
                  textAlign: 'center',
                  fontSize: i < 3 ? '22px' : '16px',
                  fontWeight: 800,
                  color: i < 3 ? undefined : 'rgba(255,255,255,0.4)',
                }}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>
                    {l.name} {isMe && <span style={{ fontSize: '12px', color: '#8b5cf6' }}>(You)</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                    Class {l.studentClass} • 🔥 {l.streakCount} day streak
                  </div>
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {l.points} pts
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
