import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserTypeSwitcherModal } from '../../../shared/components/layout/user-type-switcher/user-type-switcher-modal';
import { theme } from '../../../shared/config/theme';
import { useAppStore } from '../../../shared/stores/app-store';
import { getTabIcon } from '../../../shared/utils/tab-helpers';
import { Platform, useWindowDimensions, View } from 'react-native';
import { WebSidebar } from '../../../shared/components/layout/web-sidebar';
import { useState, useEffect } from 'react';

/**
 * Business Tabs Layout
 * Tabs: Dashboard, Create, Store, Profile
 */
export default function BusinessTabsLayout() {
  const insets = useSafeAreaInsets();
  const { userTypeSwitcherVisible, closeUserTypeSwitcher } = useAppStore();
  const { width } = useWindowDimensions();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  
  const isDesktopWeb = isMounted && Platform.OS === 'web' && width > 768;

  const businessRoutes = [
    { label: 'Dashboard', path: '/business', icon: 'stats-chart' },
    { label: 'Crear', path: '/business/social', icon: 'add-circle' },
    { label: 'Tienda', path: '/business/store', icon: 'storefront' },
    { label: 'Perfil', path: '/business/profile', icon: 'person' },
  ];

  return (
    <View style={{ flex: 1, flexDirection: isDesktopWeb ? 'row' : 'column' }}>
      {isDesktopWeb && <WebSidebar routes={businessRoutes} />}
      
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.colors.primary[500],
            tabBarInactiveTintColor: theme.colors.text.secondary,
            tabBarStyle: {
              paddingBottom: Math.max(insets.bottom, 5),
              paddingTop: 5,
              height: 60 + Math.max(insets.bottom - 5, 0),
              display: isDesktopWeb ? 'none' : 'flex'
            },
            lazy: true,
            unmountOnBlur: true,
          }}>

          {/* Dashboard Tab */}
          <Tabs.Screen
            name="index"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ focused }) => getTabIcon('stats-chart', focused),
            }}
          />

          {/* Create Post Tab */}
          <Tabs.Screen
            name="social"
            options={{
              title: 'Crear',
              tabBarIcon: ({ focused }) => getTabIcon('add-circle', focused),
            }}
          />

          {/* Store Tab */}
          <Tabs.Screen
            name="store"
            options={{
              title: 'Tienda',
              tabBarIcon: ({ focused }) => getTabIcon('storefront', focused),
            }}
          />

          {/* Profile Tab */}
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Perfil',
              tabBarIcon: ({ focused }) => getTabIcon('person', focused),
            }}
          />

        </Tabs>
      </View>

      {/* Global User Type Switcher Modal */}
      <UserTypeSwitcherModal
        visible={userTypeSwitcherVisible}
        onClose={closeUserTypeSwitcher}
        onUserTypeSwitch={closeUserTypeSwitcher}
      />
    </View>
  );
}
