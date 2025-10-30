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
 * Get all active stories from current business
 */
export const useBusinessStories = () => {
  const { user } = useAuthStore();
  const businessId = useBusinessId();

  return useQuery({
    queryKey: ['business-stories', businessId],
    queryFn: () => {
      if (!businessId) {
        return [];
      }
      return apiClient.get(`/stories/business/${businessId}`)
        .then(res => res.data || []);
    },
    enabled: !!businessId,
    staleTime: 1 * 60 * 1000, // 1 minute (stories are time-sensitive)
  });
};

/**
 * Get all stories (grouped by business) for feed
 */
export const useStories = () => {
  return useQuery({
    queryKey: ['stories'],
    queryFn: () => {
      return apiClient.get('/stories')
        .then(res => res.data || []);
    },
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Create a new story
 */
export const useCreateStory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const businessId = useBusinessId();

  return useMutation({
    mutationFn: async (storyData) => {
      if (!businessId) {
        throw new Error('No business context available. Please switch to a business first.');
      }

      return apiClient.post('/stories', storyData, {
        params: {
          businessId,
          userId: user.id
        }
      }).then(res => res.data);
    },
    onSuccess: () => {
      // Invalidate both business stories and global stories
      queryClient.invalidateQueries(['business-stories', businessId]);
      queryClient.invalidateQueries(['stories']);
    },
  });
};

/**
 * Delete a story
 */
export const useDeleteStory = () => {
  const queryClient = useQueryClient();
  const businessId = useBusinessId();

  return useMutation({
    mutationFn: async (storyId) => {
      if (!businessId) {
        throw new Error('No business context available');
      }

      return apiClient.delete(`/stories/${storyId}`, {
        params: { businessId }
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['business-stories', businessId]);
      queryClient.invalidateQueries(['stories']);
    },
  });
};

/**
 * Record story view
 */
export const useRecordStoryView = () => {
  return useMutation({
    mutationFn: async (storyId) => {
      return apiClient.patch(`/stories/${storyId}/view`)
        .then(res => res.data);
    },
  });
};

/**
 * Record story interactions (forward, back, exit)
 */
export const useRecordStoryInteraction = () => {
  return useMutation({
    mutationFn: async ({ storyId, action }) => {
      // action can be: 'tap-forward', 'tap-back', 'exit', 'reply', 'share'
      return apiClient.patch(`/stories/${storyId}/${action}`)
        .then(res => res.data);
    },
  });
};
