import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from '../../../shared/components/ui';

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
    phone: businessData.phone || '',
    logoUrl: businessData.logoUrl || null,
    bannerUrl: businessData.bannerUrl || null,
  });

  const updateField = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onBusinessDataChange?.(newData);
  };

  // Business categories
  const categories = [
    { id: 'restaurant', label: 'Restaurante', icon: 'restaurant' },
    { id: 'store', label: 'Tienda', icon: 'storefront' },
    { id: 'pharmacy', label: 'Farmacia', icon: 'medical' },
    { id: 'market', label: 'Mercado', icon: 'cart' },
    { id: 'bakery', label: 'Panadería', icon: 'cafe' },
    { id: 'other', label: 'Otro', icon: 'ellipsis-horizontal' },
  ];

  return (
    <View>
      <Text className="text-lg font-bold text-gray-900 mb-2">
        Información del Negocio
      </Text>
      <Text className="text-sm text-gray-600 mb-6">
        Completa los datos de tu negocio
      </Text>

      {/* Business Name */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Nombre del Negocio *
        </Text>
        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
          <Ionicons name="storefront-outline" size={20} color="#9ca3af" />
          <TextInput
            value={formData.businessName}
            onChangeText={(value) => updateField('businessName', value)}
            placeholder="Ej: Panadería La Esquina"
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-3 text-base text-gray-900"
          />
        </View>
      </View>

      {/* Category Selection */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-3">
          Categoría *
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => updateField('category', cat.id)}
              className="flex-row items-center rounded-xl px-4 py-3"
              style={{
                backgroundColor: formData.category === cat.id ? '#ef4444' : '#f9fafb',
                borderWidth: 1,
                borderColor: formData.category === cat.id ? '#ef4444' : '#e5e7eb',
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={cat.icon}
                size={18}
                color={formData.category === cat.id ? '#ffffff' : '#6b7280'}
              />
              <Text
                className="ml-2 text-sm font-semibold"
                style={{ color: formData.category === cat.id ? '#ffffff' : '#6b7280' }}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Descripción
        </Text>
        <View className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
          <TextInput
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Describe tu negocio..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="text-base text-gray-900"
            style={{ minHeight: 80 }}
          />
        </View>
        <Text className="text-xs text-gray-500 mt-1">
          Opcional - Ayuda a los clientes a conocer tu negocio
        </Text>
      </View>

      {/* Address */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Dirección del Negocio *
        </Text>
        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
          <Ionicons name="location-outline" size={20} color="#9ca3af" />
          <TextInput
            value={formData.address}
            onChangeText={(value) => updateField('address', value)}
            placeholder="Dirección completa"
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-3 text-base text-gray-900"
          />
        </View>
      </View>

      {/* Phone */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Teléfono del Negocio *
        </Text>
        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
          <Ionicons name="call-outline" size={20} color="#9ca3af" />
          <TextInput
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            placeholder="04XX-XXXXXXX"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            className="flex-1 ml-3 text-base text-gray-900"
          />
        </View>
      </View>

      {/* Image Uploads - Optional */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-3">
          Imágenes (Opcional)
        </Text>

        {/* Logo */}
        <TouchableOpacity
          onPress={() => {
            // TODO: Implement image picker
            console.log('Pick logo image');
          }}
          className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-3 border border-dashed border-gray-300"
          activeOpacity={0.7}
        >
          <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mr-3">
            {formData.logoUrl ? (
              <Image
                source={{ uri: formData.logoUrl }}
                style={{ width: 64, height: 64, borderRadius: 32 }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="image-outline" size={28} color="#9ca3af" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-900 mb-1">
              Logo del Negocio
            </Text>
            <Text className="text-xs text-gray-500">
              Toca para {formData.logoUrl ? 'cambiar' : 'agregar'}
            </Text>
          </View>
          <Ionicons name="camera-outline" size={24} color="#6b7280" />
        </TouchableOpacity>

        {/* Banner */}
        <TouchableOpacity
          onPress={() => {
            // TODO: Implement image picker
            console.log('Pick banner image');
          }}
          className="bg-gray-50 rounded-xl border border-dashed border-gray-300 overflow-hidden"
          activeOpacity={0.7}
          style={{ height: 120 }}
        >
          {formData.bannerUrl ? (
            <Image
              source={{ uri: formData.bannerUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="image-outline" size={40} color="#9ca3af" />
              <Text className="text-sm text-gray-500 mt-2">
                Banner del Negocio
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Info Note */}
      <View className="bg-blue-50 rounded-xl p-4 flex-row">
        <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ marginTop: 2 }} />
        <View className="flex-1 ml-3">
          <Text className="text-sm text-blue-900 font-semibold mb-1">
            Podrás editar esta información más tarde
          </Text>
          <Text className="text-xs text-blue-700">
            Después de crear tu cuenta, podrás actualizar todos estos datos desde tu panel de negocio.
          </Text>
        </View>
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
