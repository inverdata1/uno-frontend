import React, { useState, useCallback, useRef } from 'react';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Button, Card, Text } from '../../shared/components/ui';
import { ModeSwitcher } from '../../shared/components/layout/mode-switcher';
import { ModeSwitcherModal } from '../../shared/components/layout/mode-switcher/mode-switcher-modal';
import { useAuthStore } from '../../auth/stores/auth-store';
import { useCurrentMode } from '../../shared/hooks/use-user-modes';
import { getUserTypeConfig } from '../../shared/config/user-types';
import { cn } from '../../shared/utils/cn';
import { seedStories } from '../../shared/api/stories/seeder';
import { seedPosts } from '../../shared/api/posts/seeder';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { currentMode, availableModes = [] } = useCurrentMode();

  // Bottom sheet for mode switcher
  const bottomSheetRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

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

  const getModeInfo = () => getUserTypeConfig(currentMode);

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

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      console.log('Seeding all data...');

      await seedStories();
      await seedPosts();

      Alert.alert('Success', 'Data seeded successfully!');
    } catch (error) {
      console.error('Seeding error:', error);
      Alert.alert('Error', 'Failed to seed data: ' + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const SettingsItem = ({ icon, title, subtitle, onPress, danger = false, highlight = false, showBorder = false }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: showBorder ? 1 : 0,
        borderBottomColor: '#f1f5f9',
      }}
      activeOpacity={0.7}
    >
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: danger ? '#fef2f2' : highlight ? '#f0f9ff' : '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
      }}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? '#ef4444' : highlight ? '#0ea5e9' : '#64748b'}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          variant="body"
          style={{
            fontWeight: '500',
            color: danger ? '#ef4444' : highlight ? '#0ea5e9' : '#1f2937',
            fontSize: 16
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 13,
              color: '#64748b',
              marginTop: 2
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <Ionicons
        name="chevron-forward-outline"
        size={16}
        color="#cbd5e0"
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
          backgroundColor: modeInfo.primary,
          paddingTop: 32,
          paddingBottom: 40,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          shadowColor: modeInfo.primary,
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

            {/* Active Mode Badge - Conditional Pressable */}
            {availableModes.length > 1 ? (
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
                <Ionicons name={modeInfo.icon} size={16} color={modeInfo.primary} style={{ marginRight: 8 }} />
                <Text style={{
                  color: modeInfo.primary,
                  fontSize: 14,
                  fontWeight: '600',
                  marginRight: 8
                }}>
                  {modeInfo.title}
                </Text>
                {/* Visual indicator that it's pressable */}
                <Ionicons name="chevron-down" size={14} color={modeInfo.primary} opacity={0.7} />
              </TouchableOpacity>
            ) : (
              /* Static mode badge when only one mode */
              <View style={{
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
              }}>
                <Ionicons name={modeInfo.icon} size={16} color={modeInfo.primary} style={{ marginRight: 8 }} />
                <Text style={{
                  color: modeInfo.primary,
                  fontSize: 14,
                  fontWeight: '600'
                }}>
                  {modeInfo.title}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>

          {/* Subtle Stats - Small badge */}
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

          {/* Essential Settings - Clean List */}
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
                onPress={() => console.log('Edit profile')}
                showBorder={true}
              />
              <SettingsItem
                icon="card-outline"
                title="Métodos de Pago"
                onPress={() => console.log('Payment methods')}
                showBorder={!availableModes.includes('business') && !availableModes.includes('delivery')}
              />

              {/* Business and Delivery Mode Options - Only show if not already active */}
              {!availableModes.includes('business') && (
                <SettingsItem
                  icon="briefcase-outline"
                  title="Vende con UNO"
                  onPress={() => console.log('Apply for business mode')}
                  showBorder={!availableModes.includes('delivery')}
                  highlight={true}
                />
              )}
              {!availableModes.includes('delivery') && (
                <SettingsItem
                  icon="bicycle-outline"
                  title="Entrega con UNO"
                  onPress={() => console.log('Apply for delivery mode')}
                  showBorder={false}
                  highlight={true}
                />
              )}
            </View>
          </View>

          {/* Secondary Options - Compact */}
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
                onPress={() => console.log('More options')}
                showBorder={false}
              />
            </View>
          </View>

          {/* Development Tools */}
          {__DEV__ && (
            <View style={{ marginBottom: 32 }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: 16,
                paddingHorizontal: 4
              }}>
                Desarrollo
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
                  icon="cloud-download-outline"
                  title={isSeeding ? "Cargando datos..." : "Seed Data"}
                  subtitle="Cargar historias, posts y videos de prueba"
                  onPress={handleSeedData}
                  highlight={true}
                  showBorder={false}
                />
              </View>
            </View>
          )}

          {/* Logout - Standalone */}
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

      {/* Mode Switcher Bottom Sheet - Only when user has multiple modes */}
      {modalVisible && availableModes.length > 1 && (
        <ModeSwitcherModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onModeSwitch={handleModeSwitch}
        />
      )}
    </SafeAreaView>
  );
}