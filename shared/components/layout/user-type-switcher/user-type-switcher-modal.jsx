import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Text } from '../../ui';
import { useCurrentUserType, useSwitchUserType, useBusinessContexts, useUserType } from '../../../hooks/use-user-type';
import { getUserTypeConfig } from '../../../config/user-types';
import { colors } from '../../../utils/colors';

export const UserTypeSwitcherModal = ({ visible, onClose, onUserTypeSwitch }) => {
  const router = useRouter();
  const { currentUserType, availableUserTypes = [], isLoading } = useCurrentUserType();
  const businessContexts = useBusinessContexts() || [];
  const switchUserTypeMutation = useSwitchUserType();
  const [selectedUserType, setSelectedUserType] = useState(currentUserType);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [switchingTo, setSwitchingTo] = useState(null);

  // Debug logging for business contexts
  React.useEffect(() => {
    if (visible) {
      console.log('📊 UserTypeSwitcher opened - businessContexts from hook:', businessContexts);
      console.log('📊 businessContexts.length:', businessContexts.length);
    }
  }, [visible, businessContexts]);

  // Let's also check what useUserType returns directly
  const { data: rawUserTypeData } = useUserType();
  React.useEffect(() => {
    if (visible) {
      console.log('📊 RAW userTypeData:', rawUserTypeData);
      console.log('📊 RAW businessContexts:', rawUserTypeData?.businessContexts);
    }
  }, [visible, rawUserTypeData]);

  // Bottom sheet ref
  const bottomSheetRef = useRef(null);

  // Handle sheet changes
  const handleSheetChanges = useCallback((index) => {
    console.log('UserTypeSwitcher bottom sheet index changed to:', index);
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  // Effect to control bottom sheet visibility
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0); // Go to 85% height (first and only snap point)
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleUserTypeSwitch = async (userType, businessId = null, branchId = null) => {
    console.log('🔄 handleUserTypeSwitch called:', { userType, currentUserType, businessId });
    console.log('🔍 businessContexts:', businessContexts);
    console.log('🔍 businessContexts.length:', businessContexts.length);

    if (userType === currentUserType) {
      console.log('⏭️ Already on this type, skipping switch');
      onClose(); // Close the modal even if already on this type
      return;
    }

    try {
      setSwitchingTo(userType);

      // If switching to business and no businessId provided, use first available business
      let finalBusinessId = businessId;
      let finalBranchId = branchId;

      console.log('🧪 Testing condition:', {
        isBusinessType: userType === 'business',
        hasNoBusinessId: !businessId,
        hasBusinessContexts: businessContexts.length > 0,
        shouldAutoSelect: userType === 'business' && !businessId && businessContexts.length > 0
      });

      if (userType === 'business' && !businessId && businessContexts.length > 0) {
        finalBusinessId = businessContexts[0].businessId;
        // Use first branch if available
        if (businessContexts[0].branches?.length > 0) {
          finalBranchId = businessContexts[0].branches[0].id;
        }
        console.log('🔄 Switching to business mode with auto-selected business:', finalBusinessId);
        console.log('🔄 businessContexts[0]:', businessContexts[0]);
        console.log('🔄 branches:', businessContexts[0].branches);
      }

      console.log('📤 Sending to API:', {
        userType,
        businessId: finalBusinessId,
        branchId: finalBranchId
      });

      await switchUserTypeMutation.mutateAsync({
        userType,
        businessId: finalBusinessId,
        branchId: finalBranchId
      });

      // Navigate to the new user type section
      router.replace(`/${userType}/(tabs)`);

      // Close immediately to prevent modal from reopening after component switch
      onClose();
      onUserTypeSwitch?.({ userType, businessId: finalBusinessId, branchId: finalBranchId });

      // Reset switching state after a small delay
      setTimeout(() => {
        setSwitchingTo(null);
      }, 300);
    } catch (error) {
      console.error('Failed to switch user type:', error);
      setSwitchingTo(null);
    }
  };

  // Use the standardized getUserTypeConfig utility

  const UserTypeCard = ({ userType, isActive, onPress, isAvailable }) => {
    const config = getUserTypeConfig(userType);
    const isSwitching = switchingTo === userType;
    const isDisabled = !isAvailable || switchingTo !== null;

    return (
      <TouchableOpacity
        onPress={() => !isDisabled && onPress(userType)}
        style={{
          marginBottom: 12
        }}
        activeOpacity={0.95}
        disabled={isDisabled}
      >
        <View style={{
          backgroundColor: isSwitching ? config.primary : isActive ? config.primary : colors.bg.primary,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1.5,
          borderColor: isSwitching ? config.primary : isActive ? config.primary : colors.border.light,
          shadowColor: isSwitching ? config.primary : isActive ? config.primary : '#000',
          shadowOffset: { width: 0, height: isSwitching ? 6 : isActive ? 4 : (isDisabled ? 1 : 2) },
          shadowOpacity: isSwitching ? 0.3 : isActive ? 0.2 : (isDisabled ? 0.03 : 0.08),
          shadowRadius: isSwitching ? 10 : isActive ? 8 : (isDisabled ? 2 : 4),
          elevation: isSwitching ? 8 : isActive ? 6 : (isDisabled ? 1 : 2),
          opacity: isDisabled && !isSwitching ? 0.5 : 1
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: (isSwitching || isActive) ? 'rgba(255, 255, 255, 0.2)' : config.background,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Ionicons
                name={config.icon}
                size={20}
                color={(isSwitching || isActive) ? colors.text.inverse : config.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: (isSwitching || isActive) ? colors.text.inverse : colors.text.primary,
                marginBottom: 2
              }}>
                {config.title}
              </Text>
              <Text style={{
                fontSize: 12,
                color: (isSwitching || isActive) ? 'rgba(255, 255, 255, 0.8)' : colors.text.secondary
              }}>
                {config.subtitle}
              </Text>
            </View>

            {isSwitching ? (
              <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : isActive ? (
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="checkmark" size={14} color={colors.text.inverse} />
              </View>
            ) : null}
          </View>

          {/* Description */}
          <Text style={{
            fontSize: 13,
            lineHeight: 18,
            color: (isSwitching || isActive) ? 'rgba(255, 255, 255, 0.9)' : colors.text.secondary,
            marginBottom: 10
          }}>
            {config.description}
          </Text>

          {/* Benefits */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {config.benefits.slice(0, 2).map((benefit, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: (isSwitching || isActive) ? 'rgba(255, 255, 255, 0.15)' : config.background,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: (isSwitching || isActive) ? 'rgba(255, 255, 255, 0.2)' : config.primary + '20'
                }}
              >
                <Text style={{
                  fontSize: 10,
                  fontWeight: '500',
                  color: (isSwitching || isActive) ? colors.text.inverse : config.primary
                }}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      onChange={handleSheetChanges}
      snapPoints={['85%']}
      enablePanDownToClose={true}
      animationConfigs={{
        duration: 250,
      }}
      activeOffsetY={[-1, 1]}
      failOffsetX={[-5, 5]}
    >
      <BottomSheetView style={{ flex: 1, paddingBottom: 32 }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 24
      }}>
        <View>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: 4
          }}>
            ¿Qué vas a hacer?
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.text.secondary
          }}>
            Selecciona tu actividad
          </Text>
        </View>

        <TouchableOpacity
          onPress={onClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.bg.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4
          }}
        >
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Modes */}
      <View style={{
        paddingHorizontal: 24,
        paddingBottom: 32
      }}>
        {isLoading ? (
          // Loading state
          <View style={{
            alignItems: 'center',
            paddingVertical: 40
          }}>
            <Text style={{
              fontSize: 16,
              color: colors.text.secondary
            }}>
              Cargando modos disponibles...
            </Text>
          </View>
        ) : availableUserTypes.length > 0 ? (
          availableUserTypes.map((userType) => (
            <UserTypeCard
              key={userType}
              userType={userType}
              isActive={currentUserType === userType}
              isAvailable={true}
              onPress={handleUserTypeSwitch}
            />
          ))
        ) : (
          // No modes available
          <View style={{
            alignItems: 'center',
            paddingVertical: 40
          }}>
            <Text style={{
              fontSize: 16,
              color: colors.text.secondary,
              textAlign: 'center'
            }}>
              No hay modos disponibles
            </Text>
          </View>
        )}

      </View>
      </BottomSheetView>
    </BottomSheet>
  );
};