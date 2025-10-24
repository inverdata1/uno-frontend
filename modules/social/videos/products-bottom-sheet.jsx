import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { Text } from '../../../shared/components/ui';

const CustomBackdrop = (props) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.6}
  />
);

export default function ProductsBottomSheet({ visible, products = [], onClose, onProductSelect }) {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['65%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={CustomBackdrop}
      onChange={handleSheetChanges}
      onDismiss={onClose}
      backgroundStyle={{
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24
      }}
      handleIndicatorStyle={{
        backgroundColor: '#e5e7eb',
        width: 40,
        height: 4
      }}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        paddingBottom: 16
      }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
          Productos etiquetados
        </Text>
        <TouchableOpacity
          onPress={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#f3f4f6',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons name="close" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <BottomSheetFlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: product }) => (
          <TouchableOpacity
            onPress={() => onProductSelect(product)}
            activeOpacity={0.95}
            style={{
              flexDirection: 'row',
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 12,
              gap: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
              borderWidth: 1,
              borderColor: '#f1f5f9'
            }}
          >
            {/* Product Image */}
            <View style={{
              width: 88,
              height: 88,
              borderRadius: 12,
              backgroundColor: '#f9fafb',
              overflow: 'hidden'
            }}>
              {product.thumbnailUrl ? (
                <Image
                  source={{ uri: product.thumbnailUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="image-outline" size={36} color="#cbd5e1" />
                </View>
              )}
            </View>

            {/* Product Info */}
            <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 4 }}>
              <Text style={{
                fontSize: 15,
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: 6,
                lineHeight: 20
              }} numberOfLines={2}>
                {product.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>
                  ${product.price}
                </Text>
                {product.compareAtPrice && (
                  <Text style={{
                    fontSize: 14,
                    color: '#94a3b8',
                    textDecorationLine: 'line-through'
                  }}>
                    ${product.compareAtPrice}
                  </Text>
                )}
              </View>
            </View>

            {/* Arrow */}
            <View style={{ justifyContent: 'center' }}>
              <View style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: '#f9fafb',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Ionicons name="chevron-forward" size={18} color="#64748b" />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </BottomSheetModal>
  );
}
