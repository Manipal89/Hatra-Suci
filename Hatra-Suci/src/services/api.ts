import axios, { AxiosResponse } from 'axios';

// Auto-detect API URL for Codespaces or local development
const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname.includes('github.dev') 
    ? window.location.origin.replace(/-8080/, '-5000') + '/api'
    : 'http://localhost:5000/api');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds
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
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Type definitions
interface RegisterData {
  username: string;
  email: string;
  password: string;
  referralCode?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  referralCode: string;
  balance?: number;
  isAdmin: boolean;
  token: string;
}

// Auth API
export const authAPI = {
  register: (data: RegisterData): Promise<AxiosResponse<AuthResponse>> => api.post('/auth/register', data),
  login: (data: LoginData): Promise<AxiosResponse<AuthResponse>> => api.post('/auth/login', data),
  adminLogin: (data: LoginData): Promise<AxiosResponse<AuthResponse>> => api.post('/auth/admin-login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  submitRegistrationDeposit: (data: { userId: string; transactionHash: string; amount: number }) => 
    api.post('/auth/registration-deposit', data),
  getPublicSettings: () => api.get('/auth/settings'),
};

// User API
export const userAPI = {
  // Deposits
  getDeposits: () => api.get('/user/deposits'),
  createDeposit: (data) => api.post('/user/deposits', data),
  
  // Withdrawals
  getWithdrawals: () => api.get('/user/withdrawals'),
  createWithdrawal: (data) => api.post('/user/withdrawals', data),
  
  // Transactions
  getTransactions: () => api.get('/user/transactions'),
  
  // Referrals
  getReferrals: () => api.get('/user/referrals'),
  
  // Spin Wheel
  spinWheel: (data?: { reward: number }) => api.post('/user/spin-wheel', data),
  
  // Level Rewards
  checkLevelRewards: () => api.post('/user/level-rewards/check'),
};

// Admin API
export const adminAPI = {
  // Users
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Deposits
  getAllDeposits: () => api.get('/admin/deposits'),
  updateDeposit: (id, data) => api.put(`/admin/deposits/${id}`, data),
  
  // Withdrawals
  getAllWithdrawals: () => api.get('/admin/withdrawals'),
  updateWithdrawal: (id, data) => api.put(`/admin/withdrawals/${id}`, data),
  
  // Transactions
  getAllTransactions: () => api.get('/admin/transactions'),
  
  // Stats
  getDashboardStats: () => api.get('/admin/stats'),
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  
  // Registration Verification
  getPendingRegistrations: () => api.get('/admin/registration-deposits'),
  verifyRegistrationDeposit: (id, data) => api.put(`/admin/registration-deposits/${id}`, data),
  
  // Bonus Management
  creditBonus: (data: { userId: string; amount: number; description?: string }) => api.post('/admin/bonus', data),
};

export default api;
