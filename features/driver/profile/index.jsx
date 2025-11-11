import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import { colors } from '../../../shared/utils/colors';

export default function DriverProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: colors.text.primary,
          marginBottom: 16
        }}>
          Perfil del Conductor
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
            Perfil del conductor en construcción
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
