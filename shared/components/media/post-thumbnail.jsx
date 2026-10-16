import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { resolveMediaUrl } from '../../utils/media-url';

// Frames generated from remote videos, keyed by video URL, so scrolling a grid
// back and forth doesn't download and decode the same video again
const generatedThumbs = new Map();

const getFirstMediaUrl = (post) => {
  const firstMedia = Array.isArray(post?.media) ? post.media[0] : null;
  return resolveMediaUrl((typeof firstMedia === 'string' ? firstMedia : firstMedia?.url) || post?.mediaUrl || post?.images?.[0]);
};

const isVideoPost = (post) => {
  const firstMedia = Array.isArray(post?.media) ? post.media[0] : null;
  return post?.type === 'video' || firstMedia?.type === 'video';
};

/**
 * Cover image for a post tile. A video's own URL can't be rendered by Image,
 * so when a video post was saved without a thumbnail we grab a frame from the
 * remote video on the device instead of leaving the tile blank.
 */
export function PostThumbnail({ post, style, iconColor = '#d1d5db', iconSize = 36, resizeMode = 'cover' }) {
  const isVideo = isVideoPost(post);
  const mediaUrl = getFirstMediaUrl(post);
  const directUri = resolveMediaUrl(post?.thumbnailUrl) || (isVideo ? null : mediaUrl);

  const [generatedUri, setGeneratedUri] = useState(
    !directUri && isVideo && mediaUrl ? generatedThumbs.get(mediaUrl) || null : null
  );

  useEffect(() => {
    if (directUri || !isVideo || !mediaUrl) return;
    if (generatedThumbs.has(mediaUrl)) {
      setGeneratedUri(generatedThumbs.get(mediaUrl));
      return;
    }

    let cancelled = false;
    VideoThumbnails.getThumbnailAsync(mediaUrl, { time: 500, quality: 0.5 })
      .then(({ uri }) => {
        generatedThumbs.set(mediaUrl, uri);
        if (!cancelled) setGeneratedUri(uri);
      })
      .catch((error) => {
        console.warn('Could not generate video thumbnail:', error?.message);
      });

    return () => {
      cancelled = true;
    };
  }, [directUri, isVideo, mediaUrl]);

  const uri = directUri || generatedUri;

  if (!uri) {
    return (
      <View style={[{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }, style]}>
        <Ionicons name={isVideo ? 'play-circle' : 'image'} size={iconSize} color={iconColor} />
      </View>
    );
  }

  return <Image source={{ uri }} style={[{ width: '100%', height: '100%' }, style]} resizeMode={resizeMode} />;
}

export default PostThumbnail;
