import React, { useState, useEffect, useRef } from 'react';
import { MdMenu, MdNotifications, MdAdd, MdSearch, MdLightMode, MdDarkMode, MdCreditCard, MdAttachMoney } from 'react-icons/md';
import Image from 'next/image';
import { useTheme } from '../../app/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Añadimos estilos globales para la animación y el menú
const styles = {
  addMenuContainer: {
    position: 'relative'
  },
  addMenuDropdown: {
    position: 'absolute',
    animation: 'fadeIn 0.2s ease-out',
    zIndex: 9999, // Valor extremadamente alto
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(-10px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  }
};

const DashboardHeader = ({ toggleSidebar, user, userData }) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const addMenuRef = useRef(null);
  
  // Ensure component is mounted before rendering theme-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Efecto para cerrar el menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target)) {
        setShowAddMenu(false);
      }
    }
    
    // Añadir evento cuando el menú está abierto
    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Limpieza del evento
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddMenu]);
  
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

  // Función para navegar a la página de perfil
  const handleProfileClick = () => {
    router.push('/dashboard/configuracion/perfil');
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
              className={`cursor-pointer inline-flex md:hidden items-center justify-center p-2 rounded-md ${
                darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500`}
              onClick={toggleSidebar}
            >
              <span className="sr-only">Abrir menú</span>
              <MdMenu className="block h-6 w-6" />
            </button>
            
            
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
            
          
            
            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <div>
                <Image 
                  className="h-8 w-8 rounded-full cursor-pointer" 
                  src={userPhoto} 
                  alt={`${userName}'s profile`}
                  width={32}
                  height={32}
                  onError={handleImageError}
                  onClick={handleProfileClick}
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
