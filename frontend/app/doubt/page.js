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

  // ── Voice state ────────────────────────────────────────────────────────────
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) setVoiceSupported(true);
  }, []);

  // ── Voice handler ──────────────────────────────────────────────────────────
  const toggleVoice = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  if (listening) {
    recognitionRef.current?.stop();
    setListening(false);
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';        // en-IN works better than hi-IN for Hinglish
  recognition.interimResults = true; // show partial results while speaking
  recognition.continuous = true;     // don't stop after first pause
  recognition.maxAlternatives = 1;

  let finalTranscript = '';

  recognition.onstart = () => {
    setListening(true);
    finalTranscript = '';
  };

  recognition.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) {
        finalTranscript += e.results[i][0].transcript;
      } else {
        interim += e.results[i][0].transcript;
      }
    }
    // Show live transcript in input box while speaking
    setInput(finalTranscript + interim);
  };

  recognition.onerror = (e) => {
    console.log('Speech error:', e.error);
    setListening(false);
  };

  recognition.onend = () => {
    setListening(false);
    // Auto-send only if we got something
    if (finalTranscript.trim()) {
      handleSendText(finalTranscript.trim());
    }
  };

  recognitionRef.current = recognition;
  recognition.start();
};

  // ── Send (accepts optional text override for voice) ────────────────────────
  const handleSendText = async (text) => {
    const question = (text || input).trim();
    if (!question || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setLoading(true);

    try {
      const data = await aiAPI.askDoubt(question, subject);
      setMessages((prev) => [...prev, { role: 'ai', text: data.answer }]);

      // Award badge for first doubt
      awardBadge('first_doubt');
      if (messages.length >= 9) awardBadge('curious_mind'); // 5 doubts
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', text: `❌ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => handleSendText(input);

  // ── Badge award (fire and forget) ─────────────────────────────────────────
  const awardBadge = async (badgeId) => {
    try {
      const token = localStorage.getItem('lms_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/badges/award`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ badgeId }),
      });
    } catch (_) {}
  };

  if (authLoading) return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      maxWidth: '900px', margin: '0 auto', padding: '24px',
    }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>
          🤖 <span className="gradient-text">Doubt Destroyer</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginTop: '4px' }}>
          Ask anything — get answers in Hinglish, like a real tutor!
          {voiceSupported && (
            <span style={{ marginLeft: '10px', color: '#a5b4fc', fontSize: '13px' }}>
              🎙️ Voice mode supported
            </span>
          )}
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
          {subjects.map((s) => (
            <button key={s} onClick={() => setSubject(s)} style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer', border: 'none',
              background: subject === s ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.08)',
              color: subject === s ? '#fff' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s',
            }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="glass-card" style={{
        flex: 1, overflowY: 'auto', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', paddingTop: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
            <p style={{ fontSize: '16px' }}>Ask your first doubt!</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>
              Try: &quot;Ohm ka law kya hai?&quot; or &quot;Explain integration by parts&quot;
            </p>
            {voiceSupported && (
              <p style={{ fontSize: '13px', marginTop: '6px', color: '#a5b4fc' }}>
                🎙️ Or press the mic button and speak your doubt!
              </p>
            )}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{ whiteSpace: 'pre-wrap' }}>
            {msg.role === 'user' && msg.voice && (
              <span style={{ fontSize: '11px', opacity: 0.6, marginRight: '6px' }}>🎙️</span>
            )}
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

      {/* Input Row */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          className="input-field"
          placeholder={listening ? '🎙️ Listening... speak now' : `Ask a ${subject} doubt...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading || listening}
          style={{
            flex: 1,
            border: listening ? '1.5px solid #ef4444' : undefined,
            transition: 'border 0.2s',
          }}
        />

        {/* Mic Button */}
        {voiceSupported && (
          <button
            onClick={toggleVoice}
            disabled={loading}
            title={listening ? 'Stop listening' : 'Speak your doubt'}
            style={{
              width: '46px', height: '46px', borderRadius: '12px', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: listening
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'rgba(255,255,255,0.08)',
              color: '#fff', fontSize: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: listening ? '0 0 16px rgba(239,68,68,0.5)' : 'none',
              animation: listening ? 'pulse 1s ease-in-out infinite' : 'none',
            }}
          >
            {listening ? '⏹️' : '🎙️'}
          </button>
        )}

        <button
          onClick={handleSend}
          className="btn-primary"
          disabled={loading || !input.trim() || listening}
          style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}
        >
          {loading ? '⏳' : '🚀 Ask'}
        </button>
      </div>

      {/* Listening indicator */}
      {listening && (
        <div style={{
          marginTop: '10px', textAlign: 'center',
          color: '#ef4444', fontSize: '13px', fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s ease-in-out infinite' }} />
          Listening... speak your doubt in Hindi or English
          <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.1)}}`}</style>
        </div>
      )}
    </div>
  );
}
