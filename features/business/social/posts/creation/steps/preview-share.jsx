import React from 'react';
import { View, TouchableOpacity, Image, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../../../shared/components/ui';
import { colors } from '../../../../../../shared/utils/colors';

const { width } = Dimensions.get('window');

/**
 * Step 4: Preview & Share
 * Final preview before publishing
 */
export function PreviewShareStep({
  selectedMedia,
  taggedProducts,
  caption,
  postType,
  isUploading,
  onPublish,
  onBack
}) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light
      }}>
        <TouchableOpacity onPress={onBack} disabled={isUploading}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={isUploading ? colors.text.secondary : colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text.primary
        }}>
          Vista previa
        </Text>
        <TouchableOpacity
          onPress={onPublish}
          disabled={isUploading}
          style={{
            backgroundColor: isUploading ? colors.bg.secondary : colors.primary[500],
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20
          }}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={colors.text.secondary} />
          ) : (
            <Text style={{
              fontSize: 15,
              fontWeight: '700',
              color: colors.text.inverse
            }}>
              Publicar
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Post Preview */}
        <View style={{
          backgroundColor: colors.bg.primary,
          marginBottom: 16
        }}>
          {/* Post Header (Business info - placeholder) */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            gap: 8
          }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.primary[500],
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="storefront" size={18} color={colors.text.inverse} />
            </View>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.primary
            }}>
              Tu Negocio
            </Text>
          </View>

          {/* Media */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {selectedMedia.map((media, index) => (
              <View key={index} style={{ width, backgroundColor: colors.bg.secondary }}>
                <Image
                  source={{ uri: media.uri }}
                  style={{
                    width: width,
                    height: width * 1.25, // 4:5 aspect ratio
                  }}
                  resizeMode="cover"
                />
                {media.type === 'video' && (
                  <View style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: 8,
                    padding: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Ionicons name="videocam" size={16} color="#fff" />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>
                      VIDEO
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Carousel Indicator */}
          {selectedMedia.length > 1 && (
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 4,
              paddingVertical: 8
            }}>
              {selectedMedia.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: index === 0 ? colors.primary[500] : colors.border.light
                  }}
                />
              ))}
            </View>
          )}

          {/* Post Actions */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            gap: 16
          }}>
            <Ionicons name="heart-outline" size={26} color={colors.text.primary} />
            <Ionicons name="chatbubble-outline" size={24} color={colors.text.primary} />
            <Ionicons name="paper-plane-outline" size={24} color={colors.text.primary} />
          </View>

          {/* Caption */}
          {caption && (
            <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
              <Text style={{
                fontSize: 14,
                color: colors.text.primary,
                lineHeight: 18
              }}>
                <Text style={{ fontWeight: '600' }}>Tu Negocio </Text>
                {caption}
              </Text>
            </View>
          )}

          {/* Tagged Products */}
          {taggedProducts.length > 0 && (
            <View style={{
              paddingHorizontal: 12,
              paddingBottom: 12
            }}>
              <TouchableOpacity style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4
              }}>
                <Ionicons name="pricetag" size={16} color={colors.text.secondary} />
                <Text style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: colors.text.secondary
                }}>
                  Ver productos ({taggedProducts.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Post Summary */}
        <View style={{
          padding: 16,
          backgroundColor: colors.bg.secondary,
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 12
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: 12
          }}>
            Resumen de publicación
          </Text>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="images" size={20} color={colors.text.secondary} />
              <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                {selectedMedia.length} {selectedMedia.length === 1 ? 'media' : 'medias'} • {postType}
              </Text>
            </View>

            {taggedProducts.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="pricetag" size={20} color={colors.text.secondary} />
                <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                  {taggedProducts.length} {taggedProducts.length === 1 ? 'producto etiquetado' : 'productos etiquetados'}
                </Text>
              </View>
            )}

            {caption && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="text" size={20} color={colors.text.secondary} />
                <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                  {caption.length} caracteres
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Upload Status */}
        {isUploading && (
          <View style={{
            padding: 16,
            backgroundColor: colors.primary[50],
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 12
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <ActivityIndicator size="small" color={colors.primary[500]} />
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: colors.primary[700],
                  marginBottom: 2
                }}>
                  Publicando...
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: colors.primary[600]
                }}>
                  Subiendo medias y procesando productos
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
