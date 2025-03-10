'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/contexts/AuthContext';

export default function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si ya está autenticado, redirigir al dashboard
    if (!loading && isAuthenticated) {
      console.log("PublicRoute: Usuario ya autenticado, redirigiendo al dashboard");
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    // Mostrar pantalla de carga mientras se verifica la autenticación
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar los hijos (la página pública)
  if (!isAuthenticated) {
    return children;
  }

  // Si está autenticado, no mostrar nada (el useEffect redirigirá)
  return null;
}
