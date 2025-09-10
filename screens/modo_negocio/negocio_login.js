import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';
import { styles } from '../style';
import { Ionicons } from '@expo/vector-icons';

const NegocioLogin = ({navigation}) => {
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
      <View style={styles.containerInSAV}>      
        {/*Top Section - Mode Title*/}
        <View style={styles.top}> 
          <Text style={styles.modeText}>Modo Negocio</Text>
        </View>
        {/*Mid Section - Formulary*/}
        <View style={styles.form}>
          {/*Formulary Header Title*/}
          <Text style={styles.formHeader}> Inicio de sesión</Text>
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
          {/* Forgot Password */}
          <View style={styles.forgotContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('NegocioResetPassword')}>
              <Text style={styles.forgotPassword}>Olvidé mi contraseña</Text>
            </TouchableOpacity>
          </View>
          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>
          {/* Sign Up Prompt */}          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('NegocioRegister')}>
              <Text style={styles.signupLink}>Únete a UNO</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Bottom Section - Mode Changer */}
        <View style={styles.bottom}>
            <TouchableOpacity style={styles.switchModeButton} onPress={() => navigation.navigate('ClienteLogin')}>
              <Text style={styles.switchModeText}>Cambiar a Modo Cliente</Text>
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default NegocioLogin;