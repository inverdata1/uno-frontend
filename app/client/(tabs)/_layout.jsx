import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserTypeSwitcherModal } from '../../../shared/components/layout/user-type-switcher/user-type-switcher-modal';
import { theme } from '../../../shared/config/theme';
import { useAppStore } from '../../../shared/stores/app-store';
import { getTabIcon } from '../../../shared/utils/tab-helpers';

/**
 * Client Tabs Layout
 * Tabs: Home, Feed, Orders, Profile
 */
export default function ClientTabsLayout() {
  const insets = useSafeAreaInsets();
  const { userTypeSwitcherVisible, closeUserTypeSwitcher } = useAppStore();

  return (
    <>
      <Tabs
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

        {/* Home Tab */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ focused }) => getTabIcon('home', focused),
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

        {/* Orders Tab */}
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Pedidos',
            tabBarIcon: ({ focused }) => getTabIcon('receipt', focused),
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

      {/* Global User Type Switcher Modal */}
      <UserTypeSwitcherModal
        visible={userTypeSwitcherVisible}
        onClose={closeUserTypeSwitcher}
        onUserTypeSwitch={closeUserTypeSwitcher}
      />
    </>
  );
}
