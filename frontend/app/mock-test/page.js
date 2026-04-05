'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'];
const DIFFICULTIES = [
    { id: 'easy', label: '🟢 Easy', desc: 'Basic concepts & definitions' },
    { id: 'medium', label: '🟡 Medium', desc: 'Application & understanding' },
    { id: 'hard', label: '🔴 Hard', desc: 'Board exam level' },
];

const CHAPTERS = {
    Physics: ['Electric Charges and Fields', 'Current Electricity', 'Magnetic Effects', 'Ray Optics', 'Semiconductor Electronics', 'Electromagnetic Waves', 'Alternating Current', 'Atoms & Nuclei'],
    Chemistry: ['Solutions', 'Electrochemistry', 'Chemical Kinetics', 'The p-Block Elements', 'Coordination Compounds', 'Haloalkanes and Haloarenes', 'Aldehydes & Ketones', 'Biomolecules'],
    Mathematics: ['Relations and Functions', 'Matrices', 'Determinants', 'Continuity and Differentiability', 'Application of Derivatives', 'Integrals', 'Vector Algebra', 'Probability'],
    Biology: ['Reproduction in Organisms', 'Molecular Basis of Inheritance', 'Evolution', 'Human Health and Disease', 'Biotechnology', 'Ecosystem', 'Biodiversity'],
    English: ['The Last Lesson', 'Lost Spring', 'Deep Water', 'Indigo', 'Going Places', 'Grammar & Writing Skills'],
};

