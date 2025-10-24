import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../shared/config/theme';
import { useCurrentUserType } from '../../shared/hooks/use-user-type';
import { getTabIcon } from '../../shared/utils/tab-helpers';

export default function TabLayout() {
  const { currentUserType, isLoading } = useCurrentUserType();
  const insets = useSafeAreaInsets();

  // Show loading state while determining user type
  if (isLoading) {
    return (
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          paddingBottom: Math.max(insets.bottom, 5),
          paddingTop: 5,
          height: 60 + Math.max(insets.bottom - 5, 0)
        }
      }}>

      {/* Render all possible tabs, showing only current mode's tabs */}

      {/* Common tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => getTabIcon('home', focused),
        }}
      />

      {/* Feed - Visible for client and business */}
      <Tabs.Screen
        name="feed"
        options={(currentUserType === 'client' || currentUserType === 'business') ? {
          title: 'Feed',
          tabBarIcon: ({ focused }) => getTabIcon('apps', focused),
        } : { href: null }}
      />


      {/* Hide nested layout folders from tabs - their routes are managed by their own layouts */}
      <Tabs.Screen
        name="client"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="business"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="delivery"
        options={{ href: null }}
      />

      {/* Profile tab - always visible */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => getTabIcon('person', focused),
        }}
      />

    </Tabs>
  );
}
