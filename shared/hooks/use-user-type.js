import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api-client';

/**
 * User Type Hooks - Single Source of Truth
 * Manages user types (client, business, driver) and type switching
 *
 * Terminology:
 * - userType: The type of user (client, business, driver)
 * - context: Additional data like businessId, branchId for business type
 * - availableUserTypes: All user types the user has access to
 */

// ========================================
// QUERY HOOKS
// ========================================

/**
 * Get user's available types and current context
 * This is the main hook - use this in most components
 */
export const useUserType = () => {
  return useQuery({
    queryKey: ['user-types'],
    queryFn: async () => {
      const res = await apiClient.get('/user-types'); // API endpoint unchanged for now

      // Safe defaults if API returns null
      if (!res.data) {
        console.warn('User types API returned null, using safe defaults');
        return {
          currentUserType: 'client',
          currentContext: { businessId: null, branchId: null },
          availableUserTypes: ['client'],
          userTypes: { client: { status: 'active' } }
        };
      }

      // Transform API response to use userType terminology
      return {
        currentUserType: res.data.currentUserType || 'client',
        currentContext: res.data.currentContext || { businessId: null, branchId: null },
        availableUserTypes: res.data.availableUserTypes || ['client'],
        userTypes: res.data.userTypes || { client: { status: 'active' } }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Get current user type information (lightweight)
 * Use this for quick access to current user type
 */
export const useCurrentUserType = () => {
  const { data: userTypeData, isLoading } = useUserType();

  if (!userTypeData || isLoading) {
    return {
      currentUserType: 'client',
      currentContext: { businessId: null, branchId: null },
      availableUserTypes: ['client'],
      isLoading: true
    };
  }

  return {
    currentUserType: userTypeData.currentUserType,
    currentContext: userTypeData.currentContext,
    availableUserTypes: userTypeData.availableUserTypes,
    isLoading: false
  };
};

/**
 * Check if user has a specific type
 */
export const useHasUserType = (userType) => {
  const { data: userTypeData } = useUserType();
  return userTypeData?.availableUserTypes?.includes(userType) || false;
};

/**
 * Get user profile with type information
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['users', 'profile'],
    queryFn: () => apiClient.get('/users/profile').then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get user's businesses (for business type)
 */
export const useUserBusinesses = () => {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: () => apiClient.get('/businesses').then(res => res.data),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Get business contexts for type switcher
 */
export const useBusinessContexts = () => {
  const { data: userTypeData } = useUserType();
  return userTypeData?.businessContexts || [];
};

// ========================================
// MUTATION HOOKS
// ========================================

/**
 * Switch user's current type
 */
export const useSwitchUserType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userType, businessId, branchId }) => {
      return apiClient.post('/user-types/switch', {
        userType: userType,
        businessId,
        branchId
      }).then(res => res.data);
    },

    onSuccess: (data, variables) => {
      console.log('✅ User type switched successfully:', variables.userType);

      // Update cache with new terminology
      queryClient.setQueryData(['user-types'], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          currentUserType: variables.userType,
          currentContext: {
            businessId: variables.businessId || null,
            branchId: variables.branchId || null
          }
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['user-types'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });

      // Clear context-sensitive data
      if (variables.userType === 'business') {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    },

    onError: (error) => {
      console.error('❌ Failed to switch user type:', error);
    }
  });
};

/**
 * Enable a new user type
 */
export const useEnableUserType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userType, status = 'pending', typeData = {} }) => {
      return apiClient.post('/user-types', {
        userType: userType,
        status,
        userTypeData: typeData
      }).then(res => res.data);
    },

    onSuccess: (data, variables) => {
      console.log('✅ User type enabled:', variables.userType);

      queryClient.invalidateQueries({ queryKey: ['user-types'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });

      if (variables.userType === 'business') {
        queryClient.invalidateQueries({ queryKey: ['businesses'] });
      }
    },

    onError: (error) => {
      console.error('❌ Failed to enable user type:', error);
    }
  });
};

/**
 * Update user type status
 */
export const useUpdateUserTypeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userType, status }) => {
      return apiClient.patch('/user-types/status', {
        userType: userType,
        status
      }).then(res => res.data);
    },

    onSuccess: (data, variables) => {
      console.log('✅ User type status updated:', variables);
      queryClient.invalidateQueries({ queryKey: ['user-types'] });
    },

    onError: (error) => {
      console.error('❌ Failed to update user type status:', error);
    }
  });
};

/**
 * Create a new business (enables business type if not already enabled)
 */
export const useCreateBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (businessData) =>
      apiClient.post('/businesses', businessData).then(res => res.data),

    onSuccess: (data) => {
      console.log('✅ Business created:', data.name);

      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['user-types'] });

      // Optimistic update
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
