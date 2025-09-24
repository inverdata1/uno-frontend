import { create } from 'zustand';
import { Alert } from 'react-native';
import { authService } from '../services/auth-service';

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
      // Success
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
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

  // Initialize auth state listener - TEMPORARILY DISABLED
  initializeAuth: () => {
    console.log('🚫 Firebase auth state listener DISABLED for testing');
    // Manually set initial auth state without listener
    console.log('🔧 Setting initial auth state manually');
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    // Return a dummy unsubscribe function
    return () => {};

    /* ORIGINAL CODE - TEMPORARILY COMMENTED OUT
    return authService.onAuthStateChanged((user) => {
      console.log('🔥 Firebase auth state changed:', { user: !!user, uid: user?.uid });
      console.log('⚠️  Auth state listener is setting store state');
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
      console.log('✅ Auth state listener finished setting store state');
    });
    */
  },

  // Getters
  getUser: () => get().user,
  getUserId: () => get().user?.uid,
  getUserEmail: () => get().user?.email,
}));