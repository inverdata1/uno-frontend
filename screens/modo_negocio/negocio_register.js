import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { styles, international_phone_input } from '../style';
import { Ionicons } from "@expo/vector-icons";
import PhoneInput from 'react-native-international-phone-number';

const NegocioRegister = ({navigation}) => {
  // Estados para el phone input
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  // Función para manejar cambios en el número de teléfono
  const handlePhoneChange = (number) => {
    setPhoneNumber(number);
  };
  // Función para manejar cambios en el país seleccionado
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
  };
  //Funciones para botones de mostrar/ocultar contrasenias
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const toggleVisibility = (field) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.containerInSAV}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/*Top Section*/}
          <View style={styles.top}> 
            <Text style={styles.modeText}>Modo Negocio</Text>
          </View>
          {/*Formulary / Mid Section*/}
          <View style={styles.form}>
            {/*Formulary Header Title*/}
            <Text style={styles.formHeader}>Registro de tu negocio</Text>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre y apellido</Text>
              <TextInput style={styles.input} placeholder="Nombre y apeliddo" placeholderTextColor="#fefefe"/>
            </View>      
            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Teléfono de contacto</Text>
                <PhoneInput
                language="es"
                value={phoneNumber}
                onChangePhoneNumber={handlePhoneChange}
                selectedCountry={selectedCountry}
                onChangeSelectedCountry={handleCountryChange}
                defaultCountry="MX"
                placeholder="Ingrese su número"
                placeholderTextColor="#fefefe"
                phoneInputStyles={international_phone_input}
                />            
            </View>      
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <TextInput style={styles.input} 
                placeholder="Ingrese su correo electrónico" 
                placeholderTextColor="#fefefe" 
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>      
            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} placeholder="Ingrese su contraseña" placeholderTextColor="#fefefe" secureTextEntry={!passwordVisibility.password}/>
                <TouchableOpacity onPress={() => toggleVisibility("password")} style={styles.iconContainer}>
                  <Ionicons name={passwordVisibility.password ? "eye-outline" : "eye-off-outline"} size={24} color="#fefefe"/>
                </TouchableOpacity>
              </View>
            </View>
            {/* Verify Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmar contraseña</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} placeholder="Confirme su contraseña" placeholderTextColor="#fefefe" secureTextEntry={!passwordVisibility.confirmPassword}/>
                <TouchableOpacity onPress={() => toggleVisibility("confirmPassword")} style={styles.iconContainer}>
                  <Ionicons name={passwordVisibility.confirmPassword ? "eye-outline" : "eye-off-outline"} size={24} color="#fefefe"/>
                </TouchableOpacity>
              </View>        
            </View>   
            {/* Continue Button */}
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText} onPress={() => navigation.navigate('NegocioProfileData')}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default NegocioRegister;