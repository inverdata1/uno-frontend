import { queryClient } from '../config/query-client';

/**
 * Ids of the businesses the signed-in user owns, read from the cached
 * user-types query (no request). Used to stop owners ordering from themselves.
 */
export const getOwnedBusinessIds = () => {
  const ids = new Set();
  queryClient.getQueriesData({ queryKey: ['user-types'] }).forEach(([, data]) => {
    (data?.businessContexts || []).forEach((c) => {
      const id = c.businessId || c.id;
      if (id) ids.add(id);
    });
    if (data?.currentContext?.businessId) ids.add(data.currentContext.businessId);
  });
  return ids;
};

export const isOwnBusiness = (businessId) => !!businessId && getOwnedBusinessIds().has(businessId);

export const OWN_BUSINESS_MESSAGE =
  'Este producto es de tu propio negocio. Los pedidos los hacen tus clientes desde su cuenta.';
