import React, { useState, useMemo } from 'react';
import { View, FlatList, RefreshControl, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PostCard } from './components/post-card';
import { StoryRing, AddStoryButton } from './components/story-ring';
import { Text } from '../../../../shared/components/ui/text';
import { useCurrentUserType } from '../../../../shared/hooks/use-user-type';
import StoryViewer from '../../../shared/social/stories/story-viewer';
import PostViewer from '../../../shared/social/posts/post-viewer';
import { usePosts, useLikePost, useSavePost } from '../../../../features/shared/social/hooks/use-posts';
import { useStories } from '../../../../features/shared/social/hooks/use-stories';
import { useBusinesses } from '../../../../features/shared/social/hooks/use-businesses';
import { colors } from '../../../../shared/utils/colors';

/**
 * Feed Screen
 * Main social feed with stories, image posts, and video posts.
 * Interleaves 5 image posts with 1 video post.
 */
export default function FeedScreen() {
  const router = useRouter();
  const { currentUserType } = useCurrentUserType();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [selectedStories, setSelectedStories] = useState([]);
  const [postViewerVisible, setPostViewerVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Use domain hooks to fetch data
  const { data: posts = [], isLoading: postsLoading } = usePosts({ limit: 50 });
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

  // Interleave feed: 5 image posts -> 1 video post
  const combinedFeed = useMemo(() => {
    if (!posts || posts.length === 0) return [];

    const imagePosts = posts.filter(p => p.type !== 'video');
    const videoPosts = posts.filter(p => p.type === 'video');

    if (videoPosts.length === 0) return imagePosts;
    if (imagePosts.length === 0) return videoPosts;

    const result = [];
    let videoIdx = 0;

    for (let i = 0; i < imagePosts.length; i++) {
      result.push(imagePosts[i]);
      if ((i + 1) % 5 === 0 && videoIdx < videoPosts.length) {
        result.push(videoPosts[videoIdx]);
        videoIdx++;
      }
    }

    // Append any leftover videos
    while (videoIdx < videoPosts.length) {
      result.push(videoPosts[videoIdx]);
      videoIdx++;
    }

    return result;
  }, [posts]);

  const isLoading = postsLoading || businessesLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['posts'] }),
      queryClient.invalidateQueries({ queryKey: ['stories'] })
    ]);
    setRefreshing(false);
  };

  const handleLike = (postId, isLiked) => {
    likeMutation.mutate({ postId, isLiked });
  };

  const handleSave = (postId, isSaved) => {
    saveMutation.mutate({ postId, isSaved });
  };

  const handleStoryPress = (businessStories) => {
    setSelectedStories(businessStories.stories);
    setStoryViewerVisible(true);
  };

  const handleCreateStory = () => {
    router.push('/business/stories/create');
  };

  const handlePostPress = (post) => {
    setSelectedPost(post);
    setPostViewerVisible(true);
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
    if (storiesData.length === 0 && !storiesLoading) return null;

    return (
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 12 }}>
        {storiesLoading ? (
          <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
          >
            {currentUserType === 'business' && (
              <AddStoryButton onPress={handleCreateStory} />
            )}
            {storiesData.map((businessStories) => {
              const business = businessMap[businessStories.businessId] || {};
              return (
                <Pressable
                  key={businessStories.businessId}
                  onPress={() => handleStoryPress(businessStories)}
                  style={{ marginHorizontal: 6 }}
                >
                  <StoryRing
                    imageUrl={business.logo || business.logoUrl}
                    name={business.name || business.businessName || 'Business'}
                    hasUnseenStories={true}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderPost = ({ item: post, index }) => {
    if (!post) return null;

    // Get real business data from the map
    const business = businessMap[post.businessId] || {};
    const businessData = {
      name: business.businessName || business.name || post.businessName || 'Negocio',
      logo: business.logoUrl || business.logo || post.businessLogo || null
    };

    const isLiked = false;
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
        onBusinessPress={() => handleBusinessPress(post.businessId)}
        onProductPress={handleProductPress}
      />
    );
  };

  const renderEmpty = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32 }}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Ionicons name="images-outline" size={36} color={colors.text.secondary} />
      </View>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8, textAlign: 'center' }}>
        No hay publicaciones aún
      </Text>
      <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', leading: 20 }}>
        Las publicaciones de los negocios aparecerán aquí en tu feed social.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 16 }}>Cargando feed...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }} edges={['top']}>
      <FlatList
        data={combinedFeed}
        renderItem={renderPost}
        keyExtractor={(item, idx) => item?.id || `feed-${idx}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <StoryViewer
        visible={storyViewerVisible}
        stories={selectedStories}
        onClose={() => setStoryViewerVisible(false)}
      />

      {selectedPost && (
        <PostViewer
          visible={postViewerVisible}
          post={selectedPost}
          businessData={businessMap[selectedPost.businessId] || {}}
          onClose={() => {
            setPostViewerVisible(false);
            setSelectedPost(null);
          }}
          onBusinessPress={handleBusinessPress}
          onProductPress={handleProductPress}
        />
      )}
    </SafeAreaView>
  );
}
