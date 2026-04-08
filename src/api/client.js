import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD 
  ? 'https://medquiz-backend-2xwa.onrender.com/api' 
  : 'http://localhost:8000/api');

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// JWT interceptor
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('medquiz_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('medquiz_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ---------- Auth ----------
export const auth = {
  login: (username, password) =>
    client.post('/auth/login', { username, password }),
  me: () => client.get('/auth/me'),
};

// ---------- Document ----------
export const document = {
  getBooks: () => client.get('/document/books'),
  getStatus: (bookId) => client.get(`/document/status?book_id=${bookId}`),
  getInfo: (bookId) => client.get(`/document/info?book_id=${bookId}`),
  getTree: (bookId) => client.get(`/document/tree?book_id=${bookId}`),
  getPages: (pages, bookId) => client.get(`/document/pages?pages=${pages}&book_id=${bookId}`),
  search: (q, bookId, topK = 5) => client.get(`/document/search?q=${encodeURIComponent(q)}&book_id=${bookId}&top_k=${topK}`),
};

// ---------- Quiz ----------
export const quiz = {
  generate: (data) => client.post('/quiz/generate', data),
};

// ---------- Q&A ----------
export const qa = {
  ask: (data) => client.post('/qa/ask', data),
  summarize: (data) => client.post('/qa/summarize', data),
  getSession: (sessionId) => client.get(`/qa/session/${sessionId}`),
};

export default client;
