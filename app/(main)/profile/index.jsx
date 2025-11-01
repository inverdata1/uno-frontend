import BusinessProfileScreen from '../../../features/business/profile';
import ClientProfileScreen from '../../../features/client/profile';
import { useCurrentUserType } from '../../../shared/hooks/use-user-type';

/**
 * Profile Screen Route
 * Conditionally renders Business or Client profile based on current user type
 */
export default function ProfileScreen() {
  const { currentUserType } = useCurrentUserType();

  // Show business profile when in business mode
  if (currentUserType === 'business') {
    return <BusinessProfileScreen />;
  }

  // Show client profile by default
  return <ClientProfileScreen />;
}
