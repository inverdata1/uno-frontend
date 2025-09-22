import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';
import { styles } from '../style';

const ClienteHomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerInSAV}>  
        <Text>Si estás en esta pantalla el login de cliente funciona y/o el proceso de regsitro completo funciona</Text>
      </View> 
    </SafeAreaView>
  );
};
export default ClienteHomeScreen;