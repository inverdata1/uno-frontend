import { useEffect } from 'react';
import { useAuthStore } from '../../../shared/stores/auth-store';
import { useModeStore } from '../../../shared/stores/mode-store';

// Custom hook that initializes auth state on app start
export const useAuthState = () => {
  const { initializeAuth } = useAuthStore();
  const { initializeFromUserModes, reset: resetModes } = useModeStore();

  useEffect(() => {
    // Initialize auth listener - this will handle auth state changes
    const unsubscribe = initializeAuth();

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [initializeAuth]);

  // Subscribe to user changes to initialize modes
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && (user.availableModes || user.currentMode)) {
      // Initialize modes from user data
      initializeFromUserModes({
        currentMode: user.currentMode,
        availableModes: user.availableModes,
        businessContexts: user.businessContexts,
        currentContext: user.currentContext
      });
    } else if (!user) {
      // Reset modes when user signs out
      resetModes();
    }
  }, [user, initializeFromUserModes, resetModes]);

  return {
    // Return auth store values for compatibility
    user: useAuthStore(state => state.user),
    isLoading: useAuthStore(state => state.isLoading),
    isAuthenticated: useAuthStore(state => state.isAuthenticated),
    signOut: useAuthStore(state => state.signOut),
  };
};