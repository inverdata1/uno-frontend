import { seedAddressTypes, checkAddressTypesExist } from './address-types/seeder';
import { seedVenezuelanStates, checkVenezuelanStatesExist } from './venezuelan-states/seeder';
import { seedCategories } from './categories/seeder';
import { seedProducts } from './products/seeder';
import { seedPosts } from './posts/seeder';
import { seedStories } from './stories/seeder';

/**
 * Main Data Seeder
 * Manages seeding of all lookup and demo collections
 *
 * NOTE: User types configuration is hardcoded in shared/config/user-types.js
 * No need to seed user types to the database.
 */

/**
 * Seed all lookup collections (required for app to function)
 */
export const seedAllLookupData = async () => {
  console.log('🚀 Starting lookup data seeding...');

  try {
    await seedAddressTypes();
    await seedVenezuelanStates();
    await seedCategories();
    console.log('🎉 All lookup data seeded successfully!');
  } catch (error) {
    console.error('❌ Lookup data seeding failed:', error);
    throw error;
  }
};

/**
 * Seed demo/sample data (optional, for testing)
 */
export const seedDemoData = async () => {
  console.log('🚀 Starting demo data seeding...');

  try {
    await seedProducts();
    await seedPosts();
    await seedStories();
    console.log('🎉 All demo data seeded successfully!');
  } catch (error) {
    console.error('❌ Demo data seeding failed:', error);
    throw error;
  }
};

/**
 * Seed everything (lookup + demo data)
 */
export const seedAll = async () => {
  await seedAllLookupData();
  await seedDemoData();
};

/**
 * Check if all lookup data exists
 */
export const checkAllLookupData = async () => {
  try {
    console.log('🔍 Checking lookup data...');

    const [addressTypesStatus, statesStatus] = await Promise.all([
      checkAddressTypesExist(),
      checkVenezuelanStatesExist()
    ]);

    console.log(`  📊 Address types: ${addressTypesStatus.count}/${addressTypesStatus.expected} found`);
    console.log(`  📊 Venezuelan states: ${statesStatus.count}/${statesStatus.expected} found`);

    return {
      addressTypes: addressTypesStatus,
      states: statesStatus,
      hasAllData: addressTypesStatus.exists && statesStatus.exists,
      isComplete: addressTypesStatus.count === addressTypesStatus.expected &&
                  statesStatus.count === statesStatus.expected
    };
  } catch (error) {
    console.error('❌ Error checking lookup data:', error);
    return {
      addressTypes: { exists: false, count: 0, expected: 0 },
      states: { exists: false, count: 0, expected: 0 },
      hasAllData: false,
      isComplete: false,
      error: error.message
    };
  }
};

/**
 * Initialize lookup data if missing
 */
export const initializeLookupData = async () => {
  const status = await checkAllLookupData();

  if (status.isComplete) {
    console.log('✅ All lookup data already exists and is complete');
    return status;
  }

  if (status.hasAllData && !status.isComplete) {
    console.log('⚠️  Lookup data exists but incomplete, seeding missing items...');
  } else {
    console.log('⚠️  Missing lookup data, seeding...');
  }

  await seedAllLookupData();
  return await checkAllLookupData();
};