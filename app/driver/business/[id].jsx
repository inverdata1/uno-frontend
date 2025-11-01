import { useLocalSearchParams } from 'expo-router';
import { BusinessProfileViewer } from '../../../features/client/businesses/business-profile-viewer';

/**
 * Driver - Business Profile Viewer
 * Route: /driver/business/[id]
 * Used for viewing business details for delivery purposes
 */
export default function DriverBusinessProfileScreen() {
  const { id } = useLocalSearchParams();

  return <BusinessProfileViewer businessId={id} />;
}
