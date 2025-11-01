import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/config/api-client';

/**
 * Fetch all products
 * @param {Object} options - Query options
 * @param {string} options.businessId - Filter by business
 * @param {string} options.categoryId - Filter by category
 * @param {number} options.limit - Number of products to fetch
 * @returns {Object} Query result with products data
 */
export const useProducts = ({ businessId, categoryId, limit = 20 } = {}) => {
  return useQuery({
    queryKey: ['products', { businessId, categoryId, limit }],
    queryFn: () => {
      const params = { limit };
      if (businessId) params.businessId = businessId;
      if (categoryId) params.categoryId = categoryId;
      return apiClient.get('/products', { params }).then(res => res.data);
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch a single product by ID
 */
export const useProduct = (productId) => {
  return useQuery({
    queryKey: ['products', productId],
    queryFn: () => apiClient.get(`/products/${productId}`).then(res => res.data),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch featured products
 */
export const useFeaturedProducts = ({ limit = 10 } = {}) => {
  return useQuery({
    queryKey: ['products', 'featured', { limit }],
    queryFn: () => apiClient.get('/products/featured', { params: { limit } }).then(res => res.data),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Search products
 */
export const useSearchProducts = (query, { enabled = false } = {}) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => apiClient.get('/products/search', { params: { q: query } }).then(res => res.data),
    enabled: enabled && !!query,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Create a new product (business only)
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productData, businessId }) => {
      return apiClient.post('/products', productData, {
        params: { businessId }
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

/**
 * Update a product (business only)
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, productData }) => {
      return apiClient.patch(`/products/${productId}`, productData).then(res => res.data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] });
    },
  });
};

/**
 * Delete a product (business only)
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, businessId }) => {
      return apiClient.delete(`/products/id`, {
        params: { id: productId, businessId }
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

/**
 * Toggle product favorite
 */
export const useFavoriteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      return apiClient.post('/favorites/toggle', {
        itemType: 'product',
        itemId: productId
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
