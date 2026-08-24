import React, { useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '../../../shared/components/ui/text';
import { useCartStore, useTotalCartCount, getCartSubtotal } from '../../../shared/stores/cart-store';
import { colors } from '../../../shared/utils/colors';

/**
 * CartsScreen Component
 * Displays multi-business shopping carts grouped by business.
 */
export default function CartsScreen() {
  const router = useRouter();
  const carts = useCartStore(state => state.carts);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const clearBusinessCart = useCartStore(state => state.clearBusinessCart);
  const clearAllCarts = useCartStore(state => state.clearAllCarts);
  const totalItemsCount = useTotalCartCount();

  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [selectedBusinessCart, setSelectedBusinessCart] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery' | 'pickup'

  const businessList = Object.values(carts);

  const handlePromptClearBusiness = (businessId, businessName) => {
    Alert.alert(
      'Vaciar Carrito',
      `¿Deseas eliminar todos los productos del carrito de "${businessName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => clearBusinessCart(businessId) }
      ]
    );
  };

  const handlePromptClearAll = () => {
    Alert.alert(
      'Vaciar Todos los Carritos',
      '¿Deseas eliminar todas tus compras guardadas en los carritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Vaciar Todo', style: 'destructive', onPress: clearAllCarts }
      ]
    );
  };

  const handleOpenCheckout = (cart) => {
    setSelectedBusinessCart(cart);
    setCheckoutModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }} edges={['top']}>
      {/* Top Header */}
      <View style={{
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>
              Mis Carritos
            </Text>
            {totalItemsCount > 0 && (
              <View style={{
                backgroundColor: '#ef4444',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12
              }}>
                <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>
                  {totalItemsCount}
                </Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
            Tus compras separadas por negocio
          </Text>
        </View>

        {businessList.length > 0 && (
          <TouchableOpacity
            onPress={handlePromptClearAll}
            style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fef2f2' }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#ef4444' }}>
              Vaciar todo
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 40 }}
      >
        {businessList.length === 0 ? (
          /* Empty State */
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 32,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 40,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Ionicons name="cart-outline" size={40} color="#ef4444" />
            </View>

            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
              No tienes carritos de compra activos
            </Text>

            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', leading: 20, marginBottom: 24 }}>
              Explora las publicaciones y productos de los negocios para añadir elementos a tus carritos por tienda.
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/client')}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#ef4444',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Ionicons name="compass-outline" size={18} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>
                Explorar Negocios
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Business Carts List */
          businessList.map((cart) => {
            const subtotal = getCartSubtotal(cart);
            const itemsCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

            return (
              <View
                key={cart.businessId}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2
                }}
              >
                {/* Business Header */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: '#f9fafb',
                  borderBottomWidth: 1,
                  borderBottomColor: '#f3f4f6'
                }}>
                  <TouchableOpacity
                    onPress={() => router.push(`/client/business/${cart.businessId}`)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}
                  >
                    <View style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: '#ef4444',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      {cart.logoUrl ? (
                        <Image source={{ uri: cart.logoUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      ) : (
                        <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>
                          {cart.businessName?.charAt(0) || 'N'}
                        </Text>
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }} numberOfLines={1}>
                        {cart.businessName}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>
                        {itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Clear Business Cart */}
                  <TouchableOpacity
                    onPress={() => handlePromptClearBusiness(cart.businessId, cart.businessName)}
                    style={{ padding: 6 }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                {/* Items List */}
                <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                  {cart.items.map((item) => (
                    <View
                      key={item.productId}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: '#f9fafb',
                        gap: 12
                      }}
                    >
                      {/* Product Thumbnail */}
                      <View style={{
                        width: 56,
                        height: 56,
                        borderRadius: 10,
                        backgroundColor: '#f3f4f6',
                        overflow: 'hidden',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.image ? (
                          <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                          <Ionicons name="bag-handle-outline" size={24} color="#9ca3af" />
                        )}
                      </View>

                      {/* Product Info */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 }} numberOfLines={1}>
                          {item.name}
                        </Text>

                        {/* Price Breakdown */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary[600] }}>
                            ${item.unitPrice.toFixed(2)}
                          </Text>
                          {item.isDiscountActive && item.originalPrice > item.unitPrice && (
                            <Text style={{ fontSize: 11, color: '#9ca3af', textDecorationLine: 'line-through' }}>
                              ${item.originalPrice.toFixed(2)}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Quantity Controls */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4 }}>
                        <TouchableOpacity
                          onPress={() => updateQuantity(cart.businessId, item.productId, -1)}
                          style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Ionicons name="remove" size={16} color="#374151" />
                        </TouchableOpacity>

                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', minWidth: 16, textAlign: 'center' }}>
                          {item.quantity}
                        </Text>

                        <TouchableOpacity
                          onPress={() => updateQuantity(cart.businessId, item.productId, 1)}
                          style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Ionicons name="add" size={16} color="#374151" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Card Footer: Subtotal & Pay Button */}
                <View style={{
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: '#ffffff',
                  borderTopWidth: 1,
                  borderTopColor: '#f3f4f6'
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 14, color: '#6b7280' }}>
                      Subtotal del pedido:
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>
                      ${subtotal.toFixed(2)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleOpenCheckout(cart)}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: '#ef4444',
                      borderRadius: 12,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <Ionicons name="card-outline" size={18} color="#ffffff" />
                    <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>
                      Pagar a {cart.businessName}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Checkout / Payment Modal */}
      {selectedBusinessCart && (
        <Modal
          visible={checkoutModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCheckoutModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setCheckoutModalVisible(false)} />

            <View style={{
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 32,
              maxHeight: '85%'
            }}>
              {/* Grab Handle */}
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', alignSelf: 'center', marginBottom: 16 }} />

              {/* Modal Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="receipt-outline" size={20} color="#ef4444" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>
                      Detalle de Pedido
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>
                      {selectedBusinessCart.businessName}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity onPress={() => setCheckoutModalVisible(false)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Delivery Option Selector */}
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 10 }}>
                  Tipo de entrega
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                  <TouchableOpacity
                    onPress={() => setDeliveryMethod('delivery')}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: deliveryMethod === 'delivery' ? '#ef4444' : '#e5e7eb',
                      backgroundColor: deliveryMethod === 'delivery' ? '#fef2f2' : '#ffffff',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <Ionicons name="bicycle-outline" size={18} color={deliveryMethod === 'delivery' ? '#ef4444' : '#6b7280'} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: deliveryMethod === 'delivery' ? '#ef4444' : '#374151' }}>
                      Envío Delivery
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setDeliveryMethod('pickup')}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: deliveryMethod === 'pickup' ? '#ef4444' : '#e5e7eb',
                      backgroundColor: deliveryMethod === 'pickup' ? '#fef2f2' : '#ffffff',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <Ionicons name="walk-outline" size={18} color={deliveryMethod === 'pickup' ? '#ef4444' : '#6b7280'} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: deliveryMethod === 'pickup' ? '#ef4444' : '#374151' }}>
                      Retiro en Tienda
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Items Breakdown */}
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 10 }}>
                  Resumen de compra ({selectedBusinessCart.items.length})
                </Text>
                <View style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                  {selectedBusinessCart.items.map((item, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
                      <Text style={{ fontSize: 13, color: '#374151', flex: 1 }}>
                        {item.quantity}x {item.name}
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                  <View style={{ height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
                      Total a Pagar:
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#ef4444' }}>
                      ${getCartSubtotal(selectedBusinessCart).toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Pause Notice Box */}
                <View style={{
                  backgroundColor: '#fffbeb',
                  borderWidth: 1,
                  borderColor: '#fef3c7',
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 16,
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'flex-start'
                }}>
                  <Ionicons name="information-circle" size={20} color="#f59e0b" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#92400e', marginBottom: 2 }}>
                      Módulo de Cobro en Pausa
                    </Text>
                    <Text style={{ fontSize: 12, color: '#b45309', leading: 18 }}>
                      La funcionalidad de procesamiento de pasarela de pago y cobro en línea se encuentra en pausa de momento según lo programado.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setCheckoutModalVisible(false)}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#111827',
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>
                    Entendido
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
