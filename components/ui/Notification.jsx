'use client';
import React, { useState, useEffect } from 'react';
import { MdClose, MdCheckCircle, MdError, MdInfo, MdWarning } from 'react-icons/md';

export const NotificationContext = React.createContext({
  showNotification: () => {},
  hideNotification: () => {}
});

/**
 * Componente de notificación elegante para reemplazar los alerts del navegador
 */
const Notification = ({ 
  type = 'info', // 'success', 'error', 'warning', 'info'
  message, 
  isVisible, 
  duration = 5000, 
  onClose 
}) => {
  // Estado para controlar la animación de entrada/salida
  const [animation, setAnimation] = useState(isVisible ? 'notification-enter' : 'notification-exit');
  
  useEffect(() => {
    let timeout;
    
    if (isVisible) {
      setAnimation('notification-enter');
      
      // Configurar el timeout para cerrar automáticamente si duration > 0
      if (duration > 0) {
        timeout = setTimeout(() => {
          setAnimation('notification-exit');
          // Dar tiempo para que termine la animación antes de cerrar completamente
          setTimeout(() => {
            if (onClose) onClose();
          }, 300);
        }, duration);
      }
    } else {
      setAnimation('notification-exit');
    }
    
    // Limpieza del efecto
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isVisible, duration, onClose]);
  
  // Colores según el tipo de notificación
  const typeStyles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-500 dark:border-green-700',
      text: 'text-green-800 dark:text-green-400',
      icon: <MdCheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-500 dark:border-red-700',
      text: 'text-red-800 dark:text-red-400',
      icon: <MdError className="h-5 w-5 text-red-500 dark:text-red-400" />,
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      border: 'border-yellow-500 dark:border-yellow-700',
      text: 'text-yellow-800 dark:text-yellow-400',
      icon: <MdWarning className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />,
    },
    info: {
      bg: 'bg-cyan-50 dark:bg-cyan-900/30',
      border: 'border-cyan-500 dark:border-cyan-700',
      text: 'text-cyan-800 dark:text-cyan-400',
      icon: <MdInfo className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />,
    },
  };
  
  const styles = typeStyles[type] || typeStyles.info;
  
  // Si no hay mensaje, no renderizar nada
  if (!message) return null;
  
  const handleClose = () => {
    setAnimation('notification-exit');
    // Dar tiempo para que termine la animación antes de cerrar completamente
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };
  
  return (
    <div 
      className={`fixed top-4 right-4 z-50 ${animation} max-w-md shadow-lg rounded-lg border-l-4 ${styles.border} ${styles.bg}`}
      role="alert"
    >
      <div className="flex p-4">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={handleClose}
            className={`inline-flex rounded-md ${styles.text} hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400`}
          >
            <span className="sr-only">Cerrar</span>
            <MdClose className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;