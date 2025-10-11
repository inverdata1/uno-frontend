import { PostsResource } from './resource.js';
import { POST_TYPES } from './collection.js';
import { firebaseClient } from '../index.js';

/**
 * Posts Seeder
 * Seeds sample social posts for testing
 */

const getPostsResource = () => new PostsResource(firebaseClient);

export const SAMPLE_POSTS = [
  {
    businessId: 'sample_business_1',
    userId: 'sample_user_1',
    type: POST_TYPES.IMAGE,
    caption: 'Nueva pizza artesanal! Ingredientes frescos y masa hecha en casa.',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop'
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop',
    taggedProducts: [],
    hashtags: ['PizzaLovers', 'FoodPorn', 'Comida'],
    mentions: [],
    isPublished: true
  },
  {
    businessId: 'sample_business_2',
    userId: 'sample_user_2',
    type: POST_TYPES.VIDEO,
    caption: 'Nuevas camisetas disponibles! Varios colores y tallas.',
    media: [
      {
        type: 'video',
        url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=800&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=400&fit=crop',
        duration: 15
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=400&fit=crop',
    taggedProducts: [],
    hashtags: ['Fashion', 'Ropa', 'Moda'],
    mentions: [],
    isPublished: true
  },
  {
    businessId: 'sample_business_3',
    userId: 'sample_user_3',
    type: POST_TYPES.CAROUSEL,
    caption: 'Rutina de skincare perfecta! Desliza para ver todos los productos',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&h=300&fit=crop'
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=600&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=300&h=300&fit=crop'
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop'
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&h=300&fit=crop',
    taggedProducts: [],
    hashtags: ['Skincare', 'Belleza', 'Beauty'],
    mentions: [],
    isPublished: true
  }
];

export const seedPosts = async () => {
  console.log('🌱 Seeding posts...');

  try {
    const postsResource = getPostsResource();

    for (const postData of SAMPLE_POSTS) {
      const existing = await postsResource.findOne([
        ['businessId', '==', postData.businessId],
        ['caption', '==', postData.caption]
      ]);

      if (!existing) {
        await postsResource.create({
          ...postData,
          likeCount: Math.floor(Math.random() * 500),
          commentCount: Math.floor(Math.random() * 50),
          shareCount: Math.floor(Math.random() * 20),
          viewCount: postData.type === POST_TYPES.VIDEO ? Math.floor(Math.random() * 1000) : 0,
          saveCount: Math.floor(Math.random() * 100),
          isPinned: false,
          isActive: true
        });
        console.log(`✅ Created post: ${postData.caption.substring(0, 50)}...`);
      } else {
        // Update existing post with new data
        await postsResource.update(existing.id, {
          ...postData
        });
        console.log(`🔄 Updated post: ${postData.caption.substring(0, 50)}...`);
      }
    }

    console.log('🎉 Posts seeding completed');
    return true;
  } catch (error) {
    console.error('❌ Error seeding posts:', error);
    return false;
  }
};
