import axios from 'axios';
import API_URL from './api';

export const ADMIN_TOKEN_KEY = 'halal-wealth-admin-token';

const adminApi = axios.create({ baseURL: API_URL });

adminApi.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      window.dispatchEvent(new Event('admin-session-expired'));
    }
    return Promise.reject(error);
  },
);

export default adminApi;