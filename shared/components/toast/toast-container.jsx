import React from 'react';
import { View, Animated, TouchableOpacity } from 'react-native';
import { Text } from '../ui';
import { useToastStore } from '../../services/toast-service';
import * as Haptics from 'expo-haptics';

const ToastItem = ({ toast, onRemove }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Haptic feedback
    if (toast.type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (toast.type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const handleRemove = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onRemove());
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500 border-green-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-blue-500 border-blue-600';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className="mb-2"
    >
      <TouchableOpacity
        onPress={handleRemove}
        className={`p-4 mx-4 rounded-lg border-2 shadow-lg ${getToastStyles()}`}
        activeOpacity={0.9}
      >
        <View className="flex-row items-center">
          <Text className="text-lg mr-3">{getIcon()}</Text>
          <View className="flex-1">
            <Text className="text-white font-semibold text-sm">
              {toast.title}
            </Text>
            <Text className="text-white/90 text-sm mt-1">
              {toast.message}
            </Text>
          </View>
          <Text className="text-white/70 text-xs ml-2">✕</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <View className="absolute top-16 left-0 right-0 z-50">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </View>
  );
};