import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCurrentMode } from '../../features/auth/shared/hooks/use-user-modes';
import { theme } from '../../shared/config/theme';

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

  // Define tab icons
  const getTabIcon = (name, focused = false) => {
    const iconMap = {
      // Common
      index: focused ? 'home' : 'home-outline',
      profile: focused ? 'person' : 'person-outline',
      // Client mode
      'client/restaurants': focused ? 'basket' : 'basket-outline',
      'client/orders': focused ? 'receipt' : 'receipt-outline',
      // Business mode
      'business/dashboard': focused ? 'analytics' : 'analytics-outline',
      'business/products': focused ? 'storefront' : 'storefront-outline',
      // Delivery mode
      'delivery/dashboard': focused ? 'bicycle' : 'bicycle-outline'
    };

    const iconName = iconMap[name] || (focused ? 'apps' : 'apps-outline');
    return <Ionicons name={iconName} size={24} color={focused ? theme.colors.primary[500] : theme.colors.text.secondary} />;
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

      {/* Home tab - always visible */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => getTabIcon('index', focused),
        }}
      />

      {/* Client mode tabs */}
      <Tabs.Screen
        name="client/restaurants"
        options={currentMode === 'client' ? {
          title: 'Productos',
          tabBarIcon: ({ focused }) => getTabIcon('client/restaurants', focused),
        } : { href: null }}
      />
      <Tabs.Screen
        name="client/orders"
        options={currentMode === 'client' ? {
          title: 'Pedidos',
          tabBarIcon: ({ focused }) => getTabIcon('client/orders', focused),
        } : { href: null }}
      />

      {/* Business mode tabs */}
      <Tabs.Screen
        name="business/dashboard"
        options={currentMode === 'business' ? {
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => getTabIcon('business/dashboard', focused),
        } : { href: null }}
      />
      <Tabs.Screen
        name="business/products"
        options={currentMode === 'business' ? {
          title: 'Productos',
          tabBarIcon: ({ focused }) => getTabIcon('business/products', focused),
        } : { href: null }}
      />

      {/* Delivery mode tabs */}
      <Tabs.Screen
        name="delivery/dashboard"
        options={currentMode === 'delivery' ? {
          title: 'Entregas',
          tabBarIcon: ({ focused }) => getTabIcon('delivery/dashboard', focused),
        } : { href: null }}
      />

      {/* Profile tab - always visible */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => getTabIcon('profile', focused),
        }}
      />

    </Tabs>
  );
}
