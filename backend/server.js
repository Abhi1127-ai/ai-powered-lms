require('dotenv').config();
console.log("--- ENV CHECK ---");
console.log("Key starts with:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 7) : "NOT FOUND");
console.log("-----------------");
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const Resource = require('./models/Resource');
const { initGemini, verifyGemini } = require('./services/geminiService');
const { seedResources } = require('./controllers/resourceController');
const resourceRoutes = require('./routes/resourceRoutes');
const notesRoutes = require("./routes/notes");
const badgesRoutes = require('./routes/badges');

connectDB().then(async () => {
  try {
    const count = await Resource.countDocuments();
    if (count === 0) {
      console.log("🗄️ Database empty, auto-seeding resources...");
      // Mock req/res for the controller function
      await seedResources({ query: {} }, { 
        status: () => ({ json: () => {} }), 
        json: () => {} 
      });
    }
  } catch (error) {
    console.error(" Seeding Error:", error.message);
  }
});

// Initialize and Verify Grok/Gemini AI
initGemini();
verifyGemini();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/resources', resourceRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/notes", notesRoutes);
app.use('/api/badges', badgesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 LMS Backend running on port ${PORT}`);
});