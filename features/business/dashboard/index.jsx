import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Platform, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Text } from '../../../shared/components/ui';
import { PostThumbnail } from '../../../shared/components/media/post-thumbnail';
import { useBusinessContexts } from '../../../shared/hooks/use-user-type';
import { useBusinessProfile } from '../../../shared/hooks/use-business-profile';
import { useSocialDashboard } from '../../../shared/hooks/use-dashboard';
import { colors } from '../../../shared/utils/colors';
import PostViewer from '../../shared/social/posts/post-viewer';

const DAY_MS = 24 * 60 * 60 * 1000;

const RANGE_PRESETS = [
  { id: '7d', label: '7 días', days: 7 },
  { id: '30d', label: '30 días', days: 30 },
  { id: '90d', label: '90 días', days: 90 },
  { id: 'all', label: 'Todo' },
  { id: 'custom', label: 'Personalizado' },
];

const METRICS = [
  { key: 'totalViews', label: 'Vistas', icon: 'eye', color: '#3b82f6' },
  { key: 'totalLikes', label: 'Me gusta', icon: 'heart', color: '#ef4444' },
  { key: 'totalComments', label: 'Comentarios', icon: 'chatbubble', color: '#8b5cf6' },
  { key: 'totalShares', label: 'Compartidos', icon: 'paper-plane', color: '#f59e0b' },
];

// 12.3K / 1.2M so big numbers fit in the cards
const formatCount = (value) => {
  const n = Number(value) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
};

const formatDate = (date) =>
  date ? date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const cardShadow = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
};

/**
 * Business Dashboard Screen
 * Social performance of the business' posts for a date range.
 */
