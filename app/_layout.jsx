import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import "../global.css";
import { queryClient } from '../shared/config/query-client';
import { useAuthState } from '../features/auth/hooks/use-auth-state';

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
  anchor: '(tabs)',
};

export default function RootLayout() {
  // Initialize auth state on app start
  useAuthState();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />

        {/* DevTools only in development and web platform */}
        {__DEV__ && Platform.OS === 'web' && ReactQueryDevtools && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
