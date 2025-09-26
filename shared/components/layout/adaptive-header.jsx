import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentMode } from '../../hooks/use-user-modes';
import { useAddressStore } from '../../../modes/core/address-store';
import { useAuthStore } from '../../../auth/stores/auth-store';
import { getModeSettings } from '../../../modes/core/mode-config';

/**
 * Adaptive header that changes based on current mode
 */
export const AdaptiveHeader = () => {
  const { currentMode } = useCurrentMode();
  const { user } = useAuthStore();
  const { getCurrentAddressForMode, hasAddressesForMode } = useAddressStore();
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const modeSettings = getModeSettings(currentMode);
  const currentAddress = getCurrentAddressForMode(currentMode);
  const hasAddresses = hasAddressesForMode(currentMode);

  const handleAddressPress = () => {
    if (hasAddresses) {
      setShowAddressPicker(true);
    } else {
      // Navigate to add address screen
      console.log('Navigate to add address for mode:', currentMode);
    }
  };

  const getAddressText = () => {
    if (currentAddress) {
      return currentAddress.name;
    }
    return modeSettings.placeholder;
  };

  return (
    <View style={{
      backgroundColor: modeSettings.primary,
      paddingTop: 20,
      paddingBottom: 20,
      paddingHorizontal: 24
    }}>
      {/* Top Row: Logo and Actions */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        {/* UNO Logo */}
        <View>
          <Text style={{
            color: '#ffffff',
            fontSize: 28,
            fontWeight: '900',
            letterSpacing: 1
          }}>
            UNO
          </Text>
        </View>

        {/* User Actions */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {/* Balance/Wallet - Only for client and delivery */}
          {(currentMode === 'client' || currentMode === 'delivery') && (
            <TouchableOpacity style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Ionicons name="wallet-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={{
                color: '#ffffff',
                fontSize: 14,
                fontWeight: '600'
              }}>
                $0.00
              </Text>
            </TouchableOpacity>
          )}

          {/* Notifications */}
          <TouchableOpacity style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Ionicons name="notifications-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Row: Mode-Specific Address/Location */}
      <TouchableOpacity onPress={handleAddressPress}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons
            name="location"
            size={16}
            color="#ffffff"
            style={{ marginRight: 8 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 12,
              fontWeight: '500'
            }}>
              {modeSettings.label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{
                color: '#ffffff',
                fontSize: 16,
                fontWeight: '600',
                flex: 1
              }} numberOfLines={1}>
                {getAddressText()}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color="#ffffff"
                style={{ marginLeft: 4 }}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};