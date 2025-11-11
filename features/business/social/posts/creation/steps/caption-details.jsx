import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../../../shared/components/ui';
import { colors } from '../../../../../../shared/utils/colors';

/**
 * Step 3: Caption & Details
 * Add caption, location, and keywords
 */
export function CaptionDetailsStep({ selectedMedia, caption, keywords = [], onCaptionChange, onKeywordsChange, onNext, onBack }) {
  const firstMedia = selectedMedia[0];
  const [keywordInput, setKeywordInput] = useState('');

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase().replace(/\s+/g, '');

    if (!trimmed) {
      return;
    }

    if (keywords.length >= 5) {
      Alert.alert('Límite alcanzado', 'Solo puedes agregar hasta 5 palabras clave');
      return;
    }

    if (keywords.includes(trimmed)) {
      Alert.alert('Duplicado', 'Esta palabra clave ya fue agregada');
      return;
    }

    onKeywordsChange([...keywords, trimmed]);
    setKeywordInput('');
  };

  const handleRemoveKeyword = (index) => {
    onKeywordsChange(keywords.filter((_, i) => i !== index));
  };

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

        {/* Keywords Section */}
        <View style={{ padding: 16, gap: 12 }}>
          <View>
            <Text style={{
              fontSize: 15,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 8
            }}>
              Palabras clave (máximo 5)
            </Text>
            <Text style={{
              fontSize: 13,
              color: colors.text.secondary,
              marginBottom: 12
            }}>
              Agrega palabras clave para ayudar a las personas a encontrar tu publicación
            </Text>

            {/* Keyword Input */}
            <View style={{
              flexDirection: 'row',
              gap: 8,
              marginBottom: 12
            }}>
              <TextInput
                placeholder="Ej: pizza, comida, artesanal"
                placeholderTextColor={colors.text.secondary}
                value={keywordInput}
                onChangeText={setKeywordInput}
                onSubmitEditing={handleAddKeyword}
                returnKeyType="done"
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: colors.text.primary,
                  backgroundColor: colors.bg.secondary,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 10
                }}
              />
              <TouchableOpacity
                onPress={handleAddKeyword}
                disabled={!keywordInput.trim()}
                style={{
                  backgroundColor: keywordInput.trim() ? colors.primary[500] : colors.bg.secondary,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 10,
                  justifyContent: 'center'
                }}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={keywordInput.trim() ? '#fff' : colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {/* Keywords Display */}
            {keywords.length > 0 && (
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8
              }}>
                {keywords.map((keyword, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.primary[50],
                      borderRadius: 20,
                      paddingVertical: 6,
                      paddingLeft: 12,
                      paddingRight: 8,
                      gap: 6
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      color: colors.primary[600],
                      fontWeight: '500'
                    }}>
                      {keyword}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveKeyword(index)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close-circle" size={18} color={colors.primary[400]} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Counter */}
            <Text style={{
              fontSize: 12,
              color: colors.text.secondary,
              marginTop: 8,
              textAlign: 'right'
            }}>
              {keywords.length}/5 palabras clave
            </Text>
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
