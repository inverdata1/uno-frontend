import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import { colors } from '../../../shared/utils/colors';
import { StoriesRow } from './components/stories-row';
import { QuickActions } from './components/quick-actions';
import { PostsGrid } from './components/posts-grid';
import { CreatePostModal } from './components/create-post-modal';
import { CreateStoryModal } from './components/create-story-modal';

export default function BusinessSocialScreen() {
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [createStoryModalVisible, setCreateStoryModalVisible] = useState(false);

  const handleCreatePost = () => {
    setCreatePostModalVisible(true);
  };

  const handleCreateStory = () => {
    setCreateStoryModalVisible(true);
  };

  const handleCreatePromotion = () => {
    // TODO: Implement promotion creation
    console.log('Create promotion');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{
          padding: 20,
          paddingTop: 12,
          backgroundColor: colors.bg.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light
        }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: 4
          }}>
            Publicaciones
          </Text>
          <Text style={{
            fontSize: 15,
            color: colors.text.secondary
          }}>
            Posts, historias y promociones
          </Text>
        </View>

        {/* Stories Row */}
        <StoriesRow onCreateStory={handleCreateStory} />

        {/* Quick Actions */}
        <QuickActions
          onCreatePost={handleCreatePost}
          onCreatePromotion={handleCreatePromotion}
        />

        {/* Posts Grid */}
        <PostsGrid onCreatePost={handleCreatePost} />
      </ScrollView>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={createPostModalVisible}
        onClose={() => setCreatePostModalVisible(false)}
      />

      {/* Create Story Modal */}
      <CreateStoryModal
        visible={createStoryModalVisible}
        onClose={() => setCreateStoryModalVisible(false)}
      />
    </SafeAreaView>
  );
}
