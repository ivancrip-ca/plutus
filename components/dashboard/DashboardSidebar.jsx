import React, { useState } from 'react';
import {
  MdDashboard, MdAccountBalance, MdAttachMoney, MdTrendingUp,
  MdPieChart, MdSettings, MdLogout, MdClose, MdExpandMore,
  MdExpandLess, MdCloud, MdPeople, MdPerson, MdSecurity, MdHelp
} from 'react-icons/md';
import Image from 'next/image'; // Importar Image desde next/image
import { useRouter } from 'next/navigation'; // Importar useRouter para la navegación

const DashboardSidebar = ({ sidebarOpen, setSidebarOpen, activeSection, setActiveSection, handleLogout, user, userData }) => {
  const router = useRouter(); // Inicializar el router
  
  // State for tracking expanded submenus
  const [expandedMenus, setExpandedMenus] = useState({
    settings: false
  });

  // Toggle submenu expansion
  const toggleSubmenu = (menuId) => {
    setExpandedMenus({
      ...expandedMenus,
      [menuId]: !expandedMenus[menuId]
    });
  };

  const navItems = [
    { id: 'overview', name: 'Resumen', icon: <MdDashboard className="w-6 h-6" /> },
    { id: 'accounts', name: 'Cuentas', icon: <MdAccountBalance className="w-6 h-6" /> },
    { id: 'transactions', name: 'Transacciones', icon: <MdAttachMoney className="w-6 h-6" /> },
    { id: 'budget', name: 'Presupuestos', icon: <MdPieChart className="w-6 h-6" /> },
    { id: 'reports', name: 'Informes', icon: <MdTrendingUp className="w-6 h-6" /> },
    { id: 'cloud', name: 'Mi Nube', icon: <MdCloud className="w-6 h-6" /> },
    { 
      id: 'settings', 
      name: 'Configuración', 
      icon: <MdSettings className="w-6 h-6" />,
      hasSubmenu: true,
      submenu: [
        { id: 'user_settings', name: 'Mi Perfil', icon: <MdPerson className="w-5 h-5" /> },
        { id: 'user_management', name: 'Gestión de Usuarios', icon: <MdPeople className="w-5 h-5" /> },
        { id: 'security', name: 'Seguridad', icon: <MdSecurity className="w-5 h-5" /> },
        { id: 'help', name: 'Ayuda', icon: <MdHelp className="w-5 h-5" /> },
      ]
    }
  ];

  const userName = userData?.firstName && userData?.lastName 
    ? `${userData.firstName} ${userData.lastName}`
    : user?.displayName || 'Usuario';
    
  const userEmail = user?.email || '';
  const userPhoto = user?.photoURL || '/images/logoPlutus.png';
  const registrationMethod = userData?.registrationMethod || 'Email';

  // Usar una imagen local en caso de error con la imagen de Google
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevenir bucle infinito
    e.target.src = '/images/logoPlutus.png'; // Asegúrate de tener esta imagen en tu carpeta public/images
  };

  // Helper function to render nav items with submenus
  const renderNavItem = (item) => {
    if (item.hasSubmenu) {
      return (
        <div key={item.id} className="space-y-1">
          <a
            onClick={() => toggleSubmenu(item.id)}
            className={`${
              activeSection === item.id || (expandedMenus[item.id] && item.submenu.some(sub => activeSection === sub.id))
                ? 'bg-cyan-700 bg-opacity-75 text-white'
                : 'text-cyan-100 hover:bg-cyan-700'
            } group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150`}
          >
            <div className="flex items-center">
              <div className="mr-3 flex-shrink-0 text-cyan-200">{item.icon}</div>
              {item.name}
            </div>
            {expandedMenus[item.id] ? 
              <MdExpandLess className="flex-shrink-0 text-cyan-200" /> : 
              <MdExpandMore className="flex-shrink-0 text-cyan-200" />
            }
          </a>
          
          {expandedMenus[item.id] && (
            <div className="pl-10 space-y-1">
              {item.submenu.map(subItem => (
                <a
                  key={subItem.id}
                  onClick={() => {
                    setActiveSection(subItem.id);
                    
                    // Navegar directamente a la página correspondiente según el ID
                    if (subItem.id === 'user_management') {
                      router.push('/dashboard/configuracion/gestion_usuarios');
                    } else if (subItem.id === 'user_settings') {
                      router.push('/dashboard/configuracion/perfil');
                    } else if (subItem.id === 'security') {
                      router.push('/dashboard/configuracion/seguridad');
                    } else if (subItem.id === 'help') {
                      router.push('/dashboard/configuracion/ayuda');
                    }
                    
                    if (window.innerWidth < 768) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`${
                    activeSection === subItem.id
                      ? 'bg-cyan-800 text-white'
                      : 'text-cyan-100 hover:bg-cyan-700'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150`}
                >
                  <div className="mr-3 flex-shrink-0 text-cyan-200">{subItem.icon}</div>
                  {subItem.name}
                </a>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <a
          key={item.id}
          onClick={() => {
            setActiveSection(item.id);
            
            // Redireccionar a la página principal del dashboard cuando se hace clic en resumen
            if (item.id === 'overview') {
              router.push('/dashboard');
            }
            
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
          className={`${
            activeSection === item.id
              ? 'bg-cyan-700 bg-opacity-75 text-white'
              : 'text-cyan-100 hover:bg-cyan-700'
          } group flex items-center px-3 py-3 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150`}
        >
          <div className="mr-3 flex-shrink-0 text-cyan-200">{item.icon}</div>
          {item.name}
        </a>
      );
    }
  };

  return (
    <>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-800 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar content - Cambiando a un color sólido de azul cyan */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-cyan-600 text-white">
            {/* Close button */}
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Cerrar barra lateral</span>
                <MdClose className="h-6 w-6 text-white" />
              </button>
            </div>
            
            {/* Brand/logo */}
            <div className="flex-shrink-0 flex items-center px-4 py-6 ">
              <h1 className="text-2xl font-bold text-center">Plutus</h1>
            </div>
            
            {/* User info - Modificando bordes */}
            <div className="flex-shrink-0 flex flex-col items-center px-4 py-4 border-t border-cyan-500 border-b">
              <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2">
                {/* Reemplazar Image con img */}
                <Image
                  src="/images/logoPlus.png"
                  alt={userName}
                  width="64"
                  height="64"
                  className="object-cover w-full h-full"
                  onError={handleImageError}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-cyan-100 truncate">{userEmail}</p>
                <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-cyan-700 text-cyan-100">
                  {registrationMethod}
                </span>
              </div>
            </div>
            
            {/* Navigation - Manteniendo el espaciado mejorado */}
            <div className="mt-6 flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-3 pb-4 space-y-3"> {/* Aumentar espaciado vertical */}
                {navItems.map(item => renderNavItem(item))}
                
                {/* Logout button - Añadiendo más separación */}
                <a
                  onClick={handleLogout}
                  className="mt-4 text-cyan-100 hover:bg-cyan-700 group flex items-center px-3 py-3 text-base font-medium rounded-md cursor-pointer transition-colors duration-150"
                >
                  <div className="mr-4 flex-shrink-0 text-cyan-200">
                    <MdLogout className="w-6 h-6" />
                  </div>
                  Cerrar sesión
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop sidebar (always visible) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-cyan-600">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              {/* Brand/logo */}
              <div className="flex items-center flex-shrink-0 px-4 py-4">
                <h1 className="text-2xl font-bold text-white">Plutus</h1>
              </div>
              
              {/* User info - Modificando bordes y colores */}
              <div className="flex-shrink-0 flex flex-col items-center px-4 py-4 border-t border-cyan-500 border-b">
                <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2">
                  {/* Reemplazar Image con img */}
                  <Image
                    src="/images/logoPlutus.png"
                    alt={userName}
                    width="64"
                    height="64"
                    className="object-cover w-full h-full"
                    onError={handleImageError}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <p className="text-xs text-cyan-100 truncate">{userEmail}</p>
                  <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-cyan-700 text-cyan-100">
                    {registrationMethod}
                  </span>
                </div>
              </div>
              
              {/* Navigation - Aumentando el espaciado entre elementos */}
              <nav className="mt-6 flex-1 px-3 space-y-3"> {/* Aumentar espaciado vertical */}
                {navItems.map(item => renderNavItem(item))}
                
                {/* Logout button - Añadiendo más separación */}
                <a
                  onClick={handleLogout}
                  className="mt-6 text-cyan-100 hover:bg-cyan-700 group flex items-center px-3 py-3 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150"
                >
                  <div className="mr-3 flex-shrink-0 text-cyan-200">
                    <MdLogout className="w-6 h-6" />
                  </div>
                  Cerrar sesión
                </a>
              </nav>
            </div>
            
            {/* Version info - Cambiando el color del borde */}
            <div className="flex-shrink-0 flex border-t border-cyan-700 p-4">
              <div className="flex-shrink-0 w-full group block">
                <p className="text-xs text-cyan-200 text-center">
                  Plutus v1.0.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
