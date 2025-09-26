import { useCurrentMode } from '../../auth/api/use-user-modes';
import { useModeStore } from '../../../shared/stores/mode-store';
import { useAuthStore } from '../../../shared/stores/auth-store';

/**
 * Hook for managing home screen content and logic
 */
export const useHomeContent = () => {
  const { user } = useAuthStore();
  const { currentMode } = useCurrentMode();
  const { getCurrentBusiness } = useModeStore();

  const currentBusiness = getCurrentBusiness();

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