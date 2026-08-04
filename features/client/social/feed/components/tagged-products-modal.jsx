import React from 'react';
import { View, Modal, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../../shared/components/ui/text';
import { useProducts } from '../../../../shared/products/hooks/use-products';
import { colors } from '../../../../../shared/utils/colors';

/**
 * TaggedProductsModal Component
 * Displays a list of tagged products in a post with prices and "Añadir al carrito" button
 */
export const TaggedProductsModal = ({
  visible,
  onClose,
  taggedProducts = [],
  businessId,
  onProductPress
}) => {
  const { data: allProducts = [] } = useProducts({ businessId, limit: 50 });

  const handleAddToCart = (productName) => {
    Alert.alert(
      'Carrito de Compras',
      `¡${productName} ha sido añadido a tu carrito!`,
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        {/* Backdrop Tap to Close */}
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <View style={{
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '75%',
          paddingBottom: 24
        }}>
          {/* Modal Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#f3f4f6'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="pricetag" size={16} color="#ef4444" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
                Productos etiquetados ({taggedProducts.length})
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#f3f4f6',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Products List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
          >
            {taggedProducts.map((tag, index) => {
              const rawProduct = typeof tag === 'object' ? (tag.product || tag) : { id: tag };
              const productId = rawProduct.productId || rawProduct.id || tag;

              // Match with database product if available
              const fullProduct = allProducts.find(p => p.id === productId) || rawProduct;

              const name = fullProduct.name || fullProduct.title || 'Producto';
              const imageUrl = fullProduct.thumbnailUrl || fullProduct.imageUrl || (fullProduct.images && fullProduct.images[0]) || null;
              
              // Calculate discount price logic
              const rawPrice = Number(fullProduct.price || fullProduct.regularPrice || 0);
              const discountPrice = Number(fullProduct.discountPrice || 0);
              const isDiscountActive = Boolean(fullProduct.isDiscountActive && discountPrice > 0 && discountPrice < rawPrice);
              
              const currentPrice = isDiscountActive ? discountPrice : rawPrice;

              return (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    borderWidth: 1,
                    borderColor: '#f3f4f6',
                    borderRadius: 16,
                    padding: 12,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                    elevation: 2
                  }}
                >
                  {/* Image */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      onClose();
                      onProductPress?.(fullProduct);
                    }}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      backgroundColor: '#f9fafb',
                      overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: '#f3f4f6'
                    }}
                  >
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="bag-handle-outline" size={28} color="#9ca3af" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Product Details */}
                  <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        onClose();
                        onProductPress?.(fullProduct);
                      }}
                    >
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 }} numberOfLines={1}>
                        {name}
                      </Text>
                    </TouchableOpacity>

                    {/* Price display */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: colors.primary[600] }}>
                        ${currentPrice.toFixed(2)}
                      </Text>

                      {isDiscountActive && (
                        <Text style={{ fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' }}>
                          ${rawPrice.toFixed(2)}
                        </Text>
                      )}
                    </View>

                    {/* Add to Cart Button */}
                    <TouchableOpacity
                      onPress={() => handleAddToCart(name)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: '#ef4444',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignSelf: 'flex-start',
                        gap: 6
                      }}
                    >
                      <Ionicons name="cart-outline" size={14} color="#ffffff" />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
                        Añadir al carrito
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
