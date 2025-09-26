import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, View } from 'react-native';
import 'react-native-get-random-values'; // Must be first import for crypto polyfill
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "../global.css";
import { Text } from '../shared/components/ui';
import { queryClient } from '../shared/config/query-client';
import { useAppStore } from '../shared/stores/app-store';
import { useAuthStore } from '../auth/stores/auth-store';

// Conditionally import ReactQuery DevTools only for web
let ReactQueryDevtools = null;
if (__DEV__ && Platform.OS === 'web') {
  try {
    ReactQueryDevtools = require('@tanstack/react-query-devtools').ReactQueryDevtools;
  } catch (e) {
    console.log('ReactQuery DevTools not available for this platform');
  }
}

export const unstable_settings = {
  initialRouteName: 'index',
};

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

function AppNavigator() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { isOnboardingCompleted } = useAppStore();

  // Show loading screen while auth state is being determined
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Add debug logging
  console.log('Auth state:', { isAuthenticated, authLoading, isOnboardingCompleted });

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  // Initialize auth state on app start
  const { initializeAuth } = useAuthStore();
  React.useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe && unsubscribe();
  }, [initializeAuth]);

  // One-time migration: Clear persisted onboarding state if needed
  const { setOnboardingCompleted } = useAppStore();
  React.useEffect(() => {
    const resetOnboardingIfNeeded = async () => {
      try {
        const persistedState = await AsyncStorage.getItem('uno-delivery-app-storage');
        if (persistedState) {
          const parsed = JSON.parse(persistedState);
          // If persisted state has isOnboardingCompleted as false, clear it to use code default (true)
          if (parsed.state?.isOnboardingCompleted === false) {
            console.log('🔧 Clearing old onboarding state from AsyncStorage');
            await AsyncStorage.removeItem('uno-delivery-app-storage');
            // Force reload the store to use code defaults
            setOnboardingCompleted(true);
          }
        }
      } catch (error) {
        console.error('Error checking onboarding migration:', error);
      }
    };
    resetOnboardingIfNeeded();
  }, [setOnboardingCompleted]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={DefaultTheme}>
            <AppNavigator />
            <StatusBar style="auto" />

            {/* DevTools only in development and web platform */}
            {__DEV__ && Platform.OS === 'web' && ReactQueryDevtools && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
