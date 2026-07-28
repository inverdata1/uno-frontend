import React, { useState } from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator, Alert, FlatList, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui';
import { colors } from '../../../../shared/utils/colors';
import { useProducts, useDeleteProduct, useUpdateProduct } from '../../../../features/shared/products/hooks/use-products';
import { useCurrentUserType } from '../../../../shared/hooks/use-user-type';
import { CreateProductModal } from './create-product-modal';
import ProductDetailModal from '../../../client/products/product-detail-modal';

export const ProductsGrid = ({ createModalVisible, setCreateModalVisible }) => {
  const { currentContext } = useCurrentUserType();
  const businessId = currentContext?.businessId;

  const { data: products = [], isLoading } = useProducts({ businessId });
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productDetailVisible, setProductDetailVisible] = useState(false);

  // Use internal state if props not provided (for other screens)
  const [internalModalVisible, setInternalModalVisible] = useState(false);
  const modalVisible = createModalVisible !== undefined ? createModalVisible : internalModalVisible;
  const setModalVisible = setCreateModalVisible || setInternalModalVisible;
  const [editingProduct, setEditingProduct] = useState(null);

  const handleCreateProduct = () => {
    setModalVisible(true);
  };

  const handleProductPress = (productId) => {
    setSelectedProductId(productId);
    setProductDetailVisible(true);
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
        <PhotoGrid 
          products={products} 
          onProductPress={handleProductPress} 
          onEditProduct={(product) => {
            setEditingProduct(product);
            setModalVisible(true);
          }}
        />
      )}

      <CreateProductModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
      />

      {selectedProductId && (
        <ProductDetailModal
          visible={productDetailVisible}
          productId={selectedProductId}
          currentBusinessId={businessId}
          onClose={() => {
            setProductDetailVisible(false);
            setSelectedProductId(null);
          }}
        />
      )}
    </>
  );
};

