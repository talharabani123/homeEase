/**
 * Firebase Configuration and Initialization
 */

import { getApp, getApps, initializeApp } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

// Firebase configuration from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyBb3dTmjdtL2hITRgoBOvUqbxzHekzbvYY",
  authDomain: "homeease-97b9d.firebaseapp.com",
  projectId: "homeease-97b9d",
  storageBucket: "homeease-97b9d.firebasestorage.app",
  messagingSenderId: "274324828136",
  appId: "1:274324828136:android:7d79c54a897ee1dfae3e5d",
  databaseURL: "https://homeease-97b9d-default-rtdb.firebaseio.com"
};

// Initialize Firebase if not already initialized
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} else {
  console.log('Firebase already initialized');
}

export default getApp();
