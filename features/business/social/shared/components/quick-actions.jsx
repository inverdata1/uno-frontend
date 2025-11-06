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
        style={{
          flex: 1,
          backgroundColor: colors.primary[500],
          paddingVertical: 14,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          shadowColor: colors.primary[500],
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 3
        }}
      >
        <Ionicons name="camera" size={20} color={colors.text.inverse} />
        <Text style={{
          fontSize: 15,
          fontWeight: '700',
          color: colors.text.inverse
        }}>
          Publicar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCreatePromotion}
        style={{
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderRadius: 12,
          backgroundColor: colors.bg.secondary,
          borderWidth: 1.5,
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
