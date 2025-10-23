import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '../core/auth/stores/auth-store';
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
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.replace('/(main)');
    } else {
      router.replace('/(auth)/welcome');
    }
  }, [isAuthenticated, isLoading, router]);

  return <LoadingScreen />;
}
