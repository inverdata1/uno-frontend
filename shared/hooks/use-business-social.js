import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api-client';

export const useBusinessStories = (businessId) => {
  return useQuery({
    queryKey: ['business-stories', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const res = await apiClient.get(`/stories/business/${businessId}`);
      return res.data;
    },
    enabled: !!businessId,
  });
};

export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyData) => {
      const res = await apiClient.post('/stories', storyData);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['business-stories', variables.businessId]);
    },
  });
};

export const useBusinessPosts = (businessId) => {
  return useQuery({
    queryKey: ['business-posts', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const res = await apiClient.get(`/posts/business/${businessId}`);
      return res.data;
    },
    enabled: !!businessId,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData) => {
      const res = await apiClient.post('/posts', postData);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['business-posts', variables.businessId]);
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId) => {
      const res = await apiClient.patch(`/posts/${postId}/like`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['business-posts']);
    },
  });
};
