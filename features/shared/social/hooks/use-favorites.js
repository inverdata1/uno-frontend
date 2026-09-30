import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/config/api-client';

/**
 * Fetch the current user's favorite posts and products
 */
export const useFavorites = (userId) => {
  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: () => apiClient.get('/users/favorites', { params: { userId } }).then(res => res.data),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
};

/**
 * Toggle a post as favorite (add/remove)
 */
export const useToggleFavoritePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, userId }) => {
      return apiClient.post(`/posts/${postId}/favorite`, { userId }).then(res => res.data);
    },
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['feed-stories'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};

/**
 * Toggle a product as favorite (add/remove)
 */
export const useToggleFavoriteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, userId }) => {
      return apiClient.post(`/products/${productId}/favorite`, { userId }).then(res => res.data);
    },
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-detail'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};
