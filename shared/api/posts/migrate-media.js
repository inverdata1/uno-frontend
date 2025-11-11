import { firebaseClient } from '../index.js';
import { PostsResource } from './resource.js';

/**
 * Migration Script: Add media array to existing posts
 * Run this once to update old posts structure to new structure
 */

const getPostsResource = () => new PostsResource(firebaseClient);

export const migratePostsMedia = async () => {
  console.log('🔄 Starting posts media migration...');

  try {
    const postsResource = getPostsResource();

    // Get all posts
    const allPosts = await postsResource.findWhere([]);

    console.log(`📊 Found ${allPosts.length} posts to check`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const post of allPosts) {
      // Skip if already has media array
      if (post.media && Array.isArray(post.media) && post.media.length > 0) {
        skippedCount++;
        continue;
      }

      // Build media array from thumbnailUrl
      const media = [];

      if (post.thumbnailUrl) {
        if (post.type === 'video') {
          media.push({
            type: 'video',
            url: post.thumbnailUrl.replace('w=300&h=500', 'w=1080&h=1920'), // Use larger version for video
            thumbnailUrl: post.thumbnailUrl,
            duration: 20 // Default duration
          });
        } else if (post.type === 'image') {
          media.push({
            type: 'image',
            url: post.thumbnailUrl.replace('w=300&h=300', 'w=1080&h=1080'),
            thumbnailUrl: post.thumbnailUrl
          });
        } else if (post.type === 'carousel') {
          // For carousel, create multiple images from thumbnail
          for (let i = 0; i < 3; i++) {
            media.push({
              type: 'image',
              url: post.thumbnailUrl.replace('w=300&h=300', 'w=1080&h=1080'),
              thumbnailUrl: post.thumbnailUrl
            });
          }
        }
      }

      if (media.length > 0) {
        await postsResource.update(post.id, { media });
        updatedCount++;
        console.log(`✅ Updated post ${post.id} (${post.type}): ${post.caption?.substring(0, 50)}...`);
      } else {
        console.log(`⚠️  Skipped post ${post.id}: No thumbnailUrl found`);
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`  ✅ Updated: ${updatedCount} posts`);
    console.log(`  ⏭️  Skipped: ${skippedCount} posts (already have media)`);

    return { success: true, updated: updatedCount, skipped: skippedCount };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error: error.message };
  }
};
