import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/config/api-client';

export const useCategories = ({ businessId } = {}) => {
  return useQuery({
    queryKey: ['categories', businessId],
    queryFn: async () => {
      const response = await apiClient.get('/categories', {
        params: { businessId }
      });
      return response.data;
    },
    enabled: !!businessId
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, businessId }) => {
      const response = await apiClient.post('/categories', {
        name,
        businessId
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.businessId] });
    }
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, name }) => {
      const response = await apiClient.patch(`/categories/${categoryId}`, {
        name
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId) => {
      await apiClient.delete(`/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
};
