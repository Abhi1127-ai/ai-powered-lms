'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { resourcesAPI } from '../lib/api';
import { useRouter } from 'next/navigation';

const tabs = [
  { id: 'pyqs', label: '📋 PYQs', icon: '📋' },
  { id: 'notes', label: '📝 Notes', icon: '📝' },
  { id: 'videos', label: '🎥 Videos', icon: '🎥' },
];

export default function ResourcesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('pyqs');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetcher = tab === 'pyqs' ? resourcesAPI.getPYQs : tab === 'notes' ? resourcesAPI.getNotes : resourcesAPI.getVideos;
    fetcher()
      .then((data) => setItems(data.pyqs || data.notes || data.videos || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab, user, seeded]);

  const handleSeed = async () => {
    try {
      await resourcesAPI.seed();
      setSeeded(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) return null;

  return (
    <div style={{ padding: '40px 24px 80px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="animate-fade-in" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
          📚 <span className="gradient-text">Resource Vault</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
          PYQs, notes, and curated videos — everything you need
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: tab === t.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
              color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '100px' }}></div>)}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
            No resources found. Seed sample data to get started!
          </p>
          <button onClick={handleSeed} className="btn-primary" style={{ padding: '12px 28px' }}>
            🌱 Seed Sample Resources
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {items.map((item, i) => (
            <div key={i} className="glass-card animate-fade-in" style={{
              padding: '20px 24px',
              animationDelay: `${i * 0.05}s`,
              animationFillMode: 'backwards',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: tab === 'pyqs' ? 'rgba(99,102,241,0.2)' : tab === 'notes' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                      color: tab === 'pyqs' ? '#a5b4fc' : tab === 'notes' ? '#6ee7b7' : '#fca5a5',
                    }}>
                      {item.subject}
                    </span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                      {item.chapter}
                    </span>
                    {item.year && (
                      <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                        {item.year}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                    {item.title}
                  </h3>
                  {item.content && (
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                      {item.content}
                    </p>
                  )}
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ padding: '8px 18px', fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    ▶ Watch
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
