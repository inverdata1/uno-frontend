import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui';
import { colors } from '../../../../shared/utils/colors';

export const EditPersonalInfoModal = ({ visible, onClose, userData, onSave, isSaving }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (visible && userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setPhone(userData.phone || '');
    }
  }, [visible, userData]);

  const handleSave = () => {
    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light
        }}>
          <TouchableOpacity onPress={onClose} style={{ padding: 4 }} disabled={isSaving}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary }}>
            Información Personal
          </Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={isSaving || !firstName.trim()}
            style={{ padding: 4 }}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : (
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: !firstName.trim() ? colors.text.secondary : colors.primary[500] 
              }}>
                Guardar
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* First Name */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: 8 }}>
                Nombre
              </Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Ej. Juan"
                placeholderTextColor={colors.text.secondary}
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 15,
                  color: colors.text.primary,
                  borderWidth: 1,
                  borderColor: colors.border.light
                }}
              />
            </View>

            {/* Last Name */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: 8 }}>
                Apellido
              </Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Ej. Pérez"
                placeholderTextColor={colors.text.secondary}
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 15,
                  color: colors.text.primary,
                  borderWidth: 1,
                  borderColor: colors.border.light
                }}
              />
            </View>

            {/* Phone */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: 8 }}>
                Teléfono
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Ej. +584121234567"
                placeholderTextColor={colors.text.secondary}
                keyboardType="phone-pad"
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 15,
                  color: colors.text.primary,
                  borderWidth: 1,
                  borderColor: colors.border.light
                }}
              />
            </View>
            
            {/* Read-only info message */}
            <View style={{ marginTop: 10, padding: 16, backgroundColor: colors.bg.secondary, borderRadius: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <Ionicons name="information-circle-outline" size={20} color={colors.text.secondary} />
                <Text style={{ flex: 1, fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
                  El correo electrónico asociado a tu cuenta es {userData?.email}. Para cambiarlo debes contactar al soporte técnico por motivos de seguridad.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};
