import React, { useState, useMemo } from 'react';
import { View, FlatList, RefreshControl, ScrollView, ActivityIndicator, Pressable, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PostCard } from './components/post-card';
import { CommentsModal } from '../../../shared/social/comments/comments-modal';
import { StoryRing, AddStoryButton } from './components/story-ring';
import { Text } from '../../../../shared/components/ui/text';
import { useAuthStore } from '../../../../core/auth/stores/auth-store';
import { useCurrentUserType } from '../../../../shared/hooks/use-user-type';
import StoryViewer from '../../../shared/social/stories/story-viewer';
import PostViewer from '../../../shared/social/posts/post-viewer';
import VideoViewer from '../videos/video-viewer';
import { usePosts, useLikePost, useSavePost } from '../../../../features/shared/social/hooks/use-posts';
import { useStories } from '../../../../features/shared/social/hooks/use-stories';
import { useBusinesses } from '../../../../features/shared/social/hooks/use-businesses';
import { colors } from '../../../../shared/utils/colors';

const CATEGORIES = [
  { id: 'all', label: 'Para ti' },
  { id: 'comida', label: 'Comida' },
  { id: 'moda', label: 'Moda & Outfits' },
  { id: 'tecnologia', label: 'Tecnología' },
  { id: 'mercado', label: 'Supermercado' },
  { id: 'belleza', label: 'Belleza' },
  { id: 'hogar', label: 'Hogar' },
];

/**
 * Feed Screen
 * Modern social feed matching the reference layout:
 * - Top header with user avatar, loyalty points pill, notifications and search
 * - Top Stories / Following accounts horizontal carousel
 * - "Following" section with category pills filter
 * - High quality Post Cards with tagged products and direct cart integration
 * - Full-screen immersive Video Reel viewer
 */
export default function FeedScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentUserType } = useCurrentUserType();
  const queryClient = useQueryClient();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [selectedStories, setSelectedStories] = useState([]);
  const [postViewerVisible, setPostViewerVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [videoViewerVisible, setVideoViewerVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [commentsPostId, setCommentsPostId] = useState(null);

  // Domain queries
  const { data: posts = [], isLoading: postsLoading } = usePosts({ userId: user?.id, limit: 50 });
  const { data: storiesData = [], isLoading: storiesLoading } = useStories();
  const { data: businesses = [], isLoading: businessesLoading } = useBusinesses();
  const likeMutation = useLikePost();
  const saveMutation = useSavePost();

  // Create business lookup map for O(1) access
  const businessMap = useMemo(() => {
    const map = {};
    businesses.forEach(business => {
      map[business.id] = business;
    });
    return map;
  }, [businesses]);

  // Filter posts by active category
  const filteredPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    if (activeCategory === 'all') return posts;

    return posts.filter(post => {
      const b = post.business || businessMap[post.businessId];
      const categoryName = (b?.category?.name || b?.categoryName || post.category || '').toLowerCase();
      const captionText = (post.caption || '').toLowerCase();
      
      return categoryName.includes(activeCategory) || captionText.includes(activeCategory);
    });
  }, [posts, activeCategory, businessMap]);

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
      router.push(`/client/business/${businessId}`);
    }
  };

  const handleProductPress = (productOrId) => {
    const productId = typeof productOrId === 'object' ? (productOrId.id || productOrId.productId) : productOrId;
    if (productId) {
      router.push(`/client/product/${productId}`);
    }
  };

  const renderHeader = () => {
    return (
      <View style={{ backgroundColor: '#ffffff', marginBottom: 12 }}>
        {/* Top Header Row with Avatar, Points Badge, and Actions */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 12,
        }}>
          {/* Left: User Avatar & Points Pill */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push('/client/profile')}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                overflow: 'hidden',
                borderWidth: 1.5,
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

            {/* Loyalty points pill (Reference: 20 points) */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              borderWidth: 1,
              borderColor: '#e2e8f0',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              gap: 4
            }}>
              <Ionicons name="flash" size={13} color="#f59e0b" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1e293b' }}>
                20 puntos
              </Text>
            </View>
          </View>

          {/* Right: Search & Notification Icons */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={() => router.push('/client')}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#f8fafc',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#e2e8f0'
              }}
            >
              <Ionicons name="search" size={17} color="#475569" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/client/chats')}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#f8fafc',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                position: 'relative'
              }}
            >
              <Ionicons name="notifications-outline" size={18} color="#475569" />
              {/* Notification Badge Dot */}
              <View style={{
                position: 'absolute',
                top: 7,
                right: 7,
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: '#ef4444'
              }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stories / Following Accounts Horizontal Bar */}
        <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
          {storiesLoading ? (
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <ActivityIndicator size="small" color="#ef4444" />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
            >
              {currentUserType === 'business' && (
                <AddStoryButton onPress={handleCreateStory} />
              )}
              {storiesData.map((businessStories) => {
                const business = businessMap[businessStories.businessId] || {};
                const name = business.name || business.businessName || 'Negocio';
                const shortName = name.split(' ')[0];

                return (
                  <Pressable
                    key={businessStories.businessId}
                    onPress={() => handleStoryPress(businessStories)}
                    style={{ alignItems: 'center', width: 62 }}
                  >
                    <StoryRing
                      imageUrl={business.logo || business.logoUrl}
                      name={shortName}
                      hasUnseenStories={true}
                    />
                  </Pressable>
                );
              })}

              {/* If no active stories, show top featured businesses as following avatars */}
              {storiesData.length === 0 && businesses.slice(0, 8).map((business) => {
                const name = business.name || business.businessName || 'Negocio';
                const shortName = name.split(' ')[0];
                return (
                  <Pressable
                    key={business.id}
                    onPress={() => handleBusinessPress(business.id)}
                    style={{ alignItems: 'center', width: 62 }}
                  >
                    <StoryRing
                      imageUrl={business.logo || business.logoUrl}
                      name={shortName}
                      hasUnseenStories={false}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Following Header & Category Filter Pills */}
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a', letterSpacing: -0.3, marginBottom: 12 }}>
            Siguiendo
          </Text>

          {/* Categories Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setActiveCategory(cat.id)}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: isSelected ? '#ef4444' : '#f1f5f9',
                    borderWidth: 1,
                    borderColor: isSelected ? '#ef4444' : '#e2e8f0',
                  }}
                >
                  <Text style={{
                    fontSize: 13,
                    fontWeight: isSelected ? '700' : '600',
                    color: isSelected ? '#ffffff' : '#475569',
                  }}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
        No hay publicaciones en esta categoría
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
        data={filteredPosts}
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
