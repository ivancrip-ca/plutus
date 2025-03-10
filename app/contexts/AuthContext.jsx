'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
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

  // Valor que proporcionará el contexto
  const value = {
    currentUser,
    userData,
    isAuthenticated: !!currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
