// Theme configuration - UNO Delivery brand colors
export const theme = {
  colors: {
    // Primary brand colors - UNO Red
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',  // Main UNO red
      600: '#dc2626',  // Darker red for interactions
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },

    // Semantic colors with scales
    success: {
      500: '#10b981',
      600: '#059669',
      700: '#047857',
    },
    warning: {
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    danger: {
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },

    // Mode-specific colors
    modes: {
      client: {
        primary: '#ef4444',
        secondary: '#dc2626',
        light: '#fef2f2',
        background: '#ef444415', // 15% opacity
      },
      business: {
        primary: '#10b981',
        secondary: '#059669',
        light: '#f0fdf4',
        background: '#10b98115', // 15% opacity
      },
      delivery: {
        primary: '#f59e0b',
        secondary: '#d97706',
        light: '#fffbeb',
        background: '#f59e0b15', // 15% opacity
      },
    },

    // Text colors - UNO palette
    text: {
      primary: '#1a202c',    // Dark text (from PDF)
      secondary: '#4a5568',  // Medium gray text
      tertiary: '#a0aec0',   // Light gray text
      inverse: '#ffffff',    // White text
    },

    // Background colors - UNO palette
    bg: {
      primary: '#ffffff',    // White (from PDF)
      secondary: '#f7fafc',  // Very light gray (from PDF)
      tertiary: '#edf2f7',   // Subtle gray
      dark: '#1a202c',       // Dark mode
    },

    // Border colors - UNO palette
    border: {
      light: '#e2e8f0',      // Soft borders (from PDF)
      medium: '#cbd5e0',     // Medium borders
      dark: '#a0aec0',       // Dark borders
    }
  },

  spacing: {
    xs: 4,   // 4px
    sm: 8,   // 8px
    md: 16,  // 16px
    lg: 24,  // 24px
    xl: 32,  // 32px
    xxl: 48, // 48px
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  }
};