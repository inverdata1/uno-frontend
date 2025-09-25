import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, View, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { Button, Input, Text } from '../../shared/components/ui';
import { useAuthStore } from '../../shared/stores/auth-store';
import { useFocusManager } from '../../shared/hooks';

const loginSchema = z.object({
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isSubmitting, error, clearError } = useAuthStore();
  const { createFieldProps, clearFocus } = useFocusManager();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      console.log('📝 Login form submitted');
      const result = await signIn(value);
      console.log('📝 Login result:', { hasError: !!result?.error });

      // Check if sign in was successful
      if (result && !result.error) {
        // Success - navigate to main app
        console.log('📝 Login successful, navigating to main');
        router.replace('/(main)');
      } else {
        console.log('📝 Login failed, staying on login screen');
      }
      // If there's an error, it's already in the store state and will be displayed
      // No navigation happens, user stays on login screen with error message
    },
  });


  return (
    <SafeAreaView className="flex-1 bg-card" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss();
          clearFocus();
        }}>
          <View className="flex-1 px-6 justify-center">
          {/* Logo */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary-500 rounded-full items-center justify-center mb-4">
              <Text className="text-2xl font-bold text-primary-foreground">UNO</Text>
            </View>
            <Text variant="heading" className="text-center">
              Inicia Sesión
            </Text>
            <Text variant="body" className="text-center text-muted-foreground mt-2">
              Accede a tu cuenta UNO Delivery
            </Text>
          </View>


          {/* Login Form */}
          <View className="mb-6">
            <form.Field
              name="email"
              validators={{
                onBlur: z.string().min(1, 'El email es requerido').email('Email inválido'),
              }}
              children={(field) => (
                <Input
                  placeholder="Correo electrónico"
                  value={field.state.value}
                  onChangeText={(text) => {
                    field.handleChange(text);
                    if (error) clearError(); // Clear auth error when user types
                  }}
                  {...createFieldProps('email', { onBlur: field.handleBlur })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={field.state.meta.errors?.[0]}
                />
              )}
            />

            <form.Field
              name="password"
              validators={{
                onBlur: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
              }}
              children={(field) => (
                <Input
                  placeholder="Contraseña"
                  value={field.state.value}
                  onChangeText={(text) => {
                    field.handleChange(text);
                    if (error) clearError(); // Clear auth error when user types
                  }}
                  {...createFieldProps('password', { onBlur: field.handleBlur })}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  error={field.state.meta.errors?.[0]}
                />
              )}
            />
          </View>

          {/* Error Message - Clean & Minimal */}
          {error && (
            <View className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <View className="flex-row items-center">
                <View className="w-5 h-5 rounded-full bg-red-400 items-center justify-center mr-3">
                  <Text className="text-white text-xs font-bold">!</Text>
                </View>
                <Text className="text-red-700 text-sm font-medium flex-1">
                  {error}
                </Text>
              </View>
            </View>
          )}

          {/* Forgot Password */}
          <View className="items-end mb-6">
            <Text variant="caption" className="text-primary-500">
              ¿Olvidaste tu contraseña?
            </Text>
          </View>

          {/* Login Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full mb-6"
            onPress={form.handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          {/* Register Link */}
          <View className="flex-row justify-center items-center">
            <Text variant="body" className="text-muted-foreground">
              ¿No tienes cuenta?{' '}
            </Text>
            <Link href="/(auth)/register">
              <Text variant="body" className="text-primary-500 font-medium">
                Regístrate
              </Text>
            </Link>
          </View>
        </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}