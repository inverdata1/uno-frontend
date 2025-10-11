import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '../../../../shared/utils/cn';

/**
 * CategoryCard Component
 * Displays category with icon and gradient background
 *
 * @param {object} category - Category data from API
 * @param {function} onPress - Callback when category is pressed
 * @param {string} variant - 'grid' | 'horizontal' (default: grid)
 */
export const CategoryCard = ({
  category,
  onPress,
  variant = 'grid',
  className
}) => {
  const { name, icon, color, description } = category;

  // Generate gradient colors from base color
  const getGradientColors = (baseColor) => {
    // Simple gradient: lighter to darker
    return [lightenColor(baseColor, 20), baseColor];
  };

  if (variant === 'horizontal') {
    return (
      <Pressable
        onPress={onPress}
        className={cn('mr-3', className)}
      >
        <LinearGradient
          colors={getGradientColors(color)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-24 h-24 rounded-2xl items-center justify-center"
        >
          <View className="bg-white/20 rounded-full p-3 mb-2">
            <Ionicons name={icon} size={28} color="white" />
          </View>
        </LinearGradient>
        <Text className="text-xs font-medium text-center mt-2" numberOfLines={1}>
          {name}
        </Text>
      </Pressable>
    );
  }

  // Grid variant
  return (
    <Pressable
      onPress={onPress}
      className={cn('mb-4', className)}
      style={{ width: '48%' }}
    >
      <LinearGradient
        colors={getGradientColors(color)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-4 aspect-square items-center justify-center"
      >
        <View className="bg-white/20 rounded-full p-4 mb-3">
          <Ionicons name={icon} size={36} color="white" />
        </View>
        <Text className="text-white font-bold text-base text-center">
          {name}
        </Text>
      </LinearGradient>
    </Pressable>
  );
};

/**
 * CategoryChip Component
 * Small pill-shaped category selector
 */
export const CategoryChip = ({
  category,
  onPress,
  selected = false,
  className
}) => {
  const { name, icon, color } = category;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center px-4 py-2 rounded-full mr-2',
        selected
          ? 'border-2'
          : 'bg-gray-100 border-2 border-transparent',
        className
      )}
      style={selected ? { borderColor: color, backgroundColor: `${color}15` } : {}}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={selected ? color : '#6B7280'}
          style={{ marginRight: 6 }}
        />
      )}
      <Text
        className={cn(
          'font-medium text-sm',
          selected ? 'font-semibold' : 'text-gray-700'
        )}
        style={selected ? { color } : {}}
      >
        {name}
      </Text>
    </Pressable>
  );
};

// Helper function to lighten color
function lightenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;

  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}
