import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api-client';
import { useUserType } from './use-user-type';

/**
 * Get the current business ID from context
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
 * Hook for creating posts with media processing
 * Calls the API which handles all media processing on the backend
 */
export const useCreatePostWithMedia = () => {
  const queryClient = useQueryClient();
  const businessId = useBusinessId();

  return useMutation({
    mutationFn: async ({ caption, type, mediaFiles, taggedProducts }) => {
      if (!businessId) {
        throw new Error('No business context available. Please switch to a business first.');
      }

      console.log('📤 [useCreatePost Hook] Calling API to create post');

      // Call API - media processing happens in the API resource (simulating backend)
      const response = await apiClient.post('/posts', {
        caption: caption?.trim() || '',
        type,
        mediaFiles,
        taggedProducts: taggedProducts || []
      }, {
        params: { businessId }
      });

      console.log('✅ [useCreatePost Hook] Post created:', response.data.id);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate posts queries to refresh the feed
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['business-posts', businessId] });
    },
  });
};
