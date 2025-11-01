import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../shared/components/ui';
import { colors } from '../../../shared/utils/colors';
import { ProductsGrid } from '../../../modules/business/social/components/products-grid';

export default function BusinessStoreScreen() {
  const [activeTab, setActiveTab] = useState('products');
  const [createModalVisible, setCreateModalVisible] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
      {/* Minimal Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.bg.primary,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border.light
      }}>
        <Text style={{
          fontSize: 20,
          fontWeight: '700',
          color: colors.text.primary,
          letterSpacing: 0.3
        }}>
          Mi Tienda
        </Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar - Instagram style */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.bg.primary,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border.light
      }}>
        <TouchableOpacity
          onPress={() => setActiveTab('products')}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: activeTab === 'products' ? 2 : 0,
            borderBottomColor: colors.primary[500]
          }}
        >
          <Ionicons
            name="grid"
            size={22}
            color={activeTab === 'products' ? colors.primary[500] : colors.text.secondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('orders')}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: activeTab === 'orders' ? 2 : 0,
            borderBottomColor: colors.primary[500]
          }}
        >
          <Ionicons
            name="receipt"
            size={22}
            color={activeTab === 'orders' ? colors.primary[500] : colors.text.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'orders' ? (
        <View style={{ flex: 1, backgroundColor: colors.bg.secondary, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            borderWidth: 2,
            borderColor: colors.border.light,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}>
            <Ionicons name="receipt-outline" size={32} color={colors.text.secondary} />
          </View>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: 8,
            textAlign: 'center'
          }}>
            No hay pedidos aún
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.text.secondary,
            textAlign: 'center'
          }}>
            Cuando recibas pedidos aparecerán aquí
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1, position: 'relative', backgroundColor: colors.bg.secondary }}>
          <ProductsGrid
            createModalVisible={createModalVisible}
            setCreateModalVisible={setCreateModalVisible}
          />
          {/* Floating Add Button - Fixed to bottom right */}
          <TouchableOpacity
            onPress={() => setCreateModalVisible(true)}
            style={{
              position: 'absolute',
              bottom: 24,
              right: 20,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primary[500],
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8
            }}
          >
            <Ionicons name="add" size={28} color={colors.text.inverse} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
