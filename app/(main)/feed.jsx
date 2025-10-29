import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentUserType } from '../../shared/hooks/use-user-type';
import FeedScreen from '../../modules/social/feed';
import { Text } from '../../shared/components/ui';
import { colors } from '../../shared/utils/colors';

export default function FeedOrProductsScreen() {
  const { currentUserType } = useCurrentUserType();

  // For business mode, show products management
  if (currentUserType === 'business') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: 16
          }}>
            Mis Productos
          </Text>

          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: 16,
              color: colors.text.secondary,
              textAlign: 'center'
            }}>
              Aquí gestionarás tu catálogo de productos
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // For client mode, show social feed
  return <FeedScreen />;
}
