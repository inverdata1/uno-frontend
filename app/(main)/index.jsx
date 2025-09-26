import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClientModeContent } from '../../modes/client/components';
import { BusinessModeContent } from '../../modes/business/components';
import { DeliveryModeContent } from '../../modes/delivery/components';
import { useHomeContent } from '../../modes/client/hooks/use-home-content';

export default function HomeScreen() {
  const { user, currentMode, currentBusiness, greeting } = useHomeContent();

  const renderModeContent = () => {
    switch (currentMode) {
      case 'business':
        return <BusinessModeContent businessContext={currentBusiness} />;
      case 'delivery':
        return <DeliveryModeContent />;
      default:
        return <ClientModeContent />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ flex: 1 }}>
        {/* Mode-specific Content */}
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