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
        avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'Google User')}&background=0284c7&color=fff&bold=true`,
        uid: user.uid
      }
    };
  } catch (error) {
    const code = error?.code || '';
    const message = error?.message || '';
    if (code === 'auth/operation-not-allowed') {
      return { 
        error: 'Google Sign-In is disabled in your Firebase Console. Please go to Firebase Console -> Build -> Authentication -> Sign-in method -> Enable Google.' 
      };
    } else if (code === 'auth/unauthorized-domain') {
      return { 
        error: 'Domain unauthorized in Firebase. Go to Firebase Console -> Authentication -> Settings -> Authorized Domains and add your domain.' 
      };
    } else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return { error: 'Google sign-in popup was closed before completing.' };
    } else if (code === 'auth/popup-blocked') {
      return { error: 'Google sign-in popup was blocked by browser. Please allow popups.' };
    }
    return { error: typeof message === 'string' && message ? message : 'Firebase authentication failed.' };
  }
};

