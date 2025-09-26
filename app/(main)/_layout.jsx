import { Tabs } from 'expo-router';
import { useCurrentMode } from '../../features/auth/shared/hooks/use-user-modes';

export default function TabLayout() {
  const { currentMode, isLoading } = useCurrentMode();

  // Show loading state while determining mode
  if (isLoading) {
    return (
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
      </Tabs>
    );
  }

  // Define tab icons
  const getTabIcon = (name) => {
    const icons = {
      // Common
      index: '🏠',
      // Client mode
      'client/restaurants': '🛍️',
      'client/orders': '📦',
      // Business mode
      'business/dashboard': '📊',
      'business/products': '🍽️',
      // Delivery mode
      'delivery/dashboard': '🚗'
    };
    return icons[name] || '📱';
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60
        }
      }}>

      {/* Home tab - always visible */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: () => getTabIcon('index'),
        }}
      />

      {/* Client mode tabs */}
      {currentMode === 'client' && (
        <>
          <Tabs.Screen
            name="client/restaurants"
            options={{
              title: 'Productos',
              tabBarIcon: () => getTabIcon('client/restaurants'),
            }}
          />
          <Tabs.Screen
            name="client/orders"
            options={{
              title: 'Pedidos',
              tabBarIcon: () => getTabIcon('client/orders'),
            }}
          />
        </>
      )}

      {/* Business mode tabs */}
      {currentMode === 'business' && (
        <>
          <Tabs.Screen
            name="business/dashboard"
            options={{
              title: 'Dashboard',
              tabBarIcon: () => getTabIcon('business/dashboard'),
            }}
          />
          <Tabs.Screen
            name="business/products"
            options={{
              title: 'Productos',
              tabBarIcon: () => getTabIcon('business/products'),
            }}
          />
        </>
      )}

      {/* Delivery mode tabs */}
      {currentMode === 'delivery' && (
        <>
          <Tabs.Screen
            name="delivery/dashboard"
            options={{
              title: 'Entregas',
              tabBarIcon: () => getTabIcon('delivery/dashboard'),
            }}
          />
        </>
      )}

      {/* Hide unused tabs */}
      {currentMode !== 'client' && (
        <>
          <Tabs.Screen
            name="client/restaurants"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="client/orders"
            options={{ href: null }}
          />
        </>
      )}

      {currentMode !== 'business' && (
        <>
          <Tabs.Screen
            name="business/dashboard"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="business/products"
            options={{ href: null }}
          />
        </>
      )}

      {currentMode !== 'delivery' && (
        <>
          <Tabs.Screen
            name="delivery/dashboard"
            options={{ href: null }}
          />
        </>
      )}

    </Tabs>
  );
}
