# Video Strategy & Product Integration

## Overview

We use a **unified posts system** for both images and videos, with product tagging. This is the best approach because:

1. **Single source of truth** - All content (images/videos) in one collection
2. **Product tagging** - Videos can tag multiple products
3. **Engagement metrics** - Unified like/comment/view tracking
4. **Easy queries** - Filter by type, business, product, etc.

## Architecture

### Posts Collection Structure
```javascript
{
  id: "post_123",
  type: "video",  // or "image" or "carousel"
  businessId: "business_456",
  userId: "user_789",

  // Media
  media: [
    {
      type: "video",
      url: "https://storage.../video.mp4",
      thumbnailUrl: "https://storage.../thumb.jpg"
    }
  ],

  // Product Tagging - THE KEY FEATURE
  taggedProducts: ["product_1", "product_2", "product_3"],

  // Engagement
  viewCount: 15400,
  likeCount: 842,
  commentCount: 53,
  shareCount: 12
}
```

## How Videos Work

### 1. **Creating Videos**
Business creates a video post and tags products in it:

```javascript
const createPostMutation = useCreatePost();

await createPostMutation.mutateAsync({
  type: 'video',
  caption: 'Check out our new summer collection!',
  media: [{
    type: 'video',
    url: 'gs://bucket/video.mp4',
    thumbnailUrl: 'gs://bucket/thumb.jpg'
  }],
  taggedProducts: ['product_1', 'product_2'], // Tag products!
});
```

### 2. **Viewing Videos in Product Detail**

Use the `ProductVideosSection` component:

```javascript
import { ProductVideosSection } from './components/product-videos-section';

export default function ProductDetail({ product }) {
  const handleVideoPress = (video) => {
    // Open video viewer (full screen TikTok-style)
    router.push(`/video/${video.id}`);
  };

  return (
    <ScrollView>
      {/* Product images */}
      {/* Product info */}
      {/* Product description */}

      {/* Videos featuring this product */}
      <ProductVideosSection
        productId={product.id}
        onVideoPress={handleVideoPress}
      />

      {/* Reviews, etc */}
    </ScrollView>
  );
}
```

### 3. **Available Hooks**

```javascript
// Get all posts (images + videos) for a product
const { data: posts } = useProductPosts(productId);

// Get only videos for a product
const { data: videos } = useProductVideos(productId);

// Get only photos for a product
const { data: photos } = useProductPhotos(productId);
```

### 4. **Video Feed (TikTok-style)**

Already implemented in API:

```javascript
// Get all video posts
GET /posts/videos

// In your app:
const { data: videoFeed } = useQuery({
  queryKey: ['video-feed'],
  queryFn: () => apiClient.get('/posts/videos').then(res => res.data)
});
```

## Why This Is The Best Approach

### ✅ **Advantages**

1. **Natural Product Discovery**
   - Users watching videos discover products
   - Click on tagged products → go to product detail
   - See more videos with that product

2. **Content Reusability**
   - One video can promote multiple products
   - Products get exposure in multiple videos
   - Business creates less content, gets more value

3. **Better Analytics**
   - Track which products get most video views
   - See which videos drive most sales
   - Optimize content strategy

4. **Scalable**
   - Easy to add new post types (Reels, Stories, Live)
   - Simple queries (filter by type)
   - No duplicate data

5. **User Experience**
   - TikTok/Instagram-like familiar experience
   - Seamless navigation between videos and products
   - Engaging product discovery

### ❌ **Alternative Approaches (Not Recommended)**

**Separate Videos Collection:**
```javascript
// DON'T DO THIS
collections/
  videos/        ❌ Duplicate engagement metrics
  posts/         ❌ Split content
  products/      ❌ Hard to query across collections
```

Problems:
- Duplicate metrics (likes, comments)
- Complex queries across collections
- Harder to maintain
- More code to write

**Videos as Product Field:**
```javascript
// DON'T DO THIS
products: {
  id: "product_1",
  videos: [...] ❌ Videos locked to one product
}
```

Problems:
- One video can't feature multiple products
- No social aspect (likes, comments)
- Hard to create feed
- Not scalable

## Implementation Checklist

- [x] Posts API with product tagging
- [x] Post creation hooks
- [x] Product posts hooks
- [x] Product videos section component
- [ ] Video upload to Firebase Storage
- [ ] Video player component (full screen)
- [ ] Video feed screen (TikTok-style)
- [ ] Product tagging UI in post creation
- [ ] Video thumbnail generation

## Next Steps

1. **Add Video Upload**
   - Use `expo-image-picker` for videos
   - Upload to Firebase Storage
   - Generate thumbnail

2. **Product Tagging UI**
   - Multi-select products when creating post
   - Show tagged products in video player
   - Click to go to product detail

3. **Video Feed**
   - Full-screen vertical scroll (TikTok-style)
   - Swipe up/down between videos
   - Tap products to view details

4. **Analytics**
   - Track video views
   - Track product clicks from videos
   - Conversion funnel

## Example Integration in Product Detail

```jsx
// modules/commerce/products/product-detail.jsx

import { ProductVideosSection } from './components/product-videos-section';
import { useRouter } from 'expo-router';

export default function ProductDetail({ product }) {
  const router = useRouter();

  const handleVideoPress = (video) => {
    // Navigate to full-screen video player
    router.push({
      pathname: '/video/[id]',
      params: {
        id: video.id,
        // Optional: start with videos for this product
        productId: product.id
      }
    });
  };

  return (
    <ScrollView>
      {/* ... existing product content ... */}

      {/* Add video section */}
      <ProductVideosSection
        productId={product.id}
        onVideoPress={handleVideoPress}
      />

      {/* ... rest of content ... */}
    </ScrollView>
  );
}
```

## Summary

**Current Approach (Unified Posts) = BEST ✅**

- Single posts collection
- Type field (image/video)
- Product tagging array
- All metrics in one place
- Easy queries
- Scalable
- Familiar UX (Instagram/TikTok)

This is exactly how Instagram, TikTok, and modern social commerce apps work!
