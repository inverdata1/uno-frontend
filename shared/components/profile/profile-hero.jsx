import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui';

/**
 * Profile hero section with avatar and user type badge
 *
 * @param {Object} props
 * @param {Object} props.user - User object with firstName, lastName, email
 * @param {Object} props.userTypeInfo - User type configuration
 * @param {Array} props.availableUserTypes - Array of available user types
 * @param {Function} [props.onUserTypeBadgePress] - Callback when badge is pressed
 */
export const ProfileHero = ({
  user,
  userTypeInfo,
  availableUserTypes = [],
  onUserTypeBadgePress
}) => {
  const canSwitchUserType = availableUserTypes.length > 1;

  return (
    <View style={{
      background: `linear-gradient(135deg, ${userTypeInfo.gradient[0]} 0%, ${userTypeInfo.gradient[1]} 100%)`,
      backgroundColor: userTypeInfo.primary,
      paddingTop: 32,
      paddingBottom: 40,
      paddingHorizontal: 24,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      shadowColor: userTypeInfo.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12
    }}>
      <View style={{ alignItems: 'center' }}>
        {/* Profile Picture with Status Ring */}
        <View style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          borderWidth: 4,
          borderColor: 'rgba(255, 255, 255, 0.3)'
        }}>
          <Text style={{
            color: '#ffffff',
            fontSize: 36,
            fontWeight: '700'
          }}>
            {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>

        <Text style={{
          color: '#ffffff',
          fontSize: 28,
          fontWeight: '700',
          marginBottom: 8,
          textAlign: 'center'
        }}>
          {user?.firstName} {user?.lastName}
        </Text>

        <Text style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 16,
          marginBottom: 16,
          textAlign: 'center'
        }}>
          {user?.email}
        </Text>

        {/* Active User Type Badge - Conditional Pressable */}
        {canSwitchUserType ? (
          <TouchableOpacity
            onPress={onUserTypeBadgePress}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 1)',
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 3
            }}
            activeOpacity={0.8}
          >
            <Ionicons name={userTypeInfo.icon} size={16} color={userTypeInfo.primary} style={{ marginRight: 8 }} />
            <Text style={{
              color: userTypeInfo.primary,
              fontSize: 14,
              fontWeight: '600',
              marginRight: 8
            }}>
              {userTypeInfo.title}
            </Text>
            <Ionicons name="chevron-down" size={14} color={userTypeInfo.primary} opacity={0.7} />
          </TouchableOpacity>
        ) : (
          /* Static user type badge when only one type */
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 1)',
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 3
          }}>
            <Ionicons name={userTypeInfo.icon} size={16} color={userTypeInfo.primary} style={{ marginRight: 8 }} />
            <Text style={{
              color: userTypeInfo.primary,
              fontSize: 14,
              fontWeight: '600'
            }}>
              {userTypeInfo.title}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
