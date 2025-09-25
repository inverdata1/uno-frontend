import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { auth } from '../config/firebase';
import app from '../config/firebase';

// Initialize Firestore
const firestore = getFirestore(app);

export const authService = {
  /**
   * Register a new user
   */
  async signUp({ firstName, lastName, email, phone, password }) {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore - START SIMPLE
      const userData = {
        id: user.uid,
        firstName,
        lastName,
        email,
        phone,
        roles: ['client'], // Everyone starts as client
        activeRole: 'client',
        createdAt: new Date(),
        isActive: true,
        // Client preferences
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

      await setDoc(doc(firestore, 'users', user.uid), userData);

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

      // Get user data from Firestore
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;

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
   * Get current user data from Firestore
   */
  async getCurrentUserData() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
      if (userDoc.exists()) {
        return {
          uid: currentUser.uid,
          email: currentUser.email,
          ...userDoc.data()
        };
      }
      return null;
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
        // Get user data from Firestore
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};

          callback({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            ...userData
          });
        } catch (error) {
          callback(null);
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