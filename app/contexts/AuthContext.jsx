'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
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

  // Función para obtener información del dispositivo y navegador
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    let deviceType = 'Desconocido';
    let browser = 'Desconocido';
    
    // Detectar dispositivo
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      deviceType = /iPad/.test(userAgent) ? 'iPad' : 'iPhone';
    } else if (/Android/.test(userAgent)) {
      deviceType = 'Android';
    } else if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
      deviceType = 'MacOS';
    } else if (/Win/.test(userAgent)) {
      deviceType = 'Windows';
    } else if (/Linux/.test(userAgent)) {
      deviceType = 'Linux';
    }
    
    // Detectar navegador
    if (/Firefox/.test(userAgent)) {
      browser = 'Firefox';
    } else if (/SamsungBrowser/.test(userAgent)) {
      browser = 'Samsung Browser';
    } else if (/MSIE|Trident/.test(userAgent)) {
      browser = 'Internet Explorer';
    } else if (/Edge/.test(userAgent)) {
      browser = 'Edge';
    } else if (/Chrome/.test(userAgent)) {
      browser = 'Chrome';
    } else if (/Safari/.test(userAgent)) {
      browser = 'Safari';
    }
    
    return { 
      deviceType, 
      browser, 
      userAgent
    };
  };

  // Función para registrar una nueva sesión
  const registerSession = async (userId) => {
    try {
      const deviceInfo = getDeviceInfo();
      const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Crear objeto de sesión
      const sessionData = {
        id: sessionId,
        userId,
        device: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        userAgent: deviceInfo.userAgent,
        location: 'Desconocida', // Para ubicación real necesitarías un servicio de geolocalización
        ip: 'Desconocida', // Para obtener IP real necesitarías un servicio backend
        startDate: serverTimestamp(),
        lastActive: serverTimestamp(),
        status: 'active'
      };
      
      // Guardar sesión en Firestore
      const sessionRef = doc(db, 'sessions', sessionId);
      await setDoc(sessionRef, sessionData);
      
      // Guardar ID de sesión en localStorage para identificarla como la actual
      localStorage.setItem('currentSessionId', sessionId);
      
      console.log('Sesión registrada:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('Error al registrar sesión:', error);
      return null;
    }
  };

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
            
            // Registrar sesión si no existe una actual
            const currentSessionId = localStorage.getItem('currentSessionId');
            if (!currentSessionId) {
              registerSession(user.uid);
            } else {
              // Actualizar última actividad de la sesión actual
              try {
                const sessionRef = doc(db, 'sessions', currentSessionId);
                const sessionDoc = await getDoc(sessionRef);
                
                if (sessionDoc.exists() && sessionDoc.data().status === 'active') {
                  await setDoc(sessionRef, { lastActive: serverTimestamp() }, { merge: true });
                } else {
                  // Si la sesión ya no existe o está cerrada, crear una nueva
                  localStorage.removeItem('currentSessionId');
                  registerSession(user.uid);
                }
              } catch (sessionError) {
                console.error('Error al verificar sesión:', sessionError);
                // Si hay error, intentar crear una nueva sesión
                localStorage.removeItem('currentSessionId');
                registerSession(user.uid);
              }
            }
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
    
    // Actualizar sesión periódicamente mientras el usuario esté activo
    let sessionUpdateInterval;
    if (currentUser) {
      sessionUpdateInterval = setInterval(async () => {
        const currentSessionId = localStorage.getItem('currentSessionId');
        if (currentSessionId) {
          try {
            const sessionRef = doc(db, 'sessions', currentSessionId);
            await setDoc(sessionRef, { lastActive: serverTimestamp() }, { merge: true });
          } catch (error) {
            console.error('Error al actualizar sesión:', error);
          }
        }
      }, 5 * 60 * 1000); // Actualizar cada 5 minutos
    }
    
    // Limpieza al desmontar
    return () => {
      unsubscribe();
      if (sessionUpdateInterval) {
        clearInterval(sessionUpdateInterval);
      }
    };
  }, [currentUser]);

  // Función para cerrar una sesión específica
  const endSession = async (sessionId) => {
    try {
      // En lugar de actualizar, eliminar completamente la sesión
      const sessionRef = doc(db, 'sessions', sessionId);
      await deleteDoc(sessionRef);
      
      // Si es la sesión actual, eliminar del localStorage
      const currentSessionId = localStorage.getItem('currentSessionId');
      if (currentSessionId === sessionId) {
        localStorage.removeItem('currentSessionId');
      }
      
      return true;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return false;
    }
  };
  
  // Función para cerrar todas las sesiones excepto la actual
  const endAllOtherSessions = async () => {
    if (!currentUser) return false;
    
    try {
      const currentSessionId = localStorage.getItem('currentSessionId');
      const sessionsQuery = query(
        collection(db, 'sessions'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(sessionsQuery);
      const deletePromises = [];
      
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentSessionId) {
          // Eliminar completamente las sesiones no actuales en lugar de actualizarlas
          deletePromises.push(deleteDoc(doc.ref));
        }
      });
      
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Error al cerrar todas las sesiones:', error);
      return false;
    }
  };
  
  // Función para obtener todas las sesiones del usuario
  const getUserSessions = async () => {
    if (!currentUser) return [];
    
    try {
      // Ahora solo consultamos las sesiones activas, ya que las cerradas se eliminan
      const sessionsQuery = query(
        collection(db, 'sessions'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(sessionsQuery);
      const sessions = [];
      
      querySnapshot.forEach((doc) => {
        const sessionData = doc.data();
        
        // Convertir timestamps a objetos Date
        const session = {
          ...sessionData,
          startDate: sessionData.startDate?.toDate() || new Date(),
          lastActive: sessionData.lastActive?.toDate() || new Date(),
          isCurrent: doc.id === localStorage.getItem('currentSessionId')
        };
        
        sessions.push(session);
      });
      
      // Ordenar por fecha, más recientes primero
      return sessions.sort((a, b) => b.startDate - a.startDate);
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
      return [];
    }
  };

  // Función para actualizar los datos del usuario en el contexto
  const updateUserData = (newData) => {
    setUserData(newData);
  };

  // Función para cerrar sesión
  const signOutUser = async () => {
    try {
      // Cerrar la sesión actual en Firestore
      const currentSessionId = localStorage.getItem('currentSessionId');
      if (currentSessionId) {
        await endSession(currentSessionId);
      }
      
      // Cerrar sesión en Firebase Auth
      await signOut(auth);
      localStorage.removeItem('currentSessionId');
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
    loading,
    getUserSessions,
    endSession,
    endAllOtherSessions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
