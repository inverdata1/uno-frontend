import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '../../../shared/components/ui';
import { SettingsItem } from '../../../shared/components/profile';
import BusinessUpgradeModal from '../../../modules/commerce/businesses/business-upgrade-modal';
import { useAuthStore } from '../../../core/auth/stores/auth-store';
import { useAppStore } from '../../../shared/stores/app-store';
import { useCurrentUserType } from '../../../shared/hooks/use-user-type';
import { getUserTypeConfig } from '../../../shared/config/user-types';
import { colors } from '../../../shared/utils/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { currentUserType, availableUserTypes = [] } = useCurrentUserType();
  const { openUserTypeSwitcher } = useAppStore();
  const [businessUpgradeModalVisible, setBusinessUpgradeModalVisible] = useState(false);

  const userTypeInfo = getUserTypeConfig(currentUserType);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
      {/* Header with Back Button */}
      <View style={{
        padding: 20,
        paddingTop: 12,
        paddingBottom: 16,
        backgroundColor: colors.bg.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
        marginBottom: 20
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: colors.bg.secondary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.text.primary
          }}>
            Configuración
          </Text>
        </View>
        <Text style={{
          fontSize: 15,
          color: colors.text.secondary,
          paddingLeft: 48
        }}>
          Gestiona tu cuenta y preferencias
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >

        <View style={{ paddingHorizontal: 20 }}>
          {/* Account Settings */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: colors.text.secondary,
              marginBottom: 12,
              paddingHorizontal: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              Cuenta
            </Text>

            <View style={{
              backgroundColor: colors.bg.primary,
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
                title="Información Personal"
                subtitle="Nombre, correo, teléfono"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={true}
              />
              <SettingsItem
                icon="card-outline"
                title="Métodos de Pago"
                subtitle="Tarjetas y métodos guardados"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={true}
              />
              <SettingsItem
                icon="location-outline"
                title="Direcciones"
                subtitle="Gestiona tus direcciones"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={false}
              />
            </View>
          </View>

          {/* Mode Options - Show if user doesn't have these modes */}
          {(!availableUserTypes.includes('business') || !availableUserTypes.includes('delivery')) && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: colors.text.secondary,
                marginBottom: 12,
                paddingHorizontal: 4,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                Opciones Adicionales
              </Text>

              <View style={{
                backgroundColor: colors.bg.primary,
                borderRadius: 16,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2
              }}>
                {!availableUserTypes.includes('business') && (
                  <SettingsItem
                    icon="briefcase-outline"
                    title="Vende con UNO"
                    subtitle="Crea tu negocio y vende"
                    onPress={() => setBusinessUpgradeModalVisible(true)}
                    showBorder={!availableUserTypes.includes('delivery')}
                    highlight={true}
                  />
                )}

                {!availableUserTypes.includes('delivery') && (
                  <SettingsItem
                    icon="bicycle-outline"
                    title="Entrega con UNO"
                    subtitle="Conviértete en repartidor"
                    onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                    showBorder={false}
                    highlight={true}
                  />
                )}
              </View>
            </View>
          )}

          {/* Preferences */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: colors.text.secondary,
              marginBottom: 12,
              paddingHorizontal: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              Preferencias
            </Text>

            <View style={{
              backgroundColor: colors.bg.primary,
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2
            }}>
              <SettingsItem
                icon="notifications-outline"
                title="Notificaciones"
                subtitle="Gestiona tus notificaciones"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={true}
              />
              <SettingsItem
                icon="shield-outline"
                title="Privacidad y Seguridad"
                subtitle="Contraseña, privacidad"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={true}
              />
              <SettingsItem
                icon="language-outline"
                title="Idioma y Región"
                subtitle="Español (ES) · USD"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={false}
              />
            </View>
          </View>

          {/* Support */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: colors.text.secondary,
              marginBottom: 12,
              paddingHorizontal: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              Soporte
            </Text>

            <View style={{
              backgroundColor: colors.bg.primary,
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2
            }}>
              <SettingsItem
                icon="help-circle-outline"
                title="Centro de Ayuda"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={true}
              />
              <SettingsItem
                icon="document-text-outline"
                title="Términos y Condiciones"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={true}
              />
              <SettingsItem
                icon="information-circle-outline"
                title="Acerca de UNO"
                subtitle="Versión 1.0.0"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={false}
              />
            </View>
          </View>

          {/* Logout */}
          <View style={{
            backgroundColor: colors.bg.primary,
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
          setBusinessUpgradeModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
