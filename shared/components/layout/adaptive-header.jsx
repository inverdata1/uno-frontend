import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../../auth/stores/auth-store';
import { useAddressStore } from '../../../modes/core/address-store';
import { getModeSettings } from '../../../modes/core/mode-config';
import { useCurrentMode } from '../../hooks/use-user-modes';
import { AddressManager } from '../modals/address-bottom-sheet';

/**
 * Adaptive header that changes based on current mode
 */
export const AdaptiveHeader = () => {
  const { currentMode } = useCurrentMode();
  const { user } = useAuthStore();
  const {
    getCurrentAddressForMode,
    hasAddressesForMode,
    addAddress,
    updateAddress,
    deleteAddress,
    getAddressesForMode,
    setCurrentAddressForMode
  } = useAddressStore();
  const [showAddressManager, setShowAddressManager] = useState(false);

  const modeSettings = getModeSettings(currentMode);
  const currentAddress = getCurrentAddressForMode(currentMode);
  const hasAddresses = hasAddressesForMode(currentMode);

  const handleAddressPress = () => {
    setShowAddressManager(true);
  };

  const handleAddressSelect = (address) => {
    setCurrentAddressForMode(currentMode, address);
    setShowAddressManager(false);
  };

  const handleAddAddress = async (addressData) => {
    try {
      await addAddress(addressData, currentMode);
      console.log('Address added successfully for mode:', currentMode);
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  };

  const handleEditAddress = async (addressData) => {
    try {
      await updateAddress(addressData.id, addressData, currentMode);
      console.log('Address updated successfully for mode:', currentMode);
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  };

  const handleDeleteAddress = async (address) => {
    try {
      await deleteAddress(address.id, currentMode);
      console.log('Address deleted successfully for mode:', currentMode);
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
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

      {/* Address Manager */}
      <AddressManager
        visible={showAddressManager}
        onClose={() => setShowAddressManager(false)}
        addresses={getAddressesForMode(currentMode)}
        selectedAddress={currentAddress}
        onAddressSelect={handleAddressSelect}
        onAddAddress={handleAddAddress}
        onEditAddress={handleEditAddress}
        onDeleteAddress={handleDeleteAddress}
      />
    </View>
  );
};