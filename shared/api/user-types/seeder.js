import { UserTypesResource } from './resource.js';
import { USER_TYPES } from './collection.js';
import { firebaseClient } from '../index.js';

/**
 * User Types Seeder
 * Seeds the user_types collection with default data
 */

const getUserTypesResource = () => new UserTypesResource(firebaseClient);

export const USER_TYPES_DATA = {
  [USER_TYPES.CLIENT]: {
    id: USER_TYPES.CLIENT,
    name: 'Cliente',
    description: 'Usuario que realiza pedidos y recibe entregas',
    permissions: [
      'orders.create',
      'orders.view',
      'orders.cancel',
      'addresses.manage',
      'profile.view',
      'profile.update'
    ],
    isActive: true,
    features: {
      canOrder: true,
      canRate: true,
      canSaveAddresses: true
    },
    addressBehavior: {
      label: 'Entregar en',
      placeholder: 'Agregar dirección de entrega',
      icon: 'home',
      description: 'Donde recibirás tus pedidos'
    },
    uiConfig: {
      primaryColor: '#DC2626',
      theme: 'red',
      icon: 'person'
    }
  },

  [USER_TYPES.BUSINESS]: {
    id: USER_TYPES.BUSINESS,
    name: 'Negocio',
    description: 'Empresa que vende productos y procesa pedidos',
    permissions: [
      'business.manage',
      'products.create',
      'products.update',
      'products.delete',
      'orders.view',
      'orders.accept',
      'orders.reject',
      'staff.manage',
      'analytics.view'
    ],
    isActive: true,
    features: {
      canSellProducts: true,
      canManageOrders: true,
      canManageStaff: true,
      canViewAnalytics: true
    },
    addressBehavior: {
      label: 'Ubicación del negocio',
      placeholder: 'Agregar dirección del negocio',
      icon: 'storefront',
      description: 'Donde opera tu negocio'
    },
    uiConfig: {
      primaryColor: '#0F172A',
      theme: 'dark',
      icon: 'business'
    }
  },

  [USER_TYPES.DRIVER]: {
    id: USER_TYPES.DRIVER,
    name: 'Repartidor',
    description: 'Persona que entrega pedidos a los clientes',
    permissions: [
      'deliveries.view',
      'deliveries.accept',
      'deliveries.reject',
      'deliveries.complete',
      'availability.manage',
      'earnings.view'
    ],
    isActive: true,
    features: {
      canAcceptDeliveries: true,
      canManageAvailability: true,
      canTrackEarnings: true
    },
    addressBehavior: {
      label: 'Zona de trabajo',
      placeholder: 'Agregar zona de trabajo',
      icon: 'car',
      description: 'Donde trabajas como repartidor'
    },
    uiConfig: {
      primaryColor: '#059669',
      theme: 'green',
      icon: 'car'
    }
  }
};

export const seedUserTypes = async () => {
  console.log('🌱 Seeding user types...');

  try {
    const userTypesResource = getUserTypesResource();

    for (const userTypeData of Object.values(USER_TYPES_DATA)) {
      try {
        await userTypesResource.findById(userTypeData.id);
        console.log(`⏭️  User type already exists: ${userTypeData.name}`);
      } catch (error) {
        // User type doesn't exist, create it
        await userTypesResource.create(userTypeData, userTypeData.id);
        console.log(`✅ Created user type: ${userTypeData.name}`);
      }
    }

    console.log('🎉 User types seeding completed');
    return true;
  } catch (error) {
    console.error('❌ Error seeding user types:', error);
    return false;
  }
};

export const seedUserTypesOnly = async () => {
  console.log('🌱 Starting user types seeding...');

  const userTypesSuccess = await seedUserTypes();

  if (userTypesSuccess) {
    console.log('🎉 User types seeded successfully!');
  } else {
    console.log('⚠️  User types failed to seed');
  }
};