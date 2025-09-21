import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/config/api-client';

// Query hook for fetching orders
export const useGetOrders = (filters) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => apiClient.get('/orders', { params: filters }).then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Query hook for fetching a specific order
export const useGetOrder = (orderId) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => apiClient.get(`/orders/${orderId}`).then(res => res.data),
    enabled: !!orderId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Mutation hook for creating an order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => apiClient.post('/orders', orderData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
    },
  });
};

// Mutation hook for updating an order
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, orderData }) =>
      apiClient.put(`/orders/${orderId}`, orderData).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Failed to update order:', error);
    },
  });
};

// Mutation hook for canceling an order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => apiClient.patch(`/orders/${orderId}/cancel`).then(res => res.data),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Failed to cancel order:', error);
    },
  });
};