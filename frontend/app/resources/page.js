'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

// ─── Subject/Unit Data ────────────────────────────────────────────────────────
const SUBJECTS_DATA = {
  Physics: {
    icon: '⚡', color: '#6366f1', text: '#a5b4fc', bg: 'rgba(99,102,241,0.15)',
    units: [
      'Electric Charges and Fields', 'Electrostatic Potential and Capacitance',
      'Current Electricity', 'Moving Charges and Magnetism', 'Magnetism and Matter',
      'Electromagnetic Induction', 'Alternating Current', 'Electromagnetic Waves',
      'Ray Optics and Optical Instruments', 'Wave Optics',
      'Dual Nature of Radiation and Matter', 'Atoms', 'Nuclei',
      'Semiconductor Electronics',
    ],
  },
  Chemistry: {
    icon: '🧪', color: '#10b981', text: '#6ee7b7', bg: 'rgba(16,185,129,0.15)',
    units: [
      'The Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics',
      'Surface Chemistry', 'General Principles of Isolation of Elements',
      'The p-Block Elements', 'The d- and f-Block Elements', 'Coordination Compounds',
      'Haloalkanes and Haloarenes', 'Alcohols, Phenols and Ethers',
      'Aldehydes, Ketones and Carboxylic Acids', 'Amines', 'Biomolecules',
    ],
  },
  Mathematics: {
    icon: '📐', color: '#f59e0b', text: '#fcd34d', bg: 'rgba(245,158,11,0.15)',
    units: [
      'Relations and Functions', 'Inverse Trigonometric Functions', 'Matrices',
      'Determinants', 'Continuity and Differentiability', 'Application of Derivatives',
      'Integrals', 'Application of Integrals', 'Differential Equations',
      'Vector Algebra', 'Three Dimensional Geometry', 'Linear Programming', 'Probability',
    ],
  },
  Biology: {
    icon: '🌿', color: '#ec4899', text: '#f9a8d4', bg: 'rgba(236,72,153,0.15)',
    units: [
      'Reproduction in Organisms', 'Sexual Reproduction in Flowering Plants',
      'Human Reproduction', 'Reproductive Health',
      'Principles of Inheritance and Variation', 'Molecular Basis of Inheritance',
      'Evolution', 'Human Health and Disease',
      'Strategies for Enhancement in Food Production', 'Microbes in Human Welfare',
      'Biotechnology — Principles and Processes', 'Biotechnology and its Applications',
      'Organisms and Populations', 'Ecosystem', 'Biodiversity and Conservation',
    ],
  },
  English: {
    icon: '📖', color: '#8b5cf6', text: '#c4b5fd', bg: 'rgba(139,92,246,0.15)',
    units: [
      'The Last Lesson', 'Lost Spring', 'Deep Water', 'The Rattrap', 'Indigo',
      'Poets and Pancakes', 'The Interview', 'Going Places',
      'My Mother at Sixty-six', 'An Elementary School Classroom in a Slum',
      'Keeping Quiet', 'A Thing of Beauty', 'A Roadside Stand',
      "Aunt Jennifer's Tigers", 'Grammar & Writing Skills',
    ],
  },
};

