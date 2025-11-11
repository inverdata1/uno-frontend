import { Stack } from 'expo-router';

/**
 * Client Section Root Layout
 * Wraps the tabs layout
 */
export default function ClientLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
