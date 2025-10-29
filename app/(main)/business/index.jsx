import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import { colors } from '../../../shared/utils/colors';

export default function BusinessOrdersScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: colors.text.primary,
          marginBottom: 16
        }}>
          Pedidos de Clientes
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
            Aquí gestionarás los pedidos de tus clientes
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
