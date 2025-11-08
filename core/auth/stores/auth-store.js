import { create } from 'zustand';
import { authService } from '../services/auth-service';
import { queryClient } from '../../../shared/config/query-client';

// Auth state store (not persisted - Firebase handles persistence)
export const useAuthStore = create((set, get) => ({
  // Auth state
  user: null,
  isLoading: true,
  isSubmitting: false, // For form submissions that shouldn't affect global loading
  isAuthenticated: false,
  error: null,

  // Actions
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setError: (error) =>
    set({ error, isLoading: false }),

  clearError: () =>
    set({ error: null }),

  // Auth actions using service
  signUp: async (userData) => {
    set({ isLoading: true, error: null });

    const result = await authService.signUp(userData);

    if (result.error) {
      // Service returned an error - temporarily disable alert
      console.log('🚨 SIGNUP ERROR (Alert disabled):', result.error);
      set({
        isLoading: false,
        isAuthenticated: false,
      });
      return { error: result.error };
    } else {
      // Success - manually set user state with complete data
      // This prevents race condition with auth listener
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Invalidate user-types query to ensure correct user type is loaded
      queryClient.invalidateQueries({ queryKey: ['user-types'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });

      console.log('✅ Registration successful with complete user data');

      return result;
    }
  },

  signIn: async (credentials) => {
    set({ isSubmitting: true, error: null });

    const result = await authService.signIn(credentials);

    if (result.error) {
      set({
        isSubmitting: false,
        isAuthenticated: false,
        error: result.error,
      });
      return { error: result.error };
    } else {
      set({
        user: result.user,
        isAuthenticated: true,
        isSubmitting: false,
        error: null,
      });
      return result;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // Initialize auth state listener
  initializeAuth: () => {
    return authService.onAuthStateChanged((user) => {
      console.log('🔥 Firebase auth state changed:', { user: !!user, uid: user?.uid });
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
      console.log('✅ Auth state listener set store state:', { isAuthenticated: !!user });
    });
  },

  // Refresh user data from React Query cache
  refreshUser: async () => {
    queryClient.invalidateQueries({ queryKey: ['user-types'] });
    queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
    console.log('🔄 Refreshed user data');
  },

  // Getters
  getUser: () => get().user,
  getUserId: () => get().user?.uid,
  getUserEmail: () => get().user?.email,
}));