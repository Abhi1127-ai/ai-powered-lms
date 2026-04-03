// No imports needed for fetch in Node.js 18+
let apiKey = null;

const initGemini = () => {
  apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY not set in .env');
    return false;
  }
  return true;
};

// Internal Helper to call Gemini directly via REST
const callGemini = async (prompt) => {
  if (!apiKey) return null;

  // Using v1beta for widest model compatibility
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': AIzaSyAak4tZq0UImRmWGh2UOrkI8NY1SfY4KqA
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // If 1.5 Flash still 404s, we automatically fallback to Gemini Pro
      if (data.error.code === 404) {
        return fallbackToPro(prompt);
      }
      throw new Error(data.error.message);
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    return null;
  }
};

// Fallback logic in case 1.5 Flash is restricted for your key
const fallbackToPro = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
};

const verifyGemini = async () => {
  const test = await callGemini("hi");
  if (test) {
    console.log('✅ Gemini AI Verified & Ready (Direct REST Mode)');
    return true;
  }
  return false;
};

// ── Doubt Destroyer ───────────────────────────────────────────────────
const askDoubt = async (question, subject) => {
  const prompt = `You are a friendly Indian tutor. Explain in Hinglish for ${subject}: ${question}. Format: Answer, Detail, Board Tip.`;
  const response = await callGemini(prompt);
  return response || getMockDoubtResponse(question, subject);
};

// ── One-Page Summary ──────────────────────────────────────────────────
const generateSummary = async (chapter, subject) => {
  const prompt = `Create a Hinglish revision summary for "${chapter}" in ${subject} (Indian Boards). Include formulas and 2 PYQs.`;
  const response = await callGemini(prompt);
  return response || getMockSummaryResponse(chapter, subject);
};

// ── Mock Test / Quiz Generator ────────────────────────────────────────
const generateQuiz = async (topic, subject, count = 5) => {
  const prompt = `Generate ${count} MCQs for ${topic} in ${subject}. Return ONLY JSON array: [{"question":"", "options":["A","B","C","D"], "correct":0, "explanation":""}]`;
  const response = await callGemini(prompt);
  if (!response) return getMockQuizResponse(topic, subject, count);
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  try { return jsonMatch ? JSON.parse(jsonMatch[0]) : getMockQuizResponse(topic, subject, count); }
  catch (e) { return getMockQuizResponse(topic, subject, count); }
};

// ── Board Examiner Mode ───────────────────────────────────────────────
const gradeAnswer = async (question, answer, subject, maxMarks = 5) => {
  const prompt = `Grade this ${subject} answer out of ${maxMarks}. Return ONLY JSON: {"score":0, "maxMarks":5, "correct":[], "missing":[], "modelAnswer":"", "tips":""}. Q: ${question}, A: ${answer}`;
  const response = await callGemini(prompt);
  if (!response) return getMockGradeResponse(question, maxMarks);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  try { return jsonMatch ? JSON.parse(jsonMatch[0]) : getMockGradeResponse(question, maxMarks); }
  catch (e) { return getMockGradeResponse(question, maxMarks); }
};

// ── AI Study Plan Generator ──────────────────────────────────────────
const generateStudyPlan = async (userClass, board, currentProgress) => {
  const prompt = `Create a study plan for Class ${userClass} (${board}). Progress: ${JSON.stringify(currentProgress)}. Return ONLY JSON: {"dailyMantra":"", "goals":[], "proTip":""}`;
  const response = await callGemini(prompt);
  if (!response) return getMockStudyPlanResponse();
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  try { return jsonMatch ? JSON.parse(jsonMatch[0]) : getMockStudyPlanResponse(); }
  catch (e) { return getMockStudyPlanResponse(); }
};

// ── AI Flashcard Generator ───────────────────────────────────────────
const generateFlashcards = async (topic, subject, count = 10) => {
  const prompt = `Generate ${count} flashcards for ${topic} (${subject}). Return ONLY JSON: [{"front":"", "back":""}]`;
  const response = await callGemini(prompt);
  if (!response) return getMockFlashcardResponse(topic, subject, count);
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  try { return jsonMatch ? JSON.parse(jsonMatch[0]) : getMockFlashcardResponse(topic, subject, count); }
  catch (e) { return getMockFlashcardResponse(topic, subject, count); }
};

// ── Mock Responses (Fallbacks) ────────────────────────────────────────
const getMockFlashcardResponse = (t, s, c) => Array.from({ length: c }, (_, i) => ({ front: `Concept ${i + 1}`, back: `Mock` }));
const getMockStudyPlanResponse = () => ({ dailyMantra: "Keep going!", goals: [], proTip: "Rest well." });
const getMockDoubtResponse = (q, s) => `🤖 Mock Answer for ${q}.`;
const getMockSummaryResponse = (c, s) => `📝 Mock summary for ${c}.`;
const getMockQuizResponse = (t, s, c) => Array.from({ length: c }, (_, i) => ({ question: `Q${i+1}`, options: ["A","B","C","D"], correct: 0, explanation: "Mock" }));
const getMockGradeResponse = (q, m) => ({ score: 0, maxMarks: m, correct: [], missing: [], modelAnswer: "Mock", tips: "Mock" });

module.exports = { initGemini, verifyGemini, askDoubt, generateSummary, generateQuiz, gradeAnswer, generateStudyPlan, generateFlashcards };