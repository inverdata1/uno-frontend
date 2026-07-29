import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, Alert, Modal, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui';
import { colors } from '../../../../shared/utils/colors';
import { useCreateCategory, useUpdateCategory } from '../../../../features/shared/categories/hooks/use-categories';
import { useCurrentUserType } from '../../../../shared/hooks/use-user-type';

export const CreateCategoryModal = ({ visible, onClose, editingCategory }) => {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { currentContext } = useCurrentUserType();
  const businessId = currentContext?.businessId;

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
    } else {
      setName('');
    }
  }, [editingCategory, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es requerido');
      return;
    }

    if (!businessId) {
      Alert.alert('Error', 'No se encontró el contexto del negocio');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          categoryId: editingCategory.id,
          name: name.trim()
        });
      } else {
        await createCategory.mutateAsync({
          name: name.trim(),
          businessId
        });
      }
      onClose();
      setName('');
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'No se pudo guardar la categoría. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.bg.secondary }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          backgroundColor: colors.bg.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light
        }}>
          <TouchableOpacity onPress={onClose} disabled={isSaving}>
            <Text style={{ fontSize: 16, color: colors.text.secondary }}>Cancelar</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text.primary }}>
            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          </Text>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving || !name.trim()}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : (
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: name.trim() ? colors.primary[500] : colors.text.secondary
              }}>
                Guardar
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={{ padding: 16, marginTop: 16 }}>
          <View style={{
            backgroundColor: colors.bg.primary,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border.light
          }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.secondary, marginBottom: 8 }}>
              NOMBRE DE LA CATEGORÍA
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej: Hamburguesas, Postres..."
              placeholderTextColor={colors.border.dark}
              style={{
                fontSize: 16,
                color: colors.text.primary,
                padding: 0
              }}
              autoFocus
              editable={!isSaving}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
