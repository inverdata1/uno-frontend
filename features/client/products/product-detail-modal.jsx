import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import { useProduct } from '../../shared/products/hooks/use-products';
import ProductDetail from './product-detail';
import VideoViewer from '../social/videos/video-viewer';

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
  const [videoViewerVisible, setVideoViewerVisible] = useState(false);
  const [videoViewerVideos, setVideoViewerVideos] = useState([]);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

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

  const handleVideoPress = (video, allVideos) => {
    // Find the index of the selected video
    const videoIndex = allVideos.findIndex(v => v.id === video.id);
    // Set up video viewer
    setVideoViewerVideos(allVideos);
    setSelectedVideoIndex(videoIndex >= 0 ? videoIndex : 0);
    setVideoViewerVisible(true);
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
        <>
          <ProductDetail
            product={product}
            onClose={onClose}
            onBusinessPress={handleBusinessPress}
            onVideoPress={handleVideoPress}
          />

          {/* Video Viewer Modal */}
          <VideoViewer
            visible={videoViewerVisible}
            videos={videoViewerVideos}
            initialIndex={selectedVideoIndex}
            onClose={() => setVideoViewerVisible(false)}
            onProductPress={(product) => {
              // Product is already showing, just close video viewer
              setVideoViewerVisible(false);
            }}
            onBusinessPress={(businessId) => {
              setVideoViewerVisible(false);
              handleBusinessPress(businessId);
            }}
          />
        </>
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
