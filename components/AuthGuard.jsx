
'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/contexts/AuthContext';

export default function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo realizar la verificación después de que se complete la carga
    if (!loading && !isAuthenticated) {
      console.log("AuthGuard: Usuario no autenticado, redirigiendo al login");
      router.replace('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    // Mostrar pantalla de carga mientras se verifica la autenticación
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si está autenticado, mostrar los hijos (el contenido protegido)
  if (isAuthenticated) {
    return children;
  }

  // Si no está autenticado, no mostrar nada 
  // (el useEffect se encargará de la redirección)
  return null;
}