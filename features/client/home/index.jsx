import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../shared/components/ui';
import { AdaptiveHeader } from '../../../shared/components/layout/adaptive-header';

/**
 * Client Home Screen
 * Shows categories, offers, and upcoming social feed
 */
export default function ClientHomeScreen() {
  const categories = [
    { icon: 'restaurant', title: 'Restaurantes', color: '#ef4444' },
    { icon: 'storefront', title: 'Supermercado', color: '#10b981' },
    { icon: 'medical', title: 'Farmacia', color: '#3b82f6' },
    { icon: 'wine', title: 'Licores', color: '#8b5cf6' },
    { icon: 'flower', title: 'Flores', color: '#ec4899' },
    { icon: 'hardware-chip', title: 'Tecnología', color: '#64748b' },
  ];

  const offers = [
    { title: 'Envío gratis', subtitle: 'En pedidos +$20', color: '#10b981' },
    { title: '30% OFF', subtitle: 'Tiendas selectas', color: '#ef4444' },
    { title: 'Nuevos usuarios', subtitle: 'Descuento especial', color: '#3b82f6' },
  ];

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Adaptive Header */}
      <AdaptiveHeader />

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <TouchableOpacity style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
          borderWidth: 1,
          borderColor: '#f1f5f9'
        }}>
          <Ionicons name="search" size={20} color="#64748b" style={{ marginRight: 12 }} />
          <Text style={{
            color: '#64748b',
            fontSize: 16
          }}>
            Buscar productos, tiendas...
          </Text>
        </TouchableOpacity>
      </View>

      {/* Offers Banner */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingTop: 16 }}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
      >
        {offers.map((offer, index) => (
          <TouchableOpacity
            key={index}
            style={{
              backgroundColor: offer.color,
              borderRadius: 12,
              padding: 16,
              width: 160,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3
            }}
          >
            <Text style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: '700',
              marginBottom: 4
            }}>
              {offer.title}
            </Text>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 13
            }}>
              {offer.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Categories */}
      <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: 16
        }}>
          Categorías
        </Text>

        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 32
        }}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                width: '30%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2
              }}
              activeOpacity={0.7}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: category.color + '15',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8
              }}>
                <Ionicons name={category.icon} size={20} color={category.color} />
              </View>
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#1f2937',
                textAlign: 'center'
              }}>
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Social Media Feed Section */}
        <View style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
          marginBottom: 24
        }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#f1f5f9',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}>
            <Ionicons name="people-outline" size={32} color="#64748b" />
          </View>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: 8
          }}>
            ¡Próximamente Feed Social!
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#64748b',
            textAlign: 'center',
            marginBottom: 20
          }}>
            Aquí verás las recomendaciones de tus amigos, reseñas y experiencias
          </Text>
          <View style={{
            backgroundColor: '#f8fafc',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8
          }}>
            <Text style={{
              fontSize: 12,
              color: '#64748b',
              fontWeight: '500'
            }}>
              Función en desarrollo
            </Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}
