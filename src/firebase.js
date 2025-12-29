// Firebase-konfiguration
// Ersätt dessa värden med dina egna från Firebase Console
// https://console.firebase.google.com/

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDcMUnljxDihJgC0bwtmyQJRBVlfn1Y2Lk",
  authDomain: "leksather-ed044.firebaseapp.com",
  projectId: "leksather-ed044",
  storageBucket: "leksather-ed044.firebasestorage.app",
  messagingSenderId: "765510332866",
  appId: "1:765510332866:web:10c146cdd501d0e30ba65b"
};

// Initiera Firebase
const app = initializeApp(firebaseConfig);

// Initiera Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Lägg till Calendar scope för Google Calendar API
googleProvider.addScope('https://www.googleapis.com/auth/calendar');

// Kalender-ID för familjens delade kalender
export const FAMILY_CALENDAR_ID = 'bd465e9554e5d27962d1f91210de0bd158dc49a6425602424cca4416550d892b@group.calendar.google.com';

// Initiera Storage och Firestore
export const storage = getStorage(app);
export const db = getFirestore(app);

export default app;
