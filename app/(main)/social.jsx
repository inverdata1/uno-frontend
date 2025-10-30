import { useCurrentUserType } from '../../shared/hooks/use-user-type';
import BusinessSocialScreen from '../../modules/business/social';
import FeedScreen from '../../modules/social/feed';

export default function SocialContentScreen() {
  const { currentUserType } = useCurrentUserType();

  // For business mode, show content management (posts, stories)
  if (currentUserType === 'business') {
    return <BusinessSocialScreen />;
  }

  // For client mode, show social feed
  return <FeedScreen />;
}
