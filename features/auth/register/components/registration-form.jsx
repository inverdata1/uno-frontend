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
                Paso {currentStep} • {totalSteps} pasos
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
                  {/* Hero Mode Highlight */}
                  <View style={{
                    backgroundColor: '#ef4444',
                    borderRadius: 24,
                    padding: 24,
                    marginBottom: 24,
                    alignItems: 'center',
                    shadowColor: '#ef4444',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.15,
                    shadowRadius: 24,
                    elevation: 8
                  }}>
                    <View style={{
                      width: 80,
                      height: 80,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16
                    }}>
                      <Ionicons
                        name={selectedMode === 'client' ? 'basket' : selectedMode === 'business' ? 'briefcase' : 'bicycle'}
                        size={48}
                        color="#ffffff"
                      />
                    </View>
                    <Text style={{
                      color: '#ffffff',
                      fontSize: 28,
                      fontWeight: '700',
                      marginBottom: 8,
                      textAlign: 'center'
                    }}>
                      {selectedMode === 'client' ? 'Cliente UNO' : selectedMode === 'business' ? 'Negocio UNO' : 'Delivery UNO'}
                    </Text>
                    <Text style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: 16,
                      textAlign: 'center',
                      lineHeight: 24,
                      marginBottom: 16
                    }}>
                      {selectedMode === 'client'
                        ? 'Descubre, compra y disfruta los mejores productos cerca de ti'
                        : selectedMode === 'business'
                        ? 'Impulsa tu negocio y conecta con miles de clientes'
                        : 'Gana dinero entregando con horarios flexibles'
                      }
                    </Text>
                    <View style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }}>
                      <Text style={{ color: '#ffffff', fontWeight: '600' }}>Tipo de Cuenta Seleccionado</Text>
                    </View>
                  </View>

                  {/* Welcome Message */}
                  <View className="items-center mb-6">
                    <Text variant="subheading" className="mb-2 text-center">
                      ¡Bienvenido, {form.state.values.firstName}!
                    </Text>
                    <Text variant="body" className="text-center text-muted-foreground">
                      Revisa tu información antes de crear la cuenta
                    </Text>
                  </View>

                  {/* Account Summary Cards */}
                  <View className="space-y-3 mb-6">
                    <View style={{
                      backgroundColor: '#ffffff',
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2
                    }}>
                      <View style={{
                        width: 48,
                        height: 48,
                        backgroundColor: '#dbeafe',
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16
                      }}>
                        <Ionicons name="person-circle-outline" size={24} color="#3b82f6" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="body" className="font-semibold mb-1">
                          {form.state.values.firstName} {form.state.values.lastName}
                        </Text>
                        <Text variant="caption" className="text-gray-500">
                          {form.state.values.email}
                        </Text>
                      </View>
                      <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                    </View>

                    <View style={{
                      backgroundColor: '#ffffff',
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2
                    }}>
                      <View style={{
                        width: 48,
                        height: 48,
                        backgroundColor: '#dcfce7',
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16
                      }}>
                        <Ionicons name="shield-checkmark-outline" size={24} color="#10b981" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="body" className="font-semibold mb-1">
                          Contacto
                        </Text>
                        <Text variant="caption" className="text-gray-500">
                          Tel: {form.state.values.phone?.replace(/(\d{4})(\d{3})(\d{3})/, '($1) $2-$3') || form.state.values.phone}
                        </Text>
                      </View>
                      <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                    </View>
                  </View>

                  {/* Feature Tutorial Cards */}
                  <View style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: 20,
                    padding: 20,
                    marginBottom: 24
                  }}>
                    <Text variant="label" className="mb-4 text-center text-gray-700">
                      DESCUBRE TUS NUEVAS FUNCIONALIDADES
                    </Text>

                    <View>
                      {selectedMode === 'client' && (
                        <>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <View style={{
                              width: 36,
                              height: 36,
                              backgroundColor: '#fef2f2',
                              borderRadius: 10,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12
                            }}>
                              <Ionicons name="search-outline" size={18} color="#ef4444" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text variant="body" className="font-medium mb-1">Explorar Productos</Text>
                              <Text variant="caption" className="text-gray-500">Miles de productos locales a tu alcance</Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <View style={{
                              width: 36,
                              height: 36,
                              backgroundColor: '#fef2f2',
                              borderRadius: 10,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12
                            }}>
                              <Ionicons name="flash-outline" size={18} color="#ef4444" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text variant="body" className="font-medium mb-1">Entregas Rápidas</Text>
                              <Text variant="caption" className="text-gray-500">Recibe tus pedidos en tiempo récord</Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                              width: 36,
                              height: 36,
                              backgroundColor: '#fef2f2',
                              borderRadius: 10,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12
                            }}>
                              <Ionicons name="heart-outline" size={18} color="#ef4444" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text variant="body" className="font-medium mb-1">Lista de Favoritos</Text>
                              <Text variant="caption" className="text-gray-500">Guarda y reordena tus productos preferidos</Text>
                            </View>
                          </View>
                        </>
                      )}

                      {selectedMode === 'business' && (
                        <>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <View style={{
                              width: 36,
                              height: 36,
                              backgroundColor: '#fef2f2',
                              borderRadius: 10,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12
                            }}>
                              <Ionicons name="storefront-outline" size={18} color="#ef4444" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text variant="body" className="font-medium mb-1">Tienda Virtual</Text>
                              <Text variant="caption" className="text-gray-500">Gestiona tu inventario y precios fácilmente</Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <View style={{
                              width: 36,
                              height: 36,
                              backgroundColor: '#fef2f2',
                              borderRadius: 10,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12
                            }}>
                              <Ionicons name="analytics-outline" size={18} color="#ef4444" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text variant="body" className="font-medium mb-1">Análisis de Ventas</Text>
                              <Text variant="caption" className="text-gray-500">Reportes detallados de tu rendimiento</Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                              width: 36,
                              height: 36,
                              backgroundColor: '#fef2f2',
                              borderRadius: 10,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12
                            }}>
                              <Ionicons name="people-outline" size={18} color="#ef4444" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text variant="body" className="font-medium mb-1">Base de Clientes</Text>
                              <Text variant="caption" className="text-gray-500">Conecta con nuevos clientes cada día</Text>
                            </View>
                          </View>
                        </>
                      )}

                      {selectedMode === 'delivery' && (
                        <>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <View style={{
                              width: 36,
                              height: 36,
                              backgroundColor: '#fef2f2',
                              borderRadius: 10,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12
                            }}>
                              <Ionicons name="time-outline" size={18} color="#ef4444" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text variant="body" className="font-medium mb-1">Horarios Flexibles</Text>
                              <Text variant="caption" className="text-gray-500">Trabaja cuando quieras, donde quieras</Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <View style={{
                              width: 36,
                              height: 36,
                              backgroundColor: '#fef2f2',
                              borderRadius: 10,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12
                            }}>
                              <Ionicons name="cash-outline" size={18} color="#ef4444" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text variant="body" className="font-medium mb-1">Pagos Inmediatos</Text>
                              <Text variant="caption" className="text-gray-500">Recibe tu dinero de forma segura y rápida</Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                              width: 36,
                              height: 36,
                              backgroundColor: '#fef2f2',
                              borderRadius: 10,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12
                            }}>
                              <Ionicons name="navigate-outline" size={18} color="#ef4444" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text variant="body" className="font-medium mb-1">Rutas Inteligentes</Text>
                              <Text variant="caption" className="text-gray-500">Optimización automática de tus entregas</Text>
                            </View>
                          </View>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Ready to Start */}
                  <View style={{
                    backgroundColor: '#f0fdf4',
                    borderWidth: 1,
                    borderColor: '#bbf7d0',
                    borderRadius: 16,
                    padding: 20,
                    alignItems: 'center'
                  }}>
                    <Ionicons name="checkmark-circle" size={32} color="#16a34a" style={{ marginBottom: 12 }} />
                    <Text variant="body" className="font-bold text-green-800 mb-2 text-center">
                      ¡Todo listo para crear tu cuenta!
                    </Text>
                    <Text variant="caption" className="text-green-600 text-center">
                      Pulsa "Crear Cuenta" para finalizar el registro
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