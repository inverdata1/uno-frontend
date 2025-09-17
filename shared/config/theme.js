// Theme configuration - single source of truth
export const theme = {
  colors: {
    // Primary brand colors with full scale
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
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

    // Text colors
    text: {
      primary: '#111827',    // Dark text
      secondary: '#6b7280',  // Medium text
      tertiary: '#9ca3af',   // Light text
      inverse: '#ffffff',    // White text
    },

    // Background colors
    bg: {
      primary: '#ffffff',    // White
      secondary: '#f9fafb',  // Light gray
      tertiary: '#f3f4f6',   // Lighter gray
      dark: '#111827',       // Dark mode
    },

    // Border colors
    border: {
      light: '#e5e7eb',
      medium: '#d1d5db',
      dark: '#9ca3af',
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