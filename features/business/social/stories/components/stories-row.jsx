import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '../../../../../shared/components/ui';
import { useBusinessStories, useDeleteStory } from '../../../../../shared/hooks/use-business-stories';
import { colors } from '../../../../../shared/utils/colors';

export const StoriesRow = ({ onCreateStory, onStoryPress }) => {
  const { data: stories = [], isLoading } = useBusinessStories();
  const deleteStory = useDeleteStory();

  const handleDeleteStory = (story) => {
    Alert.alert(
      'Eliminar historia',
      '¿Estás seguro de que quieres eliminar esta historia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteStory.mutate(story.id)
        }
      ]
    );
  };

  const handleStoryPress = (index) => {
    if (onStoryPress) {
      onStoryPress(stories, index);
    }
  };

  const renderItems = () => {
    const items = [];

    items.push(
      <TouchableOpacity
        key="add-story"
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
    );

    if (isLoading) {
      items.push(
        <View key="loading" style={{ alignItems: 'center', justifyContent: 'center', width: 72 }}>
          <ActivityIndicator size="small" color={colors.primary[500]} />
        </View>
      );
    }

    stories.forEach((story, index) => {
      items.push(
        <StoryItem
          key={story.id || `story-${index}`}
          story={story}
          onPress={() => handleStoryPress(index)}
          onDelete={() => handleDeleteStory(story)}
        />
      );
    });

    return items;
  };

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
        {renderItems()}
      </ScrollView>
    </View>
  );
};

const StoryItem = ({ story, onPress, onDelete }) => {
  const timeRemaining = getTimeRemaining(story.expiresAt);

  return (
    <TouchableOpacity
      style={{ alignItems: 'center' }}
      onPress={onPress}
      onLongPress={onDelete}
    >
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
    </TouchableOpacity>
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
