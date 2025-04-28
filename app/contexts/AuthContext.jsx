'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// Crear contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("AuthContext: Verificando estado de autenticación...");
    
    // Suscribirse al estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        console.log("AuthContext: Usuario autenticado", user.uid);
        
        try {
          // Obtener datos adicionales del usuario desde Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            console.log("Datos de usuario cargados en contexto:", userDoc.data());
          } else {
            console.log("No se encontraron datos adicionales del usuario en Firestore");
            setUserData(null);
          }
        } catch (error) {
          console.error("Error al obtener datos de usuario:", error);
          setUserData(null);
        }
      } else {
        console.log("AuthContext: No hay usuario autenticado");
        setUserData(null);
      }
      
      setLoading(false);
    });
    
    // Limpieza al desmontar
    return unsubscribe;
  }, []);

  // Función para actualizar los datos del usuario en el contexto
  const updateUserData = (newData) => {
    setUserData(newData);
  };

  // Función para cerrar sesión
  const signOutUser = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redireccionar a la página de inicio
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  };

  // Valor que proporcionará el contexto
  const value = {
    currentUser,
    userData,
    updateUserData,
    logout: signOutUser, // Exponer función de logout
    isAuthenticated: !!currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
