import React, { useState, useCallback, useRef } from 'react';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Button, Card, Text } from '../../shared/components/ui';
import { ModeSwitcher } from '../../shared/components/mode-switcher';
import { ModeSwitcherModal } from '../../shared/components/mode-switcher/mode-switcher-modal';
import { useAuthStore } from '../../shared/stores/auth-store';
import { useCurrentMode } from '../../features/auth/shared/hooks/use-user-modes';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { currentMode } = useCurrentMode();

  // Bottom sheet for mode switcher
  const bottomSheetRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSheetChanges = useCallback((index) => {
    console.log('Profile bottom sheet index changed to:', index);
    if (index === -1) {
      setModalVisible(false);
    }
  }, []);

  const handleOpenModeSwitcher = useCallback(() => {
    setModalVisible(true);
    bottomSheetRef.current?.expand();
  }, []);

  const handleModeSwitch = (context) => {
    console.log('Mode switched from profile:', context);
    setModalVisible(false);
  };

  const getModeInfo = () => {
    const modeConfig = {
      client: {
        title: 'Cliente',
        icon: 'basket',
        description: 'Compra productos y recibe entregas',
        color: '#ef4444',
        gradient: ['#ef4444', '#dc2626']
      },
      business: {
        title: 'Negocio',
        icon: 'briefcase',
        description: 'Gestiona tu tienda y productos',
        color: '#10b981',
        gradient: ['#10b981', '#059669']
      },
      delivery: {
        title: 'Delivery',
        icon: 'bicycle',
        description: 'Entrega productos y gana dinero',
        color: '#f59e0b',
        gradient: ['#f59e0b', '#d97706']
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

  const SettingsItem = ({ icon, title, onPress, danger = false }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
      activeOpacity={0.7}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: danger ? '#fef2f2' : '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
      }}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? '#ef4444' : '#64748b'}
        />
      </View>
      <Text
        variant="body"
        style={{
          flex: 1,
          fontWeight: '500',
          color: danger ? '#ef4444' : '#1f2937'
        }}
      >
        {title}
      </Text>
      <Ionicons
        name="chevron-forward-outline"
        size={18}
        color="#9ca3af"
      />
    </TouchableOpacity>
  );

  const modeInfo = getModeInfo();

  return (
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: '#f8fafc' }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >

        {/* Hero Profile Section */}
        <View style={{
          background: `linear-gradient(135deg, ${modeInfo.gradient[0]} 0%, ${modeInfo.gradient[1]} 100%)`,
          backgroundColor: modeInfo.color,
          paddingTop: 32,
          paddingBottom: 40,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          shadowColor: modeInfo.color,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 24,
          elevation: 12
        }}>
          <View style={{ alignItems: 'center' }}>
            {/* Profile Picture with Status Ring */}
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              borderWidth: 4,
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}>
              <Text style={{
                color: '#ffffff',
                fontSize: 36,
                fontWeight: '700'
              }}>
                {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>

            <Text style={{
              color: '#ffffff',
              fontSize: 28,
              fontWeight: '700',
              marginBottom: 8,
              textAlign: 'center'
            }}>
              {user?.firstName} {user?.lastName}
            </Text>

            <Text style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 16,
              marginBottom: 16,
              textAlign: 'center'
            }}>
              {user?.email}
            </Text>

            {/* Active Mode Badge - Pressable */}
            <TouchableOpacity
              onPress={handleOpenModeSwitcher}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 1)',
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 3
              }}
              activeOpacity={0.8}
            >
              <Ionicons name={modeInfo.icon} size={16} color={modeInfo.color} style={{ marginRight: 8 }} />
              <Text style={{
                color: modeInfo.color,
                fontSize: 14,
                fontWeight: '600',
                marginRight: 8
              }}>
                {modeInfo.title}
              </Text>
              {/* Visual indicator that it's pressable */}
              <Ionicons name="chevron-down" size={14} color={modeInfo.color} opacity={0.7} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>

          {/* Quick Stats */}
          <View style={{
            flexDirection: 'row',
            marginBottom: 32,
            gap: 12
          }}>
            <View style={{
              flex: 1,
              backgroundColor: '#ffffff',
              borderRadius: 20,
              padding: 20,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4
            }}>
              <Ionicons name="time-outline" size={24} color="#10b981" style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                {(() => {
                  if (!user?.createdAt) return 0;

                  // Handle both Firestore Timestamp and regular date
                  let createdDate;
                  if (user.createdAt.toDate) {
                    // Firestore Timestamp
                    createdDate = user.createdAt.toDate();
                  } else if (user.createdAt.seconds) {
                    // Firestore Timestamp object
                    createdDate = new Date(user.createdAt.seconds * 1000);
                  } else {
                    // Regular date string or Date object
                    createdDate = new Date(user.createdAt);
                  }

                  const daysDiff = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
                  return isNaN(daysDiff) ? 0 : daysDiff;
                })()}
              </Text>
              <Text variant="caption" className="text-muted-foreground text-center">
                Días como miembro
              </Text>
            </View>

            <View style={{
              flex: 1,
              backgroundColor: '#ffffff',
              borderRadius: 20,
              padding: 20,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4
            }}>
              <Ionicons name="shield-checkmark" size={24} color="#3b82f6" style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                100%
              </Text>
              <Text variant="caption" className="text-muted-foreground text-center">
                Perfil completado
              </Text>
            </View>
          </View>


          {/* Settings Section */}
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: 20
            }}>
              Configuración
            </Text>

            <View>
              <SettingsItem
                icon="person-outline"
                title="Editar Perfil"
                onPress={() => console.log('Edit profile')}
              />
              <SettingsItem
                icon="notifications-outline"
                title="Notificaciones"
                onPress={() => console.log('Notifications')}
              />
              <SettingsItem
                icon="card-outline"
                title="Métodos de Pago"
                onPress={() => console.log('Payment methods')}
              />
              <SettingsItem
                icon="location-outline"
                title="Direcciones"
                onPress={() => console.log('Addresses')}
              />
              <SettingsItem
                icon="shield-outline"
                title="Privacidad y Seguridad"
                onPress={() => console.log('Privacy')}
              />
              <SettingsItem
                icon="help-circle-outline"
                title="Ayuda y Soporte"
                onPress={() => console.log('Help')}
              />
            </View>
          </View>

          {/* Danger Zone */}
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4
          }}>
            <SettingsItem
              icon="log-out-outline"
              title="Cerrar Sesión"
              onPress={handleLogout}
              danger={true}
            />
          </View>

        </View>
      </ScrollView>

      {/* Mode Switcher Bottom Sheet */}
      {modalVisible && (
        <ModeSwitcherModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onModeSwitch={handleModeSwitch}
        />
      )}
    </SafeAreaView>
  );
}