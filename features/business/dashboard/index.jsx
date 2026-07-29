import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, TouchableOpacity, View, ActivityIndicator, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import { useBusinessContexts } from '../../../shared/hooks/use-user-type';
import { colors } from '../../../shared/utils/colors';
import { useBusinessDashboard, useSocialDashboard } from '../../../shared/hooks/use-dashboard';
import { useBusinessProfile } from '../../../shared/hooks/use-business-profile';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import PostViewer from '../../shared/social/posts/post-viewer';

/**
 * Business Dashboard Screen
 * Dynamic dashboard with Negocio and Social tabs, date filters and real data.
 */
export default function BusinessDashboardScreen() {
  const router = useRouter();
  const businessContexts = useBusinessContexts();
  const currentBusiness = businessContexts[0] || null;
  const businessId = currentBusiness?.businessId || currentBusiness?.id;

  const { businessData: profile } = useBusinessProfile();

  const [activeTab, setActiveTab] = useState('negocio');
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Date filters
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [initialDateSet, setInitialDateSet] = useState(false);

  useEffect(() => {
    if (profile?.createdAt && !initialDateSet) {
      setStartDate(new Date(profile.createdAt));
      setInitialDateSet(true);
    }
  }, [profile?.createdAt, initialDateSet]);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Queries
  const { data: negocioData, isLoading: isLoadingNegocio } = useBusinessDashboard(
    activeTab === 'negocio' ? businessId : null,
    startDate,
    endDate
  );

  const { data: socialData, isLoading: isLoadingSocial } = useSocialDashboard(
    activeTab === 'social' ? businessId : null,
    startDate,
    endDate
  );

  const isLoading = activeTab === 'negocio' ? isLoadingNegocio : isLoadingSocial;

  const handleStartDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const handleEndDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

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

  const renderMetricCard = (title, value, icon, iconColor, bgIconColor) => (
    <View style={{
      flex: 1,
      minWidth: '45%',
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
        backgroundColor: bgIconColor,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12
      }}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={{
        fontSize: 11,
        fontWeight: '500',
        color: colors.text.secondary,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5
      }}>
        {title}
      </Text>
      <Text style={{
        fontSize: 24,
        fontWeight: '700',
        color: colors.text.primary,
      }}>
        {value}
      </Text>
    </View>
  );

  const renderPostCard = (post) => (
    <TouchableOpacity 
      key={post.id} 
      activeOpacity={0.8}
      onPress={() => setSelectedPost(post)}
      style={{ 
        backgroundColor: colors.bg.primary, 
        borderRadius: 12, 
        overflow: 'hidden',
        flexDirection: 'row',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Image
        source={{ uri: post.thumbnailUrl || (post.media && post.media[0]?.url) || 'https://via.placeholder.com/100' }}
        style={{ width: 90, height: 90, backgroundColor: colors.border.light }}
      />
      <View style={{ padding: 12, flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.primary, marginBottom: 8 }} numberOfLines={1}>
          {post.title || post.caption || 'Sin título'}
        </Text>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="eye-outline" size={14} color={colors.primary[500]} />
            <Text style={{ fontSize: 12, fontWeight: '500', color: colors.text.secondary }}>{post.viewCount}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="heart-outline" size={14} color="#ef4444" />
            <Text style={{ fontSize: 12, fontWeight: '500', color: colors.text.secondary }}>{post.likeCount}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="chatbubble-outline" size={14} color="#8b5cf6" />
            <Text style={{ fontSize: 12, fontWeight: '500', color: colors.text.secondary }}>{post.commentCount}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="pricetag-outline" size={14} color={colors.text.secondary} />
            <Text style={{ fontSize: 12, fontWeight: '500', color: colors.text.secondary }}>
              {Array.isArray(post.taggedProducts) ? post.taggedProducts.length : 0}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg.secondary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
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

        {/* Tabs */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          paddingVertical: 12,
          backgroundColor: colors.bg.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
          gap: 16,
        }}>
          <TouchableOpacity
            style={{ paddingBottom: 8, borderBottomWidth: activeTab === 'negocio' ? 2 : 0, borderBottomColor: colors.primary[500] }}
            onPress={() => setActiveTab('negocio')}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: activeTab === 'negocio' ? colors.primary[500] : colors.text.secondary }}>Negocio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingBottom: 8, borderBottomWidth: activeTab === 'social' ? 2 : 0, borderBottomColor: colors.primary[500] }}
            onPress={() => setActiveTab('social')}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: activeTab === 'social' ? colors.primary[500] : colors.text.secondary }}>Social</Text>
          </TouchableOpacity>
        </View>

        {/* Date Pickers */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          paddingVertical: 16,
          gap: 12,
          backgroundColor: colors.bg.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light
        }}>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.secondary, padding: 12, borderRadius: 12, gap: 8 }}
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.text.secondary} />
            <View>
              <Text style={{ fontSize: 10, color: colors.text.secondary, textTransform: 'uppercase' }}>Desde</Text>
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text.primary }}>{formatDate(startDate)}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.secondary, padding: 12, borderRadius: 12, gap: 8 }}
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.text.secondary} />
            <View>
              <Text style={{ fontSize: 10, color: colors.text.secondary, textTransform: 'uppercase' }}>Hasta</Text>
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text.primary }}>{formatDate(endDate)}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            minimumDate={profile?.createdAt ? new Date(profile.createdAt) : undefined}
            maximumDate={endDate}
            onChange={handleStartDateChange}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            minimumDate={startDate}
            maximumDate={new Date()}
            onChange={handleEndDateChange}
          />
        )}

        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
        ) : (
          <View style={{ padding: 20, gap: 20 }}>
            {activeTab === 'negocio' && negocioData && (
              <>
                {/* Negocio Metrics */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {renderMetricCard('Tickets Completados', negocioData.metrics.completedTickets, 'checkmark-circle-outline', colors.success[500], colors.success[50])}
                  {renderMetricCard('Órdenes Pendientes', negocioData.metrics.pendingOrders, 'time-outline', colors.warning[500], colors.warning[50])}
                  {renderMetricCard('Ingreso Bruto', `$${negocioData.metrics.grossRevenue.toLocaleString()}`, 'cash-outline', '#10b981', '#10b98120')}
                  {renderMetricCard('Prod. Vendidos', negocioData.metrics.productsSold, 'cube-outline', '#8b5cf6', '#8b5cf620')}
                </View>

                {/* Top 5 Products */}
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 12 }}>Top 5 Productos Más Vendidos</Text>
                  {negocioData.topProducts.length === 0 ? (
                    <Text style={{ color: colors.text.secondary }}>No hay datos suficientes.</Text>
                  ) : (
                    <View style={{ backgroundColor: colors.bg.primary, borderRadius: 16, overflow: 'hidden' }}>
                      {negocioData.topProducts.map((item, index) => (
                        <View key={item.id} style={{
                          flexDirection: 'row', alignItems: 'center', padding: 16,
                          borderBottomWidth: index === negocioData.topProducts.length - 1 ? 0 : 1,
                          borderBottomColor: colors.border.light
                        }}>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.secondary, width: 24 }}>{index + 1}</Text>
                          <Image
                            source={{ uri: item.thumbnailUrl || (item.images && item.images[0]) || 'https://via.placeholder.com/40' }}
                            style={{ width: 40, height: 40, borderRadius: 8, marginHorizontal: 12 }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>{item.name}</Text>
                            <Text style={{ fontSize: 12, color: colors.text.secondary }}>${Number(item.price).toFixed(2)}</Text>
                          </View>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary[500] }}>{item.totalSold} vendidos</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Recent Orders */}
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary }}>Pedidos Recientes</Text>
                    <TouchableOpacity onPress={() => router.push('/business')}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary[500] }}>Ver todo</Text>
                    </TouchableOpacity>
                  </View>
                  {negocioData.recentOrders.length === 0 ? (
                    <Text style={{ color: colors.text.secondary }}>No hay pedidos recientes.</Text>
                  ) : (
                    <View style={{ backgroundColor: colors.bg.primary, borderRadius: 16, padding: 16 }}>
                      {negocioData.recentOrders.map((order, index) => (
                        <View key={order.id} style={{
                          flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
                          borderBottomWidth: index === negocioData.recentOrders.length - 1 ? 0 : 1,
                          borderBottomColor: colors.border.light
                        }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}>
                              {order.client?.displayName || order.client?.firstName || 'Cliente'}
                            </Text>
                            <Text style={{ fontSize: 13, color: colors.text.secondary }}>
                              {new Date(order.createdAt).toLocaleDateString('es-ES')}
                            </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 4 }}>
                              ${Number(order.totalAmount).toLocaleString()}
                            </Text>
                            <View style={{
                              paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
                              backgroundColor: getStatusColor(order.status) + '15'
                            }}>
                              <Text style={{
                                fontSize: 11, fontWeight: '600',
                                color: getStatusColor(order.status)
                              }}>
                                {getStatusLabel(order.status)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </>
            )}

            {activeTab === 'social' && socialData && (
              <>
                {/* Social Metrics */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {renderMetricCard('Vistas', socialData.metrics.totalViews, 'eye-outline', '#3b82f6', '#3b82f620')}
                  {renderMetricCard('Likes', socialData.metrics.totalLikes, 'heart-outline', '#ef4444', '#ef444420')}
                  {renderMetricCard('Comentarios', socialData.metrics.totalComments, 'chatbubble-outline', '#8b5cf6', '#8b5cf620')}
                  {renderMetricCard('Compartidos', socialData.metrics.totalShares, 'share-social-outline', colors.primary[500], colors.primary[50])}
                </View>

                {/* Top 3 Posts */}
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 12 }}>Top 3 Posts (Más Vistos)</Text>
                  {socialData.topPosts.length === 0 ? (
                    <Text style={{ color: colors.text.secondary }}>No hay posts suficientes.</Text>
                  ) : (
                    <View>
                      {socialData.topPosts.map(renderPostCard)}
                    </View>
                  )}
                </View>

                {/* Bottom 3 Posts */}
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 12 }}>Posts Menos Vistos</Text>
                  {socialData.bottomPosts.length === 0 ? (
                    <Text style={{ color: colors.text.secondary }}>No hay posts suficientes.</Text>
                  ) : (
                    <View>
                      {socialData.bottomPosts.map(renderPostCard)}
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Post Viewer Modal */}
      {selectedPost && (
        <PostViewer
          post={selectedPost}
          visible={!!selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </SafeAreaView>
  );
}
