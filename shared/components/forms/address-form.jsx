import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { useFocusManager } from '../../hooks';
import { useVenezuelanStates } from '../../hooks/use-venezuelan-states';
import { newAddressSchema } from '../../schemas/address-schema';
import { cn } from '../../utils/cn';
import { AddressTypeSelector, Button, Input, MapPicker, StateSelector, Text } from '../ui';

export const AddressForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  mode = 'client',
  isLoading = false,
  disableKeyboardAvoidingView = false
}) => {
  const [forceUpdate, setForceUpdate] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const insets = useSafeAreaInsets();
  const { createFieldProps, clearFocus } = useFocusManager();
  const { data: states = [] } = useVenezuelanStates();

  const form = useForm({
    defaultValues: {
      addressTypeId: initialData.addressTypeId || '',
      label: initialData.label || '',
      contactName: initialData.contactName || '',
      phone: initialData.phone || '',
      street: initialData.street || '',
      references: initialData.references || '',
      city: initialData.city || '',
      stateId: initialData.stateId || '',
      stateName: initialData.stateName || '',
      postalCode: initialData.postalCode || '',
      isDefault: initialData.isDefault || false,
      isActive: initialData.isActive !== undefined ? initialData.isActive : true,
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

  // Step validation functions
  const isStep1Valid = () => {
    const addressTypeId = form.getFieldValue('addressTypeId') || '';
    const label = form.getFieldValue('label') || '';
    const contactName = form.getFieldValue('contactName') || '';
    const phone = form.getFieldValue('phone') || '';

    return addressTypeId.length >= 1 &&
           label.length >= 1 &&
           contactName.length >= 2 &&
           phone.length === 11 && /^04(12|14|16|24|26)\d{7}$/.test(phone);
  };

  const isStep2Valid = () => {
    const street = form.getFieldValue('street') || '';
    const city = form.getFieldValue('city') || '';
    const stateId = form.getFieldValue('stateId') || '';
    const postalCode = form.getFieldValue('postalCode') || '';

    return street.length >= 10 &&
           city.length >= 2 &&
           stateId.length >= 1 &&
           postalCode.length >= 4;
  };

  const isStep3Valid = () => {
    const references = form.getFieldValue('references') || '';
    const coordinates = form.getFieldValue('coordinates');

    return references.length >= 10 &&
           coordinates &&
           coordinates.latitude &&
           coordinates.longitude;
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1: return isStep1Valid();
      case 2: return isStep2Valid();
      case 3: return isStep3Valid();
      default: return false;
    }
  };

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

  const renderStepIndicator = () => (
    <View className="flex-row items-center justify-center mb-6">
      {Array.from({ length: totalSteps }, (_, index) => (
        <View key={index} className="flex-row items-center">
          <View className={cn(
            "w-8 h-8 rounded-full items-center justify-center",
            currentStep > index + 1 ? "bg-primary-500" :
            currentStep === index + 1 ? "bg-primary-500" : "bg-gray-200"
          )}>
            <Text className={cn(
              "text-sm font-semibold",
              currentStep >= index + 1 ? "text-white" : "text-gray-500"
            )}>
              {index + 1}
            </Text>
          </View>
          {index < totalSteps - 1 && (
            <View className={cn(
              "w-8 h-0.5 mx-2",
              currentStep > index + 1 ? "bg-primary-500" : "bg-gray-200"
            )} />
          )}
        </View>
      ))}
    </View>
  );

  const renderContent = () => (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss();
          clearFocus();
        }}>
          <View className="p-6">
          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Header */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-foreground mb-2">
              {currentStep === 1 && "Información Básica"}
              {currentStep === 2 && "Detalles de Dirección"}
              {currentStep === 3 && "Ubicación y Referencias"}
            </Text>
            <Text className="text-muted-foreground">
              {currentStep === 1 && "Nombre y datos de contacto"}
              {currentStep === 2 && "Dirección exacta donde entregar"}
              {currentStep === 3 && "Referencias y confirmación final"}
            </Text>
          </View>

          {/* Step Content */}
          <View className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <View className="space-y-6">
                <form.Field
                  name="addressTypeId"
                  validators={{
                    onChange: z.string().min(1, 'Selecciona el tipo de dirección'),
                    onBlur: z.string().min(1, 'Selecciona el tipo de dirección')
                  }}
                  children={(field) => (
                    <View>
                      <AddressTypeSelector
                        value={field.state.value}
                        onChange={(typeId) => {
                          field.handleChange(typeId);
                          triggerUpdate();
                        }}
                        userType={mode}
                        error={field.state.meta.errors?.[0]}
                      />
                    </View>
                  )}
                />

                <form.Field
                  name="label"
                  validators={{
                    onChange: z.string().min(1, 'El nombre de la dirección es requerido'),
                    onBlur: z.string().min(1, 'El nombre de la dirección es requerido')
                  }}
                  children={(field) => (
                    <View>
                      <Text className="text-sm font-medium text-foreground mb-2">
                        Nombre de la dirección *
                      </Text>
                      <Input
                        placeholder="Casa, Trabajo, Oficina..."
                        value={field.state.value}
                        onChangeText={(text) => {
                          field.handleChange(text);
                          triggerUpdate();
                        }}
                        {...createFieldProps('label', { onBlur: field.handleBlur })}
                        error={field.state.meta.errors?.[0]}
                      />
                    </View>
                  )}
                />

                <form.Field
                  name="contactName"
                  validators={{
                    onChange: z.string().min(2, 'El nombre de contacto es requerido'),
                    onBlur: z.string().min(2, 'El nombre de contacto es requerido')
                  }}
                  children={(field) => (
                    <View>
                      <Text className="text-sm font-medium text-foreground mb-2">
                        Nombre de contacto *
                      </Text>
                      <Input
                        placeholder="María González"
                        value={field.state.value}
                        onChangeText={(text) => {
                          field.handleChange(text);
                          triggerUpdate();
                        }}
                        {...createFieldProps('contactName', { onBlur: field.handleBlur })}
                        error={field.state.meta.errors?.[0]}
                        autoComplete="name"
                      />
                    </View>
                  )}
                />

                <form.Field
                  name="phone"
                  validators={{
                    onChange: z.string().min(11, 'Ingresa 11 dígitos').regex(/^04(12|14|16|24|26)\d{7}$/, 'Formato: 04XX XXX XXXX'),
                    onBlur: z.string().min(11, 'Ingresa 11 dígitos').regex(/^04(12|14|16|24|26)\d{7}$/, 'Formato: 04XX XXX XXXX')
                  }}
                  children={(field) => (
                    <View>
                      <Text className="text-sm font-medium text-foreground mb-2">
                        Teléfono de contacto *
                      </Text>
                      <Input
                        placeholder="0412 123 4567"
                        value={(() => {
                          const phoneValue = field.state.value;
                          if (phoneValue.length >= 4) {
                            return phoneValue.replace(/(\d{4})(\d{0,3})(\d{0,4})/, (match, p1, p2, p3) => {
                              if (p3) return `${p1} ${p2} ${p3}`;
                              if (p2) return `${p1} ${p2}`;
                              return p1;
                            });
                          }
                          return phoneValue;
                        })()}
                        onChangeText={(text) => {
                          const cleanText = text.replace(/[^0-9]/g, '').substring(0, 11);
                          field.handleChange(cleanText);
                          triggerUpdate();
                        }}
                        {...createFieldProps('phone', { onBlur: field.handleBlur })}
                        error={field.state.meta.errors?.[0]}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                />
              </View>
            )}

            {/* Step 2: Address Details */}
            {currentStep === 2 && (
              <View className="space-y-6">
                <form.Field
                  name="street"
                  validators={{
                    onChange: z.string().min(10, 'Ingresa la dirección completa'),
                    onBlur: z.string().min(10, 'Ingresa la dirección completa')
                  }}
                  children={(field) => (
                    <View>
                      <Text className="text-sm font-medium text-foreground mb-2">
                        Dirección completa *
                      </Text>
                      <Input
                        placeholder="Av. Francisco de Miranda, Edificio Torre Oeste, Piso 3, Apto 3A"
                        value={field.state.value}
                        onChangeText={(text) => {
                          field.handleChange(text);
                          triggerUpdate();
                        }}
                        {...createFieldProps('street', { onBlur: field.handleBlur })}
                        error={field.state.meta.errors?.[0]}
                        multiline={true}
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                  )}
                />

                <View className="flex-row gap-3">
                  <form.Field
                    name="city"
                    validators={{
                      onChange: z.string().min(2, 'La ciudad es requerida'),
                      onBlur: z.string().min(2, 'La ciudad es requerida')
                    }}
                    children={(field) => (
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground mb-2">
                          Ciudad *
                        </Text>
                        <Input
                          placeholder="Maracaibo"
                          value={field.state.value}
                          onChangeText={(text) => {
                            field.handleChange(text);
                            triggerUpdate();
                          }}
                          {...createFieldProps('city', { onBlur: field.handleBlur })}
                          error={field.state.meta.errors?.[0]}
                        />
                      </View>
                    )}
                  />

                  <form.Field
                    name="stateId"
                    validators={{
                      onChange: z.string().min(1, 'El estado es requerido'),
                      onBlur: z.string().min(1, 'El estado es requerido')
                    }}
                    children={(field) => (
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground mb-2">
                          Estado *
                        </Text>
                        <StateSelector
                          value={field.state.value}
                          onChange={(stateId) => {
                            field.handleChange(stateId);
                            // Also store the state name
                            const selectedState = states.find(state => state.id === stateId);
                            if (selectedState) {
                              form.setFieldValue('stateName', selectedState.name);
                            }
                            triggerUpdate();
                          }}
                          error={field.state.meta.errors?.[0]}
                        />
                      </View>
                    )}
                  />
                </View>

                <form.Field
                  name="postalCode"
                  validators={{
                    onChange: z.string().min(4, 'El código postal es requerido'),
                    onBlur: z.string().min(4, 'El código postal es requerido')
                  }}
                  children={(field) => (
                    <View>
                      <Text className="text-sm font-medium text-foreground mb-2">
                        Código Postal
                      </Text>
                      <Input
                        placeholder="1060"
                        value={field.state.value}
                        onChangeText={(text) => {
                          field.handleChange(text);
                          triggerUpdate();
                        }}
                        {...createFieldProps('postalCode', { onBlur: field.handleBlur })}
                        error={field.state.meta.errors?.[0]}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                />
              </View>
            )}

            {/* Step 3: References and Location */}
            {currentStep === 3 && (
              <View className="space-y-6">
                <form.Field
                  name="references"
                  validators={{
                    onChange: z.string().min(10, 'Agrega referencias para facilitar la entrega'),
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
                        {...createFieldProps('references', { onBlur: field.handleBlur })}
                        error={field.state.meta.errors?.[0]}
                        multiline={true}
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>
                  )}
                />

                {/* Interactive Map Picker */}
                <View>
                  <Text className="text-sm font-medium text-foreground mb-3">
                    Ubicación en el Mapa
                  </Text>
                  <MapPicker
                    height={250}
                    initialLocation={initialData.coordinates}
                    onLocationSelect={(location) => {
                      form.setFieldValue('coordinates', location);
                      triggerUpdate();
                    }}
                    className="border border-gray-300 rounded-xl"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View
            className="flex-row gap-3 mt-8"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            {currentStep === 1 ? (
              <Button
                variant="outline"
                onPress={onCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
            ) : (
              <Button
                variant="outline"
                onPress={prevStep}
                className="flex-1"
                disabled={isLoading}
              >
                Anterior
              </Button>
            )}

            {currentStep < totalSteps ? (
              <form.Subscribe
                selector={(state) => [state.values]}
                children={([values]) => (
                  <Button
                    onPress={nextStep}
                    className="flex-1"
                    disabled={isLoading || !isCurrentStepValid()}
                  >
                    Siguiente
                  </Button>
                )}
              />
            ) : (
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting, state.values]}
                children={([canSubmit, isSubmitting, values]) => (
                  <Button
                    onPress={form.handleSubmit}
                    disabled={!canSubmit || isSubmitting || isLoading || !isCurrentStepValid()}
                    className="flex-1"
                  >
                    {isSubmitting || isLoading ? 'Guardando...' : 'Guardar Dirección'}
                  </Button>
                )}
              />
            )}
          </View>
        </View>
        </TouchableWithoutFeedback>
    </ScrollView>
  );

  if (disableKeyboardAvoidingView) {
    return (
      <View className="flex-1">
        {renderContent()}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      {renderContent()}
    </KeyboardAvoidingView>
  );
};