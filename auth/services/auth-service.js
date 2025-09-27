import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../../shared/config/firebase';
import { apiClient } from '../../shared/config/api-client';

export const authService = {
  /**
   * Register a new user
   */
  async signUp({ firstName, lastName, email, phone, password, selectedMode = 'client' }) {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document using our API system with selected mode
      const modes = {};

      // Always enable client mode by default
      modes.client = {
        status: 'active',
        createdAt: new Date()
      };

      // Add selected mode if different from client
      if (selectedMode !== 'client') {
        modes[selectedMode] = {
          status: selectedMode === 'delivery' ? 'pending' : 'active', // Delivery mode needs approval
          createdAt: new Date()
        };
      }

      const userData = {
        id: user.uid,
        firstName,
        lastName,
        email,
        phone: `+58${phone}`, // Convert 04XX XXX XXXX to +58 04XX XXX XXXX
        createdAt: new Date(),
        isActive: true,
        modes,
        currentMode: selectedMode,
        currentBusinessId: null,
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
      const userModes = await apiClient.get('/user-modes', { params: { userId: user.uid } });

      return {
        user: {
          uid: user.uid,
          email: user.email,
          ...userProfile.data,
          ...userModes.data
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
      const userModes = await apiClient.get('/user-modes', { params: { userId: currentUser.uid } });

      return {
        uid: currentUser.uid,
        email: currentUser.email,
        ...userProfile.data,
        ...userModes.data
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
          const userModes = await apiClient.get('/user-modes', { params: { userId: user.uid } });

          callback({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            ...userProfile.data,
            ...userModes.data
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
            modes: { client: { status: 'active' } },
            currentMode: 'client'
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