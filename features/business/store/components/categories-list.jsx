import React, { useState } from 'react';
import { View, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui';
import { colors } from '../../../../shared/utils/colors';
import { useCategories, useDeleteCategory } from '../../../../features/shared/categories/hooks/use-categories';
import { useCurrentUserType } from '../../../../shared/hooks/use-user-type';
import { CreateCategoryModal } from './create-category-modal';

export const CategoriesList = ({ createModalVisible, setCreateModalVisible }) => {
  const { currentContext } = useCurrentUserType();
  const businessId = currentContext?.businessId;

  const { data: categories = [], isLoading } = useCategories({ businessId });
  const deleteCategory = useDeleteCategory();

  const [editingCategory, setEditingCategory] = useState(null);

  const handleDelete = (category) => {
    Alert.alert(
      'Eliminar Categoría',
      `¿Estás seguro de que quieres eliminar "${category.name}"? Los productos asignados quedarán sin categoría.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: () => deleteCategory.mutate(category.id) 
        }
      ]
    );
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCreateModalVisible(true);
  };

  const handleCloseModal = () => {
    setCreateModalVisible(false);
    // Add small delay before clearing edit state so modal closes smoothly
    setTimeout(() => setEditingCategory(null), 300);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.secondary }}>
      {categories.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: colors.bg.primary,
            borderWidth: 1, borderColor: colors.border.light,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 20
          }}>
            <Ionicons name="folder-open-outline" size={32} color={colors.text.secondary} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 8 }}>
            Sin categorías
          </Text>
          <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center', marginBottom: 24 }}>
            Crea categorías para organizar tus productos y facilitar la navegación a tus clientes.
          </Text>
          <TouchableOpacity
            onPress={() => setCreateModalVisible(true)}
            style={{
              backgroundColor: colors.primary[500],
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text.inverse }}>
              Crear primera categoría
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.bg.primary,
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: colors.border.light
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
                  {item.name}
                </Text>
                {/* 
                  Since Prisma categories are new and we removed counting, we'll just show the name.
                  If you want product count, you would add `_count: { products: true }` in the backend. 
                */}
              </View>
              
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity onPress={() => handleEdit(item)}>
                  <Ionicons name="pencil" size={20} color={colors.primary[500]} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <CreateCategoryModal 
        visible={createModalVisible}
        onClose={handleCloseModal}
        editingCategory={editingCategory}
      />
    </View>
  );
};
