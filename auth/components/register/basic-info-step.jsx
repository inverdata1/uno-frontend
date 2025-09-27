import React from 'react';
import { View } from 'react-native';
import { z } from 'zod';
import { Input, Text, Checkbox } from '../../../shared/components/ui';

export const BasicInfoStep = ({ form, createFieldProps, triggerUpdate, scrollViewRef }) => {
  return (
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
              triggerUpdate();
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
              triggerUpdate();
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
        }}
        children={(field) => (
          <Input
            placeholder="Contraseña"
            value={field.state.value}
            onChangeText={(text) => {
              field.handleChange(text);
              // Force component re-render to update validation
              triggerUpdate();
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
              triggerUpdate();
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
                triggerUpdate();
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
  );
};