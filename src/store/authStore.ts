import { create } from 'zustand';
import type { User } from '../shared/types/platform.types';

interface AuthState {
  currentUser: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  setUser: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
}));
