import React from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui';
import { colors } from '../../../../shared/utils/colors';
import { useBusinessStories } from '../../../../shared/hooks/use-business-stories';

export const StoriesRow = ({ onCreateStory }) => {
  const { data: stories = [], isLoading } = useBusinessStories();

  return (
    <View style={{
      padding: 20,
      paddingBottom: 16,
      backgroundColor: colors.bg.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light
    }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {/* Add Story Button */}
        <TouchableOpacity
          style={{ alignItems: 'center' }}
          onPress={onCreateStory}
        >
          <View style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.bg.secondary,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: colors.border.light,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 6
          }}>
            <Ionicons name="add" size={32} color={colors.primary[500]} />
          </View>
          <Text style={{
            fontSize: 12,
            color: colors.text.primary,
            fontWeight: '600'
          }}>
            Tu historia
          </Text>
        </TouchableOpacity>

        {/* Loading State */}
        {isLoading && (
          <View style={{ alignItems: 'center', justifyContent: 'center', width: 72 }}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
          </View>
        )}

        {/* Active Stories */}
        {stories.map((story) => (
          <StoryItem key={story.id} story={story} />
        ))}
      </ScrollView>
    </View>
  );
};

const StoryItem = ({ story }) => {
  const timeRemaining = getTimeRemaining(story.expiresAt);

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        borderColor: colors.primary[500],
        overflow: 'hidden',
        marginBottom: 6
      }}>
        <Image
          source={{ uri: story.thumbnailUrl || story.mediaUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
      <Text style={{
        fontSize: 12,
        color: colors.text.secondary
      }}>
        {timeRemaining}
      </Text>
    </View>
  );
};

const getTimeRemaining = (expiresAt) => {
  if (!expiresAt) return '24h';

  const now = Date.now();
  const expiry = expiresAt.toMillis ? expiresAt.toMillis() : expiresAt;
  const remaining = expiry - now;

  if (remaining <= 0) return '0h';

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
};
