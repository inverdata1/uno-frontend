import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/config/api-client';

/**
 * Fetch videos feed (video posts)
 * @param {Object} options - Query options
 * @param {string} options.categoryId - Filter by category
 * @param {number} options.limit - Number of videos to fetch
 * @returns {Object} Query result with videos data
 */
export const useVideos = ({ categoryId, limit = 20 } = {}) => {
  return useQuery({
    queryKey: ['posts', 'videos', { categoryId, limit }],
    queryFn: () => {
      // Videos are posts with type='video'
      const params = { limit, type: 'video' };
      if (categoryId) params.categoryId = categoryId;
      return apiClient.get('/posts', { params }).then(res => res.data);
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch a single video by ID (video post)
 */
export const useVideo = (videoId) => {
  return useQuery({
    queryKey: ['posts', videoId],
    queryFn: () => apiClient.get(`/posts/${videoId}`).then(res => res.data),
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Like/unlike a video (video post)
 */
export const useLikeVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, isLiked }) => {
      const endpoint = isLiked ? `/posts/${videoId}/unlike` : `/posts/${videoId}/like`;
      return apiClient.patch(endpoint).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

/**
 * Save/unsave a video (video post)
 */
export const useSaveVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId }) => {
      return apiClient.post('/favorites/toggle', {
        itemType: 'post',
        itemId: videoId
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

/**
 * Create a new video (video post)
 */
export const useCreateVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoData) => {
      // Create as a post with type='video'
      return apiClient.post('/posts', { ...videoData, type: 'video' }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

/**
 * Delete a video (video post)
 */
export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId) => {
      return apiClient.delete(`/posts/${videoId}`).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
