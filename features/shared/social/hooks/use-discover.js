import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/config/api-client';

/**
 * Fetch discover data: featured businesses, businesses grouped by category,
 * and trending posts.
 */
export const useDiscover = () => {
  return useQuery({
    queryKey: ['businesses', 'discover'],
    queryFn: () => apiClient.get('/businesses/discover').then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Search businesses by name/category/type
 */
export const useBusinessSearch = (query) => {
  return useQuery({
    queryKey: ['businesses', 'search', query],
    queryFn: () => apiClient.get('/businesses/search', { params: { q: query } }).then(res => res.data),
    enabled: !!query && query.trim().length > 0,
    staleTime: 30 * 1000,
  });
};
