const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export const API = {
  BASE_URL: API_BASE_URL,
  TRANSACTIONS: `${API_BASE_URL}/api/transactions`,
  TRANSACTIONS_SUMMARY: `${API_BASE_URL}/api/transactions/summary`,
  CSV_PREVIEW: `${API_BASE_URL}/api/csv/preview`,
  CSV_IMPORT: `${API_BASE_URL}/api/csv/import`,
  CSV_DRY_RUN: `${API_BASE_URL}/api/csv/dry-run`,
  HEALTH: `${API_BASE_URL}/api/health`
};

export default API;
