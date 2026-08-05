import { useState } from 'react';
import { Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FavoritesScreen from '../../features/client/social/favorites';
import ProductDetail from '../../features/client/products/product-detail';
import PostViewer from '../../features/shared/social/posts/post-viewer';

/**
 * Client - Favorites
 * Route: /client/favorites
 */
export default function ClientFavoritesScreen() {
  const router = useRouter();
  const [postViewerVisible, setPostViewerVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [productDetailVisible, setProductDetailVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleBusinessPress = (businessId) => {
    setPostViewerVisible(false);
    setProductDetailVisible(false);
    if (businessId) {
      router.push(`/client/business/${businessId}`);
    }
  };

  return (
    <>
      <FavoritesScreen
        onPostPress={(post) => {
          setSelectedPost(post);
          setPostViewerVisible(true);
        }}
        onProductPress={(product) => {
          setSelectedProduct(product);
          setProductDetailVisible(true);
        }}
      />

      {selectedPost && (
        <PostViewer
          visible={postViewerVisible}
          post={selectedPost}
          businessData={selectedPost.business}
          onClose={() => {
            setPostViewerVisible(false);
            setSelectedPost(null);
          }}
          onBusinessPress={handleBusinessPress}
          onProductPress={(product) => {
            setPostViewerVisible(false);
            setSelectedProduct(product);
            setProductDetailVisible(true);
          }}
        />
      )}

      <Modal
        visible={productDetailVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setProductDetailVisible(false)}
      >
        <SafeAreaProvider>
          {selectedProduct && (
            <ProductDetail
              product={selectedProduct}
              onClose={() => setProductDetailVisible(false)}
              onBusinessPress={handleBusinessPress}
            />
          )}
        </SafeAreaProvider>
      </Modal>
    </>
  );
}
