import { firebaseClient } from '../index';
import { AddressTypesResource } from './resource';

/**
 * Address Types Seeder
 * Populates the address_types collection with initial data
 */

export const ADDRESS_TYPES_DATA = [
  {
    id: 'CLIENT_HOME',
    name: 'Casa',
    description: 'Dirección de casa del cliente',
    allowedForUserTypes: ['client']
  },
  {
    id: 'CLIENT_WORK',
    name: 'Trabajo',
    description: 'Dirección de trabajo del cliente',
    allowedForUserTypes: ['client']
  },
  {
    id: 'CLIENT_OTHER',
    name: 'Otra',
    description: 'Otra dirección del cliente',
    allowedForUserTypes: ['client']
  },
  {
    id: 'BUSINESS_MAIN',
    name: 'Sede Principal',
    description: 'Ubicación principal del negocio',
    allowedForUserTypes: ['business']
  },
  {
    id: 'BUSINESS_BRANCH',
    name: 'Sucursal',
    description: 'Sucursal del negocio',
    allowedForUserTypes: ['business']
  },
  {
    id: 'BUSINESS_WAREHOUSE',
    name: 'Almacén',
    description: 'Almacén o depósito',
    allowedForUserTypes: ['business']
  },
  {
    id: 'BUSINESS_PICKUP',
    name: 'Punto de Recogida',
    description: 'Punto de recogida para clientes',
    allowedForUserTypes: ['business']
  },
  {
    id: 'DRIVER_BASE',
    name: 'Base',
    description: 'Ubicación base del conductor',
    allowedForUserTypes: ['driver']
  },
  {
    id: 'DRIVER_ZONE',
    name: 'Zona de Trabajo',
    description: 'Zona de trabajo preferida',
    allowedForUserTypes: ['driver']
  }
];

/**
 * Seed address types collection
 */
export const seedAddressTypes = async () => {
  console.log('🌱 Seeding address types...');

  try {
    const promises = ADDRESS_TYPES_DATA.map(async (typeData) => {
      try {
        // Check if it already exists by trying to get it
        try {
          await firebaseClient.request('GET', `/address-types/id`, null, { id: typeData.id });
          console.log(`  ✓ Address type ${typeData.id} already exists`);
          return;
        } catch (error) {
          // If not found, we'll create it
        }

        // Create new address type
        await firebaseClient.request('POST', '/address-types', typeData, { id: typeData.id });
        console.log(`  ✅ Created address type: ${typeData.name}`);
      } catch (error) {
        console.error(`  ❌ Failed to create address type ${typeData.id}:`, error.message);
      }
    });

    await Promise.all(promises);
    console.log('🎉 Address types seeding completed!');
  } catch (error) {
    console.error('❌ Address types seeding failed:', error);
    throw error;
  }
};

/**
 * Check if address types exist
 */
export const checkAddressTypesExist = async () => {
  try {
    const addressTypes = await firebaseClient.request('GET', '/address-types');
    return {
      exists: addressTypes.length > 0,
      count: addressTypes.length,
      expected: ADDRESS_TYPES_DATA.length
    };
  } catch (error) {
    console.error('❌ Error checking address types:', error);
    return {
      exists: false,
      count: 0,
      expected: ADDRESS_TYPES_DATA.length,
      error: error.message
    };
  }
};