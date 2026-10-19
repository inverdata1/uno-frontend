import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api-client';

export function useAdminOverview(period) {
  return useQuery({
    queryKey: ['admin', 'overview', period],
    queryFn: () => apiClient.get('/admin/overview', { params: period ? { period } : {} }).then((res) => res.data),
    staleTime: 0,
    retry: false,
  });
}

export function useReviewCommissionPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => apiClient.patch(`/admin/commission-payments/${id}`, { status }).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
}
