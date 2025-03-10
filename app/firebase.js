// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

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

// Set up Auth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

console.log("Firebase initialization complete");

export { auth, db, googleProvider, facebookProvider };
export default app;