import React, { useState, useEffect, useRef } from 'react';
import { View, Alert, ActivityIndicator, Pressable, Platform, TextInput } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './text';
import { cn } from '../../utils/cn';

// Photon (OpenStreetMap) is used instead of the OS geocoder: CLGeocoder only
// resolves postal addresses, so searches for landmarks — malls, universities,
// urbanizations — came back empty or as a bare city name. Photon indexes OSM
// points of interest, needs no API key, and accepts a location bias.
const PHOTON_SEARCH_URL = 'https://photon.komoot.io/api/';
const PHOTON_REVERSE_URL = 'https://photon.komoot.io/reverse';

const SEARCH_DEBOUNCE_MS = 400;
const MIN_SEARCH_LENGTH = 3;
const MAX_RESULTS = 8;
// Only offer places within this distance of the device, so results stay local
const SEARCH_RADIUS_KM = 40;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

// Great-circle distance in km, used to enforce the search radius
const distanceKm = (from, to) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
};

// Photon takes a rectangle, so pre-filter with the box that encloses the radius
// circle; the exact circle is enforced afterwards with distanceKm.
const boundingBox = ({ latitude, longitude }, radiusKm) => {
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / (111 * Math.max(Math.cos(toRadians(latitude)), 0.01));
  return [
    longitude - lonDelta,
    latitude - latDelta,
    longitude + lonDelta,
    latitude + latDelta,
  ].join(',');
};

// Human labels for the OSM categories worth calling out in the results list
const PLACE_KINDS = {
  mall: { icon: 'cart', label: 'Centro comercial' },
  supermarket: { icon: 'cart', label: 'Supermercado' },
  commercial: { icon: 'business', label: 'Zona comercial' },
  university: { icon: 'school', label: 'Universidad' },
  college: { icon: 'school', label: 'Instituto' },
  school: { icon: 'school', label: 'Colegio' },
  hospital: { icon: 'medkit', label: 'Hospital' },
  clinic: { icon: 'medkit', label: 'Clínica' },
  pharmacy: { icon: 'medkit', label: 'Farmacia' },
  restaurant: { icon: 'restaurant', label: 'Restaurante' },
  cafe: { icon: 'cafe', label: 'Cafetería' },
  fuel: { icon: 'car', label: 'Estación de servicio' },
  bank: { icon: 'card', label: 'Banco' },
  residential: { icon: 'home', label: 'Urbanización' },
  neighbourhood: { icon: 'home', label: 'Barrio' },
  suburb: { icon: 'home', label: 'Sector' },
  quarter: { icon: 'home', label: 'Sector' },
  administrative: { icon: 'map', label: 'Zona' },
  park: { icon: 'leaf', label: 'Parque' },
  stadium: { icon: 'football', label: 'Estadio' },
  church: { icon: 'business', label: 'Iglesia' },
  place_of_worship: { icon: 'business', label: 'Iglesia' },
};

const describeKind = ({ osm_key: key, osm_value: value }) => {
  if (PLACE_KINDS[value]) return PLACE_KINDS[value];
  if (key === 'highway') return { icon: 'navigate', label: 'Calle o avenida' };
  if (key === 'place') return { icon: 'map', label: 'Zona' };
  return { icon: 'location', label: null };
};

// Builds "Centro Comercial Sambil" + "Av. 5 de Julio, Maracaibo" from an OSM hit
const describePlace = (properties) => {
  const { name, street, housenumber, district, city, county, state } = properties;
  const streetLine = [street, housenumber].filter(Boolean).join(' ');
  const area = [district, city || county, state].filter(Boolean);

  const title = name || streetLine || area[0] || 'Ubicación';
  const details = [];
  if (streetLine && streetLine !== title) details.push(streetLine);
  area.forEach((part) => {
    if (part !== title && !details.includes(part)) details.push(part);
  });

  return { title, subtitle: details.slice(0, 3).join(', ') };
};

