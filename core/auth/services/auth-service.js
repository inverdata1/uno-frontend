import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../../shared/config/api-client';
import { uploadMedia } from '../../../shared/services/media-upload';

export const authService = {
  /**
   * Register a new user
   */
  async signUp({ firstName, lastName, email, phone, dateOfBirth, password, selectedUserType = 'client', businessData, preferences }) {
    // Only a user created by this very call may be rolled back; reading the id
    // back from storage would target a previously signed-in account instead.
    let createdUserId = null;

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

      // 2. Prepare register payload
      let registerPayload = {
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
          },
          ...(preferences || {})
        }
      };

      if (selectedUserType === 'business' && businessData) {
        registerPayload.businessData = {
          businessName: businessData.businessName,
          businessType: businessData.businessType,
          businessHours: businessData.businessHours,
          category: businessData.category,
          description: businessData.description || '',
          address: businessData.address,
          coordinates: businessData.coordinates || null,
          phone: businessData.phone,
        };
      }

      const registerResponse = await apiClient.post('/auth/register', registerPayload);

      const { user, access_token } = registerResponse.data;
      createdUserId = user.id;

      // 3. Store tokens in AsyncStorage so future requests are authenticated
      await AsyncStorage.setItem('userToken', access_token);
      await AsyncStorage.setItem('userId', user.id);

      // 4. Upload business media now that we hold a token.
      // /upload/* sits behind the auth guard, so this cannot run before the
      // account exists - doing so returned "Token no proporcionado".
      // Failures here leave a usable account without images rather than
      // aborting a registration that already succeeded.
      let businessMedia = {};
      if (selectedUserType === 'business' && businessData && user.currentBusinessId) {
        try {
          if (businessData.logoUri) {
            const logoResult = await uploadMedia(
              businessData.logoUri,
              'BUSINESS_LOGO',
              { mimeType: businessData.logoMimeType },
              null,
              { uid: user.id },
            );
            businessMedia.logoUrl = logoResult.url;
          }

          if (businessData.bannerUri) {
            const bannerResult = await uploadMedia(
              businessData.bannerUri,
              'BUSINESS_BANNER',
              { mimeType: businessData.bannerMimeType },
              null,
              { uid: user.id },
            );
            businessMedia.bannerUrl = bannerResult.url;
          }

          if (Object.keys(businessMedia).length > 0) {
            await apiClient.patch('/businesses/profile', businessMedia, {
              params: { businessId: user.currentBusinessId },
            });
          }
        } catch (mediaError) {
          console.warn('Business media upload failed, account kept:', mediaError.message);
        }
      }

      return {
        user: {
          uid: user.id, // Using 'uid' for backwards compatibility in frontend state
          email: user.email,
          currentBusinessId: user.currentBusinessId,
          ...user,
          ...businessMedia
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Rollback only the account this call created, so a failed attempt made
      // while another session is stored cannot delete that other account.
      if (createdUserId) {
        console.log(`⚠️ Rolling back registration for user ${createdUserId}...`);
        try {
          await apiClient.delete(`/users/${createdUserId}`);
          // Clear the partial session
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userId');
          console.log('✅ Rollback successful.');
        } catch (rollbackError) {
          console.error('❌ Rollback failed:', rollbackError);
        }
      }

      const msg = error.response?.data?.message || error.message || 'Error en el registro';
      // status lets callers react to specific failures (e.g. 409 = email taken)
      // without matching on message text, which breaks if the wording changes
      return { error: msg, status: error.response?.status };
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