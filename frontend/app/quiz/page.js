'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI, dashboardAPI } from '../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Science'];

function QuizContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subject, setSubject] = useState(searchParams.get('subject') || 'Physics');
  const [topic, setTopic] = useState('');
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && subject) {
      dashboardAPI.getChapters(subject).then((data) => {
        setChapters(data.chapters || []);
        setTopic(data.chapters?.[0] || '');
      }).catch(console.error);
    }
  }, [subject, user]);

  const handleGenerate = async () => {
    if (!topic || loading) return;
    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    try {
      const data = await aiAPI.generateQuiz(topic, subject, 5);
      setQuestions(data.questions || []);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  if (authLoading) return null;

  return (
    <div style={{ padding: '40px 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
          🎯 <span className="gradient-text">Mock Test Generator</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginBottom: '28px' }}>
          AI-generated board exam level quizzes — test yourself instantly!
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
              Topic / Chapter
            </label>
            <select
              className="input-field"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
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
          disabled={loading || !topic}
          style={{ width: '100%', padding: '14px', fontSize: '16px' }}
        >
          {loading ? '⏳ Generating Quiz...' : '🎲 Generate Quiz (5 MCQs)'}
        </button>
      </div>

      {/* Questions */}
      {questions.length > 0 && (
        <div>
          {questions.map((q, qi) => (
            <div key={qi} className="glass-card animate-fade-in" style={{
              padding: '24px',
              marginBottom: '16px',
              animationDelay: `${qi * 0.1}s`,
              animationFillMode: 'backwards',
              borderLeft: submitted
                ? answers[qi] === q.correct
                  ? '3px solid #10b981'
                  : '3px solid #ef4444'
                : '3px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>
                <span style={{ color: '#8b5cf6' }}>Q{qi + 1}.</span> {q.question}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {q.options.map((opt, oi) => {
                  let bg = 'rgba(255,255,255,0.04)';
                  let border = 'rgba(255,255,255,0.08)';
                  if (submitted) {
                    if (oi === q.correct) { bg = 'rgba(16,185,129,0.15)'; border = '#10b981'; }
                    else if (oi === answers[qi] && oi !== q.correct) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; }
                  } else if (answers[qi] === oi) {
                    bg = 'rgba(99,102,241,0.2)'; border = '#6366f1';
                  }
                  return (
                    <button
                      key={oi}
                      onClick={() => !submitted && setAnswers({ ...answers, [qi]: oi })}
                      disabled={submitted}
                      style={{
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: '10px',
                        padding: '12px 16px',
                        color: 'white',
                        textAlign: 'left',
                        cursor: submitted ? 'default' : 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && q.explanation && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  background: 'rgba(139,92,246,0.1)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.7)',
                }}>
                  💡 {q.explanation}
                </div>
              )}
            </div>
          ))}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="btn-primary"
              disabled={Object.keys(answers).length !== questions.length}
              style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '8px' }}
            >
              ✅ Submit Answers
            </button>
          ) : (
            <div className="glass-card" style={{
              padding: '32px',
              textAlign: 'center',
              marginTop: '8px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {score === questions.length ? '🏆' : score >= questions.length / 2 ? '👍' : '💪'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800 }}>
                <span className="gradient-text">{score}/{questions.length}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                {score === questions.length ? 'Perfect! Board topper in the making!' :
                 score >= questions.length / 2 ? 'Good job! Keep practicing!' : 'Revise this topic and try again!'}
              </p>
              <button
                onClick={handleGenerate}
                className="btn-secondary"
                style={{ marginTop: '20px', padding: '10px 28px' }}
              >
                🔄 Try Another Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px 24px', textAlign: 'center' }}>Loading...</div>}>
      <QuizContent />
    </Suspense>
  );
}
