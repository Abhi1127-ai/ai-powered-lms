'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../lib/api';
import { useRouter } from 'next/navigation';

const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Science', 'English'];

export default function GradePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subject, setSubject] = useState('Physics');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [maxMarks, setMaxMarks] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const handleGrade = async () => {
    if (!question.trim() || !answer.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await aiAPI.gradeAnswer(question, answer, subject, maxMarks);
      setResult(data.result);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  const scorePercent = result ? (result.score / result.maxMarks) * 100 : 0;

  return (
    <div style={{ padding: '40px 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
          ✅ <span className="gradient-text">Board Examiner Mode</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginBottom: '28px' }}>
          AI grades your answers like a real board examiner — with marks & feedback
        </p>
      </div>

      {/* Input Card */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' }}>Subject</label>
            <select className="input-field" value={subject} onChange={(e) => setSubject(e.target.value)} style={{ cursor: 'pointer' }}>
              {subjects.map((s) => <option key={s} value={s} style={{ background: '#1a1a2e' }}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: '0 0 120px' }}>
            <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' }}>Max Marks</label>
            <select className="input-field" value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value))} style={{ cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5, 6, 8, 10].map((m) => <option key={m} value={m} style={{ background: '#1a1a2e' }}>{m} marks</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' }}>Question</label>
          <textarea
            className="input-field"
            placeholder="Paste the board exam question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' }}>Your Answer</label>
          <textarea
            className="input-field"
            placeholder="Write your answer here, as you would in the exam..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            style={{ resize: 'vertical' }}
          />
        </div>
        <button onClick={handleGrade} className="btn-primary" disabled={loading || !question.trim() || !answer.trim()} style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
          {loading ? '⏳ AI is grading...' : '📝 Grade My Answer'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
          {/* Score */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-block',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: `conic-gradient(${scorePercent >= 70 ? '#10b981' : scorePercent >= 40 ? '#f59e0b' : '#ef4444'} ${scorePercent * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#0a0a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 800,
                position: 'absolute',
              }}>
                {result.score}/{result.maxMarks}
              </div>
            </div>
            <p style={{ marginTop: '12px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              {scorePercent >= 70 ? '🎉 Excellent!' : scorePercent >= 40 ? '👍 Good effort!' : '💪 Need more practice'}
            </p>
          </div>

          {/* Correct Points */}
          {result.correct?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: '#10b981' }}>
                ✅ Points Covered Correctly
              </h3>
              {result.correct.map((p, i) => (
                <div key={i} style={{
                  padding: '8px 14px',
                  background: 'rgba(16,185,129,0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '6px',
                  color: 'rgba(255,255,255,0.8)',
                }}>
                  {p}
                </div>
              ))}
            </div>
          )}

          {/* Missing Points */}
          {result.missing?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: '#ef4444' }}>
                ❌ Points Missing / Incorrect
              </h3>
              {result.missing.map((p, i) => (
                <div key={i} style={{
                  padding: '8px 14px',
                  background: 'rgba(239,68,68,0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '6px',
                  color: 'rgba(255,255,255,0.8)',
                }}>
                  {p}
                </div>
              ))}
            </div>
          )}

          {/* Model Answer */}
          {result.modelAnswer && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: '#8b5cf6' }}>
                📝 Model Answer
              </h3>
              <div style={{
                padding: '16px',
                background: 'rgba(139,92,246,0.08)',
                borderRadius: '10px',
                fontSize: '14px',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.8)',
                whiteSpace: 'pre-wrap',
              }}>
                {result.modelAnswer}
              </div>
            </div>
          )}

          {/* Tips */}
          {result.tips && (
            <div style={{
              padding: '16px',
              background: 'rgba(245,158,11,0.1)',
              borderRadius: '10px',
              borderLeft: '3px solid #f59e0b',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: '#f59e0b' }}>
                💡 Improvement Tips
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                {result.tips}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
