import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/config/api-client';

// Query hook for fetching user profile
export const useProfile = () => {
  return useQuery({
    queryKey: ['users', 'profile'],
    queryFn: () => apiClient.get('/users/profile').then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation hook for updating user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.put('/users/profile', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });
};