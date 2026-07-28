import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '../../../../../shared/components/ui';
import { colors } from '../../../../../shared/utils/colors';

export const QuickActions = ({ onCreatePost, onCreateVideo, onCreatePromotion }) => {
  return (
    <View style={{
      flexDirection: 'row',
      padding: 16,
      gap: 12,
      backgroundColor: colors.bg.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light
    }}>
      <TouchableOpacity
        onPress={onCreatePost}
        activeOpacity={0.85}
        style={{
          flex: 1,
          backgroundColor: colors.primary[500],
          paddingVertical: 14,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
      >
        <Ionicons name="add" size={22} color={colors.text.inverse} />
        <Text style={{
          fontSize: 15,
          fontWeight: '700',
          color: colors.text.inverse
        }}>
          Nuevo Post
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCreateVideo}
        activeOpacity={0.85}
        style={{
          flex: 1,
          backgroundColor: colors.primary[100],
          paddingVertical: 14,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
      >
        <Ionicons name="videocam" size={22} color={colors.primary[700]} />
        <Text style={{
          fontSize: 15,
          fontWeight: '700',
          color: colors.primary[700]
        }}>
          Nuevo Video
        </Text>
      </TouchableOpacity>
    </View>
  );
};
