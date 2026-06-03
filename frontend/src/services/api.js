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
  list: (userId) => api.get('/sessions', { params: { userId } }),
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
  dashboard: (userId) => api.get('/analytics/dashboard', { params: { userId } }),
  weekly: (userId) => api.get('/analytics/weekly', { params: { userId } }),
  hydrationTrend: (userId) => api.get('/analytics/hydration-trend', { params: { userId } }),
  sessionsHistory: (limit = 20, userId) => api.get('/analytics/sessions-history', { params: { limit, userId } }),
};

// Teams
export const teamApi = {
  list: () => api.get('/teams'),
  create: (data) => api.post('/teams', data),
  getOne: (id) => api.get(`/teams/${id}`),
  getReport: (id, period = 'all') => api.get(`/teams/${id}/report`, { params: { period } }),
  delete: (id) => api.delete(`/teams/${id}`),
  invite: (id, email) => api.post(`/teams/${id}/invite`, { email }),
  join: (id) => api.post(`/teams/${id}/join`),
  respond: (id, data) => api.post(`/teams/${id}/respond`, data),
  leave: (id) => api.post(`/teams/${id}/leave`),
  removeMember: (id, athleteId) => api.delete(`/teams/${id}/remove/${athleteId}`),
  respondFromNotification: (notificationId, action) =>
    api.post(`/teams/requests/${notificationId}/action`, { action }),
  search: (query) => api.get('/teams/search', { params: { q: query } }),
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
