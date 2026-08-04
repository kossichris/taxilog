import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'OWNER' | 'DRIVER';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user: User | null) =>
        set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
