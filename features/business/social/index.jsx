import { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import { useBusinessProfile } from '../../../shared/hooks/use-business-profile';
import { useBusinessPosts } from '../../../shared/hooks/use-business-posts';
import { colors } from '../../../shared/utils/colors';
import { resolveMediaUrl } from '../../../shared/utils/media-url';
import { PostsGrid } from './posts/components/posts-grid';
import { PostCreationFlow } from './posts/creation';
import { QuickActions } from './shared/components/quick-actions';
import { StoriesRow } from './stories/components/stories-row';
import { CreateStoryModal } from './stories/creation/create-story-modal';
import StoryViewer from '../../shared/social/stories/story-viewer';

const formatCount = (value) => {
  const n = Number(value) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
};

export default function BusinessSocialScreen() {
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [createStoryModalVisible, setCreateStoryModalVisible] = useState(false);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [selectedStories, setSelectedStories] = useState([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [allowedMediaTypes, setAllowedMediaTypes] = useState(['image', 'video']);

  const { businessData, business, stats } = useBusinessProfile();
  const { data: posts = [] } = useBusinessPosts();

  const businessName = businessData?.businessName || business?.name || 'Tu negocio';
  const logo = resolveMediaUrl(businessData?.logoUrl);
  const videosCount = posts.filter((p) => p.type === 'video').length;
  const totalLikes = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);

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

  const statItems = [
    { label: 'Posts', value: posts.length - videosCount },
    { label: 'Videos', value: videosCount },
    { label: 'Historias', value: stats?.activeStories || 0 },
    { label: 'Me gusta', value: totalLikes },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header: business identity + stats */}
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

          <View style={{
            flexDirection: 'row', marginTop: 16, backgroundColor: colors.bg.secondary,
            borderRadius: 16, paddingVertical: 12,
          }}>
            {statItems.map((item, index) => (
              <View
                key={item.label}
                style={{
                  flex: 1, alignItems: 'center',
                  borderLeftWidth: index === 0 ? 0 : 1, borderLeftColor: colors.border.light,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text.primary }}>{formatCount(item.value)}</Text>
                <Text style={{ fontSize: 11, color: colors.text.secondary, marginTop: 2 }}>{item.label}</Text>
              </View>
            ))}
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
