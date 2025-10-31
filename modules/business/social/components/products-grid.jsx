import React, { useState } from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui';
import { colors } from '../../../../shared/utils/colors';
import { useProducts, useDeleteProduct } from '../../../../modules/commerce/hooks/use-products';
import { useBusinessContexts } from '../../../../shared/hooks/use-user-type';
import { CreateProductModal } from './create-product-modal';

export const ProductsGrid = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const businessContexts = useBusinessContexts();
  const currentBusiness = businessContexts[0] || null;
  const businessId = currentBusiness?.businessId;

  const { data: products = [], isLoading } = useProducts({ businessId });

  const handleCreateProduct = () => {
    setCreateModalVisible(true);
  };

  return (
    <>
      <View style={{
        paddingTop: 8,
        backgroundColor: colors.bg.primary
      }}>
        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
        ) : products.length === 0 ? (
          <EmptyState onCreateProduct={handleCreateProduct} />
        ) : (
          <>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingHorizontal: 16,
              paddingBottom: 12
            }}>
              <TouchableOpacity
                onPress={handleCreateProduct}
                style={{
                  backgroundColor: colors.primary[500],
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Ionicons name="add" size={18} color={colors.text.inverse} />
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.inverse
                }}>
                  Nuevo
                </Text>
              </TouchableOpacity>
            </View>
            <PhotoGrid products={products} />
          </>
        )}
      </View>

      <CreateProductModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />
    </>
  );
};

const PhotoGrid = ({ products }) => {
  const businessContexts = useBusinessContexts();
  const currentBusiness = businessContexts[0] || null;
  const businessId = currentBusiness?.businessId;
  const deleteProduct = useDeleteProduct();

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que quieres eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteProduct.mutate({ productId: product.id, businessId })
        }
      ]
    );
  };

  const formatPrice = (price, currency = 'USD') => {
    if (currency === 'USD') {
      return `$${price.toFixed(2)}`;
    }
    return `${price.toFixed(2)} ${currency}`;
  };

  return (
    <View style={{
      flexDirection: 'row',
      flexWrap: 'wrap'
    }}>
      {products.map((product) => (
        <TouchableOpacity
          key={product.id}
          onLongPress={() => handleDeleteProduct(product)}
          style={{
            width: '50%',
            padding: 8
          }}
        >
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            <View style={{ aspectRatio: 1 }}>
              <Image
                source={{ uri: product.thumbnailUrl || product.images?.[0] }}
                style={{
                  flex: 1,
                  backgroundColor: colors.bg.primary
                }}
                resizeMode="cover"
              />
              {!product.isAvailable && (
                <View style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                  borderRadius: 6,
                  padding: 6
                }}>
                  <Text style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: '#fff'
                  }}>
                    AGOTADO
                  </Text>
                </View>
              )}
            </View>
            <View style={{ padding: 12 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: 4
              }} numberOfLines={2}>
                {product.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.primary[500]
                }}>
                  {formatPrice(product.price, product.currency)}
                </Text>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <Text style={{
                    fontSize: 12,
                    color: colors.text.secondary,
                    textDecorationLine: 'line-through'
                  }}>
                    {formatPrice(product.compareAtPrice, product.currency)}
                  </Text>
                )}
              </View>
              {product.trackInventory && (
                <Text style={{
                  fontSize: 11,
                  color: product.stock > 0 ? colors.text.secondary : '#ef4444',
                  marginTop: 4
                }}>
                  Stock: {product.stock}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const EmptyState = ({ onCreateProduct }) => {
  return (
    <View style={{
      padding: 32,
      alignItems: 'center',
      backgroundColor: colors.bg.secondary
    }}>
      <Ionicons
        name="cube-outline"
        size={48}
        color={colors.text.secondary}
        style={{ marginBottom: 12 }}
      />
      <Text style={{
        fontSize: 16,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 6,
        textAlign: 'center'
      }}>
        Sin productos
      </Text>
      <Text style={{
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: 20
      }}>
        Agrega productos a tu catálogo
      </Text>
      <TouchableOpacity
        onPress={onCreateProduct}
        style={{
          backgroundColor: colors.primary[500],
          paddingHorizontal: 32,
          paddingVertical: 12,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8
        }}
      >
        <Ionicons name="add" size={18} color={colors.text.inverse} />
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: colors.text.inverse
        }}>
          Agregar producto
        </Text>
      </TouchableOpacity>
    </View>
  );
};
