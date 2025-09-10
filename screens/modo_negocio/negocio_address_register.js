import React , { useState, useEffect } from 'react';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import { SafeAreaView, KeyboardAvoidingView, View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { address, dropdown, styles } from '../style';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Dropdown } from 'react-native-element-dropdown';

const latitudeDelta = 0.025
const longitudeDelta = 0.025

const NegocioAddressRegister = ({navigation}) => {
  const [branch, setBranch] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  // Define las opciones del dropdown Tipo de sucursal
  const categories = [
    { label: 'Principal', value: 'Principal' },
    { label: 'Secundaria', value: 'Secundaria' },
  ];

  const [mapRegion, setMapRegion] = useState({
    latitude: 10.65601955576213,
    longitude: -71.59391272380024,
    latitudeDelta,
    longitudeDelta,
  });
  const userLocation = async () => {
    let {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted'){
      setErrorMsg('Permisos de acceso a ubicación del dispositivo denegados')
    }
    let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
    setMapRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta,
      longitudeDelta,
    });
  }

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
              {/* Input nombre de sucursal */}
              <View style={address.inputContainer}>
                <Text style={address.inputLabel}>Nombre de la sucursal</Text>
                <TextInput style={address.input} placeholder="Ej. Arturos - Calle 72" placeholderTextColor="#fefefe"/>
              </View>
              {/* Input tipo sucursal */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tipo de sucursal</Text>
                <Dropdown
                  style={[dropdown.dropdown, isFocus && { borderColor: '#fefefe' }]}
                  placeholderStyle={dropdown.placeholderStyle}
                  selectedTextStyle={dropdown.selectedTextStyle}
                  data={categories}
                  maxHeight={125}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? 'Seleccione una categoría' : '...'}
                  value={branch}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setBranch(item.value);
                    setIsFocus(false);
                  }}
                  renderRightIcon={() => (
                    <Ionicons 
                      name={isFocus ? "chevron-up-outline" : "chevron-down-outline"} 
                      size={24} 
                      color="#fefefe"
                    />
                  )}
                />
              </View>
              {/*Input direccion de sucursal */}
              <View style={address.inputContainer}>
                <Text style={address.inputLabel}>Dirección</Text>
                <TextInput style={address.input} placeholder="Dirección" placeholderTextColor="#fefefe"/>
              </View>
              {/*Input direccion de sucursal - Ciudad */}
              <View style={address.inputContainer}>
                <Text style={address.inputLabel}>Ciudad</Text>
                <TextInput style={address.input} placeholder="Ciudad" placeholderTextColor="#fefefe"/>
              </View>
              {/*Input direccion de sucursal - Estado */}
              <View style={address.inputContainer}>
                <Text style={address.inputLabel}>Estado</Text>
                <TextInput style={address.input} placeholder="Estado" placeholderTextColor="#fefefe"/>
              </View>
              {/*Input direccion de sucursal - Punto referencia */}
              <View style={address.inputContainer}>
                <Text style={address.inputLabel}>Punto de referencia</Text>
                <TextInput style={address.input} placeholder="Ej. Casa blanca con rejas" placeholderTextColor="#fefefe"/>
              </View>
              {/* Save Address Button */}
              <TouchableOpacity style={address.SaveButton}>
                <Text style={address.SaveButtonText}>Guardar dirección</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};
export default NegocioAddressRegister