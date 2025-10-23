import React from 'react';
import { View, FlatList, ScrollView } from 'react-native';
import { CategoryCard } from './components/category-card';
import { Text } from '../../../shared/components/ui/text';
import { router } from 'expo-router';
import { useCategories } from '../hooks/use-categories';

/**
 * Categories Screen
 * Browse all product/content categories
 * Shared between Client and Business user types
 */
export default function CategoriesScreen() {
  // Use domain hook
  const { data: categories = [], isLoading } = useCategories();

  const handleCategoryPress = (category) => {
    // Navigate to category feed
    router.push(`/category/${category.slug}`);
  };

  const renderCategory = ({ item, index }) => (
    <CategoryCard
      category={item}
      onPress={() => handleCategoryPress(item)}
    />
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-gray-500 text-base">No hay categorías</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Cargando categorías...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-6 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold">Categorías</Text>
        <Text className="text-gray-500 mt-1">
          Explora productos por categoría
        </Text>
      </View>

      {/* Categories Grid */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 16 }}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
