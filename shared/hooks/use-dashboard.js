import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api-client';

export function useBusinessDashboard(businessId, startDate, endDate) {
  return useQuery({
    queryKey: ['dashboard', 'negocio', businessId, startDate, endDate],
    queryFn: async () => {
      if (!businessId) return null;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      const res = await apiClient.get(`/dashboard/business/${businessId}/negocio?${params.toString()}`);
      return res.data;
    },
    enabled: !!businessId,
  });
}

export function useSocialDashboard(businessId, startDate, endDate) {
  return useQuery({
    queryKey: ['dashboard', 'social', businessId, startDate, endDate],
    queryFn: async () => {
      if (!businessId) return null;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      const res = await apiClient.get(`/dashboard/business/${businessId}/social?${params.toString()}`);
      return res.data;
    },
    enabled: !!businessId,
  });
}
