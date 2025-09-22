import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Global app state store
export const useAppStore = create(
  persist(
    (set, get) => ({
      // UI State
      isOnboardingCompleted: false,
      theme: 'light',

      // User preferences
      language: 'es',
      currency: 'USD',
      notifications: {
        push: true,
        email: true,
        orders: true,
        promotions: false,
      },

      // App state
      isLoading: false,
      error: null,

      // Actions
      setOnboardingCompleted: (completed) =>
        set({ isOnboardingCompleted: completed }),

      setTheme: (theme) =>
        set({ theme }),

      setLanguage: (language) =>
        set({ language }),

      setNotificationPreference: (key, value) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: value,
          },
        })),

      setLoading: (isLoading) =>
        set({ isLoading }),

      setError: (error) =>
        set({ error }),

      clearError: () =>
        set({ error: null }),

      // Reset store
      reset: () =>
        set({
          isOnboardingCompleted: false,
          theme: 'light',
          language: 'es',
          currency: 'USD',
          notifications: {
            push: true,
            email: true,
            orders: true,
            promotions: false,
          },
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'uno-delivery-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain parts of the state
      partialize: (state) => ({
        isOnboardingCompleted: state.isOnboardingCompleted,
        theme: state.theme,
        language: state.language,
        currency: state.currency,
        notifications: state.notifications,
      }),
    }
  )
);