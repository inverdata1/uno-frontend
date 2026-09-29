import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../../../shared/components/ui/text';

/**
 * StoryRing Component
 * Beautiful circular story avatar with adequate spacing and gradient ring
 */
export const StoryRing = ({
  imageUrl,
  name = 'Negocio',
  hasUnseenStories = false,
  onPress,
  size = 60,
}) => {
  const ringSize = size + 8;

  return (
    <View style={{ alignItems: 'center', width: 72, marginHorizontal: 4 }}>
      <Pressable onPress={onPress} activeOpacity={0.8} style={{ alignItems: 'center' }}>
        {hasUnseenStories ? (
          // Active unviewed story - Gradient ring (UNO Red & Orange)
          <LinearGradient
            colors={['#ef4444', '#f97316', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              padding: 2.5,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View style={{
              backgroundColor: '#ffffff',
              borderRadius: (ringSize - 5) / 2,
              padding: 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: '#e2e8f0',
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: '#ef4444',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 18 }}>
                    {name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        ) : (
          // Viewed story or following account - Clean subtle border
          <View style={{
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: 1.5,
            borderColor: '#cbd5e1',
            padding: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: '#e2e8f0',
                }}
                resizeMode="cover"
              />
            ) : (
              <View style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: '#cbd5e1',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 18 }}>
                  {name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        )}
      </Pressable>

      {/* Business Name Label */}
      <Text
        style={{
          fontSize: 11,
          color: '#334155',
          marginTop: 6,
          textAlign: 'center',
          width: 70,
        }}
        numberOfLines={1}
      >
        {name}
      </Text>
    </View>
  );
};

/**
 * AddStoryButton Component
 */
export const AddStoryButton = ({ onPress, size = 60 }) => {
  const ringSize = size + 8;

  return (
    <View style={{ alignItems: 'center', width: 72, marginHorizontal: 4 }}>
      <Pressable onPress={onPress} activeOpacity={0.8} style={{ alignItems: 'center' }}>
        <View style={{
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderWidth: 2,
          borderStyle: 'dashed',
          borderColor: '#94a3b8',
          backgroundColor: '#f8fafc',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: '#ef4444',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 18, marginTop: -2 }}>
              +
            </Text>
          </View>
        </View>
      </Pressable>
      <Text
        style={{
          fontSize: 11,
          color: '#64748b',
          marginTop: 6,
          textAlign: 'center',
          width: 70,
        }}
        numberOfLines={1}
      >
        Tu historia
      </Text>
    </View>
  );
};
