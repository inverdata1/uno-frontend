import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '../auth/stores/auth-store';
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
  console.log('🟢 INDEX SCREEN RENDERED - THIS SHOULD APPEAR!');
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [hasNavigated, setHasNavigated] = useState(false);

  // Track when this component mounts and unmounts
  useEffect(() => {
    console.log('🎬 INDEX SCREEN MOUNTED');
    return () => {
      console.log('💀 INDEX SCREEN UNMOUNTED');
    };
  }, []);

  useEffect(() => {
    console.log('🚀 Index useEffect triggered - hasNavigated:', hasNavigated);

    // Don't do anything if we already navigated
    if (hasNavigated) {
      console.log('🚫 Already navigated, NEVER routing again');
      return;
    }

    console.log('📊 Current state:', {
      authLoading,
      isAuthenticated
    });

    // Don't do anything if auth is still loading
    if (authLoading) {
      console.log('⏳ Still loading auth, waiting...');
      return;
    }

    console.log('✅ Making FIRST AND ONLY routing decision');

    // Make routing decision with EXPLICIT logging
    if (!isAuthenticated) {
      console.log('🔍 User not authenticated');
      console.log('🎯 ROUTING TO: welcome');
      router.replace('/(auth)/welcome');
    } else {
      console.log('🔍 User IS authenticated');
      console.log('🎯 ROUTING TO: main app');
      router.replace('/(main)');
    }

    // Mark as navigated to prevent future routing
    setHasNavigated(true);
    console.log('✅ Navigation completed - hasNavigated set to TRUE, NEVER routing again');

  }, [hasNavigated, authLoading, isAuthenticated, router]); // Dependencies for routing logic

  // Show loading screen while determining route
  return <LoadingScreen />;
}