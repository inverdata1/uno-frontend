import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, TouchableOpacity, View, ScrollView } from 'react-native';
import { Text, Input } from '../../../shared/components/ui';
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

      {/* Image Uploads - Optional */}
      <View className="mb-3">
        {/* Logo */}
        <TouchableOpacity
          onPress={() => {
            // TODO: Implement image picker
            console.log('Pick logo image');
          }}
          className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-3 border border-gray-400"
          activeOpacity={0.7}
        >
          <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center mr-3">
            {formData.logoUrl ? (
              <Image
                source={{ uri: formData.logoUrl }}
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
              {formData.logoUrl ? 'Toca para cambiar' : 'Opcional'}
            </Text>
          </View>
          <Ionicons name="camera-outline" size={20} color="#6b7280" />
        </TouchableOpacity>

        {/* Banner */}
        <TouchableOpacity
          onPress={() => {
            // TODO: Implement image picker
            console.log('Pick banner image');
          }}
          className="bg-gray-50 rounded-xl border border-gray-400 overflow-hidden mb-3"
          activeOpacity={0.7}
          style={{ height: 100 }}
        >
          {formData.bannerUrl ? (
            <Image
              source={{ uri: formData.bannerUrl }}
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
