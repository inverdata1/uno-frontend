import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';
import 'react-native-get-random-values'; // Must be first import for crypto polyfill
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import "../global.css";
import { queryClient } from '../shared/config/query-client';
import { useAuthStore } from '../core/auth/stores/auth-store';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

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

function AppNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuthStore();

  // Handle auth state changes and redirect appropriately
  React.useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not in auth screens, redirect to welcome
      console.log('🚪 User logged out, redirecting to welcome');
      router.replace('/(auth)/welcome');
    }
  }, [isAuthenticated, segments, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="client" />
      <Stack.Screen name="business" />
      <Stack.Screen name="driver" />
    </Stack>
  );
}

export default function RootLayout() {
  // Initialize auth state on app start
  const { initializeAuth, isLoading: authLoading } = useAuthStore();

  React.useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe && unsubscribe();
  }, [initializeAuth]);

  // Hide splash screen when auth initialization is complete
  React.useEffect(() => {
    if (!authLoading) {
      SplashScreen.hideAsync();
    }
  }, [authLoading]);


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={DefaultTheme}>
            <BottomSheetModalProvider>
              <AppNavigator />
              <StatusBar style="auto" />

              {/* DevTools only in development and web platform */}
              {__DEV__ && Platform.OS === 'web' && ReactQueryDevtools && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
            </BottomSheetModalProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
