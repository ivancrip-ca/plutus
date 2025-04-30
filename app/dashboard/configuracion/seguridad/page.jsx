'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdLock,
  MdEdit,
  MdSave,
  MdCancel,
  MdSecurity,
  MdPhoneAndroid,
  MdPassword,
  MdDeleteForever,
  MdWarning,
  MdCheck,
  MdClose,
  MdHistory,
  MdInfoOutline
} from 'react-icons/md';
import { useTheme } from '../../../../app/contexts/ThemeContext';
import { useAuth } from '../../../../app/contexts/AuthContext';
import { NotificationContext } from '../../../../app/contexts/NotificationContext';
import { auth, db } from '../../../../app/firebase';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const SecurityPage = () => {
  const { darkMode } = useTheme();
  const { currentUser, userData, logout, getUserSessions, endSession, endAllOtherSessions } = useAuth();
  const { showNotification } = useContext(NotificationContext);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Estados para los modos de edición
  const [changingPassword, setChangingPassword] = useState(false);
  const [enabling2FA, setEnabling2FA] = useState(false);

  // Estados para las contraseñas
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  // Estados para la autenticación de dos factores
  const [twoFactorMethod, setTwoFactorMethod] = useState('email');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Estado para la eliminación de cuenta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Estado de seguridad de contraseña
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Estados para historial de sesiones
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [closingSession, setClosingSession] = useState(false);
  const [closingAllSessions, setClosingAllSessions] = useState(false);
  const [sessionActionSuccess, setSessionActionSuccess] = useState('');
  
  // Estados para los modales de recursos de seguridad
  const [showSecurityPracticesModal, setShowSecurityPracticesModal] = useState(false);
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);
  const [showHelpCenterModal, setShowHelpCenterModal] = useState(false);

  // Cargar datos de 2FA y sesiones al montar el componente
  useEffect(() => {
    setMounted(true);

    if (userData) {
      setTwoFactorEnabled(userData.security?.twoFactorEnabled || false);
      setTwoFactorMethod(userData.security?.twoFactorMethod || 'email');
      setPhoneNumber(userData.phoneNumber || '');
    }

    // Cargar historial de sesiones
    if (currentUser) {
      loadSessionHistory();
    }
  }, [userData, currentUser]);

  // Función para cargar el historial de sesiones
  const loadSessionHistory = async () => {
    setLoadingSessions(true);
    setSessionError('');
    
    try {
      const sessions = await getUserSessions();
      setSessionHistory(sessions);
    } catch (error) {
      console.error('Error al cargar historial de sesiones:', error);
      setSessionError('No se pudo cargar el historial de sesiones');
    } finally {
      setLoadingSessions(false);
    }
  };

  // Función para cerrar una sesión específica
  const handleCloseSession = async (sessionId) => {
    setClosingSession(sessionId);
    setSessionError('');
    setSessionActionSuccess('');
    
    try {
      const success = await endSession(sessionId);
      
      if (success) {
        setSessionActionSuccess('Sesión cerrada correctamente');
        // Recargar el historial de sesiones
        await loadSessionHistory();
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSessionActionSuccess('');
        }, 3000);
      } else {
        setSessionError('No se pudo cerrar la sesión');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setSessionError('Error al cerrar la sesión');
    } finally {
      setClosingSession(false);
    }
  };

  // Función para cerrar todas las sesiones excepto la actual
  const handleCloseAllOtherSessions = async () => {
    setClosingAllSessions(true);
    setSessionError('');
    setSessionActionSuccess('');
    
    try {
      const success = await endAllOtherSessions();
      
      if (success) {
        setSessionActionSuccess('Todas las otras sesiones cerradas correctamente');
        // Recargar el historial de sesiones
        await loadSessionHistory();
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSessionActionSuccess('');
        }, 3000);
      } else {
        setSessionError('No se pudieron cerrar todas las sesiones');
      }
    } catch (error) {
      console.error('Error al cerrar todas las sesiones:', error);
      setSessionError('Error al cerrar todas las sesiones');
    } finally {
      setClosingAllSessions(false);
    }
  };

  // Función para cambiar contraseña
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      setPasswordError('Por favor, introduce tu contraseña actual');
      return;
    }

    try {
      // Crear credencial para reautenticar directamente sin mostrar modal
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      // Reautenticar al usuario
      await reauthenticateWithCredential(currentUser, credential);

      // Una vez autenticado, enviar el correo de restablecimiento
      try {
        // Determinar si estamos en desarrollo o producción
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        // URL base para el redireccionamiento
        let baseUrl;
        if (isLocalhost) {
          // Para desarrollo local (usando puerto 3000 por defecto para Next.js)
          baseUrl = `http://${window.location.hostname}:${window.location.port || '3000'}`;
        } else {
          // Para producción
          baseUrl = window.location.origin;
        }
        
        // Configurar los ajustes de restablecimiento de contraseña
        const actionCodeSettings = {
          url: `${baseUrl}/reset-password`,
          handleCodeInApp: true
        };
        
        // Enviar el correo de restablecimiento de contraseña
        await sendPasswordResetEmail(auth, currentUser.email, actionCodeSettings);
        
        // Actualizar estado
        setPasswordSuccess(true);
        setPasswordResetSent(true);
        setPasswordError('');
        setCurrentPassword('');
        setChangingPassword(false);

        // Resetear el estado después de 5 segundos
        setTimeout(() => {
          setPasswordSuccess(false);
          setPasswordResetSent(false);
        }, 5000);
      } catch (error) {
        console.error("Error al enviar correo de restablecimiento:", error);
        setPasswordError('Error al enviar el correo de restablecimiento: ' + error.message);
      }
    } catch (error) {
      console.error("Error al autenticar:", error);
      setPasswordError('La contraseña actual es incorrecta');
    }
  };

  // Función para habilitar 2FA
  const handleEnable2FA = async (e) => {
    e.preventDefault();

    // Validar que hay un método seleccionado
    if (!twoFactorMethod) {
      return;
    }

    // Si el método es SMS, validar que hay un número de teléfono
    if (twoFactorMethod === 'sms' && !phoneNumber) {
      return;
    }

    try {
      // Actualizar preferencias de 2FA en Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        'security.twoFactorEnabled': true,
        'security.twoFactorMethod': twoFactorMethod
      });

      // Actualizar estado
      setTwoFactorEnabled(true);
      setEnabling2FA(false);
    } catch (error) {
      console.error('Error al activar 2FA:', error);
    }
  };

  // Función para deshabilitar 2FA
  const handleDisable2FA = async () => {
    try {
      // Actualizar preferencias de 2FA en Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        'security.twoFactorEnabled': false
      });

      // Actualizar estado
      setTwoFactorEnabled(false);
    } catch (error) {
      console.error('Error al desactivar 2FA:', error);
    }
  };

  // Función para enviar correo de verificación
  const sendVerification = async () => {
    try {
      await sendEmailVerification(currentUser);
    } catch (error) {
      console.error('Error al enviar correo de verificación:', error);
    }
  };

  // Formatear fecha
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Si aún no se ha montado el componente, mostrar un placeholder
  if (!mounted) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 gap-6">
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen max-w-full`}>
      <div className="max-w-screen-2xl mx-auto">
        <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Seguridad de la Cuenta</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna izquierda - Información de seguridad */}
          <div className="md:col-span-1 space-y-6">
            {/* Estado de seguridad */}
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h2 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Estado de seguridad
              </h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className={`rounded-full p-1.5 mt-0.5 ${currentUser?.emailVerified ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'}`}>
                    {currentUser?.emailVerified ? <MdCheck className="h-4 w-4" /> : <MdWarning className="h-4 w-4" />}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email verificado
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {currentUser?.emailVerified
                        ? 'Tu correo electrónico ha sido verificado.'
                        : 'Tu correo electrónico no está verificado.'}
                    </p>
                    {!currentUser?.emailVerified && (
                      <div className="mt-2">
                        <button
                          onClick={async () => {
                            try {
                              // Definir URL de redireccionamiento que permita verificar el correo correctamente
                              const actionCodeSettings = {
                                url: window.location.origin + '/verify-email', // Redirigir a la página de verificación
                                handleCodeInApp: false // Cambiar a false para que use el flujo normal de Firebase
                              };
                              
                              await sendEmailVerification(auth.currentUser, actionCodeSettings);
                              showNotification('Hemos enviado un correo de verificación a tu dirección. Por favor, revisa tu bandeja de entrada y sigue las instrucciones.', 'success');
                            } catch (error) {
                              console.error('Error al enviar correo de verificación:', error);
                              
                              if (error.code === 'auth/too-many-requests') {
                                showNotification('Has enviado demasiadas solicitudes de verificación recientemente. Por favor, espera unos minutos antes de intentarlo de nuevo.', 'warning');
                              } else {
                                showNotification('No se pudo enviar el correo de verificación. Por favor, intenta de nuevo más tarde.', 'error');
                              }
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium 
                            ${darkMode
                              ? 'bg-cyan-900/30 text-cyan-400 hover:bg-cyan-900/50'
                              : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'}`}
                        >
                          Verificar ahora
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`rounded-full p-1.5 mt-0.5 ${twoFactorEnabled ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'}`}>
                    {twoFactorEnabled ? <MdCheck className="h-4 w-4" /> : <MdWarning className="h-4 w-4" />}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Autenticación de dos factores
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {twoFactorEnabled
                        ? `2FA activado vía ${twoFactorMethod === 'email' ? 'correo electrónico' : 'SMS'}.`
                        : 'La autenticación de dos factores no está activada.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`rounded-full p-1.5 mt-0.5 ${sessionHistory.filter(s => s.status === 'active').length === 1 ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'}`}>
                    {sessionHistory.filter(s => s.status === 'active').length === 1 ? <MdCheck className="h-4 w-4" /> : <MdWarning className="h-4 w-4" />}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sesiones activas
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {sessionHistory.filter(s => s.status === 'active').length} sesión(es) activa(s) en este momento.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recursos de seguridad */}
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h2 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Recursos de seguridad
              </h2>

              <div className="space-y-3">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSecurityPracticesModal(true);
                  }}
                  className={`block p-3 rounded-lg border ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Buenas prácticas de seguridad
                  </h3>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Aprende cómo mantener tu cuenta segura con estos consejos.
                  </p>
                </a>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPrivacyPolicyModal(true);
                  }}
                  className={`block p-3 rounded-lg border ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Política de privacidad
                  </h3>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Información sobre cómo protegemos tus datos personales.
                  </p>
                </a>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowHelpCenterModal(true);
                  }}
                  className={`block p-3 rounded-lg border ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Centro de ayuda
                  </h3>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Contacta con nuestro equipo de soporte para problemas de seguridad.
                  </p>
                </a>
              </div>
            </div>
          </div>

          {/* Columna derecha - Configuración de seguridad */}
          <div className="md:col-span-2 space-y-6">
            {/* Cambio de contraseña */}
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Contraseña
                </h2>

                {!changingPassword ? (
                  <button
                    onClick={() => setChangingPassword(true)}
                    className={`p-1.5 rounded-lg ${darkMode
                        ? 'text-gray-300 hover:text-cyan-400 hover:bg-gray-700'
                        : 'text-gray-600 hover:text-cyan-600 hover:bg-gray-100'
                      }`}
                  >
                    <MdEdit className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setChangingPassword(false);
                        setCurrentPassword('');
                        setPasswordError('');
                      }}
                      className={`p-1.5 rounded-lg ${darkMode
                          ? 'text-gray-300 hover:text-red-400 hover:bg-gray-700'
                          : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
                        }`}
                    >
                      <MdCancel className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {passwordSuccess && (
                <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                  <div className="flex items-center">
                    <MdCheck className="h-5 w-5 mr-2" />
                    <p className="text-sm">{passwordResetSent ? 'Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.' : 'Contraseña actualizada con éxito.'}</p>
                  </div>
                </div>
              )}

              {passwordError && (
                <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>
                  <div className="flex items-center">
                    <MdWarning className="h-5 w-5 mr-2" />
                    <p className="text-sm">{passwordError}</p>
                  </div>
                </div>
              )}

              {changingPassword ? (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500'
                          : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                        } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                      required
                    />
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Ingresa tu contraseña actual para verificar tu identidad. Luego recibirás un correo para establecer una nueva contraseña.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-lg text-sm font-medium 
                        ${darkMode
                          ? 'bg-cyan-700 text-white hover:bg-cyan-600'
                          : 'bg-cyan-600 text-white hover:bg-cyan-700'
                        } transition-colors duration-150`}
                    >
                      Cambiar Contraseña
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Última actualización: {userData?.security?.lastPasswordChange || 'Nunca'}
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Recomendamos cambiar tu contraseña periódicamente para mantener tu cuenta segura.
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <MdPassword className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Autenticación de dos factores */}
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Autenticación de dos factores
                </h2>

                {twoFactorEnabled ? (
                  <button
                    onClick={handleDisable2FA}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium 
                      ${darkMode
                        ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                  >
                    Desactivar
                  </button>
                ) : (
                  <>
                    {!enabling2FA ? (
                      <button
                        onClick={() => setEnabling2FA(true)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium 
                          ${darkMode
                            ? 'bg-cyan-900/30 text-cyan-400 hover:bg-cyan-900/50'
                            : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'}`}
                      >
                        Activar
                      </button>
                    ) : (
                      <button
                        onClick={() => setEnabling2FA(false)}
                        className={`p-1.5 rounded-lg ${darkMode
                            ? 'text-gray-300 hover:text-red-400 hover:bg-gray-700'
                            : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
                          }`}
                      >
                        <MdCancel className="h-5 w-5" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {twoFactorEnabled ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'} border ${darkMode ? 'border-green-800' : 'border-green-200'}`}>
                    <div className="flex items-start">
                      <div className={`p-1 rounded-full ${darkMode ? 'bg-green-800' : 'bg-green-200'}`}>
                        <MdCheck className={`h-4 w-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                          Autenticación de dos factores activada
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-green-400/70' : 'text-green-600'}`}>
                          Tu cuenta está protegida con autenticación de dos factores vía {twoFactorMethod === 'email' ? 'correo electrónico' : 'SMS'}.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Método actual: {twoFactorMethod === 'email' ? 'Correo electrónico' : 'SMS'}
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {twoFactorMethod === 'email'
                        ? `Se enviará un código de verificación a ${currentUser?.email}`
                        : `Se enviará un código de verificación por SMS a ${phoneNumber}`}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Códigos de respaldo
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                      Guarda estos códigos en un lugar seguro. Podrás utilizarlos para acceder a tu cuenta si pierdes acceso a tu dispositivo de autenticación.
                    </p>
                    <div className={`p-3 font-mono text-xs tracking-wide rounded border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>ABCD-1234-EFGH-5678</p>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>IJKL-9012-MNOP-3456</p>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>QRST-7890-UVWX-1234</p>
                    </div>
                    <button
                      className={`mt-3 px-3 py-1.5 text-xs font-medium rounded-lg
                        ${darkMode
                          ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      Descargar códigos
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {enabling2FA ? (
                    <form onSubmit={handleEnable2FA} className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Método de autenticación
                        </label>
                        <div className="space-y-2">
                          <label className={`block p-3 rounded-lg border cursor-pointer ${twoFactorMethod === 'email'
                              ? darkMode
                                ? 'border-cyan-700 bg-cyan-900/20 text-cyan-400'
                                : 'border-cyan-500 bg-cyan-50 text-cyan-700'
                              : darkMode
                                ? 'border-gray-700 bg-gray-800 text-gray-300'
                                : 'border-gray-200 bg-white text-gray-700'
                            }`}>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="twoFactorMethod"
                                value="email"
                                checked={twoFactorMethod === 'email'}
                                onChange={() => setTwoFactorMethod('email')}
                                className="hidden"
                              />
                              <div className={`flex items-center justify-center w-5 h-5 rounded-full border ${twoFactorMethod === 'email'
                                  ? darkMode ? 'border-cyan-700 bg-cyan-700' : 'border-cyan-500 bg-cyan-500'
                                  : darkMode ? 'border-gray-600' : 'border-gray-300'
                                } mr-3`}>
                                {twoFactorMethod === 'email' && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-xs mt-0.5 opacity-80">
                                  Recibe códigos de verificación en tu correo electrónico
                                </p>
                              </div>
                            </div>
                          </label>

                          <label className={`block p-3 rounded-lg border cursor-pointer ${twoFactorMethod === 'sms'
                              ? darkMode
                                ? 'border-cyan-700 bg-cyan-900/20 text-cyan-400'
                                : 'border-cyan-500 bg-cyan-50 text-cyan-700'
                              : darkMode
                                ? 'border-gray-700 bg-gray-800 text-gray-300'
                                : 'border-gray-200 bg-white text-gray-700'
                            }`}>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="twoFactorMethod"
                                value="sms"
                                checked={twoFactorMethod === 'sms'}
                                onChange={() => setTwoFactorMethod('sms')}
                                className="hidden"
                              />
                              <div className={`flex items-center justify-center w-5 h-5 rounded-full border ${twoFactorMethod === 'sms'
                                  ? darkMode ? 'border-cyan-700 bg-cyan-700' : 'border-cyan-500 bg-cyan-500'
                                  : darkMode ? 'border-gray-600' : 'border-gray-300'
                                } mr-3`}>
                                {twoFactorMethod === 'sms' && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">SMS</p>
                                <p className="text-xs mt-0.5 opacity-80">
                                  Recibe códigos de verificación por mensaje de texto
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {twoFactorMethod === 'sms' && (
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Número de teléfono
                          </label>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+34 612 345 678"
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500'
                                : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                              } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                            required={twoFactorMethod === 'sms'}
                          />
                          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Asegúrate de introducir un número de teléfono válido con el código de país.
                          </p>
                        </div>
                      )}

                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="flex items-start">
                          <MdInfoOutline className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5 flex-shrink-0`} />
                          <div className="ml-3">
                            <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              La autenticación de dos factores añade una capa adicional de seguridad a tu cuenta. Cada vez que inicies sesión, necesitarás:
                            </p>
                            <ul className={`text-xs mt-2 space-y-1 list-disc list-inside ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <li>Tu contraseña</li>
                              <li>Un código de verificación enviado a tu {twoFactorMethod === 'email' ? 'correo electrónico' : 'teléfono'}</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className={`px-4 py-2 rounded-lg text-sm font-medium
                          ${darkMode
                              ? 'bg-cyan-700 text-white hover:bg-cyan-600'
                              : 'bg-cyan-600 text-white hover:bg-cyan-700'
                            } transition-colors duration-150`}
                        >
                          Activar 2FA
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} border ${darkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
                        <div className="flex items-start">
                          <div className={`p-1 rounded-full ${darkMode ? 'bg-yellow-800' : 'bg-yellow-200'}`}>
                            <MdWarning className={`h-4 w-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                              Autenticación de dos factores no activada
                            </p>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-yellow-400/70' : 'text-yellow-600'}`}>
                              Tu cuenta podría ser vulnerable a accesos no autorizados.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Aumenta la seguridad de tu cuenta
                          </p>
                          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            La autenticación de dos factores añade una capa adicional de seguridad a tu cuenta.
                          </p>
                        </div>
                        <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <MdSecurity className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Historial de sesiones */}
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Historial de sesiones
                </h2>
                
                <button
                  onClick={loadSessionHistory}
                  disabled={loadingSessions}
                  className={`p-1.5 rounded-lg ${darkMode
                      ? 'text-gray-300 hover:text-cyan-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:text-cyan-600 hover:bg-gray-100'
                    }`}
                >
                  <MdHistory className="h-5 w-5" />
                </button>
              </div>
              
              {sessionError && (
                <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>
                  <div className="flex items-center">
                    <MdWarning className="h-5 w-5 mr-2" />
                    <p className="text-sm">{sessionError}</p>
                  </div>
                </div>
              )}
              
              {sessionActionSuccess && (
                <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                  <div className="flex items-center">
                    <MdCheck className="h-5 w-5 mr-2" />
                    <p className="text-sm">{sessionActionSuccess}</p>
                  </div>
                </div>
              )}

              {loadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-cyan-500"></div>
                  <p className={`ml-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cargando sesiones...</p>
                </div>
              ) : sessionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                    <MdHistory className={`h-8 w-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hay historial de sesiones disponible</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    <thead>
                      <tr>
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Dispositivo</th>
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Ubicación</th>
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Fecha</th>
                        <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {sessionHistory.map((session) => (
                        <tr key={session.id} className={session.isCurrent ? (darkMode ? 'bg-cyan-900/10' : 'bg-cyan-50/50') : ''}>
                          <td className={`px-4 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div>
                              <p className={`${session.isCurrent ? (darkMode ? 'text-cyan-400 font-medium' : 'text-cyan-600 font-medium') : (darkMode ? 'text-white' : 'text-gray-900')}`}>
                                {session.device}
                                {session.isCurrent && ' (Actual)'}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{session.browser}</p>
                            </div>
                          </td>
                          <td className={`px-4 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div>
                              <p>{session.location}</p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>IP: {session.ip}</p>
                            </div>
                          </td>
                          <td className={`px-4 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div>
                              <p>Inicio: {formatDate(session.startDate)}</p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Última actividad: {formatDate(session.lastActive)}
                              </p>
                            </div>
                          </td>
                          <td className={`px-4 py-4 whitespace-nowrap text-sm text-right`}>
                            <button
                              onClick={() => {
                                if (session.isCurrent) {
                                  // Si es la sesión actual, mostrar confirmación
                                  if (window.confirm('Cerrar esta sesión te desconectará inmediatamente. ¿Estás seguro?')) {
                                    handleCloseSession(session.id);
                                    logout(); // Usar la función de logout del contexto
                                    router.push('/login'); // Redirigir al login
                                  }
                                } else {
                                  // Si es otra sesión, cerrarla normalmente
                                  handleCloseSession(session.id);
                                }
                              }}
                              disabled={closingSession === session.id}
                              className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded 
                                ${darkMode
                                  ? 'text-red-400 hover:bg-red-900/20'
                                  : 'text-red-700 hover:bg-red-100'
                                } transition-colors`}
                            >
                              {closingSession === session.id ? (
                                <>
                                  <div className="animate-spin h-3 w-3 mr-1 border border-b-transparent rounded-full border-red-400"></div>
                                  Cerrando...
                                </>
                              ) : (
                                session.isCurrent ? 'Cerrar esta sesión' : 'Cerrar sesión'
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 flex justify-between items-center">
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {sessionHistory.filter(s => s.status === 'active').length} sesión(es) activa(s) de un total de {sessionHistory.length} sesión(es)
                </p>
                
                {sessionHistory.filter(s => s.status === 'active').length > 1 && (
                  <button
                    onClick={handleCloseAllOtherSessions}
                    disabled={closingAllSessions}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium 
                    ${darkMode
                        ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                  >
                    {closingAllSessions ? (
                      <>
                        <div className="animate-spin inline-block h-3 w-3 mr-1 border border-b-transparent rounded-full border-current"></div>
                        Cerrando sesiones...
                      </>
                    ) : (
                      'Cerrar todas las sesiones excepto esta'
                    )}
                  </button>
                )}
              </div>
            </div>

        
          </div>
        </div>

        {/* Modal de eliminación de cuenta */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
            <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Eliminar cuenta permanentemente
              </h3>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${darkMode ? 'border-red-800' : 'border-red-200'} mb-4`}>
                <div className="flex items-start">
                  <MdWarning className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-600'} mt-0.5 flex-shrink-0`} />
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                      Esta acción no se puede deshacer
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-red-400/70' : 'text-red-600'}`}>
                      Toda tu información personal, transacciones, presupuestos e historial serán eliminados permanentemente.
                    </p>
                  </div>
                </div>
              </div>

              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Para confirmar, escribe <span className="font-bold">eliminar mi cuenta</span> en el campo de abajo:
              </p>

              <div className="mb-4">
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                      : 'bg-white border-gray-300 text-gray-700 focus:border-red-500'
                    } focus:outline-none focus:ring-1 focus:ring-red-500`}
                  placeholder="eliminar mi cuenta"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium
                  ${darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmation.toLowerCase() === 'eliminar mi cuenta') {
                      setShowDeleteModal(false);
                      setDeleteConfirmation('');

                      // Mostrar modal de reautenticación
                      setActionAfterReauth('deleteAccount');
                      setShowReauthModal(true);
                    }
                  }}
                  disabled={deleteConfirmation.toLowerCase() !== 'eliminar mi cuenta'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium 
                  ${deleteConfirmation.toLowerCase() === 'eliminar mi cuenta'
                      ? darkMode
                        ? 'bg-red-700 text-white hover:bg-red-600'
                        : 'bg-red-600 text-white hover:bg-red-700'
                      : darkMode
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  Eliminar Permanentemente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Buenas Prácticas de Seguridad */}
        {showSecurityPracticesModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setShowSecurityPracticesModal(false)}></div>
            <div className={`relative w-full max-w-3xl p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Buenas Prácticas de Seguridad
                </h3>
                <button 
                  onClick={() => setShowSecurityPracticesModal(false)}
                  className={`p-1.5 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <MdClose className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <section>
                  <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Consejos para mantener tu cuenta segura</h4>
                  <ul className={`space-y-3 ml-4 list-disc ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li>
                      <p className="font-medium">Usa contraseñas fuertes y únicas</p>
                      <p className="text-sm mt-1">Crea contraseñas de al menos 12 caracteres que incluyan letras mayúsculas y minúsculas, números y símbolos. Evita usar información personal.</p>
                    </li>
                    <li>
                      <p className="font-medium">Activa la autenticación de dos factores (2FA)</p>
                      <p className="text-sm mt-1">Añade una capa adicional de seguridad a tu cuenta requiriendo una segunda forma de verificación además de tu contraseña.</p>
                    </li>
                    <li>
                      <p className="font-medium">No compartas tus credenciales</p>
                      <p className="text-sm mt-1">Nunca compartas tus contraseñas ni códigos de verificación con nadie, incluyendo al soporte técnico de Plutus.</p>
                    </li>
                    <li>
                      <p className="font-medium">Cierra sesión en dispositivos no utilizados</p>
                      <p className="text-sm mt-1">Gestiona tus sesiones activas y cierra aquellas que no reconozcas o ya no utilices.</p>
                    </li>
                    <li>
                      <p className="font-medium">Actualiza regularmente tu contraseña</p>
                      <p className="text-sm mt-1">Cambia tu contraseña cada 3-6 meses para mantener tu cuenta segura.</p>
                    </li>
                  </ul>
                </section>

                <section className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Cómo identificar intentos de phishing</h4>
                  <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Los ataques de phishing intentan engañarte para que reveles información personal como contraseñas o datos bancarios.
                  </p>
                  <ul className={`space-y-2 ml-4 list-disc ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li>Desconfía de correos o mensajes que soliciten información personal.</li>
                    <li>Verifica siempre la URL antes de ingresar credenciales (plutus.com vs plutus-secure.com).</li>
                    <li>Nunca hagas clic en enlaces sospechosos de correos electrónicos no solicitados.</li>
                    <li>Plutus nunca te pedirá tu contraseña completa por teléfono o correo electrónico.</li>
                  </ul>
                </section>

                <section>
                  <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Protege tu dispositivo</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Mantén tu software actualizado</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Actualiza regularmente tu sistema operativo, navegador y aplicaciones para protegerte contra vulnerabilidades conocidas.
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Usa software antivirus</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Instala y mantén actualizado un programa antivirus confiable en todos tus dispositivos.
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>No uses redes Wi-Fi públicas</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Evita acceder a tu cuenta bancaria o financiera mientras estás conectado a redes Wi-Fi públicas no seguras.
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Utiliza bloqueo de pantalla</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Configura un bloqueo de pantalla seguro (PIN, patrón o biométrico) en todos tus dispositivos.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowSecurityPracticesModal(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium
                  ${darkMode
                    ? 'bg-cyan-700 text-white hover:bg-cyan-600'
                    : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Política de Privacidad */}
        {showPrivacyPolicyModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setShowPrivacyPolicyModal(false)}></div>
            <div className={`relative w-full max-w-3xl p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Política de Privacidad
                </h3>
                <button 
                  onClick={() => setShowPrivacyPolicyModal(false)}
                  className={`p-1.5 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <MdClose className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <section>
                  <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Información que recopilamos</h4>
                  <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    En Plutus nos comprometemos a proteger tu privacidad. A continuación, detallamos qué tipo de información recopilamos y cómo la utilizamos:
                  </p>
                  <ul className={`space-y-2 ml-4 list-disc ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li>
                      <p className="font-medium">Información de registro</p>
                      <p className="text-sm mt-1">Nombre, dirección de correo electrónico y contraseña encriptada.</p>
                    </li>
                    <li>
                      <p className="font-medium">Datos financieros</p>
                      <p className="text-sm mt-1">Transacciones, presupuestos, categorías y metadatos relacionados que ingresas voluntariamente.</p>
                    </li>
                    <li>
                      <p className="font-medium">Información del dispositivo</p>
                      <p className="text-sm mt-1">Dirección IP, tipo de navegador, sistema operativo y otros datos técnicos para mejorar la seguridad.</p>
                    </li>
                    <li>
                      <p className="font-medium">Información de uso</p>
                      <p className="text-sm mt-1">Estadísticas sobre cómo utilizas nuestra aplicación para mejorar la experiencia del usuario.</p>
                    </li>
                  </ul>
                </section>

                <section className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Cómo protegemos tus datos</h4>
                  <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Implementamos medidas técnicas y organizativas diseñadas para proteger tus datos personales:
                  </p>
                  <ul className={`space-y-2 ml-4 list-disc ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li>Encriptación de datos sensibles en tránsito y en reposo.</li>
                    <li>Autenticación de dos factores para proteger el acceso a cuentas.</li>
                    <li>Monitoreo continuo de amenazas de seguridad.</li>
                    <li>Acceso restringido a datos personales dentro de nuestra organización.</li>
                    <li>Cumplimiento con normativas de protección de datos como GDPR y CCPA.</li>
                  </ul>
                </section>

                <section>
                  <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Compartición de datos</h4>
                  <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    No vendemos tus datos personales a terceros. Compartimos información únicamente en los siguientes casos:
                  </p>
                  <div className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} space-y-3`}>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Proveedores de servicios</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Con proveedores que nos ayudan a proporcionar nuestros servicios (almacenamiento en la nube, procesamiento de pagos, etc.) bajo estrictas obligaciones de confidencialidad.
                      </p>
                    </div>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Requisitos legales</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Cuando estamos obligados por ley o en respuesta a procedimientos legales válidos, como una orden judicial.
                      </p>
                    </div>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Con tu consentimiento</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Cuando nos has dado permiso explícito para compartir tus datos, como al conectar servicios bancarios de terceros.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Tus derechos</h4>
                  <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Dependiendo de tu ubicación, puedes tener los siguientes derechos:
                  </p>
                  <ul className={`space-y-1 ml-4 list-disc ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li>Acceder a tus datos personales</li>
                    <li>Corregir datos inexactos</li>
                    <li>Eliminar tus datos personales</li>
                    <li>Oponerte al procesamiento de tus datos</li>
                    <li>Solicitar la portabilidad de tus datos</li>
                    <li>Retirar tu consentimiento para el procesamiento de datos</li>
                  </ul>
                  <p className={`mt-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Para ejercer estos derechos, contacta con nuestro equipo de privacidad a través del Centro de Ayuda.
                  </p>
                </section>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPrivacyPolicyModal(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium
                  ${darkMode
                    ? 'bg-cyan-700 text-white hover:bg-cyan-600'
                    : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Centro de Ayuda */}
        {showHelpCenterModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setShowHelpCenterModal(false)}></div>
            <div className={`relative w-full max-w-3xl p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Centro de Ayuda - Seguridad
                </h3>
                <button 
                  onClick={() => setShowHelpCenterModal(false)}
                  className={`p-1.5 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <MdClose className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <section>
                  <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Preguntas frecuentes sobre seguridad</h4>
                  
                  <div className="space-y-4 mt-3">
                    <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h5 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>¿Cómo puedo cambiar mi contraseña?</h5>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Para cambiar tu contraseña, ve a la sección "Contraseña" en la página de Seguridad, haz clic en el botón de edición e ingresa tu contraseña actual. Te enviaremos un enlace para establecer una nueva contraseña a tu correo electrónico.
                      </p>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h5 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>¿Qué hago si detecto actividad sospechosa en mi cuenta?</h5>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Si detectas actividad sospechosa:
                      </p>
                      <ol className={`list-decimal ml-5 mt-2 text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>Cambia inmediatamente tu contraseña</li>
                        <li>Revisa y cierra todas las sesiones activas desconocidas</li>
                        <li>Activa la autenticación de dos factores si no lo has hecho</li>
                        <li>Contacta con nuestro equipo de soporte para reportar el incidente</li>
                      </ol>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h5 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>¿Cómo funciona la autenticación de dos factores?</h5>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        La autenticación de dos factores (2FA) añade una capa adicional de seguridad a tu cuenta. Después de ingresar tu contraseña, recibirás un código único a través de correo electrónico o SMS (según tu configuración) que deberás introducir para completar el inicio de sesión.
                      </p>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h5 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>¿Qué debo hacer si pierdo el acceso a mi método de 2FA?</h5>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Si has perdido acceso a tu método de 2FA (cambio de número de teléfono o acceso al correo), puedes usar uno de los códigos de respaldo generados cuando activaste el 2FA. Si tampoco tienes acceso a estos códigos, contacta con nuestro equipo de soporte con tu identificación para verificar tu identidad.
                      </p>
                    </div>
                  </div>
                </section>

                <section className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`text-lg font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Contactar con soporte</h4>
                  
                  <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Si tienes problemas relacionados con la seguridad de tu cuenta, nuestro equipo especializado está disponible para ayudarte:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-white'}`}>
                      <p className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Correo electrónico</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        seguridad@plutus.com
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Tiempo de respuesta: 24-48 horas
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-white'}`}>
                      <p className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Chat en vivo</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Disponible en la app de lunes a viernes
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Horario: 9:00 - 18:00 (GMT+1)
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-white'}`}>
                      <p className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Teléfono (incidentes urgentes)</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        +34 900 123 456
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Horario: 24/7 para emergencias de seguridad
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-white'}`}>
                      <p className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Centro de ayuda</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        help.plutus.com/security
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Base de conocimientos y guías detalladas
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Reportar un problema de seguridad</h4>
                  
                  <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Si has descubierto una vulnerabilidad de seguridad en nuestra plataforma, te agradecemos que nos la comuniques de manera responsable:
                  </p>
                  
                  <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h5 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Programa de recompensas por bugs</h5>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      En Plutus valoramos la seguridad y animamos a investigadores de seguridad a reportar vulnerabilidades a través de nuestro programa de recompensas.
                    </p>
                    <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Envía los detalles de cualquier vulnerabilidad a: <span className="font-medium">security-bugs@plutus.com</span>
                    </p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Incluye pasos para reproducir el problema, posible impacto y, si es posible, sugerencias para solucionarlo.
                    </p>
                  </div>
                </section>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => {
                    // Simular apertura de chat o formulario de contacto
                    alert("Esta función conectaría con el servicio de chat en vivo.");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium
                  ${darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Contactar ahora
                </button>
                
                <button
                  onClick={() => setShowHelpCenterModal(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium
                  ${darkMode
                    ? 'bg-cyan-700 text-white hover:bg-cyan-600'
                    : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityPage;