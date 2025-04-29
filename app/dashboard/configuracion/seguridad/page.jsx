'use client';

import { useState, useEffect, useRef } from 'react';
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
import { auth, db } from '../../../../app/firebase';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const SecurityPage = () => {
  const { darkMode } = useTheme();
  const { currentUser, userData, signOut, getUserSessions, endSession, endAllOtherSessions } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Estados para los modos de edición
  const [changingPassword, setChangingPassword] = useState(false);
  const [enabling2FA, setEnabling2FA] = useState(false);

  // Estados para las contraseñas
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Estados para la autenticación de dos factores
  const [twoFactorMethod, setTwoFactorMethod] = useState('email');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Estado para el modal de verificación
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [actionAfterReauth, setActionAfterReauth] = useState(null);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState('');

  // Estado para el modal de eliminación de cuenta
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

  // Función para verificar la fortaleza de la contraseña
  const checkPasswordStrength = (password) => {
    let strength = 0;

    // Longitud mínima
    if (password.length >= 8) strength += 1;

    // Contiene números
    if (/\d/.test(password)) strength += 1;

    // Contiene letras minúsculas y mayúsculas
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;

    // Contiene caracteres especiales
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  };

  // Función para cambiar contraseña
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validar que las contraseñas coinciden
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    // Validar fortaleza de contraseña
    if (passwordStrength < 3) {
      setPasswordError('La contraseña no es lo suficientemente segura');
      return;
    }

    // Mostrar modal de reautenticación
    setActionAfterReauth('changePassword');
    setShowReauthModal(true);
  };

  // Función para reautenticar al usuario
  const handleReauthenticate = async () => {
    try {
      // Crear credencial
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        reauthPassword
      );

      // Reautenticar
      await reauthenticateWithCredential(currentUser, credential);

      // Cerrar modal
      setShowReauthModal(false);
      setReauthError('');
      setReauthPassword('');

      // Ejecutar acción después de la reautenticación
      if (actionAfterReauth === 'changePassword') {
        try {
          await updatePassword(currentUser, newPassword);

          // Actualizar estado
          setPasswordSuccess(true);
          setPasswordError('');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setChangingPassword(false);

          // Resetear el estado después de 3 segundos
          setTimeout(() => {
            setPasswordSuccess(false);
          }, 3000);
        } catch (error) {
          setPasswordError('Error al actualizar la contraseña: ' + error.message);
        }
      } else if (actionAfterReauth === 'deleteAccount') {
        // En una implementación real aquí eliminarías la cuenta
        try {
          // Eliminar usuario de Firebase Auth
          await currentUser.delete();

          // Eliminar datos de Firestore
          // const userDocRef = doc(db, 'users', currentUser.uid);
          // await deleteDoc(userDocRef);

          // Redireccionar al login
          await signOut();
          router.push('/login');
        } catch (error) {
          console.error('Error al eliminar la cuenta:', error);
        }
      } else if (actionAfterReauth === 'enable2FA') {
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
      }
    } catch (error) {
      setReauthError('Contraseña incorrecta');
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

    // Mostrar modal de reautenticación
    setActionAfterReauth('enable2FA');
    setShowReauthModal(true);
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
                Estado de Seguridad
              </h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className={`rounded-full p-1.5 mt-0.5 ${currentUser?.emailVerified ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'}`}>
                    {currentUser?.emailVerified ? <MdCheck className="h-4 w-4" /> : <MdWarning className="h-4 w-4" />}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email Verificado
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {currentUser?.emailVerified
                        ? 'Tu correo electrónico ha sido verificado.'
                        : 'Tu correo electrónico no está verificado.'}
                    </p>
                    {!currentUser?.emailVerified && (
                      <button
                        onClick={sendVerification}
                        className={`mt-1 text-xs font-medium ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}
                      >
                        Enviar correo de verificación
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`rounded-full p-1.5 mt-0.5 ${twoFactorEnabled ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'}`}>
                    {twoFactorEnabled ? <MdCheck className="h-4 w-4" /> : <MdWarning className="h-4 w-4" />}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Autenticación de Dos Factores
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
                      Sesiones Activas
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
                Recursos de Seguridad
              </h2>

              <div className="space-y-3">
                <a
                  href="#"
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
                        setNewPassword('');
                        setConfirmPassword('');
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
                    <p className="text-sm">Contraseña actualizada con éxito.</p>
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
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        checkPasswordStrength(e.target.value);
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500'
                          : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                        } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                      required
                    />

                    {/* Indicador de fortaleza de contraseña */}
                    <div className="mt-1">
                      <div className="flex items-center space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 rounded-full flex-1 ${i < passwordStrength
                                ? passwordStrength === 1
                                  ? 'bg-red-500'
                                  : passwordStrength === 2
                                    ? 'bg-yellow-500'
                                    : passwordStrength === 3
                                      ? 'bg-green-500'
                                      : 'bg-green-600'
                                : darkMode ? 'bg-gray-600' : 'bg-gray-200'
                              }`}
                          ></div>
                        ))}
                      </div>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {passwordStrength === 0 && 'Introduce una contraseña'}
                        {passwordStrength === 1 && 'Contraseña débil'}
                        {passwordStrength === 2 && 'Contraseña moderada'}
                        {passwordStrength === 3 && 'Contraseña segura'}
                        {passwordStrength === 4 && 'Contraseña muy segura'}
                      </p>
                    </div>

                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      La contraseña debe tener al menos 8 caracteres, incluir números, mayúsculas, minúsculas y caracteres especiales.
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500'
                          : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                        } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                      required
                    />
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
                  Autenticación de Dos Factores
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
                  Historial de Sesiones
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
                                    signOut(); // Cerrar sesión en Firebase
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

        {/* Modal de reautenticación */}
        {showReauthModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowReauthModal(false)}></div>
            <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Verificar Identidad
              </h3>

              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Por razones de seguridad, debes introducir tu contraseña actual para continuar.
              </p>

              {reauthError && (
                <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>
                  <div className="flex items-center">
                    <MdWarning className="h-5 w-5 mr-2" />
                    <p className="text-sm">{reauthError}</p>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500'
                      : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                    } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowReauthModal(false);
                    setReauthPassword('');
                    setReauthError('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium
                  ${darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReauthenticate}
                  className={`px-4 py-2 rounded-lg text-sm font-medium 
                  ${darkMode
                      ? 'bg-cyan-700 text-white hover:bg-cyan-600'
                      : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
                >
                  Verificar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de eliminación de cuenta */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
            <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Eliminar Cuenta Permanentemente
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
      </div>
    </div>
  );
};

export default SecurityPage;