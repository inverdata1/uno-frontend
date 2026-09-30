import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/config/api-client';

/**
 * Fetch all businesses (for client discovery)
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of businesses to fetch
 * @returns {Object} Query result with businesses data
 */
export const useBusinesses = ({ limit = 20 } = {}) => {
  return useQuery({
    queryKey: ['businesses', { limit }],
    queryFn: () => {
      return apiClient.get('/businesses', { params: { limit } }).then(res => res.data);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch a single business by ID (with user follow status if userId is provided)
 */
export const useBusiness = (businessId, userId) => {
  return useQuery({
    queryKey: ['business-profile', businessId, userId || 'anonymous'],
    queryFn: () => apiClient.get('/businesses/profile', { params: { businessId, userId } }).then(res => res.data),
    enabled: !!businessId,
    staleTime: 30 * 1000,
  });
};

/**
 * Fetch list of business IDs that the user is currently following
 */
export const useFollowingBusinesses = (userId) => {
  return useQuery({
    queryKey: ['following-businesses', userId || 'anonymous'],
    queryFn: async () => {
      if (!userId) return [];
      const res = await apiClient.get('/businesses/following', { params: { userId } });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
};

/**
 * Toggle follow/unfollow a business
 */
export const useToggleFollowBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, userId }) => {
      const res = await apiClient.post(`/businesses/${businessId}/follow`, { userId });
      return res.data;
    },
    onSuccess: (data, { businessId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['business-profile', businessId] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['feed-stories'] });
      queryClient.invalidateQueries({ queryKey: ['followed-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['following-businesses', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
    },
  });
};
