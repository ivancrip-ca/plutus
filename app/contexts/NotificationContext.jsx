'use client';
import React, { useState } from 'react';
import Notification from '../../components/ui/Notification';

// Crear contexto para las notificaciones
export const NotificationContext = React.createContext({
  showNotification: () => {},
  hideNotification: () => {}
});

/**
 * Proveedor de notificaciones para la aplicación
 */
export function NotificationProvider({ children }) {
  const [notificationState, setNotificationState] = useState({
    isVisible: false,
    message: '',
    type: 'info',
    duration: 5000
  });

  // Función para mostrar una notificación
  const showNotification = (message, type = 'info', duration = 5000) => {
    setNotificationState({
      isVisible: true,
      message,
      type,
      duration
    });
  };

  // Función para ocultar la notificación
  const hideNotification = () => {
    setNotificationState(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      
      {/* Renderizar el componente de notificación */}
      <Notification 
        message={notificationState.message}
        type={notificationState.type}
        isVisible={notificationState.isVisible}
        duration={notificationState.duration}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  );
}