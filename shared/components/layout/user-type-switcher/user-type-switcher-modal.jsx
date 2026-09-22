import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Platform, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '../../ui';
import { useCurrentUserType, useSwitchUserType, useBusinessContexts } from '../../../hooks/use-user-type';
import { getUserTypeConfig } from '../../../config/user-types';
import { colors } from '../../../utils/colors';

export const UserTypeSwitcherModal = ({ visible, onClose, onUserTypeSwitch }) => {
  const router = useRouter();
  const { currentUserType, availableUserTypes = [], isLoading } = useCurrentUserType();
  const businessContexts = useBusinessContexts() || [];
  const switchUserTypeMutation = useSwitchUserType();
  const [switchingTo, setSwitchingTo] = useState(null);

  const handleUserTypeSwitch = async (userType, businessId = null, branchId = null) => {
    if (userType === currentUserType) {
      onClose();
      return;
    }

    try {
      setSwitchingTo(userType);

      let finalBusinessId = businessId;
      let finalBranchId = branchId;

      if (userType === 'business' && !businessId && businessContexts.length > 0) {
        finalBusinessId = businessContexts[0].businessId;
        if (businessContexts[0].branches?.length > 0) {
          finalBranchId = businessContexts[0].branches[0].id;
        }
      }

      await switchUserTypeMutation.mutateAsync({
        userType,
        businessId: finalBusinessId,
        branchId: finalBranchId
      });

      router.replace(`/${userType}/(tabs)`);
      onClose();
      onUserTypeSwitch?.({ userType, businessId: finalBusinessId, branchId: finalBranchId });

      setTimeout(() => {
        setSwitchingTo(null);
      }, 300);
    } catch (error) {
      console.error('Failed to switch user type:', error);
      setSwitchingTo(null);
    }
  };

  const UserTypeCard = ({ userType, isActive, onPress, isAvailable }) => {
    const config = getUserTypeConfig(userType);
    const isSwitching = switchingTo === userType;
    const isDisabled = !isAvailable || switchingTo !== null;

    return (
      <TouchableOpacity
        onPress={() => !isDisabled && onPress(userType)}
        style={{ marginBottom: 12 }}
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
    <Modal
      visible={!!visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={{
          backgroundColor: colors.bg.primary,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '85%',
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 40 : 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 16
        }}>
          {/* Grab handle */}
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#d1d5db' }} />
          </View>

          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            marginBottom: 20
          }}>
            <View>
              <Text style={{
                fontSize: 22,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: 2
              }}>
                ¿Qué vas a hacer?
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.text.secondary
              }}>
                Selecciona tu actividad
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.bg.secondary || '#f3f4f6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={20} color={colors.text.secondary || '#6b7280'} />
            </TouchableOpacity>
          </View>

          {/* Modes */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
          >
            {isLoading ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="small" color={colors.primary?.main || '#3b82f6'} style={{ marginBottom: 12 }} />
                <Text style={{ fontSize: 14, color: colors.text.secondary }}>
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
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center' }}>
                  No hay modos disponibles
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};