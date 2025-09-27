import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api-client';

/**
 * Custom hooks for user modes management
 * Handles mode switching, mode status, and business contexts
 */

// === QUERY HOOKS ===

/**
 * Get user's available modes and current context
 */
export const useUserModes = () => {
  return useQuery({
    queryKey: ['user-modes'],
    queryFn: async () => {
      const res = await apiClient.get('/user-modes');
      // If API returns null, provide safe defaults
      if (!res.data) {
        console.warn('User modes API returned null, using safe defaults');
        return {
          currentMode: 'client',
          currentContext: { businessId: null, branchId: null },
          availableModes: ['client'],
          modes: { client: { status: 'active' } }
        };
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Get user profile with mode information
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['users', 'profile'],
    queryFn: () => apiClient.get('/users/profile').then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get user's businesses for mode switching
 */
export const useUserBusinesses = () => {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: () => apiClient.get('/businesses').then(res => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// === MUTATION HOOKS ===

/**
 * Switch user's current mode
 */
export const useSwitchMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mode, businessId, branchId }) =>
      apiClient.post('/user-modes/switch', { mode, businessId, branchId }).then(res => res.data),

    onSuccess: (data, variables) => {
      console.log('✅ Mode switched successfully:', data);

      // Update user modes cache
      queryClient.setQueryData(['user-modes'], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          currentMode: variables.mode,
          currentContext: {
            businessId: variables.businessId || null,
            branchId: variables.branchId || null
          }
        };
      });

      // Invalidate related queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['user-modes'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });

      // Clear context-sensitive data that might be cached
      if (variables.mode === 'business') {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    },

    onError: (error) => {
      console.error('❌ Failed to switch mode:', error);
    }
  });
};

/**
 * Add/Enable a new mode for user
 */
export const useEnableMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mode, status = 'pending', modeData = {} }) =>
      apiClient.post('/user-modes', { mode, status, modeData }).then(res => res.data),

    onSuccess: (data, variables) => {
      console.log('✅ Mode enabled successfully:', variables.mode);

      // Invalidate user modes to refresh available modes
      queryClient.invalidateQueries({ queryKey: ['user-modes'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });

      // If enabling business mode, refresh businesses
      if (variables.mode === 'business') {
        queryClient.invalidateQueries({ queryKey: ['businesses'] });
      }
    },

    onError: (error) => {
      console.error('❌ Failed to enable mode:', error);
    }
  });
};

/**
 * Update mode status (e.g., pending -> active)
 */
export const useUpdateModeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mode, status }) =>
      apiClient.patch('/user-modes/status', { mode, status }).then(res => res.data),

    onSuccess: (data, variables) => {
      console.log('✅ Mode status updated:', variables);

      // Refresh user modes
      queryClient.invalidateQueries({ queryKey: ['user-modes'] });
    },

    onError: (error) => {
      console.error('❌ Failed to update mode status:', error);
    }
  });
};

/**
 * Create a new business (enables business mode if not already enabled)
 */
export const useCreateBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (businessData) =>
      apiClient.post('/businesses', businessData).then(res => res.data),

    onSuccess: (data) => {
      console.log('✅ Business created successfully:', data.name);

      // Refresh businesses list
      queryClient.invalidateQueries({ queryKey: ['businesses'] });

      // Refresh user modes (might have enabled business mode)
      queryClient.invalidateQueries({ queryKey: ['user-modes'] });

      // Set optimistic data for the new business
      queryClient.setQueryData(['businesses'], (oldData = []) => [
        ...oldData,
        data
      ]);
    },

    onError: (error) => {
      console.error('❌ Failed to create business:', error);
    }
  });
};

// === UTILITY HOOKS ===

/**
 * Get current mode information
 * Returns current mode and context from cache
 */
export const useCurrentMode = () => {
  const { data: userModes } = useUserModes();

  if (!userModes) {
    return {
      currentMode: 'client',
      currentContext: { businessId: null, branchId: null },
      isLoading: true
    };
  }

  return {
    currentMode: userModes.currentMode,
    currentContext: userModes.currentContext,
    availableModes: userModes.availableModes,
    isLoading: false
  };
};

/**
 * Check if user has specific mode
 */
export const useHasMode = (mode) => {
  const { data: userModes } = useUserModes();
  return userModes?.availableModes?.includes(mode) || false;
};

/**
 * Get business contexts for mode switcher
 */
export const useBusinessContexts = () => {
  const { data: userModes } = useUserModes();
  return userModes?.businessContexts || [];
};