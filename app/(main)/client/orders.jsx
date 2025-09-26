import React from 'react';
import { View, ScrollView } from 'react-native';
import { OrdersList } from '../../../features/orders/components';

export default function OrdersScreen() {
  return (
    <ScrollView className="flex-1 bg-secondary">
      <View className="p-4">
        <OrdersList />
      </View>
    </ScrollView>
  );
}