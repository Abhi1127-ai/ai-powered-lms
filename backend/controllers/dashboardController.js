const User = require('../models/User');
const { generateStudyPlan } = require('../services/geminiService');

const SUBJECTS = {
  '10': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'],
  '12': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'],
};

const CHAPTERS = {
  Physics: [
    'Electric Charges and Fields',
    'Electrostatic Potential and Capacitance',
    'Current Electricity',
    'Moving Charges and Magnetism',
    'Magnetism and Matter',
    'Electromagnetic Induction',
    'Alternating Current',
    'Electromagnetic Waves',
    'Ray Optics',
    'Wave Optics',
    'Dual Nature of Radiation and Matter',
    'Atoms',
    'Nuclei',
    'Semiconductor Electronics',
  ],
  Chemistry: [
    'The Solid State',
    'Solutions',
    'Electrochemistry',
    'Chemical Kinetics',
    'Surface Chemistry',
    'Isolation of Elements',
    'p-Block Elements',
    'd and f Block Elements',
    'Coordination Compounds',
    'Haloalkanes and Haloarenes',
    'Alcohols, Phenols and Ethers',
    'Aldehydes, Ketones and Carboxylic Acids',
    'Amines',
    'Biomolecules',
    'Polymers',
    'Chemistry in Everyday Life',
  ],
  Mathematics: [
    'Relations and Functions',
    'Inverse Trigonometric Functions',
    'Matrices',
    'Determinants',
    'Continuity and Differentiability',
    'Application of Derivatives',
    'Integrals',
    'Application of Integrals',
    'Differential Equations',
    'Vector Algebra',
    'Three Dimensional Geometry',
    'Linear Programming',
    'Probability',
  ],
  Biology: [
    'Reproduction in Organisms',
    'Sexual Reproduction in Flowering Plants',
    'Human Reproduction',
    'Reproductive Health',
    'Principles of Inheritance and Variation',
    'Molecular Basis of Inheritance',
    'Evolution',
    'Human Health and Disease',
    'Microbes in Human Welfare',
    'Biotechnology Principles and Processes',
    'Biotechnology and its Applications',
    'Organisms and Populations',
    'Ecosystem',
    'Biodiversity and Conservation',
  ],
  Science: [
    'Chemical Reactions and Equations',
    'Acids, Bases and Salts',
    'Metals and Non-metals',
    'Carbon and its Compounds',
    'Life Processes',
    'Control and Coordination',
    'Heredity and Evolution',
    'Light - Reflection and Refraction',
    'Human Eye and Colourful World',
    'Electricity',
    'Magnetic Effects of Electric Current',
    'Sources of Energy',
  ],
};

// @desc    Get student progress & dashboard data
// @route   GET /api/dashboard/progress
const getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const subjects = SUBJECTS[user.studentClass] || SUBJECTS['12'];
    const progress = {};

    subjects.forEach((sub) => {
      progress[sub] = user.progress?.get(sub) || 0;
    });

    res.json({
      name: user.name,
      studentClass: user.studentClass,
      board: user.board,
      subjects,
      progress,
      streakCount: user.streakCount,
      points: user.points,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update progress for a subject
// @route   POST /api/dashboard/update-progress
const updateProgress = async (req, res) => {
  try {
    const { subject, percent } = req.body;
    const user = await User.findById(req.user._id);
    user.progress.set(subject, Math.min(100, Math.max(0, percent)));
    user.points += 10; // Award points for progress
    await user.save();
    res.json({ message: 'Progress updated', progress: Object.fromEntries(user.progress) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get AI-suggested daily goals
// @route   GET /api/dashboard/daily-goals
const getDailyGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const progress = Object.fromEntries(user.progress || new Map());
    
    // Call Gemini to generate a personalized plan
    const aiPlan = await generateStudyPlan(user.studentClass, user.board, progress);

    res.json(aiPlan);
  } catch (error) {
    console.error('Study Plan Error:', error);
    res.status(500).json({ message: 'Server error generating study plan' });
  }
};

// @desc    Get chapters for a subject
// @route   GET /api/dashboard/chapters/:subject
const getChapters = async (req, res) => {
  const { subject } = req.params;
  const chapters = CHAPTERS[subject] || [];
  res.json({ subject, chapters });
};

// @desc    Get leaderboard
// @route   GET /api/dashboard/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select('name points streakCount studentClass')
      .sort({ points: -1 })
      .limit(20);
    res.json({ leaderboard: users });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProgress, updateProgress, getDailyGoals, getChapters, getLeaderboard };
