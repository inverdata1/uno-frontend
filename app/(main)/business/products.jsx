import React from 'react';
import { View, ScrollView } from 'react-native';
import { BusinessProducts } from '../../../features/business/components';

export default function ProductsScreen() {
  return (
    <ScrollView className="flex-1 bg-secondary">
      <View className="p-4">
        <BusinessProducts />
      </View>
    </ScrollView>
  );
}