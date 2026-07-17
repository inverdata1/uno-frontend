import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../../shared/config/api-client';
import { uploadMedia } from '../../../shared/services/media-upload';

export const authService = {
  /**
   * Register a new user
   */
  async signUp({ firstName, lastName, email, phone, dateOfBirth, password, selectedUserType = 'client', businessData }) {
    try {
      // 1. Prepare userTypes structure
      const userTypes = {};
      userTypes.client = { status: 'active', createdAt: new Date() };
      
      if (selectedUserType !== 'client') {
        userTypes[selectedUserType] = { 
          status: selectedUserType === 'delivery' ? 'pending' : 'active', 
          createdAt: new Date() 
        };
      }

      // 2. Call our NestJS Auth endpoint
      const registerResponse = await apiClient.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
        phone: `+58${phone}`,
        dateOfBirth,
        userTypes,
        currentUserType: selectedUserType,
        preferences: {
          language: 'es',
          currency: 'USD',
          notifications: {
            orders: true,
            promotions: false,
            email: true
          }
        }
      });
      
      const { user, access_token } = registerResponse.data;

      // 3. Store tokens in AsyncStorage so future requests are authenticated
      await AsyncStorage.setItem('userToken', access_token);
      await AsyncStorage.setItem('userId', user.id);

      // 4. Create business profile if requested
      let businessId = null;
      if (selectedUserType === 'business' && businessData) {
        console.log('📊 Creating business profile during registration...');

        let logoUrl = null;
        let bannerUrl = null;

        if (businessData.logoUri) {
          console.log('📤 Uploading business logo...');
          const logoResult = await uploadMedia(businessData.logoUri, 'BUSINESS_LOGO', { mimeType: businessData.logoMimeType }, null, { uid: user.id });
          logoUrl = logoResult.url;
        }

        if (businessData.bannerUri) {
          console.log('📤 Uploading business banner...');
          const bannerResult = await uploadMedia(businessData.bannerUri, 'BUSINESS_BANNER', { mimeType: businessData.bannerMimeType }, null, { uid: user.id });
          bannerUrl = bannerResult.url;
        }

        const business = await apiClient.post('/businesses', {
          businessName: businessData.businessName,
          category: businessData.category,
          description: businessData.description || '',
          address: businessData.address,
          coordinates: businessData.coordinates || null,
          phone: businessData.phone,
          logoUrl: logoUrl,
          bannerUrl: bannerUrl,
        });

        businessId = business.data.id;
        console.log('✅ Business profile created:', businessId);

        // Update the user with their newly created currentBusinessId
        await apiClient.put(`/users/profile`, { currentBusinessId: businessId }, { params: { userId: user.id } });
      }

      return {
        user: {
          uid: user.id, // Using 'uid' for backwards compatibility in frontend state
          email: user.email,
          currentBusinessId: businessId,
          ...user
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Rollback: If user was created but subsequent steps failed, delete the user
      // Check if we reached step 2 (we have a token saved)
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedToken && storedUserId) {
        console.log(`⚠️ Rolling back registration for user ${storedUserId}...`);
        try {
          await apiClient.delete(`/users/${storedUserId}`);
          // Clear the partial session
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userId');
          console.log('✅ Rollback successful.');
        } catch (rollbackError) {
          console.error('❌ Rollback failed:', rollbackError);
        }
      }

      const msg = error.response?.data?.message || error.message || 'Error en el registro';
      return { error: msg };
    }
  },

  /**
   * Sign in existing user
   */
  async signIn({ email, password }) {
    try {
      // 1. Call login endpoint
      const loginResponse = await apiClient.post('/auth/login', { email, password });
      const { user, access_token } = loginResponse.data;

      // 2. Store session
      await AsyncStorage.setItem('userToken', access_token);
      await AsyncStorage.setItem('userId', user.id);

      return {
        user: {
          uid: user.id,
          ...user
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      const msg = error.response?.data?.message || 'Email o contraseña incorrectos';
      return { error: msg };
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userId');
      return { success: true };
    } catch (error) {
      return { error: 'Error al cerrar sesión' };
    }
  },

  /**
   * Get current user data using API
   */
  async getCurrentUserData() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      
      if (!token || !userId) return null;

      // Ensure we hit the API with the token to validate it
      const userProfile = await apiClient.get('/users/profile', { params: { userId } });
      return {
        uid: userId,
        ...userProfile.data
      };
    } catch (error) {
      console.warn('Could not fetch user session data:', error.message);
      return null;
    }
  },

  /**
   * Listen to auth state changes (Mimics Firebase onAuthStateChanged)
   */
  onAuthStateChanged(callback) {
    // Automatically invoke with current session state
    this.getCurrentUserData().then(userData => {
      callback(userData);
    });

    // In a real app we might want to use EventEmitters to broadcast auth state changes,
    // but for now, returning a mock unsubscribe function keeps React Native happy
    return () => {
      // unsubscribe
    };
  }
};