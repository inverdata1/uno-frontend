import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from '../../../shared/components/ui';
import { colors } from '../../../shared/utils/colors';

/**
 * Client Preferences Onboarding Step
 * Allows client users to select their goals, favorite business categories, and interests
 * Stored in user preferences JSON in DB to feed recommendation algorithms
 */

export const GOALS_OPTIONS = [
  { id: 'discounts', label: 'Ofertas y Descuentos', emoji: '🏷️', desc: 'Promociones y precios especiales' },
  { id: 'food_delivery', label: 'Comida a Domicilio', emoji: '🍔', desc: 'Pedidos de tus restaurantes favoritos' },
  { id: 'express_delivery', label: 'Entregas Express', emoji: '🚀', desc: 'Envíos rápidos en tiempo récord' },
  { id: 'local_stores', label: 'Tiendas Locales', emoji: '🛍️', desc: 'Moda, tecnología, hogar y accesorios' },
  { id: 'social_content', label: 'Descubrir Tendencias', emoji: '🎬', desc: 'Fotos y videos de negocios locales' },
  { id: 'market_groceries', label: 'Supermercado y Víveres', emoji: '🛒', desc: 'Compras del hogar a domicilio' },
  { id: 'pharmacy_health', label: 'Farmacia y Salud', emoji: '💊', desc: 'Productos de salud y bienestar' },
];

export const CATEGORIES_OPTIONS = [
  { id: 'restaurant', label: 'Restaurantes & Comida', emoji: '🍕', icon: 'restaurant' },
  { id: 'fashion', label: 'Moda & Accesorios', emoji: '👗', icon: 'shirt' },
  { id: 'technology', label: 'Tecnología & Gadgets', emoji: '📱', icon: 'phone-portrait' },
  { id: 'bakery', label: 'Panadería & Postres', emoji: '🥐', icon: 'cafe' },
  { id: 'beauty', label: 'Belleza & Cuidado', emoji: '💄', icon: 'sparkles' },
  { id: 'market', label: 'Mercado & Víveres', emoji: '🛒', icon: 'cart' },
  { id: 'pharmacy', label: 'Farmacia & Salud', emoji: '💊', icon: 'medical' },
  { id: 'home', label: 'Hogar & Decoración', emoji: '🏠', icon: 'home' },
  { id: 'sports', label: 'Deportes & Fitness', emoji: '⚽', icon: 'fitness' },
  { id: 'pets', label: 'Mascotas', emoji: '🐶', icon: 'paw' },
  { id: 'services', label: 'Servicios & Otros', emoji: '🛠️', icon: 'construct' },
];

export const TAGS_OPTIONS = [
  { id: 'hamburguesas', label: 'Hamburguesas', emoji: '🍔' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'sushi', label: 'Sushi & Asiática', emoji: '🍣' },
  { id: 'postres', label: 'Helados & Postres', emoji: '🍦' },
  { id: 'cafeteria', label: 'Cafeterías', emoji: '☕' },
  { id: 'ropa_urbana', label: 'Ropa Urbana', emoji: '👖' },
  { id: 'zapatillas', label: 'Calzado & Zapatillas', emoji: '👟' },
  { id: 'celulares', label: 'Celulares & Laptops', emoji: '💻' },
  { id: 'licores', label: 'Licores & Bebidas', emoji: '🍾' },
  { id: 'skincare', label: 'Skincare & Maquillaje', emoji: '🧴' },
  { id: 'fitness', label: 'Suplementos & Fitness', emoji: '🏋️' },
  { id: 'mascotas_comida', label: 'Comida para Mascotas', emoji: '🐾' },
];

