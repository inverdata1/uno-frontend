import React from 'react';
import { View, Image } from 'react-native';
import { Link } from 'expo-router';
import { Text, Button } from '../../shared/components/ui';
import { useAppStore } from '../../shared/stores/app-store';

export default function OnboardingScreen() {
  const setOnboardingCompleted = useAppStore(state => state.setOnboardingCompleted);

  // For testing - reset onboarding state when this screen loads
  React.useEffect(() => {
    setOnboardingCompleted(false);
  }, [setOnboardingCompleted]);

  const handleGetStarted = () => {
    setOnboardingCompleted(true);
    // Navigation will be handled by the Link component
  };

  return (
    <View className="flex-1 bg-card px-6 justify-center">
      {/* Logo and branding */}
      <View className="items-center mb-8">
        <View className="w-32 h-32 bg-primary-500 rounded-full items-center justify-center mb-6">
          <Text className="text-4xl font-bold text-primary-foreground">UNO</Text>
        </View>

        <Text variant="heading" className="text-center mb-4">
          Bienvenido a UNO Delivery
        </Text>

        <Text variant="body" className="text-center text-muted-foreground px-4">
          Tu comida favorita, ahora más cerca
        </Text>
      </View>

      {/* Hero illustration placeholder */}
      <View className="items-center mb-8">
        <View className="w-64 h-48 bg-secondary rounded-lg items-center justify-center">
          <Text className="text-6xl">🍕</Text>
          <Text className="text-2xl mt-2">🏍️</Text>
          <Text variant="caption" className="mt-2 text-muted-foreground">
            Delivery rápido en Venezuela
          </Text>
        </View>
      </View>

      {/* Features highlight */}
      <View className="mb-8 space-y-4">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-3">🍔</Text>
          <Text variant="body">Restaurantes locales</Text>
        </View>

        <View className="flex-row items-center">
          <Text className="text-2xl mr-3">💳</Text>
          <Text variant="body">Pago seguro con wallet</Text>
        </View>

        <View className="flex-row items-center">
          <Text className="text-2xl mr-3">⚡</Text>
          <Text variant="body">Entrega rápida</Text>
        </View>
      </View>

      {/* CTA Button */}
      <View className="mt-auto mb-8">
        <Link href="/(auth)/login" asChild>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onPress={handleGetStarted}
          >
            Empezar
          </Button>
        </Link>

        <View className="flex-row justify-center mt-4">
          <Text variant="caption" className="text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
          </Text>
          <Link href="/(auth)/login">
            <Text variant="caption" className="text-primary-500 font-medium">
              Inicia sesión
            </Text>
          </Link>
        </View>
      </View>
    </View>
  );
}