'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const DashboardPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    console.log("Dashboard: Verificando estado de autenticación...");
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("Dashboard: Usuario autenticado", currentUser.uid);
        setUser(currentUser);
      } else {
        console.log("Dashboard: No hay usuario autenticado, redirigiendo...");
        router.replace('/login');
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [router]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex justify-center items-center flex-col">
              <p className="text-2xl font-medium text-gray-700">
                Bienvenido, {user?.displayName || 'Usuario'}
              </p>
              <p className="text-gray-500 mt-2">
                Has iniciado sesión exitosamente.
              </p>
              <button
                onClick={() => auth.signOut().then(() => router.push('/login'))}
                className="mt-6 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;