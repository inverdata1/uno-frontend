import { useRouter } from 'expo-router';
import { useCurrentUserType } from './use-user-type';

/**
 * User-type-aware navigation hook
 * Automatically prefixes routes with current user type
 */
export function useUserTypeNavigation() {
  const router = useRouter();
  const { currentUserType } = useCurrentUserType();

  const navigate = {
    /**
     * Navigate to business profile
     * @param {string} businessId
     */
    toBusinessProfile: (businessId) => {
      router.push(`/${currentUserType}/business/${businessId}`);
    },

    /**
     * Navigate to product detail
     * @param {string} productId
     */
    toProductDetail: (productId) => {
      router.push(`/${currentUserType}/product/${productId}`);
    },

    /**
     * Navigate to post detail
     * @param {string} postId
     */
    toPostDetail: (postId) => {
      router.push(`/${currentUserType}/post/${postId}`);
    },

    /**
     * Navigate to any route with user type prefix
     * @param {string} path - Path without user type prefix (e.g., 'business/123')
     */
    push: (path) => {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      router.push(`/${currentUserType}/${cleanPath}`);
    },

    /**
     * Replace current route with user type prefix
     * @param {string} path - Path without user type prefix
     */
    replace: (path) => {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      router.replace(`/${currentUserType}/${cleanPath}`);
    },

    /**
     * Go back in navigation stack
     */
    back: () => {
      router.back();
    },
  };

  return navigate;
}
