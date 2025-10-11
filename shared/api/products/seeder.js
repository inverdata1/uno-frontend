import { ProductsResource } from './resource.js';
import { firebaseClient } from '../index.js';

/**
 * Products Seeder
 * Seeds sample products for testing
 */

const getProductsResource = () => new ProductsResource(firebaseClient);

export const SAMPLE_PRODUCTS = [
  {
    businessId: 'sample_business_1',
    categoryId: 'comida',
    name: 'Pizza Margherita',
    description: 'Pizza clásica con salsa de tomate, mozzarella fresca y albahaca',
    price: 12.99,
    compareAtPrice: 15.99,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop',
    stock: 50,
    trackInventory: false,
    hasVariants: true,
    variants: [
      { name: 'Tamaño', options: ['Personal', 'Mediana', 'Familiar'] }
    ],
    ingredients: ['Salsa de tomate', 'Mozzarella', 'Albahaca', 'Aceite de oliva'],
    allergens: ['Gluten', 'Lácteos'],
    isActive: true,
    isAvailable: true,
    isFeatured: true
  },
  {
    businessId: 'sample_business_2',
    categoryId: 'ropa',
    name: 'Camiseta Básica',
    description: 'Camiseta de algodón 100% en varios colores',
    price: 19.99,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    stock: 100,
    trackInventory: true,
    hasVariants: true,
    variants: [
      { name: 'Talla', options: ['S', 'M', 'L', 'XL'] },
      { name: 'Color', options: ['Negro', 'Blanco', 'Gris', 'Azul'] }
    ],
    specifications: {
      material: '100% Algodón',
      cuidado: 'Lavar a máquina',
      origen: 'Made in Venezuela'
    },
    isActive: true,
    isAvailable: true,
    isFeatured: false
  },
  {
    businessId: 'sample_business_3',
    categoryId: 'belleza',
    name: 'Crema Hidratante Facial',
    description: 'Crema hidratante con ácido hialurónico para todo tipo de piel',
    price: 24.99,
    compareAtPrice: 29.99,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
    stock: 30,
    trackInventory: true,
    hasVariants: false,
    specifications: {
      volumen: '50ml',
      ingredientesActivos: 'Ácido Hialurónico, Vitamina E',
      tipoDePiel: 'Todo tipo'
    },
    isActive: true,
    isAvailable: true,
    isFeatured: true
  }
];

export const seedProducts = async () => {
  console.log('🌱 Seeding products...');

  try {
    const productsResource = getProductsResource();

    for (const productData of SAMPLE_PRODUCTS) {
      const existing = await productsResource.findOne([
        ['businessId', '==', productData.businessId],
        ['name', '==', productData.name]
      ]);

      if (!existing) {
        await productsResource.create({
          ...productData,
          viewCount: 0,
          favoriteCount: 0,
          orderCount: 0,
          rating: 0,
          reviewCount: 0
        });
        console.log(`✅ Created product: ${productData.name}`);
      } else {
        // Update existing product with new data
        await productsResource.update(existing.id, {
          ...productData
        });
        console.log(`🔄 Updated product: ${productData.name}`);
      }
    }

    console.log('🎉 Products seeding completed');
    return true;
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    return false;
  }
};
