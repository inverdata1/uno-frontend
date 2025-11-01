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
import StoryViewer from '../stories/story-viewer';
import { usePosts, useLikePost, useSavePost } from '../../../../features/shared/social/hooks/use-posts';
import { useStories } from '../../../../features/shared/social/hooks/use-stories';
import { useBusinesses } from '../../../../features/shared/social/hooks/use-businesses';
import { colors } from '../../../../shared/utils/colors';

/**
 * Feed Screen
 * Main social feed with stories and posts
 * Shared between Client and Business user types
 */
export default function FeedScreen() {
  const router = useRouter();
  const { currentUserType } = useCurrentUserType();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [selectedStories, setSelectedStories] = useState([]);

  // Use domain hooks to fetch data
  const { data: posts = [], isLoading: postsLoading } = usePosts({ limit: 20 });
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
    // TODO: Navigate to create story screen
    console.log('Create story');
  };

  const handlePostPress = (postId) => {
    // TODO: Navigate to post detail
    console.log('View post:', postId);
  };

  const handleBusinessPress = (businessId) => {
    router.push(`/client/business/${businessId}`);
  };

  const handleProductPress = (productId) => {
    // TODO: Navigate to product view
    console.log('View product:', productId);
  };

  const renderHeader = () => {
    if (storiesData.length === 0 && !storiesLoading) return null;

    return (
      <View className="bg-white border-b border-gray-200 py-3">
        {storiesLoading ? (
          <View className="px-4 py-2">
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
                    imageUrl={business.logo}
                    name={business.name || 'Business'}
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

  const renderPost = ({ item: post }) => {
    // Get real business data from the map
    const business = businessMap[post.businessId] || {};
    const businessData = {
      name: business.name || 'Business',
      logo: business.logo || 'https://via.placeholder.com/100'
    };

    // TODO: Check if post is liked/saved by current user from auth state
    const isLiked = false;
    const isSaved = false;

    return (
      <PostCard
        post={post}
        businessData={businessData}
        isLiked={isLiked}
        isSaved={isSaved}
        onPress={() => handlePostPress(post.id)}
        onLike={() => handleLike(post.id, isLiked)}
        onSave={() => handleSave(post.id, isSaved)}
        onBusinessPress={() => handleBusinessPress(post.businessId)}
        onProductPress={handleProductPress}
      />
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center mb-4">
        <Ionicons name="images-outline" size={36} color={colors.text.secondary} />
      </View>
      <Text className="text-gray-700 text-lg font-semibold mb-2 text-center">
        No hay publicaciones aun
      </Text>
      <Text className="text-gray-500 text-sm text-center">
        Sigue a negocios para ver sus publicaciones aqui
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text className="text-gray-500 text-sm mt-4">Cargando feed...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
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
    </SafeAreaView>
  );
}
