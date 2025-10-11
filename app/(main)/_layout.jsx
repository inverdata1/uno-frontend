import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCurrentMode } from '../../shared/hooks/use-user-modes';
import { theme } from '../../shared/config/theme';
// Tab config removed - using inline configuration

export default function TabLayout() {
  const { currentMode, isLoading } = useCurrentMode();
  const insets = useSafeAreaInsets();

  // Show loading state while determining mode
  if (isLoading) {
    return (
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
      </Tabs>
    );
  }

  // Tabs are configured inline below based on currentMode

  // Define tab icons with fallbacks
  const getTabIcon = (iconName, focused = false) => {
    const finalIconName = focused ? iconName : `${iconName}-outline`;
    return (
      <Ionicons
        name={finalIconName}
        size={24}
        color={focused ? theme.colors.primary[500] : theme.colors.text.secondary}
      />
    );
  };

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
        options={(currentMode === 'client' || currentMode === 'business') ? {
          title: 'Feed',
          tabBarIcon: ({ focused }) => getTabIcon('apps', focused),
        } : { href: null }}
      />

      {/* Categories - Visible for client and business */}
      <Tabs.Screen
        name="categories"
        options={(currentMode === 'client' || currentMode === 'business') ? {
          title: 'Categorías',
          tabBarIcon: ({ focused }) => getTabIcon('grid', focused),
        } : { href: null }}
      />

      {/* Client mode tabs */}
      <Tabs.Screen
        name="client/stores"
        options={currentMode === 'client' ? {
          title: 'Tiendas',
          tabBarIcon: ({ focused }) => getTabIcon('storefront', focused),
        } : { href: null }}
      />
      <Tabs.Screen
        name="client/orders"
        options={currentMode === 'client' ? {
          title: 'Pedidos',
          tabBarIcon: ({ focused }) => getTabIcon('receipt', focused),
        } : { href: null }}
      />

      {/* Business mode tabs */}
      <Tabs.Screen
        name="business/dashboard"
        options={currentMode === 'business' ? {
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => getTabIcon('analytics', focused),
        } : { href: null }}
      />
      <Tabs.Screen
        name="business/products"
        options={currentMode === 'business' ? {
          title: 'Productos',
          tabBarIcon: ({ focused }) => getTabIcon('storefront', focused),
        } : { href: null }}
      />

      {/* Delivery mode tabs */}
      <Tabs.Screen
        name="delivery/dashboard"
        options={currentMode === 'delivery' ? {
          title: 'Entregas',
          tabBarIcon: ({ focused }) => getTabIcon('bicycle', focused),
        } : { href: null }}
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
