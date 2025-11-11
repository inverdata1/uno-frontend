import { theme } from '../config/theme';

// Utility to get mode-specific colors
export const getModeColors = (mode) => {
  const modeColors = theme.colors.modes[mode] || theme.colors.modes.client;

  return {
    primary: modeColors.primary,
    secondary: modeColors.secondary,
    light: modeColors.light,
    background: modeColors.background,
    gradient: [modeColors.primary, modeColors.secondary],
  };
};

// Colors utility should only handle colors, not full mode config

// Direct color exports from theme
export const colors = {
  // Primary brand colors
  primary: theme.colors.primary,

  // Semantic colors
  success: theme.colors.success,
  warning: theme.colors.warning,
  danger: theme.colors.danger,

  // Text colors
  text: theme.colors.text,

  // Background colors
  bg: theme.colors.bg,

  // Border colors
  border: theme.colors.border,

  // Mode colors
  modes: theme.colors.modes,
};

export default colors;