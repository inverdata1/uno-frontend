import React, { useState } from 'react';
import { View, Modal, Pressable, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '../ui';
import { AddressForm } from '../forms/address-form';
import { cn } from '../../utils/cn';

const AddressCard = ({ address, isSelected, onSelect, onEdit, onDelete }) => (
  <Pressable
    onPress={() => onSelect(address)}
    className={cn(
      'mx-4 mb-4 p-5 rounded-2xl shadow-sm border-0',
      'active:scale-[0.98] transition-transform',
      isSelected
        ? 'bg-primary-500 shadow-primary-500/20 shadow-lg'
        : 'bg-white shadow-black/5'
    )}
    style={{
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isSelected ? 0.15 : 0.08,
      shadowRadius: isSelected ? 12 : 8,
      elevation: isSelected ? 8 : 4,
    }}
  >
    <View className="flex-row items-start justify-between">
      <View className="flex-1 mr-3">
        <View className="flex-row items-center mb-3">
          <View className={cn(
            'w-8 h-8 rounded-full items-center justify-center mr-3',
            isSelected ? 'bg-white/20' : 'bg-primary-50'
          )}>
            <Ionicons
              name="location"
              size={16}
              color={isSelected ? '#ffffff' : '#059669'}
            />
          </View>
          <View className="flex-1">
            <Text className={cn(
              'font-bold text-base leading-tight',
              isSelected ? 'text-white' : 'text-gray-900'
            )}>
              {address.label}
            </Text>
            {address.isDefault && (
              <View className={cn(
                'mt-1 self-start px-2 py-0.5 rounded-full',
                isSelected ? 'bg-white/20' : 'bg-amber-100'
              )}>
                <Text className={cn(
                  'text-xs font-semibold',
                  isSelected ? 'text-white' : 'text-amber-700'
                )}>
                  Predeterminada
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="space-y-1.5">
          <Text className={cn(
            'font-medium text-sm',
            isSelected ? 'text-white/90' : 'text-gray-700'
          )}>
            {address.contactName}
          </Text>
          <Text className={cn(
            'text-sm leading-relaxed',
            isSelected ? 'text-white/80' : 'text-gray-600'
          )}>
            {address.street} {address.number}
            {address.floor && `, Piso ${address.floor}`}
            {address.apartment && `, Apto ${address.apartment}`}
          </Text>
          <Text className={cn(
            'text-sm font-medium',
            isSelected ? 'text-white/75' : 'text-gray-500'
          )}>
            {address.city}, {address.state}
          </Text>
        </View>
      </View>

      <View className="flex-row space-x-2">
        <Pressable
          onPress={() => onEdit(address)}
          className={cn(
            'w-10 h-10 rounded-xl items-center justify-center',
            'active:scale-95 transition-transform',
            isSelected ? 'bg-white/20' : 'bg-gray-50'
          )}
        >
          <Ionicons
            name="pencil"
            size={16}
            color={isSelected ? '#ffffff' : '#6B7280'}
          />
        </Pressable>
        <Pressable
          onPress={() => onDelete(address)}
          className={cn(
            'w-10 h-10 rounded-xl items-center justify-center',
            'active:scale-95 transition-transform',
            isSelected ? 'bg-red-500/20' : 'bg-red-50'
          )}
        >
          <Ionicons
            name="trash"
            size={16}
            color={isSelected ? '#ffffff' : '#DC2626'}
          />
        </Pressable>
      </View>
    </View>
  </Pressable>
);

export const AddressManager = ({
  visible,
  onClose,
  addresses = [],
  selectedAddress,
  onAddressSelect,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  isLoading = false
}) => {
  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [editingAddress, setEditingAddress] = useState(null);

  const handleAddNew = () => {
    setEditingAddress(null);
    setView('create');
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setView('edit');
  };

  const handleFormSubmit = async (addressData) => {
    try {
      if (view === 'edit') {
        await onEditAddress({ ...editingAddress, ...addressData });
      } else {
        await onAddAddress(addressData);
      }
      setView('list');
      setEditingAddress(null);
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  };

  const handleFormCancel = () => {
    setView('list');
    setEditingAddress(null);
  };

  const renderListView = () => (
    <>
      {/* Clean Modern Header */}
      <View className="bg-white">
        <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900">
            Direcciones
          </Text>
          <Pressable
            onPress={onClose}
            className="w-8 h-8 rounded-full items-center justify-center active:scale-95"
          >
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 bg-gray-50">
        {addresses.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-primary-200 items-center justify-center mb-6">
              <Ionicons name="location" size={40} color="#059669" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-3 text-center">
              Agrega tu primera dirección
            </Text>
            <Text className="text-center text-gray-600 text-base leading-relaxed mb-8 max-w-sm">
              Configura direcciones para entregas rápidas y precisas en toda la ciudad
            </Text>
            <Button
              onPress={handleAddNew}
              className="w-full max-w-xs bg-primary-500 h-14 rounded-2xl shadow-lg shadow-primary-500/25"
            >
              <Text className="text-white font-semibold text-base">
                Comenzar
              </Text>
            </Button>
          </View>
        ) : (
          <ScrollView
            className="flex-1 pt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isSelected={selectedAddress?.id === address.id}
                onSelect={onAddressSelect}
                onEdit={handleEdit}
                onDelete={onDeleteAddress}
              />
            ))}
          </ScrollView>
        )}

        {/* Floating Add Button */}
        {addresses.length > 0 && (
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-8">
            <View className="mx-4">
              <Pressable
                onPress={handleAddNew}
                className="flex-row items-center justify-center bg-white border border-gray-200 rounded-2xl py-4 px-6 shadow-lg shadow-black/5 active:scale-[0.98]"
                style={{
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center mr-3">
                  <Ionicons name="add" size={16} color="#ffffff" />
                </View>
                <Text className="text-gray-900 font-semibold text-base">
                  Agregar dirección
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </>
  );

  const renderFormView = () => (
    <>
      {/* Clean Form Header */}
      <View className="bg-white">
        <View className="flex-row items-center px-6 pt-6 pb-4">
          <Pressable
            onPress={handleFormCancel}
            className="w-8 h-8 rounded-full items-center justify-center mr-4 active:scale-95"
          >
            <Ionicons name="arrow-back" size={24} color="#9CA3AF" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 flex-1">
            {view === 'edit' ? 'Editar' : 'Nueva dirección'}
          </Text>
        </View>
      </View>

      {/* Form with modern background */}
      <View className="flex-1 bg-gray-50">
        <AddressForm
          initialData={editingAddress || {}}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isLoading}
        />
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        {view === 'list' ? renderListView() : renderFormView()}
      </View>
    </Modal>
  );
};