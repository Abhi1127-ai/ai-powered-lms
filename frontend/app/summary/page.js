'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI, dashboardAPI } from '../lib/api';
import { useRouter } from 'next/navigation';

const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Science'];

export default function SummaryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subject, setSubject] = useState('Physics');
  const [chapters, setChapters] = useState([]);
  const [chapter, setChapter] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && subject) {
      dashboardAPI.getChapters(subject).then((data) => {
        setChapters(data.chapters || []);
        setChapter(data.chapters?.[0] || '');
      }).catch(console.error);
    }
  }, [subject, user]);

  const handleGenerate = async () => {
    if (!chapter || loading) return;
    setLoading(true);
    setSummary('');
    try {
      const data = await aiAPI.getSummary(chapter, subject);
      setSummary(data.summary);
    } catch (err) {
      setSummary(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div style={{ padding: '40px 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
          📝 <span className="gradient-text">One-Page Summary</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginBottom: '28px' }}>
          Convert entire chapters into quick revision notes instantly
        </p>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' }}>
              Subject
            </label>
            <select
              className="input-field"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {subjects.map((s) => (
                <option key={s} value={s} style={{ background: '#1a1a2e' }}>{s}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '2 1 300px' }}>
            <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' }}>
              Chapter
            </label>
            <select
              className="input-field"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {chapters.map((c) => (
                <option key={c} value={c} style={{ background: '#1a1a2e' }}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          className="btn-primary"
          disabled={loading || !chapter}
          style={{ width: '100%', padding: '14px', fontSize: '16px' }}
        >
          {loading ? '⏳ Generating Summary...' : '✨ Generate One-Page Summary'}
        </button>
      </div>

      {/* Summary Output */}
      {(summary || loading) && (
        <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'flicker 1s infinite' }}>📝</div>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>AI is writing your summary...</p>
            </div>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '15px' }}>
              {summary}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
