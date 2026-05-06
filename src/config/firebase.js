/**
 * Firebase Configuration and Initialization
 * Using Firebase JS SDK for Expo compatibility
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { 
  getAuth, 
  initializeAuth,
  getReactNativePersistence 
} from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration from environment variables
// IMPORTANT: This must match the project in google-services.json
// Note: EXPO_PUBLIC_ prefix makes these available in the app
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase if not already initialized
let app;
let auth;
let firestore;
let database;
let storage;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth with AsyncStorage persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  
  // Initialize Firestore with settings
  firestore = initializeFirestore(app, {
    cacheSizeBytes: -1, // Unlimited cache
  });
  
  // Initialize Realtime Database
  database = getDatabase(app);
  
  // Initialize Storage
  storage = getStorage(app);
  
  console.log('✅ Firebase initialized successfully');
} else {
  app = getApp();
  auth = getAuth(app);
  firestore = getFirestore(app);
  database = getDatabase(app);
  storage = getStorage(app);
  console.log('✅ Firebase already initialized');
}

export { app, auth, firestore, database, storage };
export default app;
