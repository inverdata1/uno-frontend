import React, { useState, useMemo } from 'react';
import { View, FlatList, RefreshControl, ScrollView, ActivityIndicator, Pressable, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PostCard } from './components/post-card';
import { CommentsModal } from '../../../shared/social/comments/comments-modal';
import { StoryRing, AddStoryButton } from './components/story-ring';
import { Text } from '../../../../shared/components/ui/text';
import { useAuthStore } from '../../../../core/auth/stores/auth-store';
import { useCurrentUserType } from '../../../../shared/hooks/use-user-type';
import { apiClient } from '../../../../shared/config/api-client';
import StoryViewer from '../../../shared/social/stories/story-viewer';
import PostViewer from '../../../shared/social/posts/post-viewer';
import VideoViewer from '../videos/video-viewer';
import { usePosts, useLikePost, useSavePost } from '../../../../features/shared/social/hooks/use-posts';
import { useStories } from '../../../../features/shared/social/hooks/use-stories';
import { useBusinesses } from '../../../../features/shared/social/hooks/use-businesses';

/**
 * Feed Screen
 * Modern social feed:
 * - Top header with user avatar, search, and notifications bell leading to /client/notifications
 * - Stories row only showing stories from businesses followed by the client (with empty state)
 * - High quality Post Cards with tagged products and direct cart integration
 * - Full-screen immersive Video Reel viewer with product links
 */
