import { useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../../../shared/config/firebase';
import { useAuthStore } from '../../../shared/stores/auth-store';

// Custom hook that bridges Firebase Auth with Zustand store
export const useAuthState = () => {
  const { user, isLoading, isAuthenticated, setUser, setLoading, signOut } = useAuthStore();

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        });
      } else {
        // User is signed out
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [setUser, setLoading]);

  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
      signOut(); // Update Zustand store
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    signOut: signOutUser,
  };
};