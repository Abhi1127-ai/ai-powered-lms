'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../lib/api';
import { useRouter } from 'next/navigation';

const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Science', 'English'];

export default function DoubtPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subject, setSubject] = useState('Physics');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setLoading(true);

    try {
      const data = await aiAPI.askDoubt(question, subject);
      setMessages((prev) => [...prev, { role: 'ai', text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', text: `❌ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '24px',
    }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>
          🤖 <span className="gradient-text">Doubt Destroyer</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginTop: '4px' }}>
          Ask anything — get answers in Hinglish, like a real tutor!
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: subject === s ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.08)',
                color: subject === s ? '#fff' : 'rgba(255,255,255,0.6)',
                transition: 'all 0.2s',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="glass-card" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        marginBottom: '16px',
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.3)',
            paddingTop: '60px',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
            <p style={{ fontSize: '16px' }}>Ask your first doubt!</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>
              Try: &quot;Ohm ka law kya hai?&quot; or &quot;Explain integration by parts&quot;
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble-ai">
            <span style={{ display: 'inline-block', animation: 'flicker 1s infinite' }}>🤔 Thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          className="input-field"
          placeholder={`Ask a ${subject} doubt...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button
          onClick={handleSend}
          className="btn-primary"
          disabled={loading || !input.trim()}
          style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}
        >
          {loading ? '⏳' : '🚀 Ask'}
        </button>
      </div>
    </div>
  );
}
