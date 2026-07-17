import { BaseApiService } from '../base-api-service';
import { COLLECTION_NAME } from './collection';

import { MediaProcessingService } from '../media/service';

/**
 * Products Resource
 * Handles product catalog operations for businesses
 */
export class ProductsResource extends BaseApiService {
  constructor(client) {
    super(client, COLLECTION_NAME);
  }

  /**
   * Handle incoming requests and route to appropriate method
   */
  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action.replace(/\//g, '_')}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in ProductsResource`);
    }

    return await this[handler](data, params);
  }

  // === HELPER METHODS ===

  /**
   * Batch fetch products by IDs
   * Uses Firebase 'in' queries (max 10 IDs per query)
   * This is more efficient than fetching one-by-one
   */
  async findByIds(productIds) {
    if (!productIds || productIds.length === 0) return [];

    const uniqueIds = [...new Set(productIds)];
    const products = [];

    // Firebase 'in' queries support max 10 items, so we batch
    for (let i = 0; i < uniqueIds.length; i += 10) {
      const batch = uniqueIds.slice(i, i + 10);

      try {
        const batchProducts = await this.findWhere([
          ['__name__', 'in', batch]
        ]);
        products.push(...batchProducts);
      } catch (error) {
        console.error('[Products API] Error fetching product batch:', error);
      }
    }

    return products;
  }

  /**
   * Populate business information for products
   * Uses batch fetching for efficiency
   */
  async populateBusinessInfo(products) {
    if (!products || products.length === 0) return products;

    // Get unique business IDs
    const businessIds = [...new Set(
      products.map(p => p.businessId).filter(Boolean)
    )];

    if (businessIds.length === 0) return products;

    // Batch fetch businesses using 'in' queries (max 10 per query)
    const businessesResource = this.client.getResource('businesses');
    const allBusinesses = [];

    for (let i = 0; i < businessIds.length; i += 10) {
      const batch = businessIds.slice(i, i + 10);

      try {
        const batchBusinesses = await businessesResource.findWhere([
          ['__name__', 'in', batch]
        ]);
        allBusinesses.push(...batchBusinesses);
      } catch (error) {
        console.error('[Products API] Error fetching business batch:', error);
      }
    }

    // Create map for quick lookup
    const businessMap = new Map();
    allBusinesses.forEach(business => {
      businessMap.set(business.id, business);
    });

    // Add business info to products
    return products.map(product => {
      const business = businessMap.get(product.businessId);
      if (business) {
        return {
          ...product,
          business: {
            id: business.id,
            name: business.businessName,
            logoUrl: business.logoUrl,
            coverImageUrl: business.coverImageUrl,
          }
        };
      }
      return product;
    });
  }

  // === PRODUCT CRUD ENDPOINTS ===

  /**
   * GET /products
   * Get all active products (with optional filters)
   */
  async get_index(data, params) {
    const { businessId, categoryId, featured, limit = 50 } = params;

    const filters = [['isActive', '==', true]];

    if (businessId) {
      filters.push(['businessId', '==', businessId]);
    }

    if (categoryId) {
      filters.push(['categoryId', '==', categoryId]);
    }

    if (featured === 'true') {
      filters.push(['isFeatured', '==', true]);
    }

    const products = await this.findWhere(filters);

    // Sort by creation date (newest first) and limit
    const sortedProducts = products
      .sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
      .slice(0, parseInt(limit));

    // Populate business info
    return await this.populateBusinessInfo(sortedProducts);
  }

  /**
   * GET /products/{id}
   * Get specific product and increment view count
   */
  async get_id(data, params) {
    const { id } = params;
    const product = await this.findById(id);

    if (!product) {
      throw new Error('Product not found');
    }

    // Increment view count asynchronously (don't wait)
    this.update(id, {
      viewCount: (product.viewCount || 0) + 1,
      updatedAt: new Date().toISOString()
    }).catch(err => console.error('Failed to increment view count:', err));

    // Populate business info
    const productsWithBusiness = await this.populateBusinessInfo([product]);
    return productsWithBusiness[0];
  }

  /**
   * POST /products
   * Create new product with image processing
   */
  async post_index(data, params) {
    const { businessId } = params;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    console.log('📦 [Products API] Creating product with image processing');
    console.log('   Image files:', data.imageFiles?.length || 0);

    let images = [];
    let thumbnailUrl = '';

    // Process product images if provided
    if (data.imageFiles && data.imageFiles.length > 0) {
      console.log(`🖼️ [Products API] Processing ${data.imageFiles.length} product image(s)`);
      images = await MediaProcessingService.processImages(data.imageFiles, 'products');
      thumbnailUrl = images[0];
    }

    const productData = {
      name: data.name,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice || null,
      stock: data.stock || 0,
      categoryId: data.categoryId || 'default',
      images,
      thumbnailUrl,
      businessId,
      currency: data.currency || 'USD',
      trackInventory: data.trackInventory !== undefined ? data.trackInventory : true,
      hasVariants: data.hasVariants || false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      isFeatured: data.isFeatured || false,
      viewCount: 0,
      favoriteCount: 0,
      orderCount: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newProduct = await this.create(productData);
    console.log('✅ [Products API] Product created:', newProduct.id);

    // Increment category product count (skip if default or category doesn't exist)
    if (data.categoryId && data.categoryId !== 'default') {
      try {
        const categoriesResource = this.client.getResource('categories');
        const category = await categoriesResource.findById(data.categoryId);
        if (category) {
          await categoriesResource.handle('PATCH', `${data.categoryId}/increment-products`, {}, {});
        }
      } catch (error) {
        console.warn('Failed to increment category count:', error.message);
      }
    }

    return newProduct;
  }

  /**
   * PUT /products/{id}
   * Update product
   */
  async put_id(data, params) {
    const { businessId, id } = params;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    // Verify ownership
    const product = await this.findById(id);
    if (product.businessId !== businessId) {
      throw new Error('Product not found or access denied');
    }

    // Handle category change
    if (data.categoryId && data.categoryId !== product.categoryId) {
      const categoriesResource = this.client.getResource('categories');

      try {
        // Decrement old category (skip if default)
        if (product.categoryId && product.categoryId !== 'default') {
          const oldCategory = await categoriesResource.findById(product.categoryId);
          if (oldCategory) {
            await categoriesResource.handle('PATCH', `${product.categoryId}/decrement-products`, {}, {});
          }
        }

        // Increment new category (skip if default)
        if (data.categoryId !== 'default') {
          const newCategory = await categoriesResource.findById(data.categoryId);
          if (newCategory) {
            await categoriesResource.handle('PATCH', `${data.categoryId}/increment-products`, {}, {});
          }
        }
      } catch (error) {
        console.warn('Failed to update category counts:', error.message);
      }
    }

    return await this.update(id, data);
  }

  /**
   * DELETE /products/{id}
   * Soft delete product (mark as inactive)
   */
  async delete_id(data, params) {
    const { businessId, id } = params;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    // Verify ownership
    const product = await this.findById(id);
    if (product.businessId !== businessId) {
      throw new Error('Product not found or access denied');
    }

    // Decrement category count (skip if default)
    if (product.categoryId && product.categoryId !== 'default') {
      try {
        const categoriesResource = this.client.getResource('categories');
        const category = await categoriesResource.findById(product.categoryId);
        if (category) {
          await categoriesResource.handle('PATCH', `${product.categoryId}/decrement-products`, {}, {});
        }
      } catch (error) {
        console.warn('Failed to decrement category count:', error.message);
      }
    }

    return await this.update(id, {
      isActive: false,
      updatedAt: new Date().toISOString()
    });
  }

  // === SPECIAL ENDPOINTS ===

  /**
   * GET /products/business/{businessId}
   * Get all products for a business
   */
  async get_business_id(data, params) {
    const { id: businessId } = params;

    return await this.findWhere([
      ['businessId', '==', businessId],
      ['isActive', '==', true]
    ]);
  }

  /**
   * GET /products/category/{categoryId}
   * Get all products in a category
   */
  async get_category_id(data, params) {
    const { id: categoryId } = params;

    return await this.findWhere([
      ['categoryId', '==', categoryId],
      ['isActive', '==', true]
    ]);
  }

  /**
   * GET /products/featured
   * Get featured products
   */
  async get_featured() {
    const products = await this.findWhere([
      ['isActive', '==', true],
      ['isFeatured', '==', true]
    ]);

    return products.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  }

  /**
   * PATCH /products/{id}/stock
   * Update product stock
   */
  async patch_id_stock(data, params) {
    const { businessId, id } = params;
    const { quantity, operation = 'set' } = data;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    // Verify ownership
    const product = await this.findById(id);
    if (product.businessId !== businessId) {
      throw new Error('Product not found or access denied');
    }

    let newStock;
    if (operation === 'increment') {
      newStock = product.stock + quantity;
    } else if (operation === 'decrement') {
      newStock = Math.max(0, product.stock - quantity);
    } else {
      newStock = quantity;
    }

    return await this.update(id, {
      stock: newStock,
      isAvailable: newStock > 0,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * PATCH /products/{id}/toggle-featured
   * Toggle featured status
   */
  async patch_id_toggle_featured(data, params) {
    const { businessId, id } = params;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    // Verify ownership
    const product = await this.findById(id);
    if (product.businessId !== businessId) {
      throw new Error('Product not found or access denied');
    }

    return await this.update(id, {
      isFeatured: !product.isFeatured,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * PATCH /products/{id}/increment-favorites
   * Increment favorite count
   */
  async patch_id_increment_favorites(data, params) {
    const { id } = params;
    const product = await this.findById(id);

    return await this.update(id, {
      favoriteCount: (product.favoriteCount || 0) + 1,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * PATCH /products/{id}/decrement-favorites
   * Decrement favorite count
   */
  async patch_id_decrement_favorites(data, params) {
    const { id } = params;
    const product = await this.findById(id);

    return await this.update(id, {
      favoriteCount: Math.max((product.favoriteCount || 0) - 1, 0),
      updatedAt: new Date().toISOString()
    });
  }
}
