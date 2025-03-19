import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase';

/**
 * Saves user data to Firestore
 * @param {Object} user - Firebase Auth user object
 * @param {Object} userData - User data to save to Firestore
 * @param {boolean} allowOffline - Whether to allow offline operations
 * @returns {Promise} - Promise that resolves when data is saved
 */
export const saveUserToFirestore = async (user, userData, allowOffline = false) => {
  const db = getFirestore();
  
  try {
    // Create or update user document in Firestore with merge option
    // This ensures we don't overwrite any existing data
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
    
    // If offline operations are allowed, don't throw the error
    if (allowOffline && error.code === 'failed-precondition') {
      console.log("Device is offline, will sync when back online");
      return false;
    }
    
    throw error;
  }
};
