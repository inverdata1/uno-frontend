import React from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Text, Button, Input } from '../../shared/components/ui';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export default function LoginScreen() {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      console.log('Login attempt:', value);
      // TODO: Implement Firebase Auth login
    },
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-card"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
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
          <View className="space-y-4 mb-6">
            <form.Field
              name="email"
              children={(field) => (
                <View>
                  <Input
                    placeholder="Correo electrónico"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={field.state.meta.errors?.[0]}
                  />
                </View>
              )}
            />

            <form.Field
              name="password"
              children={(field) => (
                <View>
                  <Input
                    placeholder="Contraseña"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                    error={field.state.meta.errors?.[0]}
                  />
                </View>
              )}
            />
          </View>

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
            disabled={!form.state.canSubmit}
          >
            Iniciar Sesión
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}