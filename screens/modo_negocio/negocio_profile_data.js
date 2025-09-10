import React, { useState } from 'react';
import {ScrollView, KeyboardAvoidingView ,SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, Modal, Platform, Alert } from 'react-native';
import { modal, styles, dropdown } from '../style';
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';

const NegocioProfileData = ({navigation}) => {

  const [category, setCategory] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  // Define las opciones del dropdown categoria de negocio
  const categories = [
    { label: 'Supermercado', value: 'Supermercado' },
    { label: 'Farmacia', value: 'Farmacia' },
    { label: 'Restaurante Gourmet', value: 'Restaurante Gourmet' },
    { label: 'Comida Rápida', value: 'Comida Rápida' },
    { label: 'Minimarket', value: 'Minimarket' },
    { label: 'Panadería', value: 'Panadería' },
    { label: 'Heladería', value: 'Heladería' },
    { label: 'Tecnología/Electrodomésticos', value: 'Tecnología/Electrodomésticos' },
    { label: 'Belleza y Bienestar', value: 'Belleza y Bienestar' },
    { label: 'Deporte/Fitness', value: 'Deporte/Fitness' },
    { label: 'Perfumería', value: 'Perfumería' },
    { label: 'Joyería', value: 'Joyería' },
    { label: 'Muebles', value: 'Muebles' },
    { label: 'Librería y Papelería', value: 'Librería y Papelería' },
    { label: 'Ropa', value: 'Ropa' },
    { label: 'Apparel Masculino', value: 'Apparel Masculino' },
    { label: 'Apparel Femenino', value: 'Apparel Femenino' },
  ];

  // Funciones para el botón de ingreso de imagen de perfil
  
  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Abrir modal
  const openImagePickerModal = () => {
    setModalVisible(true);
  };

// Elegir de la galería (versión modificada)
const pickImage = async () => {
  setModalVisible(false);
  
  // Pequeño retraso para asegurar que el modal se cierre completamente
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  } catch (error) {
    console.error("Error al abrir galería:", error);
    Alert.alert("Error", "No se pudo abrir la galería");
  }
};

  // Eliminar foto
  const removeImage = () => {
    setModalVisible(false);
    setImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.containerInSAV}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} // Add this style
          keyboardShouldPersistTaps="handled" // Helps with keyboard behavior
          keyboardDismissMode="interactive"
        >
          {/*Top Section - Mode Title or Image Picker for Client Profile Picture*/}
          <View style={styles.top2}> 
            <Text style={styles.modeText}>Modo Negocio</Text>
            {/* Sección para el Image Picker */}
            <View style={styles.imagePickerContainer}>
              <TouchableOpacity style={styles.imagePicker} onPress={openImagePickerModal}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.imagePicker}/>
                ) : (
                  <Ionicons name="image-outline" size={100} color="#fefefe"/>
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
            <Text style={styles.formHeader}>Registro de tu negocio</Text>
            {/* Input Nombre del negocio */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre de tu negocio</Text>
              <TextInput style={styles.input} placeholder="Ingrese el nombre de su negocio" placeholderTextColor="#fefefe"/>
            </View>
            {/* Input Descripción del negocio */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descripción del negocio</Text>
              <TextInput style={styles.input} placeholder="Ingrese una breve de su negocio" placeholderTextColor="#fefefe"/>
            </View>
            {/* Input RIF del negocio */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>RIF jurídico o personal</Text>
              <TextInput style={styles.input} placeholder="Ingrese su RIF" placeholderTextColor="#fefefe"/>
            </View>
            {/* Input categoría del negocio */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Categoría</Text>
              <Dropdown
                style={[dropdown.dropdown, isFocus && { borderColor: '#fefefe' }]}
                placeholderStyle={dropdown.placeholderStyle}
                selectedTextStyle={dropdown.selectedTextStyle}
                data={categories}
                maxHeight={125}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Seleccione una categoría' : '...'}
                value={category}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setCategory(item.value);
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
            {/* Continue Register Button - To First Address Registry */}
            <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('NegocioAddressRegister')}>
              <Text style={styles.loginButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottom}></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default NegocioProfileData;