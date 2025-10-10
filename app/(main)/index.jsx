import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ClientHomeScreen from '../../features/client/home';
import BusinessDashboardScreen from '../../features/business/dashboard';
import DriverDeliveriesScreen from '../../features/driver/deliveries';
import { useCurrentMode } from '../../shared/hooks/use-user-modes';

export default function HomeScreen() {
  const { currentMode } = useCurrentMode();

  const renderModeContent = () => {
    switch (currentMode) {
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