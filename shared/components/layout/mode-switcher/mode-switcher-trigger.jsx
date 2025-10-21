import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../ui/text';
import { useCurrentUserType } from '../../../hooks/use-user-type';

export const ModeSwitcherTrigger = ({ onPress, style }) => {
  const { currentUserType, isLoading } = useCurrentUserType();

  const getModeConfig = () => {
    const configs = {
      client: {
        title: 'Cliente',
        icon: 'basket',
        color: '#ef4444'
      },
      business: {
        title: 'Negocio',
        icon: 'briefcase',
        color: '#10b981'
      },
      delivery: {
        title: 'Delivery',
        icon: 'bicycle',
        color: '#f59e0b'
      }
    };
    return configs[currentUserType] || configs.client;
  };

  const config = getModeConfig();

  if (isLoading) {
    return (
      <View style={[{
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center'
      }, style]}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: '#e5e7eb',
          marginRight: 12
        }} />
        <View style={{ flex: 1 }}>
          <View style={{
            width: 80,
            height: 16,
            backgroundColor: '#e5e7eb',
            borderRadius: 8,
            marginBottom: 4
          }} />
          <View style={{
            width: 120,
            height: 12,
            backgroundColor: '#e5e7eb',
            borderRadius: 6
          }} />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9'
      }, style]}
      activeOpacity={0.7}
    >
      {/* Mode Icon */}
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: `${config.color}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
      }}>
        <Ionicons
          name={config.icon}
          size={20}
          color={config.color}
        />
      </View>

      {/* Mode Info */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: 2
        }}>
          {config.title}
        </Text>
        <Text style={{
          fontSize: 13,
          color: '#6b7280'
        }}>
          Toca para cambiar modo
        </Text>
      </View>

      {/* Chevron */}
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Ionicons
          name="chevron-down"
          size={16}
          color="#9ca3af"
        />
      </View>
    </TouchableOpacity>
  );
};