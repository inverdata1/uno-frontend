import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../shared/components/ui';
import { useBusinessContexts, useCurrentUserType } from '../../../shared/hooks/use-user-type';
import { useAppStore } from '../../../shared/stores/app-store';
import { colors } from '../../../shared/utils/colors';
import { getModeColors } from '../../../shared/utils/colors';

export default function BusinessProfileScreen() {
  const businessContexts = useBusinessContexts();
  const currentBusiness = businessContexts[0] || null;
  const { availableUserTypes = [] } = useCurrentUserType();
  const { openUserTypeSwitcher } = useAppStore();
  const [activeTab, setActiveTab] = useState('posts');
  const businessColors = getModeColors('business');

  // Mock data - replace with real data
  const stats = {
    followers: 1234,
    posts: 45,
    products: 28,
    rating: 4.8,
    reviews: 156
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <View style={{ position: 'relative', height: 200 }}>
          <LinearGradient
            colors={businessColors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: '100%', height: '100%' }}
          />

          {/* Mode Switcher Button - Top Left */}
          {availableUserTypes.length > 1 && (
            <TouchableOpacity
              onPress={openUserTypeSwitcher}
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Ionicons name="briefcase" size={18} color="#fff" />
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#fff'
              }}>
                Negocio
              </Text>
              <Ionicons name="chevron-down" size={16} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Edit Cover Button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={{
          backgroundColor: colors.bg.primary,
          marginTop: -40,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingTop: 24,
          paddingHorizontal: 20
        }}>
          {/* Logo/Avatar */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 24,
              backgroundColor: businessColors.primary,
              borderWidth: 4,
              borderColor: colors.bg.primary,
              marginTop: -60,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8
            }}>
              <Text style={{
                fontSize: 40,
                fontWeight: '700',
                color: colors.text.inverse
              }}>
                {currentBusiness?.businessName?.charAt(0) || 'N'}
              </Text>
            </View>

            {/* Edit Logo Button */}
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: -8,
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: businessColors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: colors.bg.primary
              }}
            >
              <Ionicons name="camera" size={16} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>

          {/* Business Name & Type */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.text.primary,
              marginBottom: 4
            }}>
              {currentBusiness?.businessName || 'Mi Negocio'}
            </Text>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8
            }}>
              <View style={{
                backgroundColor: businessColors.background,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: businessColors.primary + '40'
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: businessColors.primary
                }}>
                  {currentBusiness?.businessType || 'Restaurante'}
                </Text>
              </View>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8
              }}>
                <Ionicons name="shield-checkmark" size={12} color="#3b82f6" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#3b82f6' }}>
                  Verificado
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.bg.secondary,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            gap: 12
          }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: 2
              }}>
                {stats.followers}
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.text.secondary
              }}>
                Seguidores
              </Text>
            </View>

            <View style={{ width: 1, backgroundColor: colors.border.light }} />

            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                marginBottom: 2
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: colors.text.primary
                }}>
                  {stats.rating}
                </Text>
                <Ionicons name="star" size={16} color="#f59e0b" />
              </View>
              <Text style={{
                fontSize: 12,
                color: colors.text.secondary
              }}>
                {stats.reviews} reseñas
              </Text>
            </View>

            <View style={{ width: 1, backgroundColor: colors.border.light }} />

            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: 2
              }}>
                {stats.products}
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.text.secondary
              }}>
                Productos
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{
            flexDirection: 'row',
            gap: 12,
            marginBottom: 24
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: businessColors.primary,
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: businessColors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <Ionicons name="create" size={18} color={colors.text.inverse} />
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text.inverse
              }}>
                Editar Perfil
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.bg.secondary,
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderWidth: 1.5,
                borderColor: colors.border.light
              }}
            >
              <Ionicons name="share-social" size={18} color={colors.text.primary} />
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text.primary
              }}>
                Compartir
              </Text>
            </TouchableOpacity>
          </View>

          {/* Business Info */}
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            gap: 12
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.bg.primary,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="location" size={20} color={businessColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 2
                }}>
                  Dirección
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.text.secondary
                }}>
                  Av. Principal 123, Ciudad
                </Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: colors.border.light }} />

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.bg.primary,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="time" size={20} color={businessColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 2
                }}>
                  Horario
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.text.secondary
                }}>
                  Lun - Dom: 9:00 AM - 10:00 PM
                </Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: colors.border.light }} />

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.bg.primary,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="call" size={20} color={businessColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 2
                }}>
                  Teléfono
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.text.secondary
                }}>
                  +1 (555) 123-4567
                </Text>
              </View>
            </View>
          </View>

          {/* Content Tabs */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.bg.secondary,
            borderRadius: 12,
            padding: 4,
            marginBottom: 20
          }}>
            <TouchableOpacity
              onPress={() => setActiveTab('posts')}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: activeTab === 'posts' ? colors.bg.primary : 'transparent',
                alignItems: 'center'
              }}
            >
              <Ionicons
                name={activeTab === 'posts' ? 'grid' : 'grid-outline'}
                size={20}
                color={activeTab === 'posts' ? colors.text.primary : colors.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('products')}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: activeTab === 'products' ? colors.bg.primary : 'transparent',
                alignItems: 'center'
              }}
            >
              <Ionicons
                name={activeTab === 'products' ? 'cube' : 'cube-outline'}
                size={20}
                color={activeTab === 'products' ? colors.text.primary : colors.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('reviews')}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: activeTab === 'reviews' ? colors.bg.primary : 'transparent',
                alignItems: 'center'
              }}
            >
              <Ionicons
                name={activeTab === 'reviews' ? 'star' : 'star-outline'}
                size={20}
                color={activeTab === 'reviews' ? colors.text.primary : colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <View style={{ paddingBottom: 32 }}>
            {activeTab === 'posts' && (
              <View style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 16,
                padding: 40,
                alignItems: 'center'
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.bg.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Ionicons name="images-outline" size={40} color={colors.text.secondary} />
                </View>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.text.primary,
                  marginBottom: 8,
                  textAlign: 'center'
                }}>
                  Aún no tienes posts
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.text.secondary,
                  textAlign: 'center'
                }}>
                  Tus posts aparecerán aquí
                </Text>
              </View>
            )}

            {activeTab === 'products' && (
              <View style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 16,
                padding: 40,
                alignItems: 'center'
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.bg.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Ionicons name="cube-outline" size={40} color={colors.text.secondary} />
                </View>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.text.primary,
                  marginBottom: 8,
                  textAlign: 'center'
                }}>
                  Sin productos
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.text.secondary,
                  textAlign: 'center'
                }}>
                  Tus productos aparecerán aquí
                </Text>
              </View>
            )}

            {activeTab === 'reviews' && (
              <View style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 16,
                padding: 40,
                alignItems: 'center'
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.bg.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Ionicons name="star-outline" size={40} color={colors.text.secondary} />
                </View>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.text.primary,
                  marginBottom: 8,
                  textAlign: 'center'
                }}>
                  Sin reseñas
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.text.secondary,
                  textAlign: 'center'
                }}>
                  Las reseñas de tus clientes aparecerán aquí
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}
