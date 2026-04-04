"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notesData } from "../lib/notesData";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── tiny helpers ────────────────────────────────────────────────────────────
const subjectColors = {
    Physics: { bg: "#1e1b4b", border: "#6366f1", badge: "#6366f1", text: "#a5b4fc" },
    Chemistry: { bg: "#022c22", border: "#10b981", badge: "#10b981", text: "#6ee7b7" },
    Biology: { bg: "#1c1407", border: "#f59e0b", badge: "#f59e0b", text: "#fcd34d" },
    Mathematics: { bg: "#2d0a1f", border: "#ec4899", badge: "#ec4899", text: "#f9a8d4" },
    English: { bg: "#1e1227", border: "#8b5cf6", badge: "#8b5cf6", text: "#c4b5fd" },
};

const subjectIcons = {
    Physics: "⚡",
    Chemistry: "🧪",
    Biology: "🌿",
    Mathematics: "📐",
    English: "📖",
};

// ─── Markdown-ish renderer (no external lib needed) ──────────────────────────
function RenderNotes({ content }) {
    if (!content) return null;

    const lines = content.split("\n");
    const elements = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.startsWith("# ")) {
            elements.push(
                <h1 key={i} style={{ color: "#e2e8f0", fontSize: "1.5rem", fontWeight: 700, margin: "1.2rem 0 0.5rem", borderBottom: "2px solid #334155", paddingBottom: "0.3rem" }}>
                    {line.slice(2)}
                </h1>
            );
        } else if (line.startsWith("## ")) {
            elements.push(
                <h2 key={i} style={{ color: "#c4b5fd", fontSize: "1.15rem", fontWeight: 700, margin: "1rem 0 0.4rem" }}>
                    {line.slice(3)}
                </h2>
            );
        } else if (line.startsWith("### ")) {
            elements.push(
                <h3 key={i} style={{ color: "#93c5fd", fontSize: "1rem", fontWeight: 600, margin: "0.8rem 0 0.3rem" }}>
                    {line.slice(4)}
                </h3>
            );
        } else if (line.startsWith("- ") || line.startsWith("* ")) {
            elements.push(
                <li key={i} style={{ color: "#cbd5e1", marginLeft: "1.2rem", marginBottom: "0.2rem", listStyleType: "disc" }}>
                    {formatInline(line.slice(2))}
                </li>
            );
        } else if (/^\d+\. /.test(line)) {
            elements.push(
                <li key={i} style={{ color: "#cbd5e1", marginLeft: "1.2rem", marginBottom: "0.2rem", listStyleType: "decimal" }}>
                    {formatInline(line.replace(/^\d+\. /, ""))}
                </li>
            );
        } else if (line.startsWith("> ")) {
            elements.push(
                <blockquote key={i} style={{ borderLeft: "3px solid #6366f1", paddingLeft: "0.8rem", color: "#94a3b8", fontStyle: "italic", margin: "0.5rem 0" }}>
                    {line.slice(2)}
                </blockquote>
            );
        } else if (line.startsWith("---") || line.startsWith("===")) {
            elements.push(<hr key={i} style={{ border: "none", borderTop: "1px solid #334155", margin: "0.8rem 0" }} />);
        } else if (line.trim() === "") {
            elements.push(<br key={i} />);
        } else {
            elements.push(
                <p key={i} style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "0.4rem" }}>
                    {formatInline(line)}
                </p>
            );
        }
        i++;
    }
    return <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>{elements}</div>;
}

function formatInline(text) {
    // Bold
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={idx} style={{ color: "#f1f5f9" }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
            return <code key={idx} style={{ background: "#1e293b", color: "#a5f3fc", padding: "0.1rem 0.3rem", borderRadius: "4px", fontSize: "0.85em" }}>{part.slice(1, -1)}</code>;
        }
        return part;
    });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NotesPage() {
    const router = useRouter();

    // navigation state
    const [selectedClass, setSelectedClass] = useState(null); // 10 | 12
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);

    // notes state
    const [notes, setNotes] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // auth check
    const { user } = useAuth();

