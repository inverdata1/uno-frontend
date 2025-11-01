import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductsGrid } from './components/products-grid';
import { Text } from '../../../shared/components/ui';
import { colors } from '../../../shared/utils/colors';

/**
 * Business Products Screen
 * Manage product catalog
 */
export default function BusinessProductsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{
          padding: 20,
          paddingTop: 12,
          backgroundColor: colors.bg.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light
        }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: 4
          }}>
            Productos
          </Text>
          <Text style={{
            fontSize: 15,
            color: colors.text.secondary
          }}>
            Gestiona el catálogo de tu negocio
          </Text>
        </View>

        {/* Products Grid */}
        <ProductsGrid />
      </ScrollView>
    </SafeAreaView>
  );
}
