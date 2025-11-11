import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import { useBusinessContexts } from '../../../shared/hooks/use-user-type';
import { colors } from '../../../shared/utils/colors';

/**
 * Business Dashboard Screen
 * Modern dashboard with stats, trends, and quick actions
 */
export default function BusinessDashboardScreen() {
  const businessContexts = useBusinessContexts();
  const currentBusiness = businessContexts[0] || null;
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const periods = [
    { key: 'today', label: 'Hoy' },
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' },
  ];

  // Mock data - replace with real API data later
  const stats = {
    today: {
      orders: 12,
      ordersChange: '+15%',
      revenue: 0,
      revenueChange: '+22%',
      avgOrder: 204,
      avgOrderChange: '+8%',
      customers: 8,
      customersChange: '+12%',
    },
    week: {
      orders: 67,
      ordersChange: '+18%',
      revenue: 0,
      revenueChange: '+25%',
      avgOrder: 214,
      avgOrderChange: '+5%',
      customers: 42,
      customersChange: '+15%',
    },
    month: {
      orders: 248,
      ordersChange: '+28%',
      revenue: 0,
      revenueChange: '+32%',
      avgOrder: 213,
      avgOrderChange: '+3%',
      customers: 156,
      customersChange: '+24%',
    },
  };

  const currentStats = stats[selectedPeriod];

  const quickActions = [
    { icon: 'receipt', label: 'Pedidos', color: colors.primary[500], route: '/business' },
    { icon: 'cube', label: 'Productos', color: '#8b5cf6', route: '/feed' },
    { icon: 'megaphone', label: 'Promociones', color: '#f59e0b', route: '/business/promotions' },
    { icon: 'settings', label: 'Ajustes', color: '#6b7280', route: '/business/settings' },
  ];

  const recentOrders = [
    { id: '1', customer: 'María García', total: 245, status: 'pending', time: 'Hace 5 min' },
    { id: '2', customer: 'Juan Pérez', total: 189, status: 'preparing', time: 'Hace 12 min' },
    { id: '3', customer: 'Ana López', total: 312, status: 'ready', time: 'Hace 25 min' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return colors.warning[500];
      case 'preparing': return colors.primary[500];
      case 'ready': return colors.success[500];
      default: return colors.text.secondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      default: return status;
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg.secondary }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <View style={{
        padding: 20,
        paddingTop: 12,
        backgroundColor: colors.bg.primary
      }}>
        <Text style={{
          fontSize: 28,
          fontWeight: '700',
          color: colors.text.primary,
          marginBottom: 4
        }}>
          Dashboard
        </Text>
        <Text style={{
          fontSize: 15,
          color: colors.text.secondary
        }}>
          {currentBusiness?.businessName || 'Tu Negocio'}
        </Text>
      </View>

      {/* Period Selector */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 8,
        backgroundColor: colors.bg.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light
      }}>
        {periods.map(period => (
          <TouchableOpacity
            key={period.key}
            onPress={() => setSelectedPeriod(period.key)}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: selectedPeriod === period.key ? colors.primary[500] : colors.bg.secondary,
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: selectedPeriod === period.key ? colors.text.inverse : colors.text.secondary
            }}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Grid */}
      <View style={{ padding: 20, gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Orders Card */}
          <View style={{
            flex: 1,
            backgroundColor: colors.bg.primary,
            borderRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.primary[50],
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12
            }}>
              <Ionicons name="receipt" size={20} color={colors.primary[500]} />
            </View>
            <Text style={{
              fontSize: 11,
              fontWeight: '500',
              color: colors.text.secondary,
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              Pedidos
            </Text>
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.text.primary,
              marginBottom: 4
            }}>
              {currentStats.orders}
            </Text>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.success[600]
            }}>
              {currentStats.ordersChange}
            </Text>
          </View>

          {/* Revenue Card */}
          <View style={{
            flex: 1,
            backgroundColor: colors.bg.primary,
            borderRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: '#10b98120',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12
            }}>
              <Ionicons name="trending-up" size={20} color="#10b981" />
            </View>
            <Text style={{
              fontSize: 11,
              fontWeight: '500',
              color: colors.text.secondary,
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              Ingresos
            </Text>
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.text.primary,
              marginBottom: 4
            }}>
              ${currentStats.revenue.toLocaleString()}
            </Text>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.success[600]
            }}>
              {currentStats.revenueChange}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Avg Order Card */}
          <View style={{
            flex: 1,
            backgroundColor: colors.bg.primary,
            borderRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: '#8b5cf620',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12
            }}>
              <Ionicons name="cash" size={20} color="#8b5cf6" />
            </View>
            <Text style={{
              fontSize: 11,
              fontWeight: '500',
              color: colors.text.secondary,
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              Ticket Prom.
            </Text>
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.text.primary,
              marginBottom: 4
            }}>
              ${currentStats.avgOrder}
            </Text>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.success[600]
            }}>
              {currentStats.avgOrderChange}
            </Text>
          </View>

          {/* Customers Card */}
          <View style={{
            flex: 1,
            backgroundColor: colors.bg.primary,
            borderRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: '#f59e0b20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12
            }}>
              <Ionicons name="people" size={20} color="#f59e0b" />
            </View>
            <Text style={{
              fontSize: 11,
              fontWeight: '500',
              color: colors.text.secondary,
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              Clientes
            </Text>
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.text.primary,
              marginBottom: 4
            }}>
              {currentStats.customers}
            </Text>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.success[600]
            }}>
              {currentStats.customersChange}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text.primary,
          marginBottom: 12
        }}>
          Acciones Rápidas
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flex: 1,
                backgroundColor: colors.bg.primary,
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: action.color + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8
              }}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors.text.primary,
                textAlign: 'center'
              }}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Orders */}
      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text.primary
          }}>
            Pedidos Recientes
          </Text>
          <TouchableOpacity>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.primary[500]
            }}>
              Ver todos
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{
          backgroundColor: colors.bg.primary,
          borderRadius: 16,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}>
          {recentOrders.map((order, index) => (
            <TouchableOpacity
              key={order.id}
              style={{
                padding: 16,
                borderBottomWidth: index < recentOrders.length - 1 ? 1 : 0,
                borderBottomColor: colors.border.light,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: colors.text.primary,
                    marginBottom: 4
                  }}>
                    {order.customer}
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: colors.text.secondary
                  }}>
                    {order.time}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: colors.text.primary,
                    marginBottom: 4
                  }}>
                    ${order.total}
                  </Text>
                  <View style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    backgroundColor: getStatusColor(order.status) + '20'
                  }}>
                    <Text style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: getStatusColor(order.status)
                    }}>
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
