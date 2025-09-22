import { create } from 'zustand';

// Auth state store (not persisted - Firebase handles persistence)
export const useAuthStore = create((set, get) => ({
  // Auth state
  user: null,
  isLoading: true,
  isAuthenticated: false,

  // Actions
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  signOut: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  // Getters
  getUser: () => get().user,
  getUserId: () => get().user?.uid,
  getUserEmail: () => get().user?.email,
}));