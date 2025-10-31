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
 * Hook for creating stories with media processing
 * Calls the API which handles all media processing on the backend
 */
export const useCreateStoryWithMedia = () => {
  const queryClient = useQueryClient();
  const businessId = useBusinessId();

  return useMutation({
    mutationFn: async ({ type, mediaFile, duration }) => {
      if (!businessId) {
        throw new Error('No business context available. Please switch to a business first.');
      }

      console.log('📤 [useCreateStory Hook] Calling API to create story');

      // Call API - media processing happens in the API resource (simulating backend)
      const response = await apiClient.post('/stories', {
        type,
        mediaFile,
        duration: duration || (type === 'image' ? 5 : 15)
      }, {
        params: { businessId }
      });

      console.log('✅ [useCreateStory Hook] Story created:', response.data.id);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate stories queries to refresh
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['business-stories', businessId] });
    },
  });
};
