import { useQuery } from '@tanstack/react-query';
import { firebaseClient } from '../api';

/**
 * Hook to fetch address types
 * @param {string} userType - Filter by user type (client, business, driver)
 */
export const useAddressTypes = (userType) => {
  return useQuery({
    queryKey: ['address-types', userType],
    queryFn: async () => {
      return await firebaseClient.request('GET', '/address-types', null, {
        userType
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - address types don't change often
    enabled: !!userType, // Only run if userType is provided
  });
};

/**
 * Hook to fetch all address types
 */
export const useAllAddressTypes = () => {
  return useQuery({
    queryKey: ['address-types'],
    queryFn: async () => {
      return await firebaseClient.request('GET', '/address-types');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};