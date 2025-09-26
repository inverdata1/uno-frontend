import { create } from 'zustand';
import { getAddressBehavior } from './mode-config';

/**
 * Mode-aware address management store
 */
export const useAddressStore = create((set, get) => ({
  // State
  addresses: [],
  currentAddress: null,
  isLoading: false,
  error: null,

  // Actions
  setAddresses: (addresses) => set({ addresses }),

  setCurrentAddress: (address) => set({ currentAddress: address }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // Mode-aware methods
  getAddressesForMode: (mode) => {
    const { addresses } = get();
    const behavior = getAddressBehavior(mode);

    return addresses.filter(address =>
      address.type === behavior.type || address.type === 'universal'
    );
  },

  getCurrentAddressForMode: (mode) => {
    const { currentAddress } = get();
    const behavior = getAddressBehavior(mode);

    // If current address is compatible with mode, return it
    if (currentAddress &&
        (currentAddress.type === behavior.type || currentAddress.type === 'universal')) {
      return currentAddress;
    }

    // Otherwise, get default address for this mode
    const modeAddresses = get().getAddressesForMode(mode);
    return modeAddresses.find(addr => addr.isDefault) || modeAddresses[0] || null;
  },

  selectAddress: (address, mode) => {
    set({ currentAddress: address });

    // Mode-specific behavior when address is selected
    const behavior = getAddressBehavior(mode);

    // Emit events or trigger mode-specific actions
    if (mode === 'client') {
      console.log('Client address selected:', address.name);
      // Could trigger delivery area validation, etc.
    } else if (mode === 'business') {
      console.log('Business location selected:', address.name);
      // Could update service radius, etc.
    } else if (mode === 'delivery') {
      console.log('Delivery zone selected:', address.name);
      // Could update availability status, etc.
    }
  },

  addAddress: (addressData, mode) => {
    const behavior = getAddressBehavior(mode);

    const newAddress = {
      id: Date.now().toString(), // TODO: Replace with proper ID generation
      ...addressData,
      type: behavior.type,
      createdAt: new Date(),
      isDefault: get().addresses.length === 0 // First address is default
    };

    set(state => ({
      addresses: [...state.addresses, newAddress],
      currentAddress: newAddress
    }));

    return newAddress;
  },

  updateAddress: (addressId, updates) => {
    set(state => ({
      addresses: state.addresses.map(addr =>
        addr.id === addressId ? { ...addr, ...updates } : addr
      ),
      currentAddress: state.currentAddress?.id === addressId
        ? { ...state.currentAddress, ...updates }
        : state.currentAddress
    }));
  },

  deleteAddress: (addressId) => {
    set(state => {
      const newAddresses = state.addresses.filter(addr => addr.id !== addressId);
      const newCurrentAddress = state.currentAddress?.id === addressId
        ? newAddresses[0] || null
        : state.currentAddress;

      return {
        addresses: newAddresses,
        currentAddress: newCurrentAddress
      };
    });
  },

  setDefaultAddress: (addressId, mode) => {
    const behavior = getAddressBehavior(mode);

    set(state => ({
      addresses: state.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId && addr.type === behavior.type
      }))
    }));
  },

  // Helper methods
  hasAddresses: () => get().addresses.length > 0,

  hasAddressesForMode: (mode) => get().getAddressesForMode(mode).length > 0,

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