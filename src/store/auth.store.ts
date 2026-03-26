import { create } from 'zustand';
import { storage } from '../utils/storage';

interface UserInfo {
  id: string;
  email: string;
  username: string;
  division?: string;
  divisionName?: string;
  divisionCheckEnabled?: boolean;
  divisionPermissions?: Record<string, unknown>;
}

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  permissions: string[];
  flags: Record<string, unknown>;
  setUser: (user: UserInfo) => void;
  setPermissions: (permissions: string[]) => void;
  setFlags: (flags: Record<string, unknown>) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  permissions: [],
  flags: {},

  setUser: (user) => {
    storage.setUserId(user.id);
    storage.setUsername(user.username);
    storage.setUserEmail(user.email);
    if (user.division) storage.setDivision(user.division);
    if (user.divisionName) storage.setDivisionName(user.divisionName);
    if (user.divisionPermissions) storage.setDivisionPermissions(user.divisionPermissions);
    set({ user, isAuthenticated: true });
  },

  setPermissions: (permissions) => set({ permissions }),

  setFlags: (flags) => set({ flags }),

  logout: () => {
    storage.clearAuth();
    set({ user: null, isAuthenticated: false, permissions: [] });
  },

  loadFromStorage: () => {
    const token = storage.getToken();
    const userId = storage.getUserId();
    const username = storage.getUsername();
    const email = storage.getUserEmail();
    if (token && userId) {
      set({
        user: {
          id: userId,
          email: email || '',
          username: username || '',
          division: storage.getDivision() || undefined,
          divisionName: storage.getDivisionName() || undefined,
          divisionPermissions: storage.getDivisionPermissions() || undefined,
        },
        isAuthenticated: true,
      });
    }
  },
}));
