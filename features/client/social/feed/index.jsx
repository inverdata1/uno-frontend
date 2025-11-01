import React, { useState } from 'react';
import { View, FlatList, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { PostCard } from './components/post-card';
import { StoryRing, AddStoryButton } from './components/story-ring';
import { Text } from '../../../../shared/components/ui/text';
import { useCurrentUserType } from '../../../../shared/hooks/use-user-type';
import StoryViewer from '../stories/story-viewer';
import { usePosts, useLikePost, useSavePost } from '../../../../features/shared/social/hooks/use-posts';
import { useStories } from '../../../../features/shared/social/hooks/use-stories';

/**
 * Feed Screen
 * Main social feed with stories and posts
 * Shared between Client and Business user types
 */
export default function FeedScreen() {
  const { currentUserType } = useCurrentUserType();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [selectedStories, setSelectedStories] = useState([]);

  // Use domain hooks instead of inline queries
  const { data: posts = [], isLoading } = usePosts({ limit: 20 });
  const { data: storiesData = [] } = useStories();
  const likeMutation = useLikePost();
  const saveMutation = useSavePost();

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
    // TODO: Navigate to business profile
    console.log('View business:', businessId);
  };

  const handleProductPress = (productId) => {
    // TODO: Navigate to product view
    console.log('View product:', productId);
  };

  const renderHeader = () => null;

  const renderPost = ({ item: post }) => {
    // TODO: Get business data from cache or fetch
    const businessData = {
      name: 'Business Name',
      logo: 'https://via.placeholder.com/100'
    };

    // TODO: Check if post is liked/saved by current user
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
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-gray-500 text-base">No hay publicaciones</Text>
      <Text className="text-gray-400 text-sm mt-2">
        Sigue negocios para ver su contenido
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
