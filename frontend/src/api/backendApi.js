import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('anitrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('anitrack_token');
      localStorage.removeItem('anitrack_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me')
};

// User Media CRUD
export const userMediaApi = {
  getAll: (params) => api.get('/api/usermedia', { params }),
  add: (data) => api.post('/api/usermedia', data),
  update: (id, data) => api.put(`/api/usermedia/${id}`, data),
  remove: (id) => api.delete(`/api/usermedia/${id}`),
  getStats: () => api.get('/api/usermedia/stats')
};

export default api;
