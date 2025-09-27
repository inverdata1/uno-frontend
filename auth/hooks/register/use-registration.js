import { useState, useRef } from 'react';
import { useForm } from '@tanstack/react-form';
import { useAuthStore } from '../../stores/auth-store';
import { useFocusManager } from '../../../shared/hooks';
import { registerSchema } from '../../schemas/register/register-schema';

export const useRegistration = ({ onComplete }) => {
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
      dateOfBirth: null,
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
        // Success - call onComplete callback
        onComplete?.();
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

  // Force update function
  const triggerUpdate = () => {
    setForceUpdate(prev => prev + 1);
  };

  return {
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
    isStep1Valid,
    triggerUpdate,

    // Refs
    scrollViewRef,

    // Focus
    createFieldProps,
    clearFocus,
  };
};