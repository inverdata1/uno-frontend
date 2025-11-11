import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

/**
 * Get tab icon component with automatic outline/filled switching
 *
 * @param {string} iconName - Base Ionicons icon name (without -outline suffix)
 * @param {boolean} focused - Whether tab is focused
 * @returns {JSX.Element} Icon component
 */
export const getTabIcon = (iconName, focused = false) => {
  const finalIconName = focused ? iconName : `${iconName}-outline`;

  return (
    <Ionicons
      name={finalIconName}
      size={24}
      color={focused ? theme.colors.primary[500] : theme.colors.text.secondary}
    />
  );
};
