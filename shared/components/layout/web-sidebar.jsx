import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { theme } from '../../config/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useState, useRef } from 'react';

export const WebSidebar = ({ routes }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const widthAnim = useRef(new Animated.Value(250)).current;

  const toggleSidebar = () => {
    const toValue = isCollapsed ? 250 : 80;
    Animated.timing(widthAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Animated.View style={[styles.sidebarContainer, { width: widthAnim }]}>
      {/* Brand / Logo Area */}
      <View style={[styles.brandContainer, isCollapsed && styles.brandContainerCollapsed]}>
        <Text style={styles.brandText}>{isCollapsed ? 'U' : 'UNO'}</Text>
      </View>

      {/* Navigation Links */}
      <View style={styles.navContainer}>
        {routes.map((route) => {
          // Exact match or active sub-route match
          const isFocused = pathname === route.path || (route.path !== '/' && pathname.startsWith(route.path + '/'));

          const onPress = () => {
            router.push(route.path);
          };

          return (
            <TouchableOpacity
              key={route.path}
              onPress={onPress}
              style={[
                styles.navItem,
                isFocused && styles.navItemFocused,
                isCollapsed && styles.navItemCollapsed
              ]}
              title={isCollapsed ? route.label : ''} // Tooltip for collapsed state
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={route.icon} 
                  size={24} 
                  color={isFocused ? theme.colors.primary[500] : theme.colors.text.secondary} 
                />
              </View>
              {!isCollapsed && (
                <Text style={[
                  styles.navLabel,
                  isFocused && styles.navLabelFocused
                ]} numberOfLines={1}>
                  {route.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Toggle Button */}
      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={toggleSidebar}
      >
        <Ionicons 
          name={isCollapsed ? "chevron-forward" : "chevron-back"} 
          size={20} 
          color={theme.colors.text.secondary} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    backgroundColor: theme.colors.bg.primary,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border.light,
    height: '100%',
    paddingTop: 20,
    paddingHorizontal: 16,
    position: 'relative', // Para el botón toggle absoluto
  },
  brandContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    alignItems: 'flex-start',
  },
  brandContainerCollapsed: {
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.primary[500],
    letterSpacing: 1,
  },
  navContainer: {
    flex: 1,
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden', // Evitar que el texto se salga al animar
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  navItemFocused: {
    backgroundColor: theme.colors.primary[50],
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginLeft: 16, // Margen movido aquí en vez del iconContainer para animación suave
  },
  navLabelFocused: {
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  toggleButton: {
    position: 'absolute',
    right: -14,
    top: '50%',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.bg.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
});
