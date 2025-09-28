import React, { useState, useRef, useEffect } from 'react';
import { View, Pressable, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Text, Button } from '../ui';
import { AddressForm } from '../forms/address-form';
import { cn } from '../../utils/cn';
import { illustrations } from '../../assets/images';

const NavigationMapIllustration = ({ className = "", style = {} }) => {
  return (
    <View className={cn("bg-blue-50 rounded-2xl overflow-hidden border border-blue-100 relative", className)} style={style}>
      {/* Main curved roads */}
      <View className="absolute bg-white rounded-full" style={{
        top: 20,
        left: 40,
        width: 200,
        height: 4,
        transform: [{ rotate: '15deg' }]
      }} />
      <View className="absolute bg-white rounded-full" style={{
        top: 40,
        left: 20,
        width: 180,
        height: 4,
        transform: [{ rotate: '-10deg' }]
      }} />
      <View className="absolute bg-white rounded-full" style={{
        top: 60,
        left: 60,
        width: 160,
        height: 4,
        transform: [{ rotate: '8deg' }]
      }} />

      {/* GPS-style areas */}
      <View className="absolute bg-green-100 rounded-lg" style={{
        top: 15,
        left: 50,
        width: 80,
        height: 25,
        opacity: 0.6
      }} />
      <View className="absolute bg-blue-100 rounded-lg" style={{
        top: 50,
        left: 200,
        width: 60,
        height: 30,
        opacity: 0.6
      }} />

      {/* Location markers */}
      <View className="absolute" style={{ top: 25, left: 120 }}>
        <View className="w-3 h-3 rounded-full bg-primary-500" />
      </View>
      <View className="absolute" style={{ top: 45, left: 80 }}>
        <View className="w-3 h-3 rounded-full bg-blue-500" />
      </View>

      {/* Main location pin */}
      <View className="absolute" style={{ top: 35, left: 160 }}>
        <Ionicons name="location" size={20} color="#DC2626" />
      </View>

      {/* Route line */}
      <View className="absolute bg-primary-500 rounded-full" style={{
        top: 30,
        left: 100,
        width: 80,
        height: 3,
        opacity: 0.8,
        transform: [{ rotate: '25deg' }]
      }} />
    </View>
  );
};

const AddressCard = ({ address, isSelected, onSelect, onEdit, onDelete }) => (
  <Pressable
    onPress={() => onSelect(address)}
    className={cn(
      'mx-6 mb-4 p-5 rounded-2xl border-0',
      'active:scale-[0.98]',
      isSelected
        ? 'bg-primary-500 shadow-lg shadow-primary-500/20'
        : 'bg-white shadow-sm shadow-black/5'
    )}
    style={{
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isSelected ? 0.15 : 0.08,
      shadowRadius: isSelected ? 8 : 4,
      elevation: isSelected ? 6 : 2,
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
            'active:scale-95',
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
            'active:scale-95',
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

const CustomBackdrop = (props) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.5}
  />
);

const CustomHandle = () => (
  <View className="items-center py-3">
    <View className="w-10 h-1 bg-gray-300 rounded-full" />
  </View>
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
  const [view, setView] = useState('list');
  const [editingAddress, setEditingAddress] = useState(null);
  const bottomSheetRef = useRef(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

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

  const handleClose = () => {
    setView('list');
    setEditingAddress(null);
    onClose();
  };

  const renderListContent = () => (
    <View className="flex-1">
      {/* Header with Map */}
      <View className="px-6 pb-2">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900">
            Direcciones
          </Text>
        </View>

        {/* Map Illustration */}
        <View className="w-full mb-1 items-center">
          <Image
            source={illustrations.map}
            style={{
              width: '90%',
              height: undefined,
              aspectRatio: 16/9,
              borderRadius: 16
            }}
            resizeMode="stretch"
          />
        </View>
      </View>

      {/* Content */}
      {addresses.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8 pt-4 pb-12">
          <Text className="text-xl font-bold text-gray-900 mb-3 text-center">
            Agrega tu primera dirección
          </Text>
          <Text className="text-center text-gray-600 text-base leading-relaxed mb-8 max-w-sm">
            Configura direcciones para entregas rápidas y precisas
          </Text>
          <Button
            onPress={handleAddNew}
            className="w-full max-w-xs bg-primary-500 h-12 rounded-2xl"
          >
            <Text className="text-white font-semibold text-base">
              Comenzar
            </Text>
          </Button>
        </View>
      ) : (
        <View className="flex-1">
          <View className="flex-1 pt-2">
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
          </View>

          {/* Add Button */}
          <View className="px-6 pt-4 pb-6">
            <Pressable
              onPress={handleAddNew}
              className="flex-row items-center justify-center bg-white border border-gray-200 rounded-2xl py-4 px-6 shadow-sm active:scale-[0.98]"
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
  );

  const renderFormContent = () => (
    <View className="flex-1">
      {/* Form Header */}
      <View className="flex-row items-center px-6 pb-4">
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

      {/* Form */}
      <AddressForm
        initialData={editingAddress || {}}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        isLoading={isLoading}
      />
    </View>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['85%', '95%']}
      enablePanDownToClose
      onDismiss={handleClose}
      backdropComponent={CustomBackdrop}
      handleComponent={CustomHandle}
      backgroundStyle={{
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
    >
      <BottomSheetView className="flex-1">
        {view === 'list' ? renderListContent() : renderFormContent()}
      </BottomSheetView>
    </BottomSheetModal>
  );
};