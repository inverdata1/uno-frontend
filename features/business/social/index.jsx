import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import { colors } from '../../../shared/utils/colors';
import { PostsGrid } from './posts/components/posts-grid';
import { PostCreationFlow } from './posts/creation';
import { QuickActions } from './shared/components/quick-actions';
import { StoriesRow } from './stories/components/stories-row';
import { CreateStoryModal } from './stories/creation/create-story-modal';
import StoryViewer from '../../shared/social/stories/story-viewer';

export default function BusinessSocialScreen() {
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [createStoryModalVisible, setCreateStoryModalVisible] = useState(false);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [selectedStories, setSelectedStories] = useState([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

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

  const handleStoryPress = (stories, index) => {
    setSelectedStories(stories);
    setSelectedStoryIndex(index);
    setStoryViewerVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.bg.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.text.primary,
            letterSpacing: 0.3
          }}>
            Publicaciones
          </Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity activeOpacity={0.6}>
              <Ionicons name="search-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.6}>
              <Ionicons name="ellipsis-vertical" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stories Row */}
        <StoriesRow onCreateStory={handleCreateStory} onStoryPress={handleStoryPress} />

        {/* Quick Actions */}
        <QuickActions
          onCreatePost={handleCreatePost}
          onCreatePromotion={handleCreatePromotion}
        />

        {/* Posts Grid */}
        <PostsGrid onCreatePost={handleCreatePost} />
      </ScrollView>

      {/* Create Post Flow - New Multi-Step Experience */}
      <PostCreationFlow
        visible={createPostModalVisible}
        onClose={() => setCreatePostModalVisible(false)}
      />

      {/* Create Story Modal */}
      <CreateStoryModal
        visible={createStoryModalVisible}
        onClose={() => setCreateStoryModalVisible(false)}
      />

      {/* Story Viewer */}
      <StoryViewer
        visible={storyViewerVisible}
        stories={selectedStories}
        initialIndex={selectedStoryIndex}
        onClose={() => setStoryViewerVisible(false)}
      />
    </SafeAreaView>
  );
}
