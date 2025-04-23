// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Firebase Auth
console.log("Initializing Firebase Auth...");
const auth = getAuth(app);

// Initialize Firestore
console.log("Initializing Firestore...");
const db = getFirestore(app);

// Initialize Storage
console.log("Initializing Firebase Storage...");
const storage = getStorage(app);

// Configurar la persistencia sólo en el lado del cliente y sólo una vez
if (typeof window !== 'undefined') {
  // Usamos un flag para evitar intentar habilitar la persistencia más de una vez
  const enablePersistence = async () => {
    try {
      await enableIndexedDbPersistence(db);
      console.log("Firestore persistence enabled successfully");
    } catch (err) {
      if (err.code === 'failed-precondition') {
        console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time");
      } else if (err.code === 'unimplemented') {
        console.warn("The current browser doesn't support offline persistence");
      } else {
        console.error("Error enabling persistence:", err);
      }
    }
  };
  
  // Encapsulando en un try/catch adicional para mayor seguridad
  try {
    // Solo habilitamos persistencia si no estamos en modo SSR
    if (document.readyState === 'complete') {
      enablePersistence();
    } else {
      window.addEventListener('load', enablePersistence);
    }
  } catch (e) {
    console.error("Error checking document ready state", e);
  }
}

// Set up Auth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

console.log("Firebase initialization complete");

export { auth, db, storage, googleProvider, facebookProvider }; // Exportando storage
export default app;