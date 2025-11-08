import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text, Button } from '../../../shared/components/ui';
import BusinessOnboardingStep, { isBusinessDataValid } from './business-onboarding-step';
import { useAuthStore } from '../../../core/auth/stores/auth-store';
import { apiClient } from '../../../shared/config/api-client';
import { uploadMedia } from '../../../shared/services/media-upload';

/**
 * Business Upgrade Modal
 * Allows existing client users to upgrade to business mode
 */
export default function BusinessUpgradeModal({ visible, onClose, onSuccess }) {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();
  const [businessData, setBusinessData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Info, 2: Confirmation

  const handleSubmit = async () => {
    if (!isBusinessDataValid(businessData)) {
      Alert.alert('Datos incompletos', 'Por favor completa todos los campos requeridos');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Upload images if provided
      let logoUrl = null;
      let bannerUrl = null;

      if (businessData.logoUri) {
        console.log('Uploading business logo...');
        const logoResult = await uploadMedia(businessData.logoUri, 'BUSINESS_LOGO');
        logoUrl = logoResult.url;
        console.log('Logo uploaded:', logoUrl);
      }

      if (businessData.bannerUri) {
        console.log('Uploading business banner...');
        const bannerResult = await uploadMedia(businessData.bannerUri, 'BUSINESS_BANNER');
        bannerUrl = bannerResult.url;
        console.log('Banner uploaded:', bannerUrl);
      }

      // 2. Create business profile
      const business = await apiClient.post('/businesses', {
        businessName: businessData.businessName,
        category: businessData.category,
        description: businessData.description || '',
        address: businessData.address,
        coordinates: businessData.coordinates || null,
        phone: businessData.phone,
        logoUrl: logoUrl,
        bannerUrl: bannerUrl,
      }, { params: { userId: user.uid } });

      console.log('Business profile created:', business.data.id);

      // 3. Enable business user type
      await apiClient.post('/users/enable-user-type', {
        userType: 'business',
        status: 'active'
      }, { params: { userId: user.uid } });

      // 4. Update user with business ID and switch to business mode
      await apiClient.put('/users/profile', {
        currentBusinessId: business.data.id
      }, { params: { userId: user.uid } });

      // 5. Switch to business user type
      await apiClient.post('/users/switch-user-type', {
        userType: 'business',
        businessId: business.data.id
      }, { params: { userId: user.uid } });

      // Refresh user data to reflect changes
      await refreshUser();

      // Navigate to business interface
      router.replace('/business/(tabs)');

      // Close modal and call success callback
      handleClose();
      onSuccess?.();

      // Show success message after navigation
      setTimeout(() => {
        Alert.alert(
          'Cuenta creada',
          'Tu cuenta de negocio ha sido creada exitosamente'
        );
      }, 500);
    } catch (error) {
      console.error('Error creating business:', error);
      Alert.alert(
        'Error',
        'No se pudo crear tu cuenta de negocio. Intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setBusinessData({});
    onClose();
  };

  const canProceed = () => {
    if (step === 1) {
      return isBusinessDataValid(businessData);
    }
    return true;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        {/* Header */}
        <View className="bg-primary-500 pb-6 px-6">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={handleClose}
              disabled={isLoading}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-white">
              Vende con UNO
            </Text>
            <View className="w-10" />
          </View>

          {/* Progress Bar */}
          <View className="flex-row mb-2">
            {[1, 2].map((i) => (
              <View key={i} className="flex-1 mx-1">
                <View
                  className={`h-2 rounded-full ${
                    i <= step ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              </View>
            ))}
          </View>
          <Text className="text-white/80 text-sm text-center">
            Paso {step} de 2
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && (
            <BusinessOnboardingStep
              businessData={businessData}
              onBusinessDataChange={setBusinessData}
            />
          )}

          {step === 2 && (
            <View>
              <Text className="text-lg font-bold text-gray-900 mb-2">
                Confirmar Información
              </Text>
              <Text className="text-sm text-gray-600 mb-6">
                Verifica que todos los datos sean correctos
              </Text>

              {/* Business Info Summary */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <InfoRow icon="storefront" label="Nombre" value={businessData.businessName} />
                <InfoRow icon="pricetag" label="Categoría" value={getCategoryLabel(businessData.category)} />
                {businessData.description && (
                  <InfoRow icon="document-text" label="Descripción" value={businessData.description} />
                )}
                <InfoRow icon="location" label="Dirección" value={businessData.address} />
                <InfoRow icon="call" label="Teléfono" value={businessData.phone} showBorder={false} />
              </View>

              {/* Info Note */}
              <View className="bg-blue-50 rounded-xl p-4 flex-row">
                <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ marginTop: 2 }} />
                <View className="flex-1 ml-3">
                  <Text className="text-sm text-blue-900 font-semibold mb-1">
                    Tu cuenta de cliente seguirá activa
                  </Text>
                  <Text className="text-xs text-blue-700">
                    Podrás cambiar entre modo cliente y modo negocio desde tu perfil en cualquier momento.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Buttons */}
        <View className="border-t border-gray-200 px-6 py-4">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onPress={() => {
              if (step === 1) {
                setStep(2);
              } else {
                handleSubmit();
              }
            }}
            disabled={!canProceed() || isLoading}
          >
            {isLoading ? 'Creando cuenta...' : step === 1 ? 'Continuar' : 'Crear Cuenta'}
          </Button>

          {step > 1 && (
            <Button
              variant="outline"
              size="md"
              className="w-full mt-3"
              onPress={() => setStep(step - 1)}
              disabled={isLoading}
            >
              Atrás
            </Button>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// Helper component for info display
function InfoRow({ icon, label, value, showBorder = true }) {
  return (
    <View
      className={`py-3 ${showBorder ? 'border-b border-gray-200' : ''}`}
    >
      <View className="flex-row items-center mb-1">
        <Ionicons name={icon} size={16} color="#6b7280" />
        <Text className="text-xs text-gray-500 ml-2">
          {label}
        </Text>
      </View>
      <Text className="text-sm text-gray-900 ml-6">
        {value}
      </Text>
    </View>
  );
}

// Helper to get category label
function getCategoryLabel(categoryId) {
  const categories = {
    restaurant: 'Restaurante',
    store: 'Tienda',
    pharmacy: 'Farmacia',
    market: 'Mercado',
    bakery: 'Panadería',
    technology: 'Tecnología',
    other: 'Otro',
  };
  return categories[categoryId] || categoryId;
}
