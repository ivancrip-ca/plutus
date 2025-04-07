'use client'
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AuthGuard from "../../components/AuthGuard";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, userData } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  
  // Detectar sección activa basada en la ruta
  useEffect(() => {
    if (pathname.includes('/accounts')) {
      setActiveSection('accounts');
    } else if (pathname.includes('/transactions')) {
      setActiveSection('transactions');
    } else if (pathname.includes('/budget')) {
      setActiveSection('budget');
    } else if (pathname.includes('/reports')) {
      setActiveSection('reports');
    } else if (pathname.includes('/cloud')) {
      setActiveSection('cloud');
    } else if (pathname.includes('/configuracion/gestion_usuarios')) {
      setActiveSection('user_management');
    } else if (pathname.includes('/configuracion/perfil')) {
      setActiveSection('user_settings');
    } else if (pathname.includes('/configuracion/seguridad')) {
      setActiveSection('security');
    } else if (pathname.includes('/configuracion/ayuda')) {
      setActiveSection('help');
    } else if (pathname === '/dashboard') {
      setActiveSection('overview');
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AuthGuard>
      <div className="h-screen flex overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <DashboardSidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          handleLogout={handleLogout}
          user={currentUser}
          userData={userData}
        />

        {/* Main Content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Fixed header that stays visible when scrolling */}
          <div className="sticky top-0 z-0"> {/* Added 'relative' to establish a stacking context */}
            <DashboardHeader 
              toggleSidebar={toggleSidebar}
              user={currentUser}
              userData={userData}
            />
          </div>

          {/* Main content - children are injected here */}
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            <div className="">
              <div className="max-w-7xl">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}