'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../lib/api';
import { useRouter } from 'next/navigation';

const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Science', 'English'];
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ── Compact Image Upload Button ───────────────────────────────────────────────
function ImageUploadBox({ label, image, onImage, onClear, scanning }) {
  const inputRef = useRef();

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => onImage(e.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      {!image ? (
        <>
          <button
            onClick={() => inputRef.current.click()}
            style={{
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.4)',
              color: '#a5b4fc', borderRadius: '8px', padding: '3px 12px',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '5px',
            }}
          >
            📷 Upload Image
          </button>
          <input
            ref={inputRef} type="file" accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </>
      ) : (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          {scanning ? (
            <span style={{ fontSize: '12px', color: '#a5b4fc', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>🔍</span>
              Scanning...
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </span>
          ) : (
            <span style={{ fontSize: '12px', color: '#10b981' }}>✅ Image scanned</span>
          )}
          <button
            onClick={onClear}
            style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', borderRadius: '6px', padding: '2px 8px',
              fontSize: '11px', cursor: 'pointer',
            }}
          >
            ✕ Remove
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GradePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [subject, setSubject] = useState('Physics');
  const [maxMarks, setMaxMarks] = useState(5);

  const [question, setQuestion] = useState('');
  const [questionImage, setQuestionImage] = useState(null);
  const [scanningQuestion, setScanningQuestion] = useState(false);

  const [answer, setAnswer] = useState('');
  const [answerImage, setAnswerImage] = useState(null);
  const [scanningAnswer, setScanningAnswer] = useState(false);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  async function scanImage(base64, field) {
    const setter = field === 'question' ? setScanningQuestion : setScanningAnswer;
    const textSetter = field === 'question' ? setQuestion : setAnswer;
    setter(true);
    try {
      const token = localStorage.getItem('lms_token');
      const res = await fetch(`${API_URL}/ai/scan-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image: base64, field }),
      });
      const data = await res.json();
      if (res.ok && data.text) {
        textSetter((prev) => prev ? prev + '\n' + data.text : data.text);
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setter(false);
    }
  }

  function handleQuestionImage(base64) {
    setQuestionImage(base64);
    scanImage(base64, 'question');
  }

  function handleAnswerImage(base64) {
    setAnswerImage(base64);
    scanImage(base64, 'answer');
  }

  const handleGrade = async () => {
    if ((!question.trim() && !questionImage) || (!answer.trim() && !answerImage) || loading) return;
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
  const canGrade = (question.trim() || questionImage) && (answer.trim() || answerImage) && !loading;

  return (
    <div style={{ padding: '40px 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
          ✅ <span className="gradient-text">Board Examiner Mode</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginBottom: '28px' }}>
          AI grades your answers like a real board examiner — type or upload an image
        </p>
      </div>

      {/* Input Card */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>

        {/* Subject + Marks */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '22px', flexWrap: 'wrap' }}>
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

        {/* Question Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Question
            <ImageUploadBox
              label="Question"
              image={questionImage}
              onImage={handleQuestionImage}
              onClear={() => { setQuestionImage(null); }}
              scanning={scanningQuestion}
            />
          </label>
          <textarea
            className="input-field"
            placeholder={scanningQuestion ? 'Scanning image, text will appear here...' : 'Paste or type the board exam question here...'}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            style={{ resize: 'vertical', opacity: scanningQuestion ? 0.5 : 1 }}
          />
        </div>

        {/* Answer Field */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Your Answer
            <ImageUploadBox
              label="Answer"
              image={answerImage}
              onImage={handleAnswerImage}
              onClear={() => { setAnswerImage(null); }}
              scanning={scanningAnswer}
            />
          </label>
          <textarea
            className="input-field"
            placeholder={scanningAnswer ? 'Scanning image, text will appear here...' : 'Write your answer here, as you would in the exam...'}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            style={{ resize: 'vertical', opacity: scanningAnswer ? 0.5 : 1 }}
          />
        </div>

        <button
          onClick={handleGrade}
          className="btn-primary"
          disabled={!canGrade}
          style={{ width: '100%', padding: '14px', fontSize: '16px' }}
        >
          {loading ? '⏳ AI is grading...' : '📝 Grade My Answer'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
          {/* Score Circle */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '100px', height: '100px', borderRadius: '50%', position: 'relative',
              background: `conic-gradient(${scorePercent >= 70 ? '#10b981' : scorePercent >= 40 ? '#f59e0b' : '#ef4444'} ${scorePercent * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', background: '#0a0a1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: 800, position: 'absolute',
              }}>
                {result.score}/{result.maxMarks}
              </div>
            </div>
            <p style={{ marginTop: '12px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              {scorePercent >= 70 ? '🎉 Excellent!' : scorePercent >= 40 ? '👍 Good effort!' : '💪 Need more practice'}
            </p>
          </div>

          {result.correct?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: '#10b981' }}>✅ Points Covered Correctly</h3>
              {result.correct.map((p, i) => (
                <div key={i} style={{ padding: '8px 14px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', fontSize: '14px', marginBottom: '6px', color: 'rgba(255,255,255,0.8)' }}>{p}</div>
              ))}
            </div>
          )}

          {result.missing?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: '#ef4444' }}>❌ Points Missing / Incorrect</h3>
              {result.missing.map((p, i) => (
                <div key={i} style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', fontSize: '14px', marginBottom: '6px', color: 'rgba(255,255,255,0.8)' }}>{p}</div>
              ))}
            </div>
          )}

          {result.modelAnswer && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: '#8b5cf6' }}>📝 Model Answer</h3>
              <div style={{ padding: '16px', background: 'rgba(139,92,246,0.08)', borderRadius: '10px', fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap' }}>
                {result.modelAnswer}
              </div>
            </div>
          )}

          {result.tips && (
            <div style={{ padding: '16px', background: 'rgba(245,158,11,0.1)', borderRadius: '10px', borderLeft: '3px solid #f59e0b' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: '#f59e0b' }}>💡 Improvement Tips</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{result.tips}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}