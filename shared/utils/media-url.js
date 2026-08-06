import { API_CONFIG } from '../config/api-config';

/**
 * Media uploaded through the backend is stored with an absolute URL that bakes in
 * whatever host the server had at upload time (e.g. http://192.168.0.103:3000/uploads/x.jpg).
 * On a LAN that host changes every time DHCP hands out a new address, which leaves
 * every previously uploaded image pointing at an unreachable machine.
 *
 * This rewrites the origin of any `/uploads/...` URL to the API host the app is
 * currently configured to talk to, so old and new records both resolve.
 *
 * @param {string|null|undefined} url
 * @returns {string|null} URL usable by <Image source={{ uri }} />, or null
 */
export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // Local device files (image picker) and data URIs must pass through untouched
  if (
    trimmed.startsWith('file:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('content:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('ph:')
  ) {
    return trimmed;
  }

  const base = API_CONFIG.baseURL.replace(/\/+$/, '');
  const uploadsIndex = trimmed.indexOf('/uploads/');

  // Backend-hosted media: keep the path, swap in the current API origin
  if (uploadsIndex !== -1) {
    return `${base}${trimmed.slice(uploadsIndex)}`;
  }

  // Relative path returned by the API
  if (trimmed.startsWith('/')) {
    return `${base}${trimmed}`;
  }

  // Anything else (Firebase Storage, Unsplash, CDNs) is already absolute
  return trimmed;
};

/**
 * Pull a displayable URL out of a post media entry, which may be a bare string
 * or an object shaped like { url, type, thumbnailUrl }.
 */
export const resolveMediaItemUrl = (item) => {
  if (!item) return null;
  if (typeof item === 'string') return resolveMediaUrl(item);
  return resolveMediaUrl(item.url || item.thumbnailUrl);
};

/**
 * Walk an API payload and rewrite every backend-hosted media URL it contains.
 *
 * Media URLs turn up under many different keys (logoUrl, thumbnailUrl, media[].url,
 * taggedProducts[].thumbnailUrl, ...), so rather than patching each screen this
 * normalises the whole response once, right where it enters the app.
 *
 * @param {*} value - Any JSON value from the API
 * @returns {*} The same shape, with `/uploads/...` URLs pointed at the current API host
 */
export const normalizeMediaUrls = (value) => {
  if (typeof value === 'string') {
    return value.includes('/uploads/') ? resolveMediaUrl(value) : value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeMediaUrls);
  }

  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = normalizeMediaUrls(item);
    }
    return result;
  }

  return value;
};
