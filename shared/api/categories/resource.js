import { BaseApiService } from '../base-api-service';
import { COLLECTION_NAME } from './collection';

/**
 * Categories Resource
 * Handles category CRUD operations and hierarchical queries
 */
export class CategoriesResource extends BaseApiService {
  constructor(client) {
    super(client, COLLECTION_NAME);
  }

  /**
   * Handle incoming requests and route to appropriate method
   */
  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action.replace(/\//g, '_')}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in CategoriesResource`);
    }

    return await this[handler](data, params);
  }

  /**
   * GET /categories
   * Get all active categories ordered by display order
   */
  async get_index() {
    const categories = await this.findWhere([
      ['isActive', '==', true]
    ]);

    // Sort by order
    return categories.sort((a, b) => a.order - b.order);
  }

  /**
   * GET /categories/{id}
   * Get specific category by ID
   */
  async get_id(data, params) {
    const { id } = params;
    return await this.findById(id);
  }

  /**
   * GET /categories/slug/{slug}
   * Get category by slug
   */
  async get_slug_id(data, params) {
    const { id: slug } = params;

    const category = await this.findOne([
      ['slug', '==', slug],
      ['isActive', '==', true]
    ]);

    if (!category) {
      throw new Error(`Category with slug '${slug}' not found`);
    }

    return category;
  }

  /**
   * GET /categories/{id}/subcategories
   * Get subcategories for a parent category
   */
  async get_id_subcategories(data, params) {
    const { id: parentId } = params;

    const subcategories = await this.findWhere([
      ['parentId', '==', parentId],
      ['isActive', '==', true]
    ]);

    return subcategories.sort((a, b) => a.order - b.order);
  }

  /**
   * GET /categories/top-level
   * Get only top-level categories (no parent)
   */
  async get_top_level() {
    const categories = await this.findWhere([
      ['parentId', '==', null],
      ['isActive', '==', true]
    ]);

    return categories.sort((a, b) => a.order - b.order);
  }

  /**
   * POST /categories
   * Create new category
   */
  async post_index(data, params) {
    const categoryData = {
      ...data,
      slug: data.slug || this.generateSlug(data.name),
      order: data.order || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      metadata: data.metadata || {
        productCount: 0,
        businessCount: 0
      }
    };

    return await this.create(categoryData);
  }

  /**
   * PUT /categories/{id}
   * Update category
   */
  async put_id(data, params) {
    const { id } = params;

    // If name changed, update slug
    if (data.name && !data.slug) {
      data.slug = this.generateSlug(data.name);
    }

    return await this.update(id, data);
  }

  /**
   * DELETE /categories/{id}
   * Soft delete category (mark as inactive)
   */
  async delete_id(data, params) {
    const { id } = params;

    return await this.update(id, {
      isActive: false
    });
  }

  /**
   * PATCH /categories/{id}/increment-products
   * Increment product count for category
   */
  async patch_id_increment_products(data, params) {
    const { id } = params;
    const category = await this.findById(id);

    return await this.update(id, {
      metadata: {
        ...category.metadata,
        productCount: (category.metadata?.productCount || 0) + 1
      }
    });
  }

  /**
   * PATCH /categories/{id}/decrement-products
   * Decrement product count for category
   */
  async patch_id_decrement_products(data, params) {
    const { id } = params;
    const category = await this.findById(id);

    return await this.update(id, {
      metadata: {
        ...category.metadata,
        productCount: Math.max((category.metadata?.productCount || 0) - 1, 0)
      }
    });
  }

  // === UTILITY METHODS ===

  /**
   * Generate URL-friendly slug from name
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
