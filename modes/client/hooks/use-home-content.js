import { useCurrentMode, useBusinessContexts } from '../../../shared/hooks/use-user-modes';
import { useAuthStore } from '../../../auth/stores/auth-store';

/**
 * Hook for managing home screen content and logic
 */
export const useHomeContent = () => {
  const { user } = useAuthStore();
  const { currentMode } = useCurrentMode();
  const businessContexts = useBusinessContexts();
  const currentBusiness = businessContexts.find(b => b.isActive) || businessContexts[0] || null;

  const getModeGreeting = () => {
    const greetings = {
      client: '¿Qué necesitas hoy?',
      business: '¡Bienvenido! Gestiona tu negocio',
      delivery: '¡Listo para entregar!'
    };
    return greetings[currentMode] || '¡Bienvenido!';
  };

  const handleModeSwitch = (context) => {
    console.log('Mode switched to:', context);
    // Additional logic for handling mode switches can go here
  };

  return {
    user,
    currentMode,
    currentBusiness,
    greeting: getModeGreeting(),
    onModeSwitch: handleModeSwitch
  };
};