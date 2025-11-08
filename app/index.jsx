import { useEffect } from 'react';
import { useRouter } from 'expo-router';
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
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { currentUserType, isLoading: userTypeLoading } = useCurrentUserType();

  useEffect(() => {
    console.log('📍 Index screen - Auth state:', { isAuthenticated, authLoading, currentUserType, userTypeLoading });

    // Wait for auth to load first
    if (authLoading) {
      console.log('⏳ Waiting for auth to load...');
      return;
    }

    // If not authenticated, redirect to welcome immediately
    if (!isAuthenticated) {
      console.log('🚪 Not authenticated, redirecting to welcome');
      router.replace('/(auth)/welcome');
      return;
    }

    // If authenticated, wait for user type to load
    if (userTypeLoading) {
      console.log('⏳ Waiting for user type to load...');
      return;
    }

    // Redirect to user type specific section
    if (currentUserType) {
      console.log(`🚀 Redirecting to ${currentUserType}/(tabs)`);
      router.replace(`/${currentUserType}/(tabs)`);
    }
  }, [isAuthenticated, authLoading, currentUserType, userTypeLoading, router]);

  return <LoadingScreen />;
}
