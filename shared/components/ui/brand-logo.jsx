import { Image } from 'react-native';

const LOGOS = {
  red: require('../../../assets/uno-ai-logo.png'),
  white: require('../../../assets/uno-ai-logo-white.png'),
};

// Width / height of the cropped logo artwork
const ASPECT_RATIO = 978 / 258;

/**
 * UNO AI wordmark. Use `white` on the red brand header and `red` on light screens.
 */
export function BrandLogo({ variant = 'red', height = 28, style }) {
  return (
    <Image
      source={LOGOS[variant] || LOGOS.red}
      style={[{ height, width: height * ASPECT_RATIO }, style]}
      resizeMode="contain"
      accessibilityLabel="UNO AI"
    />
  );
}

export default BrandLogo;
