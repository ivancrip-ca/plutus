import React, { useState } from 'react';
import { MdMenu, MdNotifications, MdAdd, MdSearch } from 'react-icons/md';
import Image from 'next/image';

const DashboardHeader = ({ toggleSidebar, user, userData }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  
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

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex md:hidden items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Abrir menú</span>
              <MdMenu className="block h-6 w-6" />
            </button>
            
            {/* Search input */}
            <div className="hidden md:block ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm"
                  placeholder="Buscar transacciones, categorías..."
                  type="search"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Add transaction button - Cambiando a un color sólido */}
            <div className="relative">
              <button
                type="button"
                className="bg-cyan-600 p-1 rounded-full text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                onClick={() => setShowAddMenu(!showAddMenu)}
              >
                <span className="sr-only">Agregar transacción</span>
                <MdAdd className="h-6 w-6" />
              </button>
              
              {/* Add menu dropdown */}
              {showAddMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  {addMenuItems.map((item) => (
                    <a
                      key={item.id}
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowAddMenu(false);
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            
            {/* Notifications */}
            <div className="relative ml-4">
              <button
                type="button"
                className="bg-gray-100 p-1 rounded-full text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="sr-only">Ver notificaciones</span>
                <MdNotifications className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map((notification) => (
                      <a
                        key={notification.id}
                        href="#"
                        className="block px-4 py-3 hover:bg-gray-100"
                        onClick={(e) => e.preventDefault()}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <span className="inline-block h-8 w-8 rounded-full bg-cyan-100 text-cyan-500 flex items-center justify-center">
                              <MdNotifications className="h-5 w-5" />
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-500">{notification.message}</p>
                            <p className="text-xs text-gray-400">{notification.time}</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* User profile */}
            <div className="ml-4 relative">
              <div>
                <button
                  type="button"
                  className="bg-gray-100 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Abrir menú de usuario</span>
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={userPhoto}
                    alt={userName || "Usuario"}
                    width="32"
                    height="32"
                    onError={handleImageError}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
