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
  login: (data) => api.post('/autenticacao/login', data),
  register: (data) => api.post('/autenticacao/registrar', data),
  me: () => api.get('/autenticacao/eu'),
};

// Sessions
export const sessionApi = {
  list: () => api.get('/sessoes'),
  create: (data) => api.post('/sessoes', data),
  getOne: (id) => api.get(`/sessoes/${id}`),
  updatePre: (id, data) => api.patch(`/sessoes/${id}/pre`, data),
  start: (id) => api.post(`/sessoes/${id}/iniciar`),
  logFluid: (id, data) => api.post(`/sessoes/${id}/liquido`, data),
  updateTemp: (id, data) => api.patch(`/sessoes/${id}/temperatura`, data),
  finish: (id, data) => api.post(`/sessoes/${id}/finalizar`, data),
  delete: (id) => api.delete(`/sessoes/${id}`),
};

// Analytics
export const analyticsApi = {
  dashboard: () => api.get('/analises/painel'),
  weekly: () => api.get('/analises/semanal'),
  hydrationTrend: () => api.get('/analises/tendencia-hidratacao'),
  sessionsHistory: (limit = 20) => api.get('/analises/historico-sessoes', { params: { limit } }),
};

// Meals
export const mealApi = {
  list: (date) => api.get('/refeicoes', { params: { date } }),
  getOne: (id) => api.get(`/refeicoes/${id}`),
  create: (data) => api.post('/refeicoes', data),
  delete: (id) => api.delete(`/refeicoes/${id}`),
};

// Users
export const userApi = {
  updateProfile: (data) => api.put('/usuarios/perfil', data),
  changePassword: (data) => api.put('/usuarios/senha', data),
  notifications: () => api.get('/usuarios/notificacoes'),
  markRead: (id) => api.patch(`/usuarios/notificacoes/${id}/ler`),
};
