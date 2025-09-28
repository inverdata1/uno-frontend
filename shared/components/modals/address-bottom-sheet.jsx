import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lottieAnimations } from '../../assets/images';
import { cn } from '../../utils/cn';
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


const AddressCard = ({ address, isSelected, onSelect, onEdit, onDelete, onSetDefault }) => (
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
            {address.street}
            {address.number ? ` ${address.number}` : ''}
            {address.floor ? `, Piso ${address.floor}` : ''}
            {address.apartment ? `, Apto ${address.apartment}` : ''}
          </Text>
          <Text className={cn(
            'text-sm font-medium',
            isSelected ? 'text-white/75' : 'text-gray-500'
          )}>
            {address.city}{address.stateName ? `, ${address.stateName}` : ''}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        {!address.isDefault && (
          <Pressable
            onPress={() => onSetDefault(address)}
            className={cn(
              'w-10 h-10 rounded-xl items-center justify-center',
              'active:scale-95',
              isSelected ? 'bg-white/20' : 'bg-amber-50'
            )}
          >
            <Ionicons
              name="star"
              size={16}
              color={isSelected ? '#ffffff' : '#f59e0b'}
            />
          </Pressable>
        )}
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
  onSetDefaultAddress,
  isLoading = false
}) => {
  const [view, setView] = useState('list');
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const bottomSheetRef = useRef(null);
  const insets = useSafeAreaInsets();

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

  const handleClose = () => {
    setView('list');
    setEditingAddress(null);
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
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isSelected={selectedAddress?.id === address.id}
                onSelect={onAddressSelect}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                onSetDefault={handleSetDefault}
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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={view === 'list' ? ['85%', '95%'] : ['95%']}
      enablePanDownToClose
      onDismiss={handleClose}
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

      {/* Delete Confirmation Dialog */}
      {addressToDelete && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
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