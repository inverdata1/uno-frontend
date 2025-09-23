import 'react-native-get-random-values'; // Must be first import for crypto polyfill
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import "../global.css";
import { queryClient } from '../shared/config/query-client';
import { useAuthState } from '../features/auth/hooks/use-auth-state';
import { useAuthStore } from '../shared/stores/auth-store';
import { useAppStore } from '../shared/stores/app-store';
import { Text } from '../shared/components/ui';

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
  useAuthState();

  return (
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
  );
}
