import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Text, Button, Input, PhoneInput, Checkbox } from '../../shared/components/ui';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';

const registerSchema = z.object({
  firstName: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo letras y espacios'),
  lastName: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo letras y espacios'),
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  phone: z.string()
    .min(11, 'Ingresa 11 dígitos')
    .max(11, 'Solo 11 dígitos')
    .regex(/^04(12|14|16|24|26)\d{7}$/, 'Formato: 04XX XXX XXXX'),
  password: z.string()
    .min(6, 'Mínimo 6 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe tener mayúscula, minúscula y número'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export default function RegisterScreen() {
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      console.log('Register attempt:', value);
      // TODO: Implement Firebase Auth registration
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-card" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 justify-center py-8">
          {/* Logo */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary-500 rounded-full items-center justify-center mb-4">
              <Text className="text-2xl font-bold text-primary-foreground">UNO</Text>
            </View>
            <Text variant="heading" className="text-center">
              Crear Cuenta
            </Text>
            <Text variant="body" className="text-center text-muted-foreground mt-2">
              Únete a UNO Delivery
            </Text>
          </View>

          {/* Register Form */}
          <View className="mb-6">
            {/* First Name and Last Name in same row */}
            <View className="flex-row mb-3">
              <View className="flex-1 mr-2">
                <form.Field
                  name="firstName"
                  validators={{
                    onBlur: z.string().min(2, 'Mínimo 2 caracteres').max(30, 'Máximo 30 caracteres').regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo letras y espacios'),
                  }}
                  children={(field) => (
                    <Input
                      placeholder="Nombre"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      autoCapitalize="words"
                      autoComplete="given-name"
                      error={field.state.meta.errors?.[0]}
                      className="mb-0"
                    />
                  )}
                />
              </View>

              <View className="flex-1 ml-2">
                <form.Field
                  name="lastName"
                  validators={{
                    onBlur: z.string().min(2, 'Mínimo 2 caracteres').max(30, 'Máximo 30 caracteres').regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo letras y espacios'),
                  }}
                  children={(field) => (
                    <Input
                      placeholder="Apellido"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      autoCapitalize="words"
                      autoComplete="family-name"
                      error={field.state.meta.errors?.[0]}
                      className="mb-0"
                    />
                  )}
                />
              </View>
            </View>

            <form.Field
              name="email"
              validators={{
                onBlur: z.string().min(1, 'El email es requerido').email('Email inválido'),
              }}
              children={(field) => (
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
              )}
            />

            <form.Field
              name="phone"
              validators={{
                onBlur: z.string().min(11, 'Ingresa 11 dígitos').max(11, 'Solo 11 dígitos').regex(/^04(12|14|16|24|26)\d{7}$/, 'Formato: 04XX XXX XXXX'),
              }}
              children={(field) => (
                <PhoneInput
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors?.[0]}
                />
              )}
            />

            <form.Field
              name="password"
              validators={{
                onBlur: z.string().min(6, 'Mínimo 6 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe tener mayúscula, minúscula y número'),
              }}
              children={(field) => (
                <Input
                  placeholder="Contraseña"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  error={field.state.meta.errors?.[0]}
                />
              )}
            />

            <form.Field
              name="confirmPassword"
              validators={{
                onBlur: z.string().min(1, 'Confirma tu contraseña'),
              }}
              children={(field) => (
                <Input
                  placeholder="Confirmar contraseña"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  error={field.state.meta.errors?.[0]}
                />
              )}
            />

            {/* Terms and Conditions */}
            <form.Field
              name="acceptTerms"
              validators={{
                onChange: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones'),
              }}
              children={(field) => (
                <View className="mt-4">
                  <Checkbox
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                    error={field.state.meta.errors?.[0]}
                  >
                    <View className="flex-1">
                      <Text variant="caption" className="text-muted-foreground leading-5">
                        Acepto los{' '}
                        <Text className="text-primary-500 underline">
                          términos y condiciones
                        </Text>
                        {' '}y la{' '}
                        <Text className="text-primary-500 underline">
                          política de privacidad
                        </Text>
                      </Text>
                    </View>
                  </Checkbox>
                </View>
              )}
            />
          </View>

          {/* Register Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full mb-6"
            onPress={form.handleSubmit}
            disabled={!form.state.canSubmit}
          >
            Crear Cuenta
          </Button>

          {/* Login Link */}
          <View className="flex-row justify-center items-center">
            <Text variant="body" className="text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
            </Text>
            <Link href="/(auth)/login">
              <Text variant="body" className="text-primary-500 font-medium">
                Inicia sesión
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}