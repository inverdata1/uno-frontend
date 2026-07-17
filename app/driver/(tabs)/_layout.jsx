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
 * Driver Tabs Layout
 * Tabs: Active Deliveries, History, Profile
 */
export default function DriverTabsLayout() {
  const insets = useSafeAreaInsets();
  const { userTypeSwitcherVisible, closeUserTypeSwitcher } = useAppStore();
  const { width } = useWindowDimensions();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  
  const isDesktopWeb = isMounted && Platform.OS === 'web' && width > 768;

  const driverRoutes = [
    { label: 'Entregas', path: '/driver', icon: 'navigate-circle' },
    { label: 'Historial', path: '/driver/history', icon: 'checkmark-done' },
    { label: 'Perfil', path: '/driver/profile', icon: 'person' },
  ];

  return (
    <View style={{ flex: 1, flexDirection: isDesktopWeb ? 'row' : 'column' }}>
      {isDesktopWeb && <WebSidebar routes={driverRoutes} />}
      
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

          {/* Active Deliveries Tab */}
          <Tabs.Screen
            name="index"
            options={{
              title: 'Entregas',
              tabBarIcon: ({ focused }) => getTabIcon('navigate-circle', focused),
            }}
          />

          {/* History Tab */}
          <Tabs.Screen
            name="history"
            options={{
              title: 'Historial',
              tabBarIcon: ({ focused }) => getTabIcon('checkmark-done', focused),
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
