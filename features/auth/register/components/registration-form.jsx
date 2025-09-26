import { Link } from 'expo-router';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModeSelector } from '../../../../shared/components/mode-selector';
import { Button, Text } from '../../../../shared/components/ui';
import { useRegistration } from '../hooks/use-registration';
import { BasicInfoStep } from './steps/basic-info-step';

export const RegistrationForm = ({ onComplete }) => {
  const {
    // Form
    form,
    isLoading,
    // Steps
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    canProceedToNextStep,
    // Mode
    selectedMode,
    setSelectedMode,
    // Validation
    triggerUpdate,
    // Refs
    scrollViewRef,
    // Focus
    createFieldProps,
    clearFocus,
  } = useRegistration({ onComplete });

  return (
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
                <BasicInfoStep
                  form={form}
                  createFieldProps={createFieldProps}
                  triggerUpdate={triggerUpdate}
                  scrollViewRef={scrollViewRef}
                />
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
                  {/* Welcome Header */}
                  <View className="items-center mb-8">
                    <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                      <Ionicons name="checkmark-circle" size={32} color="#16a34a" />
                    </View>
                    <Text variant="subheading" className="mb-2 text-center">
                      ¡Bienvenido a UNO!
                    </Text>
                    <Text variant="body" className="text-center text-muted-foreground">
                      {selectedMode === 'client'
                        ? 'Estás a punto de comenzar a descubrir los mejores productos cerca de ti'
                        : selectedMode === 'business'
                        ? 'Prepárate para hacer crecer tu negocio con nuestra plataforma'
                        : 'Comenzarás a generar ingresos entregando en tu tiempo libre'
                      }
                    </Text>
                  </View>

                  {/* Profile Summary Card */}
                  <View className="bg-gray-50 rounded-xl p-4 mb-6">
                    <Text variant="label" className="mb-4 text-center text-gray-600">
                      RESUMEN DE TU PERFIL
                    </Text>

                    {/* Profile Info */}
                    <View className="space-y-4">
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
                          <Ionicons name="person-outline" size={18} color="#ef4444" />
                        </View>
                        <View className="flex-1">
                          <Text variant="body" className="font-medium">
                            {form.state.values.firstName} {form.state.values.lastName}
                          </Text>
                          <Text variant="caption" className="text-muted-foreground">
                            Nombre completo
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
                          <Ionicons name="mail-outline" size={18} color="#ef4444" />
                        </View>
                        <View className="flex-1">
                          <Text variant="body" className="font-medium">
                            {form.state.values.email}
                          </Text>
                          <Text variant="caption" className="text-muted-foreground">
                            Correo electrónico
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
                          <Ionicons name="call-outline" size={18} color="#ef4444" />
                        </View>
                        <View className="flex-1">
                          <Text variant="body" className="font-medium">
                            {form.state.values.phone}
                          </Text>
                          <Text variant="caption" className="text-muted-foreground">
                            Teléfono
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
                          <Ionicons
                            name={selectedMode === 'client' ? 'basket-outline' : selectedMode === 'business' ? 'briefcase-outline' : 'bicycle-outline'}
                            size={18}
                            color="#ef4444"
                          />
                        </View>
                        <View className="flex-1">
                          <Text variant="body" className="font-medium">
                            Modo {selectedMode === 'client' ? 'Cliente' : selectedMode === 'business' ? 'Negocio' : 'Delivery'}
                          </Text>
                          <Text variant="caption" className="text-muted-foreground">
                            Perfil principal
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Next Steps Preview */}
                  <View className="bg-primary-50 rounded-xl p-4 mb-6">
                    <Text variant="label" className="mb-3 text-center text-primary-700">
                      QUÉ SIGUE DESPUÉS
                    </Text>
                    <Text variant="body" className="text-center text-primary-800">
                      {selectedMode === 'client'
                        ? '• Explorar productos y tiendas\n• Realizar tu primer pedido\n• Configurar tu dirección de entrega'
                        : selectedMode === 'business'
                        ? '• Configurar tu perfil de negocio\n• Agregar productos o servicios\n• Comenzar a recibir pedidos'
                        : '• Completar verificación de conductor\n• Configurar métodos de pago\n• Comenzar a recibir entregas'
                      }
                    </Text>
                  </View>

                </View>
              )}
            </View>

            {/* Navigation Buttons */}
            <View className="mb-6">
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
                  variant="outline"
                  size="lg"
                  className="w-full mt-4"
                  onPress={prevStep}
                  disabled={isLoading}
                >
                  Atrás
                </Button>
              )}
            </View>

          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};