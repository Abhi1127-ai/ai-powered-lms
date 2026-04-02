const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

const initGemini = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_google_gemini_api_key_here') {
    console.warn('⚠️  GEMINI_API_KEY not set — AI features will return mock responses.');
    return false;
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  return true;
};

// ── Doubt Destroyer (Hinglish) ─────────────────────────────────────────
const askDoubt = async (question, subject) => {
  if (!model) return getMockDoubtResponse(question, subject);

  const prompt = `You are a friendly Indian tutor who teaches ${subject} to board exam students.
Explain the following concept/doubt in Hinglish (mix of Hindi and English) so it is easy to understand.
Use simple analogies and examples from daily life. Keep it concise but thorough.

Student's doubt: ${question}

Format your answer with:
1. A simple one-line answer first
2. Detailed explanation with examples
3. A quick tip to remember this for the board exam`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// ── One-Page Summary ───────────────────────────────────────────────────
const generateSummary = async (chapter, subject) => {
  if (!model) return getMockSummaryResponse(chapter, subject);

  const prompt = `You are an expert ${subject} teacher for Indian Board Exams.
Create a ONE-PAGE quick revision summary of the chapter "${chapter}" in ${subject}.

Requirements:
- Cover ALL important formulas, definitions, and key concepts
- Use bullet points for easy scanning
- Highlight must-remember points with ⭐
- Include 2-3 most frequently asked board exam questions at the end
- Keep it concise enough to fit on one printed page
- Use Hinglish where it helps clarity`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// ── Mock Test / Quiz Generator ─────────────────────────────────────────
const generateQuiz = async (topic, subject, count = 5) => {
  if (!model) return getMockQuizResponse(topic, subject, count);

  const prompt = `Generate exactly ${count} multiple-choice questions (MCQs) for the topic "${topic}" in ${subject} for Indian Board Exams (Class 10/12).

Return ONLY a valid JSON array in this exact format, with no other text:
[
  {
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct": 0,
    "explanation": "Brief one-line explanation"
  }
]

Make the questions board-exam level. Mix easy, medium, and hard questions.`;

  const result = await model.generateContent(prompt);
  let text = result.response.text();

  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      return getMockQuizResponse(topic, subject, count);
    }
  }
  return getMockQuizResponse(topic, subject, count);
};

// ── Board Examiner Mode ────────────────────────────────────────────────
const gradeAnswer = async (question, answer, subject, maxMarks = 5) => {
  if (!model) return getMockGradeResponse(question, maxMarks);

  const prompt = `You are a strict but fair Indian Board Exam paper checker for ${subject}.

Question (${maxMarks} marks): ${question}

Student's Answer: ${answer}

Grade this answer following the CBSE/ICSE marking scheme:
1. Give a score out of ${maxMarks}
2. List what points the student covered correctly ✅
3. List what points are missing or incorrect ❌
4. Provide a model answer for comparison
5. Give specific tips to improve

Return your response in this JSON format:
{
  "score": <number>,
  "maxMarks": ${maxMarks},
  "correct": ["point 1", "point 2"],
  "missing": ["point 1", "point 2"],
  "modelAnswer": "...",
  "tips": "..."
}`;

  const result = await model.generateContent(prompt);
  let text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      return getMockGradeResponse(question, maxMarks);
    }
  }
  return getMockGradeResponse(question, maxMarks);
};

// ── Mock Responses (when API key not set) ──────────────────────────────
const getMockDoubtResponse = (question, subject) =>
  `🤖 **Mock AI Response** (set GEMINI_API_KEY for real answers)\n\nAapka doubt "${question}" ${subject} mein bahut common hai!\n\n**Simple Answer:** Yeh ek important concept hai jo board exam mein zaroor aata hai.\n\n**Detail:** Is topic ko samajhne ke liye, pehle basics clear karo, phir practice karo.\n\n💡 **Board Tip:** Diagrams draw karo aur formulas yaad rakho!`;

const getMockSummaryResponse = (chapter, subject) =>
  `📝 **Mock Summary** (set GEMINI_API_KEY for real summaries)\n\n# ${chapter} — ${subject}\n\n⭐ **Key Point 1:** Important definition\n⭐ **Key Point 2:** Main formula\n⭐ **Key Point 3:** Application\n\n**Board Exam Qs:**\n1. Define the concept.\n2. Derive the formula.\n3. Numerical problem.`;

const getMockQuizResponse = (topic, subject, count) =>
  Array.from({ length: count }, (_, i) => ({
    question: `Sample ${subject} question ${i + 1} about ${topic}?`,
    options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
    correct: 0,
    explanation: 'This is a mock question. Set GEMINI_API_KEY for real quizzes.',
  }));

const getMockGradeResponse = (question, maxMarks) => ({
  score: Math.floor(maxMarks * 0.6),
  maxMarks,
  correct: ['Basic concept mentioned'],
  missing: ['Detailed explanation needed', 'Diagram not included'],
  modelAnswer: 'Set GEMINI_API_KEY for a detailed model answer.',
  tips: 'Practice writing structured answers with proper headings.',
});

module.exports = { initGemini, askDoubt, generateSummary, generateQuiz, gradeAnswer };
