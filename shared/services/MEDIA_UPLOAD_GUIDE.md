# Media Upload Guide

Complete guide for uploading images and videos to Firebase Storage in the Uno Delivery app.

## Features

- Firebase Storage integration
- Automatic image compression
- Upload progress tracking
- Multiple file uploads
- Type validation
- Size validation
- React hooks for easy integration

## File Structure

```
shared/
├── config/
│   └── firebase.js           # Firebase config (now includes storage)
├── services/
│   └── media-upload.js       # Core upload service
└── hooks/
    └── use-media-upload.js   # React hooks for components
```

## Upload Types

The system supports different upload types with specific configurations:

| Type | Path | Max Dimensions | Quality | Use Case |
|------|------|----------------|---------|----------|
| `PRODUCT_IMAGE` | `products/images` | 1200x1200 | 80% | Product catalog images |
| `POST_IMAGE` | `posts/images` | 1080x1350 | 85% | Social feed posts |
| `POST_VIDEO` | `posts/videos` | - | - | Social feed videos (100MB max) |
| `STORY_IMAGE` | `stories/images` | 1080x1920 | 80% | Story images (vertical) |
| `STORY_VIDEO` | `stories/videos` | - | - | Story videos (50MB, 60s max) |
| `PROFILE_IMAGE` | `profiles/images` | 500x500 | 85% | User/business avatars |
| `BUSINESS_BANNER` | `businesses/banners` | 1500x500 | 85% | Business cover photos |

## Usage Examples

### 1. Upload Product Image

```javascript
import { useImagePicker, UPLOAD_TYPES } from '@/shared/hooks/use-media-upload';

export default function AddProductScreen() {
  const imagePicker = useImagePicker(UPLOAD_TYPES.PRODUCT_IMAGE);

  const handleAddImage = async () => {
    try {
      // Pick and auto-upload
      const result = await imagePicker.pickImage();

      if (result) {
        console.log('Uploaded:', result.url);
        // Use result.url in your product data
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <View>
      <Button onPress={handleAddImage}>
        {imagePicker.uploading ? 'Uploading...' : 'Add Image'}
      </Button>

      {imagePicker.uploading && (
        <Text>Progress: {Math.round(imagePicker.progress)}%</Text>
      )}

      {imagePicker.error && (
        <Text style={{ color: 'red' }}>{imagePicker.error}</Text>
      )}
    </View>
  );
}
```

### 2. Upload Multiple Post Images

```javascript
import { useImagePicker, UPLOAD_TYPES } from '@/shared/hooks/use-media-upload';

export default function CreatePostScreen() {
  const imagePicker = useImagePicker(UPLOAD_TYPES.POST_IMAGE);
  const [images, setImages] = useState([]);

  const handleSelectImages = async () => {
    try {
      const results = await imagePicker.pickMultipleImages();

      if (results) {
        setImages(results.map(r => r.url));
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <View>
      <Button onPress={handleSelectImages}>
        Select Images ({images.length})
      </Button>

      {imagePicker.uploading && (
        <ProgressBar progress={imagePicker.progress / 100} />
      )}

      <ScrollView horizontal>
        {images.map((url, index) => (
          <Image key={index} source={{ uri: url }} style={{ width: 100, height: 100 }} />
        ))}
      </ScrollView>
    </View>
  );
}
```

### 3. Upload Story Video

```javascript
import { useVideoPicker, UPLOAD_TYPES } from '@/shared/hooks/use-media-upload';

export default function CreateStoryScreen() {
  const videoPicker = useVideoPicker(UPLOAD_TYPES.STORY_VIDEO, {
    videoMaxDuration: 60 // 60 seconds max
  });

  const handleRecordVideo = async () => {
    try {
      const result = await videoPicker.recordVideo();

      if (result) {
        console.log('Video uploaded:', result.url);
        console.log('Duration:', result.metadata.duration);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <View>
      <Button onPress={handleRecordVideo}>
        {videoPicker.uploading ? 'Uploading...' : 'Record Video'}
      </Button>

      {videoPicker.uploading && (
        <View>
          <Text>Uploading video...</Text>
          <ProgressBar progress={videoPicker.progress / 100} />
        </View>
      )}
    </View>
  );
}
```

### 4. Upload with Camera

