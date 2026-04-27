/**
 * Firebase Configuration and Initialization
 * Using Firebase JS SDK for Expo compatibility
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGL7g2oyW24Dj-Rd-VwyCiXpYuOUavGAo",
  authDomain: "homeease-97b9d.firebaseapp.com",
  databaseURL: "https://homeease-97b9d-default-rtdb.firebaseio.com",
  projectId: "homeease-97b9d",
  storageBucket: "homeease-97b9d.firebasestorage.app",
  messagingSenderId: "274324828136",
  appId: "1:274324828136:web:7d38bee17d59ab95ae3e5d",
  measurementId: "G-FVCK0GK4FQ"
};

// Initialize Firebase if not already initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} else {
  app = getApp();
  console.log('Firebase already initialized');
}

// Initialize services
export const database = getDatabase(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;
