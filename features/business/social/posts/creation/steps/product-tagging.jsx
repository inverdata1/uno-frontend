import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Image, Dimensions, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Text } from '../../../../../../shared/components/ui';
import { colors } from '../../../../../../shared/utils/colors';
import { useProducts } from '../../../../../shared/products/hooks/use-products';
import { useCurrentUserType } from '../../../../../../shared/hooks/use-user-type';

const { width, height } = Dimensions.get('window');

/**
 * Step 2: Product Tagging
 * Tap on images to tag products (Instagram-style)
 */
export function ProductTaggingStep({ selectedMedia, taggedProducts, onAddTag, onRemoveTag, onNext, onBack }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const bottomSheetRef = useRef(null);

  // Get current business context to fetch its products
  const { currentContext, isLoading: userTypeLoading } = useCurrentUserType();
  const businessId = currentContext?.businessId;

  console.log('[ProductTagging] Current context:', currentContext);
  console.log('[ProductTagging] Business ID:', businessId);
  console.log('[ProductTagging] User type loading:', userTypeLoading);

  const { data: allProducts = [], isLoading: productsLoading } = useProducts({ businessId, limit: 100 });

  console.log('[ProductTagging] Products loading:', productsLoading);
  console.log('[ProductTagging] Products count:', allProducts.length);
  console.log('[ProductTagging] First product:', allProducts[0]);

  const currentMedia = selectedMedia[currentMediaIndex];
  const currentTags = taggedProducts.filter(tag => tag.mediaIndex === currentMediaIndex);

  // Filter out already tagged products and apply search
  const filteredProducts = allProducts.filter(product => {
    const isAlreadyTagged = currentTags.some(tag => tag.productId === product.id);
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return !isAlreadyTagged && matchesSearch;
  });

  const handleImageTap = () => {
    setShowProductSheet(true);
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleSelectProduct = (product) => {
    onAddTag({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0],
      mediaIndex: currentMediaIndex,
    });

    setSearchQuery('');
    bottomSheetRef.current?.close();
  };

  const handleRemoveTag = (productId) => {
    onRemoveTag(productId, currentMediaIndex);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light
      }}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text.primary
        }}>
          Etiquetar productos
        </Text>
        <TouchableOpacity onPress={onNext}>
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: colors.primary[500]
          }}>
            {currentTags.length > 0 ? 'Siguiente' : 'Omitir'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Media Preview with Tags */}
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleImageTap}
          style={{
            width: width,
            height: width * 1.25, // 4:5 aspect ratio
            backgroundColor: colors.bg.secondary
          }}
        >
          <Image
            source={{ uri: currentMedia.uri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />

          {/* Tap Indicator */}
          <View style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
          }}>
            <Ionicons name="hand-left" size={20} color="#fff" />
            <Text style={{
              fontSize: 14,
              color: '#fff',
              flex: 1
            }}>
              Toca la imagen para etiquetar productos
            </Text>
          </View>
        </TouchableOpacity>

        {/* Media Thumbnails */}
        {selectedMedia.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              padding: 16,
              gap: 8
            }}
          >
            {selectedMedia.map((media, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentMediaIndex(index)}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: index === currentMediaIndex ? colors.primary[500] : 'transparent'
                }}
              >
                <Image
                  source={{ uri: media.uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                {taggedProducts.filter(t => t.mediaIndex === index).length > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: colors.primary[500],
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>
                      {taggedProducts.filter(t => t.mediaIndex === index).length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Tagged Products List */}
        {currentTags.length > 0 && (
          <View style={{
            backgroundColor: colors.bg.secondary,
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border.light
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.secondary,
              marginBottom: 12
            }}>
              Productos etiquetados ({currentTags.length})
            </Text>
            <View style={{ gap: 8 }}>
              {currentTags.map((tag, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: colors.bg.primary,
                    padding: 12,
                    borderRadius: 12
                  }}
                >
                  {tag.productImage && (
                    <Image
                      source={{ uri: tag.productImage }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: colors.bg.secondary
                      }}
                      resizeMode="cover"
                    />
                  )}
                  <Text style={{
                    flex: 1,
                    fontSize: 15,
                    fontWeight: '500',
                    color: colors.text.primary
                  }}>
                    {tag.productName}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag.productId)}>
                    <Ionicons name="close-circle" size={24} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Product Selection Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['75%', '90%']}
        enablePanDownToClose
      >
        <BottomSheetView style={{ flex: 1, padding: 16 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: 16
          }}>
            Seleccionar producto
          </Text>

          {/* Search */}
          <BottomSheetTextInput
            placeholder="Buscar producto..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              backgroundColor: colors.bg.secondary,
              borderRadius: 12,
              padding: 12,
              fontSize: 15,
              color: colors.text.primary,
              marginBottom: 16
            }}
          />

          {/* Products List */}
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectProduct(item)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  backgroundColor: colors.bg.secondary,
                  borderRadius: 12,
                  marginBottom: 8
                }}
              >
                {item.thumbnailUrl || item.images?.[0] ? (
                  <Image
                    source={{ uri: item.thumbnailUrl || item.images[0] }}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 8,
                      backgroundColor: colors.bg.secondary
                    }}
                    resizeMode="cover"
                    onError={() => {
                      console.log('[ProductTagging] Failed to load image for:', item.name);
                    }}
                  />
                ) : (
                  <View style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    backgroundColor: colors.bg.secondary,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons name="image-outline" size={24} color={colors.text.secondary} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: colors.text.primary,
                    marginBottom: 2
                  }}>
                    {item.name}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: colors.text.secondary
                  }}>
                    ${item.price}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              productsLoading ? (
                <View style={{ alignItems: 'center', marginTop: 32 }}>
                  <ActivityIndicator size="large" color={colors.primary[500]} />
                  <Text style={{
                    fontSize: 15,
                    color: colors.text.secondary,
                    marginTop: 12
                  }}>
                    Cargando productos...
                  </Text>
                </View>
              ) : (
                <Text style={{
                  fontSize: 15,
                  color: colors.text.secondary,
                  textAlign: 'center',
                  marginTop: 32
                }}>
                  No se encontraron productos
                </Text>
              )
            }
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
