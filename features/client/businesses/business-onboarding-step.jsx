import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Input, MapPicker, Text } from '../../../shared/components/ui';
import { PhoneInput } from '../../../shared/components/ui/phone-input';

/**
 * Business Onboarding Step
 * Collects business-specific information during registration
 * Used in both: initial signup flow and "Vende con UNO" flow
 */
export default function BusinessOnboardingStep({
  businessData = {},
  onBusinessDataChange,
  scrollViewRef
}) {
  const [formData, setFormData] = useState({
    businessName: businessData.businessName || '',
    category: businessData.category || '',
    description: businessData.description || '',
    address: businessData.address || '',
    coordinates: businessData.coordinates || null,
    phone: businessData.phone || '',
    logoUri: businessData.logoUri || null,
    logoMimeType: businessData.logoMimeType || null,
    bannerUri: businessData.bannerUri || null,
    bannerMimeType: businessData.bannerMimeType || null,
  });

  const updateField = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onBusinessDataChange?.(newData);
  };

  const handlePickLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        presentationStyle: 'fullScreen',
      });

      if (!result.canceled && result.assets[0]) {
        updateField('logoUri', result.assets[0].uri);
        updateField('logoMimeType', result.assets[0].mimeType || result.assets[0].type);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Intenta nuevamente.');
      console.error('Logo picker error:', error);
    }
  };

  const handlePickBanner = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 1],
        quality: 0.8,
        presentationStyle: 'fullScreen',
      });

      if (!result.canceled && result.assets[0]) {
        updateField('bannerUri', result.assets[0].uri);
        updateField('bannerMimeType', result.assets[0].mimeType || result.assets[0].type);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Intenta nuevamente.');
      console.error('Banner picker error:', error);
    }
  };

  // Business categories
  const categories = [
    { id: 'restaurant', label: 'Restaurante', icon: 'restaurant' },
    { id: 'store', label: 'Tienda', icon: 'storefront' },
    { id: 'pharmacy', label: 'Farmacia', icon: 'medical' },
    { id: 'market', label: 'Mercado', icon: 'cart' },
    { id: 'bakery', label: 'Panadería', icon: 'cafe' },
    { id: 'technology', label: 'Tecnología', icon: 'phone-portrait' },
    { id: 'other', label: 'Otro', icon: 'ellipsis-horizontal' },
  ];

  return (
    <View>
      <Text variant="subheading" className="mb-4 text-center">
        Información del Negocio
      </Text>

      {/* Business Name */}
      <Input
        value={formData.businessName}
        onChangeText={(value) => updateField('businessName', value)}
        placeholder="Nombre del negocio"
        autoCapitalize="words"
      />

      {/* Category Selection */}
      <View className="mb-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text variant="body" className="text-gray-500 font-medium">
            Categoría
          </Text>
          <View className="flex-row items-center">
            <Text variant="caption" className="text-gray-400 mr-1">
              Desliza
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#9ca3af" />
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => updateField('category', cat.id)}
              className="flex-row items-center rounded-full px-4 py-2.5 mr-2"
              style={{
                backgroundColor: formData.category === cat.id ? '#ef4444' : '#f9fafb',
                borderWidth: 1,
                borderColor: formData.category === cat.id ? '#ef4444' : '#9ca3af',
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={cat.icon}
                size={16}
                color={formData.category === cat.id ? '#ffffff' : '#6b7280'}
              />
              <Text
                className="ml-1.5 text-sm font-medium"
                style={{ color: formData.category === cat.id ? '#ffffff' : '#6b7280' }}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Description */}
      <Input
        value={formData.description}
        onChangeText={(value) => updateField('description', value)}
        placeholder="Descripción (opcional)"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        style={{ minHeight: 80 }}
      />

      {/* Address */}
      <Input
        value={formData.address}
        onChangeText={(value) => updateField('address', value)}
        placeholder="Dirección del negocio"
        autoCapitalize="words"
      />

      {/* Phone */}
      <PhoneInput
        value={formData.phone}
        onChangeText={(value) => updateField('phone', value)}
      />

      {/* Map Location Picker - Optional */}
      <View className="mb-3">
        <Text variant="body" className="text-gray-500 font-medium mb-2">
          Ubicación (opcional)
        </Text>
        <MapPicker
          height={250}
          initialLocation={businessData.coordinates}
          onLocationSelect={(location) => updateField('coordinates', location)}
          onAddressDetected={(address) => updateField('address', address)}
          className="border border-gray-400 rounded-xl"
        />
      </View>

      {/* Image Uploads - Optional */}
      <View className="mb-3">
        {/* Logo */}
        <TouchableOpacity
          onPress={handlePickLogo}
          className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-3 border border-gray-400"
          activeOpacity={0.7}
        >
          <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center mr-3">
            {formData.logoUri ? (
              <Image
                source={{ uri: formData.logoUri }}
                style={{ width: 56, height: 56, borderRadius: 28 }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="image-outline" size={24} color="#9ca3af" />
            )}
          </View>
          <View className="flex-1">
            <Text variant="body" className="font-medium mb-1">
              Logo del negocio
            </Text>
            <Text variant="caption" className="text-gray-500">
              {formData.logoUri ? 'Toca para cambiar' : 'Opcional'}
            </Text>
          </View>
          <Ionicons name="camera-outline" size={20} color="#6b7280" />
        </TouchableOpacity>

        {/* Banner */}
        <TouchableOpacity
          onPress={handlePickBanner}
          className="bg-gray-50 rounded-xl border border-gray-400 overflow-hidden mb-3"
          activeOpacity={0.7}
          style={{ height: 100 }}
        >
          {formData.bannerUri ? (
            <Image
              source={{ uri: formData.bannerUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="image-outline" size={32} color="#9ca3af" />
              <Text variant="caption" className="text-gray-500 mt-2">
                Banner del negocio (opcional)
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Validation function to check if business data is complete
 */
export const isBusinessDataValid = (businessData) => {
  if (!businessData) return false;

  const requiredFields = [
    'businessName',
    'category',
    'address',
    'phone'
  ];

  return requiredFields.every(field => {
    const value = businessData[field];
    return value && value.trim && value.trim().length > 0;
  });
};
