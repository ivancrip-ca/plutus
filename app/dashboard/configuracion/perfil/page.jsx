'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  MdEdit, 
  MdSave, 
  MdCancel, 
  MdDelete, 
  MdLock, 
  MdUpload, 
  MdInfo,
  MdCameraAlt,
  MdEmail,
  MdPhone,
  MdPerson,
  MdDateRange,
  MdWarning
} from 'react-icons/md';
import { useTheme } from '../../../../app/contexts/ThemeContext';
import { useAuth } from '../../../../app/contexts/AuthContext';
import { auth, storage, db } from '../../../../app/firebase';
import { updateProfile, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

const UserProfilePage = () => {
  const { darkMode } = useTheme();
  const { currentUser, userData, updateUserData, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Estados para los diferentes modos de edición
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingContactInfo, setEditingContactInfo] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados para modal de eliminación de cuenta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const confirmationPhrase = "eliminar mi cuenta";
  
  // Referencias a los inputs de archivos
  const fileInputRef = useRef(null);
  
  // Estados para los datos del usuario
  const [userProfile, setUserProfile] = useState({
    photoURL: '',
    displayName: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    bio: '',
    occupation: '',
    company: '',
    preferences: {
      currency: 'EUR',
      language: 'es',
    }
  });
  
  // Cargar los datos del usuario al montar el componente
  useEffect(() => {
    setMounted(true);
    
    if (currentUser && userData) {
      setUserProfile({
        photoURL: currentUser.photoURL || '/images/logoPlutus.png',
        displayName: currentUser.displayName || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: currentUser.email || '',
        phoneNumber: userData.phoneNumber || '',
        dateOfBirth: userData.dateOfBirth || '',
        address: userData.address || '',
        city: userData.city || '',
        country: userData.country || '',
        postalCode: userData.postalCode || '',
        bio: userData.bio || '',
        occupation: userData.occupation || '',
        company: userData.company || '',
        preferences: {
          currency: userData.preferences?.currency || 'EUR',
          language: userData.preferences?.language || 'es',
        }
      });
    }
  }, [currentUser, userData, darkMode]);
  
  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('preferences.')) {
      const preferenceName = name.split('.')[1];
      setUserProfile({
        ...userProfile,
        preferences: {
          ...userProfile.preferences,
          [preferenceName]: value
        }
      });
    } else {
      setUserProfile({
        ...userProfile,
        [name]: value
      });
    }
  };

  // Mostrar mensaje de éxito temporalmente
  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };
  
  // Manejar el envío del formulario de información personal
  const handlePersonalInfoSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Guardar en Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        dateOfBirth: userProfile.dateOfBirth,
        bio: userProfile.bio,
        occupation: userProfile.occupation,
        company: userProfile.company
      });
      
      // Actualizar displayName en Firebase Auth
      await updateProfile(currentUser, {
        displayName: `${userProfile.firstName} ${userProfile.lastName}`
      });
      
      // Actualizar el contexto
      if (updateUserData) {
        updateUserData({
          ...userData,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          dateOfBirth: userProfile.dateOfBirth,
          bio: userProfile.bio,
          occupation: userProfile.occupation,
          company: userProfile.company
        });
      }
      
      showSuccessMessage('Información personal actualizada correctamente');
      setEditingPersonalInfo(false);
    } catch (error) {
      console.error('Error al actualizar información personal:', error);
      setError('No se pudo actualizar la información personal. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar el envío del formulario de información de contacto
  const handleContactInfoSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Guardar en Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        phoneNumber: userProfile.phoneNumber,
        address: userProfile.address,
        city: userProfile.city,
        country: userProfile.country,
        postalCode: userProfile.postalCode
      });
      
      // Actualizar el contexto
      if (updateUserData) {
        updateUserData({
          ...userData,
          phoneNumber: userProfile.phoneNumber,
          address: userProfile.address,
          city: userProfile.city,
          country: userProfile.country,
          postalCode: userProfile.postalCode
        });
      }
      
      showSuccessMessage('Información de contacto actualizada correctamente');
      setEditingContactInfo(false);
    } catch (error) {
      console.error('Error al actualizar información de contacto:', error);
      setError('No se pudo actualizar la información de contacto. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar el envío del formulario de preferencias
  const handlePreferencesSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Guardar en Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        'preferences.currency': userProfile.preferences.currency,
        'preferences.language': userProfile.preferences.language,
      });
      
      // Actualizar el contexto
      if (updateUserData) {
        updateUserData({
          ...userData,
          preferences: {
            ...userData.preferences,
            currency: userProfile.preferences.currency,
            language: userProfile.preferences.language,
          }
        });
      }
      
      showSuccessMessage('Preferencias actualizadas correctamente');
      setEditingPreferences(false);
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
      setError('No se pudo actualizar las preferencias. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar la subida de foto de perfil
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setError('');
      
      // Verificar el tamaño del archivo (máx. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen no debe superar los 5MB');
      }
      
      // Verificar el tipo de archivo
      if (!file.type.match('image.*')) {
        throw new Error('Por favor selecciona una imagen válida');
      }
      
      // Crear referencia al almacenamiento
      const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
      
      // Subir el archivo
      await uploadBytes(storageRef, file);
      
      // Obtener la URL de descarga
      const downloadURL = await getDownloadURL(storageRef);
      
      // Actualizar el perfil de Firebase Auth
      await updateProfile(currentUser, { photoURL: downloadURL });
      
      // Actualizar en Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { photoURL: downloadURL });
      
      // Actualizar el estado local
      setUserProfile({
        ...userProfile,
        photoURL: downloadURL
      });
      
      // Actualizar el contexto si es necesario
      if (updateUserData) {
        updateUserData({
          ...userData,
          photoURL: downloadURL
        });
      }
      
      showSuccessMessage('Foto de perfil actualizada correctamente');
    } catch (error) {
      console.error('Error al subir foto de perfil:', error);
      setError(error.message || 'Error al subir la imagen. Inténtalo nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  // Manejar eliminación de cuenta - Abrir modal
  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
    setDeleteConfirmation('');
    setPassword('');
    setDeleteError('');
  };
  
  // Confirmar eliminación de cuenta
  const confirmDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== confirmationPhrase) {
      setDeleteError('Por favor, escribe la frase exacta para confirmar');
      return;
    }
    
    if (!password) {
      setDeleteError('Por favor, ingresa tu contraseña para confirmar');
      return;
    }
    
    try {
      setDeleteLoading(true);
      setDeleteError('');
      
      // Reautenticar al usuario
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      
      // Eliminar datos del usuario en Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await deleteDoc(userDocRef);
      
      // Eliminar usuario de Firebase Auth
      await deleteUser(currentUser);
      
      // Cerrar sesión y redireccionar a la página de inicio
      router.push('/');
      
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      if (error.code === 'auth/wrong-password') {
        setDeleteError('Contraseña incorrecta. Por favor, verifica e intenta nuevamente.');
      } else {
        setDeleteError('Error al eliminar la cuenta. Por favor, intenta nuevamente más tarde.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Si aún no se ha montado el componente, mostrar un placeholder
  if (!mounted) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 h-64 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
          <div className="w-full md:w-2/3 h-64 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Mi Perfil</h1>
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna izquierda - Foto de perfil y datos básicos */}
        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 group">
              <Image
                src={userProfile.photoURL || '/images/logoPlutus.png'}
                alt="Foto de perfil"
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
              <div 
                className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="text-white flex flex-col items-center cursor-pointer">
                  <MdCameraAlt className="h-8 w-8 mb-1" />
                  <span className="text-xs">Cambiar foto</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoUpload}
                disabled={isUploading}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-semibold mb-1">
              {userProfile.firstName} {userProfile.lastName}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
              {userProfile.occupation} {userProfile.company ? `@ ${userProfile.company}` : ''}
            </p>
            
            {userProfile.bio && (
              <div className="w-full mb-4 text-center">
                <p className={`text-sm italic ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  "{userProfile.bio}"
                </p>
              </div>
            )}
            
            <div className="w-full pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-3">
                <MdEmail className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className="text-sm">{userProfile.email}</span>
              </div>
              
              {userProfile.phoneNumber && (
                <div className="flex items-center mb-3">
                  <MdPhone className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className="text-sm">{userProfile.phoneNumber}</span>
                </div>
              )}
              
              {userProfile.dateOfBirth && (
                <div className="flex items-center">
                  <MdDateRange className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className="text-sm">{userProfile.dateOfBirth}</span>
                </div>
              )}
            </div>
            
            <div className="w-full mt-6">
              <button 
                className={`w-full py-2 rounded-lg text-sm font-medium 
                  ${darkMode 
                    ? 'bg-cyan-700 text-white hover:bg-cyan-600' 
                    : 'bg-cyan-600 text-white hover:bg-cyan-700'} 
                  transition-colors duration-150 flex items-center justify-center`}
                onClick={() => router.push('/dashboard/configuracion/seguridad')}
              >
                <MdLock className="mr-2" /> Configuración de seguridad
              </button>
              
              {/* Información de actividad reciente */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Actividad de la cuenta
                </h4>
                
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                  <div className="flex items-center mb-2">
                    <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-500'} mr-2`}></div>
                    <span>Estado: Activo</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Último acceso:</span>
                    <span className="font-medium">{new Date().toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Desde:</span>
                    <span className="font-medium">App Web</span>
                  </div>
                </div>
                
              
                
               
                
                {/* Sección de Plan / Membresía */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Plan Actual
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-cyan-900 text-cyan-300' : 'bg-cyan-100 text-cyan-800'}`}>
                      Gratuito
                    </span>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                    Acceso a funciones básicas de gestión financiera.
                  </p>
                  <button 
                    className={`w-full py-1.5 text-xs font-medium rounded-lg
                      ${darkMode 
                        ? 'bg-gray-700 text-cyan-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-cyan-700 hover:bg-gray-200'
                      } flex items-center justify-center`}
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Actualizar a premium
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Columna derecha - Información detallada */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Sección de información personal */}
          <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Información personal
              </h3>
              
              {!editingPersonalInfo ? (
                <button
                  onClick={() => setEditingPersonalInfo(true)}
                  className={`p-1.5 rounded-lg ${
                    darkMode 
                      ? 'text-gray-300 hover:text-cyan-400 hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-cyan-600 hover:bg-gray-100'
                  }`}
                >
                  <MdEdit className="h-5 w-5" />
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingPersonalInfo(false)}
                    className={`p-1.5 rounded-lg ${
                      darkMode 
                        ? 'text-gray-300 hover:text-red-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
                    }`}
                    disabled={loading}
                  >
                    <MdCancel className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handlePersonalInfoSubmit}
                    className={`p-1.5 rounded-lg ${
                      darkMode 
                        ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-t-cyan-500 rounded-full animate-spin"></div>
                    ) : (
                      <MdSave className="h-5 w-5" />
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre
                </label>
                {editingPersonalInfo ? (
                  <input
                    type="text"
                    name="firstName"
                    value={userProfile.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                    } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                  />
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.firstName || 'No especificado'}
                  </p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Apellidos
                </label>
                {editingPersonalInfo ? (
                  <input
                    type="text"
                    name="lastName"
                    value={userProfile.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                    } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                  />
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.lastName || 'No especificado'}
                  </p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fecha de nacimiento
                </label>
                {editingPersonalInfo ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={userProfile.dateOfBirth}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                    } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                  />
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.dateOfBirth || 'No especificado'}
                  </p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ocupación
                </label>
                {editingPersonalInfo ? (
                  <input
                    type="text"
                    name="occupation"
                    value={userProfile.occupation}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                    } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                  />
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.occupation || 'No especificado'}
                  </p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Empresa / Organización
                </label>
                {editingPersonalInfo ? (
                  <input
                    type="text"
                    name="company"
                    value={userProfile.company}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                    } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                  />
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.company || 'No especificado'}
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Biografía
                </label>
                {editingPersonalInfo ? (
                  <textarea
                    name="bio"
                    value={userProfile.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                    } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                  />
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.bio || 'No especificado'}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Sección de información de contacto */}
          <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Información de contacto
              </h3>
              
              {!editingContactInfo ? (
                <button
                  onClick={() => setEditingContactInfo(true)}
                  className={`p-1.5 rounded-lg ${
                    darkMode 
                      ? 'text-gray-300 hover:text-cyan-400 hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-cyan-600 hover:bg-gray-100'
                  }`}
                >
                  <MdEdit className="h-5 w-5" />
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingContactInfo(false)}
                    className={`p-1.5 rounded-lg ${
                      darkMode 
                        ? 'text-gray-300 hover:text-red-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
                    }`}
                    disabled={loading}
                  >
                    <MdCancel className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleContactInfoSubmit}
                    className={`p-1.5 rounded-lg ${
                      darkMode 
                        ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-t-cyan-500 rounded-full animate-spin"></div>
                    ) : (
                      <MdSave className="h-5 w-5" />
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {userProfile.email}
                </p>
                <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar desde aquí</p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Teléfono
                </label>
                {editingContactInfo ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={userProfile.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                    } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                  />
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.phoneNumber || 'No especificado'}
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Dirección
                </label>
                {editingContactInfo ? (
                  <input
                    type="text"
                    name="address"
                    value={userProfile.address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                    } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                  />
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.address || 'No especificado'}
                  </p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ciudad
                </label>
                {editingContactInfo ? (
                  <input
                    type="text"
                    name="city"
                    value={userProfile.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                    } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                  />
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.city || 'No especificado'}
                  </p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Código Postal
                </label>
                {editingContactInfo ? (
                  <input
                    type="text"
                    name="postalCode"
                    value={userProfile.postalCode}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                    } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                  />
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.postalCode || 'No especificado'}
                  </p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  País
                </label>
                {editingContactInfo ? (
                  <input
                    type="text"
                    name="country"
                    value={userProfile.country}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                    } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                  />
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.country || 'No especificado'}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Sección de preferencias */}
          <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Preferencias
              </h3>
              
              {!editingPreferences ? (
                <button
                  onClick={() => setEditingPreferences(true)}
                  className={`p-1.5 rounded-lg ${
                    darkMode 
                      ? 'text-gray-300 hover:text-cyan-400 hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-cyan-600 hover:bg-gray-100'
                  }`}
                >
                  <MdEdit className="h-5 w-5" />
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingPreferences(false)}
                    className={`p-1.5 rounded-lg ${
                      darkMode 
                        ? 'text-gray-300 hover:text-red-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
                    }`}
                    disabled={loading}
                  >
                    <MdCancel className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handlePreferencesSubmit}
                    className={`p-1.5 rounded-lg ${
                      darkMode 
                        ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-t-cyan-500 rounded-full animate-spin"></div>
                    ) : (
                      <MdSave className="h-5 w-5" />
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Moneda Predeterminada
                </label>
                {editingPreferences ? (
                  <select
                    name="preferences.currency"
                    value={userProfile.preferences.currency}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                    } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dólar estadounidense ($)</option>
                    <option value="GBP">Libra esterlina (£)</option>
                    <option value="JPY">Yen japonés (¥)</option>
                    <option value="MXN">Peso mexicano ($)</option>
                  </select>
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.preferences.currency === 'EUR' ? 'Euro (€)' :
                     userProfile.preferences.currency === 'USD' ? 'Dólar estadounidense ($)' :
                     userProfile.preferences.currency === 'GBP' ? 'Libra esterlina (£)' :
                     userProfile.preferences.currency === 'JPY' ? 'Yen japonés (¥)' :
                     userProfile.preferences.currency === 'MXN' ? 'Peso mexicano ($)' :
                     userProfile.preferences.currency}
                  </p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Idioma
                </label>
                {editingPreferences ? (
                  <select
                    name="preferences.language"
                    value={userProfile.preferences.language}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-cyan-500'
                    } focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.preferences.language === 'es' ? 'Español' :
                     userProfile.preferences.language === 'en' ? 'English' :
                     userProfile.preferences.language === 'fr' ? 'Français' :
                     userProfile.preferences.language === 'de' ? 'Deutsch' :
                     userProfile.preferences.language}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Sección para eliminar cuenta */}
          <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Eliminar cuenta
            </h3>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${darkMode ? 'border-red-800' : 'border-red-200'} mb-4`}>
                <div className="flex items-start">
                  <div className={`p-1 rounded-full ${darkMode ? 'bg-red-800' : 'bg-red-200'}`}>
                    <MdWarning className={`h-4 w-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                      Esta acción es irreversible
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-red-400/70' : 'text-red-600'}`}>
                      Al eliminar tu cuenta, perderás todos tus datos y no podrás recuperarlos.
                    </p>
                  </div>
                </div>
              </div>
            <button
              onClick={handleDeleteAccount}
              className={`px-4 py-2 rounded-lg text-sm font-medium
                ${darkMode 
                  ? 'bg-red-900 text-white hover:bg-red-800' 
                  : 'bg-red-600 text-white hover:bg-red-700'} 
                transition-colors duration-150 flex items-center`}
            >
              <MdDelete className="mr-2" /> Eliminar mi cuenta
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal de confirmación de eliminación de cuenta */}
      {showDeleteModal && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-auto ${darkMode ? 'backdrop-blur-sm bg-black/50' : 'backdrop-blur-sm bg-white/50'}`}
          onClick={(e) => {
            // Cerrar el modal al hacer clic fuera de su contenido
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
              setDeleteConfirmation('');
              setPassword('');
              setDeleteError('');
            }
          }}
        >
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-center mb-6">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Eliminar cuenta
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                ¿Estás seguro de que deseas eliminar tu cuenta?
              </p>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-5`}>
                Esta acción eliminará toda tu información y no se puede deshacer.
              </p>
              
              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg dark:bg-red-900/30 dark:text-red-300">
                  {deleteError}
                </div>
              )}
              
              <div className="mt-4 mb-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} text-left mb-2`}>
                  Para confirmar, escribe: "{confirmationPhrase}"
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className={`mt-1 w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500' 
                      : 'bg-white border-gray-300 text-gray-700 focus:border-red-500'
                  } focus:outline-none focus:ring-1 focus:ring-red-500`}
                />
              </div>
              
              <div className="mb-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} text-left mb-2`}>
                  Introduce tu contraseña para confirmar
                </p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`mt-1 w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500' 
                      : 'bg-white border-gray-300 text-gray-700 focus:border-red-500'
                  } focus:outline-none focus:ring-1 focus:ring-red-500`}
                />
              </div>
              
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation('');
                    setPassword('');
                    setDeleteError('');
                  }}
                  className={`px-4 py-2 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} border rounded-lg flex-1`}
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDeleteAccount}
                  disabled={deleteLoading}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex-1 flex items-center justify-center ${deleteLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {deleteLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : "Eliminar" }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;