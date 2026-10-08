import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, Database } from 'firebase/database';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  Auth,
  User as FirebaseUser,
} from 'firebase/auth';
import { FirebaseConnectionConfig } from '../types';

const STORAGE_KEY_FIREBASE_CONFIG = 'indie_picks_firebase_config';

export const DEFAULT_FIREBASE_CONFIG: FirebaseConnectionConfig = {
  apiKey: 'AIzaSyDHu_SFHAu9_BUuEWWzNHzzxz2h9nuOUsU',
  authDomain: 'rating-posts.firebaseapp.com',
  databaseURL: 'https://rating-posts-default-rtdb.firebaseio.com',
  projectId: 'rating-posts',
  storageBucket: 'rating-posts.firebasestorage.app',
  messagingSenderId: '47405534900',
  appId: '1:47405534900:web:79cba5c4fa8774ef5951e1',
  enabled: true,
};

export function getSavedFirebaseConfig(): FirebaseConnectionConfig {
  const envConfig: FirebaseConnectionConfig = {
    apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || DEFAULT_FIREBASE_CONFIG.authDomain,
    databaseURL: (import.meta.env.VITE_FIREBASE_DATABASE_URL as string) || DEFAULT_FIREBASE_CONFIG.databaseURL,
    projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || DEFAULT_FIREBASE_CONFIG.appId,
    enabled: true,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...envConfig, ...parsed };
    }
  } catch (e) {
    console.error('Error reading saved Firebase config', e);
  }

  return envConfig;
}

export function saveFirebaseConfig(config: FirebaseConnectionConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving Firebase config', e);
  }
}

let firebaseAppInstance: FirebaseApp | null = null;
let databaseInstance: Database | null = null;
let authInstance: Auth | null = null;

export function initFirebaseService(config: FirebaseConnectionConfig): {
  success: boolean;
  app: FirebaseApp | null;
  db: Database | null;
  auth: Auth | null;
  error?: string;
} {
  if (!config.apiKey || (!config.databaseURL && !config.projectId)) {
    return {
      success: false,
      app: null,
      db: null,
      auth: null,
      error: 'Firebase API Key and Database URL / Project ID are required.',
    };
  }

  try {
    if (getApps().length > 0) {
      firebaseAppInstance = getApp();
    } else {
      firebaseAppInstance = initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain || (config.projectId ? `${config.projectId}.firebaseapp.com` : ''),
        databaseURL: config.databaseURL,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      });
    }

    if (config.databaseURL) {
      databaseInstance = getDatabase(firebaseAppInstance);
    }
    authInstance = getAuth(firebaseAppInstance);

    return {
      success: true,
      app: firebaseAppInstance,
      db: databaseInstance,
      auth: authInstance,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Firebase initialization warning:', message);
    return { success: false, app: null, db: null, auth: null, error: message };
  }
}

export function getRealtimeDb(): Database | null {
  return databaseInstance;
}

export function getFirebaseAuth(): Auth | null {
  return authInstance;
}

/**
 * Sign in using Google Auth Popup
 */
export async function signInWithGoogle(): Promise<{
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
} | null> {
  if (!authInstance) {
    const config = getSavedFirebaseConfig();
    const init = initFirebaseService(config);
    if (!init.success || !init.auth) {
      throw new Error(
        'Firebase Auth is not yet initialized with credentials. Please provide your Firebase API key in .env or settings.'
      );
    }
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(authInstance!, provider);
  const user = result.user;

  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
}

export async function signOutUser(): Promise<void> {
  if (authInstance) {
    await signOut(authInstance);
  }
}

