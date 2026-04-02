require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initGemini, verifyGemini } = require('./services/geminiService');
const { seedResources } = require('./controllers/resourceController');
const Resource = require('./models/Resource');

// Connect to database and seed if empty
connectDB().then(async () => {
  const count = await Resource.countDocuments();
  if (count === 0) {
    console.log("🗄️ Database empty, auto-seeding resources...");
    // Mock req/res for the controller function
    await seedResources({ query: {} }, { 
      status: () => ({ json: () => {} }), 
      json: () => {} 
    });
  }
});

// Initialize and Verify Gemini AI
initGemini();
verifyGemini();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/resources', require('./routes/resources'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 LMS Backend running on port ${PORT}`);
});
