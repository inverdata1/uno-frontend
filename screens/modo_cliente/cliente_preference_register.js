import React, { useState } from 'react';
import {ScrollView, KeyboardAvoidingView ,SafeAreaView, View, Text, TextInput, TouchableOpacity, Platform, Alert } from 'react-native';
import { styles, dropdown } from '../style';
import { Ionicons } from '@expo/vector-icons';
import { MultiSelect } from 'react-native-element-dropdown';

const ClientePreferenceRegister = ({navigation}) => {

    const [preferences, setPreferences] = useState([]);
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
    // Función para seleccionar/deseleccionar todas las categorías
    const toggleSelectAll = () => {
        if (preferences.length === categories.length) {
            setPreferences([]); // Deseleccionar todas
        } else {
            const allValues = categories.map(category => category.value);
            setPreferences(allValues); // Seleccionar todas
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
                contentContainerStyle={styles.scrollContainer} // Add this style
                keyboardShouldPersistTaps="handled" // Helps with keyboard behavior
                keyboardDismissMode="interactive"
                >
                    {/*Top Section - Mode Title or Image Picker for Client Profile Picture*/}
                    <View style={styles.top}></View>
                    {/*Mid Section - Formulary*/}
                    <View style={styles.form}>
                        <Text style={styles.formHeader}>Selecciona tus preferencias</Text>
                        <TouchableOpacity 
                            style={dropdown.selectAllButton}
                            onPress={toggleSelectAll}
                        >
                            <Text style={dropdown.selectAllButtonText}>
                                {preferences.length === categories.length ? 
                                    'Deseleccionar todas' : 'Seleccionar todas'}
                            </Text>
                        </TouchableOpacity>
                        {/* Input Input preferencias cliente */}
                        <View style={styles.inputContainer}>
                            <MultiSelect
                                style={dropdown.dropdown}
                                activeColor='#c9c7c7'
                                placeholderStyle={dropdown.placeholderStyle}
                                selectedTextStyle={dropdown.selectedTextStyle}
                                iconStyle={dropdown.iconStyle}
                                data={categories}
                                labelField="label"
                                valueField="value"
                                placeholder="Seleccione una categoría"
                                value={preferences}
                                onFocus={() => setIsFocus(true)}
                                onBlur={() => setIsFocus(false)}
                                onChange={item => {
                                    setPreferences(item);
                                    
                                }}
                                renderRightIcon={() => (
                                    <Ionicons 
                                        name={isFocus ? "chevron-up-outline" : "chevron-down-outline"} 
                                        size={24} 
                                        color="#fefefe"
                                    />
                                )}
                                renderSelectedItem={(item, unSelect) => (
                                    <TouchableOpacity
                                        style={dropdown.selectedStyle}
                                        onPress={() => unSelect && unSelect(item)}
                                    >
                                        <Text style={dropdown.textSelectedStyle}>{item.label}</Text>
                                        <Ionicons name="close" size={18} color="#fefefe" />
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                        {/* Continue Register Button - To First Address Registry */}
                        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('NegocioAddressRegister')}>
                        <Text style={styles.loginButtonText}>Continuar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
export default ClientePreferenceRegister;