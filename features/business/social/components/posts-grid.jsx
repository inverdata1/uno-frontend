import React, { useState } from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui';
import { colors } from '../../../../shared/utils/colors';
import { useBusinessPosts, useDeletePost } from '../../../../shared/hooks/use-business-posts';

export const PostsGrid = ({ onCreatePost }) => {
  const [activeTab, setActiveTab] = useState('grid'); // grid, videos, promotions
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
        <PhotoGrid posts={filteredPosts} />
      )}
    </View>
  );
};

const PhotoGrid = ({ posts }) => {
  const deletePost = useDeletePost();

  const handleDeletePost = (post) => {
    Alert.alert(
      'Eliminar publicación',
      '¿Estás seguro de que quieres eliminar esta publicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deletePost.mutate(post.id)
        }
      ]
    );
  };

  return (
    <View style={{
      flexDirection: 'row',
      flexWrap: 'wrap'
    }}>
      {posts.map((post) => (
        <TouchableOpacity
          key={post.id}
          onLongPress={() => handleDeletePost(post)}
          style={{
            width: '33.33%',
            aspectRatio: 1,
            padding: 1
          }}
        >
          <Image
            source={{ uri: post.thumbnailUrl || post.media?.[0]?.url || post.mediaUrl || post.images?.[0] }}
            style={{
              flex: 1,
              backgroundColor: colors.bg.secondary
            }}
            resizeMode="cover"
          />
          {post.type === 'video' && (
            <View style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
      padding: 32,
      alignItems: 'center',
      backgroundColor: colors.bg.secondary
    }}>
      <Ionicons
        name={message.icon}
        size={48}
        color={colors.text.secondary}
        style={{ marginBottom: 12 }}
      />
      <Text style={{
        fontSize: 16,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 6,
        textAlign: 'center'
      }}>
        {message.title}
      </Text>
      <Text style={{
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: 20
      }}>
        {message.subtitle}
      </Text>
      <TouchableOpacity
        onPress={onCreatePost}
        style={{
          backgroundColor: colors.primary[500],
          paddingHorizontal: 32,
          paddingVertical: 12,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8
        }}
      >
        <Ionicons name="camera" size={18} color={colors.text.inverse} />
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: colors.text.inverse
        }}>
          Crear publicación
        </Text>
      </TouchableOpacity>
    </View>
  );
};
