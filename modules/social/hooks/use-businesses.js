import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/config/api-client';

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
 * Fetch a single business by ID
 */
export const useBusiness = (businessId) => {
  return useQuery({
    queryKey: ['businesses', businessId],
    queryFn: () => apiClient.get('/businesses/profile', { params: { businessId } }).then(res => res.data),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000,
  });
};
