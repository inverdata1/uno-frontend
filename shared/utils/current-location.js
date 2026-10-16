import * as Location from 'expo-location';

const describePlace = (place) => {
  if (!place) return null;
  const parts = [];
  if (place.name && place.name !== place.street) parts.push(place.name);
  if (place.street) parts.push(place.streetNumber ? `${place.street} ${place.streetNumber}` : place.street);
  if (place.district) parts.push(place.district);
  if (place.city) parts.push(place.city);
  return parts.length ? parts.join(', ') : null;
};

/**
 * Ask for permission and read the device's current position, with a readable
 * address when the OS geocoder can resolve one.
 * @returns {Promise<{ latitude: number, longitude: number, address: string|null }>}
 * @throws Error('PERMISSION_DENIED') when the user refuses location access
 */
export const getCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('PERMISSION_DENIED');
  }

  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  const { latitude, longitude } = position.coords;

  let address = null;
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    address = describePlace(place);
  } catch (error) {
    console.warn('Reverse geocoding failed:', error?.message);
  }

  return { latitude, longitude, address };
};
