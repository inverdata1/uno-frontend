import { useState } from 'react';

/**
 * Custom hook for managing focus state across multiple inputs in a form.
 * Ensures only one input appears focused at a time, fixing React Native TextInput blur issues.
 *
 * Usage:
 * const { createFieldProps, clearFocus } = useFocusManager();
 *
 * <Input {...createFieldProps('email')} />
 * <Input {...createFieldProps('password')} />
 *
 * // To clear all focus (e.g., when tapping outside)
 * <TouchableWithoutFeedback onPress={clearFocus}>
 */
export const useFocusManager = () => {
  const [focusedField, setFocusedField] = useState(null);

  /**
   * Creates the necessary props for an input field to participate in focus management
   * @param {string} fieldName - Unique identifier for this field
   * @param {object} options - Additional options
   * @param {function} options.onBlur - Original onBlur handler to merge with focus management
   * @param {function} options.onFocus - Original onFocus handler to merge with focus management
   * @returns {object} Props to spread onto the Input component
   */
  const createFieldProps = (fieldName, options = {}) => ({
    onFocus: (e) => {
      setFocusedField(fieldName);
      // Call the original onFocus if provided
      if (options.onFocus) options.onFocus(e);
    },
    onBlur: (e) => {
      setFocusedField(null);
      // Call the original onBlur if provided (e.g., form validation)
      if (options.onBlur) options.onBlur(e);
    },
    _isExternallyFocused: focusedField === fieldName,
  });

  /**
   * Clears focus from all fields (useful for tap-outside behavior)
   */
  const clearFocus = () => setFocusedField(null);

  /**
   * Returns the currently focused field name (useful for debugging or conditional logic)
   */
  const getCurrentlyFocused = () => focusedField;

  return {
    createFieldProps,
    clearFocus,
    getCurrentlyFocused,
    focusedField // Expose for advanced use cases
  };
};