import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const API = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TRANSACTIONS: '/api/transactions',
  TRANSACTIONS_SUMMARY: '/api/transactions/summary',
  ANALYTICS: '/api/analytics',
  UPDATE_PASSWORD: '/api/auth/update-password',
  CSV_PREVIEW: '/api/csv/preview',
  CSV_IMPORT: '/api/csv/import',
  CSV_DRY_RUN: '/api/csv/dry-run',
  CSV_HISTORY: '/api/csv/history',
  BUDGETS: '/api/budgets',
  HEALTH: '/api/health'
};

export { api };
export default API;
