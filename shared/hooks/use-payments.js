import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api-client';

export function usePaymentAccounts(businessId) {
  return useQuery({
    queryKey: ['payment-accounts', businessId],
    queryFn: () => apiClient.get('/payment-accounts', { params: { businessId } }).then((res) => res.data),
    enabled: !!businessId,
  });
}

export function useSavePaymentAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...account }) =>
      (id ? apiClient.patch(`/payment-accounts/${id}`, account) : apiClient.post('/payment-accounts', account)).then(
        (res) => res.data
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-accounts'] }),
  });
}

export function useDeletePaymentAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/payment-accounts/${id}`).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-accounts'] }),
  });
}

export function useCommissions(businessId) {
  return useQuery({
    queryKey: ['commissions', businessId],
    queryFn: () => apiClient.get('/commissions', { params: { businessId } }).then((res) => res.data),
    enabled: !!businessId,
    staleTime: 0,
  });
}

export function useReportCommissionPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ period, ...body }) =>
      apiClient.post(`/commissions/${period}/report`, body).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commissions'] }),
  });
}
