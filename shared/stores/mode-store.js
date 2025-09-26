import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Mode store for user mode management
 * Handles user modes (client, business, delivery) and business contexts
 */
export const useModeStore = create(
  persist(
    (set, get) => ({
      // Current mode state
      currentMode: 'client', // 'client' | 'business' | 'delivery'
      availableModes: ['client'], // User's available modes
      businessContexts: [], // Available business contexts
      currentContext: {
        businessId: null,
        branchId: null
      },

      // Mode switching
      switchMode: (mode, context = {}) => {
        const { availableModes } = get();
        if (availableModes.includes(mode)) {
          set({
            currentMode: mode,
            currentContext: {
              businessId: context.businessId || null,
              branchId: context.branchId || null
            }
          });
        }
      },

      // Update available modes from user data
      updateAvailableModes: (modes) => {
        if (modes && Array.isArray(modes)) {
          const { currentMode } = get();
          set({
            availableModes: modes,
            // Keep current mode if valid, otherwise default to client
            currentMode: modes.includes(currentMode) ? currentMode : 'client'
          });
        }
      },

      // Update business contexts
      updateBusinessContexts: (contexts) => {
        if (contexts && Array.isArray(contexts)) {
          set({ businessContexts: contexts });
        }
      },

      // Initialize from user modes data
      initializeFromUserModes: (userModesData) => {
        if (!userModesData) return;

        set({
          currentMode: userModesData.currentMode || 'client',
          availableModes: userModesData.availableModes || ['client'],
          businessContexts: userModesData.businessContexts || [],
          currentContext: userModesData.currentContext || { businessId: null, branchId: null }
        });
      },

      // Check if user has specific mode
      hasMode: (mode) => {
        const { availableModes } = get();
        return availableModes.includes(mode);
      },

      // Get current business context
      getCurrentBusiness: () => {
        const { businessContexts, currentContext } = get();
        return businessContexts.find(biz => biz.businessId === currentContext.businessId);
      },

      // Get current branch context
      getCurrentBranch: () => {
        const business = get().getCurrentBusiness();
        const { currentContext } = get();
        return business?.branches.find(branch => branch.id === currentContext.branchId);
      },

      // Reset store (for logout)
      reset: () => {
        set({
          currentMode: 'client',
          availableModes: ['client'],
          businessContexts: [],
          currentContext: { businessId: null, branchId: null }
        });
      }
    }),
    {
      name: 'uno-mode-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);