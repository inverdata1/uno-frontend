export const COLLECTION_NAME = 'businesses';

/**
 * Business Collection Schema
 *
 * Fields:
 * - businessName: string (required) - Name of the business
 * - category: string (required) - Business category (restaurant, store, pharmacy, market, bakery, technology, other)
 * - description: string (optional) - Business description
 * - address: string (required) - Full address text
 * - coordinates: object (optional) - Location coordinates for maps
 *   - latitude: number
 *   - longitude: number
 * - phone: string (required) - Business phone number (11 digits)
 * - logoUrl: string (optional) - Logo image URL
 * - bannerUrl: string (optional) - Banner image URL
 * - ownerId: string (auto) - User ID of business owner
 * - isActive: boolean (auto) - Whether business is active
 * - isVerified: boolean (auto) - Whether business is verified
 * - followersCount: number (auto) - Number of followers
 * - rating: number (auto) - Average rating
 * - reviewsCount: number (auto) - Number of reviews
 * - createdAt: timestamp (auto)
 * - updatedAt: timestamp (auto)
 */
