const { theme } = require('./shared/config/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./shared/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Clean semantic colors (no redundant background token)
        foreground: theme.colors.text.primary,      // Primary text

        card: theme.colors.bg.primary,              // Card background
        'card-foreground': theme.colors.text.primary, // Card text

        primary: theme.colors.primary,              // Primary brand colors
        'primary-foreground': theme.colors.text.inverse, // Text on primary

        secondary: theme.colors.bg.secondary,       // Secondary background
        'secondary-foreground': theme.colors.text.primary, // Secondary text

        muted: theme.colors.bg.tertiary,            // Muted background
        'muted-foreground': theme.colors.text.secondary, // Muted text

        destructive: theme.colors.danger,           // Destructive/danger colors
        'destructive-foreground': theme.colors.text.inverse, // Text on destructive

        border: theme.colors.border.light,          // Default borders
        input: theme.colors.border.medium,          // Input borders
        ring: theme.colors.primary[500],            // Focus rings

        success: theme.colors.success,              // Success colors
        warning: theme.colors.warning,              // Warning colors
      },
      spacing: theme.spacing,
      fontSize: theme.fontSize,
      borderRadius: theme.borderRadius,
    },
  },
  plugins: [],
}