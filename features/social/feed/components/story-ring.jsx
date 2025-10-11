import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../../shared/components/ui/text';
import { cn } from '../../../../shared/utils/cn';

/**
 * StoryRing Component
 * Instagram-style story avatar with gradient ring
 *
 * @param {object} business - Business data
 * @param {boolean} hasUnviewed - Whether there are unviewed stories
 * @param {function} onPress - Callback when story is pressed
 * @param {string} size - 'sm' | 'md' | 'lg' (default: md)
 */
export const StoryRing = ({
  business,
  hasUnviewed = false,
  onPress,
  size = 'md',
  className
}) => {
  const sizes = {
    sm: {
      container: 'w-14 h-14',
      image: 'w-12 h-12',
      text: 'text-xs',
      gradient: 58,
      imageSize: 48
    },
    md: {
      container: 'w-20 h-20',
      image: 'w-[72px] h-[72px]',
      text: 'text-xs',
      gradient: 82,
      imageSize: 72
    },
    lg: {
      container: 'w-24 h-24',
      image: 'w-[88px] h-[88px]',
      text: 'text-sm',
      gradient: 98,
      imageSize: 88
    }
  };

  const config = sizes[size];

  return (
    <View className={cn('items-center mr-3', className)}>
      <Pressable onPress={onPress}>
        {hasUnviewed ? (
          // Story ring with gradient
          <LinearGradient
            colors={['#F58529', '#DD2A7B', '#8134AF', '#515BD4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className={cn('rounded-full p-0.5', config.container)}
          >
            <View className="bg-white rounded-full p-0.5">
              <Image
                source={{ uri: business?.logo }}
                className={cn('rounded-full bg-gray-200', config.image)}
                style={{ width: config.imageSize, height: config.imageSize }}
              />
            </View>
          </LinearGradient>
        ) : (
          // Viewed story - gray ring
          <View className={cn('rounded-full p-0.5 border-2 border-gray-300', config.container)}>
            <Image
              source={{ uri: business?.logo }}
              className={cn('rounded-full bg-gray-200', config.image)}
              style={{ width: config.imageSize - 4, height: config.imageSize - 4 }}
            />
          </View>
        )}
      </Pressable>

      {/* Business Name */}
      <Text
        className={cn('mt-1 text-center', config.text)}
        numberOfLines={1}
        style={{ maxWidth: config.imageSize + 10 }}
      >
        {business?.name}
      </Text>
    </View>
  );
};

/**
 * AddStoryButton Component
 * Plus button for creating a new story
 */
export const AddStoryButton = ({ onPress, businessName, size = 'md' }) => {
  const sizes = {
    sm: { container: 'w-14 h-14', icon: 20 },
    md: { container: 'w-20 h-20', icon: 24 },
    lg: { container: 'w-24 h-24', icon: 28 }
  };

  const config = sizes[size];

  return (
    <View className="items-center mr-3">
      <Pressable onPress={onPress}>
        <View className={cn('bg-gray-100 rounded-full items-center justify-center border-2 border-dashed border-gray-300', config.container)}>
          <View className="bg-blue-500 rounded-full p-1">
            <Text className="text-white font-bold" style={{ fontSize: config.icon }}>
              +
            </Text>
          </View>
        </View>
      </Pressable>
      <Text className="text-xs mt-1 text-center" numberOfLines={1}>
        Tu historia
      </Text>
    </View>
  );
};
