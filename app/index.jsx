import { Redirect, useRootNavigationState } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '../core/auth/stores/auth-store';
import { useCurrentUserType } from '../shared/hooks/use-user-type';
import { Text } from '../shared/components/ui';

function LoadingScreen() {
  return (
    <View className="flex-1 bg-card items-center justify-center">
      <View className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center mb-4">
        <Text className="text-xl font-bold text-primary-foreground">UNO</Text>
      </View>
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
