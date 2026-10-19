import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '../../../../../shared/components/ui';
import { colors } from '../../../../../shared/utils/colors';

const ACTIONS = [
  { key: 'post', label: 'Post', hint: 'Fotos', icon: 'images', color: '#ef4444' },
  { key: 'video', label: 'Video', hint: 'Reels', icon: 'videocam', color: '#8b5cf6' },
  { key: 'story', label: 'Historia', hint: '24 horas', icon: 'aperture', color: '#f59e0b' },
];

export const QuickActions = ({ onCreatePost, onCreateVideo, onCreateStory }) => {
  const handlers = { post: onCreatePost, video: onCreateVideo, story: onCreateStory };

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 10 }}>Crear</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.key}
            onPress={handlers[action.key]}
            activeOpacity={0.85}
            style={{
              flex: 1, backgroundColor: colors.bg.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center',
              shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
            }}
          >
            <View style={{
              width: 44, height: 44, borderRadius: 22, backgroundColor: `${action.color}1A`,
              alignItems: 'center', justifyContent: 'center', marginBottom: 8,
            }}>
              <Ionicons name={action.icon} size={22} color={action.color} />
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text.primary }}>{action.label}</Text>
            <Text style={{ fontSize: 11, color: colors.text.secondary, marginTop: 1 }}>{action.hint}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
