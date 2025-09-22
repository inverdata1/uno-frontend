import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';  
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import { View, Image } from 'react-native';
import {
  // Modo Cliente
  ClienteLogin,
  ClienteRegister,
  ClienteProfileData,
  ClienteAddressRegister,
  ClientePreferenceRegister,
  ClienteResetPassword,
  ClienteHomeScreen,
  // Modo Negocio
  NegocioLogin,
  NegocioRegister,
  NegocioProfileData,
  NegocioAddressRegister,
  NegocioResetPassword,
  NegocioHomeScreen,
} from './screens';

const Stack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load the logo image
        await Asset.loadAsync(require('./assets/uno-logo.jpeg'));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);
  if (!appIsReady) {
    return null;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="ClienteLogin"
        screenOptions={{
          headerTitle: () => (
          <View style={{ alignItems: 'center'}}>
          <Image 
            source={require('./assets/uno-logo.jpeg')}
            style={{ width: 100, height:50 }} 
            resizeMode="contain"
          />
          </View>
        ),
        headerStyle: {
          backgroundColor: '#e50323',
          height: 140,
        },
        headerTintColor: '#fefefe',
        headerTitleAlign: 'center',
        headerTitleContainerStyle: {
          paddingHorizontal: 10,
          maxWidth: '90%',
        },
        headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Group>
          <Stack.Screen name="ClienteLogin" component={ClienteLogin} options={{ headerBackVisible: false, }}/>
          <Stack.Screen name="ClienteRegister" component={ClienteRegister}/>
          <Stack.Screen name="ClienteProfileData" component={ClienteProfileData}/>
          <Stack.Screen name="ClienteAddressRegister" component={ClienteAddressRegister}/>
          <Stack.Screen name="ClientePreferenceRegister" component={ClientePreferenceRegister}/>
          <Stack.Screen name="ClienteResetPassword" component={ClienteResetPassword}/>
          <Stack.Screen name="NegocioLogin" component={NegocioLogin} options={{ headerBackVisible: false, }}/>
          <Stack.Screen name="NegocioRegister" component={NegocioRegister}/>
          <Stack.Screen name="NegocioProfileData" component={NegocioProfileData}/>
          <Stack.Screen name="NegocioAddressRegister" component={NegocioAddressRegister}/>
          <Stack.Screen name="NegocioResetPassword" component={NegocioResetPassword}/>
        </Stack.Group>
        <Stack.Group>
          <Stack.Screen name="ClienteHomeScreen" component={ClienteHomeScreen} options={{ headerBackVisible: false, }}/>
          <Stack.Screen name="NegocioHomeScreen" component={NegocioHomeScreen} options={{ headerBackVisible: false, }}/>
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}