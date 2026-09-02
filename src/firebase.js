import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDHjBUAnesZz9cii6urWpt_z0pnVSV2J_k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "luxestay-873bf.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "luxestay-873bf",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "luxestay-873bf.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "415954915259",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:415954915259:web:e7a44f627754f50d2abe9e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogleFirebase = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      success: true,
      user: {
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        uid: user.uid
      }
    };
  } catch (error) {
    if (error.code === 'auth/operation-not-allowed') {
      return { 
        error: 'Google Sign-In is disabled in your Firebase Console. Please go to Firebase Console -> Build -> Authentication -> Sign-in method -> Enable Google.' 
      };
    } else if (error.code === 'auth/unauthorized-domain') {
      return { 
        error: 'Domain unauthorized in Firebase. Go to Firebase Console -> Authentication -> Settings -> Authorized Domains and add domain.' 
      };
    } else if (error.code === 'auth/popup-closed-by-user') {
      return { error: 'Google sign-in popup was closed before completing.' };
    }
    return { error: error.message || 'Firebase authentication failed.' };
  }
};
