import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getUserTypeConfig } from '../../config/user-types';
import { useCurrentUserType } from '../../hooks/use-user-type';
import { BrandLogo } from '../ui/brand-logo';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../config/api-client';

/**
 * Brand header for the client home: UNO AI logo and notifications.
 * Delivery addresses are no longer picked here; the client shares their
 * location in the chat when they place a delivery order.
 */
export const AdaptiveHeader = () => {
  const router = useRouter();
  const { currentUserType } = useCurrentUserType();
  const userTypeSettings = getUserTypeConfig(currentUserType);

  // Same query as the notifications screen, so the badge clears as they're read
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/chat/notifications').then((res) => res.data),
    refetchInterval: 60000,
  });
  const unread = notifications.filter((n) => !n.isRead).length;

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
        {unread > 0 && (
          <View style={{
            position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9,
            backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: userTypeSettings.primary }}>{unread > 99 ? '99+' : unread}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};
