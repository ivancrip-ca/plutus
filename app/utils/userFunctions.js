import { db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp, enableIndexedDbPersistence } from 'firebase/firestore';

// Habilitar persistencia offline (si estamos en el navegador)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      console.error("Error enabling offline persistence:", err);
      if (err.code === 'failed-precondition') {
        console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time");
      } else if (err.code === 'unimplemented') {
        console.warn("The current browser doesn't support offline persistence");
      }
    });
}

/**
 * Save user data to Firestore
 * @param {object} user - Firebase auth user object
 * @param {object} additionalData - Any additional user data to save
 * @param {boolean} offlineAllowed - Whether to allow offline operation
 * @returns {Promise} - Promise resolving to the saved data
 */
export const saveUserToFirestore = async (user, additionalData = {}, offlineAllowed = true) => {
  if (!user) {
    console.error("Cannot save user data: User object is undefined");
    return null;
  }
  
  console.log(`Attempting to save user ${user.uid} to Firestore`);
  
  const userRef = doc(db, 'users', user.uid);
  
  try {
    // Check if user document already exists
    console.log("Checking if user exists in Firestore...");
    const userSnapshot = await getDoc(userRef);
    
    if (!userSnapshot.exists()) {
      console.log("User doesn't exist in Firestore, creating new document");
      // Create new user document if it doesn't exist
      const { displayName, email, photoURL } = user;
      const createdAt = serverTimestamp();
      
      // Asegurar que registrationDate existe
      if (!additionalData.registrationDate) {
        additionalData.registrationDate = new Date().toISOString();
      }
      
      // Asegurar que registrationMethod existe
      if (!additionalData.registrationMethod) {
        additionalData.registrationMethod = 'unknown';
        console.warn("Registration method not specified, setting to 'unknown'");
      }
      
      // Prepare user data object
      const userData = {
        displayName,
        email,
        photoURL,
        createdAt,
        lastLogin: createdAt,
        ...additionalData
      };
      
      // Remove undefined fields
      Object.keys(userData).forEach(
        key => userData[key] === undefined && delete userData[key]
      );
      
      console.log("Saving user data:", {...userData, uid: user.uid});
      
      // Save to Firestore
      await setDoc(userRef, userData);
      console.log("User data successfully saved to Firestore");
      return userData;
    } else {
      console.log("User already exists in Firestore, updating lastLogin");
      // Update last login time if user already exists
      
      // No sobrescribir registrationMethod o registrationDate si ya existen
      const existingData = userSnapshot.data();
      
      // Datos que no queremos sobrescribir si ya existen
      const protectedFields = ['registrationMethod', 'registrationDate'];
      
      // Filtrar los datos adicionales para no sobrescribir campos protegidos
      const filteredAdditionalData = {...additionalData};
      for (const field of protectedFields) {
        if (existingData[field] && filteredAdditionalData[field]) {
          console.log(`Preserving existing ${field}: ${existingData[field]}`);
          delete filteredAdditionalData[field];
        }
      }
      
      // Actualizar lastLogin y otros datos filtrados
      await setDoc(userRef, { 
        lastLogin: serverTimestamp(),
        ...filteredAdditionalData 
      }, { merge: true });
      
      // Si hay datos adicionales después de filtrar, actualizarlos
      if (Object.keys(filteredAdditionalData).length > 0) {
        console.log("Updating user with additional filtered data");
      }
      
      console.log("User data successfully updated in Firestore");
      return { ...existingData, ...filteredAdditionalData, lastLogin: serverTimestamp() };
    }
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
    
    // Si estamos offline pero se permite la operación offline, no lo tratamos como error fatal
    if (error.message && error.message.includes('offline') && offlineAllowed) {
      console.warn("Device is offline - data will sync when connection is restored");
      
      // Crear un objeto de usuario básico para devolver en caso offline
      const offlineUserData = {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        ...additionalData,
        _offlineCreated: true
      };
      
      return offlineUserData;
    }
    
    // Para otros errores o si offlineAllowed=false, devolver null
    return null;
  }
};

// Función versión ligera para login (solo actualiza lastLogin)
export const updateUserLastLogin = async (user) => {
  if (!user) return null;
  
  console.log(`Actualizando último acceso para usuario ${user.uid}`);
  
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    console.log("Último acceso actualizado correctamente");
    return true;
  } catch (error) {
    console.warn("No se pudo actualizar el último acceso", error);
    return false;
  }
};
