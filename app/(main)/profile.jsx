import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../shared/components/ui';
import { ProfileHero, SettingsItem } from '../../shared/components/profile';
import BusinessUpgradeModal from '../../modules/commerce/businesses/business-upgrade-modal';
import BusinessProfileScreen from '../../modules/business/profile/business-profile-screen';
import { useAuthStore } from '../../core/auth/stores/auth-store';
import { useAppStore } from '../../shared/stores/app-store';
import { useCurrentUserType } from '../../shared/hooks/use-user-type';
import { getUserTypeConfig } from '../../shared/config/user-types';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { currentUserType, availableUserTypes = [] } = useCurrentUserType();
  const { openUserTypeSwitcher } = useAppStore();
  const [businessUpgradeModalVisible, setBusinessUpgradeModalVisible] = useState(false);

  const userTypeInfo = getUserTypeConfig(currentUserType);

  // Debug logging
  React.useEffect(() => {
    console.log('📱 Profile Screen - Available User Types:', availableUserTypes);
    console.log('📱 Profile Screen - Current User Type:', currentUserType);
    console.log('📱 Profile Screen - Can Switch?', availableUserTypes.length > 1);
  }, [availableUserTypes, currentUserType]);

  const handleOpenUserTypeSwitcher = useCallback(() => {
    openUserTypeSwitcher();
  }, [openUserTypeSwitcher]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  }, [signOut]);

  // Show business profile when in business mode - AFTER all hooks
  if (currentUserType === 'business') {
    return <BusinessProfileScreen />;
  }

  return (
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: '#f8fafc' }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Hero Profile Section */}
        <ProfileHero
          user={user}
          userTypeInfo={userTypeInfo}
          availableUserTypes={availableUserTypes}
          onUserTypeBadgePress={handleOpenUserTypeSwitcher}
        />

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {/* Verified Badge */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 32
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12
            }}>
              <Ionicons name="shield-checkmark" size={14} color="#3b82f6" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#3b82f6' }}>
                Verificado
              </Text>
            </View>
          </View>

          {/* Account Settings */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: 16,
              paddingHorizontal: 4
            }}>
              Cuenta
            </Text>

            <View style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2
            }}>
              <SettingsItem
                icon="person-outline"
                title="Editar Perfil"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={true}
              />
              <SettingsItem
                icon="card-outline"
                title="Métodos de Pago"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={!availableUserTypes.includes('business') && !availableUserTypes.includes('delivery')}
              />

              {/* Business Mode Option - Only show if not active */}
              {!availableUserTypes.includes('business') && (
                <SettingsItem
                  icon="briefcase-outline"
                  title="Vende con UNO"
                  onPress={() => setBusinessUpgradeModalVisible(true)}
                  showBorder={!availableUserTypes.includes('delivery')}
                  highlight={true}
                />
              )}

              {/* Delivery Mode Option - Only show if not active */}
              {!availableUserTypes.includes('delivery') && (
                <SettingsItem
                  icon="bicycle-outline"
                  title="Entrega con UNO"
                  onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                  showBorder={false}
                  highlight={true}
                />
              )}
            </View>
          </View>

          {/* More Options */}
          <View style={{ marginBottom: 32 }}>
            <View style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2
            }}>
              <SettingsItem
                icon="ellipsis-horizontal"
                title="Más opciones"
                subtitle="Notificaciones, privacidad, ayuda"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={false}
              />
            </View>
          </View>

          {/* Logout */}
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2
          }}>
            <SettingsItem
              icon="log-out-outline"
              title="Cerrar Sesión"
              onPress={handleLogout}
              danger={true}
              showBorder={false}
            />
          </View>
        </View>
      </ScrollView>

      {/* Business Upgrade Modal */}
      <BusinessUpgradeModal
        visible={businessUpgradeModalVisible}
        onClose={() => setBusinessUpgradeModalVisible(false)}
        onSuccess={() => {
          // Modal will close itself after success
          // User types will be refreshed automatically by the modal
        }}
      />
    </SafeAreaView>
  );
}
