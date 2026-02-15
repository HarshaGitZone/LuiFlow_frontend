const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

import axios from 'axios';

const api = axios.create({
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
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const API = {
  BASE_URL: API_BASE_URL,
  TRANSACTIONS: `${API_BASE_URL}/api/transactions`,
  TRANSACTIONS_SUMMARY: `${API_BASE_URL}/api/transactions/summary`,
  CSV_PREVIEW: `${API_BASE_URL}/api/csv/preview`,
  CSV_IMPORT: `${API_BASE_URL}/api/csv/import`,
  CSV_DRY_RUN: `${API_BASE_URL}/api/csv/dry-run`,
  HEALTH: `${API_BASE_URL}/api/health`
};

export { api };
export default API;
