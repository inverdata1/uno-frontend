import React from 'react';
import { View, ScrollView } from 'react-native';
import { DeliveryDashboard } from '../../../features/delivery/components';

export default function DeliveryDashboardScreen() {
  return (
    <ScrollView className="flex-1 bg-secondary">
      <View className="p-4">
        <DeliveryDashboard />
      </View>
    </ScrollView>
  );
}