import React, { useState, useEffect, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Text, Button, Input, PhoneInput, Checkbox } from '../../shared/components/ui';
import { ModeSelector } from '../../shared/components/mode-selector';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useAuthStore } from '../../shared/stores/auth-store';
import { useFocusManager } from '../../shared/hooks';
import * as Haptics from 'expo-haptics';

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
    .min(6, 'Mínimo 6 caracteres'),
    // TODO: For production, restore secure validation:
    // .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe tener mayúscula, minúscula y número'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuthStore();
  const { createFieldProps, clearFocus } = useFocusManager();

  // ScrollView ref for keyboard handling
  const scrollViewRef = useRef(null);

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState('client');
  const [forceUpdate, setForceUpdate] = useState(0);
  const totalSteps = 3;

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
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      // Include selected mode in registration data
      const registrationData = {
        ...value,
        selectedMode
      };

      const result = await signUp(registrationData);

      // Check if sign up was successful
      if (result && !result.error) {
        // Success - navigate to main app
        router.replace('/(main)');
      }
      // If there's an error, it's already in the store state and will be displayed
      // No navigation happens, user stays on register screen with error message
    },
  });

  // Real-time form validation - computed directly from form state
  const isStep1Valid = () => {
    const basicFields = form.state.values;

    // Check if all required fields have values
    const hasAllValues = Boolean(
      basicFields.firstName?.trim() &&
      basicFields.lastName?.trim() &&
      basicFields.email?.trim() &&
      basicFields.phone?.trim() &&
      basicFields.password?.trim() &&
      basicFields.confirmPassword?.trim() &&
      basicFields.acceptTerms === true
    );

    // Check if passwords match
    const passwordsMatch = basicFields.password === basicFields.confirmPassword;

    // Basic email validation
    const emailValid = basicFields.email?.includes('@') && basicFields.email?.includes('.');

    // Phone validation
    const phoneValid = /^04(12|14|16|24|26)\d{7}$/.test(basicFields.phone || '');

    const valid = hasAllValues && passwordsMatch && emailValid && phoneValid;

    // Include forceUpdate in dependency to trigger re-computation
    console.log('🔄 Validation check (update #' + forceUpdate + '):', {
      hasAllValues,
      passwordsMatch,
      emailValid,
      phoneValid,
      acceptTerms: basicFields.acceptTerms,
      valid
    });

    return valid;
  };

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step validation
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        const valid = isStep1Valid();
        console.log('✅ Step 1 validation result:', valid);
        return valid;
      case 2:
        // Mode selection step - ensure mode is selected
        return selectedMode !== null;
      default:
        return true;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-card" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss();
          clearFocus();
        }}>
          <View className="flex-1 px-6 py-8">
          {/* Logo */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary-500 rounded-full items-center justify-center mb-4">
              <Text className="text-2xl font-bold text-primary-foreground">UNO</Text>
            </View>
            <Text variant="heading" className="text-center">
              Crear Cuenta
            </Text>
            <Text variant="body" className="text-center text-muted-foreground mt-2">
              Paso {currentStep} de {totalSteps}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="flex-row mb-8 px-2">
            {[1, 2, 3].map((step) => (
              <View key={step} className="flex-1 mx-1">
                <View className={`h-2 rounded-full ${
                  step <= currentStep ? 'bg-primary-500' : 'bg-gray-200'
                }`} />
              </View>
            ))}
          </View>


          {/* Step Content */}
          <View className="mb-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <View>
                <Text variant="subheading" className="mb-4 text-center">
                  Información Básica
                </Text>

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
                          {...createFieldProps('firstName', { onBlur: field.handleBlur })}
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
                          {...createFieldProps('lastName', { onBlur: field.handleBlur })}
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
                      onChangeText={(text) => {
                        field.handleChange(text);
                        // Force component re-render to update validation
                        setForceUpdate(prev => prev + 1);
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
                  name="phone"
                  validators={{
                    onBlur: z.string().min(11, 'Ingresa 11 dígitos').max(11, 'Solo 11 dígitos').regex(/^04(12|14|16|24|26)\d{7}$/, 'Formato: 04XX XXX XXXX'),
                  }}
                  children={(field) => (
                    <Input
                      placeholder="04XX XXX XXXX"
                      value={field.state.value}
                      onChangeText={(text) => {
                        // Only allow numbers and limit to 11 digits
                        const cleanText = text.replace(/[^0-9]/g, '').substring(0, 11);
                        field.handleChange(cleanText);
                        // Force component re-render to update validation
                        setForceUpdate(prev => prev + 1);
                      }}
                      {...createFieldProps('phone', { onBlur: field.handleBlur })}
                      keyboardType="numeric"
                      error={field.state.meta.errors?.[0]}
                    />
                  )}
                />

                <form.Field
                  name="password"
                  validators={{
                    onBlur: z.string().min(6, 'Mínimo 6 caracteres'),
                    // TODO: For production, restore secure validation:
                    // onBlur: z.string().min(6, 'Mínimo 6 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe tener mayúscula, minúscula y número'),
                  }}
                  children={(field) => (
                    <Input
                      placeholder="Contraseña"
                      value={field.state.value}
                      onChangeText={(text) => {
                        field.handleChange(text);
                        // Force component re-render to update validation
                        setForceUpdate(prev => prev + 1);
                      }}
                      {...createFieldProps('password', {
                        onBlur: field.handleBlur,
                        onFocus: () => {
                          // Scroll to make this field visible when keyboard appears
                          setTimeout(() => {
                            scrollViewRef.current?.scrollTo({ y: 200, animated: true });
                          }, 100);
                        }
                      })}
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
                      onChangeText={(text) => {
                        field.handleChange(text);
                        // Force component re-render to update validation
                        setForceUpdate(prev => prev + 1);
                      }}
                      {...createFieldProps('confirmPassword', {
                        onBlur: field.handleBlur,
                        onFocus: () => {
                          // Scroll to make this field and the button visible
                          setTimeout(() => {
                            scrollViewRef.current?.scrollTo({ y: 300, animated: true });
                          }, 100);
                        }
                      })}
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
                    onBlur: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones'),
                  }}
                  children={(field) => (
                    <View className="mt-4">
                      <Checkbox
                        checked={field.state.value}
                        onCheckedChange={(checked) => {
                          console.log('📋 Checkbox changed to:', checked);
                          field.handleChange(checked);
                          // Force component re-render to update button state
                          setForceUpdate(prev => prev + 1);
                        }}
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
            )}

            {/* Step 2: Mode Selection */}
            {currentStep === 2 && (
              <ModeSelector
                selectedMode={selectedMode}
                onModeSelect={setSelectedMode}
              />
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <View>
                <Text variant="subheading" className="mb-4 text-center">
                  ¡Todo Listo!
                </Text>
                <Text variant="body" className="mb-6 text-center text-muted-foreground">
                  Revisa tu información antes de crear la cuenta
                </Text>

                <View className="space-y-3 mb-6">
                  <Text variant="body">
                    <Text variant="label">Nombre:</Text> {form.state.values.firstName} {form.state.values.lastName}
                  </Text>
                  <Text variant="body">
                    <Text variant="label">Email:</Text> {form.state.values.email}
                  </Text>
                  <Text variant="body">
                    <Text variant="label">Teléfono:</Text> {form.state.values.phone}
                  </Text>
                  <Text variant="body">
                    <Text variant="label">Modo:</Text> {selectedMode === 'client' ? 'Cliente' : selectedMode === 'business' ? 'Negocio' : 'Repartidor'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Navigation Buttons */}
          <View className="space-y-3 mb-6">
            {currentStep < totalSteps ? (
              // Next Step Button
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onPress={nextStep}
                disabled={!canProceedToNextStep()}
              >
                Continuar
              </Button>
            ) : (
              // Final Submit Button
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onPress={form.handleSubmit}
                disabled={!form.state.canSubmit || isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            )}

            {/* Back Button */}
            {currentStep > 1 && (
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onPress={prevStep}
                disabled={isLoading}
              >
                Atrás
              </Button>
            )}
          </View>

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
        </TouchableWithoutFeedback>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}