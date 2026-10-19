import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../shared/config/firebase';
import { uploadMedia } from '../../../shared/services/media-upload';
import { Text } from '../../../shared/components/ui';
import { apiClient } from '../../../shared/config/api-client';
import { useCurrentUserType } from '../../../shared/hooks/use-user-type';
import { useBusinessProfile, useUpdateBusinessLogo, useUpdateBusinessBanner, useUpdateBusinessProfile } from '../../../shared/hooks/use-business-profile';
import { useAppStore } from '../../../shared/stores/app-store';
import { colors } from '../../../shared/utils/colors';
import { getModeColors } from '../../../shared/utils/colors';
import { shareBusinessCatalog } from '../../../shared/utils/share-catalog';
import { EditProfileModal } from './components/edit-profile-modal';
import { BusinessProfileHeader } from '../../shared/business/business-profile-header';

export default function BusinessProfileScreen() {
  const router = useRouter();
  const { availableUserTypes = [] } = useCurrentUserType();
  const { openUserTypeSwitcher } = useAppStore();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const businessColors = getModeColors('business');

  // Get real business data
  const { business, businessData, stats, isLoading } = useBusinessProfile();
  const updateLogo = useUpdateBusinessLogo();
  const updateBanner = useUpdateBusinessBanner();
  const updateProfile = useUpdateBusinessProfile();

  const handleSaveProfile = async (data) => {
    try {
      await updateProfile.mutateAsync(data);
      setEditModalVisible(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  // Shares the public profile + catalog link (/c/[id]) that opens without an account
  const handleShare = () => {
    const bName = businessData?.businessName || businessData?.name || business?.businessName || business?.name;
    shareBusinessCatalog({ id: businessData?.id || business?.businessId || business?.id, name: bName });
  };

  // Debug logging
  React.useEffect(() => {
    console.log('🏢 Business Profile Data:', {
      business,
      businessData,
      stats
    });
  }, [business, businessData, stats]);



  const handlePickLogo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para subir el logo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploadingLogo(true);
        const asset = result.assets[0];
        
        const uploadResult = await uploadMedia(
          asset.uri,
          'BUSINESS_LOGO',
          {
            mimeType: asset.mimeType || asset.type,
            metadata: { businessId: business?.businessId || business?.id }
          },
          null, // onProgress
          { uid: business?.ownerId || 'unknown' } // pass context
        );

        await updateLogo.mutateAsync(uploadResult.url);
      }
    } catch (error) {
      console.error('Error picking logo:', error);
      Alert.alert('Error', 'No se pudo actualizar el logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handlePickBanner = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para subir el banner.');
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
            metadata: { businessId: business?.businessId || business?.id }
          },
          null, // onProgress
          { uid: business?.ownerId || 'unknown' } // pass context
        );

        await updateBanner.mutateAsync(uploadResult.url);
      }
    } catch (error) {
      console.error('Error picking banner:', error);
      Alert.alert('Error', 'No se pudo actualizar el banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator size="large" color={businessColors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BusinessProfileHeader
          business={{
            name: businessData?.businessName || businessData?.name || business?.businessName || business?.name || 'Mi Negocio',
            category: businessData?.category || businessData?.businessType || business?.businessType,
            isVerified: businessData?.isVerified,
            description: businessData?.description,
            logoUrl: businessData?.logoUrl || business?.logoUrl,
            bannerUrl: businessData?.bannerUrl || business?.bannerUrl,
            address: businessData?.address || business?.address,
            hours: businessData?.businessHours || business?.businessHours,
            phone: businessData?.phone || business?.phone,
          }}
          stats={[
            { label: 'seguidores', singular: 'seguidor', value: stats.followers },
            { label: 'productos', singular: 'producto', value: stats.products },
            { label: `(${stats.reviews})`, value: Number(stats.rating || 0).toFixed(1), icon: 'star' },
          ]}
          actions={[
            { label: 'Editar perfil', icon: 'create-outline', onPress: () => setEditModalVisible(true), primary: true },
            { label: 'Compartir', icon: 'share-social-outline', onPress: handleShare },
            { label: 'Configuración', icon: 'settings-outline', onPress: () => router.push('/business/profile/settings'), iconOnly: true },
          ]}
          edit={{
            onEditLogo: handlePickLogo,
            onEditCover: handlePickBanner,
            uploadingLogo,
            uploadingCover: uploadingBanner,
          }}
        />

        <View style={{ backgroundColor: colors.bg.primary, paddingHorizontal: 20, paddingTop: 16 }}>
          {/* Content Area - Reviews Only */}
          <View style={{ paddingBottom: 32 }}>
            <View style={{
              backgroundColor: colors.bg.secondary,
              borderRadius: 16,
              padding: 40,
              alignItems: 'center'
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.bg.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <Ionicons name="star-outline" size={40} color={colors.text.secondary} />
              </View>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: 8,
                textAlign: 'center'
              }}>
                Sin reseñas
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.text.secondary,
                textAlign: 'center'
              }}>
                Las reseñas de tus clientes aparecerán aquí
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        businessData={businessData || business}
        onSave={handleSaveProfile}
        isSaving={updateProfile.isPending}
      />
    </SafeAreaView>
  );
}
