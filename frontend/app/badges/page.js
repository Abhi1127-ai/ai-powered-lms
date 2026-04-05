'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function BadgeCard({ badge, locked }) {
    return (
        <div
            style={{
                background: locked ? 'rgba(255,255,255,0.03)' : `${badge.color}18`,
                border: `1px solid ${locked ? 'rgba(255,255,255,0.08)' : badge.color + '44'}`,
                borderRadius: '14px', padding: '20px 16px', textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                filter: locked ? 'grayscale(1)' : 'none',
                opacity: locked ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!locked) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${badge.color}33`; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            <div style={{ fontSize: '2.4rem', marginBottom: '10px' }}>
                {locked ? '🔒' : badge.icon}
            </div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: locked ? 'rgba(255,255,255,0.3)' : '#f1f5f9', marginBottom: '6px' }}>
                {badge.name}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
                {badge.description}
            </div>
            {badge.earned && badge.earnedAt && (
                <div style={{ fontSize: '10px', color: badge.color, marginTop: '8px', fontWeight: 600 }}>
                    ✓ {new Date(badge.earnedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
            )}
        </div>
    );
}

export default function BadgesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [badges, setBadges] = useState([]);
    const [totalEarned, setTotalEarned] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;
        fetchBadges();
    }, [user]);

    async function fetchBadges() {
        try {
            const token = localStorage.getItem('lms_token');
            const res = await fetch(`${API_URL}/badges/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setBadges(data.badges || []);
            setTotalEarned(data.totalEarned || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (authLoading || loading) return null;

    const earned = badges.filter((b) => b.earned);
    const locked = badges.filter((b) => !b.earned);

    return (
        <div style={{ padding: '40px 24px 80px', maxWidth: '900px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
                    🏅 <span className="gradient-text">Badges & Achievements</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
                    Earn badges by using different features of BoardPrep AI
                </p>

                {/* Progress bar */}
                <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                            {totalEarned} / {badges.length} badges earned
                        </span>
                        <span style={{ fontSize: '13px', color: '#a78bfa', fontWeight: 600 }}>
                            {badges.length ? Math.round((totalEarned / badges.length) * 100) : 0}%
                        </span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: '999px',
                            width: badges.length ? `${(totalEarned / badges.length) * 100}%` : '0%',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            transition: 'width 0.8s ease',
                        }} />
                    </div>
                </div>
            </div>

            {/* Earned */}
            {earned.length > 0 && (
                <div style={{ marginBottom: '36px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#a78bfa', marginBottom: '16px' }}>
                        ✨ Earned ({earned.length})
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
                        {earned.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
                    </div>
                </div>
            )}

            {/* Locked */}
            {locked.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
                        🔒 Locked ({locked.length})
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
                        {locked.map((badge) => <BadgeCard key={badge.id} badge={badge} locked />)}
                    </div>
                </div>
            )}

            {badges.length > 0 && totalEarned === badges.length && (
                <div style={{
                    marginTop: '32px', textAlign: 'center', padding: '32px',
                    background: 'rgba(99,102,241,0.1)', borderRadius: '16px',
                    border: '1px solid rgba(99,102,241,0.3)',
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#a78bfa' }}>All Badges Earned!</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>You are a true BoardPrep Champion!</p>
                </div>
            )}
        </div>
    );
}
