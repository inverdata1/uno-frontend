import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator, Image, Modal, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '../../../../shared/components/ui';
import { colors } from '../../../../shared/utils/colors';
import { useCreateProduct } from '../../../../features/shared/products/hooks/use-products';
import { useBusinessContexts } from '../../../../shared/hooks/use-user-type';

export const CreateProductModal = ({ visible, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const businessContexts = useBusinessContexts();
  const currentBusiness = businessContexts[0] || null;
  const businessId = currentBusiness?.businessId;

  const createProductMutation = useCreateProduct();

  // Create refs for focus management
  const nameRef = useRef(null);
  const descriptionRef = useRef(null);
  const priceRef = useRef(null);
  const compareAtPriceRef = useRef(null);
  const stockRef = useRef(null);

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setSelectedImages([...selectedImages, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del producto es requerido');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'La descripción del producto es requerida');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Ingresa un precio válido');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Agrega al menos una imagen del producto');
      return;
    }

    if (!businessId) {
      Alert.alert('Error', 'No se encontró el contexto del negocio');
      return;
    }

    setIsUploading(true);

    try {
      // Send local image URIs to API - it will handle upload to Firebase Storage
      await createProductMutation.mutateAsync({
        productData: {
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          stock: stock ? parseInt(stock) : 0,
          imageFiles: selectedImages, // Local URIs
          categoryId: 'default', // TODO: Add category selection
          trackInventory: true,
          isActive: true,
          isAvailable: true,
        },
        businessId
      });

      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setCompareAtPrice('');
      setStock('');
      setSelectedImages([]);
      setIsUploading(false);
      onClose();
      Alert.alert('¡Listo!', 'Producto creado exitosamente');
    } catch (error) {
      console.error('Error creating product:', error);
      setIsUploading(false);
      Alert.alert('Error', 'No se pudo crear el producto. Intenta de nuevo.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />

        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light
        }}>
          <TouchableOpacity onPress={onClose} disabled={isUploading}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text.primary
          }}>
            Nuevo Producto
          </Text>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={isUploading || !name.trim() || !price || selectedImages.length === 0}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : (
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: (!name.trim() || !price || selectedImages.length === 0)
                  ? colors.text.secondary
                  : colors.primary[500]
              }}>
                Publicar
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Images */}
          <View style={{ padding: 16, paddingBottom: 8 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 12
            }}>
              Imágenes del producto
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                onPress={pickImages}
                disabled={isUploading}
                activeOpacity={0.7}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: colors.border.light,
                  backgroundColor: colors.bg.secondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}
              >
                <Ionicons name="camera" size={32} color={colors.text.secondary} />
                <Text style={{
                  fontSize: 12,
                  color: colors.text.secondary,
                  marginTop: 8
                }}>
                  Agregar
                </Text>
              </TouchableOpacity>

              {selectedImages.map((uri, index) => (
                <View key={index} style={{ marginRight: 12 }}>
                  <Image
                    source={{ uri }}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 12,
                      backgroundColor: colors.bg.secondary
                    }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    activeOpacity={0.7}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: 12,
                      width: 24,
                      height: 24,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Product Name */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 8
            }}>
              Nombre del producto
            </Text>
            <TextInput
              ref={nameRef}
              value={name}
              onChangeText={setName}
              placeholder="Ej: Camiseta Básica"
              placeholderTextColor={colors.text.secondary}
              editable={!isUploading}
              returnKeyType="next"
              onSubmitEditing={() => descriptionRef.current?.focus()}
              style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 12,
                padding: 16,
                fontSize: 15,
                color: colors.text.primary
              }}
            />
          </View>

          {/* Description */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 8
            }}>
              Descripción
            </Text>
            <TextInput
              ref={descriptionRef}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe tu producto..."
              placeholderTextColor={colors.text.secondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isUploading}
              returnKeyType="next"
              onSubmitEditing={() => priceRef.current?.focus()}
              style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 12,
                padding: 16,
                fontSize: 15,
                color: colors.text.primary,
                minHeight: 100
              }}
            />
          </View>

          {/* Price */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 8
            }}>
              Precio
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.bg.secondary,
              borderRadius: 12,
              paddingLeft: 16
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text.secondary,
                marginRight: 4
              }}>
                $
              </Text>
              <TextInput
                ref={priceRef}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor={colors.text.secondary}
                keyboardType="decimal-pad"
                editable={!isUploading}
                returnKeyType="next"
                onSubmitEditing={() => compareAtPriceRef.current?.focus()}
                style={{
                  flex: 1,
                  padding: 16,
                  paddingLeft: 0,
                  fontSize: 15,
                  color: colors.text.primary
                }}
              />
            </View>
          </View>

          {/* Compare At Price (Optional) */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 8
            }}>
              Precio anterior (opcional)
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.bg.secondary,
              borderRadius: 12,
              paddingLeft: 16
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text.secondary,
                marginRight: 4
              }}>
                $
              </Text>
              <TextInput
                ref={compareAtPriceRef}
                value={compareAtPrice}
                onChangeText={setCompareAtPrice}
                placeholder="0.00"
                placeholderTextColor={colors.text.secondary}
                keyboardType="decimal-pad"
                editable={!isUploading}
                returnKeyType="next"
                onSubmitEditing={() => stockRef.current?.focus()}
                style={{
                  flex: 1,
                  padding: 16,
                  paddingLeft: 0,
                  fontSize: 15,
                  color: colors.text.primary
                }}
              />
            </View>
            <Text style={{
              fontSize: 12,
              color: colors.text.secondary,
              marginTop: 4
            }}>
              Se mostrará tachado si es mayor al precio actual
            </Text>
          </View>

          {/* Stock */}
          <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 8
            }}>
              Stock disponible
            </Text>
            <TextInput
              ref={stockRef}
              value={stock}
              onChangeText={setStock}
              placeholder="0"
              placeholderTextColor={colors.text.secondary}
              keyboardType="number-pad"
              editable={!isUploading}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
              style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 12,
                padding: 16,
                fontSize: 15,
                color: colors.text.primary
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
