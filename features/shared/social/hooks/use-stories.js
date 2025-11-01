import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/config/api-client';

/**
 * Fetch all stories (grouped by business)
 * @returns {Object} Query result with stories data
 */
export const useStories = () => {
  return useQuery({
    queryKey: ['stories'],
    queryFn: () => apiClient.get('/stories').then(res => res.data),
    staleTime: 3 * 60 * 1000, // 3 minutes - stories are more time-sensitive
  });
};

/**
 * Fetch stories for a specific business
 */
export const useBusinessStories = (businessId) => {
  return useQuery({
    queryKey: ['stories', 'business', businessId],
    queryFn: () => apiClient.get(`/stories/business/${businessId}`).then(res => res.data),
    enabled: !!businessId,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Fetch a single story by ID
 */
export const useStory = (storyId) => {
  return useQuery({
    queryKey: ['stories', storyId],
    queryFn: () => apiClient.get(`/stories/${storyId}`).then(res => res.data),
    enabled: !!storyId,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Create a new story
 */
export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyData) => {
      return apiClient.post('/stories', storyData).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
};

/**
 * Mark story as viewed
 */
export const useViewStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId) => {
      return apiClient.post(`/stories/${storyId}/view`).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
};

/**
 * Delete a story
 */
export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId) => {
      return apiClient.delete(`/stories/${storyId}`).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
};
