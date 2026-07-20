import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './text';
import { cn } from '../../utils/cn';

let L, MapContainer, TileLayer, Marker, useMapEvents;
if (typeof window !== 'undefined') {
  L = require('leaflet');
  const RL = require('react-leaflet');
  MapContainer = RL.MapContainer;
  TileLayer = RL.TileLayer;
  Marker = RL.Marker;
  useMapEvents = RL.useMapEvents;

  // Fix leaflet default marker icons in React
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });

  // Inject Leaflet CSS dynamically to prevent Metro Bundler warning
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);
  }
}

const LocationMarker = ({ position, setPosition, onLocationSelect }) => {
  const map = useMapEvents({
    click(e) {
      const newPos = { latitude: e.latlng.lat, longitude: e.latlng.lng };
      setPosition(newPos);
      if (onLocationSelect) onLocationSelect(newPos);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const markerRef = useRef(null);
  
  // Make map fly to position when it changes from outside
  useEffect(() => {
    if (position && map) {
      map.flyTo([position.latitude, position.longitude], map.getZoom() || 13);
    }
  }, [position, map]);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const latlng = marker.getLatLng();
        const newPos = { latitude: latlng.lat, longitude: latlng.lng };
        setPosition(newPos);
        if (onLocationSelect) onLocationSelect(newPos);
      }
    },
  };

  return position === null ? null : (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[position.latitude, position.longitude]}
      ref={markerRef}
    />
  );
};

export const MapPicker = ({
  onLocationSelect,
  onAddressDetected,
  initialLocation = null,
  className = "",
  height = 300
}) => {
  const defaultLocation = { latitude: 10.6427, longitude: -71.6125 }; // Default to Maracaibo
  const [position, setPosition] = useState(initialLocation || defaultLocation);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Reverse geocoding when position changes
  useEffect(() => {
    if (!onAddressDetected || !position) return;
    
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.latitude}&lon=${position.longitude}&format=json`);
        const data = await response.json();
        if (data && data.display_name) {
          onAddressDetected(data.display_name);
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
      }
    }, 1000); // Debounce to avoid spamming the API while dragging

    return () => clearTimeout(delayDebounceFn);
  }, [position, onAddressDetected]);

  useEffect(() => {
    setIsMounted(true);
    if (!initialLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newPos = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            setPosition(newPos);
            if (onLocationSelect) onLocationSelect(newPos);
          },
          (err) => {
            console.log('Geolocation error:', err.message);
            if (onLocationSelect) onLocationSelect(defaultLocation);
          },
          { timeout: 15000, maximumAge: 300000 } // Removed enableHighAccuracy for better desktop support
        );
      } else if (onLocationSelect) {
        onLocationSelect(defaultLocation);
      }
    }
  }, []);

  // Debounced search for autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim() || searchQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`);
        const data = await response.json();
        setSuggestions(data || []);
      } catch (error) {
        console.error('Suggestions error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      if (showSuggestions) {
        fetchSuggestions();
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, showSuggestions]);

  const handleSelectSuggestion = (item) => {
    setSearchQuery(item.display_name);
    setShowSuggestions(false);
    const newPos = { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) };
    setPosition(newPos);
    if (onLocationSelect) onLocationSelect(newPos);
  };

  const locateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setPosition(newPos);
          if (onLocationSelect) onLocationSelect(newPos);
        },
        (err) => alert(`No se pudo obtener tu ubicación: ${err.message}. Verifica los permisos de tu navegador o sistema.`),
        { timeout: 15000, maximumAge: 300000 }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  };

  if (!isMounted || typeof window === 'undefined') {
    return (
      <View className={cn("rounded-xl overflow-hidden items-center justify-center bg-gray-100", className)} style={{ height }}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </View>
    );
  }

  return (
    <View className={cn("flex-col gap-3", className)}>
      {/* Search Bar & Suggestions Container */}
      <View className="z-50" style={{ zIndex: 50 }}>
        <View className="flex-row items-center gap-2 relative z-50">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 h-12 border border-gray-200">
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={{ flex: 1, outlineStyle: 'none' }}
              className="h-full ml-2 text-base text-gray-900"
              placeholder="Buscar calle, sector o ciudad..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            {isSearching && <ActivityIndicator size="small" color="#f43f5e" />}
          </View>
          
          <TouchableOpacity 
            onPress={locateMe}
            className="w-12 h-12 bg-white rounded-xl items-center justify-center border border-gray-200 shadow-sm"
          >
            <Ionicons name="locate" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <View className="absolute top-14 left-0 right-14 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-hidden z-50">
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectSuggestion(item)}
                className={`p-3 px-4 flex-row items-center ${index < suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <Ionicons name="location-outline" size={18} color="#6B7280" style={{ marginRight: 10 }} />
                <Text className="text-sm text-gray-700 flex-1" numberOfLines={2}>
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Map */}
      <View className="rounded-xl overflow-hidden z-0" style={{ height }}>
        <MapContainer 
          center={[position.latitude, position.longitude]} 
          zoom={15} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={position} 
            setPosition={setPosition} 
            onLocationSelect={onLocationSelect} 
          />
        </MapContainer>
      </View>
    </View>
  );
};
