import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import { Input, Text, Button } from '../ui';
import { newAddressSchema, venezuelanStates, addressLabels } from '../../schemas/address-schema';
import { cn } from '../../utils/cn';

export const AddressForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  mode = 'client',
  isLoading = false
}) => {
  const [forceUpdate, setForceUpdate] = useState(0);

  const form = useForm({
    defaultValues: {
      label: initialData.label || '',
      contactName: initialData.contactName || '',
      phone: initialData.phone || '',
      street: initialData.street || '',
      number: initialData.number || '',
      floor: initialData.floor || '',
      apartment: initialData.apartment || '',
      references: initialData.references || '',
      neighborhood: initialData.neighborhood || '',
      city: initialData.city || '',
      state: initialData.state || '',
      postalCode: initialData.postalCode || '',
      isDefault: initialData.isDefault || false,
      coordinates: initialData.coordinates || null
    },
    validators: {
      onSubmit: newAddressSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    }
  });

  const triggerUpdate = () => setForceUpdate(prev => prev + 1);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-6 space-y-4">
          {/* Header */}
          <View className="mb-4">
            <Text className="text-2xl font-bold text-foreground">
              {initialData.id ? 'Editar Dirección' : 'Nueva Dirección'}
            </Text>
            <Text className="text-muted-foreground mt-1">
              Completa todos los campos para una entrega precisa
            </Text>
          </View>

          {/* Address Label */}
          <form.Field
            name="label"
            validators={{
              onBlur: z.string().min(1, 'El nombre de la dirección es requerido')
            }}
            children={(field) => (
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  Nombre de la dirección *
                </Text>
                <Input
                  placeholder="Ej: Casa, Trabajo, Oficina"
                  value={field.state.value}
                  onChangeText={(text) => {
                    field.handleChange(text);
                    triggerUpdate();
                  }}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors?.[0]}
                />
              </View>
            )}
          />

          {/* Contact Information */}
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-foreground">
              Información de Contacto
            </Text>

            <form.Field
              name="contactName"
              validators={{
                onBlur: z.string().min(2, 'El nombre de contacto es requerido')
              }}
              children={(field) => (
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Nombre de contacto *
                  </Text>
                  <Input
                    placeholder="Nombre de quien recibe"
                    value={field.state.value}
                    onChangeText={(text) => {
                      field.handleChange(text);
                      triggerUpdate();
                    }}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors?.[0]}
                    autoComplete="name"
                  />
                </View>
              )}
            />

            <form.Field
              name="phone"
              validators={{
                onBlur: z.string().min(11, 'Ingresa 11 dígitos').regex(/^04(12|14|16|24|26)\d{7}$/, 'Formato: 04XX XXX XXXX')
              }}
              children={(field) => (
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Teléfono de contacto *
                  </Text>
                  <Input
                    placeholder="04XX XXX XXXX"
                    value={field.state.value}
                    onChangeText={(text) => {
                      const cleanText = text.replace(/[^0-9]/g, '').substring(0, 11);
                      field.handleChange(cleanText);
                      triggerUpdate();
                    }}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors?.[0]}
                    keyboardType="numeric"
                  />
                </View>
              )}
            />
          </View>

          {/* Address Details */}
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-foreground">
              Detalles de la Dirección
            </Text>

            <form.Field
              name="street"
              validators={{
                onBlur: z.string().min(5, 'La dirección debe tener al menos 5 caracteres')
              }}
              children={(field) => (
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Calle/Avenida *
                  </Text>
                  <Input
                    placeholder="Ej: Av. Francisco de Miranda"
                    value={field.state.value}
                    onChangeText={(text) => {
                      field.handleChange(text);
                      triggerUpdate();
                    }}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors?.[0]}
                  />
                </View>
              )}
            />

            <View className="flex-row space-x-3">
              <form.Field
                name="number"
                validators={{
                  onBlur: z.string().min(1, 'El número es requerido')
                }}
                children={(field) => (
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Número *
                    </Text>
                    <Input
                      placeholder="123"
                      value={field.state.value}
                      onChangeText={(text) => {
                        field.handleChange(text);
                        triggerUpdate();
                      }}
                      onBlur={field.handleBlur}
                      error={field.state.meta.errors?.[0]}
                    />
                  </View>
                )}
              />

              <form.Field
                name="floor"
                children={(field) => (
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Piso (opcional)
                    </Text>
                    <Input
                      placeholder="3"
                      value={field.state.value}
                      onChangeText={(text) => {
                        field.handleChange(text);
                        triggerUpdate();
                      }}
                      onBlur={field.handleBlur}
                      error={field.state.meta.errors?.[0]}
                    />
                  </View>
                )}
              />

              <form.Field
                name="apartment"
                children={(field) => (
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Apto (opcional)
                    </Text>
                    <Input
                      placeholder="A-2"
                      value={field.state.value}
                      onChangeText={(text) => {
                        field.handleChange(text);
                        triggerUpdate();
                      }}
                      onBlur={field.handleBlur}
                      error={field.state.meta.errors?.[0]}
                    />
                  </View>
                )}
              />
            </View>

            <form.Field
              name="references"
              validators={{
                onBlur: z.string().min(10, 'Agrega referencias para facilitar la entrega')
              }}
              children={(field) => (
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Referencias *
                  </Text>
                  <Input
                    placeholder="Ej: Edificio azul con portón negro, frente a la farmacia"
                    value={field.state.value}
                    onChangeText={(text) => {
                      field.handleChange(text);
                      triggerUpdate();
                    }}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors?.[0]}
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>
              )}
            />

            <form.Field
              name="neighborhood"
              children={(field) => (
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Sector/Barrio (opcional)
                  </Text>
                  <Input
                    placeholder="Ej: El Rosal, Las Mercedes"
                    value={field.state.value}
                    onChangeText={(text) => {
                      field.handleChange(text);
                      triggerUpdate();
                    }}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors?.[0]}
                  />
                </View>
              )}
            />

            <View className="flex-row space-x-3">
              <form.Field
                name="city"
                validators={{
                  onBlur: z.string().min(2, 'La ciudad es requerida')
                }}
                children={(field) => (
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Ciudad *
                    </Text>
                    <Input
                      placeholder="Caracas"
                      value={field.state.value}
                      onChangeText={(text) => {
                        field.handleChange(text);
                        triggerUpdate();
                      }}
                      onBlur={field.handleBlur}
                      error={field.state.meta.errors?.[0]}
                    />
                  </View>
                )}
              />

              <form.Field
                name="state"
                validators={{
                  onBlur: z.string().min(2, 'El estado es requerido')
                }}
                children={(field) => (
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Estado *
                    </Text>
                    <Input
                      placeholder="Distrito Capital"
                      value={field.state.value}
                      onChangeText={(text) => {
                        field.handleChange(text);
                        triggerUpdate();
                      }}
                      onBlur={field.handleBlur}
                      error={field.state.meta.errors?.[0]}
                    />
                  </View>
                )}
              />
            </View>
          </View>

          {/* Map Picker Placeholder */}
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-foreground">
              Ubicación en el Mapa
            </Text>
            <View className="bg-gray-100 rounded-xl p-8 items-center justify-center min-h-48">
              <Text className="text-gray-500 text-center">
                Selector de mapa próximamente
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-2">
                Por ahora, asegúrate de completar bien la dirección y referencias
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mt-8">
            <Button
              variant="outline"
              onPress={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  onPress={form.handleSubmit}
                  disabled={!canSubmit || isSubmitting || isLoading}
                  className="flex-1"
                >
                  {isSubmitting || isLoading ? 'Guardando...' : 'Guardar Dirección'}
                </Button>
              )}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};