export default function FeedScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentUserType } = useCurrentUserType();
  const queryClient = useQueryClient();
  
  const [refreshing, setRefreshing] = useState(false);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [selectedStories, setSelectedStories] = useState([]);
  const [postViewerVisible, setPostViewerVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [videoViewerVisible, setVideoViewerVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [commentsPostId, setCommentsPostId] = useState(null);

  // Queries
  const { data: posts = [], isLoading: postsLoading } = usePosts({ userId: user?.id, limit: 50 });
  const { data: storiesData = [], isLoading: storiesLoading } = useStories();
  const { data: businesses = [], isLoading: businessesLoading } = useBusinesses();
  
  // Followed businesses query
  const { data: followedBusinessIds = [] } = useQuery({
    queryKey: ['followed-businesses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const res = await apiClient.get('/businesses/following', { params: { userId: user.id } });
        return Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        return [];
      }
    },
    enabled: Boolean(user?.id)
  });

  const likeMutation = useLikePost();
  const saveMutation = useSavePost();

  // Business lookup map for O(1) access
  const businessMap = useMemo(() => {
    const map = {};
    businesses.forEach(business => {
      map[business.id] = business;
    });
    return map;
  }, [businesses]);

  // Stories filtered: ONLY stories from followed businesses
  const followedStories = useMemo(() => {
    if (!storiesData || storiesData.length === 0) return [];
    if (!followedBusinessIds || followedBusinessIds.length === 0) return [];

    return storiesData.filter(item => followedBusinessIds.includes(item.businessId));
  }, [storiesData, followedBusinessIds]);

  // Extract all video posts for the VideoViewer carousel
  const allVideoPosts = useMemo(() => {
    return posts.filter(p => p.type === 'video');
  }, [posts]);

  const isLoading = postsLoading || businessesLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['posts'] }),
      queryClient.invalidateQueries({ queryKey: ['stories'] }),
      queryClient.invalidateQueries({ queryKey: ['businesses'] }),
      queryClient.invalidateQueries({ queryKey: ['followed-businesses'] }),
    ]);
    setRefreshing(false);
  };

  const handleLike = (postId) => {
    if (user?.id && postId) {
      likeMutation.mutate({ postId, userId: user.id });
    }
  };

  const handleSave = (postId, isSaved) => {
    saveMutation.mutate({ postId, isSaved });
  };

  const handleStoryPress = (businessStories) => {
    setSelectedStories(businessStories.stories || []);
    setStoryViewerVisible(true);
  };

  const handleCreateStory = () => {
    router.push('/business/stories/create');
  };

  const handlePostPress = (post) => {
    if (post.type === 'video') {
      setSelectedVideo(post);
      setVideoViewerVisible(true);
    } else {
      setSelectedPost(post);
      setPostViewerVisible(true);
    }
  };

  const handleBusinessPress = (businessId) => {
    if (businessId) {
      setPostViewerVisible(false);
      setVideoViewerVisible(false);
      router.push(`/client/business/${businessId}`);
    }
  };

  const handleProductPress = (productOrId) => {
    const productId = typeof productOrId === 'object' ? (productOrId.id || productOrId.productId) : productOrId;
    if (productId) {
      setPostViewerVisible(false);
      setSelectedPost(null);
      setVideoViewerVisible(false);
      setSelectedVideo(null);
      router.push(`/client/product/${productId}`);
    }
  };

  const renderHeader = () => {
    return (
      <View style={{ backgroundColor: '#ffffff', marginBottom: 12 }}>
        {/* Top Header Row with Avatar, App Logo/Title, and Actions */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 12,
        }}>
          {/* Left: User Avatar & App Greeting */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push('/client/profile')}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: '#ef4444',
                backgroundColor: '#f1f5f9',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {user?.photoURL || user?.avatarUrl ? (
                <Image
                  source={{ uri: user.photoURL || user.avatarUrl }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#ef4444' }}>
                  {(user?.displayName || user?.firstName || 'U').charAt(0).toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>

            <View>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b' }}>
                Bienvenido
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}>
                {user?.displayName || user?.firstName || 'Explorador'}
              </Text>
            </View>
          </View>

          {/* Right: Search & Notification Icons */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={() => router.push('/client')}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: '#f8fafc',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#e2e8f0'
              }}
            >
              <Ionicons name="search" size={18} color="#475569" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/client/notifications')}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: '#f8fafc',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                position: 'relative'
              }}
            >
              <Ionicons name="notifications-outline" size={19} color="#475569" />
              <View style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: '#ef4444'
              }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stories / Following Accounts Bar with Generous Spacing and Empty State */}
        <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
          {storiesLoading ? (
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <ActivityIndicator size="small" color="#ef4444" />
            </View>
          ) : followedStories.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 14, gap: 14 }}
            >
              {currentUserType === 'business' && (
                <AddStoryButton onPress={handleCreateStory} size={60} />
              )}
              {followedStories.map((businessStories) => {
                const business = businessMap[businessStories.businessId] || {};
                const name = business.name || business.businessName || 'Negocio';
                const shortName = name.split(' ')[0];

                return (
                  <StoryRing
                    key={businessStories.businessId}
                    onPress={() => handleStoryPress(businessStories)}
                    imageUrl={business.logo || business.logoUrl}
                    name={shortName}
                    hasUnseenStories={true}
                    size={60}
                  />
                );
              })}
            </ScrollView>
          ) : (
            // Empty State when client does not follow businesses with active stories
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              gap: 10,
              backgroundColor: '#f8fafc',
              marginHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#e2e8f0'
            }}>
              <Ionicons name="sparkles-outline" size={18} color="#94a3b8" />
              <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '500' }}>
                No hay historias disponibles en este momento
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderPost = ({ item: post }) => {
    if (!post) return null;

    const business = post.business || businessMap[post.businessId] || {};
    const businessData = {
      name: business.businessName || business.name || post.businessName || 'Negocio',
      logo: business.logoUrl || business.logo || post.businessLogo || null
    };

    const isLiked = Boolean(post.isLiked);
    const isSaved = false;

    return (
      <PostCard
        post={post}
        businessData={businessData}
        isLiked={isLiked}
        isSaved={isSaved}
        onPress={() => handlePostPress(post)}
        onLike={() => handleLike(post.id, isLiked)}
        onSave={() => handleSave(post.id, isSaved)}
        onComment={() => setCommentsPostId(post.id)}
        onBusinessPress={() => handleBusinessPress(post.businessId)}
        onProductPress={handleProductPress}
      />
    );
  };

  const renderEmpty = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32 }}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Ionicons name="images-outline" size={36} color="#94a3b8" />
      </View>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 8, textAlign: 'center' }}>
        No hay publicaciones en este momento
      </Text>
      <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 }}>
        Las publicaciones y novedades de los negocios aparecerán aquí en tu feed.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={{ fontSize: 14, color: '#64748b', marginTop: 16 }}>Cargando feed...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item, idx) => item?.id || `feed-${idx}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ef4444"
            colors={['#ef4444']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      {/* Story Viewer Modal */}
      <StoryViewer
        visible={storyViewerVisible}
        stories={selectedStories}
        onClose={() => setStoryViewerVisible(false)}
      />

      {/* Post Viewer Modal */}
      {selectedPost && (
        <PostViewer
          visible={postViewerVisible}
          post={selectedPost}
          businessData={selectedPost?.business || businessMap[selectedPost?.businessId] || {}}
          onClose={() => {
            setPostViewerVisible(false);
            setSelectedPost(null);
          }}
          onBusinessPress={handleBusinessPress}
          onProductPress={handleProductPress}
        />
      )}

      {/* Full-Screen Immersive Video Reel Viewer */}
      {selectedVideo && (
        <VideoViewer
          visible={videoViewerVisible}
          videos={allVideoPosts.length > 0 ? allVideoPosts : [selectedVideo]}
          initialVideoId={selectedVideo.id}
          onClose={() => {
            setVideoViewerVisible(false);
            setSelectedVideo(null);
          }}
          onBusinessPress={handleBusinessPress}
          onProductPress={handleProductPress}
        />
      )}

      {/* Comments Modal */}
      <CommentsModal
        visible={!!commentsPostId}
        postId={commentsPostId}
        onClose={() => setCommentsPostId(null)}
      />
    </SafeAreaView>
  );
}
