import React from 'react';
import { Platform, ScrollView, View, useWindowDimensions } from 'react-native';

/**
 * WebAuthLayout - Responsive wrapper for auth screens
 * On web desktop: centers content in a card with max width
 * On web mobile & native: passes through children unchanged
 */
export const WebAuthLayout = ({ children, scrollable = true }) => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  if (!isDesktop) {
    return <>{children}</>;
  }

  if (scrollable) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: '#f1f5f9' }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 40,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            padding: 40,
            width: '100%',
            maxWidth: 480,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 32,
            elevation: 8,
          }}
        >
          {children}
        </View>
      </ScrollView>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 24,
          padding: 40,
          width: '100%',
          maxWidth: 480,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 32,
          elevation: 8,
        }}
      >
        {children}
      </View>
    </View>
  );
};

