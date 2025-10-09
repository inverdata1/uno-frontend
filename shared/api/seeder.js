import { seedAddressTypes, checkAddressTypesExist } from './address-types/seeder';
import { seedVenezuelanStates, checkVenezuelanStatesExist } from './venezuelan-states/seeder';
import { seedUserTypesOnly } from './user-types/seeder';

/**
 * Main Data Seeder
 * Manages seeding of all lookup collections
 */

/**
 * Seed all lookup collections
 */
export const seedAllLookupData = async () => {
  console.log('🚀 Starting data seeding process...');

  try {
    await seedUserTypesOnly();
    await seedAddressTypes();
    await seedVenezuelanStates();
    console.log('🎉 All lookup data seeded successfully!');
  } catch (error) {
    console.error('❌ Data seeding failed:', error);
    throw error;
  }
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