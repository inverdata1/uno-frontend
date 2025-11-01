import { useLocalSearchParams } from 'expo-router';
import { BusinessProfileViewer } from '../../../features/client/businesses/business-profile-viewer';

/**
 * Client - Business Profile Viewer
 * Route: /client/business/[id]
 */
export default function ClientBusinessProfileScreen() {
  const { id } = useLocalSearchParams();

  return <BusinessProfileViewer businessId={id} />;
}
