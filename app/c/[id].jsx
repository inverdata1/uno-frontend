import { useLocalSearchParams } from 'expo-router';
import { PublicCatalog } from '../../features/public/catalog';

/**
 * Public business profile + catalog, shared as a link.
 * Route: /c/[id] — open without signing in.
 */
export default function PublicCatalogScreen() {
  const { id } = useLocalSearchParams();

  return <PublicCatalog businessId={id} />;
}
