/**
 * PROJETO ARES — Firebase Configuration
 */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDCU2Ow8IiilHzJRB1i-Wjh4zaqdn2EW58",
  authDomain: "ares-54dd8.firebaseapp.com",
  projectId: "ares-54dd8",
  storageBucket: "ares-54dd8.firebasestorage.app",
  messagingSenderId: "857286738159",
  appId: "1:857286738159:web:ce00a9e36256e653f7db1a",
  measurementId: "G-9Q06WLNE3D"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
