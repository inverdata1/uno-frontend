import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator, Image, Modal, StatusBar, Switch, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '../../../../shared/components/ui';
import { colors } from '../../../../shared/utils/colors';
import { useCreateProduct, useUpdateProduct } from '../../../../features/shared/products/hooks/use-products';
import { useCategories } from '../../../../features/shared/categories/hooks/use-categories';
import { useCurrentUserType, useBusinessContexts } from '../../../../shared/hooks/use-user-type';
import { apiClient } from '../../../../shared/config/api-client';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../shared/config/firebase';

export const CreateProductModal = ({ visible, onClose, editingProduct }) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const { currentContext } = useCurrentUserType();
  const businessContexts = useBusinessContexts();
  const businessId = currentContext?.businessId || businessContexts[0]?.businessId || businessContexts[0]?.id;

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const { data: categories = [] } = useCategories({ businessId });

  // Create refs for focus management
  const nameRef = useRef(null);
  const descriptionRef = useRef(null);
  const priceRef = useRef(null);
  const discountPriceRef = useRef(null);

  React.useEffect(() => {
    if (editingProduct && visible) {
      setName(editingProduct.name || '');
      setDescription(editingProduct.description || '');
      setPrice(editingProduct.price ? String(editingProduct.price) : '');
      setDiscountPrice(editingProduct.discountPrice ? String(editingProduct.discountPrice) : '');
      setCategoryId(editingProduct.categoryId || '');
      setIsAvailable(editingProduct.isAvailable !== false);
      setSelectedImages(editingProduct.images || []);
    } else if (!visible) {
      setName('');
      setDescription('');
      setPrice('');
      setDiscountPrice('');
      setCategoryId('');
      setIsAvailable(true);
      setSelectedImages([]);
    }
  }, [editingProduct, visible]);

  const pickImages = async () => {
    try {
      // launchImageLibraryAsync opens the OS media picker (Photos/Gallery,
      // Google Photos, etc.) instead of DocumentPicker, which only offers
      // the Files app and has no notion of a camera roll
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setSelectedImages([...selectedImages, ...result.assets.map(asset => asset.uri)]);
      }
    } catch (error) {
      console.error('Error al seleccionar imágenes:', error);
      Alert.alert('Error', 'Hubo un problema al abrir la galería');
    }
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const uploadImagesToFirebase = async (uris) => {
    const uploadedUrls = [];
    for (let i = 0; i < uris.length; i++) {
      const uri = uris[i];
      if (uri.startsWith('http')) {
        uploadedUrls.push(uri);
        continue;
      }
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = `products/${businessId}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);
        uploadedUrls.push(downloadUrl);
      } catch (err) {
        console.warn('Firebase upload failed, attempting local backend fallback...', err);

        const formData = new FormData();
        const ext = uri.split('.').pop() || 'jpg';
        formData.append('image', {
          uri: uri,
          name: `img_${Date.now()}.${ext}`,
          type: `image/${ext === 'png' ? 'png' : 'jpeg'}`
        });
        formData.append('productName', name);
        formData.append('businessId', businessId);

        try {
          const res = await apiClient.post('/upload/image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });

          const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
          uploadedUrls.push(`${backendUrl}${res.data.url}`);
        } catch (fallbackErr) {
          console.error('Fallback upload failed', fallbackErr);
          throw fallbackErr;
        }
      }
    }
    return uploadedUrls;
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

    if (!categoryId) {
      Alert.alert('Error', 'Debes seleccionar una categoría');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Error', 'Ingresa un precio válido');
      return;
    }

    let parsedDiscount = null;
    if (discountPrice) {
      parsedDiscount = parseFloat(discountPrice);
      if (isNaN(parsedDiscount) || parsedDiscount <= 0) {
        Alert.alert('Error', 'Ingresa un precio de descuento válido');
        return;
      }
      if (parsedDiscount >= parsedPrice) {
        Alert.alert('Error', 'El precio de descuento no puede ser mayor o igual al precio normal');
        return;
      }
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
      // 1. Upload images to Firebase Storage
      const imageUrls = await uploadImagesToFirebase(selectedImages);

      // 2. Send public URLs to the backend
      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        discountPrice: parsedDiscount,
        isDiscountActive: parsedDiscount ? true : false,
        images: imageUrls,
        thumbnailUrl: imageUrls[0],
        categoryId: categoryId,
        isActive: true,
        isAvailable: isAvailable,
      };

      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          productId: editingProduct.id,
          productData
        });
      } else {
        await createProductMutation.mutateAsync({
          productData,
          businessId
        });
      }

      // Reset form handled by useEffect when visible becomes false
      setIsUploading(false);
      onClose();
      Alert.alert('¡Listo!', editingProduct ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
    } catch (error) {
      console.error('Error saving product:', error);
      setIsUploading(false);
      Alert.alert('Error', 'No se pudo guardar el producto. Intenta de nuevo.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.bg.primary, paddingTop: Platform.OS === 'ios' ? insets.top : 0, paddingBottom: insets.bottom }}>
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
            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
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
                {editingProduct ? 'Guardar' : 'Publicar'}
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
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: 12 }}>
              Imágenes del producto
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                onPress={pickImages}
                disabled={isUploading}
                activeOpacity={0.7}
                style={{
                  width: 120, height: 120, borderRadius: 12, borderWidth: 2,
                  borderStyle: 'dashed', borderColor: colors.border.light,
                  backgroundColor: colors.bg.secondary, alignItems: 'center',
                  justifyContent: 'center', marginRight: 12
                }}
              >
                <Ionicons name="camera" size={32} color={colors.text.secondary} />
                <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 8 }}>Agregar</Text>
              </TouchableOpacity>
              {selectedImages.map((uri, index) => (
                <View key={index} style={{ marginRight: 12 }}>
                  <Image source={{ uri }} style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: colors.bg.secondary }} resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    activeOpacity={0.7}
                    style={{
                      position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center'
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
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: 8 }}>Nombre del producto</Text>
            <TextInput
              ref={nameRef}
              value={name}
              onChangeText={setName}
              placeholder="Ej: Camiseta Básica"
              placeholderTextColor={colors.text.secondary}
              editable={!isUploading}
              returnKeyType="next"
              onSubmitEditing={() => descriptionRef.current?.focus()}
              style={{ backgroundColor: colors.bg.secondary, borderRadius: 12, padding: 16, fontSize: 15, color: colors.text.primary }}
            />
          </View>

          {/* Category */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: 8 }}>Categoría</Text>
            {categories.length === 0 ? (
              <Text style={{ color: colors.error, fontSize: 14 }}>Debes crear categorías primero en la pestaña de Tienda.</Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 20,
                      backgroundColor: categoryId === cat.id ? colors.primary[500] : colors.bg.secondary,
                      borderWidth: 1,
                      borderColor: categoryId === cat.id ? colors.primary[500] : colors.border.light
                    }}
                  >
                    <Text style={{
                      color: categoryId === cat.id ? '#fff' : colors.text.primary,
                      fontWeight: categoryId === cat.id ? '700' : '500'
                    }}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: 8 }}>Descripción</Text>
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
              style={{ backgroundColor: colors.bg.secondary, borderRadius: 12, padding: 16, fontSize: 15, color: colors.text.primary, minHeight: 100 }}
            />
          </View>

          {/* Price */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: 8 }}>Precio Normal (USD)</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.secondary, borderRadius: 12, paddingLeft: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text.secondary, marginRight: 4 }}>$</Text>
              <TextInput
                ref={priceRef}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor={colors.text.secondary}
                keyboardType="decimal-pad"
                editable={!isUploading}
                returnKeyType="next"
                onSubmitEditing={() => discountPriceRef.current?.focus()}
                style={{ flex: 1, padding: 16, paddingLeft: 0, fontSize: 15, color: colors.text.primary }}
              />
            </View>
          </View>

          {/* Discount Price */}
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: 8 }}>Precio Descuento (opcional)</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.secondary, borderRadius: 12, paddingLeft: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text.secondary, marginRight: 4 }}>$</Text>
              <TextInput
                ref={discountPriceRef}
                value={discountPrice}
                onChangeText={setDiscountPrice}
                placeholder="0.00"
                placeholderTextColor={colors.text.secondary}
                keyboardType="decimal-pad"
                editable={!isUploading}
                returnKeyType="done"
                style={{ flex: 1, padding: 16, paddingLeft: 0, fontSize: 15, color: colors.text.primary }}
              />
            </View>
            <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 4 }}>Debe ser menor al precio normal.</Text>
          </View>

          {/* Availability */}
          <View style={{
            paddingHorizontal: 16,
            marginBottom: 32,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 4 }}>Disponible</Text>
              <Text style={{ fontSize: 13, color: colors.text.secondary }}>Los clientes podrán hacer pedidos de este producto</Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: colors.border.light, true: colors.primary[500] }}
              thumbColor="#fff"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
