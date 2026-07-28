import React, { useState } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../shared/components/ui';
import { colors } from '../../../shared/utils/colors';

const TABS = [
  { id: 'in_progress', label: 'En proceso' },
  { id: 'completed', label: 'Completados' },
  { id: 'cancelled', label: 'Cancelados' }
];

export default function BusinessOrdersScreen() {
  const [activeTab, setActiveTab] = useState('in_progress');

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
          Pedidos
        </Text>
      </View>

      {/* Tabs */}
      <View style={{ backgroundColor: colors.bg.primary }}>
        <View style={{
          flexDirection: 'row',
          marginHorizontal: 16,
          marginVertical: 12,
          backgroundColor: colors.bg.secondary,
          borderRadius: 8,
          padding: 4,
        }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: 'center',
                  backgroundColor: isActive ? colors.bg.primary : 'transparent',
                  borderRadius: 6,
                  shadowColor: isActive ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: isActive ? 2 : 0,
                }}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? colors.text.primary : colors.text.secondary
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content */}
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
          Cuando recibas pedidos en estado "{TABS.find(t => t.id === activeTab)?.label}" aparecerán aquí
        </Text>
      </View>
    </SafeAreaView>
  );
}
