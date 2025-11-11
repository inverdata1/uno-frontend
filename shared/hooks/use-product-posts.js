import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api-client';

/**
 * Get all posts (images and videos) that feature a specific product
 * Perfect for showing in product detail view
 */
export const useProductPosts = (productId) => {
  return useQuery({
    queryKey: ['product-posts', productId],
    queryFn: () => {
      if (!productId) return [];
      return apiClient.get('/posts/product', { params: { productId } })
        .then(res => res.data || []);
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get only video posts that feature a specific product
 * Use this for a dedicated video section in product detail
 */
export const useProductVideos = (productId) => {
  return useQuery({
    queryKey: ['product-videos', productId],
    queryFn: async () => {
      if (!productId) return [];

      const posts = await apiClient.get('/posts/product', { params: { productId } })
        .then(res => res.data || []);

      // Filter only video posts
      return posts.filter(post => post.type === 'video');
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get only image posts that feature a specific product
 * Use this for additional product photos from real posts
 */
export const useProductPhotos = (productId) => {
  return useQuery({
    queryKey: ['product-photos', productId],
    queryFn: async () => {
      if (!productId) return [];

      const posts = await apiClient.get('/posts/product', { params: { productId } })
        .then(res => res.data || []);

      // Filter only image posts
      return posts.filter(post => post.type === 'image');
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};
