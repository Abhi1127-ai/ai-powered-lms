const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const result = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent('test');
    console.log('Success with gemini-1.5-flash');
  } catch (e) {
    console.error('Failure with gemini-1.5-flash:', e.message);
    
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // We can't easily list models with the SDK without more complex code, but we can try gemini-pro
        const result = await genAI.getGenerativeModel({ model: 'gemini-pro' }).generateContent('test');
        console.log('Success with gemini-pro');
    } catch (e2) {
        console.error('Failure with gemini-pro:', e2.message);
    }
  }
}

listModels();
