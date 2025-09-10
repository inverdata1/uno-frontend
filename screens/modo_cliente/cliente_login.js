import React, { useState } from "react";
import { View, SafeAreaView, Text, TextInput, TouchableOpacity, Image,  Alert } from 'react-native';
import { styles } from '../style';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH } from "../../services/firebaseConfig";
import { signInWithEmailAndPassword } from 'firebase/auth';

const ClienteLogin = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  //Funciones para botones de mostrar/ocultar contrasenias
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
  });
  const toggleVisibility = (field) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };
  //Funcion Login correo/contrasenia Firebase
  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert(
      'Error', 
      'Por favor ingresa tu correo y contraseña',
      [{ text: 'OK' }], // Botón explícito
      { cancelable: false } // Evita que se cierre tocando fuera
    );
    return;
  }setLoading(true);
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      // Navegar a la pantalla de inicio después de login exitoso
      navigation.navigate('ClienteHomeScreen');
    } catch (error) {
      let errorMessage = 'Error al iniciar sesión';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Usuario deshabilitado';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Usuario no encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Correo y/o contraseña incorrectas';
          break;
        default:
          errorMessage = error.message;
      }
      Alert.alert(
      'Error', 
        errorMessage,
        [{ text: 'OK' }],
        { cancelable: false }
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.containerInSAV}>
          {/*Top Section - Mode Title*/}
          <View style={styles.top}>
            <Text style={styles.modeText}>Modo Cliente</Text>
          </View>
          {/*Mid Section - Formulary*/}
          <View style={styles.form}>
            {/*Formulary Header Title*/}
            <Text style={styles.formHeader}> Inicio de sesión</Text>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ingrese su correo electrónico" 
                placeholderTextColor="#fefefe"                   
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>
            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ingrese su contraseña" 
                  placeholderTextColor="#fefefe"
                  autoCorrect={false}
                  secureTextEntry={!passwordVisibility.password}
                  value={password}
                  onChangeText={setPassword}
                />                
                <TouchableOpacity onPress={() => toggleVisibility("password")} style={styles.iconContainer}>
                  <Ionicons name={passwordVisibility.password ? "eye-outline" : "eye-off-outline"} size={24} color="#fefefe"/>
                </TouchableOpacity>
              </View>
            </View>
            {/* Forgot Password */}
            <View style={styles.forgotContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('ClienteResetPassword')}>
                <Text style={styles.forgotPassword}>Olvidé mi contraseña</Text>
              </TouchableOpacity>
            </View>
            {/* Login Button */}
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Cargando...' : 'Iniciar sesión'}
              </Text>
            </TouchableOpacity>
            {/* Sign Up Prompt */}          
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('ClienteRegister')}>
                <Text style={styles.signupLink}>Regístrate</Text>
              </TouchableOpacity>
            </View>
            {/* Google Login */}
            <TouchableOpacity style={styles.googleButton}>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={styles.googleIcon}/>
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </TouchableOpacity>
          </View>
          {/* Bottom Section - Mode Changer */}
          <View style={styles.bottom}>
              <TouchableOpacity style={styles.switchModeButton} onPress={() => navigation.navigate('NegocioLogin')}>
                <Text style={styles.switchModeText}>Cambiar a Modo Negocio</Text>
              </TouchableOpacity>
          </View>
        </View>
    </SafeAreaView>
  );
};
export default ClienteLogin;