export const MapPicker = ({
  onLocationSelect,
  initialLocation = null,
  className = "",
  height = 300,
  instructionText = "Toca en el mapa para seleccionar la ubicación exacta de entrega",
  // Pass these two to fold the address field into the map: the picker fills the
  // address in as the user searches or taps, and the field stays editable so
  // details the map can't know (floor, local number) can be added.
  addressValue,
  onAddressChange,
}) => {
  const editsAddress = typeof onAddressChange === 'function';
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapInteractionEnabled, setMapInteractionEnabled] = useState(false);
  const mapRef = useRef(null);

  // Place search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState(null);
  // Set when the query is filled in from a tapped result, so that doesn't
  // immediately trigger another search for the text we just inserted
  const skipNextSearchRef = useRef(false);
  // Guards against an older, slower search overwriting a newer one
  const searchSeqRef = useRef(0);

  // Default location (Caracas, Venezuela)
  const defaultLocation = {
    latitude: 10.4806,
    longitude: -66.9036,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setHasLocationPermission(false);
        setIsLoading(false);
        Alert.alert(
          'Permisos de Ubicación',
          'Para usar el selector de mapa, necesitamos acceso a tu ubicación. Puedes habilitarlo en configuración.',
          [{ text: 'OK' }]
        );
        // Still show map with default location when permission denied
        setMapReady(true);
        return;
      }

      setHasLocationPermission(true);
      await getCurrentLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setIsLoading(false);
      // Show map with default location on error
      setMapReady(true);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      const currentCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setCurrentLocation(currentCoords);

      // If no initial location was provided, use current location
      if (!initialLocation && !selectedLocation) {
        selectLocation(currentCoords);
      }

      // Mark as ready to show map
      setMapReady(true);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Error de Ubicación',
        'No pudimos obtener tu ubicación actual. Usando ubicación por defecto.',
        [{ text: 'OK' }]
      );
      // Still show map with default location on error
      setMapReady(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Turns coordinates into a readable address, e.g. "Centro Comercial Sambil,
  // Av. 5 de Julio, Maracaibo". Photon names landmarks the OS geocoder doesn't
  // know, so it goes first; expo-location covers the case where Photon is
  // unreachable (no connectivity).
  const resolveAddress = async ({ latitude, longitude }) => {
    try {
      const response = await fetch(
        `${PHOTON_REVERSE_URL}?lat=${latitude}&lon=${longitude}&limit=1`
      );
      if (response.ok) {
        const data = await response.json();
        const properties = data?.features?.[0]?.properties;
        if (properties) {
          const { title, subtitle } = describePlace(properties);
          return [title, subtitle].filter(Boolean).join(', ');
        }
      }
    } catch (error) {
      console.log('Photon reverse geocoding failed, falling back:', error);
    }

    try {
      const geoResults = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (geoResults && geoResults.length > 0) {
        const place = geoResults[0];
        const parts = [];
        if (place.name && place.name !== place.street) parts.push(place.name);
        if (place.street) parts.push(place.street);
        if (place.city) parts.push(place.city);
        if (place.region) parts.push(place.region);
        if (parts.length > 0) return parts.join(', ');
      }
    } catch (error) {
      console.log('Error in reverse geocoding:', error);
    }
    return null;
  };

  // Reports a picked point upward, resolving its address first so callers can
  // auto-fill an address field
  const selectLocation = async (coords) => {
    const newLocation = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };

    setSelectedLocation(newLocation);
    onLocationSelect?.(newLocation);

    const address = await resolveAddress(newLocation);
    if (address) {
      const located = { ...newLocation, address };
      setSelectedLocation(located);
      onLocationSelect?.(located);
      onAddressChange?.(address);
    }
  };

  const handleMapPress = (event) => selectLocation(event.nativeEvent.coordinate);

  const runSearch = async (query) => {
    const seq = ++searchSeqRef.current;
    setIsSearching(true);
    setSearchMessage(null);

    // Anchor the radius on the device; fall back to whatever the map is showing
    const origin = currentLocation || selectedLocation || defaultLocation;

    try {
      const url =
        `${PHOTON_SEARCH_URL}?q=${encodeURIComponent(query)}` +
        `&lat=${origin.latitude}&lon=${origin.longitude}` +
        `&bbox=${boundingBox(origin, SEARCH_RADIUS_KM)}` +
        `&limit=25`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Photon responded ${response.status}`);
      const data = await response.json();

      // A newer keystroke already started another search
      if (seq !== searchSeqRef.current) return;

      const places = (data?.features || [])
        .map((feature) => {
          const [longitude, latitude] = feature.geometry?.coordinates || [];
          if (latitude === undefined || longitude === undefined) return null;

          const properties = feature.properties || {};
          const { title, subtitle } = describePlace(properties);
          const kind = describeKind(properties);

          return {
            latitude,
            longitude,
            title,
            subtitle,
            kind,
            distance: distanceKm(origin, { latitude, longitude }),
          };
        })
        .filter(Boolean)
        // The bbox is a rectangle; this trims the corners to a true 40 km circle
        .filter((place) => place.distance <= SEARCH_RADIUS_KM)
        .sort((a, b) => a.distance - b.distance);

      // OSM often holds several nodes for one place (building + entrance + area)
      const seen = new Set();
      const unique = places
        .filter((place) => {
          const key = `${place.title}|${place.subtitle}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, MAX_RESULTS);

      setSearchResults(unique);
      if (unique.length === 0) {
        setSearchMessage(
          `Sin resultados a menos de ${SEARCH_RADIUS_KM} km. Prueba con otro nombre.`
        );
      }
    } catch (error) {
      if (seq !== searchSeqRef.current) return;
      console.log('Error searching places:', error);
      setSearchResults([]);
      setSearchMessage('No se pudo buscar. Revisa tu conexión.');
    } finally {
      if (seq === searchSeqRef.current) setIsSearching(false);
    }
  };

  // Debounced search as the user types
  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const query = searchQuery.trim();
    if (query.length < MIN_SEARCH_LENGTH) {
      searchSeqRef.current++; // cancel anything in flight
      setSearchResults([]);
      setSearchMessage(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => runSearch(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (result) => {
    const region = {
      latitude: result.latitude,
      longitude: result.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    const address = [result.title, result.subtitle].filter(Boolean).join(', ');

    // Keep the chosen place in the box without re-triggering the search
    skipNextSearchRef.current = true;
    setSearchQuery(result.title);
    setSearchResults([]);
    setSearchMessage(null);

    // The map is now showing a deliberate choice, so let the user pan from here
    setMapInteractionEnabled(true);
    mapRef.current?.animateToRegion(region, 800);

    // The result already carries a resolved name, so report it without another lookup
    const located = { ...region, address };
    setSelectedLocation(located);
    onLocationSelect?.(located);
    onAddressChange?.(address);
  };

  const clearSearch = () => {
    searchSeqRef.current++;
    setSearchQuery('');
    setSearchResults([]);
    setSearchMessage(null);
    setIsSearching(false);
  };

  const centerOnCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(currentLocation, 1000);
      selectLocation(currentLocation);
    } else {
      getCurrentLocation();
    }
  };

  const initialRegion = selectedLocation || currentLocation || defaultLocation;

  return (
    <View className={cn("rounded-xl overflow-hidden", className)}>
      {/* Place search. zIndex keeps the results list above the map, which on
          Android otherwise draws over absolutely positioned siblings. */}
      <View className="bg-white px-3 pt-3 pb-2" style={{ zIndex: 10 }}>
        <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-3">
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Busca una zona o referencia"
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            autoCorrect={false}
            onSubmitEditing={() => {
              const query = searchQuery.trim();
              if (query.length >= MIN_SEARCH_LENGTH) runSearch(query);
            }}
            className="flex-1 py-3 px-2 text-base text-gray-900"
          />
          {isSearching && <ActivityIndicator size="small" color="#DC2626" />}
          {!isSearching && searchQuery.length > 0 && (
            <Pressable onPress={clearSearch} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {searchMessage && (
          <Text className="text-xs text-gray-500 mt-2 px-1">{searchMessage}</Text>
        )}

        {searchResults.length > 0 && (
          <View className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
            {searchResults.map((result, index) => (
              <Pressable
                key={`${result.latitude},${result.longitude},${index}`}
                onPress={() => handleSelectSearchResult(result)}
                className={cn(
                  'flex-row items-center px-3 py-2.5 active:bg-gray-50',
                  index > 0 && 'border-t border-gray-100'
                )}
              >
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                  <Ionicons name={result.kind.icon} size={15} color="#DC2626" />
                </View>
                <View className="ml-2.5 flex-1">
                  <Text className="text-sm text-gray-900 font-medium" numberOfLines={1}>
                    {result.title}
                  </Text>
                  {!!result.subtitle && (
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                      {result.kind.label ? `${result.kind.label} · ` : ''}
                      {result.subtitle}
                    </Text>
                  )}
                </View>
                <Text className="text-xs text-gray-400 ml-2">
                  {result.distance < 1
                    ? `${Math.round(result.distance * 1000)} m`
                    : `${result.distance.toFixed(1)} km`}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Map Container */}
      <View style={{ height }} className="relative">
        {mapReady ? (
          <>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              initialRegion={initialRegion}
              onPress={handleMapPress}
              showsUserLocation={hasLocationPermission}
              showsMyLocationButton={false}
              showsCompass={false}
              toolbarEnabled={false}
              loadingEnabled={true}
              mapType="standard"
              scrollEnabled={mapInteractionEnabled}
              zoomEnabled={mapInteractionEnabled}
              rotateEnabled={mapInteractionEnabled}
              pitchEnabled={mapInteractionEnabled}
            >
              {/* Selected Location Marker */}
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  title="Ubicación Seleccionada"
                  description={instructionText}
                  pinColor="#DC2626"
                />
              )}
            </MapView>

            {/* Enable Map Interaction Overlay */}
            {!mapInteractionEnabled && (
              <Pressable
                onPress={() => setMapInteractionEnabled(true)}
                className="absolute inset-0 items-center justify-center"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
              >
                <View className="bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
                  <View className="flex-row items-center">
                    <Ionicons name="hand-left" size={18} color="#DC2626" />
                    <Text className="text-sm font-semibold text-gray-700 ml-2">
                      Toca para mover el mapa
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}

            {/* Current Location Button */}
            {hasLocationPermission && !isLoading && (
              <View className="absolute bottom-4 right-4">
                <Pressable
                  onPress={centerOnCurrentLocation}
                  className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 items-center justify-center active:scale-95"
                >
                  <Ionicons name="locate" size={18} color="#DC2626" />
                </Pressable>
              </View>
            )}
          </>
        ) : (
          <View className="absolute inset-0 bg-gray-100 items-center justify-center">
            <ActivityIndicator size="large" color="#DC2626" />
            <Text className="text-gray-600 mt-2">Obteniendo ubicación...</Text>
          </View>
        )}
      </View>

      {/* The address the map resolved. When the caller owns an address field it
          is rendered here, editable, so there is a single address in the form
          instead of one on the map and another below it. */}
      <View className="bg-gray-50 p-4">
        {editsAddress ? (
          <>
            <Text className="text-xs text-gray-500 mb-1">Dirección del negocio</Text>
            <TextInput
              value={addressValue}
              onChangeText={onAddressChange}
              placeholder="Busca arriba o toca el mapa"
              placeholderTextColor="#9CA3AF"
              multiline
              className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900"
            />
            <Text className="text-xs text-gray-400 mt-1.5">
              Puedes editarla para agregar detalles (piso, local, punto de referencia).
            </Text>
          </>
        ) : selectedLocation?.address ? (
          <View className="flex-row items-start">
            <Ionicons name="location" size={16} color="#DC2626" style={{ marginTop: 2 }} />
            <View className="ml-2 flex-1">
              <Text className="text-xs text-gray-500">Dirección seleccionada</Text>
              <Text className="text-sm text-gray-800 font-medium">
                {selectedLocation.address}
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center">
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2 flex-1">
              {instructionText}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};