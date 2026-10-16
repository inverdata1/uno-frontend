import { Redirect, useRootNavigationState } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '../core/auth/stores/auth-store';
import { useCurrentUserType } from '../shared/hooks/use-user-type';
import { Text } from '../shared/components/ui';
import { BrandLogo } from '../shared/components/ui/brand-logo';

function LoadingScreen() {
  return (
    <View className="flex-1 bg-card items-center justify-center">
      <BrandLogo height={44} style={{ marginBottom: 16 }} />
      <Text variant="body" className="text-muted-foreground">
        Cargando...
      </Text>
    </View>
  );
}

export default function IndexScreen() {
  const navigationState = useRootNavigationState();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { currentUserType, isLoading: userTypeLoading } = useCurrentUserType();

  // Wait until the navigator is fully mounted
  if (!navigationState?.key) {
    return <LoadingScreen />;
  }

  // Wait for auth to load first
  if (authLoading) {
    return <LoadingScreen />;
  }

  // If not authenticated, redirect to welcome
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // If authenticated, wait for user type to load
  if (userTypeLoading) {
    return <LoadingScreen />;
  }

  // Redirect to user type specific section
  if (currentUserType) {
    return <Redirect href={`/${currentUserType}/(tabs)`} />;
  }

  return <LoadingScreen />;
}
