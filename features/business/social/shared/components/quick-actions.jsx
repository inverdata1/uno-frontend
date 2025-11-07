import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '../../../../../shared/components/ui';
import { colors } from '../../../../../shared/utils/colors';

export const QuickActions = ({ onCreatePost, onCreatePromotion }) => {
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
          Nueva Publicación
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCreatePromotion}
        activeOpacity={0.7}
        style={{
          paddingHorizontal: 18,
          paddingVertical: 14,
          borderRadius: 8,
          backgroundColor: colors.bg.secondary,
          borderWidth: 1,
          borderColor: colors.border.light,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Ionicons name="megaphone" size={20} color="#f59e0b" />
      </TouchableOpacity>
    </View>
  );
};
