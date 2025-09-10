import React, { useState } from 'react';
import {ScrollView ,SafeAreaView, KeyboardAvoidingView, View, Text, TextInput, TouchableOpacity, Image, Modal, Platform, Alert} from 'react-native';
import { modal, styles, international_phone_input } from '../style';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as ImagePicker from "expo-image-picker";
import {FontAwesome, Ionicons } from '@expo/vector-icons';
import PhoneInput from 'react-native-international-phone-number';
import * as FileSystem from 'expo-file-system';
import { doc, setDoc } from 'firebase/firestore';
import { db } from "../../services/firebaseConfig";

const ClienteProfileData = ({navigation, route}) => {
  // EStado de carga (Deshabilitar Touchable Opacity "Continuar" mientras se ejeuta el registro)
  const [loading, setLoading] = useState(false);
  // Obtener parámetros de navegación
  const { userId, userEmail, userPassword } = route.params;
  // Estado para nombre completo
  const [fullName, setFullName] = useState('');
  // Estados para el phone input
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [phoneNumberE164, setPhoneNumberE164] = useState('');
  // Función para manejar cambios en el número de teléfono y 
  const handlePhoneChange = (number) => {
    setPhoneNumber(number);
    if (selectedCountry) {
      const e164Number = `${selectedCountry.callingCode}${number.replace(/\D/g, '')}`;
      setPhoneNumberE164(e164Number);
    }
  };
  // Función para manejar cambios en el país seleccionado
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
  };
  // Funciones para manejo del botón de selección de fecha de nacimiento
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [date, setDate] = useState(null);
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
  };
  // Funciones para el botón de ingreso de imagen de perfil
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null); // Nuevo estado para Base64
  const [modalVisible, setModalVisible] = useState(false);
  // Abrir modal
  const openImagePickerModal = () => {
    setModalVisible(true);
  };
  // Tomar foto con la cámara
  const takePhoto = async () => {
    setModalVisible(false);
    // Pequeño retraso para asegurar que el modal se cierre completamente
    await new Promise(resolve => setTimeout(resolve, 500));
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a la cámara para tomar fotos.");
      return;
    }
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.25,
      }); 
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setImage(result.assets[0].uri); // Solo URI para la vista previa
        setImageBase64(`data:image/jpeg;base64,${base64}`); // Base64 para Firestore
      }
    } catch (error) {
      console.error("Error al abrir cámara:", error);
      Alert.alert("Error", "No se pudo abrir la cámara",error);
    }
  };
  // Elegir de la galería
  const pickImage = async () => {
    setModalVisible(false);
    // Pequeño retraso para asegurar que el modal se cierre completamente
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.25,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setImage(result.assets[0].uri); // Solo URI para la vista previa
        setImageBase64(`data:image/jpeg;base64,${base64}`); // Base64 para Firestore
      }
    } catch (error) {
      console.error("Error al abrir galería:", error);
      Alert.alert("Error", "No se pudo abrir la galería", error);
    }
  };
  // Eliminar foto
  const removeImage = () => {
    setImage(null);
    setModalVisible(false);
  };
  // Función para guardar datos
  const saveProfileData = async () => {
    const userDoc = doc(db, 'Clientes', userId);
    const fechaSinHora = date.toISOString().split('T')[0];
    await setDoc(userDoc, {
      uid: userId,
      correo: userEmail,
      clave: userPassword,
      nombre: fullName,
      telefono: phoneNumberE164,
      fechaNacimiento: fechaSinHora,
      imagenPerfil: imageBase64
    });
  };
  // Función handleContinue
  const handleContinue = async () => {
    setLoading(true);
    if (!fullName || !phoneNumberE164 || !date) {
      setLoading(false);
      Alert.alert(
        "Error", 
        "Por favor completa todos los campos",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }
    try {
      await saveProfileData();
      navigation.navigate('ClienteAddressRegister');
    } catch (error) {
      setLoading(false);
      errorMessage = error.message;
      Alert.alert(
        "Error", 
        "No se pudo guardar el perfil "+errorMessage,
        [{ text: "OK" }],
        { cancelable: false }
      );
    }
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
          {/*Top Section - Mode Title or Image Picker for Client Profile Picture*/}
          <View style={styles.top2}> 
            <Text style={styles.modeText}>Modo Cliente</Text>
            {/* Sección para el Image Picker */}
            <View style={styles.imagePickerContainer}>
              <TouchableOpacity style={styles.imagePicker} onPress={openImagePickerModal}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.imagePicker}/>
                ) : (
                  <FontAwesome name="user" size={100} color="#fefefe"/>
                )}
              </TouchableOpacity>
            </View>
          </View>
          {/* Modal para selección de imagen */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={modal.modalContainer}>
              <View style={modal.modalContent}>
                <Text style={modal.modalTitle}>Seleccionar imagen de perfil</Text>
                
                <TouchableOpacity 
                  style={modal.modalButton}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera" size={24} color="black" />
                  <Text style={modal.modalButtonText}>Tomar una foto</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={modal.modalButton}
                  onPress={pickImage}
                >
                  <Ionicons name="image" size={24} color="black" />
                  <Text style={modal.modalButtonText}>Elegir de la galería</Text>
                </TouchableOpacity>
                
                {image && (
                  <TouchableOpacity 
                    style={[modal.modalButton, { borderColor: 'red' }]}
                    onPress={removeImage}
                  >
                    <Ionicons name="trash" size={24} color="red" />
                    <Text style={[modal.modalButtonText, { color: 'red' }]}>Eliminar foto</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[modal.modalButton, { marginTop: 20 }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={modal.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/*Mid Section - Formulary*/}
          <View style={styles.form}>
            <Text style={styles.formHeader}>Registrar datos personales</Text>
            {/* Client's Fullname Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre completo</Text>
              <TextInput style={styles.input} placeholder="Ingrese su nombre y apellido" placeholderTextColor="#fefefe" value={fullName} onChangeText={setFullName}/>
            </View>
            {/* Client's Phone Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Número de teléfono</Text>
              <PhoneInput
                language='es'
                value={phoneNumber}
                onChangePhoneNumber={handlePhoneChange}
                selectedCountry={selectedCountry}
                onChangeSelectedCountry={handleCountryChange}
                defaultCountry="MX"
                placeholder="Ingrese su número"
                placeholderTextColor="#fefefe"
                phoneInputStyles={international_phone_input}
                allowZeroAfterCallingCode={false}
              />
            </View>
            {/* Client's Birthday Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Fecha de nacimiento</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} placeholder="DD/MM/AAAA" placeholderTextColor="#fefefe" value={date ? date.toLocaleDateString() : ""} editable={false}/>
                <TouchableOpacity style={styles.iconContainer} onPress={showDatePicker}>
                  <Ionicons name="calendar-outline" size={24} color="#fefefe" />
                </TouchableOpacity>
              </View>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                themeVariant="light"
                date={date || new Date()}
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
              />          
            </View>
            {/* Continue Register Button - To First Address Registry */}
            <TouchableOpacity style={styles.loginButton} onPress={handleContinue} disabled={loading}>
              <Text style={styles.loginButtonText}>{loading ? 'Cargando...' : 'Continuar'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default ClienteProfileData;