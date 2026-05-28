import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('st_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('st_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Sessions
export const sessionApi = {
  list: () => api.get('/sessions'),
  create: (data) => api.post('/sessions', data),
  getOne: (id) => api.get(`/sessions/${id}`),
  updatePre: (id, data) => api.patch(`/sessions/${id}/pre`, data),
  start: (id) => api.post(`/sessions/${id}/start`),
  logFluid: (id, data) => api.post(`/sessions/${id}/fluid`, data),
  updateTemp: (id, data) => api.patch(`/sessions/${id}/temp`, data),
  finish: (id, data) => api.post(`/sessions/${id}/finish`, data),
  delete: (id) => api.delete(`/sessions/${id}`),
};

// Analytics
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  weekly: () => api.get('/analytics/weekly'),
  hydrationTrend: () => api.get('/analytics/hydration-trend'),
  sessionsHistory: (limit = 20) => api.get('/analytics/sessions-history', { params: { limit } }),
};

// Meals
export const mealApi = {
  list: (date) => api.get('/meals', { params: { date } }),
  getOne: (id) => api.get(`/meals/${id}`),
  create: (data) => api.post('/meals', data),
  delete: (id) => api.delete(`/meals/${id}`),
};

// Users
export const userApi = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  notifications: () => api.get('/users/notifications'),
  markRead: (id) => api.patch(`/users/notifications/${id}/read`),
};

// Admin
export const adminApi = {
  listUsers: () => api.get('/admin/users'),
  toggleAdmin: (id) => api.patch(`/admin/users/${id}/toggle-admin`),
  handleRequest: (notificationId, action) =>
    api.post(`/admin/requests/${notificationId}/action`, { action }),
};
