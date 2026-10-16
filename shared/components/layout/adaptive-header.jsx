import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getUserTypeConfig } from '../../config/user-types';
import { useCurrentUserType } from '../../hooks/use-user-type';
import { BrandLogo } from '../ui/brand-logo';

/**
 * Brand header for the client home: UNO AI logo and notifications.
 * Delivery addresses are no longer picked here; the client shares their
 * location in the chat when they place a delivery order.
 */
export const AdaptiveHeader = () => {
  const router = useRouter();
  const { currentUserType } = useCurrentUserType();
  const userTypeSettings = getUserTypeConfig(currentUserType);

  return (
    <View style={{
      backgroundColor: userTypeSettings.primary,
      paddingVertical: 16,
      paddingHorizontal: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <BrandLogo variant="white" height={30} />

      <TouchableOpacity
        onPress={() => router.push('/client/notifications')}
        accessibilityLabel="Notificaciones"
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Ionicons name="notifications-outline" size={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};
