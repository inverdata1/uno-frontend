import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, ScrollView, TouchableOpacity, View, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../core/auth/stores/auth-store';
import { SettingsItem } from '../../../shared/components/profile';
import { Text } from '../../../shared/components/ui';
import { getUserTypeConfig } from '../../../shared/config/user-types';
import { useCurrentUserType } from '../../../shared/hooks/use-user-type';
import { colors } from '../../../shared/utils/colors';

export default function BusinessSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuthStore();
  const { currentUserType, availableUserTypes = [] } = useCurrentUserType();

  const userTypeInfo = getUserTypeConfig(currentUserType);

  const handleLogout = useCallback(() => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('¿Estás seguro que quieres cerrar sesión?');
      if (confirmLogout) {
        signOut().catch(() => window.alert('No se pudo cerrar sesión'));
      }
      return;
    }

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
          Gestiona tu negocio y preferencias
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 30}}
      >

        <View style={{ paddingHorizontal: 20 }}>
          {/* Business Settings */}
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
              Negocio
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
                icon="storefront-outline"
                title="Información del Negocio"
                subtitle="Nombre, categoría, descripción"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={true}
              />
              <SettingsItem
                icon="time-outline"
                title="Horarios de Atención"
                subtitle="Configura tu horario"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={true}
              />
              <SettingsItem
                icon="git-branch-outline"
                title="Sucursales"
                subtitle="Gestiona tus sucursales"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={false}
              />
            </View>
          </View>

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
                icon="wallet-outline"
                title="Pagos y Facturación"
                subtitle="Métodos de cobro, facturas"
                onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                showBorder={false}
              />
            </View>
          </View>

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
                subtitle="Pedidos, mensajes, promociones"
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
                title="Acerca de UNO Business"
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
    </SafeAreaView>
  );
}
