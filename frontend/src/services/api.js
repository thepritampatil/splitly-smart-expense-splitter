import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('splitly_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      localStorage.removeItem('splitly_token');
      localStorage.removeItem('splitly_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error('You don\'t have permission to do that');
    } else if (status === 404) {
      // Let individual handlers deal with it
    } else if (status >= 500) {
      toast.error('Server error. Please try again.');
    }

    return Promise.reject(error);
  }
);

// =============================================
// AUTH
// =============================================
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login',  data),
};

// =============================================
// USERS
// =============================================
export const userAPI = {
  getMe:         ()       => api.get('/users/me'),
  updateProfile: (data)   => api.put('/users/me', data),
  search:        (query)  => api.get('/users/search', { params: { query } }),
  getFriends:    ()       => api.get('/friends'),
};

// =============================================
// GROUPS
// =============================================
export const groupAPI = {
  getAll:       ()         => api.get('/groups'),
  getById:      (id)       => api.get(`/groups/${id}`),
  create:       (data)     => api.post('/groups', data),
  update:       (id, data) => api.put(`/groups/${id}`, data),
  archive:      (id)       => api.post(`/groups/${id}/archive`),
  invite:       (id, data) => api.post(`/groups/${id}/invite`, data),
  accept:       (id)       => api.post(`/groups/${id}/accept`),
  removeMember: (id, uid)  => api.delete(`/groups/${id}/members/${uid}`),
};

// =============================================
// EXPENSES
// =============================================
export const expenseAPI = {
  getByGroup: (groupId)    => api.get(`/expenses/group/${groupId}`),
  create:     (data)       => api.post('/expenses', data),
  update:     (id, data)   => api.put(`/expenses/${id}`, data),
  delete:     (id)         => api.delete(`/expenses/${id}`),
  getBalances:(groupId)    => api.get(`/expenses/group/${groupId}/balances`),
};

// =============================================
// SETTLEMENTS
// =============================================
export const settlementAPI = {
  getByGroup:    (groupId) => api.get(`/settlements/group/${groupId}`),
  getOptimized:  (groupId) => api.get(`/settlements/group/${groupId}/optimized`),
  initiatePayment:(data)   => api.post('/settlements/pay', data),
  confirmPayment: (data)   => api.post('/settlements/confirm', data),
  declinePayment: (id)     => api.post(`/settlements/${id}/decline`),
};

// =============================================
// ANALYTICS
// =============================================
export const analyticsAPI = {
  getMonthly:  (groupId) => api.get(`/analytics/monthly/${groupId}`),
  getCategory: (groupId) => api.get(`/analytics/category/${groupId}`),
};

// =============================================
// ACTIVITIES
// =============================================
export const activityAPI = {
  getMy:      ()        => api.get('/activities'),
  getByGroup: (groupId) => api.get(`/activities/group/${groupId}`),
};

// =============================================
// MESSAGES
// =============================================
export const messageAPI = {
  getByGroup: (groupId) => api.get(`/messages/group/${groupId}`),
  send:       (data)    => api.post('/messages', data),
};

export default api;
