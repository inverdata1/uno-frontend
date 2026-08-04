import { useForm } from '@tanstack/react-form';
import { useRef, useState, useEffect } from 'react';
import { isBusinessDataValid } from '../../../../features/client/businesses/business-onboarding-step';
import { useFocusManager } from '../../../../shared/hooks';
import { registerSchema } from '../../schemas/register/register-schema';
import { useAuthStore } from '../../stores/auth-store';

export const useRegistration = ({ onComplete }) => {
  const { signUp, isLoading, clearError } = useAuthStore();
  const { createFieldProps, clearFocus } = useFocusManager();

  // Clear any existing auth errors when opening the registration form
  useEffect(() => {
    clearError();
  }, [clearError]);

  // ScrollView ref for keyboard handling
  const scrollViewRef = useRef(null);

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUserType, setSelectedUserType] = useState('client');
  const [businessData, setBusinessData] = useState({});
  const [clientPreferences, setClientPreferences] = useState({
    goals: [],
    categories: [],
    subcategories: [],
  });
  const [forceUpdate, setForceUpdate] = useState(0);

  // Calculate total steps based on user type
  // Business: 1. Basic Info -> 2. User Type -> 3. Business Info -> 4. Confirmation
  // Client: 1. Basic Info -> 2. User Type -> 3. Preferences -> 4. Confirmation
  // Driver: 1. Basic Info -> 2. User Type -> 3. Confirmation
  const totalSteps = selectedUserType === 'business' ? 4 : selectedUserType === 'client' ? 4 : 3;

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
      // Include selected user type, business data or client preferences in registration
      const registrationData = {
        ...value,
        selectedUserType,
        ...(selectedUserType === 'business' && { businessData }),
        ...(selectedUserType === 'client' && { preferences: clientPreferences })
      };

      const result = await signUp(registrationData);

      // Check if sign up was successful
      if (result && !result.error) {
        // Success - call onComplete callback
        onComplete?.();
        return;
      }

      // Duplicate email (409): the message is generic elsewhere on the confirmation
      // step, but the user can't see the email field from there, so point at it
      // directly and jump back to where it can be fixed.
      if (result?.status === 409) {
        form.setFieldMeta('email', (prev) => ({
          ...prev,
          errorMap: { ...prev.errorMap, onServer: 'Este correo ya está registrado' },
          errorSourceMap: { ...prev.errorSourceMap, onServer: 'field' },
        }));
        setCurrentStep(1);
      }
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

    // Check if passwords match (ignoring any accidental trailing spaces)
    const passwordsMatch = basicFields.password?.trim() === basicFields.confirmPassword?.trim();

    // Basic email validation
    const emailValid = basicFields.email?.includes('@') && basicFields.email?.includes('.');

    // Phone validation
    const phoneValid = /^04(12|14|16|24|26)\d{7}$/.test(basicFields.phone || '');

    const valid = hasAllValues && passwordsMatch && emailValid && phoneValid;

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
        return valid;
      case 2:
        // User type selection step - ensure user type is selected
        return selectedUserType !== null;
      case 3:
        // For business users: business info must be valid
        // For client users: must select at least 2 goals, 3 categories, 2 tags
        // For driver: confirmation (always valid)
        if (selectedUserType === 'business') {
          return isBusinessDataValid(businessData);
        }
        if (selectedUserType === 'client') {
          const goalsValid = (clientPreferences.goals?.length || 0) >= 2;
          const categoriesValid = (clientPreferences.categories?.length || 0) >= 3;
          const tagsValid = (clientPreferences.subcategories?.length || 0) >= 2;
          return goalsValid && categoriesValid && tagsValid;
        }
        return true;
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

    // User Type
    selectedUserType,
    setSelectedUserType,

    // Business Data
    businessData,
    setBusinessData,

    // Client Preferences
    clientPreferences,
    setClientPreferences,

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