import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { Alert, Image, ScrollView, TouchableOpacity, View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Input, MapPicker, Text, TimePickerSheet } from '../../../shared/components/ui';
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
    businessType: businessData.businessType || '',
    businessHours: businessData.businessHours || '',
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

  // Keeps the latest form data available to callbacks so that consecutive
  // updates (e.g. uri + mimeType) don't overwrite each other with stale state
  const formDataRef = useRef(formData);

  // Time pickers state. The scrolling draft lives inside TimePickerSheet so that
  // dragging the wheel doesn't re-render this screen (and its live MapView).
  const [openTime, setOpenTime] = useState(new Date(new Date().setHours(8, 0, 0, 0)));
  const [closeTime, setCloseTime] = useState(new Date(new Date().setHours(17, 0, 0, 0)));
  // Which time is being edited: 'open' | 'close' | null
  const [editingTime, setEditingTime] = useState(null);

  // Sync initial time if businessHours exists
  useEffect(() => {
    if (businessData.businessHours) {
      try {
        const parts = businessData.businessHours.split(' - ');
        if (parts.length === 2) {
          const parseTime = (timeStr) => {
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            return date;
          };
          setOpenTime(parseTime(parts[0]));
          setCloseTime(parseTime(parts[1]));
        }
      } catch(e) {}
    } else {
      // The inputs already display the default hours, so record them right away
      // instead of leaving the field empty until the picker is opened
      updateHours(openTime, closeTime);
    }
  }, []);

  // Applies several fields at once so a single change never clobbers another
  const updateFields = (updates) => {
    const newData = { ...formDataRef.current, ...updates };
    formDataRef.current = newData;
    setFormData(newData);
    onBusinessDataChange?.(newData);
  };

  const updateField = (field, value) => updateFields({ [field]: value });

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const updateHours = (newOpen, newClose) => {
    updateField('businessHours', `${formatTime(newOpen)} - ${formatTime(newClose)}`);
  };

  const commitTime = (date) => {
    if (editingTime === 'open') {
      setOpenTime(date);
      updateHours(date, closeTime);
    } else {
      setCloseTime(date);
      updateHours(openTime, date);
    }
  };

  // Android shows its own dialog and reports the final value directly;
  // iOS uses TimePickerSheet, which confirms explicitly.
  const handleAndroidTimeChange = (event, date) => {
    setEditingTime(null);
    if (event.type === 'set' && date) {
      commitTime(date);
    }
  };

  const confirmTime = (date) => {
    if (date) commitTime(date);
    setEditingTime(null);
  };

  // `kind` is 'logo' or 'banner'; both write their uri and mimeType in one update
  const handlePickImage = async (kind) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: kind === 'logo' ? [1, 1] : [3, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      updateFields({
        [`${kind}Uri`]: asset.uri,
        [`${kind}MimeType`]: asset.mimeType || asset.type,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Intenta nuevamente.');
      console.error(`${kind} picker error:`, error);
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

  const businessTypesByCategory = {
    restaurant: ['Restaurante Elegante', 'Comida Rápida', 'Cafetería', 'Food Truck', 'Pizzería', 'Comida Tradicional', 'Otro'],
    store: ['Ropa y Accesorios', 'Calzado', 'Hogar', 'Deportes', 'Belleza', 'Regalos', 'Otro'],
    pharmacy: ['Farmacia General', 'Dermatología', 'Naturista', 'Otro'],
    market: ['Supermercado', 'Mini Market', 'Bodega', 'Licorería', 'Carnicería', 'Frutería', 'Otro'],
    bakery: ['Panadería Tradicional', 'Pastelería', 'Postres', 'Otro'],
    technology: ['Celulares y Accesorios', 'Computación', 'Servicio Técnico', 'Videojuegos', 'Otro'],
    other: ['Servicios Profesionales', 'Educación', 'Entretenimiento', 'Salud', 'Otro'],
  };

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

      {/* Business Type Selection (Only visible if category is selected) */}
      {formData.category && businessTypesByCategory[formData.category] && (
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text variant="body" className="text-gray-500 font-medium">
              Tipo de Negocio
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
            {businessTypesByCategory[formData.category].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => updateField('businessType', type)}
                className="flex-row items-center rounded-full px-4 py-2.5 mr-2"
                style={{
                  backgroundColor: formData.businessType === type ? '#3b82f6' : '#f9fafb',
                  borderWidth: 1,
                  borderColor: formData.businessType === type ? '#3b82f6' : '#9ca3af',
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: formData.businessType === type ? '#ffffff' : '#6b7280' }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

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

      {/* Business Hours */}
      <View className="mb-3">
        <Text variant="body" className="text-gray-500 font-medium mb-2">
          Horario de Atención
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-white border border-gray-400 rounded-xl p-3 items-center"
            onPress={() => setEditingTime('open')}
          >
            <Text variant="caption" className="text-gray-500">Abre:</Text>
            <Text variant="body" className="font-semibold mt-1">
              {formatTime(openTime)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white border border-gray-400 rounded-xl p-3 items-center"
            onPress={() => setEditingTime('close')}
          >
            <Text variant="caption" className="text-gray-500">Cierra:</Text>
            <Text variant="body" className="font-semibold mt-1">
              {formatTime(closeTime)}
            </Text>
          </TouchableOpacity>
        </View>

        {editingTime && Platform.OS === 'android' && (
          <DateTimePicker
            value={editingTime === 'open' ? openTime : closeTime}
            mode="time"
            display="default"
            onChange={handleAndroidTimeChange}
          />
        )}

        <TimePickerSheet
          visible={!!editingTime}
          value={editingTime === 'open' ? openTime : closeTime}
          title={editingTime === 'open' ? 'Hora de apertura' : 'Hora de cierre'}
          onCancel={() => setEditingTime(null)}
          onConfirm={confirmTime}
        />
      </View>

      {/* Address lives inside the map picker below, so there is one address in
          the form instead of a text field the map silently overwrites */}

      {/* Phone */}
      <PhoneInput
        value={formData.phone}
        onChangeText={(value) => updateField('phone', value)}
      />

      {/* Location + address */}
      <View className="mb-3">
        <Text variant="body" className="text-gray-500 font-medium mb-2">
          Ubicación y dirección
        </Text>
        <MapPicker
          height={250}
          initialLocation={businessData.coordinates}
          addressValue={formData.address}
          onAddressChange={(value) => updateField('address', value)}
          onLocationSelect={(location) => {
            updateFields({
              coordinates: location,
              // Fill in the address automatically when the map resolves one,
              // but never wipe an address the user already typed
              ...(location.address ? { address: location.address } : {}),
            });
          }}
          instructionText="Busca una referencia o toca el mapa para ubicar tu negocio"
          className="border border-gray-400 rounded-xl"
        />
      </View>

      {/* Image Uploads - Optional */}
      <View className="mb-3">
        {/* Logo */}
        <TouchableOpacity
          onPress={() => handlePickImage('logo')}
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
          onPress={() => handlePickImage('banner')}
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
    'businessType',
    'category',
    'businessHours',
    'address',
    'phone'
  ];

  return requiredFields.every(field => {
    const value = businessData[field];
    return value && value.trim && value.trim().length > 0;
  });
};
