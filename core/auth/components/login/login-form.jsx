import { Link } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { Button, Input, Text } from '../../../../shared/components/ui';
import { WebAuthLayout } from '../../../../shared/components/layout/web-auth-layout';
import { useLogin } from '../../hooks/login/use-login';

export const LoginForm = () => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const {
    form,
    isSubmitting,
    error,
    clearError,
    createFieldProps,
  } = useLogin();

  if (isDesktop) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }} edges={['top']}>
        <WebAuthLayout scrollable={false}>
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>UNO</Text>
            </View>
            <Text variant="heading" style={{ textAlign: 'center' }}>
              Inicia Sesión
            </Text>
            <Text variant="body" style={{ textAlign: 'center', color: '#6b7280', marginTop: 8 }}>
              Accede a tu cuenta UNO Delivery
            </Text>
          </View>

          {/* Login Form */}
          <View style={{ marginBottom: 24 }}>
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
                    if (error) clearError();
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
                    if (error) clearError();
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

          {/* Error Message */}
          {error && (
            <View style={{ marginBottom: 16, padding: 16, backgroundColor: '#fee2e2', borderRadius: 12, borderWidth: 1, borderColor: '#fca5a5' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>!</Text>
                </View>
                <Text style={{ color: '#991b1b', fontSize: 14, fontWeight: '600', flex: 1 }}>{error}</Text>
              </View>
            </View>
          )}

          {/* Forgot Password */}
          <View style={{ alignItems: 'flex-end', marginBottom: 24 }}>
            <Text variant="caption" style={{ color: '#ef4444' }}>
              ¿Olvidaste tu contraseña?
            </Text>
          </View>

          {/* Login Button */}
          <Button
            variant="primary"
            size="lg"
            style={{ width: '100%', marginBottom: 24 }}
            onPress={form.handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          {/* Register Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text variant="body" style={{ color: '#6b7280' }}>
              ¿No tienes cuenta?{' '}
            </Text>
            <Link href="/(auth)/register">
              <Text variant="body" style={{ color: '#ef4444', fontWeight: '500' }}>
                Regístrate
              </Text>
            </Link>
          </View>
        </WebAuthLayout>
      </SafeAreaView>
    );
  }

  // Native layout
  return (
    <SafeAreaView className="flex-1 bg-card" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 justify-center">
            {/* Logo */}
            <View className="items-center mb-8">
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>UNO</Text>
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
                      if (error) clearError();
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
                      if (error) clearError();
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

            {/* Error Message */}
            {error && (
              <View className="mb-4 p-4 bg-red-100 rounded-lg border-2 border-red-400">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-3">
                    <Text className="text-white text-sm font-bold">!</Text>
                  </View>
                  <Text className="text-red-800 text-sm font-semibold flex-1">{error}</Text>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#ef4444',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});