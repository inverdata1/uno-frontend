import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../shared/config/firebase';
import { Text } from '../../../shared/components/ui';
import { apiClient } from '../../../shared/config/api-client';
import { useCurrentUserType } from '../../../shared/hooks/use-user-type';
import { useBusinessProfile, useUpdateBusinessLogo, useUpdateBusinessBanner, useUpdateBusinessProfile } from '../../../shared/hooks/use-business-profile';
import { useAppStore } from '../../../shared/stores/app-store';
import { colors } from '../../../shared/utils/colors';
import { getModeColors } from '../../../shared/utils/colors';
import { ProductsGrid } from '../products/components/products-grid';
import { PostsGrid } from '../social/posts/components/posts-grid';
import { EditProfileModal } from './components/edit-profile-modal';

export default function BusinessProfileScreen() {
  const router = useRouter();
  const { availableUserTypes = [] } = useCurrentUserType();
  const { openUserTypeSwitcher } = useAppStore();
  const [activeTab, setActiveTab] = useState('posts');
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

  const handleShare = async () => {
    try {
      const bName = businessData?.businessName || businessData?.name || business?.businessName || business?.name || 'este negocio';
      await Share.share({
        message: `¡Mira ${bName} en UNO Delivery! Te invito a visitar su perfil y descubrir todo lo que ofrecen.`,
        title: `Visita ${bName} en UNO`
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  // Debug logging
  React.useEffect(() => {
    console.log('🏢 Business Profile Data:', {
      business,
      businessData,
      stats
    });
  }, [business, businessData, stats]);

  const uploadImageWithFallback = async (asset, imageType) => {
    const imageUri = asset.uri;
    try {
      // 1. Try Firebase first
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const ext = asset.name?.split('.').pop() || 'jpg';
      const filename = `businesses/${business?.businessId || business?.id || 'unknown'}/${imageType}_${Date.now()}.${ext}`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.warn('Firebase upload failed, attempting local backend fallback...', err);
      
      // 2. Fallback to local backend
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: asset.name || `image_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg'
      });
      formData.append('productName', imageType);
      if (business?.businessId || business?.id) {
        formData.append('businessId', business?.businessId || business?.id);
      }

      const uploadRes = await apiClient.post('/upload/image', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        }
      });

      if (uploadRes.data?.url) {
        const backendUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:3000';
        return `${backendUrl}${uploadRes.data.url}`;
      } else {
        throw new Error('No URL returned from upload');
      }
    }
  };

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
        const uploadedUrl = await uploadImageWithFallback(asset, 'logo');
        await updateLogo.mutateAsync(uploadedUrl);
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
        const uploadedUrl = await uploadImageWithFallback(asset, 'banner');
        await updateBanner.mutateAsync(uploadedUrl);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <View style={{ position: 'relative', height: 200 }}>
          {businessData?.bannerUrl || business?.bannerUrl ? (
            <Image
              source={{ uri: businessData?.bannerUrl || business?.bannerUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={businessColors.gradient}
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

          {/* Settings Button - Top Right */}
          <TouchableOpacity
            onPress={() => router.push('/business/profile/settings')}
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
          {/* Logo/Avatar */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 24,
              backgroundColor: businessColors.primary,
              borderWidth: 4,
              borderColor: colors.bg.primary,
              marginTop: -60,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
              overflow: 'hidden'
            }}>
              {businessData?.logoUrl || business?.logoUrl ? (
                <Image
                  source={{ uri: businessData?.logoUrl || business?.logoUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Text style={{
                  fontSize: 40,
                  fontWeight: '700',
                  color: colors.text.inverse
                }}>
                  {(businessData?.businessName || businessData?.name || business?.businessName || business?.name || 'N').charAt(0)}
                </Text>
              )}
            </View>

            {/* Edit Logo Button */}
            <TouchableOpacity
              onPress={handlePickLogo}
              disabled={uploadingLogo}
              style={{
                position: 'absolute',
                bottom: -8,
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: businessColors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: colors.bg.primary
              }}
            >
              {uploadingLogo ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <Ionicons name="camera" size={16} color={colors.text.inverse} />
              )}
            </TouchableOpacity>
          </View>

          {/* Business Name & Type */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.text.primary,
              marginBottom: 4
            }}>
              {businessData?.businessName || businessData?.name || business?.businessName || business?.name || 'Mi Negocio'}
            </Text>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8
            }}>
              <View style={{
                backgroundColor: businessColors.background,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: businessColors.primary + '40'
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: businessColors.primary
                }}>
                  {businessData?.businessType || businessData?.type || business?.businessType || business?.type || 'Restaurante'}
                </Text>
              </View>

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
                {stats.followers}
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.text.secondary
              }}>
                Seguidores
              </Text>
            </View>

            <View style={{ width: 1, backgroundColor: colors.border.light }} />

            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                marginBottom: 2
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: colors.text.primary
                }}>
                  {stats.rating}
                </Text>
                <Ionicons name="star" size={16} color="#f59e0b" />
              </View>
              <Text style={{
                fontSize: 12,
                color: colors.text.secondary
              }}>
                {stats.reviews} reseñas
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
                {stats.products}
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.text.secondary
              }}>
                Productos
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
              onPress={() => setEditModalVisible(true)}
              style={{
                flex: 1,
                backgroundColor: businessColors.primary,
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: businessColors.primary,
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
              onPress={handleShare}
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

          {/* Business Info */}
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            gap: 12
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.bg.primary,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="location" size={20} color={businessColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 2
                }}>
                  Dirección
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.text.secondary
                }}>
                  {businessData?.address || business?.address || 'No especificada'}
                </Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: colors.border.light }} />

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.bg.primary,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="time" size={20} color={businessColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 2
                }}>
                  Horario
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.text.secondary
                }}>
                  {businessData?.businessHours || business?.businessHours || 'Lun - Dom: 9:00 AM - 10:00 PM'}
                </Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: colors.border.light }} />

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.bg.primary,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="call" size={20} color={businessColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 2
                }}>
                  Teléfono
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.text.secondary
                }}>
                  {businessData?.phone || business?.phone || 'No especificado'}
                </Text>
              </View>
            </View>
          </View>

          {/* Content Tabs */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.bg.secondary,
            borderRadius: 12,
            padding: 4,
            marginBottom: 20
          }}>
            <TouchableOpacity
              onPress={() => setActiveTab('posts')}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: activeTab === 'posts' ? colors.bg.primary : 'transparent',
                alignItems: 'center'
              }}
            >
              <Ionicons
                name={activeTab === 'posts' ? 'grid' : 'grid-outline'}
                size={20}
                color={activeTab === 'posts' ? colors.text.primary : colors.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('products')}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: activeTab === 'products' ? colors.bg.primary : 'transparent',
                alignItems: 'center'
              }}
            >
              <Ionicons
                name={activeTab === 'products' ? 'cube' : 'cube-outline'}
                size={20}
                color={activeTab === 'products' ? colors.text.primary : colors.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('reviews')}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: activeTab === 'reviews' ? colors.bg.primary : 'transparent',
                alignItems: 'center'
              }}
            >
              <Ionicons
                name={activeTab === 'reviews' ? 'star' : 'star-outline'}
                size={20}
                color={activeTab === 'reviews' ? colors.text.primary : colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <View style={{ paddingBottom: 32 }}>
            {activeTab === 'posts' && (
              <PostsGrid onCreatePost={() => router.push('/business/social')} />
            )}

            {activeTab === 'products' && (
              <ProductsGrid />
            )}

            {activeTab === 'reviews' && (
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
            )}
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
