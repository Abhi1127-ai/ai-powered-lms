'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const SUBJECT_COLORS = {
    Physics: { color: '#6366f1', bg: 'rgba(99,102,241,0.15)', icon: '⚡' },
    Chemistry: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: '🧪' },
    Mathematics: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: '📐' },
    Biology: { color: '#ec4899', bg: 'rgba(236,72,153,0.15)', icon: '🌿' },
    English: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', icon: '📖' },
};

const PRIORITY_COLORS = {
    High: { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', dot: '#ef4444' },
    Medium: { bg: 'rgba(245,158,11,0.15)', color: '#fcd34d', dot: '#f59e0b' },
    Low: { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', dot: '#10b981' },
};

export default function StudyPlannerPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState({});
    const [completed, setCompleted] = useState({});
    const [date] = useState(new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) fetchProgressAndPlan();
    }, [user]);

    async function fetchProgressAndPlan() {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('lms_token');

            // 1. Fetch subject progress
            const progRes = await fetch(`${API_URL}/dashboard/progress`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const progData = await progRes.json();
            const prog = progData.progress || {};
            setProgress(prog);

            // 2. Generate AI study plan
            const planRes = await fetch(`${API_URL}/dashboard/daily-goals`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const planData = await planRes.json();
            setPlan(planData);
        } catch (err) {
            setError('Failed to load study plan. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    function toggleComplete(idx) {
        setCompleted((c) => ({ ...c, [idx]: !c[idx] }));
    }

    const completedCount = Object.values(completed).filter(Boolean).length;
    const totalGoals = plan?.goals?.length || 0;

    if (authLoading) return null;

    return (
        <div style={{ padding: '40px 24px 80px', maxWidth: '860px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
                    🗓️ <span className="gradient-text">Smart Study Planner</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>{date}</p>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>🧠</div>
                    <p style={{ color: '#a5b4fc', fontWeight: 600 }}>AI is analyzing your progress...</p>
                    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                </div>
            )}

            {error && (
                <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: '10px', padding: '12px 16px', color: '#fca5a5', marginBottom: '20px' }}>
                    ❌ {error}
                    <button onClick={fetchProgressAndPlan} style={{ marginLeft: '12px', background: '#991b1b', border: 'none', color: '#fff', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer', fontSize: '12px' }}>Retry</button>
                </div>
            )}

            {!loading && plan && (
                <>
                    {/* Daily Mantra */}
                    {plan.dailyMantra && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                            border: '1px solid rgba(99,102,241,0.3)', borderRadius: '14px',
                            padding: '20px 24px', marginBottom: '24px',
                            display: 'flex', alignItems: 'center', gap: '14px',
                        }}>
                            <span style={{ fontSize: '2rem', flexShrink: 0 }}>✨</span>
                            <div>
                                <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Mantra</div>
                                <p style={{ color: '#f1f5f9', fontSize: '15px', fontStyle: 'italic', lineHeight: 1.5 }}>"{plan.dailyMantra}"</p>
                            </div>
                        </div>
                    )}

                    {/* Subject Progress Overview */}
                    {Object.keys(progress).length > 0 && (
                        <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                                📊 Your Subject Progress
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {Object.entries(progress).map(([subj, pct]) => {
                                    const col = SUBJECT_COLORS[subj] || { color: '#6366f1', bg: 'rgba(99,102,241,0.15)', icon: '📚' };
                                    return (
                                        <div key={subj}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{col.icon} {subj}</span>
                                                <span style={{ fontSize: '13px', fontWeight: 700, color: col.color }}>{pct}%</span>
                                            </div>
                                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: col.color, borderRadius: '999px', transition: 'width 0.8s ease' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Today's Goals */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>🎯 Today's Study Goals</h2>
                            {totalGoals > 0 && (
                                <span style={{ fontSize: '13px', color: completedCount === totalGoals ? '#10b981' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                                    {completedCount}/{totalGoals} done {completedCount === totalGoals ? '🎉' : ''}
                                </span>
                            )}
                        </div>

                        {/* Goals completion bar */}
                        {totalGoals > 0 && (
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden', marginBottom: '18px' }}>
                                <div style={{ height: '100%', width: `${(completedCount / totalGoals) * 100}%`, background: 'linear-gradient(90deg,#6366f1,#10b981)', borderRadius: '999px', transition: 'width 0.4s ease' }} />
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {plan.goals?.map((goal, i) => {
                                const col = SUBJECT_COLORS[goal.subject] || { color: '#6366f1', bg: 'rgba(99,102,241,0.15)', icon: '📚' };
                                const pri = PRIORITY_COLORS[goal.priority] || PRIORITY_COLORS['Medium'];
                                const done = completed[i];
                                return (
                                    <div key={i} style={{
                                        background: done ? 'rgba(16,185,129,0.06)' : col.bg,
                                        border: `1px solid ${done ? '#10b98133' : col.color + '33'}`,
                                        borderRadius: '14px', padding: '18px 20px',
                                        opacity: done ? 0.7 : 1, transition: 'all 0.2s',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                                                    <span style={{ background: col.bg, color: col.color, borderRadius: '6px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>
                                                        {col.icon} {goal.subject}
                                                    </span>
                                                    <span style={{ background: pri.bg, color: pri.color, borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: pri.dot, display: 'inline-block' }} />
                                                        {goal.priority} Priority
                                                    </span>
                                                </div>

                                                {goal.chapter && (
                                                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                                                        📖 {goal.chapter}
                                                    </div>
                                                )}

                                                <div style={{ fontSize: '15px', fontWeight: 600, color: done ? 'rgba(255,255,255,0.4)' : '#f1f5f9', textDecoration: done ? 'line-through' : 'none', marginBottom: '8px' }}>
                                                    {goal.task}
                                                </div>

                                                {goal.why && (
                                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
                                                        💡 {goal.why}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => toggleComplete(i)}
                                                style={{
                                                    flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%',
                                                    border: `2px solid ${done ? '#10b981' : col.color + '66'}`,
                                                    background: done ? '#10b981' : 'transparent',
                                                    color: '#fff', fontSize: '14px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {done ? '✓' : ''}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pro Tip */}
                    {plan.proTip && (
                        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>💡</span>
                            <div>
                                <div style={{ fontSize: '12px', color: '#fcd34d', fontWeight: 700, marginBottom: '4px' }}>PRO TIP FOR TODAY</div>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.6 }}>{plan.proTip}</p>
                            </div>
                        </div>
                    )}

                    {/* Refresh */}
                    <button onClick={fetchProgressAndPlan} style={{
                        marginTop: '24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.5)', borderRadius: '10px', padding: '10px 20px',
                        cursor: 'pointer', fontSize: '13px', width: '100%', transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    >
                        🔄 Regenerate Today's Plan
                    </button>
                </>
            )}
        </div>
    );
}
