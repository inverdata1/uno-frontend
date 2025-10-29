import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../shared/components/ui';
import { colors } from '../../../shared/utils/colors';

export default function BusinessStoreScreen() {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
      {/* Header */}
      <View style={{
        padding: 20,
        paddingTop: 12,
        backgroundColor: colors.bg.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light
      }}>
        <Text style={{
          fontSize: 28,
          fontWeight: '700',
          color: colors.text.primary,
          marginBottom: 4
        }}>
          Mi Tienda
        </Text>
        <Text style={{
          fontSize: 15,
          color: colors.text.secondary
        }}>
          Pedidos y productos
        </Text>
      </View>

      {/* Tabs */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.bg.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light
      }}>
        <TouchableOpacity
          onPress={() => setActiveTab('orders')}
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: activeTab === 'orders' ? colors.primary[500] : colors.bg.secondary,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Ionicons
            name={activeTab === 'orders' ? 'receipt' : 'receipt-outline'}
            size={18}
            color={activeTab === 'orders' ? colors.text.inverse : colors.text.secondary}
          />
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: activeTab === 'orders' ? colors.text.inverse : colors.text.secondary
          }}>
            Pedidos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('products')}
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: activeTab === 'products' ? colors.primary[500] : colors.bg.secondary,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Ionicons
            name={activeTab === 'products' ? 'cube' : 'cube-outline'}
            size={18}
            color={activeTab === 'products' ? colors.text.inverse : colors.text.secondary}
          />
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: activeTab === 'products' ? colors.text.inverse : colors.text.secondary
          }}>
            Productos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'orders' ? (
          <View style={{ padding: 20 }}>
            <View style={{
              backgroundColor: colors.bg.primary,
              borderRadius: 16,
              padding: 40,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary[50],
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <Ionicons name="receipt-outline" size={40} color={colors.primary[500]} />
              </View>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: 8,
                textAlign: 'center'
              }}>
                No tienes pedidos
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.text.secondary,
                textAlign: 'center'
              }}>
                Los pedidos de tus clientes aparecerán aquí
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            <View style={{
              backgroundColor: colors.bg.primary,
              borderRadius: 16,
              padding: 40,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#8b5cf620',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <Ionicons name="cube-outline" size={40} color="#8b5cf6" />
              </View>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: 8,
                textAlign: 'center'
              }}>
                Aún no tienes productos
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.text.secondary,
                textAlign: 'center',
                marginBottom: 20
              }}>
                Comienza agregando productos a tu catálogo
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary[500],
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Ionicons name="add" size={20} color={colors.text.inverse} />
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.inverse
                }}>
                  Agregar producto
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
