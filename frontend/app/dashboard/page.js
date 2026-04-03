'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../lib/api';
import { useRouter } from 'next/navigation';

const subjectIcons = {
  Physics: '⚡', Chemistry: '🧪', Mathematics: '📐', Biology: '🧬',
  English: '📖', Hindi: '📝', Science: '🔬', 'Social Science': '🌍',
};

const subjectColors = {
  Physics: '#6366f1', Chemistry: '#10b981', Mathematics: '#f59e0b',
  Biology: '#ec4899', English: '#06b6d4', Hindi: '#8b5cf6',
  Science: '#6366f1', 'Social Science': '#f97316',
};

function ProgressRing({ percent, color, size = 90 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease', animation: 'progressFill 1.5s ease forwards' }}
      />
      <text x={size/2} y={size/2}
        textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize="16" fontWeight="700"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>
        {percent}%
      </text>
    </svg>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [aiPlan, setAiPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      Promise.all([dashboardAPI.getProgress(), dashboardAPI.getDailyGoals()])
        .then(([prog, plan]) => { 
          setData(prog); 
          setAiPlan(plan); 
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div style={{ padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '32px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '180px' }}></div>)}
        </div>
      </div>
    );
  }

  const totalProgress = data?.subjects?.length
    ? Math.round(Object.values(data.progress || {}).reduce((a, b) => a + (b || 0), 0) / data.subjects.length)
    : 0;

  return (
    <div style={{ padding: '40px 24px 80px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>
            Welcome back, <span className="gradient-text">{data?.name}</span> 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>
            Class {data?.studentClass} • {data?.board} Board
          </p>
        </div>
        {aiPlan?.dailyMantra && (
          <div className="glass-card" style={{ padding: '12px 20px', maxWidth: '400px', borderLeft: '3px solid #8b5cf6' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#8b5cf6', fontWeight: 700, marginBottom: '4px' }}>✨ Daily Mantra</div>
            <div style={{ fontSize: '14px', fontStyle: 'italic', color: 'white' }}>&ldquo;{aiPlan.dailyMantra}&rdquo;</div>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '36px',
      }}>
        <div className="glass-card animate-fade-in" style={{ padding: '24px', textAlign: 'center' }}>
          <ProgressRing percent={totalProgress} color="#6366f1" />
          <p style={{ marginTop: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
            Overall Progress
          </p>
        </div>
        <div className="glass-card animate-fade-in" style={{ padding: '24px', textAlign: 'center', animationDelay: '0.1s' }}>
          <div className="streak-fire" style={{ fontSize: '48px', marginBottom: '4px' }}>🔥</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#f59e0b' }}>
            {data?.streakCount || 0}
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Day Streak</p>
        </div>
        <div className="glass-card animate-fade-in" style={{ padding: '24px', textAlign: 'center', animationDelay: '0.2s' }}>
          <div style={{ fontSize: '48px', marginBottom: '4px' }}>⭐</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#8b5cf6' }}>
            {data?.points || 0}
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Total Points</p>
        </div>
      </div>

      {/* Daily Goals */}
      {aiPlan?.goals?.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700 }}>
              🎯 Today&apos;s AI Study Plan
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {aiPlan.goals.map((g, i) => (
              <div key={i} className="glass-card" style={{
                padding: '20px 24px',
                flex: '1 1 300px',
                borderLeft: `4px solid ${subjectColors[g.subject] || '#6366f1'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onClick={() => router.push(`/summary?subject=${encodeURIComponent(g.subject)}&chapter=${encodeURIComponent(g.chapter)}`)}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', color: subjectColors[g.subject] || '#6366f1', fontWeight: 700 }}>
                    {subjectIcons[g.subject]} {g.subject.toUpperCase()}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    background: g.priority === 'High' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                    color: g.priority === 'High' ? '#fca5a5' : '#fcd34d',
                    fontWeight: 700
                  }}>
                    {g.priority} Priority
                  </div>
                </div>
                <div style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>{g.chapter}</div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>{g.task}</div>
                <div style={{ 
                  fontSize: '13px', 
                  color: 'rgba(255,255,255,0.4)', 
                  padding: '8px', 
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px'
                }}>
                  💡 {g.why}
                </div>
              </div>
            ))}
          </div>
          {aiPlan?.proTip && (
            <div style={{ 
              marginTop: '20px', 
              padding: '16px', 
              borderRadius: '12px', 
              background: 'linear-gradient(90deg, rgba(6,182,212,0.1), transparent)',
              border: '1px solid rgba(6,182,212,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '24px' }}>🛡️</span>
              <div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#06b6d4', fontWeight: 700 }}>Pro Strategy</div>
                <div style={{ fontSize: '15px', color: 'white' }}>{aiPlan.proTip}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subject Cards */}
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>
        📚 Your Subjects
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
      }}>
        {data?.subjects?.map((sub, i) => {
          const pct = data.progress[sub] || 0;
          const color = subjectColors[sub] || '#6366f1';
          return (
            <div key={sub} className="glass-card animate-fade-in" style={{
              padding: '24px',
              animationDelay: `${i * 0.08}s`,
              animationFillMode: 'backwards',
              cursor: 'pointer',
            }}
            onClick={() => router.push(`/quiz?subject=${encodeURIComponent(sub)}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                    {subjectIcons[sub] || '📘'}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>{sub}</div>
                </div>
                <ProgressRing percent={pct} color={color} size={70} />
              </div>
              <div style={{
                marginTop: '16px',
                height: '4px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                  borderRadius: '4px',
                  transition: 'width 1s ease',
                }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
