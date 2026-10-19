import { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import { useBusinessProfile } from '../../../shared/hooks/use-business-profile';
import { colors } from '../../../shared/utils/colors';
import { resolveMediaUrl } from '../../../shared/utils/media-url';
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
  const [allowedMediaTypes, setAllowedMediaTypes] = useState(['image', 'video']);

  const { businessData, business } = useBusinessProfile();

  const businessName = businessData?.businessName || business?.name || 'Tu negocio';
  const logo = resolveMediaUrl(businessData?.logoUrl);

  const handleCreatePost = () => {
    setAllowedMediaTypes(['image']);
    setCreatePostModalVisible(true);
  };

  const handleCreateVideo = () => {
    setAllowedMediaTypes(['video']);
    setCreatePostModalVisible(true);
  };

  const handleCreateStory = () => {
    setCreateStoryModalVisible(true);
  };

  const handleStoryPress = (stories, index) => {
    setSelectedStories(stories);
    setSelectedStoryIndex(index);
    setStoryViewerVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header: business identity (post stats live in the Dashboard) */}
        <View style={{ backgroundColor: colors.bg.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 48, height: 48, borderRadius: 24, overflow: 'hidden',
              backgroundColor: colors.primary[500], alignItems: 'center', justifyContent: 'center',
            }}>
              {logo ? (
                <Image source={{ uri: logo }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '800' }}>{businessName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text.primary }}>Publicaciones</Text>
              <Text style={{ fontSize: 13, color: colors.text.secondary }} numberOfLines={1}>{businessName}</Text>
            </View>
          </View>
        </View>

        <StoriesRow onCreateStory={handleCreateStory} onStoryPress={handleStoryPress} logo={logo} />

        <QuickActions
          onCreatePost={handleCreatePost}
          onCreateVideo={handleCreateVideo}
          onCreateStory={handleCreateStory}
        />

        <PostsGrid onCreatePost={handleCreatePost} onCreateVideo={handleCreateVideo} />
      </ScrollView>

      <PostCreationFlow
        visible={createPostModalVisible}
        allowedMediaTypes={allowedMediaTypes}
        onClose={() => setCreatePostModalVisible(false)}
      />

      <CreateStoryModal
        visible={createStoryModalVisible}
        onClose={() => setCreateStoryModalVisible(false)}
      />

      <StoryViewer
        visible={storyViewerVisible}
        stories={selectedStories}
        initialIndex={selectedStoryIndex}
        onClose={() => setStoryViewerVisible(false)}
      />
    </SafeAreaView>
  );
}
