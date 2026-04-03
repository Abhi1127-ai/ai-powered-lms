const Groq = require('groq-sdk');
require('dotenv').config();

let client = null;

const initGemini = () => {
  const key = (process.env.GROQ_API_KEY || '').trim();
  if (!key || key === 'your_groq_api_key_here') {
    console.warn('⚠️  GROQ_API_KEY not set — AI features will return mock responses.');
    return false;
  }
  client = new Groq({ apiKey: key });
  console.log('✅ Groq AI Initialized');
  return true;
};

const verifyGemini = async () => {
  if (!client) return false;
  try {
    await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }]
    });
    console.log('✅ Groq AI Verified & Ready');
    return true;
  } catch (error) {
    console.error('❌ Groq AI Error:', error.message);
    return false;
  }
};

const askGroq = async (prompt) => {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  });
  return response.choices[0].message.content;
};

// ── Doubt Destroyer (Hinglish) ─────────────────────────────────────────
const askDoubt = async (question, subject) => {
  if (!client) return getMockDoubtResponse(question, subject);

  const prompt = `You are a friendly Indian tutor who teaches ${subject} to board exam students.
Explain the following concept/doubt in Hinglish (mix of Hindi and English) so it is easy to understand.
Use simple analogies and examples from daily life. Keep it concise but thorough.

Student's doubt: ${question}

Format your answer with:
1. A simple one-line answer first
2. Detailed explanation with examples
3. A quick tip to remember this for the board exam`;

  return await askGroq(prompt);
};

// ── One-Page Summary ───────────────────────────────────────────────────
const generateSummary = async (chapter, subject) => {
  if (!client) return getMockSummaryResponse(chapter, subject);

  const prompt = `You are an expert ${subject} teacher for Indian Board Exams.
Create a ONE-PAGE quick revision summary of the chapter "${chapter}" in ${subject}.

Requirements:
- Cover ALL important formulas, definitions, and key concepts
- Use bullet points for easy scanning
- Highlight must-remember points with ⭐
- Include 2-3 most frequently asked board exam questions at the end
- Keep it concise enough to fit on one printed page
- Use Hinglish where it helps clarity`;

  return await askGroq(prompt);
};

// ── Mock Test / Quiz Generator ─────────────────────────────────────────
const generateQuiz = async (topic, subject, count = 5) => {
  if (!client) return getMockQuizResponse(topic, subject, count);

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

  const text = await askGroq(prompt);
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
  if (!client) return getMockGradeResponse(question, maxMarks);

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

  const text = await askGroq(prompt);
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

// ── AI Study Plan Generator ───────────────────────────────────────────
const generateStudyPlan = async (userClass, board, currentProgress) => {
  if (!client) return getMockStudyPlanResponse();

  const progressJson = JSON.stringify(currentProgress);
  const prompt = `You are a strategic Board Exam coach for Class ${userClass} (${board} Board).
The student's current progress across subjects is: ${progressJson} (values are 0-100%).

Your goal is to create a dynamic study plan for TODAY that focuses on improving weak areas while maintaining strong ones.

Return ONLY a valid JSON object with this exact format:
{
  "dailyMantra": "A short, motivating 1-sentence quote for the day",
  "goals": [
    {
      "subject": "...",
      "chapter": "Suggest a specific chapter from their weak subjects",
      "task": "A concrete task (e.g., 'Solve 5 numericals', 'Revise organic equations')",
      "priority": "High" or "Medium",
      "why": "Briefly explain why this topic is important for boards"
    }
  ],
  "proTip": "One advanced exam strategy for today"
}

Focus on suggesting 3 high-impact goals. Choose subjects with lower progress.`;

  const text = await askGroq(prompt);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      return getMockStudyPlanResponse();
    }
  }
  return getMockStudyPlanResponse();
};

// ── AI Flashcard Generator ────────────────────────────────────────────
const generateFlashcards = async (topic, subject, count = 10) => {
  if (!client) return getMockFlashcardResponse(topic, subject, count);

  const prompt = `Generate exactly ${count} flashcards for the topic "${topic}" in ${subject} for Indian Board Exams.
Each flashcard should have a "front" (question/term) and a "back" (concise answer/explanation).

Return ONLY a valid JSON array in this exact format, with no other text:
[
  {
    "front": "...",
    "back": "..."
  }
]

Make them high-yield for board exams. Include definitions, formulas, and key dates/names.`;

  const text = await askGroq(prompt);
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      return getMockFlashcardResponse(topic, subject, count);
    }
  }
  return getMockFlashcardResponse(topic, subject, count);
};

// ── Mock Responses ────────────────────────────────────────────────────
const getMockFlashcardResponse = (topic, subject, count) =>
  Array.from({ length: count }, (_, i) => ({
    front: `Concept ${i + 1} of ${topic} (${subject})?`,
    back: `This is the concise explanation for concept ${i + 1}. Set GROQ_API_KEY for real flashcards.`
  }));

const getMockStudyPlanResponse = () => ({
  dailyMantra: "Consistency is the bridge between goals and accomplishment.",
  goals: [
    { subject: "Physics", chapter: "Electric Charges", task: "Solve 5 previous year numericals", priority: "High", why: "Weightage of 7-9 marks in boards." },
    { subject: "Chemistry", chapter: "Solutions", task: "Memorize Raoult's Law and its derivation", priority: "Medium", why: "Frequently asked in short answers." },
    { subject: "Mathematics", chapter: "Matrices", task: "Practice 3x3 inverse matrix problems", priority: "High", why: "Foundation for linear equations section." }
  ],
  proTip: "Use the Pomodoro technique: 25 mins study, 5 mins break to keep your mind fresh."
});

const getMockDoubtResponse = (question, subject) =>
  `🤖 **Mock AI Response** (set GROQ_API_KEY for real answers)\n\nAapka doubt "${question}" ${subject} mein bahut common hai!\n\n**Simple Answer:** Yeh ek important concept hai jo board exam mein zaroor aata hai.\n\n**Detail:** Is topic ko samajhne ke liye, pehle basics clear karo, phir practice karo.\n\n💡 **Board Tip:** Diagrams draw karo aur formulas yaad rakho!`;

const getMockSummaryResponse = (chapter, subject) =>
  `📝 **Mock Summary** (set GROQ_API_KEY for real summaries)\n\n# ${chapter} — ${subject}\n\n⭐ **Key Point 1:** Important definition\n⭐ **Key Point 2:** Main formula\n⭐ **Key Point 3:** Application\n\n**Board Exam Qs:**\n1. Define the concept.\n2. Derive the formula.\n3. Numerical problem.`;

const getMockQuizResponse = (topic, subject, count) =>
  Array.from({ length: count }, (_, i) => ({
    question: `Sample ${subject} question ${i + 1} about ${topic}?`,
    options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
    correct: 0,
    explanation: 'This is a mock question. Set GROQ_API_KEY for real quizzes.',
  }));

const getMockGradeResponse = (question, maxMarks) => ({
  score: Math.floor(maxMarks * 0.6),
  maxMarks,
  correct: ['Basic concept mentioned'],
  missing: ['Detailed explanation needed', 'Diagram not included'],
  modelAnswer: 'Set GROQ_API_KEY for a detailed model answer.',
  tips: 'Practice writing structured answers with proper headings.',
});

module.exports = { initGemini, verifyGemini, askDoubt, generateSummary, generateQuiz, gradeAnswer, generateStudyPlan, generateFlashcards };