useEffect(() => {
    if (user === null) { router.push("/login"); return; }
}, [user, router]);

    // ── fetch / generate notes ──────────────────────────────────────────────────
    async function loadNotes(cls, subject, unit) {
        setLoading(true);
        setError("");
        setNotes(null);
        try {
            const token = localStorage.getItem("lms_token");
            const res = await fetch(
                `${API_URL}/notes/generate`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ class: cls, subject, unit }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to load notes");
            setNotes(data.notes);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function handleUnitClick(unit) {
        setSelectedUnit(unit);
        loadNotes(selectedClass, selectedSubject, unit);
    }

    function goBack() {
        if (selectedUnit) { setSelectedUnit(null); setNotes(null); setError(""); return; }
        if (selectedSubject) { setSelectedSubject(null); return; }
        if (selectedClass) { setSelectedClass(null); return; }
    }

    // breadcrumb
    const crumbs = ["Notes"];
    if (selectedClass) crumbs.push(`Class ${selectedClass}`);
    if (selectedSubject) crumbs.push(selectedSubject);
    if (selectedUnit) crumbs.push(selectedUnit);

    const pageStyle = { minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" };
    const containerStyle = { maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem" };
    const cardStyle = (color) => ({
        background: color?.bg || "#1e293b",
        border: `1px solid ${color?.border || "#334155"}`,
        borderRadius: "12px",
        padding: "1.2rem 1.5rem",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
        marginBottom: "0.8rem",
    });

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>

                {/* Header */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#a78bfa", marginBottom: "0.3rem" }}>
                        📘 AI Notes
                    </h1>
                    <p style={{ color: "#64748b" }}>
                        AI-generated detailed notes, chapter-wise for Class 10 &amp; 12
                    </p>
                </div>

                {/* Breadcrumb + Back */}
                {crumbs.length > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
                        <button
                            onClick={goBack}
                            style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: "8px", padding: "0.3rem 0.8rem", cursor: "pointer", fontSize: "0.85rem" }}
                        >
                            ← Back
                        </button>
                        {crumbs.map((c, i) => (
                            <span key={i} style={{ color: i === crumbs.length - 1 ? "#a78bfa" : "#475569", fontSize: "0.9rem" }}>
                                {i > 0 && <span style={{ marginRight: "0.5rem", color: "#334155" }}>/</span>}
                                {c}
                            </span>
                        ))}
                    </div>
                )}

                {/* ── STEP 1: Choose Class ─────────────────────────────────────────── */}
                {!selectedClass && (
                    <div>
                        <h2 style={{ color: "#94a3b8", marginBottom: "1rem", fontSize: "1rem" }}>Select Your Class</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            {[10, 12].map((cls) => (
                                <button
                                    key={cls}
                                    onClick={() => setSelectedClass(cls)}
                                    style={{
                                        background: "#1e293b",
                                        border: "2px solid #6366f1",
                                        borderRadius: "16px",
                                        padding: "2.5rem 1rem",
                                        cursor: "pointer",
                                        color: "#e2e8f0",
                                        fontSize: "1.5rem",
                                        fontWeight: 800,
                                        transition: "all 0.15s",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "#312e81"; e.currentTarget.style.transform = "scale(1.02)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.transform = "scale(1)"; }}
                                >
                                    🎓 Class {cls}
                                    <div style={{ fontSize: "0.85rem", fontWeight: 400, color: "#94a3b8", marginTop: "0.5rem" }}>
                                        {Object.keys(notesData[cls]).length} subjects
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Choose Subject ───────────────────────────────────────── */}
                {selectedClass && !selectedSubject && (
                    <div>
                        <h2 style={{ color: "#94a3b8", marginBottom: "1rem", fontSize: "1rem" }}>
                            Choose a Subject — Class {selectedClass}
                        </h2>
                        {Object.keys(notesData[selectedClass]).map((subj) => {
                            const col = subjectColors[subj];
                            const units = notesData[selectedClass][subj].units;
                            return (
                                <div
                                    key={subj}
                                    style={cardStyle(col)}
                                    onClick={() => setSelectedSubject(subj)}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${col.border}33`; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                            <span style={{ fontSize: "1.8rem" }}>{subjectIcons[subj]}</span>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: "1.1rem", color: col.text }}>{subj}</div>
                                                <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "2px" }}>{units.length} chapters</div>
                                            </div>
                                        </div>
                                        <span style={{ color: "#475569", fontSize: "1.2rem" }}>›</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── STEP 3: Choose Unit ──────────────────────────────────────────── */}
                {selectedSubject && !selectedUnit && (
                    <div>
                        <h2 style={{ color: "#94a3b8", marginBottom: "1rem", fontSize: "1rem" }}>
                            {subjectIcons[selectedSubject]} {selectedSubject} — Select Chapter
                        </h2>
                        {notesData[selectedClass][selectedSubject].units.map((unit, idx) => {
                            const col = subjectColors[selectedSubject];
                            return (
                                <div
                                    key={unit}
                                    style={{
                                        ...cardStyle(col),
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                    onClick={() => handleUnitClick(unit)}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = `0 4px 16px ${col.border}22`; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                        <span style={{
                                            background: col.border + "22",
                                            color: col.text,
                                            borderRadius: "8px",
                                            padding: "0.2rem 0.5rem",
                                            fontSize: "0.78rem",
                                            fontWeight: 700,
                                            minWidth: "2rem",
                                            textAlign: "center",
                                        }}>
                                            {String(idx + 1).padStart(2, "0")}
                                        </span>
                                        <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{unit}</span>
                                    </div>
                                    <span style={{ color: col.text, fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                        🤖 AI Notes ›
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── STEP 4: Show Notes ───────────────────────────────────────────── */}
                {selectedUnit && (
                    <div>
                        {/* Chapter header */}
                        <div style={{
                            background: "#1e293b",
                            border: `1px solid ${subjectColors[selectedSubject]?.border || "#334155"}`,
                            borderRadius: "12px",
                            padding: "1.2rem 1.5rem",
                            marginBottom: "1.2rem",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                <span style={{ fontSize: "1.6rem" }}>{subjectIcons[selectedSubject]}</span>
                                <div>
                                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                                        Class {selectedClass} · {selectedSubject}
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "#e2e8f0" }}>
                                        {selectedUnit}
                                    </div>
                                </div>
                                <span style={{
                                    marginLeft: "auto",
                                    background: "#0f172a",
                                    border: "1px solid #334155",
                                    color: "#94a3b8",
                                    borderRadius: "6px",
                                    padding: "0.2rem 0.6rem",
                                    fontSize: "0.75rem",
                                }}>
                                    🤖 AI Generated
                                </span>
                            </div>
                        </div>

                        {/* Loading state */}
                        {loading && (
                            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: "1rem", animation: "spin 1s linear infinite", display: "inline-block" }}>🔄</div>
                                <p style={{ color: "#94a3b8" }}>Generating detailed notes with AI...</p>
                                <p style={{ color: "#475569", fontSize: "0.85rem", marginTop: "0.4rem" }}>
                                    This may take a few seconds for the first time
                                </p>
                                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                            </div>
                        )}

                        {/* Error state */}
                        {error && (
                            <div style={{ background: "#450a0a", border: "1px solid #991b1b", borderRadius: "10px", padding: "1rem 1.5rem", color: "#fca5a5" }}>
                                ❌ {error}
                                <button
                                    onClick={() => handleUnitClick(selectedUnit)}
                                    style={{ marginLeft: "1rem", background: "#991b1b", border: "none", color: "#fff", borderRadius: "6px", padding: "0.3rem 0.8rem", cursor: "pointer" }}
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Notes content */}
                        {notes && !loading && (
                            <div style={{
                                background: "#1e293b",
                                border: "1px solid #334155",
                                borderRadius: "12px",
                                padding: "1.8rem",
                                lineHeight: 1.8,
                            }}>
                                <RenderNotes content={notes} />
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
