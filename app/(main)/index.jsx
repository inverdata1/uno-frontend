import React, { useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Card, Text, Button } from '../../shared/components/ui';
import { ModeSwitcher } from '../../shared/components/mode-switcher';
import { ClientModeContent, BusinessModeContent, DeliveryModeContent } from '../../features/home/components';
import { useHomeContent } from '../../features/home/hooks/use-home-content';

export default function HomeScreen() {
  const { user, currentMode, currentBusiness, greeting, onModeSwitch } = useHomeContent();

  // Bottom sheet test - using official example
  const bottomSheetRef = useRef(null);

  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);

  const handleOpenBottomSheet = useCallback(() => {
    console.log('🔥 Button pressed - trying to open bottom sheet');
    console.log('🔥 bottomSheetRef.current:', bottomSheetRef.current);

    if (bottomSheetRef.current) {
      console.log('🔥 Ref exists, calling expand()');
      bottomSheetRef.current.expand();
    } else {
      console.log('❌ bottomSheetRef.current is null!');
    }
  }, []);

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
      <View style={{ flex: 1, padding: 16 }}>
        {/* Header */}
        <Card>
          <Text variant="heading" className="mb-2">
            ¡Hola, {user?.firstName || 'Usuario'}!
          </Text>
          <Text variant="body">
            {greeting}
          </Text>
        </Card>

        {/* Bottom Sheet Test Button */}
        <View style={{ marginVertical: 16 }}>
          <Button onPress={handleOpenBottomSheet}>
            Test Bottom Sheet (Official Example)
          </Button>
        </View>

        {/* Mode Switcher */}
        <ModeSwitcher onModeSwitch={onModeSwitch} />

        {/* Mode-specific Content */}
        {renderModeContent()}
      </View>

      {/* Official Example Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Awesome 🎉</Text>
          <Text style={{ marginTop: 10, color: '#666' }}>
            This is the official @gorhom/bottom-sheet example
          </Text>
          <Button
            onPress={() => bottomSheetRef.current?.close()}
            style={{ marginTop: 20 }}
          >
            Close
          </Button>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
});