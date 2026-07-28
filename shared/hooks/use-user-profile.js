import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api-client';
import { useAuthStore } from '../../core/auth/stores/auth-store';

/**
 * Get the current user's profile data
 */
export const useUserProfile = () => {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => {
      if (!userId) return null;
      return apiClient.get('/users/profile').then(res => res.data);
    },
    enabled: !!userId,
  });
};

/**
 * Update the current user's profile data
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?.id;

  return useMutation({
    mutationFn: async (profileData) => {
      if (!userId) throw new Error('No user context available');
      return apiClient.put('/users/profile', profileData, {
        params: { userId }
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
    },
  });
};
