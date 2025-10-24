import { firebaseClient } from '../index.js';
import { PostsResource } from './resource.js';
import { ProductsResource } from '../../api/products/resource.js';

/**
 * Migration Script: Tag posts with real product IDs
 * Run this to replace fake product IDs with real ones from your database
 */

const getPostsResource = () => new PostsResource(firebaseClient);
const getProductsResource = () => new ProductsResource(firebaseClient);

export const tagPostsWithRealProducts = async () => {
  console.log('🔄 Tagging posts with real products...');

  try {
    const postsResource = getPostsResource();
    const productsResource = getProductsResource();

    // Get all products
    const allProducts = await productsResource.findWhere([]);

    if (allProducts.length === 0) {
      console.log('⚠️  No products found in database. Please seed products first.');
      return { success: false, message: 'No products found' };
    }

    console.log(`📦 Found ${allProducts.length} products in database`);

    // Get all video posts
    const videoPosts = await postsResource.findWhere([
      ['type', '==', 'video'],
      ['isPublished', '==', true]
    ]);

    console.log(`🎥 Found ${videoPosts.length} video posts`);

    let updatedCount = 0;

    // Tag each video with 1-3 random real products
    for (const post of videoPosts) {
      // Randomly pick 1-3 products
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled.slice(0, numProducts);
      const productIds = selectedProducts.map(p => p.id);

      await postsResource.update(post.id, {
        taggedProducts: productIds
      });

      updatedCount++;
      console.log(`✅ Tagged post "${post.caption?.substring(0, 40)}..." with ${productIds.length} products`);
    }

    console.log('\n🎉 Tagging completed!');
    console.log(`  ✅ Updated: ${updatedCount} video posts`);

    return { success: true, updated: updatedCount };
  } catch (error) {
    console.error('❌ Tagging failed:', error);
    return { success: false, error: error.message };
  }
};
