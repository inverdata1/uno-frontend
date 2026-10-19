import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../../../shared/components/ui';
import { useBusinessPosts, useDeletePost } from '../../../../../shared/hooks/use-business-posts';
import { colors } from '../../../../../shared/utils/colors';
import PostViewer from '../../../../shared/social/posts/post-viewer';
import { PostCreationFlow } from '../creation';
import { PostThumbnail } from '../../../../../shared/components/media/post-thumbnail';

export const PostsGrid = ({ onCreatePost, onCreateVideo }) => {
  const [activeTab, setActiveTab] = useState('grid'); // grid, videos, promotions
  const [selectedPost, setSelectedPost] = useState(null);
  const [postViewerVisible, setPostViewerVisible] = useState(false);
  const [editPostVisible, setEditPostVisible] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const { data: posts = [], isLoading } = useBusinessPosts();

  const tabs = [
    { key: 'grid', icon: 'grid', label: 'Posts', count: posts.filter((p) => p.type !== 'video').length },
    { key: 'videos', icon: 'play-circle', label: 'Videos', count: posts.filter((p) => p.type === 'video').length },
    { key: 'promotions', icon: 'pricetag', label: 'Promos', count: posts.filter((p) => p.isPromotion).length }
  ];

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'videos') return post.type === 'video';
    if (activeTab === 'promotions') return post.isPromotion;
    return post.type !== 'video'; // grid shows non-videos
  });

  const handlePostPress = (post) => {
    setSelectedPost(post);
    setPostViewerVisible(true);
  };

  const handleCloseViewer = () => {
    setPostViewerVisible(false);
    setSelectedPost(null);
  };

  const handleEditPost = (post) => {
    setPostToEdit(post);
    setEditPostVisible(true);
  };

  return (
    <View style={{ paddingTop: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary }}>Tu contenido</Text>
      </View>

      <View style={{
        flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, padding: 4,
        backgroundColor: colors.bg.primary, borderRadius: 14, borderWidth: 1, borderColor: colors.border.light,
      }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                paddingVertical: 9, borderRadius: 10, backgroundColor: active ? colors.text.primary : 'transparent',
              }}
            >
              <Ionicons name={tab.icon} size={16} color={active ? '#ffffff' : colors.text.secondary} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: active ? '#ffffff' : colors.text.secondary }}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <Text style={{ fontSize: 12, fontWeight: '600', color: active ? 'rgba(255,255,255,0.7)' : colors.text.tertiary }}>
                  {tab.count}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : filteredPosts.length === 0 ? (
        <EmptyState onCreatePost={activeTab === 'videos' && onCreateVideo ? onCreateVideo : onCreatePost} activeTab={activeTab} />
      ) : (
        <PhotoGrid posts={filteredPosts} onPostPress={handlePostPress} />
      )}

      {/* Post Viewer */}
      {selectedPost && (
        <PostViewer
          visible={postViewerVisible}
          post={selectedPost}
          businessData={{
            name: selectedPost.business?.businessName,
            logo: selectedPost.business?.logoUrl
          }}
          onClose={handleCloseViewer}
          onEdit={handleEditPost}
        />
      )}

      {/* Edit Post Flow */}
      {postToEdit && (
        <PostCreationFlow
          visible={editPostVisible}
          initialPost={postToEdit}
          allowedMediaTypes={postToEdit.type === 'video' ? ['video'] : ['image']}
          onClose={() => {
            setEditPostVisible(false);
            setTimeout(() => setPostToEdit(null), 300); // wait for animation
          }}
        />
      )}
    </View>
  );
};

const PhotoGrid = ({ posts, onPostPress }) => {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 }}>
      {posts.map((post) => (
        <TouchableOpacity
          key={post.id}
          onPress={() => onPostPress(post)}
          activeOpacity={0.9}
          style={{ width: '33.33%', aspectRatio: post.type === 'video' ? 0.75 : 1, padding: 3 }}
        >
          <View style={{ flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.bg.tertiary }}>
            <PostThumbnail post={post} iconSize={28} />

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.55)']}
              style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 40 }}
            />
            <View style={{ position: 'absolute', left: 8, bottom: 6, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="heart" size={12} color="#ffffff" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#ffffff' }}>{post.likeCount || 0}</Text>
              </View>
              {(post.commentCount || 0) > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons name="chatbubble" size={11} color="#ffffff" />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#ffffff' }}>{post.commentCount}</Text>
                </View>
              )}
            </View>

            {post.type === 'video' && (
              <View style={{ position: 'absolute', top: 6, right: 6 }}>
                <Ionicons name="play-circle" size={20} color="rgba(255,255,255,0.95)" />
              </View>
            )}
            {Array.isArray(post.media) && post.media.length > 1 && post.type !== 'video' && (
              <View style={{ position: 'absolute', top: 6, right: 6 }}>
                <Ionicons name="copy" size={16} color="rgba(255,255,255,0.95)" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const EmptyState = ({ onCreatePost, activeTab }) => {
  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'videos':
        return {
          title: 'Sin videos aún',
          subtitle: 'Comparte videos de tus productos',
          icon: 'videocam-outline'
        };
      case 'promotions':
        return {
          title: 'Sin promociones',
          subtitle: 'Crea ofertas especiales para tus clientes',
          icon: 'pricetag-outline'
        };
      default:
        return {
          title: 'Comparte tus primeros posts',
          subtitle: 'Muestra tus productos y conecta con clientes',
          icon: 'camera-outline'
        };
    }
  };

  const message = getEmptyMessage();

  return (
    <View style={{
      marginHorizontal: 16,
      padding: 32,
      alignItems: 'center',
      backgroundColor: colors.bg.primary,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border.light
    }}>
      <View style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.bg.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border.light
      }}>
        <Ionicons
          name={message.icon}
          size={40}
          color={colors.text.secondary}
        />
      </View>
      <Text style={{
        fontSize: 18,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 8,
        textAlign: 'center'
      }}>
        {message.title}
      </Text>
      <Text style={{
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20
      }}>
        {message.subtitle}
      </Text>
      <TouchableOpacity
        onPress={onCreatePost}
        activeOpacity={0.85}
        style={{
          backgroundColor: colors.primary[500],
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 999,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8
        }}
      >
        <Ionicons name="add" size={20} color={colors.text.inverse} />
        <Text style={{
          fontSize: 15,
          fontWeight: '700',
          color: colors.text.inverse
        }}>
          {activeTab === 'videos' ? 'Subir video' : 'Crear publicación'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