export default function ClientPreferencesOnboardingStep({
  preferences = {},
  onPreferencesChange,
}) {
  const selectedGoals = preferences.goals || [];
  const selectedCategories = preferences.categories || [];
  const selectedSubcategories = preferences.subcategories || [];

  const toggleGoal = (goalId) => {
    const updated = selectedGoals.includes(goalId)
      ? selectedGoals.filter((id) => id !== goalId)
      : [...selectedGoals, goalId];
    onPreferencesChange?.({
      ...preferences,
      goals: updated,
    });
  };

  const toggleCategory = (catId) => {
    const updated = selectedCategories.includes(catId)
      ? selectedCategories.filter((id) => id !== catId)
      : [...selectedCategories, catId];
    onPreferencesChange?.({
      ...preferences,
      categories: updated,
    });
  };

  const toggleSubcategory = (tagId) => {
    const updated = selectedSubcategories.includes(tagId)
      ? selectedSubcategories.filter((id) => id !== tagId)
      : [...selectedSubcategories, tagId];
    onPreferencesChange?.({
      ...preferences,
      subcategories: updated,
    });
  };

  const totalSelected = selectedGoals.length + selectedCategories.length + selectedSubcategories.length;

  return (
    <View className="mb-4">
      {/* Header Badge & Title */}
      <View className="items-center mb-6">
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>✨ Personaliza tu experiencia</Text>
        </View>
        <Text variant="subheading" className="text-center font-bold text-gray-900 text-xl mb-1">
          ¿Qué buscas en UNO?
        </Text>
        <Text variant="caption" className="text-center text-gray-500 px-2 leading-5">
          Selecciona tus metas e intereses para que nuestro sistema te recomiende las mejores ofertas, negocios y contenido cerca de ti.
        </Text>
      </View>

      {/* Selected Counter */}
      <View style={styles.counterBanner}>
        <Ionicons name="sparkles" size={16} color="#ef4444" />
        <Text style={styles.counterBannerText}>
          {totalSelected > 0
            ? `${totalSelected} ${totalSelected === 1 ? 'interés seleccionado' : 'intereses seleccionados'}`
            : 'Selecciona al menos 1 opción para continuar'}
        </Text>
      </View>

      {/* Section 1: Goals */}
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Text className="text-base font-bold text-gray-900">
            🎯 ¿Qué deseas conseguir en UNO?
          </Text>
        </View>
        <View className="space-y-2">
          {GOALS_OPTIONS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.8}
                style={[
                  styles.goalCard,
                  isSelected && styles.goalCardSelected,
                ]}
              >
                <View style={styles.goalEmojiContainer}>
                  <Text style={{ fontSize: 22 }}>{goal.emoji}</Text>
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.goalTitle, isSelected && styles.goalTitleSelected]}>
                    {goal.label}
                  </Text>
                  <Text style={styles.goalDesc}>
                    {goal.desc}
                  </Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Section 2: Categories */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-bold text-gray-900">
            🛍️ Categorías de tu interés
          </Text>
          <Text variant="caption" className="text-gray-400">
            (Elige tus favoritas)
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {CATEGORIES_OPTIONS.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => toggleCategory(cat.id)}
                activeOpacity={0.8}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                ]}
              >
                <View style={styles.categoryCardHeader}>
                  <Text style={{ fontSize: 20 }}>{cat.emoji}</Text>
                  <View style={[styles.checkboxSmall, isSelected && styles.checkboxSmallSelected]}>
                    {isSelected && <Ionicons name="checkmark" size={10} color="#ffffff" />}
                  </View>
                </View>
                <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]} numberOfLines={2}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Section 3: Subcategories / Specific Tags */}
      <View className="mb-4">
        <Text className="text-base font-bold text-gray-900 mb-3">
          😋 Gustos y antojos frecuentes
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {TAGS_OPTIONS.map((tag) => {
            const isSelected = selectedSubcategories.includes(tag.id);
            return (
              <TouchableOpacity
                key={tag.id}
                onPress={() => toggleSubcategory(tag.id)}
                activeOpacity={0.8}
                style={[
                  styles.tagPill,
                  isSelected && styles.tagPillSelected,
                ]}
              >
                <Text style={{ fontSize: 14, marginRight: 4 }}>{tag.emoji}</Text>
                <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                  {tag.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={14} color="#ef4444" style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 8,
  },
  badgeText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  counterBanner: {
    backgroundColor: '#fff1f2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  counterBannerText: {
    color: '#be123c',
    fontSize: 13,
    fontWeight: '600',
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#f3f4f6',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  goalCardSelected: {
    borderColor: '#ef4444',
    backgroundColor: '#fffafb',
  },
  goalEmojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  goalTitleSelected: {
    color: '#ef4444',
    fontWeight: '700',
  },
  goalDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#f3f4f6',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  categoryCardSelected: {
    borderColor: '#ef4444',
    backgroundColor: '#fffafb',
  },
  categoryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSmallSelected: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  categoryLabelSelected: {
    color: '#ef4444',
    fontWeight: '700',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  tagPillSelected: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  tagText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  tagTextSelected: {
    color: '#dc2626',
    fontWeight: '700',
  },
});
