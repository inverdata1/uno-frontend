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
        // Use our theme colors
        primary: theme.colors.primary,
        success: theme.colors.success,
        warning: theme.colors.warning,
        danger: theme.colors.danger,

        // Semantic color mapping
        'text-primary': theme.colors.text.primary,
        'text-secondary': theme.colors.text.secondary,
        'text-tertiary': theme.colors.text.tertiary,
        'text-inverse': theme.colors.text.inverse,

        'bg-primary': theme.colors.bg.primary,
        'bg-secondary': theme.colors.bg.secondary,
        'bg-tertiary': theme.colors.bg.tertiary,

        'border-light': theme.colors.border.light,
        'border-medium': theme.colors.border.medium,
        'border-dark': theme.colors.border.dark,
      },
      spacing: theme.spacing,
      fontSize: theme.fontSize,
      borderRadius: theme.borderRadius,
    },
  },
  plugins: [],
}