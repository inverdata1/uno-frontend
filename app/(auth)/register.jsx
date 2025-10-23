import React from 'react';
import { View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../shared/components/ui';
import { RegistrationForm } from '../../core/auth/components/register/registration-form';

export default function RegisterScreen() {
  const router = useRouter();

  const handleRegistrationComplete = () => {
    // Navigate to main app after successful registration
    router.replace('/(main)');
  };

  return (
    <SafeAreaView className="flex-1 bg-card" edges={['top', 'bottom']}>
      <RegistrationForm onComplete={handleRegistrationComplete} />
    </SafeAreaView>
  );
}