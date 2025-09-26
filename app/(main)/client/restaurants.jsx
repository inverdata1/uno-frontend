import React from 'react';
import { View, ScrollView } from 'react-native';
import { ProductsList } from '../../../features/products/components';

export default function ProductsScreen() {
  return (
    <ScrollView className="flex-1 bg-secondary">
      <View className="p-4">
        <ProductsList />
      </View>
    </ScrollView>
  );
}