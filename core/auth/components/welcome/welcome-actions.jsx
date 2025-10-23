import { Link } from 'expo-router';
import { View } from 'react-native';
import { Button, Text } from '../../../../shared/components/ui';

export function WelcomeActions({ onGetStarted }) {
  return (
    <View className="px-6 pb-8">
      {/* CTA Buttons */}
      <Link href="/(auth)/register" asChild>
        <Button
          variant="primary"
          size="lg"
          className="w-full mb-4 rounded-xl"
          onPress={onGetStarted}
        >
          Crear cuenta
        </Button>
      </Link>

      <Link href="/(auth)/login" asChild>
        <Button
          variant="outline"
          size="lg"
          className="w-full rounded-xl border border-primary-500"
        >
          Iniciar sesión
        </Button>
      </Link>

      {/* Footer */}
      <View className="flex-row justify-center items-center mt-6">
        <Text className="text-sm text-primary-500 font-medium underline mx-4">
          Términos
        </Text>
        <View className="w-px h-4 bg-muted mx-2" />
        <Text className="text-sm text-primary-500 font-medium underline mx-4">
          Privacidad
        </Text>
      </View>
    </View>
  );
}