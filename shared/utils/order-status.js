/**
 * Order flow shared by the client and business screens.
 * pending → accepted → preparing → ready → on_the_way (delivery only) → delivered
 * plus rejected / cancelled.
 */

export const ORDER_STATUS = {
  pending: { label: 'Pendiente', color: '#f59e0b', bg: '#fffbeb', icon: 'time-outline' },
  accepted: { label: 'Aceptado', color: '#3b82f6', bg: '#eff6ff', icon: 'checkmark-circle-outline' },
  preparing: { label: 'Preparando', color: '#8b5cf6', bg: '#f5f3ff', icon: 'restaurant-outline' },
  ready: { label: 'Listo', color: '#0ea5e9', bg: '#f0f9ff', icon: 'cube-outline' },
  on_the_way: { label: 'En camino', color: '#6366f1', bg: '#eef2ff', icon: 'bicycle-outline' },
  delivered: { label: 'Entregado', color: '#10b981', bg: '#ecfdf5', icon: 'checkmark-done-outline' },
  rejected: { label: 'Rechazado', color: '#ef4444', bg: '#fef2f2', icon: 'close-circle-outline' },
  cancelled: { label: 'Cancelado', color: '#6b7280', bg: '#f3f4f6', icon: 'ban-outline' },
};

export const getOrderStatus = (status) =>
  ORDER_STATUS[status] || { label: status || 'Desconocido', color: '#6b7280', bg: '#f3f4f6', icon: 'help-circle-outline' };

export const ACTIVE_STATUSES = ['pending', 'accepted', 'preparing', 'ready', 'on_the_way'];
export const FINISHED_STATUSES = ['delivered'];
export const CANCELLED_STATUSES = ['rejected', 'cancelled'];

export const PAYMENT_METHODS = [
  { id: 'pago_movil', label: 'Pago móvil', icon: 'phone-portrait-outline' },
  { id: 'efectivo', label: 'Efectivo', icon: 'cash-outline' },
  { id: 'zelle', label: 'Zelle', icon: 'swap-horizontal-outline' },
  { id: 'transferencia', label: 'Transferencia', icon: 'business-outline' },
];

export const getPaymentMethodLabel = (id) => PAYMENT_METHODS.find((m) => m.id === id)?.label || 'Por acordar';

/**
 * Progress steps shown to the client. Pickup orders skip "En camino".
 */
export const getOrderSteps = (deliveryMethod) =>
  deliveryMethod === 'pickup'
    ? ['pending', 'accepted', 'preparing', 'ready', 'delivered']
    : ['pending', 'accepted', 'preparing', 'ready', 'on_the_way', 'delivered'];

/**
 * The main action the business can take next, or null when the order is closed.
 */
export const getNextBusinessAction = (order) => {
  switch (order?.status) {
    case 'pending':
      return { status: 'accepted', label: 'Aceptar pedido', icon: 'checkmark' };
    case 'accepted':
      return { status: 'preparing', label: 'Empezar a preparar', icon: 'restaurant' };
    case 'preparing':
      return { status: 'ready', label: 'Marcar como listo', icon: 'cube' };
    case 'ready':
      return order.deliveryMethod === 'delivery'
        ? { status: 'on_the_way', label: 'Enviar pedido', icon: 'bicycle' }
        : { status: 'delivered', label: 'Entregado al cliente', icon: 'checkmark-done' };
    case 'on_the_way':
      return { status: 'delivered', label: 'Marcar entregado', icon: 'checkmark-done' };
    default:
      return null;
  }
};

export const canBusinessCancel = (status) => ['accepted', 'preparing', 'ready', 'on_the_way'].includes(status);

export const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

export const formatOrderDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const getClientName = (client) =>
  client?.displayName || [client?.firstName, client?.lastName].filter(Boolean).join(' ') || 'Cliente';

export const getMapsUrl = ({ latitude, longitude }) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
