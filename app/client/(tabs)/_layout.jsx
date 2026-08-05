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
 * Client Tabs Layout
 * Tabs: Home, Feed, Orders, Profile
 */
export default function ClientTabsLayout() {
  const insets = useSafeAreaInsets();
  const { userTypeSwitcherVisible, closeUserTypeSwitcher } = useAppStore();
  const { width } = useWindowDimensions();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  
  const isDesktopWeb = isMounted && Platform.OS === 'web' && width > 768;

  const clientRoutes = [
    { label: 'Descubre', path: '/client', icon: 'compass' },
    { label: 'Feed', path: '/client/feed', icon: 'apps' },
    { label: 'Perfil', path: '/client/profile', icon: 'person' },
  ];

  return (
    <View style={{ flex: 1, flexDirection: isDesktopWeb ? 'row' : 'column' }}>
      {isDesktopWeb && <WebSidebar routes={clientRoutes} />}
      
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

          {/* Discover Tab */}
          <Tabs.Screen
            name="index"
            options={{
              title: 'Descubre',
              tabBarIcon: ({ focused }) => getTabIcon('compass', focused),
            }}
          />

          {/* Feed Tab */}
          <Tabs.Screen
            name="feed"
            options={{
              title: 'Feed',
              tabBarIcon: ({ focused }) => getTabIcon('apps', focused),
            }}
          />

          {/* Orders Screen (Accessible from Profile, hidden from bottom tab bar) */}
          <Tabs.Screen
            name="orders"
            options={{
              href: null,
              headerShown: false,
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
