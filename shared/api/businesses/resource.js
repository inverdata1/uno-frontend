import { BaseFirebaseService } from '../base-firebase-service';
import { BranchesResource } from '../branches/resource';
import { MediaProcessingService } from '../media/service';
import { COLLECTION_NAME } from './collection';

/**
 * Businesses Resource
 * Handles business profile and operations
 */
export class BusinessesResource extends BaseFirebaseService {
  constructor(client) {
    super(client, COLLECTION_NAME);
    this.branchesService = new BranchesResource(client);
  }

  /**
   * Handle incoming requests and route to appropriate method
   */
  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action.replace(/\//g, '_')}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in BusinessesResource`);
    }

    return await this[handler](data, params);
  }

  // === BUSINESS CRUD ENDPOINTS ===

  /**
   * POST /businesses
   * Create a new business profile
   */
  async post_index(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId is required to create a business');
    }

    const now = new Date();

    const businessData = {
      ...data,
      ownerId: userId,
      isActive: true,
      isVerified: false,
      followersCount: 0,
      rating: 0,
      reviewsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    console.log('📊 Creating business:', businessData);

    const createdBusiness = await this.create(businessData);

    // Auto-create default branch for the business
    console.log('🏢 Creating default branch for business:', createdBusiness.id);
    const defaultBranch = await this.branchesService.create({
      businessId: createdBusiness.id,
      name: 'Principal', // Main branch
      isMain: true,
      isActive: true,
      address: data.address || null,
      phone: data.phone || null,
      createdAt: now,
      updatedAt: now,
    });

    console.log('✅ Default branch created:', defaultBranch.id);

    return createdBusiness;
  }

  /**
   * GET /businesses/profile
   * Get business profile by ID or owner ID
   */
  async get_profile(data, params) {
    const { businessId, userId } = params;

    if (businessId) {
      return await this.findById(businessId);
    }

    if (userId) {
      const businesses = await this.findWhere([['ownerId', '==', userId]]);
      return businesses[0] || null;
    }

    throw new Error('businessId or userId is required');
  }

  /**
   * GET /businesses/index
   * Get all businesses (with optional filters)
   */
  async get_index(data, params) {
    const { category, featured, limit = 50 } = params;

    const filters = [['isActive', '==', true]];

    if (category) {
      filters.push(['category', '==', category]);
    }

    if (featured === 'true') {
      filters.push(['isFeatured', '==', true]);
    }

    const businesses = await this.findWhere(filters);

    // Limit results
    return businesses.slice(0, parseInt(limit));
  }

  /**
   * PUT /businesses/profile
   * Update business profile with media processing
   */
  async put_profile(data, params) {
    const { businessId, userId } = params;

    if (!businessId) {
      throw new Error('businessId is required to update business');
    }

    console.log('📊 Updating business profile:', businessId);

    // Verify ownership (skip if userId not provided for now)
    const business = await this.findById(businessId);
    // if (userId && business.ownerId !== userId) {
    //   throw new Error('Unauthorized: You do not own this business');
    // }

    const updateData = { ...data };

    // Process logo if it's a local file URI
    if (data.logoUrl && data.logoUrl.startsWith('file://')) {
      console.log('🖼️ Processing logo image');
      const imageUrls = await MediaProcessingService.processImages([data.logoUrl], 'businesses/logos');
      updateData.logoUrl = imageUrls[0];
    }

    // Process banner if it's a local file URI
    if (data.bannerUrl && data.bannerUrl.startsWith('file://')) {
      console.log('🖼️ Processing banner image');
      const imageUrls = await MediaProcessingService.processImages([data.bannerUrl], 'businesses/banners');
      updateData.bannerUrl = imageUrls[0];
    }

    updateData.updatedAt = new Date();

    await this.update(businessId, updateData);
    console.log('✅ Business profile updated');

    return await this.findById(businessId);
  }

  /**
   * PUT /businesses/{id}/logo
   * Update business logo
   */
  async put_id_logo(data, params) {
    const { businessId, id } = params;
    const targetId = businessId || id;

    if (!targetId) {
      throw new Error('businessId is required');
    }

    if (!data.logoUrl) {
      throw new Error('logoUrl is required');
    }

    console.log('🖼️ Updating business logo:', targetId);

    const business = await this.findById(targetId);

    let processedLogoUrl = data.logoUrl;

    // Process logo if it's a local file URI
    if (data.logoUrl.startsWith('file://')) {
      console.log('📸 Processing logo image');
      const imageUrls = await MediaProcessingService.processImages([data.logoUrl], 'businesses/logos');
      processedLogoUrl = imageUrls[0];
    }

    await this.update(targetId, {
      logoUrl: processedLogoUrl,
      updatedAt: new Date()
    });

    console.log('✅ Business logo updated');
    return await this.findById(targetId);
  }

  /**
   * PUT /businesses/{id}/banner
   * Update business banner
   */
  async put_id_banner(data, params) {
    const { businessId, id } = params;
    const targetId = businessId || id;

    if (!targetId) {
      throw new Error('businessId is required');
    }

    if (!data.bannerUrl) {
      throw new Error('bannerUrl is required');
    }

    console.log('🖼️ Updating business banner:', targetId);

    const business = await this.findById(targetId);

    let processedBannerUrl = data.bannerUrl;

    // Process banner if it's a local file URI
    if (data.bannerUrl.startsWith('file://')) {
      console.log('📸 Processing banner image');
      const imageUrls = await MediaProcessingService.processImages([data.bannerUrl], 'businesses/banners');
      processedBannerUrl = imageUrls[0];
    }

    await this.update(targetId, {
      bannerUrl: processedBannerUrl,
      updatedAt: new Date()
    });

    console.log('✅ Business banner updated');
    return await this.findById(targetId);
  }

  /**
   * DELETE /businesses/profile
   * Soft delete a business (set isActive to false)
   */
  async delete_profile(data, params) {
    const { businessId, userId } = params;

    if (!businessId) {
      throw new Error('businessId is required to delete business');
    }

    // Verify ownership
    const business = await this.findById(businessId);
    if (business.ownerId !== userId) {
      throw new Error('Unauthorized: You do not own this business');
    }

    await this.update(businessId, {
      isActive: false,
      updatedAt: new Date(),
    });

    return { success: true };
  }
}
