import { firebaseClient } from '../index';

/**
 * Venezuelan States Seeder
 * Populates the venezuelan_states collection with all Venezuelan states
 */

export const VENEZUELAN_STATES_DATA = [
  { id: 'AMA', name: 'Amazonas', code: 'AMA' },
  { id: 'ANZ', name: 'Anzoátegui', code: 'ANZ' },
  { id: 'APU', name: 'Apure', code: 'APU' },
  { id: 'ARA', name: 'Aragua', code: 'ARA' },
  { id: 'BAR', name: 'Barinas', code: 'BAR' },
  { id: 'BOL', name: 'Bolívar', code: 'BOL' },
  { id: 'CAR', name: 'Carabobo', code: 'CAR' },
  { id: 'COJ', name: 'Cojedes', code: 'COJ' },
  { id: 'DAM', name: 'Delta Amacuro', code: 'DAM' },
  { id: 'DC', name: 'Distrito Capital', code: 'DC' },
  { id: 'FAL', name: 'Falcón', code: 'FAL' },
  { id: 'GUA', name: 'Guárico', code: 'GUA' },
  { id: 'LAR', name: 'Lara', code: 'LAR' },
  { id: 'MER', name: 'Mérida', code: 'MER' },
  { id: 'MIR', name: 'Miranda', code: 'MIR' },
  { id: 'MON', name: 'Monagas', code: 'MON' },
  { id: 'NE', name: 'Nueva Esparta', code: 'NE' },
  { id: 'POR', name: 'Portuguesa', code: 'POR' },
  { id: 'SUC', name: 'Sucre', code: 'SUC' },
  { id: 'TAC', name: 'Táchira', code: 'TAC' },
  { id: 'TRU', name: 'Trujillo', code: 'TRU' },
  { id: 'VAR', name: 'Vargas', code: 'VAR' },
  { id: 'YAR', name: 'Yaracuy', code: 'YAR' },
  { id: 'ZUL', name: 'Zulia', code: 'ZUL' }
];

/**
 * Seed Venezuelan states collection
 */
export const seedVenezuelanStates = async () => {
  console.log('🌱 Seeding Venezuelan states...');

  try {
    const promises = VENEZUELAN_STATES_DATA.map(async (stateData) => {
      try {
        // Check if it already exists by trying to get it
        try {
          await firebaseClient.request('GET', `/venezuelan-states/id`, null, { id: stateData.id });
          console.log(`  ✓ State ${stateData.id} already exists`);
          return;
        } catch (error) {
          // If not found, we'll create it
        }

        // Create new state
        await firebaseClient.request('POST', '/venezuelan-states', stateData, { id: stateData.id });
        console.log(`  ✅ Created state: ${stateData.name}`);
      } catch (error) {
        console.error(`  ❌ Failed to create state ${stateData.id}:`, error.message);
      }
    });

    await Promise.all(promises);
    console.log('🎉 Venezuelan states seeding completed!');
  } catch (error) {
    console.error('❌ Venezuelan states seeding failed:', error);
    throw error;
  }
};

/**
 * Check if Venezuelan states exist
 */
export const checkVenezuelanStatesExist = async () => {
  try {
    const states = await firebaseClient.request('GET', '/venezuelan-states');
    return {
      exists: states.length > 0,
      count: states.length,
      expected: VENEZUELAN_STATES_DATA.length
    };
  } catch (error) {
    console.error('❌ Error checking Venezuelan states:', error);
    return {
      exists: false,
      count: 0,
      expected: VENEZUELAN_STATES_DATA.length,
      error: error.message
    };
  }
};