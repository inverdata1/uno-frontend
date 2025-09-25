import { FirebaseClient } from './firebase-client';
import { UsersResource } from './resources/users';
import { UserModesResource } from './resources/user-modes';
import { BusinessesResource } from './resources/businesses';

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

// Log registered resources for debugging
console.log('🔥 Firebase API initialized with resources:', firebaseClient.listResources());

// Export configured client
export { firebaseClient };

// Export individual resources for direct access if needed
export { UsersResource, UserModesResource, BusinessesResource };

// Export base service for extending
export { BaseFirebaseService } from './base-firebase-service';