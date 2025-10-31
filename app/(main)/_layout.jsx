import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../shared/config/theme';
import { useCurrentUserType } from '../../shared/hooks/use-user-type';
import { getTabIcon } from '../../shared/utils/tab-helpers';
import { UserTypeSwitcherModal } from '../../shared/components/layout/user-type-switcher/user-type-switcher-modal';
import { useAppStore } from '../../shared/stores/app-store';

export default function TabLayout() {
  const { currentUserType, isLoading } = useCurrentUserType();
  const insets = useSafeAreaInsets();
  const { userTypeSwitcherVisible, closeUserTypeSwitcher } = useAppStore();

  // Debug modal visibility
  React.useEffect(() => {
    console.log('🔍 TabLayout - userTypeSwitcherVisible:', userTypeSwitcherVisible);
  }, [userTypeSwitcherVisible]);

  // Debug current user type
  React.useEffect(() => {
    console.log('🔍 TabLayout - currentUserType:', currentUserType, 'isLoading:', isLoading);
    console.log('🔍 TabLayout - Will show loading?', isLoading || !currentUserType);
  }, [currentUserType, isLoading]);

  // Show loading state while determining user type
  if (isLoading || !currentUserType) {
    console.log('⏳ TabLayout - Showing loading state');
    return (
      <Tabs screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' } // Hide tab bar while loading
      }}>
        <Tabs.Screen name="index" options={{ title: 'Loading...' }} />
      </Tabs>
    );
  }

  console.log('✅ TabLayout - Rendering full tabs for userType:', currentUserType);

  return (
    <>
      <Tabs
        key={currentUserType}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary[500],
          tabBarInactiveTintColor: theme.colors.text.secondary,
          tabBarStyle: {
            paddingBottom: Math.max(insets.bottom, 5),
            paddingTop: 5,
            height: 60 + Math.max(insets.bottom - 5, 0)
          },
          lazy: true,
          unmountOnBlur: true,
        }}>

      {/* Index/Home - Always present, label changes by mode */}
      <Tabs.Screen
        name="index"
        options={{
          title: currentUserType === 'business' ? 'Dashboard' : currentUserType === 'driver' ? 'Entregas' : 'Inicio',
          tabBarIcon: ({ focused }) => getTabIcon(
            currentUserType === 'business' ? 'stats-chart' : currentUserType === 'driver' ? 'list' : 'home',
            focused
          ),
        }}
      />

      {/* Social - Shows for business (Crear), hidden for others */}
      <Tabs.Screen
        name="social"
        options={currentUserType === 'business' ? {
          title: 'Crear',
          tabBarIcon: ({ focused }) => getTabIcon('add-circle', focused),
        } : { href: null }}
      />

      {/* Feed - Shows for client only (social feed), hidden for business and driver */}
      <Tabs.Screen
        name="feed"
        options={currentUserType === 'client' ? {
          title: 'Feed',
          tabBarIcon: ({ focused }) => getTabIcon('apps', focused),
        } : { href: null }}
      />

      {/* Client folder - Shows for client (Pedidos) and driver (Historial), hidden for business */}
      <Tabs.Screen
        name="client"
        options={currentUserType === 'business' ? { href: null } : {
          title: currentUserType === 'driver' ? 'Historial' : 'Pedidos',
          tabBarIcon: ({ focused }) => getTabIcon(
            currentUserType === 'driver' ? 'checkmark-done' : 'receipt',
            focused
          ),
        }}
      />

      {/* Business folder - Shows for business (Pedidos and Productos in sub-navigation), hidden for others */}
      <Tabs.Screen
        name="business"
        options={currentUserType === 'business' ? {
          title: 'Tienda',
          tabBarIcon: ({ focused }) => getTabIcon('storefront', focused),
        } : { href: null }}
      />

      {/* Delivery folder - Shows for driver only (Activas), hidden for others */}
      <Tabs.Screen
        name="delivery"
        options={currentUserType === 'driver' ? {
          title: 'Activas',
          tabBarIcon: ({ focused }) => getTabIcon('navigate-circle', focused),
        } : { href: null }}
      />

      {/* Profile - Always visible for all modes */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => getTabIcon('person', focused),
        }}
      />

      </Tabs>

      {/* Global User Type Switcher Modal */}
      <UserTypeSwitcherModal
        visible={userTypeSwitcherVisible}
        onClose={closeUserTypeSwitcher}
        onUserTypeSwitch={closeUserTypeSwitcher}
      />
    </>
  );
}