export default function BusinessDashboardScreen() {
  const router = useRouter();
  const businessContexts = useBusinessContexts();
  const currentBusiness = businessContexts[0] || null;
  const businessId = currentBusiness?.businessId || currentBusiness?.id;

  const { businessData: profile } = useBusinessProfile();
  const businessCreatedAt = profile?.createdAt ? new Date(profile.createdAt) : null;

  const [selectedPost, setSelectedPost] = useState(null);
  const [rangeId, setRangeId] = useState('30d');
  const [customStart, setCustomStart] = useState(new Date(Date.now() - 30 * DAY_MS));
  const [customEnd, setCustomEnd] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Snap to day boundaries so the query key doesn't change on every render
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    if (rangeId === 'custom') {
      const s = new Date(customStart);
      s.setHours(0, 0, 0, 0);
      const e = new Date(customEnd);
      e.setHours(23, 59, 59, 999);
      return { startDate: s, endDate: e };
    }

    const preset = RANGE_PRESETS.find((p) => p.id === rangeId);
    if (!preset?.days) {
      return { startDate: businessCreatedAt || new Date(2020, 0, 1), endDate: end };
    }
    const start = new Date(end.getTime() - preset.days * DAY_MS);
    start.setHours(0, 0, 0, 0);
    return { startDate: start, endDate: end };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeId, customStart, customEnd, profile?.createdAt]);

  useEffect(() => {
    if (rangeId !== 'custom') {
      setShowStartPicker(false);
      setShowEndPicker(false);
    }
  }, [rangeId]);

  const { data, isLoading, isRefetching, refetch } = useSocialDashboard(businessId, startDate, endDate);

  const metrics = data?.metrics || {};
  const topPosts = data?.topPosts || [];
  // With 3 posts or fewer the "least viewed" list would just repeat the top list
  const bottomPosts = topPosts.length >= 3 ? (data?.bottomPosts || []).filter((p) => !topPosts.some((t) => t.id === p.id)) : [];
  const hasPosts = topPosts.length > 0;

  const interactions = (metrics.totalLikes || 0) + (metrics.totalComments || 0) + (metrics.totalShares || 0);
  const engagementRate = metrics.totalViews ? (interactions / metrics.totalViews) * 100 : 0;

  const handleStartDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (selectedDate) setCustomStart(selectedDate);
  };

  const handleEndDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (selectedDate) setCustomEnd(selectedDate);
  };

  const businessName = profile?.businessName || currentBusiness?.name || currentBusiness?.businessName || 'Tu negocio';

  const renderStat = (icon, value, color) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <Ionicons name={icon} size={13} color={color} />
      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.secondary }}>{formatCount(value)}</Text>
    </View>
  );

  const renderTopPost = (post, index) => (
    <TouchableOpacity
      key={post.id}
      activeOpacity={0.9}
      onPress={() => setSelectedPost(post)}
      style={{ width: 150, borderRadius: 18, backgroundColor: colors.bg.primary, overflow: 'hidden', ...cardShadow }}
    >
      <View style={{ width: '100%', height: 190, backgroundColor: colors.border.light }}>
        <PostThumbnail post={post} iconSize={32} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.65)']}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 }}
        />
        <View style={{
          position: 'absolute', top: 10, left: 10,
          width: 26, height: 26, borderRadius: 13,
          backgroundColor: index === 0 ? '#f59e0b' : 'rgba(255,255,255,0.92)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: index === 0 ? '#ffffff' : colors.text.primary }}>{index + 1}</Text>
        </View>
        {post.type === 'video' && (
          <View style={{ position: 'absolute', top: 10, right: 10 }}>
            <Ionicons name="play-circle" size={22} color="rgba(255,255,255,0.95)" />
          </View>
        )}
        <View style={{ position: 'absolute', left: 10, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="eye" size={14} color="#ffffff" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>{formatCount(post.viewCount)}</Text>
        </View>
      </View>
      <View style={{ padding: 10, gap: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.primary }} numberOfLines={1}>
          {post.title || post.caption || 'Sin título'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {renderStat('heart', post.likeCount, '#ef4444')}
          {renderStat('chatbubble', post.commentCount, '#8b5cf6')}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLowPost = (post, index, list) => (
    <TouchableOpacity
      key={post.id}
      activeOpacity={0.8}
      onPress={() => setSelectedPost(post)}
      style={{
        flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12,
        borderBottomWidth: index === list.length - 1 ? 0 : 1,
        borderBottomColor: colors.border.light,
      }}
    >
      <View style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.border.light }}>
        <PostThumbnail post={post} iconSize={20} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }} numberOfLines={1}>
          {post.title || post.caption || 'Sin título'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {renderStat('eye', post.viewCount, '#3b82f6')}
          {renderStat('heart', post.likeCount, '#ef4444')}
          {renderStat('chatbubble', post.commentCount, '#8b5cf6')}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary || '#94a3b8'} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg.secondary }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary[500]} />}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {profile?.logoUrl ? (
            <Image source={{ uri: profile.logoUrl }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.border.light }} />
          ) : (
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary[100], alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="storefront" size={20} color={colors.primary[500]} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: colors.text.secondary }} numberOfLines={1}>{businessName}</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text.primary }}>Rendimiento social</Text>
          </View>
        </View>

        {/* Range presets */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}
        >
          {RANGE_PRESETS.map((preset) => {
            const active = rangeId === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                onPress={() => setRangeId(preset.id)}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                  backgroundColor: active ? colors.text.primary : colors.bg.primary,
                  borderWidth: 1, borderColor: active ? colors.text.primary : colors.border.light,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#ffffff' : colors.text.secondary }}>{preset.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {rangeId === 'custom' && (
          <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 8 }}>
            {[
              { label: 'Desde', date: customStart, onPress: () => setShowStartPicker((v) => !v) },
              { label: 'Hasta', date: customEnd, onPress: () => setShowEndPicker((v) => !v) },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                activeOpacity={0.8}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, backgroundColor: colors.bg.primary, borderWidth: 1, borderColor: colors.border.light }}
              >
                <Ionicons name="calendar-outline" size={18} color={colors.primary[500]} />
                <View>
                  <Text style={{ fontSize: 10, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>{formatDate(item.date)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showStartPicker && (
          <DateTimePicker
            value={customStart}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={businessCreatedAt || undefined}
            maximumDate={customEnd}
            onChange={handleStartDateChange}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={customEnd}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={customStart}
            maximumDate={new Date()}
            onChange={handleEndDateChange}
          />
        )}

        {isLoading ? (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, gap: 24 }}>
            {/* Hero: reach + engagement */}
            <LinearGradient
              colors={[colors.primary[500], colors.primary[700]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 22, padding: 20, ...cardShadow }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>Alcance total</Text>
              <Text style={{ fontSize: 40, fontWeight: '800', color: '#ffffff', marginTop: 2 }}>{formatCount(metrics.totalViews)}</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>vistas en tus publicaciones</Text>

              <View style={{ flexDirection: 'row', marginTop: 18, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 14, padding: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Interacción</Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#ffffff' }}>{engagementRate.toFixed(1)}%</Text>
                </View>
                <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Interacciones</Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#ffffff' }}>{formatCount(interactions)}</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Metric grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {METRICS.map((m) => (
                <View
                  key={m.key}
                  style={{ flexGrow: 1, flexBasis: '45%', backgroundColor: colors.bg.primary, borderRadius: 18, padding: 16, ...cardShadow }}
                >
                  <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: `${m.color}1A`, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Ionicons name={m.icon} size={19} color={m.color} />
                  </View>
                  <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text.primary }}>{formatCount(metrics[m.key])}</Text>
                  <Text style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2 }}>{m.label}</Text>
                </View>
              ))}
            </View>

            {!hasPosts ? (
              <View style={{ backgroundColor: colors.bg.primary, borderRadius: 20, padding: 24, alignItems: 'center', ...cardShadow }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary[50], alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Ionicons name="images-outline" size={30} color={colors.primary[500]} />
                </View>
                <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text.primary, marginBottom: 4 }}>Sin publicaciones en este periodo</Text>
                <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center', marginBottom: 16 }}>
                  Publica fotos o videos de tus productos para ver aquí cómo le va a tu contenido.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/business/social')}
                  activeOpacity={0.85}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary[500], paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999 }}
                >
                  <Ionicons name="add" size={18} color="#ffffff" />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>Crear publicación</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Top posts */}
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary }}>Lo más visto</Text>
                    <TouchableOpacity onPress={() => router.push('/business/social')}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary[500] }}>Ver todo</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginHorizontal: -20 }}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8, gap: 12 }}
                  >
                    {topPosts.map(renderTopPost)}
                  </ScrollView>
                </View>

                {/* Least viewed */}
                {bottomPosts.length > 0 && (
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary }}>Necesitan un empujón</Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2, marginBottom: 12 }}>
                      Tus publicaciones con menos vistas en este periodo
                    </Text>
                    <View style={{ backgroundColor: colors.bg.primary, borderRadius: 18, overflow: 'hidden', ...cardShadow }}>
                      {bottomPosts.map(renderLowPost)}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>

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