const ProductCard = ({ product, onPress, onOptions }) => {
  const formatPrice = (price, currency = 'USD') => {
    if (price == null) return '';
    if (currency === 'USD') {
      return `$${Number(price).toFixed(2)}`;
    }
    return `${Number(price).toFixed(2)} ${currency}`;
  };

  // Determine actual prices to show based on new schema
  // price = Normal Price
  // discountPrice = Discount Price
  // isDiscountActive = Flag
  const hasActiveDiscount = product.isDiscountActive && product.discountPrice != null;
  const currentPrice = hasActiveDiscount ? product.discountPrice : product.price;
  const originalPrice = hasActiveDiscount ? product.price : null;
  
  const discountPercent = hasActiveDiscount 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(product.id)}
      activeOpacity={0.7}
      style={{
        flex: 1,
        backgroundColor: colors.bg.primary,
        borderRadius: 12,
        margin: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border.light,
        maxWidth: '48%', // Ensure it fits nicely in 2 columns
      }}
    >
      {/* Product Image Container */}
      <View style={{ position: 'relative', width: '100%', aspectRatio: 1 }}>
        {product.images && product.images.length > 1 ? (
          <FlatList
            data={product.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={true}
            keyExtractor={(item, index) => `${product.id}-img-${index}`}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{
                  height: '100%',
                  aspectRatio: 1,
                  backgroundColor: colors.bg.tertiary
                }}
                resizeMode="cover"
              />
            )}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <Image
            source={{ uri: product.thumbnailUrl || product.images?.[0] }}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: colors.bg.tertiary
            }}
            resizeMode="cover"
          />
        )}
        {/* Context Menu Button Overlay */}
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            onOptions(product);
          }}
          style={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 16,
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons name="ellipsis-vertical" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={{ padding: 10 }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: colors.text.primary,
          marginBottom: 4
        }} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
          <Text style={{
            fontSize: 15,
            fontWeight: '700',
            color: colors.text.primary
          }}>
            {formatPrice(currentPrice, product.currency)}
          </Text>
          {hasActiveDiscount && (
            <Text style={{
              fontSize: 12,
              fontWeight: '500',
              color: colors.text.secondary,
              textDecorationLine: 'line-through'
            }}>
              {formatPrice(originalPrice, product.currency)}
            </Text>
          )}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: product.isAvailable ? colors.success || '#4ade80' : colors.error
          }}>
            {product.isAvailable ? 'Disponible' : 'Agotado'}
          </Text>
          
          {hasActiveDiscount && (
            <View style={{
              backgroundColor: colors.error,
              borderRadius: 4,
              paddingHorizontal: 4,
              paddingVertical: 2,
            }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>
                -{discountPercent}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const PhotoGrid = ({ products, onProductPress, onEditProduct }) => {
  const { currentContext } = useCurrentUserType();
  const businessId = currentContext?.businessId;
  
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  const [selectedProductOptions, setSelectedProductOptions] = useState(null);

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que quieres eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteProduct.mutate({ productId: product.id, businessId });
            setSelectedProductOptions(null);
          }
        }
      ]
    );
  };

  const handleToggleAvailability = (product) => {
    updateProduct.mutate({
      productId: product.id,
      productData: { isAvailable: !product.isAvailable }
    }, {
      onError: (err) => Alert.alert('Error', 'No se pudo actualizar el estado: ' + err.message)
    });
    setSelectedProductOptions(null);
  };

  const handleToggleDiscount = (product) => {
    updateProduct.mutate({
      productId: product.id,
      productData: { isDiscountActive: !product.isDiscountActive }
    }, {
      onError: (err) => Alert.alert('Error', 'No se pudo actualizar el descuento: ' + err.message)
    });
    setSelectedProductOptions(null);
  };

  return (
    <>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 8 }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={onProductPress}
            onOptions={(p) => setSelectedProductOptions(p)}
          />
        )}
        contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 8 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        nestedScrollEnabled={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {/* Options Context Menu Modal */}
      {selectedProductOptions && (
        <Modal
          visible={!!selectedProductOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedProductOptions(null)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1} 
            onPress={() => setSelectedProductOptions(null)}
          >
            <View style={styles.menuContainer}>
              <Text style={styles.menuTitle}>{selectedProductOptions.name}</Text>
              
              <TouchableOpacity style={styles.menuOption} onPress={() => handleToggleAvailability(selectedProductOptions)}>
                <Ionicons 
                  name={selectedProductOptions.isAvailable ? "close-circle-outline" : "checkmark-circle-outline"} 
                  size={22} 
                  color={colors.text.primary} 
                />
                <Text style={styles.menuOptionText}>
                  Marcar como {selectedProductOptions.isAvailable ? 'Agotado' : 'Disponible'}
                </Text>
              </TouchableOpacity>

              {selectedProductOptions.discountPrice && (
                <TouchableOpacity style={styles.menuOption} onPress={() => handleToggleDiscount(selectedProductOptions)}>
                  <Ionicons name="pricetag-outline" size={22} color={colors.text.primary} />
                  <Text style={styles.menuOptionText}>
                    {selectedProductOptions.isDiscountActive ? 'Aplicar precio estandar' : 'Aplicar precio descuento'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.menuOption} onPress={() => {
                onEditProduct(selectedProductOptions);
                setSelectedProductOptions(null);
              }}>
                <Ionicons name="pencil-outline" size={22} color={colors.text.primary} />
                <Text style={styles.menuOptionText}>Editar Producto</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuOption, styles.menuOptionDestructive]} onPress={() => handleDeleteProduct(selectedProductOptions)}>
                <Ionicons name="trash-outline" size={22} color={colors.error} />
                <Text style={[styles.menuOptionText, { color: colors.error }]}>Eliminar Producto</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  menuContainer: {
    width: '100%',
    backgroundColor: colors.bg.primary,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center'
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light
  },
  menuOptionDestructive: {
    borderBottomWidth: 0
  },
  menuOptionText: {
    fontSize: 15,
    color: colors.text.primary,
    marginLeft: 12,
    fontWeight: '500'
  }
});

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
