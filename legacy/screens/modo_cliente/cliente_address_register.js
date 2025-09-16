import React, { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView, KeyboardAvoidingView, View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { address } from '../style';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as Location from 'expo-location';

const latitudeDelta = 0.01
const longitudeDelta = 0.01

const ClienteAddressRegister = ({ navigation }) => {
  const [mapRegion, setMapRegion] = useState({
    latitude: 10.65601955576213,
    longitude: -71.59391272380024,
    latitudeDelta,
    longitudeDelta,
  });
  
  const userLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permisos de acceso a ubicación del dispositivo denegados');
    }
    let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
    setMapRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta,
      longitudeDelta,
    });
  };

  useEffect(() => {
    userLocation();
  }, []);

  return (
    <SafeAreaView style={address.container}>
      <View style={address.mapContainer}>
        <MapView 
          style={address.map} 
          region={mapRegion} 
          showsUserLocation={true} 
          showsMyLocationButton={true} 
          provider={PROVIDER_GOOGLE}
          onRegionChangeComplete={(region) => setMapRegion(region)}
        >
          {/*
          <Marker
            coordinate={{
              latitude: mapRegion.latitude,
              longitude: mapRegion.longitude,
            }}
            title="Ubicación seleccionada"
            pinColor="#e50323"
          />*/}
        </MapView>
        {/* Custom center marker */}
        <View style={address.markerFixed}>
            <FontAwesome5 name="map-marker-alt" size={40} color="#e50323" />
        </View>
      </View>
      
      <View style={address.formContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={address.containerInSAV}
          keyboardVerticalOffset={Platform.OS === "ios" ? 256 : 0}
        >
          <ScrollView 
            style={address.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={address.form}>
              {/*Formulary Header Title*/}
              <Text style={address.formHeader}>Registra tu dirección</Text>
              
              {/* Name Input */}
              <View style={address.inputContainer}>
                <Text style={address.inputLabel}>Nombre</Text>
                <TextInput style={address.input} placeholder="Ej. Casa" placeholderTextColor="#fefefe" />
              </View>
              
              {/* Address Input */}
              <View style={address.inputContainer}>
                <Text style={address.inputLabel}>Dirección</Text>
                <TextInput style={address.input} placeholder="Dirección" placeholderTextColor="#fefefe" />
              </View>
              
              {/* City Input */}
              <View style={address.inputContainer}>
                <Text style={address.inputLabel}>Ciudad</Text>
                <TextInput style={address.input} placeholder="Ciudad" placeholderTextColor="#fefefe" />
              </View>
              
              {/* State Input */}
              <View style={address.inputContainer}>
                <Text style={address.inputLabel}>Estado</Text>
                <TextInput style={address.input} placeholder="Estado" placeholderTextColor="#fefefe" />
              </View>
              
              {/* Reference Point Input */}
              <View style={address.inputContainer}>
                <Text style={address.inputLabel}>Punto de referencia / Indicaciones</Text>
                <TextInput style={address.input} placeholder="Ej. Casa blanca con rejas" placeholderTextColor="#fefefe" />
              </View>
              
              {/* Save Address Button */}
              <TouchableOpacity style={address.SaveButton} onPress={() => navigation.navigate('ClientePreferenceRegister')}>
                <Text style={address.SaveButtonText}>Guardar dirección</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};
export default ClienteAddressRegister;