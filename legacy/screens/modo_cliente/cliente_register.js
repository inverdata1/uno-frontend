import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { styles } from '../style';
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../services/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";

const ClienteRegister = ({navigation}) => {
  // Estados para el correo y clave a registrar por el usuario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // EStado de carga (Deshabilitar Touchable Opacity "Continuar" mientras se ejeuta el registro)
  const [loading, setLoading] = useState(false);
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
  //Función para manejar el registro de los datos del formulario
  const handleSignUp = async () => {
  setLoading(true);
  // Validaciones básicas
  if (!email || !password || !confirmPassword) {
    setLoading(false);
    Alert.alert(
      "Error", 
      "Por favor completa todos los campos",
      [{ text: "OK" }],
      { cancelable: false }
    );
    return;
  }
  //Validar que la contraseña y la verificación sean iguales
  if (password !== confirmPassword) {
    setLoading(false);
    Alert.alert(
      "Error", 
      "Las contraseñas no coinciden",
      [{ text: "OK" }],
      { cancelable: false }
    );
    return;
  }
  // Validar que la contraseña no contenga espacios
  if (/\s/.test(password)) {
    setLoading(false);
    Alert.alert(
      "Contraseña inválida", 
      "La contraseña no puede contener espacios en blanco",
      [{ text: "OK" }],
      { cancelable: false }
    );
    return;
  }
  // Validaciones avanzadas de contraseña
  if (password.length < 12) {
    setLoading(false);
    Alert.alert(
      "Contraseña demasiado corta", 
      "La contraseña debe tener al menos 12 caracteres",
      [{ text: "OK" }],
      { cancelable: false }
    );
    return;
  }
  if (!/\d/.test(password)) {
    setLoading(false);
    Alert.alert(
      "Contraseña inválida", 
      "La contraseña debe incluir al menos un número",
      [{ text: "OK" }],
      { cancelable: false }
    );
    return;
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    setLoading(false);
    Alert.alert(
      "Contraseña inválida", 
      "La contraseña debe incluir al menos un carácter especial",
      [{ text: "OK" }],
      { cancelable: false }
    );
    return;
  }
  try {
    // Crear usuario en Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Navegar a la siguiente pantalla si el registro es exitoso
    navigation.navigate('ClienteProfileData', { userId: user.uid, userEmail: email, userPassword: password});
  } catch (error) {
    setLoading(false);
    let errorMessage = "Ocurrió un error al registrar";
    // Manejo de errores comunes
      switch(error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "El correo electrónico ya está en uso";
          break;
        case 'auth/invalid-email':
          errorMessage = "El correo electrónico no es válido";
          break;
        case 'auth/weak-password':
          // Este error ya no debería ocurrir gracias a nuestras validaciones previas
          errorMessage = "La contraseña no cumple con los requisitos de seguridad";
          break;
        default:
          errorMessage = error.message;
      }
      Alert.alert(
        "Error", 
        errorMessage,
        [{ text: "OK" }],
        { cancelable: false }
      );
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerInSAV}>
        {/*Sección superior*/}
        <View style={styles.top}> 
          <Text style={styles.modeText}>Modo Cliente</Text>
        </View>
        {/*Formulario / Sección Central*/}
        <View style={styles.form}>         
          {/*Título para encabezado de formulario*/}
          <Text style={styles.formHeader}>Crear cuenta</Text>
          {/* Input Correo Electrónico */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <TextInput style={styles.input} 
              placeholder="Ingrese su correo electrónico" 
              placeholderTextColor="#fefefe" 
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>      
          {/* Input Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input} 
                placeholder="Ingrese su contraseña" 
                placeholderTextColor="#fefefe" 
                secureTextEntry={!passwordVisibility.password}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => toggleVisibility("password")} style={styles.iconContainer}>
                <Ionicons name={passwordVisibility.password ? "eye-outline" : "eye-off-outline"} size={24} color="#fefefe"/>
              </TouchableOpacity>
            </View>
          </View>
          {/* Input Contraseña repetida */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirmar contraseña</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input}
                placeholder="Confirme su contraseña"
                placeholderTextColor="#fefefe"
                secureTextEntry={!passwordVisibility.confirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => toggleVisibility("confirmPassword")} style={styles.iconContainer}>
                <Ionicons name={passwordVisibility.confirmPassword ? "eye-outline" : "eye-off-outline"} size={24} color="#fefefe"/>
              </TouchableOpacity>
            </View>        
          </View>   
          {/* Botón Continuar a ClienteProfileData (cliente_profile_data.js) */}
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Cargando...' : 'Continuar'}
            </Text>
          </TouchableOpacity>
          {/* Botón de SocialAuth por Cuenta de Google */}
          <TouchableOpacity style={styles.googleButton}>
            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={styles.googleIcon}/>
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default ClienteRegister;