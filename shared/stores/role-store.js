import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple role store for MVP - starts with client/business only
export const useRoleStore = create(
  persist(
    (set, get) => ({
      // Start with just these two roles for MVP
      activeRole: 'client', // 'client' | 'business'
      availableRoles: ['client'], // User's available roles

      // Simple role switching
      switchRole: (role) => {
        const { availableRoles } = get();
        if (availableRoles.includes(role)) {
          set({ activeRole: role });
        }
      },

      // Add business role when user creates business
      addBusinessRole: () => {
        const { availableRoles } = get();
        if (!availableRoles.includes('business')) {
          set({ availableRoles: [...availableRoles, 'business'] });
        }
      },

      // Check if user has role
      hasRole: (role) => {
        const { availableRoles } = get();
        return availableRoles.includes(role);
      },

      // Initialize roles from user data
      initializeRoles: (userRoles) => {
        if (userRoles && Array.isArray(userRoles)) {
          set({
            availableRoles: userRoles,
            // Keep current active role if valid, otherwise default to client
            activeRole: userRoles.includes(get().activeRole) ? get().activeRole : 'client'
          });
        }
      },

      // Reset role store (for logout)
      reset: () => {
        set({
          activeRole: 'client',
          availableRoles: ['client']
        });
      }
    }),
    {
      name: 'uno-role-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);