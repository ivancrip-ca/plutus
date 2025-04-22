// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDsX3YjdLydPmzg941_7ewXw2yIk7EKZ0",
  authDomain: "plutus-93ccc.firebaseapp.com",
  projectId: "plutus-93ccc",
  storageBucket: "plutus-93ccc.appspot.com", // Corregido el nombre del bucket de almacenamiento
  messagingSenderId: "660937233999",
  appId: "1:660937233999:web:62cd8b3559891af76a7c3a",
  measurementId: "G-6EN1T1K8F0"
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

export { auth, db, googleProvider, facebookProvider }; // Exportando storage
export default app;