import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Home Skeleton Loader
 * Adaptive skeleton that matches the actual home screen layout
 * Supports different layouts for client, business, and delivery modes
 */
export const HomeSkeletonLoader = ({ userType = 'client' }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  // Shared skeleton box component
  const SkeletonBox = ({ width, height, borderRadius = 12, style = {} }) => (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: '#e5e7eb',
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );

  // Client mode skeleton (Instagram/TikTok style feed)
  const ClientSkeleton = () => {
    const cardWidth = (width - 48) / 2;

    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        {/* Header Skeleton */}
        <View style={{ padding: 16, paddingTop: 12 }}>
          <SkeletonBox width={120} height={24} borderRadius={8} style={{ marginBottom: 8 }} />
          <SkeletonBox width={180} height={16} borderRadius={6} />
        </View>

        {/* Search Bar Skeleton */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <SkeletonBox width="100%" height={44} borderRadius={10} />
        </View>

        {/* Offers Banner Skeleton */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <SkeletonBox width="100%" height={160} borderRadius={16} />
        </View>

        {/* Stories Row Skeleton */}
        <View style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <View key={item} style={{ alignItems: 'center' }}>
                <SkeletonBox width={72} height={72} borderRadius={36} style={{ marginBottom: 6 }} />
                <SkeletonBox width={60} height={10} borderRadius={5} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Videos Section Skeleton */}
        <View style={{ paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <SkeletonBox width={180} height={24} borderRadius={8} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {[1, 2, 3].map((item) => (
              <SkeletonBox key={item} width={140} height={200} borderRadius={12} />
            ))}
          </ScrollView>
        </View>

        {/* Products Grid Skeleton */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
          <SkeletonBox width={150} height={24} borderRadius={8} style={{ marginBottom: 16 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <View key={item} style={{ width: cardWidth }}>
                <SkeletonBox width={cardWidth} height={cardWidth} borderRadius={12} style={{ marginBottom: 8 }} />
                <SkeletonBox width="80%" height={14} borderRadius={6} style={{ marginBottom: 6 }} />
                <SkeletonBox width="60%" height={14} borderRadius={6} style={{ marginBottom: 6 }} />
                <SkeletonBox width="40%" height={16} borderRadius={6} />
              </View>
            ))}
          </View>
        </View>

        {/* Categories Section Skeleton */}
        <View style={{ paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 20 }}>
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <SkeletonBox width={140} height={24} borderRadius={8} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {[1, 2, 3, 4, 5].map((item) => (
              <SkeletonBox key={item} width={100} height={44} borderRadius={24} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  // Business mode skeleton (Dashboard with stats and charts)
  const BusinessSkeleton = () => {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        {/* Header Skeleton */}
        <View style={{ padding: 20, paddingTop: 12, backgroundColor: '#ffffff' }}>
          <SkeletonBox width={140} height={28} borderRadius={8} style={{ marginBottom: 6 }} />
          <SkeletonBox width={180} height={16} borderRadius={6} />
        </View>

        {/* Period Selector Skeleton */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingVertical: 16,
            gap: 8,
            backgroundColor: '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
          }}
        >
          {[1, 2, 3].map((item) => (
            <SkeletonBox key={item} width={(width - 56) / 3} height={36} borderRadius={12} />
          ))}
        </View>

        {/* Stats Grid Skeleton */}
        <View style={{ padding: 20, gap: 12 }}>
          {/* First Row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[1, 2].map((item) => (
              <View
                key={item}
                style={{
                  flex: 1,
                  backgroundColor: '#ffffff',
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <SkeletonBox width={40} height={40} borderRadius={12} style={{ marginBottom: 12 }} />
                <SkeletonBox width={60} height={12} borderRadius={6} style={{ marginBottom: 6 }} />
                <SkeletonBox width="80%" height={24} borderRadius={8} style={{ marginBottom: 6 }} />
                <SkeletonBox width={50} height={12} borderRadius={6} />
              </View>
            ))}
          </View>

          {/* Second Row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[1, 2].map((item) => (
              <View
                key={item}
                style={{
                  flex: 1,
                  backgroundColor: '#ffffff',
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <SkeletonBox width={40} height={40} borderRadius={12} style={{ marginBottom: 12 }} />
                <SkeletonBox width={70} height={12} borderRadius={6} style={{ marginBottom: 6 }} />
                <SkeletonBox width="70%" height={24} borderRadius={8} style={{ marginBottom: 6 }} />
                <SkeletonBox width={45} height={12} borderRadius={6} />
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions Skeleton */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <SkeletonBox width={160} height={20} borderRadius={8} style={{ marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[1, 2, 3, 4].map((item) => (
              <View
                key={item}
                style={{
                  flex: 1,
                  backgroundColor: '#ffffff',
                  borderRadius: 16,
                  padding: 16,
                  alignItems: 'center',
                }}
              >
                <SkeletonBox width={48} height={48} borderRadius={14} style={{ marginBottom: 8 }} />
                <SkeletonBox width={60} height={12} borderRadius={6} />
              </View>
            ))}
          </View>
        </View>

        {/* Recent Orders Skeleton */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <SkeletonBox width={160} height={20} borderRadius={8} />
            <SkeletonBox width={80} height={16} borderRadius={6} />
          </View>
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {[1, 2, 3].map((item, index) => (
              <View
                key={item}
                style={{
                  padding: 16,
                  borderBottomWidth: index < 2 ? 1 : 0,
                  borderBottomColor: '#f1f5f9',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <SkeletonBox width={120} height={16} borderRadius={6} style={{ marginBottom: 6 }} />
                    <SkeletonBox width={80} height={12} borderRadius={6} />
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <SkeletonBox width={60} height={16} borderRadius={6} style={{ marginBottom: 6 }} />
                    <SkeletonBox width={70} height={24} borderRadius={8} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  // Delivery mode skeleton (Simple list view)
  const DeliverySkeleton = () => {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        {/* Header Skeleton */}
        <View style={{ padding: 20, paddingTop: 12, backgroundColor: '#ffffff', marginBottom: 12 }}>
          <SkeletonBox width={160} height={28} borderRadius={8} style={{ marginBottom: 6 }} />
          <SkeletonBox width={200} height={16} borderRadius={6} />
        </View>

        {/* Delivery Cards Skeleton */}
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View
              key={item}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 16,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <SkeletonBox width={100} height={20} borderRadius={8} />
                <SkeletonBox width={80} height={24} borderRadius={12} />
              </View>
              <SkeletonBox width="100%" height={14} borderRadius={6} style={{ marginBottom: 6 }} />
              <SkeletonBox width="80%" height={14} borderRadius={6} style={{ marginBottom: 12 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <SkeletonBox width={120} height={16} borderRadius={6} />
                <SkeletonBox width={60} height={16} borderRadius={6} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Render appropriate skeleton based on user type
  switch (userType) {
    case 'business':
      return <BusinessSkeleton />;
    case 'delivery':
      return <DeliverySkeleton />;
    case 'client':
    default:
      return <ClientSkeleton />;
  }
};
