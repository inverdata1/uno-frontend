import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../core/auth/stores/auth-store';
import BusinessUpgradeModal from '../businesses/business-upgrade-modal';
import { Text } from '../../../shared/components/ui';
import { getUserTypeConfig } from '../../../shared/config/user-types';
import { useCurrentUserType } from '../../../shared/hooks/use-user-type';
import { useAppStore } from '../../../shared/stores/app-store';
import { colors, getModeColors } from '../../../shared/utils/colors';

/**
 * Client Profile Screen
 * User profile for client mode
 */
export default function ClientProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { currentUserType, availableUserTypes = [] } = useCurrentUserType();
  const { openUserTypeSwitcher } = useAppStore();
  const [businessUpgradeModalVisible, setBusinessUpgradeModalVisible] = useState(false);

  const userTypeInfo = getUserTypeConfig(currentUserType);

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

  const clientColors = getModeColors('client');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <View style={{ position: 'relative', height: 200 }}>
          <LinearGradient
            colors={clientColors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: '100%', height: '100%' }}
          />

          {/* User Type Switcher Button - Top Left */}
          {availableUserTypes.length > 1 && (
            <TouchableOpacity
              onPress={handleOpenUserTypeSwitcher}
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Ionicons name={userTypeInfo.icon} size={18} color="#fff" />
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#fff'
              }}>
                {userTypeInfo.title}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Settings Button - Top Right */}
          <TouchableOpacity
            onPress={() => router.push('/client/profile/settings')}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name="settings" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={{
          backgroundColor: colors.bg.primary,
          marginTop: -40,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingTop: 24,
          paddingHorizontal: 20
        }}>
          {/* Avatar */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: clientColors.primary,
              borderWidth: 4,
              borderColor: colors.bg.primary,
              marginTop: -60,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8
            }}>
              <Text style={{
                fontSize: 40,
                fontWeight: '700',
                color: colors.text.inverse
              }}>
                {user?.firstName?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </Text>
            </View>
          </View>

          {/* Name & Verified Badge */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.text.primary,
              marginBottom: 4
            }}>
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}`.trim() : user?.displayName || user?.email?.split('@')[0] || 'Usuario'}
            </Text>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8
            }}>
              <Ionicons name="shield-checkmark" size={12} color="#3b82f6" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#3b82f6' }}>
                Verificado
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.bg.secondary,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            gap: 12
          }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: 2
              }}>
                {user?.ordersCount || 0}
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.text.secondary
              }}>
                Pedidos
              </Text>
            </View>

            <View style={{ width: 1, backgroundColor: colors.border.light }} />

            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: 2
              }}>
                {user?.favoriteStores?.length || 0}
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.text.secondary
              }}>
                Favoritos
              </Text>
            </View>

            <View style={{ width: 1, backgroundColor: colors.border.light }} />

            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: 2
              }}>
                {user?.reviewsCount || 0}
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.text.secondary
              }}>
                Reseñas
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{
            flexDirection: 'row',
            gap: 12,
            marginBottom: 24
          }}>
            <TouchableOpacity
              onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
              style={{
                flex: 1,
                backgroundColor: clientColors.primary,
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: clientColors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <Ionicons name="create" size={18} color={colors.text.inverse} />
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text.inverse
              }}>
                Editar Perfil
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
              style={{
                flex: 1,
                backgroundColor: colors.bg.secondary,
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderWidth: 1.5,
                borderColor: colors.border.light
              }}
            >
              <Ionicons name="share-social" size={18} color={colors.text.primary} />
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text.primary
              }}>
                Compartir
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            gap: 12
          }}>
            <TouchableOpacity
              onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.bg.primary,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="heart" size={20} color={clientColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 2
                }}>
                  Favoritos
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.text.secondary
                }}>
                  {user?.favoriteStores?.length || 0} tiendas guardadas
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: colors.border.light }} />

            <TouchableOpacity
              onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.bg.primary,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="location" size={20} color={clientColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 2
                }}>
                  Direcciones
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.text.secondary
                }}>
                  Gestiona tus direcciones
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: colors.border.light }} />

            <TouchableOpacity
              onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.bg.primary,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="card" size={20} color={clientColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 2
                }}>
                  Métodos de Pago
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.text.secondary
                }}>
                  Tarjetas y métodos guardados
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Upgrade Options - Only if not already enabled */}
          {(!availableUserTypes.includes('business') || !availableUserTypes.includes('delivery')) && (
            <View style={{
              backgroundColor: colors.bg.secondary,
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              gap: 12
            }}>
              {!availableUserTypes.includes('business') && (
                <>
                  <TouchableOpacity
                    onPress={() => setBusinessUpgradeModalVisible(true)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Ionicons name="briefcase" size={20} color="#f59e0b" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: colors.text.primary,
                        marginBottom: 2
                      }}>
                        Vende con UNO
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: colors.text.secondary
                      }}>
                        Crea tu negocio y empieza a vender
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#f59e0b" />
                  </TouchableOpacity>
                  {!availableUserTypes.includes('delivery') && (
                    <View style={{ height: 1, backgroundColor: colors.border.light }} />
                  )}
                </>
              )}

              {!availableUserTypes.includes('delivery') && (
                <TouchableOpacity
                  onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons name="bicycle" size={20} color="#22c55e" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.text.primary,
                      marginBottom: 2
                    }}>
                      Entrega con UNO
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: colors.text.secondary
                    }}>
                      Conviértete en repartidor
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#22c55e" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Logout */}
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 32
          }}>
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12
              }}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="log-out" size={20} color="#ef4444" />
              </View>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#ef4444',
                flex: 1
              }}>
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
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
