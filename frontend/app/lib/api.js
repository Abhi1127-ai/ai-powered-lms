const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('lms_token') : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    // If it's an AI error, try to extract the specific message
    const errorMsg = data.message || data.error || 'Server error';
    throw new Error(errorMsg);
  }
  return data;
};

// ─── Auth ──────────────────────────────────────────────────────────────
export const authAPI = {
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    return handleResponse(res);
  },
};

// ─── Dashboard ─────────────────────────────────────────────────────────
export const dashboardAPI = {
  getProgress: async () => {
    const res = await fetch(`${API_BASE}/dashboard/progress`, { headers: getHeaders() });
    return handleResponse(res);
  },

  updateProgress: async (subject, percent) => {
    const res = await fetch(`${API_BASE}/dashboard/update-progress`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ subject, percent }),
    });
    return handleResponse(res);
  },

  getDailyGoals: async () => {
    const res = await fetch(`${API_BASE}/dashboard/daily-goals`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getChapters: async (subject) => {
    const res = await fetch(`${API_BASE}/dashboard/chapters/${encodeURIComponent(subject)}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getLeaderboard: async () => {
    const res = await fetch(`${API_BASE}/dashboard/leaderboard`, { headers: getHeaders() });
    return handleResponse(res);
  },
};

// ─── AI ────────────────────────────────────────────────────────────────
export const aiAPI = {
  askDoubt: async (question, subject) => {
    const res = await fetch(`${API_BASE}/ai/doubt`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question, subject }),
    });
    return handleResponse(res);
  },

  getSummary: async (chapter, subject) => {
    const res = await fetch(`${API_BASE}/ai/summary`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ chapter, subject }),
    });
    return handleResponse(res);
  },

  generateQuiz: async (topic, subject, count = 5) => {
    const res = await fetch(`${API_BASE}/ai/generate-quiz`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ topic, subject, count }),
    });
    return handleResponse(res);
  },

  gradeAnswer: async (question, answer, subject, maxMarks = 5) => {
    const res = await fetch(`${API_BASE}/ai/grade-answer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question, answer, subject, maxMarks }),
    });
    return handleResponse(res);
  },

  generateFlashcards: async (topic, subject, count = 10) => {
    const res = await fetch(`${API_BASE}/ai/generate-flashcards`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ topic, subject, count }),
    });
    return handleResponse(res);
  },
};

// ─── Resources ─────────────────────────────────────────────────────────
export const resourcesAPI = {
  getPYQs: async (subject) => {
    const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
    const res = await fetch(`${API_BASE}/resources/pyqs${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getNotes: async (subject) => {
    const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
    const res = await fetch(`${API_BASE}/resources/notes${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getVideos: async (subject) => {
    const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
    const res = await fetch(`${API_BASE}/resources/videos${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  seed: async () => {
    const res = await fetch(`${API_BASE}/resources/seed`, { 
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
};
