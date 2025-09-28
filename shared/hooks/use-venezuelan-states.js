import { useQuery } from '@tanstack/react-query';
import { firebaseClient } from '../api';

/**
 * Hook to fetch Venezuelan states
 */
export const useVenezuelanStates = () => {
  return useQuery({
    queryKey: ['venezuelan-states'],
    queryFn: async () => {
      return await firebaseClient.request('GET', '/venezuelan-states');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - states rarely change
  });
};