// ── Timer ────────────────────────────────────────────────────────────────────
function Timer({ seconds, onTimeUp }) {
    const [left, setLeft] = useState(seconds);
    const ref = useRef();

    useEffect(() => {
        ref.current = setInterval(() => {
            setLeft((s) => {
                if (s <= 1) { clearInterval(ref.current); onTimeUp(); return 0; }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(ref.current);
    }, []);

    const mins = Math.floor(left / 60);
    const secs = left % 60;
    const pct = (left / seconds) * 100;
    const color = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                    <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
                        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color }}>
                    {mins}:{String(secs).padStart(2, '0')}
                </div>
            </div>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>remaining</span>
        </div>
    );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function MockTestPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Setup
    const [step, setStep] = useState('setup'); // setup | loading | test | result
    const [subject, setSubject] = useState('Physics');
    const [chapter, setChapter] = useState(CHAPTERS['Physics'][0]);
    const [difficulty, setDifficulty] = useState('medium');

    // Test state
    const [paper, setPaper] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);
    const [timeUp, setTimeUp] = useState(false);
    const [generatingError, setGeneratingError] = useState('');

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    useEffect(() => {
        setChapter(CHAPTERS[subject][0]);
    }, [subject]);

    // ── Generate Paper ──────────────────────────────────────────────────────
    async function generatePaper() {
        setStep('loading');
        setGeneratingError('');
        try {
            const token = localStorage.getItem('lms_token');
            const res = await fetch(`${API_URL}/notes/mock-test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ subject, chapter, difficulty }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to generate paper');
            setPaper(data.paper);
            setAnswers({});
            setSubmitted(false);
            setScore(null);
            setTimeUp(false);
            setStep('test');
        } catch (err) {
            setGeneratingError(err.message);
            setStep('setup');
        }
    }

    // ── Submit ──────────────────────────────────────────────────────────────
    function submitTest(auto = false) {
        if (submitted) return;
        setSubmitted(true);
        setTimeUp(auto);

        let total = 0, earned = 0;

        // Score MCQs
        paper.sectionA?.forEach((q, i) => {
            total += 1;
            if (answers[`A_${i}`] === q.correct) earned += 1;
        });

        // Section B & C — just count attempted (manual grading hint)
        paper.sectionB?.forEach((q, i) => { total += q.marks || 2; if (answers[`B_${i}`]?.trim()) earned += Math.floor((q.marks || 2) * 0.7); });
        paper.sectionC?.forEach((q, i) => { total += q.marks || 5; if (answers[`C_${i}`]?.trim()) earned += Math.floor((q.marks || 5) * 0.7); });

        setScore({ earned: Math.round(earned), total });
        setStep('result');
    }

    if (authLoading) return null;

    // ── SETUP SCREEN ────────────────────────────────────────────────────────
    if (step === 'setup') return (
        <div style={{ padding: '40px 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
                📄 <span className="gradient-text">Personalized Mock Test</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginBottom: '32px' }}>
                AI generates a full board-style paper — Section A, B & C — just for you
            </p>

            {generatingError && (
                <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: '10px', padding: '12px 16px', color: '#fca5a5', marginBottom: '20px' }}>
                    ❌ {generatingError}
                </div>
            )}

            <div className="glass-card" style={{ padding: '28px' }}>
                {/* Subject */}
                <div style={{ marginBottom: '22px' }}>
                    <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px', display: 'block' }}>Subject</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {SUBJECTS.map((s) => (
                            <button key={s} onClick={() => setSubject(s)} style={{
                                padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                                background: subject === s ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.07)',
                                color: subject === s ? '#fff' : 'rgba(255,255,255,0.6)',
                            }}>{s}</button>
                        ))}
                    </div>
                </div>

                {/* Chapter */}
                <div style={{ marginBottom: '22px' }}>
                    <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', display: 'block' }}>Chapter</label>
                    <select value={chapter} onChange={(e) => setChapter(e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                        {CHAPTERS[subject].map((c) => <option key={c} value={c} style={{ background: '#1a1a2e' }}>{c}</option>)}
                    </select>
                </div>

                {/* Difficulty */}
                <div style={{ marginBottom: '28px' }}>
                    <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px', display: 'block' }}>Difficulty</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {DIFFICULTIES.map((d) => (
                            <div key={d.id} onClick={() => setDifficulty(d.id)} style={{
                                padding: '12px 18px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                                border: difficulty === d.id ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.08)',
                                background: difficulty === d.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                            }}>
                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#f1f5f9' }}>{d.label}</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>{d.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                    📋 Paper: Section A (5 MCQs × 1 mark) + Section B (3 short × 2 marks) + Section C (2 long × 5 marks) = <strong style={{ color: '#a5b4fc' }}>21 marks</strong> &nbsp;|&nbsp; ⏱️ <strong style={{ color: '#a5b4fc' }}>30 minutes</strong>
                </div>

                <button onClick={generatePaper} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
                    🚀 Generate My Paper
                </button>
            </div>
        </div>
    );

    // ── LOADING ─────────────────────────────────────────────────────────────
    if (step === 'loading') return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
            <div style={{ fontSize: '3rem', animation: 'spin 1s linear infinite' }}>📄</div>
            <p style={{ color: '#a5b4fc', fontWeight: 600 }}>AI is generating your {subject} paper...</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Setting question paper, please wait</p>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    // ── TEST SCREEN ─────────────────────────────────────────────────────────
    if (step === 'test' && paper) return (
        <div style={{ padding: '24px', maxWidth: '860px', margin: '0 auto' }}>
            {/* Test Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: '20px', color: '#f1f5f9' }}>{subject} — {chapter}</h2>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{difficulty} difficulty • 21 marks</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Timer seconds={1800} onTimeUp={() => submitTest(true)} />
                    <button onClick={() => submitTest(false)} className="btn-primary" style={{ padding: '10px 22px', fontSize: '14px' }}>
                        Submit Test
                    </button>
                </div>
            </div>

            {/* Section A — MCQs */}
            <Section title="Section A — Multiple Choice Questions" subtitle="1 mark each • Choose the correct option">
                {paper.sectionA?.map((q, i) => (
                    <div key={i} className="glass-card" style={{ padding: '18px', marginBottom: '14px' }}>
                        <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>
                            Q{i + 1}. {q.question}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {q.options?.map((opt, oi) => (
                                <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', background: answers[`A_${i}`] === oi ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)', border: answers[`A_${i}`] === oi ? '1px solid #6366f1' : '1px solid transparent', transition: 'all 0.15s' }}>
                                    <input type="radio" name={`A_${i}`} checked={answers[`A_${i}`] === oi} onChange={() => setAnswers((a) => ({ ...a, [`A_${i}`]: oi }))} style={{ accentColor: '#6366f1' }} />
                                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </Section>

            {/* Section B — Short Answer */}
            <Section title="Section B — Short Answer Questions" subtitle="2 marks each • Write concise answers">
                {paper.sectionB?.map((q, i) => (
                    <div key={i} className="glass-card" style={{ padding: '18px', marginBottom: '14px' }}>
                        <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>
                            Q{i + 1}. {q.question} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>[{q.marks || 2} marks]</span>
                        </p>
                        <textarea
                            className="input-field"
                            placeholder="Write your answer here..."
                            value={answers[`B_${i}`] || ''}
                            onChange={(e) => setAnswers((a) => ({ ...a, [`B_${i}`]: e.target.value }))}
                            rows={3}
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                ))}
            </Section>

            {/* Section C — Long Answer */}
            <Section title="Section C — Long Answer Questions" subtitle="5 marks each • Write detailed answers">
                {paper.sectionC?.map((q, i) => (
                    <div key={i} className="glass-card" style={{ padding: '18px', marginBottom: '14px' }}>
                        <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>
                            Q{i + 1}. {q.question} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>[{q.marks || 5} marks]</span>
                        </p>
                        <textarea
                            className="input-field"
                            placeholder="Write your detailed answer here..."
                            value={answers[`C_${i}`] || ''}
                            onChange={(e) => setAnswers((a) => ({ ...a, [`C_${i}`]: e.target.value }))}
                            rows={6}
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                ))}
            </Section>

            <button onClick={() => submitTest(false)} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '8px' }}>
                📝 Submit Test
            </button>
        </div>
    );

    // ── RESULT ───────────────────────────────────────────────────────────────
    if (step === 'result' && score) {
        const pct = Math.round((score.earned / score.total) * 100);
        const grade = pct >= 80 ? { label: 'A+', color: '#10b981' } : pct >= 60 ? { label: 'B', color: '#6366f1' } : pct >= 40 ? { label: 'C', color: '#f59e0b' } : { label: 'D', color: '#ef4444' };
        return (
            <div style={{ padding: '40px 24px 80px', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
                {timeUp && <div style={{ background: '#451a03', border: '1px solid #f59e0b', borderRadius: '10px', padding: '10px 16px', color: '#fcd34d', marginBottom: '24px', fontSize: '14px' }}>⏱️ Time's up! Test auto-submitted.</div>}

                <div className="glass-card" style={{ padding: '40px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{pct >= 70 ? '🎉' : pct >= 40 ? '👍' : '💪'}</div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: '#f1f5f9' }}>Test Complete!</h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '28px' }}>{subject} — {chapter}</p>

                    {/* Score */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '28px', flexWrap: 'wrap' }}>
                        <ScoreStat label="Score" value={`${score.earned}/${score.total}`} color="#a5b4fc" />
                        <ScoreStat label="Percentage" value={`${pct}%`} color={grade.color} />
                        <ScoreStat label="Grade" value={grade.label} color={grade.color} />
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '28px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${grade.color}, ${grade.color}88)`, borderRadius: '999px', transition: 'width 1s ease' }} />
                    </div>

                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px' }}>
                        {pct >= 80 ? '🌟 Outstanding performance! You are board-exam ready.' : pct >= 60 ? '👏 Good effort! Revise the topics you missed.' : pct >= 40 ? '📖 Keep practicing. Focus on weak areas.' : '💡 Review the chapter and try again.'}
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => setStep('setup')} className="btn-primary" style={{ padding: '12px 28px' }}>
                            🔄 Try Another Test
                        </button>
                        <button onClick={() => router.push('/notes')} style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '14px' }}>
                            📘 Study Notes
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

function Section({ title, subtitle, children }) {
    return (
        <div style={{ marginBottom: '28px' }}>
            <div style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#a5b4fc' }}>{title}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{subtitle}</div>
            </div>
            {children}
        </div>
    );
}

function ScoreStat({ label, value, color }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{label}</div>
        </div>
    );
}
