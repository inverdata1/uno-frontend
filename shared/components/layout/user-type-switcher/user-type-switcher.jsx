import React, { useState } from 'react';
import { UserTypeSwitcherTrigger } from './user-type-switcher-trigger';

/**
 * Premium Mode Switcher Component
 * Elegant modal-based mode switching like Facebook/Google
 */
export const UserTypeSwitcher = ({ style, onUserTypeSwitch, onPress }) => {
  return (
    <UserTypeSwitcherTrigger
      style={style}
      onPress={onPress}
    />
  );
};