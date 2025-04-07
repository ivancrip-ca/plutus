import React, { useState, useEffect } from 'react';
import { MdMenu, MdNotifications, MdAdd, MdSearch, MdLightMode, MdDarkMode } from 'react-icons/md';
import Image from 'next/image';
import { useTheme } from '../../app/contexts/ThemeContext';

const DashboardHeader = ({ toggleSidebar, user, userData }) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Ensure component is mounted before rendering theme-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const userName = userData?.firstName || user?.displayName?.split(' ')[0] || 'Usuario';
  const userPhoto = user?.photoURL || '/images/logoPlutus.png';
  
  const notifications = [
    { id: 'n1', title: 'Alerta de presupuesto', message: 'Has superado el 90% de tu presupuesto de Entretenimiento', time: '5 min' },
    { id: 'n2', title: 'Meta de ahorro', message: 'Has alcanzado el 70% de tu meta "Vacaciones"', time: '1h' },
    { id: 'n3', title: 'Recordatorio', message: 'Pago de servicios pendiente para mañana', time: '3h' }
  ];
  
  const addMenuItems = [
    { id: 'add-income', label: 'Ingreso', icon: 'plus' },
    { id: 'add-expense', label: 'Gasto', icon: 'minus' },
    { id: 'add-transfer', label: 'Transferencia', icon: 'transfer' },
    { id: 'add-account', label: 'Cuenta', icon: 'account' }
  ];

  // Usar una imagen local en caso de error con la imagen de Google
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevenir bucle infinito
    e.target.src = '';
  };

  // Handle theme toggle with logging
  const handleThemeToggle = () => {
    console.log('Theme toggle clicked, current mode:', darkMode);
    toggleDarkMode();
  };

  // Don't render theme-specific elements until client-side hydration is complete
  if (!mounted) {
    return (
      <header className="bg-white shadow-sm z-10">
        {/* Minimal header during SSR/hydration */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Loading placeholder */}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-sm z-10`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className={`inline-flex md:hidden items-center justify-center p-2 rounded-md ${
                darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500`}
              onClick={toggleSidebar}
            >
              <span className="sr-only">Abrir menú</span>
              <MdMenu className="block h-6 w-6" />
            </button>
            
            {/* Search input */}
            <div className="hidden md:block ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    darkMode ? 'border-gray-700 bg-gray-700 placeholder-gray-400 text-white' : 'border-gray-200 bg-gray-50 placeholder-gray-500'
                  } rounded-md leading-5 focus:outline-none focus:placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm`}
                  placeholder="Buscar transacciones, categorías..."
                  type="search"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Theme toggle button */}
            <button
              type="button"
              className={`p-1 rounded-full cursor-pointer ${
                darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-500 hover:text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500`}
              onClick={handleThemeToggle}
            >
              <span className="sr-only">Cambiar tema</span>
              {darkMode ? <MdLightMode className="h-6 w-6" /> : <MdDarkMode className="h-6 w-6" />}
            </button>
            
            {/* Add transaction button */}
            <div className="relative ml-4">
              <button
                type="button"
                className="bg-cyan-600 p-1 rounded-full text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                onClick={() => setShowAddMenu(!showAddMenu)}
              >
                <span className="sr-only">Add transaction</span>
                <MdAdd className="h-6 w-6" />
              </button>
            </div>
            
            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <div>
                <Image 
                  className="h-8 w-8 rounded-full" 
                  src={userPhoto} 
                  alt={`${userName}'s profile`}
                  width={32}
                  height={32}
                  onError={handleImageError}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
