import { ApiClient } from './api-client';
import { UsersResource } from './users/resource';
import { BusinessesResource } from './businesses/resource';
import { BranchesResource } from './branches/resource';
import { AddressesResource } from './addresses/resource';
import { AddressTypesResource } from './address-types/resource';
import { VenezuelanStatesResource } from './venezuelan-states/resource';
import { CategoriesResource } from './categories/resource';
import { ProductsResource } from './products/resource';
import { PostsResource } from './posts/resource';
import { StoriesResource } from './stories/resource';
import { FavoritesResource } from './favorites/resource';
import { FollowsResource } from './follows/resource';

/**
 * Initialize REST API system
 * Creates client instance and registers all resources
 */

// Create main API client
const apiClient = new ApiClient();

// Register all resources
apiClient.registerResource('users', UsersResource);
apiClient.registerResource('businesses', BusinessesResource);
apiClient.registerResource('branches', BranchesResource);
apiClient.registerResource('addresses', AddressesResource);
apiClient.registerResource('address-types', AddressTypesResource);
apiClient.registerResource('venezuelan-states', VenezuelanStatesResource);

// Social Commerce Resources
apiClient.registerResource('categories', CategoriesResource);
apiClient.registerResource('products', ProductsResource);
apiClient.registerResource('posts', PostsResource);
apiClient.registerResource('stories', StoriesResource);
apiClient.registerResource('favorites', FavoritesResource);
apiClient.registerResource('follows', FollowsResource);

// Log registered resources for debugging
console.log('🌐 REST API initialized with resources:', apiClient.listResources());

// Export configured client
export { apiClient as firebaseClient }; // Exported as firebaseClient to avoid breaking existing imports temporarily, though it's now an API client

// Export individual resources for direct access if needed
export {
  UsersResource,
  BusinessesResource,
  BranchesResource,
  AddressesResource,
  AddressTypesResource,
  VenezuelanStatesResource,
  CategoriesResource,
  ProductsResource,
  PostsResource,
  StoriesResource,
  FavoritesResource,
  FollowsResource
};

// Export base service for extending
export { BaseApiService as BaseFirebaseService } from './base-api-service';