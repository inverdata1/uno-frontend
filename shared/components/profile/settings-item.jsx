import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui';

/**
 * Settings menu item component
 *
 * @param {Object} props
 * @param {string} props.icon - Ionicons icon name
 * @param {string} props.title - Item title
 * @param {string} [props.subtitle] - Optional subtitle
 * @param {Function} props.onPress - Press handler
 * @param {boolean} [props.danger=false] - Danger styling (red)
 * @param {boolean} [props.highlight=false] - Highlight styling (blue)
 * @param {boolean} [props.showBorder=false] - Show bottom border
 */
export const SettingsItem = ({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
  highlight = false,
  showBorder = false
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: '#ffffff',
      borderBottomWidth: showBorder ? 1 : 0,
      borderBottomColor: '#f1f5f9',
    }}
    activeOpacity={0.7}
  >
    <View style={{
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: danger ? '#fef2f2' : highlight ? '#f0f9ff' : '#f8fafc',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16
    }}>
      <Ionicons
        name={icon}
        size={18}
        color={danger ? '#ef4444' : highlight ? '#0ea5e9' : '#64748b'}
      />
    </View>
    <View style={{ flex: 1 }}>
      <Text
        variant="body"
        style={{
          fontWeight: '500',
          color: danger ? '#ef4444' : highlight ? '#0ea5e9' : '#1f2937',
          fontSize: 16
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontSize: 13,
            color: '#64748b',
            marginTop: 2
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
    <Ionicons
      name="chevron-forward-outline"
      size={16}
      color="#cbd5e0"
    />
  </TouchableOpacity>
);
