import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/config/api-client';

/**
 * Fetch all categories
 * @returns {Object} Query result with categories data
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get('/categories').then(res => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
  });
};

/**
 * Fetch a single category by ID
 */
export const useCategory = (categoryId) => {
  return useQuery({
    queryKey: ['categories', categoryId],
    queryFn: () => apiClient.get(`/categories/${categoryId}`).then(res => res.data),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Fetch videos for a specific category
 */
export const useCategoryVideos = (categoryId, { limit = 20 } = {}) => {
  return useQuery({
    queryKey: ['categories', categoryId, 'videos', { limit }],
    queryFn: () => apiClient.get(`/categories/${categoryId}/videos`, { params: { limit } }).then(res => res.data),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new category (admin only)
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData) => {
      return apiClient.post('/categories', categoryData).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

/**
 * Update a category (admin only)
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, categoryData }) => {
      return apiClient.patch(`/categories/${categoryId}`, categoryData).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

/**
 * Delete a category (admin only)
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId) => {
      return apiClient.delete(`/categories/${categoryId}`).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
