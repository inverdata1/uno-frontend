import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { firebaseClient } from '../api';

const ADDRESSES_QUERY_KEY = 'addresses';

/**
 * Get all addresses for current user
 * @param {string} userId - User ID
 * @returns {Object} React Query result
 */
export const useAddresses = (userId) => {
  return useQuery({
    queryKey: [ADDRESSES_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];
      return await firebaseClient.request('GET', '/addresses', null, { userId });
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get user's default address
 * @param {string} userId - User ID
 * @returns {Object} React Query result
 */
export const useDefaultAddress = (userId) => {
  return useQuery({
    queryKey: [ADDRESSES_QUERY_KEY, 'default', userId],
    queryFn: async () => {
      if (!userId) return null;
      return await firebaseClient.request('GET', '/addresses/default', null, { userId });
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Create new address mutation
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation
 */
export const useCreateAddress = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ addressData, userId }) => {
      return await firebaseClient.request('POST', '/addresses', addressData, { userId });
    },
    onSuccess: (data, variables) => {
      // Invalidate addresses queries for this user
      queryClient.invalidateQueries([ADDRESSES_QUERY_KEY, variables.userId]);
      queryClient.invalidateQueries([ADDRESSES_QUERY_KEY, 'default', variables.userId]);
    },
    ...options,
  });
};

/**
 * Update address mutation
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation
 */
export const useUpdateAddress = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ addressId, addressData, userId }) => {
      return await firebaseClient.request('PUT', '/addresses/id', addressData, { userId, id: addressId });
    },
    onSuccess: (data, variables) => {
      // Invalidate addresses queries for this user
      queryClient.invalidateQueries([ADDRESSES_QUERY_KEY, variables.userId]);
      queryClient.invalidateQueries([ADDRESSES_QUERY_KEY, 'default', variables.userId]);
    },
    ...options,
  });
};

/**
 * Delete address mutation (soft delete)
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation
 */
export const useDeleteAddress = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ addressId, userId }) => {
      return await firebaseClient.request('DELETE', '/addresses/id', null, { userId, id: addressId });
    },
    onSuccess: (data, variables) => {
      // Invalidate addresses queries for this user
      queryClient.invalidateQueries([ADDRESSES_QUERY_KEY, variables.userId]);
      queryClient.invalidateQueries([ADDRESSES_QUERY_KEY, 'default', variables.userId]);
    },
    ...options,
  });
};

/**
 * Set address as default mutation
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation
 */
export const useSetDefaultAddress = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ addressId, userId }) => {
      return await firebaseClient.request('POST', '/addresses/id/set_default', null, { userId, id: addressId });
    },
    onSuccess: (data, variables) => {
      // Invalidate addresses queries for this user
      queryClient.invalidateQueries([ADDRESSES_QUERY_KEY, variables.userId]);
      queryClient.invalidateQueries([ADDRESSES_QUERY_KEY, 'default', variables.userId]);
    },
    ...options,
  });
};