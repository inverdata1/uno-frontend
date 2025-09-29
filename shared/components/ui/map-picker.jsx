import React, { useState, useEffect, useRef } from 'react';
import { View, Alert, ActivityIndicator, Pressable } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './text';
import { Button } from './button';
import { cn } from '../../utils/cn';

export const MapPicker = ({
  onLocationSelect,
  initialLocation = null,
  className = "",
  height = 300
}) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  // Default location (Caracas, Venezuela)
  const defaultLocation = {
    latitude: 10.4806,
    longitude: -66.9036,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
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
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setCurrentLocation(currentCoords);

      // If no initial location was provided, use current location
      if (!initialLocation && !selectedLocation) {
        setSelectedLocation(currentCoords);
        onLocationSelect?.(currentCoords);
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

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    const newLocation = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setSelectedLocation(newLocation);
    onLocationSelect?.(newLocation);
  };

  const centerOnCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(currentLocation, 1000);
      setSelectedLocation(currentLocation);
      onLocationSelect?.(currentLocation);
    } else {
      getCurrentLocation();
    }
  };

  const initialRegion = selectedLocation || currentLocation || defaultLocation;

  return (
    <View className={cn("rounded-xl overflow-hidden", className)}>
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
            >
              {/* Selected Location Marker */}
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  title="Ubicación Seleccionada"
                  description="Dirección de entrega"
                  pinColor="#DC2626"
                />
              )}
            </MapView>

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

      {/* Instructions */}
      <View className="bg-gray-50 p-4">
        <View className="flex-row items-center">
          <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-2 flex-1">
            Toca en el mapa para seleccionar la ubicación exacta de entrega
          </Text>
        </View>

      </View>
    </View>
  );
};