import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../../shared/components/ui';
import { colors } from '../../../../shared/utils/colors';
import { MapPicker } from '../../../../shared/components/ui/map-picker';

export const EditProfileModal = ({ visible, onClose, businessData, onSave, isSaving }) => {
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'location'
  
  // Tab 1: Info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phone, setPhone] = useState('');
  
  // Tab 2: Location
  const [address, setAddress] = useState('');
  
  // Time pickers for business hours
  const [openTime, setOpenTime] = useState(new Date());
  const [closeTime, setCloseTime] = useState(new Date());
  const [showOpenPicker, setShowOpenPicker] = useState(false);
  const [showClosePicker, setShowClosePicker] = useState(false);
  
  const [coordinates, setCoordinates] = useState(null);

  // Business categories
  const categories = [
    { id: 'restaurant', label: 'Restaurante', icon: 'restaurant' },
    { id: 'store', label: 'Tienda', icon: 'storefront' },
    { id: 'pharmacy', label: 'Farmacia', icon: 'medical' },
    { id: 'market', label: 'Mercado', icon: 'cart' },
    { id: 'bakery', label: 'Panadería', icon: 'cafe' },
    { id: 'technology', label: 'Tecnología', icon: 'phone-portrait' },
    { id: 'other', label: 'Otro', icon: 'ellipsis-horizontal' },
  ];

  useEffect(() => {
    if (visible && businessData) {
      setName(businessData.businessName || businessData.name || '');
      setDescription(businessData.description || '');
      setCategory(businessData.category || '');
      setBusinessType(businessData.businessType || '');
      setPhone(businessData.phone || '');
      setAddress(businessData.address || '');
      setCoordinates(businessData.coordinates || null);

      if (businessData.businessHours) {
        // Expected format: "09:00 AM - 10:00 PM"
        try {
          const parts = businessData.businessHours.split(' - ');
          if (parts.length === 2) {
            const parseTime = (timeStr) => {
              const [time, period] = timeStr.split(' ');
              let [hours, minutes] = time.split(':').map(Number);
              if (period === 'PM' && hours !== 12) hours += 12;
              if (period === 'AM' && hours === 12) hours = 0;
              const date = new Date();
              date.setHours(hours, minutes, 0, 0);
              return date;
            };
            setOpenTime(parseTime(parts[0]));
            setCloseTime(parseTime(parts[1]));
          }
        } catch(e) {}
      }
    }
  }, [visible, businessData]);

  const handleSave = () => {
    onSave({
      businessName: name.trim(),
      description: description.trim(),
      category: category.trim(),
      businessType: businessType.trim(),
      phone: phone.trim(),
      address: address.trim(),
      businessHours: `${openTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${closeTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
      coordinates: coordinates,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1, backgroundColor: colors.bg.primary }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Editar Perfil</Text>
            
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={isSaving}
              style={styles.headerButton}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.primary[500]} />
              ) : (
                <Text style={styles.saveText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'info' && styles.activeTab]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
                Datos Básicos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'location' && styles.activeTab]}
              onPress={() => setActiveTab('location')}
            >
              <Text style={[styles.tabText, activeTab === 'location' && styles.activeTabText]}>
                Ubicación y Horario
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            {activeTab === 'info' ? (
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nombre del Negocio</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ej. El Buen Sabor"
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tipo de Negocio</Text>
                  <TextInput
                    style={styles.input}
                    value={businessType}
                    onChangeText={setBusinessType}
                    placeholder="Ej. Venta minorista, Servicios"
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={styles.label}>Categoría</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, color: colors.text.tertiary, marginRight: 4 }}>
                        Desliza
                      </Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.text.tertiary} />
                    </View>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 16 }}
                  >
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategory(cat.id)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderRadius: 20,
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          marginRight: 8,
                          backgroundColor: category === cat.id ? colors.primary[500] : colors.bg.secondary,
                          borderWidth: 1,
                          borderColor: category === cat.id ? colors.primary[500] : colors.border.light,
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={cat.icon}
                          size={16}
                          color={category === cat.id ? colors.text.inverse : colors.text.secondary}
                        />
                        <Text
                          style={{
                            marginLeft: 6,
                            fontSize: 14,
                            fontWeight: '500',
                            color: category === cat.id ? colors.text.inverse : colors.text.secondary,
                          }}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Teléfono de Contacto</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Ej. 0412 1234567"
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Descripción</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Cuenta un poco sobre tu negocio..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Horario de Atención</Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      style={[styles.input, { flex: 1, alignItems: 'center' }]}
                      onPress={() => setShowOpenPicker(true)}
                    >
                      <Text style={{ color: colors.text.secondary }}>Abre:</Text>
                      <Text style={{ color: colors.text.primary, fontWeight: '600', marginTop: 4 }}>
                        {openTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.input, { flex: 1, alignItems: 'center' }]}
                      onPress={() => setShowClosePicker(true)}
                    >
                      <Text style={{ color: colors.text.secondary }}>Cierra:</Text>
                      <Text style={{ color: colors.text.primary, fontWeight: '600', marginTop: 4 }}>
                        {closeTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {showOpenPicker && (
                    <DateTimePicker
                      value={openTime}
                      mode="time"
                      display="default"
                      onChange={(event, date) => {
                        setShowOpenPicker(Platform.OS === 'ios');
                        if (date) setOpenTime(date);
                      }}
                    />
                  )}
                  {showClosePicker && (
                    <DateTimePicker
                      value={closeTime}
                      mode="time"
                      display="default"
                      onChange={(event, date) => {
                        setShowClosePicker(Platform.OS === 'ios');
                        if (date) setCloseTime(date);
                      }}
                    />
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Dirección</Text>
                  <TextInput
                    style={[styles.input, { marginBottom: 12 }]}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Ej. Av. Principal, Local 4..."
                    placeholderTextColor={colors.text.tertiary}
                  />
                  <Text style={styles.label}>Ubicación en el Mapa</Text>
                  <MapPicker
                    initialLocation={coordinates}
                    onLocationSelect={(loc) => {
                      setCoordinates(loc);
                      if (loc.address) {
                        setAddress(loc.address);
                      }
                    }}
                    height={250}
                    instructionText="Toca en el mapa para seleccionar la ubicación exacta de tu negocio"
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerButton: {
    minWidth: 70,
  },
  cancelText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary[500],
    textAlign: 'right',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary[500],
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.primary[500],
  },
  formSection: {
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
});
