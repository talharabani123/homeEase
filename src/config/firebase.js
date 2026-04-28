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
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
// IMPORTANT: This must match the project in google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyABd3Q8DPEuiIKuLUasgdNV2fOMoTZ_Mmc",
  authDomain: "homeease-176cf.firebaseapp.com",
  projectId: "homeease-176cf",
  storageBucket: "homeease-176cf.firebasestorage.app",
  messagingSenderId: "554013141182",
  appId: "1:554013141182:web:7c88dc00f3d73e4cec16ef",
  measurementId: "G-55JE2LWSSN"
};

// Initialize Firebase if not already initialized
let app;
let auth;
let firestore;
let database;

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
  
  console.log('✅ Firebase initialized successfully');
} else {
  app = getApp();
  auth = getAuth(app);
  firestore = getFirestore(app);
  database = getDatabase(app);
  console.log('✅ Firebase already initialized');
}

export { app, auth, firestore, database };
export default app;
