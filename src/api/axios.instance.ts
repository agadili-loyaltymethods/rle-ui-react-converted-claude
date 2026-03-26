import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { storage } from '../utils/storage';
import { tokenService } from '../services/token.service';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 40000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach token, refresh if expired
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const url = config.url || '';
    if (!tokenService.shouldSkipTokenRefresh(url)) {
      if (tokenService.isTokenExpired() && tokenService.isOktaEnabled()) {
        await tokenService.refreshToken();
      }
    }
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    const division = storage.getDivision();
    if (division && config.headers) {
      config.headers['X-Division-Id'] = division;
    }
    // Long timeout for exports
    if (url.includes('export') || url.includes('import')) {
      config.timeout = 120000;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.errorCode;

    // Auth errors - redirect to login
    const authErrorCodes = [1005, 1008, 1009, 1010, 1108, 1116];
    if (status === 401 || authErrorCodes.includes(errorCode)) {
      storage.clearAuth();
      // Redirect to React login page (not AngularJS /int-login)
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
      return Promise.reject(error);
    }

    // Format error message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject({ ...error, message });
  }
);

export { apiClient };
