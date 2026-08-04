import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../../core/auth/stores/auth-store';
import BusinessUpgradeModal from '../businesses/business-upgrade-modal';
import { Text } from '../../../shared/components/ui';
import { getUserTypeConfig } from '../../../shared/config/user-types';
import { useCurrentUserType } from '../../../shared/hooks/use-user-type';
import { useUserProfile, useUpdateUserProfile } from '../../../shared/hooks/use-user-profile';
import { uploadMedia } from '../../../shared/services/media-upload';
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

  const { data: profileData } = useUserProfile();
  const updateUserProfile = useUpdateUserProfile();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const avatarUrl = profileData?.avatarUrl || user?.avatarUrl || user?.photoUrl;
  const bannerUrl = profileData?.bannerUrl || user?.bannerUrl || user?.coverImageUrl;

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

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar tu foto de perfil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploadingAvatar(true);
        const asset = result.assets[0];

        const uploadResult = await uploadMedia(
          asset.uri,
          'PROFILE_IMAGE',
          {
            mimeType: asset.mimeType || asset.type,
            metadata: { userId: user?.id }
          },
          null,
          { uid: user?.id }
        );

        await updateUserProfile.mutateAsync({ avatarUrl: uploadResult.url });
      }
    } catch (error) {
      console.error('Error picking avatar:', error);
      Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePickBanner = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar tu banner.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploadingBanner(true);
        const asset = result.assets[0];

        const uploadResult = await uploadMedia(
          asset.uri,
          'BUSINESS_BANNER',
          {
            mimeType: asset.mimeType || asset.type,
            metadata: { userId: user?.id }
          },
          null,
          { uid: user?.id }
        );

        await updateUserProfile.mutateAsync({ bannerUrl: uploadResult.url });
      }
    } catch (error) {
      console.error('Error picking banner:', error);
      Alert.alert('Error', 'No se pudo actualizar el banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const clientColors = getModeColors('client');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <View style={{ position: 'relative', height: 200 }}>
          {bannerUrl ? (
            <Image
              source={{ uri: bannerUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={clientColors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: '100%', height: '100%' }}
            />
          )}

          {/* Edit Banner Button */}
          <TouchableOpacity
            onPress={handlePickBanner}
            disabled={uploadingBanner}
            style={{
              position: 'absolute',
              bottom: 56,
              right: 16,
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            {uploadingBanner ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera" size={20} color="#fff" />
            )}
          </TouchableOpacity>

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
              position: 'relative',
              marginTop: -60,
            }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: clientColors.primary,
                borderWidth: 4,
                borderColor: colors.bg.primary,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 8,
                overflow: 'hidden'
              }}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{
                    fontSize: 40,
                    fontWeight: '700',
                    color: colors.text.inverse
                  }}>
                    {user?.firstName?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </Text>
                )}
              </View>

              {/* Edit Avatar Button */}
              <TouchableOpacity
                onPress={handlePickAvatar}
                disabled={uploadingAvatar}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#ef4444',
                  borderWidth: 3,
                  borderColor: colors.bg.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                  zIndex: 10
                }}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={16} color="#fff" />
                )}
              </TouchableOpacity>
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
                {user?.followingCount || user?.followsCount || 0}
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.text.secondary
              }}>
                Seguidos
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
          </View>

          {/* Quick Actions */}
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            gap: 12
          }}>
            {/* Mis Pedidos */}
            <TouchableOpacity
              onPress={() => router.push('/client/orders')}
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
                <Ionicons name="receipt" size={20} color={clientColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 2
                }}>
                  Mis Pedidos
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: colors.text.secondary
                }}>
                  Historial y estado de tus compras
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: colors.border.light }} />

            {/* Favoritos */}
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
                  fontSize: 13,
                  color: colors.text.secondary
                }}>
                  {user?.favoriteStores?.length || 0} tiendas guardadas
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: colors.border.light }} />

            {/* Seguidos */}
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
                <Ionicons name="storefront" size={20} color={clientColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 2
                }}>
                  Negocios Seguidos
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: colors.text.secondary
                }}>
                  Tiendas y marcas que sigues
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Account Verification Card */}
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
          }}>
            <TouchableOpacity
              onPress={() => Alert.alert('Verificación de Cuenta', 'La función de verificación de identidad estará disponible próximamente para brindarte mayor seguridad.')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 2
                }}>
                  Verifica tu cuenta
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: colors.text.secondary
                }}>
                  Obtén tu insignia de verificación e identidad
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {/* Advanced Settings */}
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 32
          }}>
            <TouchableOpacity
              onPress={() => router.push('/client/profile/settings')}
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
                backgroundColor: colors.bg.primary,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="settings" size={20} color={colors.text.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 2
                }}>
                  Configuración Avanzada
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: colors.text.secondary
                }}>
                  Seguridad, notificaciones y cuenta
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
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
