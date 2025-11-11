import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api-client';
import { useBusinessContexts } from './use-user-type';
import { useBusinessPosts } from './use-business-posts';
import { useBusinessStories } from './use-business-stories';

/**
 * Get business profile data with real-time stats
 */
export const useBusinessProfile = () => {
  const businessContexts = useBusinessContexts();
  const currentBusiness = businessContexts[0] || null;
  const businessId = currentBusiness?.businessId;

  // Get posts count
  const { data: posts = [] } = useBusinessPosts();

  // Get stories count
  const { data: stories = [] } = useBusinessStories();

  // Get business profile data from API
  const { data: businessData, isLoading, error } = useQuery({
    queryKey: ['business-profile', businessId],
    queryFn: () => {
      if (!businessId) {
        return null;
      }
      return apiClient.get('/businesses/profile', {
        params: { businessId }
      }).then(res => res.data);
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Combine business data with calculated stats
  const stats = {
    followers: businessData?.followersCount || 0,
    posts: posts.length,
    activeStories: stories.length,
    products: businessData?.productsCount || 0,
    rating: businessData?.rating || 0,
    reviews: businessData?.reviewsCount || 0,
  };

  return {
    business: currentBusiness,
    businessData,
    stats,
    isLoading,
    error,
  };
};

/**
 * Update business logo
 */
export const useUpdateBusinessLogo = () => {
  const queryClient = useQueryClient();
  const businessContexts = useBusinessContexts();
  const currentBusiness = businessContexts[0] || null;
  const businessId = currentBusiness?.businessId;

  return useMutation({
    mutationFn: async (logoUrl) => {
      if (!businessId) {
        throw new Error('No business context available');
      }

      return apiClient.put('/businesses/id/logo', { logoUrl }, {
        params: { businessId, id: businessId }
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile', businessId] });
      queryClient.invalidateQueries({ queryKey: ['businesses', businessId] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};

/**
 * Update business banner
 */
export const useUpdateBusinessBanner = () => {
  const queryClient = useQueryClient();
  const businessContexts = useBusinessContexts();
  const currentBusiness = businessContexts[0] || null;
  const businessId = currentBusiness?.businessId;

  return useMutation({
    mutationFn: async (bannerUrl) => {
      if (!businessId) {
        throw new Error('No business context available');
      }

      return apiClient.put('/businesses/id/banner', { bannerUrl }, {
        params: { businessId, id: businessId }
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile', businessId] });
      queryClient.invalidateQueries({ queryKey: ['businesses', businessId] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};
