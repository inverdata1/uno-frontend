import React, { useState } from 'react';
import { Link } from 'expo-router';
import { Platform, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WelcomeActions, WelcomeCarousel, WelcomeHeader } from '../../core/auth/components/welcome';
import { Button, Text } from '../../shared/components/ui';

const features = [
  { icon: '🛒', text: 'Miles de productos locales' },
  { icon: '⚡', text: 'Entregas rápidas y seguras' },
  { icon: '❤️', text: 'Favoritos y seguimiento en vivo' },
];

function WebWelcome() {
  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#0f172a' }}>
      {/* Left panel - branding */}
      <View style={{ flex: 1, padding: 60, justifyContent: 'center', backgroundColor: '#0f172a' }}>
        {/* Logo */}
        <View style={{ marginBottom: 48 }}>
          <View style={{
            width: 72,
            height: 72,
            backgroundColor: '#ef4444',
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 2 }}>UNO</Text>
          </View>
          <Text style={{ fontSize: 42, fontWeight: '800', color: '#f1f5f9', marginBottom: 12 }}>
            UNO Delivery
          </Text>
          <Text style={{ fontSize: 18, color: '#94a3b8', lineHeight: 28 }}>
            Descubre, compra y recibe{'\n'}todo lo que necesitas
          </Text>
        </View>

        {/* Feature list */}
        <View>
          {features.map((f, i) => (
            <View key={i} style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.05)',
              paddingVertical: 14,
              paddingHorizontal: 18,
              borderRadius: 14,
              marginBottom: i < features.length - 1 ? 12 : 0,
            }}>
              <Text style={{ fontSize: 22, marginRight: 14 }}>{f.icon}</Text>
              <Text style={{ fontSize: 15, color: '#cbd5e1', fontWeight: '500' }}>{f.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Right panel - auth card */}
      <View style={{
        width: 480,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: 40,
      }}>
        <View style={{
          backgroundColor: '#ffffff',
          borderRadius: 24,
          padding: 40,
          width: '100%',
          maxWidth: 400,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 32,
          elevation: 8,
        }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
            Bienvenido
          </Text>
          <Text style={{ fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 32 }}>
            Elige cómo quieres continuar
          </Text>

          <Link href="/(auth)/register" asChild>
            <Button variant="primary" size="lg" style={{ width: '100%' }}>
              Crear cuenta
            </Button>
          </Link>

          <View style={{ height: 12 }} />

          <Link href="/(auth)/login" asChild>
            <Button variant="outline" size="lg" style={{ width: '100%' }}>
              Iniciar sesión
            </Button>
          </Link>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 24,
          }}>
            <Text style={{ fontSize: 13, color: '#ef4444', fontWeight: '500' }}>Términos</Text>
            <Text style={{ color: '#d1d5db', fontSize: 13, marginHorizontal: 8 }}>•</Text>
            <Text style={{ fontSize: 13, color: '#ef4444', fontWeight: '500' }}>Privacidad</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState({ backgroundColor: '#f7fafc' });
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  if (isDesktop) {
    return <WebWelcome />;
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: currentSlide.backgroundColor }}
      edges={['top', 'bottom']}
    >
      <View className="flex-1">
        <WelcomeHeader />
        <WelcomeCarousel onSlideChange={setCurrentSlide} />
        <WelcomeActions />
      </View>
    </SafeAreaView>
  );
}