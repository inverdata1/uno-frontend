import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import { z } from 'zod';
import { useAuthStore } from '../../stores/auth-store';
import { useFocusManager } from '../../../shared/hooks';
import { loginSchema } from '../../schemas/login/login-schema';

/**
 * Hook for managing login form logic
 */
export const useLogin = () => {
  const router = useRouter();
  const { signIn, isSubmitting, error, clearError } = useAuthStore();
  const { createFieldProps, clearFocus } = useFocusManager();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      console.log('📝 Login form submitted');
      const result = await signIn(value);
      console.log('📝 Login result:', { hasError: !!result?.error });

      // Check if sign in was successful
      if (result && !result.error) {
        // Success - navigate to main app
        console.log('📝 Login successful, navigating to main');
        router.replace('/(main)');
      } else {
        console.log('📝 Login failed, staying on login screen');
      }
      // If there's an error, it's already in the store state and will be displayed
      // No navigation happens, user stays on login screen with error message
    },
  });

  return {
    form,
    isSubmitting,
    error,
    clearError,
    createFieldProps,
    clearFocus,
  };
};