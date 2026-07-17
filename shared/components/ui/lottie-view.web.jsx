import React from 'react';
import { View, Text } from 'react-native';

export const LottieView = React.forwardRef(({ style }, ref) => {
  // Return a mock object with play/pause methods so refs don't crash
  React.useImperativeHandle(ref, () => ({
    play: () => {},
    pause: () => {},
    reset: () => {},
  }));

  return (
    <View style={[style, { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', borderRadius: 16 }]}>
      <Text style={{ color: '#9ca3af', fontSize: 12 }}>Animación Lottie</Text>
      <Text style={{ color: '#9ca3af', fontSize: 10 }}>(Sólo App Nativa)</Text>
    </View>
  );
});
