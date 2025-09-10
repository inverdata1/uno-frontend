import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';
import { styles } from '../style';

const PartnerResetPassword = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerInSAV}>
        {/*Top Section - Mode Title*/}
        <View style={styles.top}> 
          <Text style={styles.modeText}>Modo Negocio</Text>
        </View>
        {/*Mid Section - Formulary*/}
        <View style={styles.form}>
          {/*Formulary Header Title and Explanation of Password Recovery*/}
          <Text style={styles.formHeader}>Recuperar contraseña</Text>
          <Text style={styles.resetPasswordText}>Te enviaremos un enlace para reestablecer tu contraseña al correo proporcionado</Text>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Correo registrado en UNO</Text>
            <TextInput style={styles.input} placeholder="Ingrese su correo electrónico" placeholderTextColor="#fefefe" keyboardType="email-address"/>
          </View>
          {/* Request Pssword Re */}
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Solicitar correo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default PartnerResetPassword;