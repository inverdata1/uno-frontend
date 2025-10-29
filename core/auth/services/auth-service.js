import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../../../shared/config/firebase';
import { apiClient } from '../../../shared/config/api-client';

export const authService = {
  /**
   * Register a new user
   */
  async signUp({ firstName, lastName, email, phone, dateOfBirth, password, selectedUserType = 'client', businessData }) {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document using our API system with selected user type
      const userTypes = {};

      // Always enable client user type by default
      userTypes.client = {
        status: 'active',
        createdAt: new Date()
      };

      // Add selected user type if different from client
      if (selectedUserType !== 'client') {
        userTypes[selectedUserType] = {
          status: selectedUserType === 'delivery' ? 'pending' : 'active', // Delivery user type needs approval
          createdAt: new Date()
        };
      }

      // If user is registering as a business, create business profile FIRST
      let businessId = null;
      if (selectedUserType === 'business' && businessData) {
        console.log('📊 Creating business profile during registration...');

        const business = await apiClient.post('/businesses', {
          businessName: businessData.businessName,
          category: businessData.category,
          description: businessData.description || '',
          address: businessData.address,
          phone: businessData.phone,
          logoUrl: businessData.logoUrl || null,
          bannerUrl: businessData.bannerUrl || null,
        }, { params: { userId: user.uid } });

        businessId = business.data.id;
        console.log('✅ Business profile created:', businessId);
      }

      // Create user document with business ID already included
      const userData = {
        id: user.uid,
        firstName,
        lastName,
        email,
        phone: `+58${phone}`, // Convert 04XX XXX XXXX to +58 04XX XXX XXXX
        dateOfBirth: dateOfBirth,
        createdAt: new Date(),
        isActive: true,
        userTypes: userTypes, // API field name (will transform in backend later)
        currentUserType: selectedUserType, // API field name (will transform in backend later)
        currentBusinessId: businessId,
        currentBranchId: null,
        // User preferences
        preferences: {
          language: 'es',
          currency: 'USD',
          notifications: {
            orders: true,
            promotions: false,
            email: true
          }
        }
      };

      // Create user document using our API client
      await apiClient.post('/users', userData, { params: { userId: user.uid } });
      console.log('✅ User document created with businessId:', businessId);

      return {
        user: {
          uid: user.uid,
          email: user.email,
          ...userData
        }
      };
    } catch (error) {
      const handledError = this.handleAuthError(error);
      return { error: handledError.message };
    }
  },

  /**
   * Sign in existing user
   */
  async signIn({ email, password }) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data through our API system
      const userProfile = await apiClient.get('/users/profile', { params: { userId: user.uid } });
      const userTypesData = await apiClient.get('/users/user-types', { params: { userId: user.uid } });

      return {
        user: {
          uid: user.uid,
          email: user.email,
          ...userProfile.data,
          ...userTypesData.data
        }
      };
    } catch (error) {
      const handledError = this.handleAuthError(error);
      return { error: handledError.message };
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  /**
   * Get current user data through our API system
   */
  async getCurrentUserData() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const userProfile = await apiClient.get('/users/profile', { params: { userId: currentUser.uid } });
      const userTypesData = await apiClient.get('/users/user-types', { params: { userId: currentUser.uid } });

      return {
        uid: currentUser.uid,
        email: currentUser.email,
        ...userProfile.data,
        ...userTypesData.data
      };
    } catch (error) {
      return null;
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user data through our API system
        try {
          const userProfile = await apiClient.get('/users/profile', { params: { userId: user.uid } });
          const userTypesData = await apiClient.get('/users/user-types', { params: { userId: user.uid } });

          callback({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            ...userProfile.data,
            ...userTypesData.data
          });
        } catch (error) {
          console.warn('Failed to fetch user profile data, keeping basic auth state:', error);
          // Don't log out the user if API fails - just provide basic auth info
          callback({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            // Provide safe defaults if API fails
            firstName: '',
            lastName: '',
            phone: '',
            userTypes: { client: { status: 'active' } }, // API field
            currentUserType: 'client' // API field
          });
        }
      } else {
        callback(null);
      }
    });
  },

  /**
   * Handle Firebase auth errors
   */
  handleAuthError(error) {
    const errorMessages = {
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Email o contraseña incorrectos',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    };

    return new Error(errorMessages[error.code] || 'Error de autenticación');
  }
};