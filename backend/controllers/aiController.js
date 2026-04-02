const AILog = require('../models/AILog');
const gemini = require('../services/geminiService');

// @desc    Ask a doubt (Hinglish AI)
// @route   POST /api/ai/doubt
const askDoubt = async (req, res) => {
  try {
    const { question, subject } = req.body;
    if (!question) return res.status(400).json({ message: 'Question is required' });

    const response = await gemini.askDoubt(question, subject || 'General');

    // Log the interaction
    await AILog.create({
      userId: req.user._id,
      type: 'doubt',
      prompt: question,
      response,
      subject: subject || 'General',
    });

    res.json({ answer: response });
  } catch (error) {
    console.error('Doubt error:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

// @desc    Generate one-page summary
// @route   POST /api/ai/summary
const getSummary = async (req, res) => {
  try {
    const { chapter, subject } = req.body;
    if (!chapter || !subject) {
      return res.status(400).json({ message: 'Chapter and subject are required' });
    }

    const response = await gemini.generateSummary(chapter, subject);

    await AILog.create({
      userId: req.user._id,
      type: 'summary',
      prompt: `${chapter} — ${subject}`,
      response,
      subject,
      topic: chapter,
    });

    res.json({ summary: response });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

// @desc    Generate a quiz
// @route   POST /api/ai/generate-quiz
const getQuiz = async (req, res) => {
  try {
    const { topic, subject, count } = req.body;
    if (!topic || !subject) {
      return res.status(400).json({ message: 'Topic and subject are required' });
    }

    const questions = await gemini.generateQuiz(topic, subject, count || 5);

    await AILog.create({
      userId: req.user._id,
      type: 'quiz',
      prompt: `${topic} — ${subject}`,
      response: questions,
      subject,
      topic,
    });

    res.json({ questions });
  } catch (error) {
    console.error('Quiz error:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

// @desc    Grade an answer
// @route   POST /api/ai/grade-answer
const gradeAnswer = async (req, res) => {
  try {
    const { question, answer, subject, maxMarks } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const result = await gemini.gradeAnswer(
      question,
      answer,
      subject || 'General',
      maxMarks || 5
    );

    await AILog.create({
      userId: req.user._id,
      type: 'grade',
      prompt: JSON.stringify({ question, answer }),
      response: result,
      subject: subject || 'General',
    });

    res.json({ result });
  } catch (error) {
    console.error('Grade error:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

// @desc    Generate Flashcards
// @route   POST /api/ai/generate-flashcards
const getFlashcards = async (req, res) => {
  try {
    const { topic, subject, count } = req.body;
    if (!topic || !subject) {
      return res.status(400).json({ message: 'Topic and subject are required' });
    }

    const cards = await gemini.generateFlashcards(topic, subject, count || 10);

    await AILog.create({
      userId: req.user._id,
      type: 'flashcards',
      prompt: `${topic} — ${subject}`,
      response: cards,
      subject,
      topic,
    });

    res.json({ cards });
  } catch (error) {
    console.error('Flashcard error:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

module.exports = { askDoubt, getSummary, getQuiz, gradeAnswer, getFlashcards };
