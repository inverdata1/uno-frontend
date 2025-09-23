import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '../shared/stores/auth-store';
import { useAppStore } from '../shared/stores/app-store';
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
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { isOnboardingCompleted } = useAppStore();

  useEffect(() => {
    if (authLoading) {
      return; // Still loading, don't navigate yet
    }

    console.log('Routing decision:', { isAuthenticated, isOnboardingCompleted });

    // Only navigate once on app start, then let individual screens handle their own navigation
    if (!isAuthenticated) {
      // User not authenticated - go to auth flow
      if (!isOnboardingCompleted) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(auth)/login');
      }
    } else {
      // User authenticated - go to main app
      router.replace('/(main)');
    }
  }, [isAuthenticated, authLoading, router]); // Removed isOnboardingCompleted dependency

  // Show loading screen while determining route
  return <LoadingScreen />;
}