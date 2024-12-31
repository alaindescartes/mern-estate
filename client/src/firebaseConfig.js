// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'mern-estate-97bbc.firebaseapp.com',
  projectId: 'mern-estate-97bbc',
  storageBucket: 'mern-estate-97bbc.firebasestorage.app',
  messagingSenderId: '791111985141',
  appId: '1:791111985141:web:75adc6e9b1b5e4351ea2bc',
  measurementId: 'G-27R2GBPRPG',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
