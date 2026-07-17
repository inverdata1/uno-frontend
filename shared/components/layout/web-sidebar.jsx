import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../config/theme';
import { Ionicons } from '@expo/vector-icons';

export const WebSidebar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.sidebarContainer}>
      {/* Brand / Logo Area */}
      <View style={styles.brandContainer}>
        <Text style={styles.brandText}>UNO</Text>
      </View>

      {/* Navigation Links */}
      <View style={styles.navContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={[
                styles.navItem,
                isFocused && styles.navItemFocused
              ]}
            >
              <View style={styles.iconContainer}>
                {options.tabBarIcon ? (
                  options.tabBarIcon({ focused: isFocused, color: isFocused ? theme.colors.primary[500] : theme.colors.text.secondary, size: 24 })
                ) : (
                  <Ionicons name="ellipse" size={24} color={isFocused ? theme.colors.primary[500] : theme.colors.text.secondary} />
                )}
              </View>
              <Text style={[
                styles.navLabel,
                isFocused && styles.navLabelFocused
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    width: 250,
    backgroundColor: theme.colors.bg.primary,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border.light,
    height: '100%',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  brandContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
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
  },
  navItemFocused: {
    backgroundColor: theme.colors.primary[50],
  },
  iconContainer: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  navLabelFocused: {
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
});
