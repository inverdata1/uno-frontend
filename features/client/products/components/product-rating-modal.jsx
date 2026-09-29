import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui/text';
import { apiClient } from '../../../../shared/config/api-client';
import { useAuthStore } from '../../../../core/auth/stores/auth-store';

/**
 * ProductRatingModal
 * Interactive 0.5 - 5.0 star rating modal with purchase verification
 */
export default function ProductRatingModal({
  visible,
  onClose,
  productId,
  productName,
  onRatingSuccess
}) {
  const { user } = useAuthStore();
  const [rating, setRating] = useState(5.0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState({
    loading: true,
    canRate: false,
    message: '',
    purchaseCount: 0,
    ratingCount: 0
  });

  useEffect(() => {
    if (visible && productId && user?.id) {
      checkEligibility();
    }
  }, [visible, productId, user?.id]);

  const checkEligibility = async () => {
    setEligibility(prev => ({ ...prev, loading: true }));
    try {
      const res = await apiClient.get(`/products/${productId}/rating-eligibility`, {
        params: { userId: user.id }
      });
      setEligibility({
        loading: false,
        canRate: res.data.canRate,
        message: res.data.message || '',
        purchaseCount: res.data.purchaseCount || 0,
        ratingCount: res.data.ratingCount || 0,
        existingRating: res.data.existingRating
      });

      if (res.data.existingRating?.rating) {
        setRating(Number(res.data.existingRating.rating));
      }
      if (res.data.existingRating?.comment) {
        setComment(res.data.existingRating.comment);
      }
    } catch (err) {
      setEligibility({
        loading: false,
        canRate: false,
        message: 'No se pudo verificar la elegibilidad para calificar.',
        purchaseCount: 0,
        ratingCount: 0
      });
    }
  };

  const handleStarPress = (starIndex, isHalf = false) => {
    const value = starIndex + (isHalf ? 0.5 : 1.0);
    setRating(value);
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Iniciar Sesión', 'Debes iniciar sesión para calificar este producto.');
      return;
    }

    if (!eligibility.canRate) {
      Alert.alert('No Disponible', eligibility.message);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.post(`/products/${productId}/rate`, {
        userId: user.id,
        rating,
        comment: comment.trim()
      });

      setIsSubmitting(false);
      Alert.alert('¡Muchas Gracias!', res.data?.message || 'Tu calificación se guardó correctamente.');
      onRatingSuccess?.(res.data);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      const errMsg = err.response?.data?.message || 'Ocurrió un error al enviar tu calificación.';
      Alert.alert('Error', errMsg);
    }
  };

  const getScoreLabel = (score) => {
    if (score >= 4.5) return '¡Excelente! ⭐⭐⭐⭐⭐';
    if (score >= 4.0) return 'Muy Bueno ⭐⭐⭐⭐';
    if (score >= 3.0) return 'Bueno ⭐⭐⭐';
    if (score >= 2.0) return 'Regular ⭐⭐';
    return 'Malo ⭐';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            width: '100%',
            maxWidth: 400,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 8
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 14,
              borderBottomWidth: 1,
              borderBottomColor: '#f1f5f9'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="star" size={22} color="#fbbf24" />
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#0f172a' }}>
                  Calificar Producto
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#f1f5f9',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {/* Product title */}
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', textAlign: 'center', marginBottom: 4 }}>
                {productName}
              </Text>

              {eligibility.loading ? (
                <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#ef4444" />
                  <Text style={{ marginTop: 12, color: '#64748b', fontSize: 13 }}>
                    Verificando compras del producto...
                  </Text>
                </View>
              ) : !eligibility.canRate ? (
                // Ineligible Banner (Not purchased or already reviewed this purchase)
                <View style={{
                  backgroundColor: '#fef2f2',
                  borderWidth: 1,
                  borderColor: '#fecaca',
                  borderRadius: 16,
                  padding: 16,
                  alignItems: 'center',
                  marginVertical: 12
                }}>
                  <Ionicons name="shield-checkmark-outline" size={32} color="#ef4444" style={{ marginBottom: 8 }} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#991b1b', textAlign: 'center', marginBottom: 6 }}>
                    Calificaciones Verificadas
                  </Text>
                  <Text style={{ fontSize: 13, color: '#7f1d1d', textAlign: 'center', lineHeight: 18 }}>
                    {eligibility.message}
                  </Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={{
                      marginTop: 14,
                      backgroundColor: '#ef4444',
                      paddingHorizontal: 20,
                      paddingVertical: 9,
                      borderRadius: 12
                    }}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>
                      Entendido
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Rating Form (Eligible User)
                <View>
                  {/* Rating Score Banner */}
                  <View style={{ alignItems: 'center', marginVertical: 14 }}>
                    <Text style={{ fontSize: 36, fontWeight: '900', color: '#0f172a' }}>
                      {rating.toFixed(1)}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#ef4444', marginTop: 2 }}>
                      {getScoreLabel(rating)}
                    </Text>
                  </View>

                  {/* Interactive Star Buttons */}
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 16
                  }}>
                    {[0, 1, 2, 3, 4].map((starIndex) => {
                      const isFull = rating >= starIndex + 1;
                      const isHalf = rating >= starIndex + 0.5 && rating < starIndex + 1;

                      return (
                        <View key={starIndex} style={{ flexDirection: 'row' }}>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleStarPress(starIndex, false)}
                            style={{ padding: 4 }}
                          >
                            <Ionicons
                              name={isFull ? 'star' : isHalf ? 'star-half' : 'star-outline'}
                              size={34}
                              color="#fbbf24"
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>

                  {/* Half-star Quick Selector Pills */}
                  <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 6,
                    marginBottom: 18
                  }}>
                    {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((val) => {
                      const isSelected = rating === val;
                      return (
                        <TouchableOpacity
                          key={val}
                          onPress={() => setRating(val)}
                          activeOpacity={0.8}
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12,
                            backgroundColor: isSelected ? '#0f172a' : '#f1f5f9',
                          }}
                        >
                          <Text style={{
                            fontSize: 11,
                            fontWeight: isSelected ? '800' : '600',
                            color: isSelected ? '#ffffff' : '#475569'
                          }}>
                            ⭐ {val.toFixed(1)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Comment Input */}
                  <View style={{ marginBottom: 18 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 6 }}>
                      Comentario (opcional)
                    </Text>
                    <TextInput
                      value={comment}
                      onChangeText={setComment}
                      placeholder="¿Qué te pareció el sabor, calidad o presentación?"
                      placeholderTextColor="#94a3b8"
                      multiline
                      numberOfLines={3}
                      style={{
                        backgroundColor: '#f8fafc',
                        borderWidth: 1,
                        borderColor: '#e2e8f0',
                        borderRadius: 14,
                        padding: 12,
                        fontSize: 13,
                        color: '#0f172a',
                        textAlignVertical: 'top',
                        minHeight: 70
                      }}
                    />
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: '#ef4444',
                      borderRadius: 16,
                      paddingVertical: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#ef4444',
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 3
                    }}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '800' }}>
                        Enviar Calificación
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
