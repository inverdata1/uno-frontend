import React from 'react';
import { View, ScrollView } from 'react-native';
import { BusinessDashboard } from '../../../modes/business/components';

export default function BusinessDashboardScreen() {
  return (
    <ScrollView className="flex-1 bg-secondary">
      <View className="p-4">
        <BusinessDashboard />
      </View>
    </ScrollView>
  );
}