```javascript
import { useImagePicker, UPLOAD_TYPES } from '@/shared/hooks/use-media-upload';

export default function TakePhotoScreen() {
  const imagePicker = useImagePicker(UPLOAD_TYPES.POST_IMAGE, {
    allowsEditing: true,
    aspect: [4, 3]
  });

  const handleTakePhoto = async () => {
    try {
      const result = await imagePicker.takePhoto();

      if (result) {
        console.log('Photo uploaded:', result.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <Button onPress={handleTakePhoto}>
      Take Photo
    </Button>
  );
}
```

### 5. Manual Upload (Without Picker)

```javascript
import { useMediaUpload, UPLOAD_TYPES } from '@/shared/hooks/use-media-upload';

export default function CustomUploadScreen() {
  const { upload, uploading, progress } = useMediaUpload(UPLOAD_TYPES.PRODUCT_IMAGE);

  const handleManualUpload = async (localUri) => {
    try {
      const result = await upload(localUri, {
        filename: 'my-product.jpg',
        metadata: {
          productId: 'prod123',
          category: 'food'
        }
      });

      console.log('Uploaded:', result.url);
      console.log('Storage path:', result.path);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <View>
      {uploading && <Text>Progress: {Math.round(progress)}%</Text>}
    </View>
  );
}
```

### 6. Delete Uploaded Media

```javascript
import { deleteMedia } from '@/shared/services/media-upload';

const handleDelete = async (storagePath) => {
  try {
    await deleteMedia(storagePath);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Delete failed:', error);
  }
};
```

## Hook API Reference

### useImagePicker(uploadType, options)

Returns:
- `pickImage(autoUpload = true)` - Pick from library
- `pickMultipleImages(autoUpload = true)` - Pick multiple
- `takePhoto(autoUpload = true)` - Take photo with camera
- `upload(uri, options)` - Manual upload
- `remove(path)` - Delete uploaded file
- `clear()` - Clear uploaded files list
- `reset()` - Reset all state
- `picking` - Boolean, true while picking
- `uploading` - Boolean, true while uploading
- `progress` - Number (0-100), upload progress
- `error` - String, error message if any
- `uploadedFiles` - Array of uploaded file objects

### useVideoPicker(uploadType, options)

Returns:
- `pickVideo(autoUpload = true)` - Pick from library
- `recordVideo(autoUpload = true)` - Record with camera
- Same upload/state properties as useImagePicker

### useMediaUpload(uploadType)

Lower-level hook for custom upload logic.

Returns:
- `upload(uri, options)` - Upload single file
- `uploadMultiple(uris, options)` - Upload multiple files
- `remove(path)` - Delete uploaded file
- `clear()` - Clear uploaded files list
- `reset()` - Reset all state
- `uploading` - Boolean
- `progress` - Number (0-100)
- `error` - String
- `uploadedFiles` - Array

## Storage Structure

Files are organized in Firebase Storage:

```
/products/
  /images/
    /{userId}/
      /{userId}_{timestamp}_{random}.jpg

/posts/
  /images/
    /{userId}/
      /{userId}_{timestamp}_{random}.jpg
  /videos/
    /{userId}/
      /{userId}_{timestamp}_{random}.mp4

/stories/
  /images/
    /{userId}/
      /{userId}_{timestamp}_{random}.jpg
  /videos/
    /{userId}/
      /{userId}_{timestamp}_{random}.mp4

/profiles/
  /images/
    /{userId}/
      /{userId}_{timestamp}_{random}.jpg

/businesses/
  /banners/
    /{userId}/
      /{userId}_{timestamp}_{random}.jpg
```

## Best Practices

1. **Always compress images** - The service handles this automatically
2. **Show upload progress** - Use the `progress` state
3. **Handle errors gracefully** - Check `error` state
4. **Validate before upload** - Type and size validation is automatic
5. **Clean up old files** - Delete unused media from storage
6. **Store paths in Firestore** - Save the `path` for later deletion

## Error Handling

Common errors:
- `"User must be authenticated"` - User not logged in
- `"Permission denied"` - Camera/library permissions not granted
- `"Invalid file type"` - File type not allowed for this upload type
- `"File size exceeds limit"` - File too large

## Firebase Storage Rules

Update your Firebase Storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Authenticated users can read all files
    match /{allPaths=**} {
      allow read: if request.auth != null;
    }

    // Users can only write to their own folders
    match /{folder}/{userId}/{filename} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Required Packages

Make sure these packages are installed:

```bash
npx expo install expo-image-picker expo-image-manipulator expo-file-system firebase
```

## Next Steps

- Implement video thumbnail generation (expo-video-thumbnails)
- Add image filters/editing
- Implement cloud functions for server-side processing
- Add CDN integration for faster delivery
