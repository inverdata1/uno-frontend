import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../shared/components/ui';
import { colors } from '../../../shared/utils/colors';
import { ProductsGrid } from '../products/components/products-grid';
import { CategoriesList } from './components/categories-list';
import { useBusinessContexts, useCurrentUserType } from '../../../shared/hooks/use-user-type';
import { shareBusinessCatalog } from '../../../shared/utils/share-catalog';

const TABS = [
  { id: 'products', label: 'Catálogo' },
  { id: 'categories', label: 'Categorías' }
];

export default function BusinessStoreScreen() {
  const [activeTab, setActiveTab] = useState('products');
  const [createProductModalVisible, setCreateProductModalVisible] = useState(false);
  const [createCategoryModalVisible, setCreateCategoryModalVisible] = useState(false);
  const { currentContext } = useCurrentUserType();
  const businessContexts = useBusinessContexts();
  const businessId = currentContext?.businessId;
  const currentBusiness = businessContexts.find((b) => (b.businessId || b.id) === businessId) || businessContexts[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
      {/* Minimal Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.bg.primary,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border.light
      }}>
        <Text style={{
          fontSize: 20,
          fontWeight: '700',
          color: colors.text.primary,
          letterSpacing: 0.3
        }}>
          Mi Tienda
        </Text>
        <TouchableOpacity
          onPress={() => shareBusinessCatalog({ id: businessId, name: currentBusiness?.name || currentBusiness?.businessName })}
          activeOpacity={0.8}
          accessibilityLabel="Compartir catálogo"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#fef2f2'
          }}
        >
          <Ionicons name="share-social-outline" size={17} color={colors.primary[500]} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary[500] }}>Compartir catálogo</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ backgroundColor: colors.bg.primary }}>
        <View style={{
          flexDirection: 'row',
          marginHorizontal: 16,
          marginVertical: 12,
          backgroundColor: colors.bg.secondary,
          borderRadius: 8,
          padding: 4,
        }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: 'center',
                  backgroundColor: isActive ? colors.bg.primary : 'transparent',
                  borderRadius: 6,
                  shadowColor: isActive ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: isActive ? 2 : 0,
                }}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? colors.text.primary : colors.text.secondary
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1, position: 'relative', backgroundColor: colors.bg.secondary }}>
          {activeTab === 'products' ? (
            <ProductsGrid
              createModalVisible={createProductModalVisible}
              setCreateModalVisible={setCreateProductModalVisible}
            />
          ) : (
            <CategoriesList 
              createModalVisible={createCategoryModalVisible}
              setCreateModalVisible={setCreateCategoryModalVisible}
            />
          )}
          {/* Floating Add Button - Fixed to bottom right */}
          <TouchableOpacity
            onPress={() => {
              if (activeTab === 'products') {
                setCreateProductModalVisible(true);
              } else {
                setCreateCategoryModalVisible(true);
              }
            }}
            style={{
              position: 'absolute',
              bottom: 24,
              right: 20,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primary[500],
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8
            }}
          >
            <Ionicons name="add" size={28} color={colors.text.inverse} />
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}
