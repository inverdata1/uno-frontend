import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lottieAnimations } from '../../assets/images';
import { AddressForm } from '../forms/address-form';
import { Button, Text } from '../ui';

const LottieMapImage = () => {
  const animationRef = useRef(null);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (animationRef.current) {
      // Play animation from 0 to frame 58 only
      animationRef.current.play(0, 58);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startCustomLoop = () => {
    if (animationRef.current) {
      // Play frames 58-90
      animationRef.current.play(58, 90);
    }
  };

  const handleAnimationFinish = () => {
    if (!hasPlayedOnce) {
      // First animation (0-58) finished, start the pause/loop cycle
      setHasPlayedOnce(true);
      // Start with a pause before first custom loop
      timeoutRef.current = setTimeout(() => {
        startCustomLoop();
      }, 2000); // 2 second pause before first loop
    } else {
      // Animation segment (58-90) finished, pause before next loop
      timeoutRef.current = setTimeout(() => {
        startCustomLoop();
      }, 2000); // 2 second pause before each loop
    }
  };

  return (
    <View className="w-full mb-1 items-center">
      <View style={{ width: '90%', aspectRatio: 16/9, borderRadius: 16, overflow: 'hidden' }}>
        <LottieView
          ref={animationRef}
          source={lottieAnimations.map}
          loop={false} // Never auto-loop, we control everything manually
          onAnimationFinish={handleAnimationFinish}
          style={{
            width: '100%',
            height: '100%'
          }}
        />
      </View>
    </View>
  );
};


const getTypeIcon = (typeId) => {
  const iconMap = {
    'CLIENT_HOME': 'home',
    'CLIENT_WORK': 'business',
    'CLIENT_OTHER': 'location',
    'BUSINESS_MAIN': 'storefront',
    'BUSINESS_BRANCH': 'business',
    'BUSINESS_WAREHOUSE': 'cube',
    'BUSINESS_PICKUP': 'basket',
    'DRIVER_BASE': 'car',
    'DRIVER_ZONE': 'map'
  };
  return iconMap[typeId] || 'location';
};

const getTypeColor = (typeId) => {
  const colorMap = {
    'CLIENT_HOME': '#10b981', // emerald
    'CLIENT_WORK': '#3b82f6', // blue
    'CLIENT_OTHER': '#8b5cf6', // violet
    'BUSINESS_MAIN': '#f59e0b', // amber
    'BUSINESS_BRANCH': '#ef4444', // red
    'BUSINESS_WAREHOUSE': '#6b7280', // gray
    'BUSINESS_PICKUP': '#ec4899', // pink
    'DRIVER_BASE': '#06b6d4', // cyan
    'DRIVER_ZONE': '#84cc16'  // lime
  };
  return colorMap[typeId] || '#6b7280';
};

const AddressCard = ({ address, isSelected, onSelect, onEdit, onDelete, onSetDefault }) => (
  <Pressable
    onPress={() => onSelect(address)}
    className="mx-6 px-4 py-3 rounded-xl border border-primary-200 "
  >
    <View className="flex-row items-start">
      {/* Selection indicator */}
      <View className="mr-4 pt-1">
        {isSelected ? (
          <View className="w-5 h-5 bg-primary-500 rounded-full items-center justify-center">
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        ) : (
          <View className="w-5 h-5 border-2 border-gray-300 rounded-full" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1 min-h-0">
        {/* Title row */}
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-row items-center flex-1 mr-2">
            <Ionicons
              name={getTypeIcon(address.addressTypeId)}
              size={18}
              color={getTypeColor(address.addressTypeId)}
              style={{ marginRight: 8 }}
            />
            <Text className="font-semibold text-base text-gray-900">
              {address.label}
            </Text>
          </View>
          {address.isDefault && (
            <View className="bg-green-100 px-2 py-0.5 rounded-full shrink-0">
              <Text className="text-green-700 text-xs font-medium">
                Predeterminada
              </Text>
            </View>
          )}
        </View>

        {/* Contact name */}
        <Text className="text-sm text-gray-600 mb-2">
          {address.contactName}
        </Text>

        {/* Address */}
        <Text className="text-sm text-gray-500 mb-1">
          {address.street}
          {address.number ? ` ${address.number}` : ''}
          {address.floor ? `, Piso ${address.floor}` : ''}
          {address.apartment ? `, Apto ${address.apartment}` : ''}
        </Text>

        {/* Location */}
        <Text className="text-sm text-gray-500">
          {address.city}{address.stateName ? `, ${address.stateName}` : ''}
        </Text>

        {/* Actions - only show when selected */}
        {isSelected && (
          <View className="flex-row gap-4 mt-3 pt-3 border-t border-gray-100">
            <Pressable
              onPress={() => onEdit(address)}
              className="flex-row items-center active:opacity-60"
            >
              <Ionicons name="pencil" size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm font-medium ml-1">Editar</Text>
            </Pressable>


            <Pressable
              onPress={() => onDelete(address)}
              className="flex-row items-center active:opacity-60"
            >
              <Ionicons name="trash" size={16} color="#DC2626" />
              <Text className="text-red-600 text-sm font-medium ml-1">Eliminar</Text>
            </Pressable>
          </View>
        )}
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
  onSetDefaultAddress,
  isLoading = false
}) => {
  const [view, setView] = useState('list');
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0);
  const [localSelectedAddress, setLocalSelectedAddress] = useState(selectedAddress);
  const bottomSheetRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
      // Reset local selection when modal opens
      setLocalSelectedAddress(selectedAddress);
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, selectedAddress]);

  const handleAddNew = () => {
    setEditingAddress(null);
    setView('create');
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setView('edit');
  };

  const handleDeleteRequest = (address) => {
    setAddressToDelete(address);
  };

  const handleConfirmDelete = async () => {
    if (addressToDelete) {
      try {
        await onDeleteAddress(addressToDelete);
        setAddressToDelete(null);
      } catch (error) {
        console.error('Error deleting address:', error);
        // Keep the dialog open if there's an error
      }
    }
  };

  const handleCancelDelete = () => {
    setAddressToDelete(null);
  };

  const handleSetDefault = async (address) => {
    try {
      await onSetDefaultAddress(address);
    } catch (error) {
      console.error('Error setting default address:', error);
    }
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

  const handleLocalSelect = (address) => {
    setLocalSelectedAddress(address);
  };

  const handleConfirmSelection = async () => {
    if (localSelectedAddress) {
      // First set as default, then select
      try {
        await onSetDefaultAddress(localSelectedAddress);
        onAddressSelect(localSelectedAddress);
      } catch (error) {
        console.error('Error setting default address:', error);
        // Still proceed with selection even if setting default fails
        onAddressSelect(localSelectedAddress);
      }
    }
  };

  const handleClose = () => {
    setView('list');
    setEditingAddress(null);
    setLocalSelectedAddress(selectedAddress); // Reset to original selection
    onClose();
  };

  const renderListContent = () => (
    <View className="flex-1">
      {/* Header */}
      <View className="px-6 pb-2">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900">
            Direcciones
          </Text>
        </View>
      </View>

      {/* Content */}
      {addresses.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8 pt-4 pb-20">
          {/* Lottie Map Animation - only show when empty */}
          <LottieMapImage />
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
            {addresses.map((address, index) => (
              <View key={address.id} className="mb-3">
                <AddressCard
                  address={address}
                  isSelected={localSelectedAddress?.id === address.id}
                  onSelect={handleLocalSelect}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                  onSetDefault={handleSetDefault}
                />
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View
            className="px-6 pt-4 gap-3"
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
          >
            {/* Confirm Selection Button - only show if selection changed */}
            {localSelectedAddress?.id !== selectedAddress?.id && (
              <Button
                onPress={handleConfirmSelection}
                className="w-full bg-primary-500 h-12 rounded-2xl"
              >
                <Text className="text-white font-semibold text-base">
                  Seleccionar "{localSelectedAddress?.label}"
                </Text>
              </Button>
            )}

            {/* Add Address Button */}
            <Button
              variant="outline"
              onPress={handleAddNew}
              className="w-full h-14 rounded-2xl"
            >
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center mr-3">
                  <Ionicons name="add" size={16} color="#ffffff" />
                </View>
                <Text className="text-primary-600 font-semibold text-base">
                  Agregar dirección
                </Text>
              </View>
            </Button>
          </View>
        </View>
      )}
    </View>
  );

  const renderFormContent = () => (
    <View className="flex-1">
      {/* Form Header */}
      <View className="flex-row items-center px-6 pb-4 pt-4">
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
        disableKeyboardAvoidingView={true}
      />
    </View>
  );

  const handleSheetChanges = (index) => {
    setCurrentSnapIndex(index);
  };

  // Dynamic positioning based on snap point
  const modalPositionClass = currentSnapIndex >= 1 ? 'justify-center pb-16' : 'justify-start pt-12';

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={view === 'list' ? ['85%', '95%'] : ['95%']}
      enablePanDownToClose
      onDismiss={handleClose}
      onChange={handleSheetChanges}
      backdropComponent={CustomBackdrop}
      handleComponent={CustomHandle}
      keyboardBehavior="fillParent"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
    >
      <BottomSheetView className="flex-1">
        {view === 'list' ? renderListContent() : renderFormContent()}
      </BottomSheetView>

      {/* Delete Confirmation Dialog - Outside BottomSheet */}
      {addressToDelete && (
        <View
          className={`absolute inset-0 bg-black/50 ${modalPositionClass} items-center`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          <View className="mx-6 bg-white rounded-2xl p-6 shadow-xl">
            <View className="items-center mb-4">
              <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="trash" size={24} color="#ef4444" />
              </View>
              <Text className="text-lg font-bold text-gray-900 text-center mb-2">
                Eliminar dirección
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                ¿Estás seguro de que quieres eliminar "{addressToDelete.label}"?
              </Text>
              <Text className="text-xs text-gray-500 text-center mt-1">
                Esta acción no se puede deshacer.
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Button
                variant="outline"
                onPress={handleCancelDelete}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onPress={handleConfirmDelete}
                className="flex-1 bg-red-500"
                disabled={isLoading}
              >
                {isLoading ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </View>
          </View>
        </View>
      )}
    </BottomSheetModal>
  );
};