import { create } from 'zustand';
import { getAddressBehavior } from './mode-config';

/**
 * Mode-aware address management store
 */
export const useAddressStore = create((set, get) => ({
  // UI State only
  currentAddress: null,

  // Actions
  setCurrentAddress: (address) => set({ currentAddress: address }),

  // Mode-aware methods (take addresses as parameter from TanStack Query)
  getAddressesForMode: (addresses, mode) => {
    if (!addresses) return [];

    return addresses.filter(address =>
      address.type === mode || address.type === 'universal'
    );
  },

  getCurrentAddressForMode: (addresses, mode) => {
    const { currentAddress } = get();

    // If current address is compatible with mode, return it
    if (currentAddress &&
        (currentAddress.type === mode || currentAddress.type === 'universal')) {
      return currentAddress;
    }

    // Otherwise, get default address for this mode
    const modeAddresses = get().getAddressesForMode(addresses, mode);
    return modeAddresses.find(addr => addr.isDefault) || modeAddresses[0] || null;
  },

  selectAddress: (address, mode) => {
    set({ currentAddress: address });

    // Mode-specific behavior when address is selected
    if (mode === 'client') {
      console.log('Client address selected:', address.label);
    } else if (mode === 'business') {
      console.log('Business location selected:', address.label);
    } else if (mode === 'delivery') {
      console.log('Delivery zone selected:', address.label);
    }
  },

  // Helper methods
  hasAddressesForMode: (addresses, mode) => {
    if (!addresses) return false;
    return get().getAddressesForMode(addresses, mode).length > 0;
  },

  getAddressDisplayInfo: (address, mode) => {
    const behavior = getAddressBehavior(mode);

    return {
      name: address.name,
      subtitle: address.street,
      icon: behavior.icon,
      description: behavior.description
    };
  }
}));