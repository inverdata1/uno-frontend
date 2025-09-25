import { useEffect } from 'react';
import { useAuthStore } from '../../../shared/stores/auth-store';
import { useRoleStore } from '../../../shared/stores/role-store';

// Custom hook that initializes auth state on app start
export const useAuthState = () => {
  const { initializeAuth } = useAuthStore();
  const { initializeRoles, reset: resetRoles } = useRoleStore();

  useEffect(() => {
    // Initialize auth listener - this will handle auth state changes
    const unsubscribe = initializeAuth();

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [initializeAuth]);

  // Subscribe to user changes to initialize roles
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.roles) {
      // Initialize roles from user data
      initializeRoles(user.roles);
    } else if (!user) {
      // Reset roles when user signs out
      resetRoles();
    }
  }, [user, initializeRoles, resetRoles]);

  return {
    // Return auth store values for compatibility
    user: useAuthStore(state => state.user),
    isLoading: useAuthStore(state => state.isLoading),
    isAuthenticated: useAuthStore(state => state.isAuthenticated),
    signOut: useAuthStore(state => state.signOut),
  };
};