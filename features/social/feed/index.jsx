import React, { useState } from 'react';
import { View, FlatList, RefreshControl, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/config/api-client';
import { PostCard } from './components/post-card';
import { StoryRing, AddStoryButton } from './components/story-ring';
import { Text } from '../../../shared/components/ui/text';
import { useCurrentMode } from '../../../shared/hooks/use-user-modes';

/**
 * Feed Screen
 * Main social feed with stories and posts
 * Shared between Client and Business user types
 */
export default function FeedScreen() {
  const { currentMode } = useCurrentMode();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', 'feed'],
    queryFn: () => apiClient.get('/posts/feed', { limit: 20 }).then(res => res.data)
  });

  // Fetch stories (grouped by business)
  const { data: storiesData = [] } = useQuery({
    queryKey: ['stories'],
    queryFn: () => apiClient.get('/stories').then(res => res.data)
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }) => {
      const endpoint = isLiked ? `/posts/${postId}/unlike` : `/posts/${postId}/like`;
      return apiClient.patch(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async ({ postId, isSaved }) => {
      return apiClient.post('/favorites/toggle', {
        itemType: 'post',
        itemId: postId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

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

  const handleStoryPress = (businessId) => {
    // TODO: Navigate to stories viewer
    console.log('View stories for business:', businessId);
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

  const renderHeader = () => (
    <View className="bg-white border-b border-gray-100">
      {/* Stories Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="py-4 px-4"
      >
        {/* Add Story Button (only for business users) */}
        {currentMode === 'business' && (
          <AddStoryButton onPress={handleCreateStory} />
        )}

        {/* Stories */}
        {storiesData.map((businessStories) => (
          <StoryRing
            key={businessStories.businessId}
            business={businessStories.business}
            hasUnviewed={businessStories.hasUnviewed}
            onPress={() => handleStoryPress(businessStories.businessId)}
          />
        ))}

        {storiesData.length === 0 && !isLoading && (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500 text-sm">
              No hay historias disponibles
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

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
    <View className="flex-1 bg-gray-50">
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
    </View>
  );
}
