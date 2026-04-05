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

async function generateNotes(cls, subject, unit) {
  const prompt = `You are an expert CBSE Class ${cls} ${subject} teacher preparing detailed notes for students.

Generate comprehensive, exam-focused notes for the chapter: "${unit}" (Class ${cls} ${subject}).

Format the notes using Markdown with the following structure:
# ${unit}

## 📌 Overview
(2-3 sentence intro about the chapter and its importance)

## 🔑 Key Concepts
(List all important concepts with brief explanations. Use **bold** for key terms.)

## 📖 Detailed Notes
(Thorough section-by-section explanation of all topics in the chapter. 
 Use sub-headings (###), bullet points, and bold for important terms.
 Include definitions, formulas (written as plain text), and explanations.)

## 📊 Important Formulas & Facts
(List all formulas and important numerical values/constants in a clean format)

## ✅ Board Exam Tips
(3-5 specific tips about what CBSE board examiners look for in this chapter)

## 🔁 Quick Revision Points
(Bullet list of the most important points to remember — ideal for last-minute revision)

Keep the language clear, student-friendly, and exam-focused. 
Total length should be comprehensive but not padded — aim for thorough coverage of the CBSE syllabus for this chapter.`;

  return await askGroq(prompt);
}

async function generatePYQs(subject, unit) {
  if (!client) {
    return [
      { question: `Define the key concepts in ${unit}.`, year: '2023', marks: 2, section: 'B', answer: 'Set GROQ_API_KEY for real answers.' },
    ];
  }

  const prompt = `You are a CBSE board exam paper setter for ${subject}, chapter: "${unit}".

Generate a mini board exam paper with exactly 8 questions in this JSON array format.
Return ONLY the JSON array, no explanation, no markdown, no backticks.

[
  {"section":"A","type":"MCQ","question":"Full MCQ question text?\n(a) Option1\n(b) Option2\n(c) Option3\n(d) Option4","year":"2023","marks":1,"answer":"(c) Option3 — brief reason"},
  {"section":"A","type":"MCQ","question":"Second MCQ?\n(a) Option1\n(b) Option2\n(c) Option3\n(d) Option4","year":"2022","marks":1,"answer":"(a) Option1 — brief reason"},
  {"section":"A","type":"Assertion-Reason","question":"Assertion: Statement about ${unit}.\nReason: Explanation of the assertion.","year":"2023","marks":1,"answer":"(a) Both A and R are true and R is correct explanation of A — explanation"},
  {"section":"B","type":"Short Answer","question":"Short question about ${unit}. (2 marks)","year":"2022","marks":2,"answer":"Detailed 2-mark model answer with key points"},
  {"section":"B","type":"Short Answer","question":"Another short question. (2 marks)","year":"2021","marks":2,"answer":"Detailed 2-mark model answer"},
  {"section":"C","type":"Long Answer","question":"Explain in detail with diagram if needed. (3 marks)","year":"2023","marks":3,"answer":"Detailed 3-mark model answer with all key points a student must write"},
  {"section":"C","type":"Long Answer","question":"Derive or solve problem related to ${unit}. (3 marks)","year":"2022","marks":3,"answer":"Step by step solution with formula and working"},
  {"section":"D","type":"Case Based","question":"Read the following passage and answer:\n[A 3-line context paragraph about a real-life application of ${unit}]\n(i) Sub-question 1\n(ii) Sub-question 2","year":"2023","marks":4,"answer":"(i) Answer to sub-question 1\n(ii) Answer to sub-question 2"}
]

Make ALL questions strictly based on CBSE Class 12 ${subject} syllabus for "${unit}". Use realistic years 2019-2024.`;

  const text = await askGroq(prompt);
  
  // Try to extract JSON array from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      // If parse fails, try cleaning the text
      try {
        const cleaned = jsonMatch[0]
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
          .replace(/,\s*]/g, ']')
          .replace(/,\s*}/g, '}');
        return JSON.parse(cleaned);
      } catch (e2) {
        return [{ section: 'B', type: 'Short Answer', question: `Explain the key concepts of ${unit} in ${subject}.`, year: '2023', marks: 3, answer: 'AI response could not be parsed. Please retry.' }];
      }
    }
  }
  return [{ section: 'B', type: 'Short Answer', question: `Explain ${unit}.`, year: '2023', marks: 3, answer: 'No response from AI. Please retry.' }];
}

