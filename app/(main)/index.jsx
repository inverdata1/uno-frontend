import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ClientHomeScreen from '../../modules/home/client-home';
import BusinessDashboardScreen from '../../modules/analytics/dashboard';
import DriverDeliveriesScreen from '../../modules/delivery/deliveries';
import { useCurrentUserType } from '../../shared/hooks/use-user-type';

export default function HomeScreen() {
  const { currentUserType } = useCurrentUserType();

  const renderModeContent = () => {
    switch (currentUserType) {
      case 'business':
        return <BusinessDashboardScreen />;
      case 'delivery':
        return <DriverDeliveriesScreen />;
      default:
        return <ClientHomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ flex: 1 }}>
        {renderModeContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});