const TABS = [
  { id: 'pyqs', label: '📋 PYQs' },
  { id: 'videos', label: '🎥 Videos' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResourcesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState('pyqs');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // PYQ state
  const [pyqs, setPyqs] = useState([]);
  const [pyqLoading, setPyqLoading] = useState(false);
  const [pyqError, setPyqError] = useState('');

  // Video state
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  function goBack() {
    if (selectedUnit) { setSelectedUnit(null); setPyqs([]); setPyqError(''); setVideoError(''); return; }
    if (selectedSubject) { setSelectedSubject(null); return; }
  }

  // ── PYQ Generation ──────────────────────────────────────────────────────────
  async function loadPYQs(subject, unit) {
    setPyqLoading(true);
    setPyqError('');
    setPyqs([]);
    try {
      const token = localStorage.getItem('lms_token');
      const res = await fetch(`${API_URL}/notes/pyqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, unit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate PYQs');
      setPyqs(data.pyqs);
    } catch (err) {
      setPyqError(err.message);
    } finally {
      setPyqLoading(false);
    }
  }

  // ── Video Opening ───────────────────────────────────────────────────────────
  async function openVideo(subject, unit) {
    setVideoLoading(true);
    setVideoError('');
    try {
      const token = localStorage.getItem('lms_token');
      const res = await fetch(`${API_URL}/notes/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, unit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to get video');
      window.open(data.url, '_blank');
    } catch (err) {
      setVideoError(err.message);
    } finally {
      setVideoLoading(false);
    }
  }

  function handleUnitClick(unit) {
    setSelectedUnit(unit);
    if (tab === 'pyqs') loadPYQs(selectedSubject, unit);
    if (tab === 'videos') openVideo(selectedSubject, unit);
  }

  function handleTabChange(newTab) {
    setTab(newTab);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setPyqs([]);
    setPyqError('');
    setVideoError('');
  }

  if (authLoading) return null;

  const col = selectedSubject ? SUBJECTS_DATA[selectedSubject] : null;

  // breadcrumb
  const crumbs = ['Resources'];
  if (selectedSubject) crumbs.push(selectedSubject);
  if (selectedUnit) crumbs.push(selectedUnit);

  return (
    <div style={{ padding: '40px 24px 80px', maxWidth: '1040px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
          📚 <span className="gradient-text">Resource Vault</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
          Subject-wise PYQs and curated videos for board exam prep
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => handleTabChange(t.id)} style={{
            padding: '10px 24px', borderRadius: '12px', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer', border: 'none',
            background: tab === t.id ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.06)',
            color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.5)',
            transition: 'all 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Breadcrumb + Back */}
      {crumbs.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          <button onClick={goBack} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8', borderRadius: '8px', padding: '0.3rem 0.8rem',
            cursor: 'pointer', fontSize: '0.85rem',
          }}>
            ← Back
          </button>
          {crumbs.map((c, i) => (
            <span key={i} style={{ color: i === crumbs.length - 1 ? '#a78bfa' : '#475569', fontSize: '0.9rem' }}>
              {i > 0 && <span style={{ marginRight: '0.5rem', color: '#334155' }}>/</span>}
              {c}
            </span>
          ))}
        </div>
      )}

      {/* ── STEP 1: Subject Grid ─────────────────────────────────────────────── */}
      {!selectedSubject && (
        <div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '16px' }}>
            Select a subject to continue
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
            {Object.entries(SUBJECTS_DATA).map(([subj, data]) => (
              <div
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                style={{
                  background: data.bg, border: `1px solid ${data.color}44`,
                  borderRadius: '14px', padding: '24px 16px', cursor: 'pointer',
                  textAlign: 'center', transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${data.color}33`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{data.icon}</div>
                <div style={{ fontWeight: 700, color: data.text, fontSize: '15px' }}>{subj}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                  {data.units.length} chapters
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Units List ───────────────────────────────────────────────── */}
      {selectedSubject && !selectedUnit && (
        <div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '16px' }}>
            {tab === 'pyqs' ? '🤖 Click a chapter to generate AI-powered PYQ questions' : '▶ Click a chapter to open the best YouTube video for it'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {col.units.map((unit, idx) => (
              <div
                key={unit}
                onClick={() => handleUnitClick(unit)}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: `1px solid ${col.color}33`,
                  borderRadius: '12px', padding: '14px 20px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = col.bg; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    background: col.bg, color: col.text, borderRadius: '6px',
                    padding: '2px 8px', fontSize: '12px', fontWeight: 700, minWidth: '28px', textAlign: 'center',
                  }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '14px' }}>{unit}</span>
                </div>
                <span style={{ color: col.text, fontSize: '13px' }}>
                  {tab === 'pyqs' ? '🤖 Generate PYQs ›' : '▶ Watch ›'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 3a: PYQs ───────────────────────────────────────────────────── */}
      {selectedUnit && tab === 'pyqs' && (
        <div>
          {/* Chapter header */}
          <div style={{
            background: col.bg, border: `1px solid ${col.color}44`,
            borderRadius: '12px', padding: '16px 20px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '1.6rem' }}>{col.icon}</span>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{selectedSubject}</div>
              <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{selectedUnit}</div>
            </div>
            <span style={{
              marginLeft: 'auto', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', borderRadius: '6px', padding: '3px 10px', fontSize: '12px',
            }}>
              🤖 AI Generated PYQs
            </span>
          </div>

          {/* Loading */}
          {pyqLoading && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'inline-block', animation: 'spin 1s linear infinite' }}>🔄</div>
              <p style={{ color: '#94a3b8' }}>Generating board-exam style questions...</p>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error */}
          {pyqError && (
            <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: '10px', padding: '1rem 1.5rem', color: '#fca5a5' }}>
              ❌ {pyqError}
              <button onClick={() => loadPYQs(selectedSubject, selectedUnit)} style={{ marginLeft: '1rem', background: '#991b1b', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' }}>
                Retry
              </button>
            </div>
          )}

          {/* PYQ Cards */}
          {!pyqLoading && pyqs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pyqs.map((q, i) => (
                <PYQCard key={i} q={q} index={i} col={col} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3b: Video Loading/Error ─────────────────────────────────────── */}
      {selectedUnit && tab === 'videos' && (
        <div>
          <div style={{
            background: col.bg, border: `1px solid ${col.color}44`,
            borderRadius: '12px', padding: '16px 20px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '1.6rem' }}>{col.icon}</span>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{selectedSubject}</div>
              <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{selectedUnit}</div>
            </div>
          </div>

          {videoLoading && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'inline-block', animation: 'spin 1s linear infinite' }}>🔄</div>
              <p style={{ color: '#94a3b8' }}>Finding best video for this chapter...</p>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {videoError && (
            <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: '10px', padding: '1rem 1.5rem', color: '#fca5a5' }}>
              ❌ {videoError}
              <button onClick={() => openVideo(selectedSubject, selectedUnit)} style={{ marginLeft: '1rem', background: '#991b1b', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' }}>
                Retry
              </button>
            </div>
          )}

          {!videoLoading && !videoError && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>YouTube opened in a new tab!</p>
              <button
                onClick={() => openVideo(selectedSubject, selectedUnit)}
                style={{
                  background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: 'none',
                  color: '#fff', borderRadius: '10px', padding: '10px 24px',
                  fontWeight: 700, cursor: 'pointer', fontSize: '14px',
                }}
              >
                ▶ Open Again
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// ─── PYQ Card Component ───────────────────────────────────────────────────────
function PYQCard({ q, index, col }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const yearColors = ['#f59e0b', '#6366f1', '#10b981', '#ec4899', '#8b5cf6'];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: `1px solid ${col.color}33`,
      borderRadius: '14px', overflow: 'hidden', borderLeft: `3px solid ${col.color}`,
    }}>
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{
            background: col.bg, color: col.text,
            borderRadius: '6px', padding: '2px 10px', fontSize: '12px', fontWeight: 700,
          }}>
            Q{index + 1}
          </span>
          {q.section && (
            <span style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', fontWeight: 600 }}>
              Section {q.section}
            </span>
          )}
          {q.type && (
            <span style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', borderRadius: '6px', padding: '2px 8px', fontSize: '12px' }}>
              {q.type}
            </span>
          )}
          {q.year && (
            <span style={{
              background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
              borderRadius: '6px', padding: '2px 8px', fontSize: '12px', fontWeight: 700,
            }}>
              {q.year}
            </span>
          )}
          {q.marks && (
            <span style={{
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)',
              borderRadius: '6px', padding: '2px 8px', fontSize: '12px',
            }}>
              [{q.marks} marks]
            </span>
          )}
        </div>
        <p style={{ color: '#f1f5f9', fontSize: '15px', lineHeight: 1.7, fontWeight: 500 }}>
          {q.question}
        </p>
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          style={{
            marginTop: '12px', background: showAnswer ? col.bg : 'rgba(255,255,255,0.06)',
            border: `1px solid ${showAnswer ? col.color + '55' : 'rgba(255,255,255,0.1)'}`,
            color: showAnswer ? col.text : 'rgba(255,255,255,0.5)',
            borderRadius: '8px', padding: '6px 16px', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
          }}
        >
          {showAnswer ? '🙈 Hide Answer' : '👁 Show Answer'}
        </button>
      </div>

      {showAnswer && (
        <div style={{
          padding: '16px 20px', background: 'rgba(0,0,0,0.2)',
          borderTop: `1px solid ${col.color}22`,
        }}>
          <div style={{ fontSize: '12px', color: col.text, fontWeight: 700, marginBottom: '8px' }}>
            ✅ MODEL ANSWER
          </div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {q.answer}
          </p>
        </div>
      )}
    </div>
  );
}
