import React, { useState } from 'react';
import { ModeSwitcherTrigger } from './mode-switcher-trigger';

/**
 * Premium Mode Switcher Component
 * Elegant modal-based mode switching like Facebook/Google
 */
export const ModeSwitcher = ({ style, onModeSwitch, onPress }) => {
  return (
    <ModeSwitcherTrigger
      style={style}
      onPress={onPress}
    />
  );
};