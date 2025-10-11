import { StoriesResource } from './resource.js';
import { STORY_TYPES } from './collection.js';
import { firebaseClient } from '../index.js';

/**
 * Stories Seeder
 * Seeds sample stories for testing
 */

const getStoriesResource = () => new StoriesResource(firebaseClient);

export const SAMPLE_STORIES = [
  {
    businessId: 'sample_business_1',
    userId: 'sample_user_1',
    type: STORY_TYPES.IMAGE,
    mediaUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=800&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=400&fit=crop',
    duration: 5,
    taggedProducts: [],
    link: null,
    stickers: [],
    isActive: true,
    isExpired: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  },
  {
    businessId: 'sample_business_2',
    userId: 'sample_user_2',
    type: STORY_TYPES.IMAGE,
    mediaUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=800&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=400&fit=crop',
    duration: 5,
    taggedProducts: [],
    link: null,
    stickers: [],
    isActive: true,
    isExpired: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    businessId: 'sample_business_3',
    userId: 'sample_user_3',
    type: STORY_TYPES.IMAGE,
    mediaUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=800&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&h=400&fit=crop',
    duration: 5,
    taggedProducts: [],
    link: null,
    stickers: [],
    isActive: true,
    isExpired: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
];

export const seedStories = async () => {
  console.log('🌱 Seeding stories...');

  try {
    const storiesResource = getStoriesResource();

    for (const storyData of SAMPLE_STORIES) {
      const existing = await storiesResource.findOne([
        ['businessId', '==', storyData.businessId],
        ['mediaUrl', '==', storyData.mediaUrl]
      ]);

      if (!existing) {
        await storiesResource.create({
          ...storyData,
          viewCount: 0,
          replyCount: 0,
          shareCount: 0,
          tapForwardCount: 0,
          tapBackCount: 0,
          exitCount: 0,
          isPublished: true
        });
        console.log(`✅ Created story for business: ${storyData.businessId}`);
      } else {
        await storiesResource.update(existing.id, {
          ...storyData,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Reset expiration
        });
        console.log(`🔄 Updated story for business: ${storyData.businessId}`);
      }
    }

    console.log('🎉 Stories seeding completed');
    return true;
  } catch (error) {
    console.error('❌ Error seeding stories:', error);
    return false;
  }
};
