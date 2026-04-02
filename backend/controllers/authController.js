const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new student
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, studentClass, board, subjects } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      studentClass,
      board: board || 'CBSE',
      subjects: subjects || [],
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      studentClass: user.studentClass,
      board: user.board,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      // Update streak
      const today = new Date().toDateString();
      const lastActive = user.lastActiveDate
        ? new Date(user.lastActiveDate).toDateString()
        : null;

      if (lastActive !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        user.streakCount =
          lastActive === yesterday ? user.streakCount + 1 : 1;
        user.lastActiveDate = new Date();
        await user.save();
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        studentClass: user.studentClass,
        board: user.board,
        subjects: user.subjects,
        streakCount: user.streakCount,
        points: user.points,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };
