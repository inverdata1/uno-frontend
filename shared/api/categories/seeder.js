import { CategoriesResource } from './resource.js';
import { firebaseClient } from '../index.js';

/**
 * Categories Seeder
 * Seeds initial product/content categories
 */

const getCategoriesResource = () => new CategoriesResource(firebaseClient);

export const DEFAULT_CATEGORIES = [
  {
    id: 'comida',
    name: 'Comida',
    slug: 'comida',
    icon: 'restaurant',
    color: '#DC2626',
    description: 'Restaurantes, comida rápida, postres y más',
    parentId: null,
    order: 1,
    isActive: true,
    metadata: {
      productCount: 0,
      businessCount: 0
    }
  },
  {
    id: 'ropa',
    name: 'Ropa',
    slug: 'ropa',
    icon: 'shirt',
    color: '#7C3AED',
    description: 'Moda, accesorios y calzado',
    parentId: null,
    order: 2,
    isActive: true,
    metadata: {
      productCount: 0,
      businessCount: 0
    }
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    slug: 'tecnologia',
    icon: 'phone-portrait',
    color: '#2563EB',
    description: 'Electrónica, gadgets y accesorios',
    parentId: null,
    order: 3,
    isActive: true,
    metadata: {
      productCount: 0,
      businessCount: 0
    }
  },
  {
    id: 'belleza',
    name: 'Belleza',
    slug: 'belleza',
    icon: 'sparkles',
    color: '#EC4899',
    description: 'Cosméticos, cuidado personal y skincare',
    parentId: null,
    order: 4,
    isActive: true,
    metadata: {
      productCount: 0,
      businessCount: 0
    }
  },
  {
    id: 'hogar',
    name: 'Hogar',
    slug: 'hogar',
    icon: 'home',
    color: '#059669',
    description: 'Muebles, decoración y artículos para el hogar',
    parentId: null,
    order: 5,
    isActive: true,
    metadata: {
      productCount: 0,
      businessCount: 0
    }
  },
  {
    id: 'deportes',
    name: 'Deportes',
    slug: 'deportes',
    icon: 'basketball',
    color: '#F59E0B',
    description: 'Equipamiento deportivo y activewear',
    parentId: null,
    order: 6,
    isActive: true,
    metadata: {
      productCount: 0,
      businessCount: 0
    }
  },
  {
    id: 'libros',
    name: 'Libros',
    slug: 'libros',
    icon: 'book',
    color: '#8B5CF6',
    description: 'Libros, revistas y material educativo',
    parentId: null,
    order: 7,
    isActive: true,
    metadata: {
      productCount: 0,
      businessCount: 0
    }
  },
  {
    id: 'mascotas',
    name: 'Mascotas',
    slug: 'mascotas',
    icon: 'paw',
    color: '#10B981',
    description: 'Productos y servicios para mascotas',
    parentId: null,
    order: 8,
    isActive: true,
    metadata: {
      productCount: 0,
      businessCount: 0
    }
  }
];

export const seedCategories = async () => {
  console.log('🌱 Seeding categories...');

  try {
    const categoriesResource = getCategoriesResource();

    for (const categoryData of DEFAULT_CATEGORIES) {
      try {
        await categoriesResource.findById(categoryData.id);
        console.log(`⏭️  Category already exists: ${categoryData.name}`);
      } catch (error) {
        // Category doesn't exist, create it
        await categoriesResource.create(categoryData, categoryData.id);
        console.log(`✅ Created category: ${categoryData.name}`);
      }
    }

    console.log('🎉 Categories seeding completed');
    return true;
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    return false;
  }
};
