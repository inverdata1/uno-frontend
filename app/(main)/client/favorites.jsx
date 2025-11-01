import FavoritesScreen from '../../../features/client/social/favorites';

export default function FavoritesPage() {
  const handleVideoPress = (video) => {
    // TODO: Open video viewer
    console.log('Open video from favorites:', video.id);
  };

  const handleProductPress = (product) => {
    // TODO: Open product detail
    console.log('Open product from favorites:', product.id);
  };

  return (
    <FavoritesScreen onVideoPress={handleVideoPress} onProductPress={handleProductPress} />
  );
}
