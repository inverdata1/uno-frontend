import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api-client';

// Orders change from the other side (business ↔ client) with no push channel,
// so open order screens poll
const ORDERS_POLL_MS = 15000;

export function useBusinessOrders(businessId) {
  return useQuery({
    queryKey: ['orders', 'business', businessId],
    queryFn: () => apiClient.get('/orders', { params: { businessId } }).then((res) => res.data),
    enabled: !!businessId,
    staleTime: 0,
    refetchInterval: ORDERS_POLL_MS,
  });
}

export function useMyOrders(enabled = true) {
  return useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => apiClient.get('/orders/mine').then((res) => res.data),
    enabled,
    staleTime: 0,
    refetchInterval: ORDERS_POLL_MS,
  });
}

const useOrderMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export function useCreateOrder() {
  return useOrderMutation((order) => apiClient.post('/orders', order).then((res) => res.data));
}

export function useUpdateOrderStatus() {
  return useOrderMutation(({ orderId, status, reason }) =>
    apiClient.patch(`/orders/${orderId}/status`, { status, reason }).then((res) => res.data)
  );
}

export function useUpdateOrderPayment() {
  return useOrderMutation(({ orderId, paymentStatus }) =>
    apiClient.patch(`/orders/${orderId}/payment`, { paymentStatus }).then((res) => res.data)
  );
}

export function useUpdateDeliveryLocation() {
  return useOrderMutation(({ orderId, location }) =>
    apiClient.patch(`/orders/${orderId}/delivery-location`, location).then((res) => res.data)
  );
}
