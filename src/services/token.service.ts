import { jwtDecode } from 'jwt-decode';
import { storage } from '../utils/storage';
import axios from 'axios';

interface JwtPayload {
  exp: number;
  [key: string]: unknown;
}

const SKIP_REFRESH_URLS = ['/login', '/int-login', '/callback', '/refresh-token', '/logout'];

export const tokenService = {
  isOktaEnabled: () => storage.isOktaEnabled(),

  getAccessToken: () => storage.getToken(),

  getRefreshToken: () => storage.getRefreshToken(),

  isTokenExpired: (): boolean => {
    const token = storage.getToken();
    if (!token) return true;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const buffer = parseInt(sessionStorage.getItem('tokenExpirationBuffer') || '120');
      const expiresAt = decoded.exp - buffer;
      return Date.now() / 1000 >= expiresAt;
    } catch {
      return true;
    }
  },

  refreshToken: async (): Promise<string | null> => {
    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) return null;
    try {
      const response = await axios.post('/refresh-token', { refreshToken });
      const { access_token, refresh_token } = response.data;
      storage.setToken(access_token);
      if (refresh_token) storage.setRefreshToken(refresh_token);
      return access_token;
    } catch {
      storage.clearAuth();
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
      return null;
    }
  },

  saveTokens: (data: { access_token?: string; refresh_token?: string; id_token?: string }) => {
    const tokenType = sessionStorage.getItem('tokenTypeForCrud') || 'access_token';
    const token = tokenType === 'id_token' ? data.id_token : data.access_token;
    if (token) storage.setToken(token);
    if (data.refresh_token) storage.setRefreshToken(data.refresh_token);
  },

  clearTokens: () => storage.clearAuth(),

  shouldSkipTokenRefresh: (url: string): boolean => {
    return SKIP_REFRESH_URLS.some((skip) => url.includes(skip));
  },
};
