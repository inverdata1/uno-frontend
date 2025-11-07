import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import { useProduct } from '../../shared/products/hooks/use-products';
import ProductDetail from './product-detail';

/**
 * Reusable Product Detail Modal
 *
 * Implements Instagram/TikTok pattern:
 * - Products always open as modals (quick view)
 * - Business profiles always navigate (full context)
 * - Prevents modal stacking by closing before navigation
 *
 * @param {boolean} visible - Modal visibility
 * @param {string} productId - Product ID to display
 * @param {string} currentBusinessId - Current business ID (if on business profile)
 * @param {function} onClose - Close handler
 */
export default function ProductDetailModal({
  visible,
  productId,
  currentBusinessId = null,
  onClose
}) {
  const router = useRouter();
  const { data: product, isLoading } = useProduct(productId);
  const pendingNavigationRef = useRef(null);

  // When modal closes, check if there's pending navigation
  useEffect(() => {
    if (!visible && pendingNavigationRef.current) {
      const targetBusinessId = pendingNavigationRef.current;
      pendingNavigationRef.current = null;

      // Wait for modal animation to complete before navigating
      // Modal slide animation typically takes 300-400ms
      const timeoutId = setTimeout(() => {
        // Use replace instead of push to avoid stacking in navigation history
        // This way: Product Modal → Business A → Product Modal → Business B
        // doesn't create a huge stack, it just replaces the current business
        router.replace(`/client/business/${targetBusinessId}`);
      }, 400);

      return () => clearTimeout(timeoutId);
    }
  }, [visible, router]);

  const handleBusinessPress = (businessId) => {
    // If we're already on this business's profile, just close the modal
    if (businessId === currentBusinessId) {
      onClose();
      return;
    }

    // Store the business ID for navigation after modal closes
    pendingNavigationRef.current = businessId;

    // Close the modal - navigation will happen in useEffect
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      {isLoading ? (
        <SafeAreaView className="flex-1 bg-white items-center justify-center">
          <ActivityIndicator size="large" color="#ef4444" />
          <Text className="text-gray-500 text-sm mt-4">Cargando producto...</Text>
        </SafeAreaView>
      ) : product ? (
        <ProductDetail
          product={product}
          onClose={onClose}
          onBusinessPress={handleBusinessPress}
        />
      ) : (
        <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
          <Text className="text-gray-900 text-lg font-semibold mb-2">
            Producto no encontrado
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="mt-4 px-6 py-3 bg-red-500 rounded-xl"
          >
            <Text className="text-white font-semibold">Cerrar</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </Modal>
  );
}
