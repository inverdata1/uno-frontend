import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/config/api-client';

/**
 * Fetch posts for the feed
 * @param {Object} options - Query options
 * @param {string} options.businessId - Filter by business
 * @param {string} options.userId - Filter by user
 * @param {string} options.type - Filter by post type (image, video, carousel)
 * @param {number} options.limit - Number of posts to fetch
 * @returns {Object} Query result with posts data
 */
export const usePosts = ({ businessId, userId, type, limit = 20 } = {}) => {
  return useQuery({
    queryKey: ['posts', { businessId, userId, type, limit }],
    queryFn: () => {
      const params = { limit };
      if (businessId) params.businessId = businessId;
      if (userId) params.userId = userId;
      if (type) params.type = type;
      return apiClient.get('/posts', { params }).then(res => res.data);
    },
    enabled: !!businessId || !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch a single post by ID
 */
export const usePost = (postId) => {
  return useQuery({
    queryKey: ['posts', postId],
    queryFn: () => apiClient.get(`/posts/${postId}`).then(res => res.data),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Like/unlike a post
 */
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isLiked }) => {
      const endpoint = isLiked ? `/posts/${postId}/unlike` : `/posts/${postId}/like`;
      return apiClient.patch(endpoint).then(res => res.data);
    },
    onSuccess: () => {
      // Invalidate all post queries to refresh like status
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

/**
 * Save/unsave a post
 */
export const useSavePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isSaved }) => {
      return apiClient.post('/favorites/toggle', {
        itemType: 'post',
        itemId: postId
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

/**
 * Create a new post
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData) => {
      return apiClient.post('/posts', postData).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

/**
 * Delete a post
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId) => {
      return apiClient.delete(`/posts/${postId}`).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
