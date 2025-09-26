import React from 'react';
import { View, ScrollView } from 'react-native';
import { Card, Text } from '../../shared/components/ui';
import { ModeSwitcher } from '../../shared/components/mode-switcher';
import { ClientModeContent, BusinessModeContent, DeliveryModeContent } from '../../features/home/components';
import { useHomeContent } from '../../features/home/hooks/use-home-content';

export default function HomeScreen() {
  const { user, currentMode, currentBusiness, greeting, onModeSwitch } = useHomeContent();

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
    <ScrollView className="flex-1 bg-secondary">
      <View className="p-4 space-y-4">

        {/* Header */}
        <Card>
          <Text variant="heading" className="mb-2">
            ¡Hola, {user?.firstName || 'Usuario'}! 👋
          </Text>
          <Text variant="body">
            {greeting}
          </Text>
        </Card>

        {/* Mode Switcher */}
        <ModeSwitcher onModeSwitch={onModeSwitch} />

        {/* Mode-specific Content */}
        {renderModeContent()}

      </View>
    </ScrollView>
  );
}