// ── Video URL Generator ───────────────────────────────────────────────────────
async function generateVideoURL(subject, unit) {
  if (!client) {
    const query = encodeURIComponent(`${subject} ${unit} CBSE Class 12 full chapter explanation`);
    return `https://www.youtube.com/results?search_query=${query}`;
  }

  const prompt = `You are helping a Class 12 CBSE student find the best YouTube video to study "${unit}" in ${subject}.

Generate the single best YouTube search query (5-10 words) that would find a high quality, exam-focused video for this topic.

Reply with ONLY the search query text, nothing else. No quotes, no explanation.
Example format: physics electric charges fields CBSE class 12 one shot`;

  const searchQuery = (await askGroq(prompt)).trim().replace(/["']/g, '');
  const encoded = encodeURIComponent(searchQuery);
  return `https://www.youtube.com/results?search_query=${encoded}`;
}

async function scanImage(base64, field) {
  if (!client) {
    return `[Mock OCR] This is where the scanned ${field} text would appear. Set GROQ_API_KEY for real scanning.`;
  }

  // Strip the data:image/...;base64, prefix if present
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  const mimeType = base64.includes('data:') ? base64.split(';')[0].split(':')[1] : 'image/jpeg';

  const prompt = field === 'question'
    ? `This image contains a board exam question (may be handwritten or printed). 
Extract and transcribe the complete question text exactly as written. 
If there are multiple parts (a, b, c), include all of them.
Return ONLY the question text, nothing else.`
    : `This image contains a student's handwritten answer to a board exam question.
Extract and transcribe the complete answer text exactly as written.
Preserve paragraph breaks and numbered/bulleted points.
Return ONLY the answer text, nothing else.`;

  try {
    const response = await client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error('Vision model error:', err.message);
    // Fallback: use text model to acknowledge the image
    return `[Image uploaded — please type the ${field} text manually or try a clearer image]`;
  }
}

async function generateMockTest(subject, chapter, difficulty) {
  if (!client) {
    return {
      sectionA: Array(5).fill(null).map((_, i) => ({
        question: `Sample MCQ ${i + 1} about ${chapter}?`,
        options: ['(a) Option 1', '(b) Option 2', '(c) Option 3', '(d) Option 4'],
        correct: 0,
      })),
      sectionB: Array(3).fill(null).map((_, i) => ({ question: `Short answer Q${i + 1} about ${chapter}?`, marks: 2 })),
      sectionC: Array(2).fill(null).map((_, i) => ({ question: `Long answer Q${i + 1} about ${chapter}?`, marks: 5 })),
    };
  }

  const difficultyNote = difficulty === 'easy'
    ? 'basic level, definitions and simple recall'
    : difficulty === 'hard'
    ? 'board exam level, application and derivations'
    : 'moderate level, understanding and application';

  const prompt = `You are a CBSE Class 12 ${subject} paper setter.
Generate a mini board exam paper for chapter: "${chapter}" at ${difficulty} difficulty (${difficultyNote}).

Return ONLY a valid JSON object, no extra text:
{
  "sectionA": [
    {"question": "MCQ question text?", "options": ["(a) opt1", "(b) opt2", "(c) opt3", "(d) opt4"], "correct": 0},
    {"question": "MCQ question text?", "options": ["(a) opt1", "(b) opt2", "(c) opt3", "(d) opt4"], "correct": 2},
    {"question": "MCQ question text?", "options": ["(a) opt1", "(b) opt2", "(c) opt3", "(d) opt4"], "correct": 1},
    {"question": "MCQ question text?", "options": ["(a) opt1", "(b) opt2", "(c) opt3", "(d) opt4"], "correct": 3},
    {"question": "MCQ question text?", "options": ["(a) opt1", "(b) opt2", "(c) opt3", "(d) opt4"], "correct": 0}
  ],
  "sectionB": [
    {"question": "Short answer question 1 about ${chapter}?", "marks": 2},
    {"question": "Short answer question 2 about ${chapter}?", "marks": 2},
    {"question": "Short answer question 3 about ${chapter}?", "marks": 2}
  ],
  "sectionC": [
    {"question": "Long answer / derivation question 1 about ${chapter}?", "marks": 5},
    {"question": "Long answer / numerical question 2 about ${chapter}?", "marks": 5}
  ]
}

Rules:
- correct field is 0-indexed (0=a, 1=b, 2=c, 3=d)
- All questions must be strictly from CBSE Class 12 ${subject} syllabus for "${chapter}"
- Section C should include derivation or numerical if applicable`;

  const text = await askGroq(prompt);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      try {
        const cleaned = jsonMatch[0].replace(/[\u0000-\u001F]/g, ' ').replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        return JSON.parse(cleaned);
      } catch (e2) {
        throw new Error('Could not parse AI response');
      }
    }
  }
  throw new Error('No valid response from AI');
}



module.exports = { initGemini, verifyGemini, askDoubt, generateSummary, generateQuiz, gradeAnswer, generateStudyPlan, generateFlashcards , generateNotes , generatePYQs, generateVideoURL , scanImage , generateMockTest};