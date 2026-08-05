import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/config/api-client';

/**
 * Fetch comments (with nested replies) for a post
 */
export const useComments = (postId) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => apiClient.get(`/posts/${postId}/comments`).then(res => res.data),
    enabled: !!postId,
    staleTime: 60 * 1000,
  });
};

/**
 * Create a comment or reply on a post
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, userId, content, parentId }) => {
      return apiClient
        .post(`/posts/${postId}/comments`, { userId, content, parentId })
        .then(res => res.data);
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

/**
 * Delete own comment
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, userId }) => {
      return apiClient
        .delete(`/comments/${commentId}`, { data: { userId } })
        .then(res => res.data);
    },
    // Note: `postId` must be passed into mutate() alongside commentId/userId so onSuccess can invalidate the right query
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
