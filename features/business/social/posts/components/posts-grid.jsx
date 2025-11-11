import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, TouchableOpacity, View } from 'react-native';
import { Text } from '../../../../../shared/components/ui';
import { useBusinessPosts, useDeletePost } from '../../../../../shared/hooks/use-business-posts';
import { colors } from '../../../../../shared/utils/colors';
import PostViewer from '../../../../shared/social/posts/post-viewer';

export const PostsGrid = ({ onCreatePost }) => {
  const [activeTab, setActiveTab] = useState('grid'); // grid, videos, promotions
  const [selectedPost, setSelectedPost] = useState(null);
  const [postViewerVisible, setPostViewerVisible] = useState(false);
  const { data: posts = [], isLoading } = useBusinessPosts();

  const tabs = [
    { key: 'grid', icon: 'grid', label: 'Posts' },
    { key: 'videos', icon: 'play-circle-outline', label: 'Videos' },
    { key: 'promotions', icon: 'pricetag-outline', label: 'Promociones' }
  ];

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'videos') return post.type === 'video';
    if (activeTab === 'promotions') return post.isPromotion;
    return true; // grid shows all
  });

  const handlePostPress = (post) => {
    setSelectedPost(post);
    setPostViewerVisible(true);
  };

  const handleCloseViewer = () => {
    setPostViewerVisible(false);
    setSelectedPost(null);
  };

  return (
    <View style={{
      paddingTop: 8,
      backgroundColor: colors.bg.primary
    }}>
      {/* Tab Icons */}
      <View style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light
      }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.6}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: activeTab === tab.key ? 2 : 0,
              borderBottomColor: colors.text.primary
            }}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={activeTab === tab.key ? colors.text.primary : colors.text.secondary}
            />
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : filteredPosts.length === 0 ? (
        <EmptyState onCreatePost={onCreatePost} activeTab={activeTab} />
      ) : (
        <PhotoGrid posts={filteredPosts} onPostPress={handlePostPress} />
      )}

      {/* Post Viewer */}
      {selectedPost && (
        <PostViewer
          visible={postViewerVisible}
          post={selectedPost}
          businessData={{
            name: selectedPost.businessName,
            logo: selectedPost.logoUrl
          }}
          onClose={handleCloseViewer}
        />
      )}
    </View>
  );
};

const PhotoGrid = ({ posts, onPostPress }) => {
  return (
    <View style={{
      flexDirection: 'row',
      flexWrap: 'wrap'
    }}>
      {posts.map((post) => (
        <TouchableOpacity
          key={post.id}
          onPress={() => onPostPress(post)}
          activeOpacity={0.9}
          style={{
            width: '33.33%',
            aspectRatio: 1,
            padding: 1
          }}
        >
          <Image
            source={{ uri: post.thumbnailUrl || post.media?.[0]?.url || post.mediaUrl || post.images?.[0] }}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: colors.bg.secondary
            }}
            resizeMode="cover"
          />
          {post.type === 'video' && (
            <View style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: 4,
              padding: 4
            }}>
              <Ionicons name="play" size={12} color="#fff" />
            </View>
          )}
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
      padding: 40,
      alignItems: 'center',
      backgroundColor: colors.bg.secondary,
      minHeight: 300
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
          paddingHorizontal: 28,
          paddingVertical: 12,
          borderRadius: 8,
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
          Crear publicación
        </Text>
      </TouchableOpacity>
    </View>
  );
};
