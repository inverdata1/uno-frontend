import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../../core/auth/stores/auth-store';
import BusinessUpgradeModal from '../businesses/business-upgrade-modal';
import { BusinessProfileHeader } from '../../shared/business/business-profile-header';
import { EditPersonalInfoModal } from '../../business/profile/components/edit-personal-info-modal';
import { Text } from '../../../shared/components/ui';
import { getUserTypeConfig } from '../../../shared/config/user-types';
import { useCurrentUserType } from '../../../shared/hooks/use-user-type';
import { useUserProfile, useUpdateUserProfile } from '../../../shared/hooks/use-user-profile';
import { useFollowingBusinesses } from '../../shared/social/hooks/use-businesses';
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
  const { data: followedBusinesses = [] } = useFollowingBusinesses(user?.id);
  const updateUserProfile = useUpdateUserProfile();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const avatarUrl = profileData?.avatarUrl || user?.avatarUrl || user?.photoUrl;
  const bannerUrl = profileData?.bannerUrl || user?.bannerUrl || user?.coverImageUrl;

  const userTypeInfo = getUserTypeConfig(currentUserType);
  const [editInfoVisible, setEditInfoVisible] = useState(false);
  const displayName =
    [profileData?.firstName || user?.firstName, profileData?.lastName || user?.lastName].filter(Boolean).join(' ') ||
    profileData?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Usuario';

  const handleSavePersonalInfo = async (data) => {
    try {
      await updateUserProfile.mutateAsync(data);
      setEditInfoVisible(false);
      Alert.alert('Listo', 'Tu información se actualizó');
    } catch (error) {
      console.error('Error updating personal info:', error);
      Alert.alert('Error', 'No se pudo actualizar la información');
    }
  };

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BusinessProfileHeader
          business={{
            name: displayName,
            logoUrl: avatarUrl,
            bannerUrl,
          }}
          stats={[
            { label: 'pedidos', singular: 'pedido', value: profileData?.ordersCount ?? user?.ordersCount ?? 0, onPress: () => router.push('/client/orders') },
            {
              label: 'favoritos',
              singular: 'favorito',
              value: profileData?.favoritesCount ?? profileData?.favoriteStores?.length ?? user?.favoriteStores?.length ?? 0,
              onPress: () => router.push('/client/favorites'),
            },
            { label: 'seguidos', singular: 'seguido', value: profileData?.followingCount ?? followedBusinesses.length, onPress: () => router.push('/client/following') },
          ]}
          actions={[
            { label: 'Editar perfil', icon: 'create-outline', onPress: () => setEditInfoVisible(true), primary: true },
            { label: 'Configuración', icon: 'settings-outline', onPress: () => router.push('/client/profile/settings'), iconOnly: true },
          ]}
          edit={{
            onEditLogo: handlePickAvatar,
            onEditCover: handlePickBanner,
            uploadingLogo: uploadingAvatar,
            uploadingCover: uploadingBanner,
          }}
          details={[
            { icon: 'mail-outline', value: profileData?.email || user?.email },
            { icon: 'call-outline', value: profileData?.phone || user?.phone },
            {
              icon: 'calendar-outline',
              label: 'Miembro desde',
              value: (profileData?.createdAt || user?.createdAt)
                ? new Date(profileData?.createdAt || user?.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                : null,
            },
          ]}
          coverOverlay={
            availableUserTypes.length > 1 ? (
              <TouchableOpacity
                onPress={handleOpenUserTypeSwitcher}
                style={{
                  position: 'absolute', top: 16, left: 16, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)', flexDirection: 'row', alignItems: 'center', gap: 8,
                }}
              >
                <Ionicons name={userTypeInfo.icon} size={18} color="#fff" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>{userTypeInfo.title}</Text>
                <Ionicons name="chevron-down" size={16} color="#fff" />
              </TouchableOpacity>
            ) : null
          }
        />

        <View style={{ backgroundColor: colors.bg.primary, paddingTop: 16, paddingHorizontal: 20 }}>
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
              onPress={() => router.push('/client/favorites')}
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
                  Publicaciones y productos guardados
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: colors.border.light }} />

            {/* Negocios Seguidos */}
            <TouchableOpacity
              onPress={() => router.push('/client/following')}
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
      <EditPersonalInfoModal
        visible={editInfoVisible}
        onClose={() => setEditInfoVisible(false)}
        userData={profileData || user}
        onSave={handleSavePersonalInfo}
        isSaving={updateUserProfile.isPending}
      />
    </SafeAreaView>
  );
}
