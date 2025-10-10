/**
 * Address Helper Functions
 * Utilities for filtering and managing addresses by user type
 */

/**
 * Get addresses for a specific user type
 */
export const getAddressesForMode = (addresses, userType) => {
  if (!addresses || !Array.isArray(addresses)) return [];
  return addresses.filter(addr => addr.type === userType);
};

/**
 * Get current/default address for a user type
 */
export const getCurrentAddressForMode = (addresses, userType) => {
  const modeAddresses = getAddressesForMode(addresses, userType);
  return modeAddresses.find(addr => addr.isDefault) || modeAddresses[0] || null;
};

/**
 * Check if user has addresses for a specific user type
 */
export const hasAddressesForMode = (addresses, userType) => {
  return getAddressesForMode(addresses, userType).length > 0;
};

/**
 * Select/set default address for a user type
 * This should trigger an API call to update the default address
 */
export const selectAddress = (address, userType) => {
  // This is just a placeholder - actual selection should be handled
  // by the setDefaultAddress mutation in the component
  console.log('Selecting address:', address.id, 'for user type:', userType);
  return address;
};
