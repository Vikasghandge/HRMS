import axios from 'axios';

// Use relative path so nginx proxy works correctly
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Employee APIs
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getStatistics: () => api.get('/employees/statistics'),
};

// Leave APIs
export const leaveAPI = {
  apply: (data) => api.post('/leaves/apply', data),
  getMyLeaves: () => api.get('/leaves/my-leaves'),
  getAll: () => api.get('/leaves'),
  updateStatus: (id, data) => api.put(`/leaves/${id}/status`, data),
  getBalance: () => api.get('/leaves/balance'),
};

// Attendance APIs
export const attendanceAPI = {
  checkIn: () => api.post('/attendance/checkin'),
  checkOut: () => api.post('/attendance/checkout'),
  getMyAttendance: (params) => api.get('/attendance/my-attendance', { params }),
  getAll: (params) => api.get('/attendance', { params }),
  getTodayStatus: () => api.get('/attendance/today-status'),
};

// Profile APIs
export const profileAPI = {
  getMyProfile: () => api.get('/profile/my-profile'),
  updateProfile: (data) => api.put('/profile/update', data),
  addExperience: (data) => api.post('/profile/experience', data),
  deleteExperience: (id) => api.delete(`/profile/experience/${id}`),
  addEducation: (data) => api.post('/profile/education', data),
  deleteEducation: (id) => api.delete(`/profile/education/${id}`),
  addSkill: (data) => api.post('/profile/skills', data),
  deleteSkill: (id) => api.delete(`/profile/skills/${id}`),
  addDocument: (data) => api.post('/profile/documents', data),
  deleteDocument: (id) => api.delete(`/profile/documents/${id}`)
};

// Analytics APIs
export const analyticsAPI = {
  getAnalytics: (params) => api.get('/analytics', { params }),
  getHeadcountTrend: () => api.get('/analytics/headcount-trend')
};

export default api;
