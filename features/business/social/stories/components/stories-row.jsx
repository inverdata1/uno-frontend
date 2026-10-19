import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../../../shared/components/ui';
import { useBusinessStories, useDeleteStory } from '../../../../../shared/hooks/use-business-stories';
import { colors } from '../../../../../shared/utils/colors';
import { resolveMediaUrl } from '../../../../../shared/utils/media-url';

const RING_SIZE = 72;

export const StoriesRow = ({ onCreateStory, onStoryPress, logo }) => {
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

  return (
    <View style={{ backgroundColor: colors.bg.primary, paddingTop: 4, paddingBottom: 16, marginTop: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary }}>Historias</Text>
        {stories.length > 0 && (
          <Text style={{ fontSize: 12, color: colors.text.secondary }}>Mantén presionada para eliminar</Text>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 20 }}>
        {/* Add story: business logo with a + badge */}
        <TouchableOpacity style={{ alignItems: 'center', width: RING_SIZE + 4 }} onPress={onCreateStory} activeOpacity={0.8}>
          <View style={{ width: RING_SIZE, height: RING_SIZE, marginBottom: 6 }}>
            <View style={{
              width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2, overflow: 'hidden',
              backgroundColor: colors.bg.secondary, alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: colors.border.light,
            }}>
              {logo ? (
                <Image source={{ uri: logo }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Ionicons name="storefront-outline" size={28} color={colors.text.secondary} />
              )}
            </View>
            <View style={{
              position: 'absolute', right: -2, bottom: -2, width: 26, height: 26, borderRadius: 13,
              backgroundColor: colors.primary[500], borderWidth: 3, borderColor: colors.bg.primary,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="add" size={16} color="#ffffff" />
            </View>
          </View>
          <Text style={{ fontSize: 12, color: colors.text.primary, fontWeight: '600' }}>Tu historia</Text>
        </TouchableOpacity>

        {isLoading && (
          <View style={{ alignItems: 'center', justifyContent: 'center', width: RING_SIZE }}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
          </View>
        )}

        {stories.map((story, index) => (
          <StoryItem
            key={story.id || `story-${index}`}
            story={story}
            onPress={() => onStoryPress?.(stories, index)}
            onDelete={() => handleDeleteStory(story)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const StoryItem = ({ story, onPress, onDelete }) => {
  const timeRemaining = getTimeRemaining(story.expiresAt);
  // A video's own URL can't be shown by Image; fall back to its thumbnail or an icon
  const preview = resolveMediaUrl(story.thumbnailUrl) || (story.mediaType === 'video' ? null : resolveMediaUrl(story.mediaUrl));

  return (
    <TouchableOpacity style={{ alignItems: 'center', width: RING_SIZE + 4 }} onPress={onPress} onLongPress={onDelete} activeOpacity={0.8}>
      <LinearGradient
        colors={['#f59e0b', '#ef4444', '#db2777']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{ width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2, padding: 3, marginBottom: 6 }}
      >
        <View style={{ flex: 1, borderRadius: RING_SIZE / 2, backgroundColor: colors.bg.primary, padding: 2 }}>
          <View style={{ flex: 1, borderRadius: RING_SIZE / 2, overflow: 'hidden', backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' }}>
            {preview ? (
              <Image source={{ uri: preview }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <Ionicons name="play" size={22} color="#ffffff" />
            )}
          </View>
        </View>
      </LinearGradient>
      <Text style={{ fontSize: 12, color: colors.text.secondary }}>{timeRemaining}</Text>
    </TouchableOpacity>
  );
};

const getTimeRemaining = (expiresAt) => {
  if (!expiresAt) return '24h';

  const now = Date.now();
  // expiresAt is a Firestore Timestamp on legacy data but an ISO string from
  // the NestJS backend (JSON has no Date type); `expiresAt - now` on a raw
  // string coerces to NaN, so route both shapes through Date.
  const expiry = expiresAt.toMillis ? expiresAt.toMillis() : new Date(expiresAt).getTime();
  const remaining = expiry - now;

  if (remaining <= 0) return '0h';

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `Quedan ${hours}h`;
  }
  return `Quedan ${minutes}m`;
};
