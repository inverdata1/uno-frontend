import React from 'react';
import { View, ScrollView } from 'react-native';
import { OrdersList } from '../../../modes/client/components';

export default function OrdersScreen() {
  return (
    <ScrollView className="flex-1 bg-secondary">
      <View className="p-4">
        <OrdersList />
      </View>
    </ScrollView>
  );
}