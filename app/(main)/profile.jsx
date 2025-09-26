import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Text } from '../../shared/components/ui';
import { ModeSwitcher } from '../../shared/components/mode-switcher';
import { useAuthStore } from '../../shared/stores/auth-store';
import { useCurrentMode } from '../../features/auth/shared/hooks/use-user-modes';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { currentMode } = useCurrentMode();

  const getModeInfo = () => {
    const modeConfig = {
      client: {
        title: 'Cliente',
        icon: 'basket-outline',
        description: 'Compra productos y recibe entregas',
        color: '#3b82f6'
      },
      business: {
        title: 'Negocio',
        icon: 'briefcase-outline',
        description: 'Gestiona tu tienda y productos',
        color: '#10b981'
      },
      delivery: {
        title: 'Delivery',
        icon: 'bicycle-outline',
        description: 'Entrega productos y gana dinero',
        color: '#f59e0b'
      }
    };
    return modeConfig[currentMode] || modeConfig.client;
  };

  const handleLogout = () => {
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
  };

  const modeInfo = getModeInfo();

  return (
    <SafeAreaView className="flex-1 bg-secondary" edges={['top']}>
      <ScrollView className="flex-1">
        <View className="p-4 space-y-4">

          {/* Profile Header */}
          <Card>
            <View className="items-center py-4">
              {/* Profile Picture Placeholder */}
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#ef4444',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <Text style={{
                  color: '#ffffff',
                  fontSize: 32,
                  fontWeight: '700'
                }}>
                  {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>

              <Text variant="heading" className="mb-2 text-center">
                {user?.firstName} {user?.lastName}
              </Text>
              <Text variant="body" className="text-muted-foreground text-center">
                {user?.email}
              </Text>
            </View>
          </Card>

          {/* Account Type / Mode Switcher */}
          <Card>
            <Text variant="label" className="mb-3">TIPO DE CUENTA</Text>

            {/* Current Mode Display */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              backgroundColor: `${modeInfo.color}15`,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: `${modeInfo.color}30`,
              marginBottom: 16
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: `${modeInfo.color}20`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name={modeInfo.icon} size={20} color={modeInfo.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" className="font-semibold" style={{ color: modeInfo.color }}>
                  {modeInfo.title} (Activo)
                </Text>
                <Text variant="caption" className="text-muted-foreground">
                  {modeInfo.description}
                </Text>
              </View>
            </View>

            {/* Mode Switcher */}
            <ModeSwitcher
              onModeSwitch={(context) => {
                console.log('Mode switched from profile:', context);
              }}
            />
          </Card>

          {/* Account Information */}
          <Card>
            <Text variant="label" className="mb-3">INFORMACIÓN DE CUENTA</Text>
            <View className="space-y-3">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail-outline" size={20} color="#64748b" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text variant="caption" className="text-muted-foreground">Email</Text>
                  <Text variant="body">{user?.email}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="call-outline" size={20} color="#64748b" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text variant="caption" className="text-muted-foreground">Teléfono</Text>
                  <Text variant="body">{user?.phone || 'No configurado'}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar-outline" size={20} color="#64748b" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text variant="caption" className="text-muted-foreground">Miembro desde</Text>
                  <Text variant="body">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Fecha no disponible'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Settings Options */}
          <Card>
            <Text variant="label" className="mb-3">CONFIGURACIÓN</Text>
            <View className="space-y-2">

              {/* Edit Profile */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 4
              }}>
                <Ionicons name="person-outline" size={20} color="#64748b" style={{ marginRight: 12 }} />
                <Text variant="body" style={{ flex: 1 }}>Editar Perfil</Text>
                <Ionicons name="chevron-forward-outline" size={16} color="#64748b" />
              </View>

              {/* Notifications */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 4
              }}>
                <Ionicons name="notifications-outline" size={20} color="#64748b" style={{ marginRight: 12 }} />
                <Text variant="body" style={{ flex: 1 }}>Notificaciones</Text>
                <Ionicons name="chevron-forward-outline" size={16} color="#64748b" />
              </View>

              {/* Privacy */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 4
              }}>
                <Ionicons name="shield-outline" size={20} color="#64748b" style={{ marginRight: 12 }} />
                <Text variant="body" style={{ flex: 1 }}>Privacidad y Seguridad</Text>
                <Ionicons name="chevron-forward-outline" size={16} color="#64748b" />
              </View>

              {/* Help */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 4
              }}>
                <Ionicons name="help-circle-outline" size={20} color="#64748b" style={{ marginRight: 12 }} />
                <Text variant="body" style={{ flex: 1 }}>Ayuda y Soporte</Text>
                <Ionicons name="chevron-forward-outline" size={16} color="#64748b" />
              </View>

            </View>
          </Card>

          {/* Logout Button */}
          <Card>
            <Button
              variant="outline"
              className="w-full"
              style={{
                borderColor: '#ef4444',
                backgroundColor: 'transparent'
              }}
              onPress={handleLogout}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                <Text style={{ color: '#ef4444', fontWeight: '600' }}>Cerrar Sesión</Text>
              </View>
            </Button>
          </Card>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}