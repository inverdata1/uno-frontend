import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api-client';
import { useAuthStore } from '../../core/auth/stores/auth-store';
import { useUserType } from './use-user-type';

/**
 * Get the current business ID from context
 * Falls back to first available business if currentBusinessId is not set
 */
const useBusinessId = () => {
  const { data: userTypeData } = useUserType();

  // First try to get from currentContext
  if (userTypeData?.currentContext?.businessId) {
    return userTypeData.currentContext.businessId;
  }

  // Fallback to first business in businessContexts
  if (userTypeData?.businessContexts?.length > 0) {
    return userTypeData.businessContexts[0].businessId;
  }

  return null;
};

/**
 * Get posts for current business
 */
export const useBusinessPosts = () => {
  const { user } = useAuthStore();
  const businessId = useBusinessId();

  return useQuery({
    queryKey: ['business-posts', businessId],
    queryFn: () => {
      if (!businessId) {
        return [];
      }
      return apiClient.get('/posts', {
        params: { businessId }
      }).then(res => res.data || []);
    },
    enabled: !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Create a new post
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const businessId = useBusinessId();

  return useMutation({
    mutationFn: async (postData) => {
      if (!businessId) {
        throw new Error('No business context available. Please switch to a business first.');
      }

      return apiClient.post('/posts', postData, {
        params: {
          businessId,
          userId: user.id
        }
      }).then(res => res.data);
    },
    onSuccess: () => {
      // Invalidate business posts query
      queryClient.invalidateQueries(['business-posts', businessId]);
      // Also invalidate feed
      queryClient.invalidateQueries(['posts']);
    },
  });
};

/**
 * Update a post
 */
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  const businessId = useBusinessId();

  return useMutation({
    mutationFn: async ({ postId, data }) => {
      if (!businessId) {
        throw new Error('No business context available');
      }

      return apiClient.put(`/posts/${postId}`, data, {
        params: { businessId }
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['business-posts', businessId]);
      queryClient.invalidateQueries(['posts']);
    },
  });
};

/**
 * Delete a post
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const contextBusinessId = useBusinessId();

  return useMutation({
    mutationFn: async (input) => {
      // Support both formats: just postId OR { postId, businessId }
      const postId = typeof input === 'string' ? input : input.postId;
      const businessId = typeof input === 'string' ? contextBusinessId : (input.businessId || contextBusinessId);

      if (!businessId) {
        throw new Error('No business context available');
      }

      return apiClient.delete(`/posts/id`, {
        params: { id: postId, businessId }
      }).then(res => res.data);
    },
    onSuccess: (data, input) => {
      const postId = typeof input === 'string' ? input : input.postId;
      const businessId = typeof input === 'string' ? contextBusinessId : (input.businessId || contextBusinessId);

      // Optimistically remove from cache immediately
      queryClient.setQueryData(['business-posts', businessId], (old) => {
        if (!old) return old;
        return old.filter(post => post.id !== postId);
      });

      queryClient.setQueryData(['posts', { businessId }], (old) => {
        if (!old) return old;
        return old.filter(post => post.id !== postId);
      });

      // Invalidate to refetch fresh data
      queryClient.invalidateQueries(['business-posts', businessId]);
      queryClient.invalidateQueries(['posts']);
    },
  });
};

/**
 * Toggle post pin status
 */
export const useTogglePostPin = () => {
  const queryClient = useQueryClient();
  const businessId = useBusinessId();

  return useMutation({
    mutationFn: async (postId) => {
      if (!businessId) {
        throw new Error('No business context available');
      }

      return apiClient.patch(`/posts/${postId}/toggle-pin`, {}, {
        params: { businessId }
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['business-posts', businessId]);
    },
  });
};
