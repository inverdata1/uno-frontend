import { FirebaseClient } from './firebase-client';
import { UsersResource } from './users';
import { UserModesResource } from './user-modes';
import { BusinessesResource } from './businesses';
import { AddressesResource } from './addresses/resource';
import { AddressTypesResource } from './address-types/resource';
import { VenezuelanStatesResource } from './venezuelan-states/resource';
import { UserTypesResource } from './user-types/resource';
import { CategoriesResource } from './categories/resource';
import { ProductsResource } from './products/resource';
import { PostsResource } from './posts/resource';
import { StoriesResource } from './stories/resource';
import { FavoritesResource } from './favorites/resource';
import { FollowsResource } from './follows/resource';

/**
 * Initialize Firebase API system
 * Creates client instance and registers all resources
 */

// Create main Firebase client
const firebaseClient = new FirebaseClient();

// Register all resources
firebaseClient.registerResource('users', UsersResource);
firebaseClient.registerResource('user-modes', UserModesResource);
firebaseClient.registerResource('businesses', BusinessesResource);
firebaseClient.registerResource('addresses', AddressesResource);
firebaseClient.registerResource('address-types', AddressTypesResource);
firebaseClient.registerResource('venezuelan-states', VenezuelanStatesResource);
firebaseClient.registerResource('user-types', UserTypesResource);

// Social Commerce Resources
firebaseClient.registerResource('categories', CategoriesResource);
firebaseClient.registerResource('products', ProductsResource);
firebaseClient.registerResource('posts', PostsResource);
firebaseClient.registerResource('stories', StoriesResource);
firebaseClient.registerResource('favorites', FavoritesResource);
firebaseClient.registerResource('follows', FollowsResource);

// Log registered resources for debugging
console.log('🔥 Firebase API initialized with resources:', firebaseClient.listResources());

// Export configured client
export { firebaseClient };

// Export individual resources for direct access if needed
export {
  UsersResource,
  UserModesResource,
  BusinessesResource,
  AddressesResource,
  AddressTypesResource,
  VenezuelanStatesResource,
  UserTypesResource,
  CategoriesResource,
  ProductsResource,
  PostsResource,
  StoriesResource,
  FavoritesResource,
  FollowsResource
};

// Export base service for extending
export { BaseFirebaseService } from './base-firebase-service';