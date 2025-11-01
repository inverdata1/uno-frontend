import React, { useState } from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui';
import { colors } from '../../../../shared/utils/colors';
import { useProducts, useDeleteProduct } from '../../../../modules/commerce/hooks/use-products';
import { useBusinessContexts } from '../../../../shared/hooks/use-user-type';
import { CreateProductModal } from './create-product-modal';

export const ProductsGrid = ({ createModalVisible, setCreateModalVisible }) => {
  const businessContexts = useBusinessContexts();
  const currentBusiness = businessContexts[0] || null;
  const businessId = currentBusiness?.businessId;

  const { data: products = [], isLoading } = useProducts({ businessId });

  // Use internal state if props not provided (for other screens)
  const [internalModalVisible, setInternalModalVisible] = useState(false);
  const modalVisible = createModalVisible !== undefined ? createModalVisible : internalModalVisible;
  const setModalVisible = setCreateModalVisible || setInternalModalVisible;

  const handleCreateProduct = () => {
    setModalVisible(true);
  };

  return (
    <>
      {isLoading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : products.length === 0 ? (
        <EmptyState onCreateProduct={handleCreateProduct} />
      ) : (
        <PhotoGrid products={products} />
      )}

      <CreateProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const ProductCard = ({ product, onDelete }) => {
  const formatPrice = (price, currency = 'USD') => {
    if (currency === 'USD') {
      return `$${price.toFixed(2)}`;
    }
    return `${price.toFixed(2)} ${currency}`;
  };

  const getStockStatus = (product) => {
    if (!product.trackInventory) return null;
    if (product.stock === 0 || !product.isAvailable) {
      return { text: 'Agotado', color: colors.error };
    }
    if (product.stock <= 5) {
      return { text: `${product.stock} en stock`, color: colors.warning };
    }
    return { text: `${product.stock} en stock`, color: colors.text.secondary };
  };

  const stockStatus = getStockStatus(product);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <TouchableOpacity
      onLongPress={() => onDelete(product)}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        backgroundColor: colors.bg.primary,
        borderRadius: 12,
        marginBottom: 12,
        marginHorizontal: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border.light
      }}
    >
      {/* Product Image */}
      <Image
        source={{ uri: product.thumbnailUrl || product.images?.[0] }}
        style={{
          width: 100,
          height: 100,
          backgroundColor: colors.bg.tertiary
        }}
        resizeMode="cover"
      />

      {/* Product Info */}
      <View style={{
        flex: 1,
        padding: 12,
        justifyContent: 'space-between'
      }}>
        {/* Top Section - Name and Status */}
        <View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 4
          }}>
            <Text style={{
              fontSize: 15,
              fontWeight: '600',
              color: colors.text.primary,
              flex: 1,
              marginRight: 8
            }} numberOfLines={1}>
              {product.name}
            </Text>
            {hasDiscount && (
              <View style={{
                backgroundColor: colors.error,
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2
              }}>
                <Text style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: '#fff'
                }}>
                  -{discountPercent}%
                </Text>
              </View>
            )}
          </View>

          <Text style={{
            fontSize: 13,
            color: colors.text.secondary,
            marginBottom: 8
          }} numberOfLines={2}>
            {product.description}
          </Text>
        </View>

        {/* Bottom Section - Price and Stock */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end'
        }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text.primary
              }}>
                {formatPrice(product.price, product.currency)}
              </Text>
              {hasDiscount && (
                <Text style={{
                  fontSize: 13,
                  fontWeight: '500',
                  color: colors.text.secondary,
                  textDecorationLine: 'line-through'
                }}>
                  {formatPrice(product.compareAtPrice, product.currency)}
                </Text>
              )}
            </View>
          </View>

          {stockStatus && (
            <View style={{
              backgroundColor: colors.bg.secondary,
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4
            }}>
              <Text style={{
                fontSize: 11,
                fontWeight: '600',
                color: stockStatus.color
              }}>
                {stockStatus.text}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
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

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ProductCard product={item} onDelete={handleDeleteProduct} />
      )}
      contentContainerStyle={{ paddingVertical: 16 }}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
};

const EmptyState = ({ onCreateProduct }) => {
  return (
    <View style={{
      flex: 1,
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg.secondary,
      minHeight: 400
    }}>
      <View style={{
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
        borderColor: colors.border.light,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24
      }}>
        <Ionicons
          name="camera-outline"
          size={48}
          color={colors.text.secondary}
        />
      </View>
      <Text style={{
        fontSize: 22,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 8,
        textAlign: 'center'
      }}>
        Comparte tus productos
      </Text>
      <Text style={{
        fontSize: 15,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22
      }}>
        Cuando compartas productos, aparecerán en tu perfil
      </Text>
      <TouchableOpacity
        onPress={onCreateProduct}
        style={{
          backgroundColor: colors.primary[500],
          paddingHorizontal: 28,
          paddingVertical: 12,
          borderRadius: 8
        }}
      >
        <Text style={{
          fontSize: 15,
          fontWeight: '700',
          color: colors.text.inverse
        }}>
          Crear primer producto
        </Text>
      </TouchableOpacity>
    </View>
  );
};
