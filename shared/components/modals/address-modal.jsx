import React, { useState } from 'react';
import { View, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '../ui';
import { AddressForm } from '../forms/address-form';
import { cn } from '../../utils/cn';

export const AddressModal = ({
  visible,
  onClose,
  initialData = null,
  mode = 'create',
  onSubmit,
  isLoading = false
}) => {
  const [currentAddress, setCurrentAddress] = useState(initialData);

  const handleSubmit = async (addressData) => {
    try {
      await onSubmit(addressData);
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleCancel = () => {
    setCurrentAddress(initialData);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border bg-card">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">
              {mode === 'edit' ? 'Editar Dirección' : 'Nueva Dirección'}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {mode === 'edit' ? 'Modifica los datos de tu dirección' : 'Agrega una nueva dirección'}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className={cn(
              'w-10 h-10 rounded-full items-center justify-center',
              'bg-gray-100 active:bg-gray-200'
            )}
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        {/* Form Content */}
        <AddressForm
          initialData={currentAddress || {}}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </View>
    </Modal>
  );
};