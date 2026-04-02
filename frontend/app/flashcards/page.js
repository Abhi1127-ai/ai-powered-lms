'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI, dashboardAPI } from '../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FlashcardsPage() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  const [subjects, setSubjects] = useState([]);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user) {
      dashboardAPI.getProgress().then(data => setSubjects(data.subjects || []));
    }
  }, [user, authLoading, router]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject || !topic) return setError('Please select subject and enter topic');
    
    setLoading(true);
    setError('');
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);

    try {
      const res = await aiAPI.generateFlashcards(topic, subject);
      setCards(res.cards || []);
    } catch (err) {
      setError(err.message || 'Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div style={{ padding: '40px 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '12px' }}>
          🗂️ AI <span className="gradient-text">Flashcards</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '16px' }}>
          Master key concepts with AI-generated active recall cards.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '32px', marginBottom: '40px' }}>
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            className="input-field" 
            style={{ flex: 1, minWidth: '150px' }}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input 
            type="text" 
            className="input-field" 
            style={{ flex: 2, minWidth: '250px' }}
            placeholder="Enter chapter or topic (e.g. 'Photosynthesis' or 'Integrals')"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Generating...' : '✨ Generate'}
          </button>
        </form>
        {error && <p style={{ color: '#fca5a5', fontSize: '14px', marginTop: '12px', textAlign: 'center' }}>{error}</p>}
      </div>

      {cards.length > 0 ? (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span style={{ fontSize: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', padding: '4px 12px', borderRadius: '20px' }}>
              Click to Flip
            </span>
          </div>

          <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <div style={{ fontSize: '14px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '20px' }}>
                  Front
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.4 }}>{cards[currentIndex].front}</h3>
              </div>
              <div className="flip-card-back">
                <div style={{ fontSize: '14px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: '20px' }}>
                  Back
                </div>
                <p style={{ fontSize: '20px', fontWeight: 500, lineHeight: 1.6 }}>{cards[currentIndex].back}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
            <button className="btn-secondary" onClick={prevCard} style={{ borderRadius: '50%', width: '60px', height: '60px', padding: 0, fontSize: '24px' }}>
              ←
            </button>
            <button className="btn-primary" onClick={nextCard} style={{ borderRadius: '50%', width: '60px', height: '60px', padding: 0, fontSize: '24px' }}>
              →
            </button>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
             <button className="btn-secondary" onClick={() => { setCards([]); setTopic(''); }} style={{ fontSize: '14px' }}>
                Create New Set
             </button>
          </div>
        </div>
      ) : (
        !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🧠</div>
            <p>Enter a topic above to generate AI study cards.</p>
          </div>
        )
      )}
    </div>
  );
}
