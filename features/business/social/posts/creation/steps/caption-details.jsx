import React from 'react';
import { View, TouchableOpacity, TextInput, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../../../shared/components/ui';
import { colors } from '../../../../../../shared/utils/colors';

/**
 * Step 3: Caption & Details
 * Add caption, location, and other details
 */
export function CaptionDetailsStep({ selectedMedia, caption, onCaptionChange, onNext, onBack }) {
  const firstMedia = selectedMedia[0];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.bg.primary }}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light
      }}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text.primary
        }}>
          Detalles
        </Text>
        <TouchableOpacity onPress={onNext}>
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: colors.primary[500]
          }}>
            Siguiente
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Media Preview with Caption */}
        <View style={{
          flexDirection: 'row',
          padding: 16,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light
        }}>
          {/* Thumbnail */}
          <Image
            source={{ uri: firstMedia.uri }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              backgroundColor: colors.bg.secondary
            }}
            resizeMode="cover"
          />

          {/* Caption Input */}
          <View style={{ flex: 1 }}>
            <TextInput
              placeholder="Escribe una descripción..."
              placeholderTextColor={colors.text.secondary}
              value={caption}
              onChangeText={onCaptionChange}
              multiline
              numberOfLines={4}
              style={{
                flex: 1,
                fontSize: 15,
                color: colors.text.primary,
                textAlignVertical: 'top'
              }}
            />
          </View>
        </View>

        {/* Additional Options */}
        <View style={{ padding: 16, gap: 12 }}>
          {/* Location (Not integrated yet) */}
          <TouchableOpacity
            disabled
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 16,
              backgroundColor: colors.bg.secondary,
              borderRadius: 12
            }}
          >
            <Ionicons name="location" size={24} color={colors.text.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 15,
                fontWeight: '500',
                color: colors.text.primary
              }}>
                Agregar ubicación
              </Text>
              <Text style={{
                fontSize: 13,
                color: colors.text.secondary
              }}>
                Próximamente
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
