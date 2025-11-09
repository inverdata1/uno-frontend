import { firebaseClient } from '../index.js';
import { POST_TYPES } from './collection.js';
import { PostsResource } from './resource.js';

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
    keywords: ['PizzaLovers', 'FoodPorn', 'Comida'],
    mentions: [],
    isPublished: true
  },
  {
    businessId: 'sample_business_2',
    userId: 'sample_user_2',
    type: POST_TYPES.VIDEO,
    caption: 'Nuevas camisetas disponibles! Varios colores y tallas. Perfectas para el verano.',
    media: [
      {
        type: 'video',
        url: 'https://cdn.pixabay.com/video/2025/10/04/307864_tiny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=500&fit=crop',
        duration: 15
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=500&fit=crop',
    taggedProducts: ['product_1'],
    keywords: ['Fashion', 'Ropa', 'Moda'],
    mentions: [],
    isPublished: true
  },
  {
    businessId: 'sample_business_3',
    userId: 'sample_user_3',
    type: POST_TYPES.VIDEO,
    caption: 'Preparando el café perfecto! Granos 100% colombianos.',
    media: [
      {
        type: 'video',
        url: 'https://cdn.pixabay.com/video/2025/09/15/304330_tiny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=500&fit=crop',
        duration: 20
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=500&fit=crop',
    taggedProducts: ['product_2', 'product_3'],
    keywords: ['Coffee', 'Cafe', 'CoffeeLover'],
    mentions: [],
    isPublished: true
  },
  {
    businessId: 'sample_business_1',
    userId: 'sample_user_1',
    type: POST_TYPES.VIDEO,
    caption: 'Unboxing de zapatos deportivos! Link en bio.',
    media: [
      {
        type: 'video',
        url: 'https://cdn.pixabay.com/video/2025/07/27/293788_tiny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=500&fit=crop',
        duration: 25
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=500&fit=crop',
    taggedProducts: ['product_4'],
    keywords: ['Sneakers', 'Unboxing', 'Fashion'],
    mentions: [],
    isPublished: true
  },
  {
    businessId: 'sample_business_2',
    userId: 'sample_user_2',
    type: POST_TYPES.VIDEO,
    caption: 'Rutina de maquillaje natural en 60 segundos.',
    media: [
      {
        type: 'video',
        url: 'https://cdn.pixabay.com/video/2024/10/13/236256_tiny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=300&h=500&fit=crop',
        duration: 30
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=300&h=500&fit=crop',
    taggedProducts: ['product_5', 'product_6', 'product_7'],
    keywords: ['Makeup', 'Beauty', 'Tutorial'],
    mentions: [],
    isPublished: true
  },
  {
    businessId: 'sample_business_3',
    userId: 'sample_user_3',
    type: POST_TYPES.VIDEO,
    caption: 'Receta fácil de smoothie bowl! Ingredientes frescos y saludables.',
    media: [
      {
        type: 'video',
        url: 'https://cdn.pixabay.com/video/2024/05/18/212404_tiny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300&h=500&fit=crop',
        duration: 30
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300&h=500&fit=crop',
    taggedProducts: ['product_8'],
    keywords: ['Healthy', 'Food', 'Recipe'],
    mentions: [],
    isPublished: true
  },
  {
    businessId: 'sample_business_1',
    userId: 'sample_user_1',
    type: POST_TYPES.VIDEO,
    caption: 'Nueva colección de relojes! Diseño minimalista y elegante.',
    media: [
      {
        type: 'video',
        url: 'https://cdn.pixabay.com/video/2025/08/20/298643_tiny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=300&h=500&fit=crop',
        duration: 18
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=300&h=500&fit=crop',
    taggedProducts: ['product_9'],
    keywords: ['Watches', 'Fashion', 'Style'],
    mentions: [],
    isPublished: true
  },
  {
    businessId: 'sample_business_2',
    userId: 'sample_user_2',
    type: POST_TYPES.VIDEO,
    caption: 'Decorando mi espacio de trabajo! Tips y productos.',
    media: [
      {
        type: 'video',
        url: 'https://cdn.pixabay.com/video/2025/09/06/302098_tiny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300&h=500&fit=crop',
        duration: 35
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300&h=500&fit=crop',
    taggedProducts: ['product_10', 'product_11'],
    keywords: ['HomeDecor', 'Workspace', 'Decor'],
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
    keywords: ['Skincare', 'Belleza', 'Beauty'],
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
