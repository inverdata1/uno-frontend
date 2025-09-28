import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, View } from 'react-native';
import 'react-native-get-random-values'; // Must be first import for crypto polyfill
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import "../global.css";
import { Text } from '../shared/components/ui';
import { queryClient } from '../shared/config/query-client';
import { useAuthStore } from '../auth/stores/auth-store';

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

  // Show loading screen while auth state is being determined
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Add debug logging
  console.log('🔍 AppNavigator - Auth state:', { isAuthenticated, authLoading });

  // Redirect based on auth state
  if (isAuthenticated) {
    console.log('🎯 User authenticated - showing main stack');
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(main)" />
      </Stack>
    );
  } else {
    console.log('🎯 User not authenticated - showing auth stack');
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
      </Stack>
    );
  }
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
