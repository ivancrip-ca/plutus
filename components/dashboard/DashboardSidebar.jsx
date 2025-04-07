import React, { useState, useEffect } from 'react';
import {
  MdDashboard, MdAccountBalance, MdAttachMoney, MdTrendingUp,
  MdPieChart, MdSettings, MdLogout, MdClose, MdExpandMore,
  MdExpandLess, MdCloud, MdPeople, MdPerson, MdSecurity, MdHelp
} from 'react-icons/md';
import Image from 'next/image'; // Importar Image desde next/image
import Link from 'next/link'; // Añadimos la importación de Link
import { useRouter } from 'next/navigation'; // Importar useRouter para la navegación
import { useTheme } from '../../app/contexts/ThemeContext'; // Import useTheme hook

const DashboardSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  activeSection, 
  setActiveSection, 
  handleLogout, 
  user, 
  userData,
  darkMode: darkModeProp = false // Keep darkMode prop for backward compatibility, but don't use it directly
}) => {
  const router = useRouter(); // Inicializar el router
  const { darkMode } = useTheme(); // Use ThemeContext to get global dark mode state
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before using darkMode from context
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Mapear secciones a sus rutas correspondientes
  const sectionToPath = {
    overview: '/dashboard',
    accounts: '/dashboard/accounts',
    transactions: '/dashboard/transactions',
    budget: '/dashboard/budget',
    reports: '/dashboard/reports',
    cloud: '/dashboard/cloud',
    user_settings: '/dashboard/configuracion/perfil',
    user_management: '/dashboard/configuracion/gestion_usuarios',
    security: '/dashboard/configuracion/seguridad',
    help: '/dashboard/configuracion/ayuda'
  };

  // Define color schemes for dark and light modes
  const colors = {
    sidebar: darkMode ? 'bg-slate-800' : 'bg-cyan-600',
    sidebarText: darkMode ? 'text-gray-100' : 'text-white',
    sidebarSubtext: darkMode ? 'text-gray-300' : 'text-cyan-100',
    iconColor: darkMode ? 'text-gray-300' : 'text-cyan-200',
    navItemActive: darkMode ? 'bg-slate-700' : 'bg-cyan-700 bg-opacity-75',
    navItemHover: darkMode ? 'hover:bg-slate-700' : 'hover:bg-cyan-700',
    submenuActive: darkMode ? 'bg-slate-600' : 'bg-cyan-800',
    border: darkMode ? 'border-slate-700' : 'border-cyan-500',
    borderBottom: darkMode ? 'border-slate-600' : 'border-cyan-700',
    badgeBg: darkMode ? 'bg-slate-600' : 'bg-cyan-700',
    badgeText: darkMode ? 'text-gray-200' : 'text-cyan-100',
    backdrop: darkMode ? 'bg-black bg-opacity-75' : 'bg-gray-800 bg-opacity-75'
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
                ? colors.navItemActive + ' ' + colors.sidebarText
                : colors.sidebarSubtext + ' ' + colors.navItemHover
            } group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150`}
          >
            <div className="flex items-center">
              <div className={`mr-3 flex-shrink-0 ${colors.iconColor}`}>{item.icon}</div>
              {item.name}
            </div>
            {expandedMenus[item.id] ? 
              <MdExpandLess className={`flex-shrink-0 ${colors.iconColor}`} /> : 
              <MdExpandMore className={`flex-shrink-0 ${colors.iconColor}`} />
            }
          </a>
          
          {expandedMenus[item.id] && (
            <div className="pl-10 space-y-1">
              {item.submenu.map(subItem => (
                <Link
                  key={subItem.id}
                  href={sectionToPath[subItem.id]}
                  onClick={() => {
                    setActiveSection(subItem.id);
                    if (window.innerWidth < 768) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`${
                    activeSection === subItem.id
                      ? colors.submenuActive + ' ' + colors.sidebarText
                      : colors.sidebarSubtext + ' ' + colors.navItemHover
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150`}
                >
                  <div className={`mr-3 flex-shrink-0 ${colors.iconColor}`}>{subItem.icon}</div>
                  {subItem.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <Link
          key={item.id}
          href={sectionToPath[item.id]}
          onClick={() => {
            setActiveSection(item.id);
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
          className={`${
            activeSection === item.id
              ? colors.navItemActive + ' ' + colors.sidebarText
              : colors.sidebarSubtext + ' ' + colors.navItemHover
          } group flex items-center px-3 py-3 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150`}
        >
          <div className={`mr-3 flex-shrink-0 ${colors.iconColor}`}>{item.icon}</div>
          {item.name}
        </Link>
      );
    }
  };

  // Show minimal content during server rendering
  if (!mounted) {
    return (
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-cyan-600">
            {/* Minimal placeholder during hydration */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Backdrop */}
          <div
            className={`fixed inset-0 ${colors.backdrop}`}
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar content */}
          <div className={`relative flex-1 flex flex-col max-w-xs w-full ${colors.sidebar} ${colors.sidebarText}`}>
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
              <h1 className={`text-2xl font-bold text-center ${colors.sidebarText}`}>Plutus</h1>
            </div>
            
            {/* User info */}
            <div className={`flex-shrink-0 flex flex-col items-center px-4 py-4 border-t border-b ${colors.border}`}>
              <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2">
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
                <p className={`text-sm font-medium ${colors.sidebarText}`}>{userName}</p>
                <p className={`text-xs ${colors.sidebarSubtext} truncate`}>{userEmail}</p>
                <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium ${colors.badgeBg} ${colors.badgeText}`}>
                  {registrationMethod}
                </span>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="mt-6 flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-3 pb-4 space-y-3">
                {navItems.map(item => renderNavItem(item))}
                
                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className={`mt-4 ${colors.sidebarSubtext} ${colors.navItemHover} group flex items-center px-3 py-3 text-base font-medium rounded-md cursor-pointer transition-colors duration-150 w-full`}
                >
                  <div className={`mr-4 flex-shrink-0 ${colors.iconColor}`}>
                    <MdLogout className="w-6 h-6" />
                  </div>
                  Cerrar sesión
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop sidebar (always visible) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className={`flex flex-col h-0 flex-1 ${colors.sidebar}`}>
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              {/* Brand/logo */}
              <div className="flex items-center flex-shrink-0 px-4 py-4">
                <h1 className={`text-2xl font-bold ${colors.sidebarText}`}>Plutus</h1>
              </div>
              
              {/* User info */}
              <div className={`flex-shrink-0 flex flex-col items-center px-4 py-4 border-t border-b ${colors.border}`}>
                <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2">
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
                  <p className={`text-sm font-medium ${colors.sidebarText}`}>{userName}</p>
                  <p className={`text-xs ${colors.sidebarSubtext} truncate`}>{userEmail}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium ${colors.badgeBg} ${colors.badgeText}`}>
                    {registrationMethod}
                  </span>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="mt-6 flex-1 px-3 space-y-3">
                {navItems.map(item => renderNavItem(item))}
                
                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className={`mt-6 ${colors.sidebarSubtext} ${colors.navItemHover} group flex items-center px-3 py-3 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 w-full`}
                >
                  <div className={`mr-3 flex-shrink-0 ${colors.iconColor}`}>
                    <MdLogout className="w-6 h-6" />
                  </div>
                  Cerrar sesión
                </button>
              </nav>
            </div>
            
            {/* Version info */}
            <div className={`flex-shrink-0 flex border-t ${colors.borderBottom} p-4`}>
              <div className="flex-shrink-0 w-full group block">
                <p className={`text-xs ${colors.sidebarSubtext} text-center`}>
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
