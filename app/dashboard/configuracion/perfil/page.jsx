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
  MdDateRange
} from 'react-icons/md';
import { useTheme } from '../../../../app/contexts/ThemeContext';
import { useAuth } from '../../../../app/contexts/AuthContext';
import { auth, storage, db } from '../../../../app/firebase';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

const UserProfilePage = () => {
  const { darkMode } = useTheme();
  const { currentUser, userData, updateUserData } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Estados para los diferentes modos de edición
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingContactInfo, setEditingContactInfo] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
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
      notifications: true,
      monthlyReports: true,
      darkMode: false
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
          notifications: userData.preferences?.notifications !== false,
          monthlyReports: userData.preferences?.monthlyReports !== false,
          darkMode: darkMode
        }
      });
    }
  }, [currentUser, userData, darkMode]);
  
  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const preferenceName = name.split('.')[1];
      setUserProfile({
        ...userProfile,
        preferences: {
          ...userProfile.preferences,
          [preferenceName]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setUserProfile({
        ...userProfile,
        [name]: value
      });
    }
  };
  
  // Manejar el envío del formulario de información personal
  const handlePersonalInfoSubmit = async () => {
    try {
      // En una aplicación real, aquí se enviarían los datos a Firebase
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
      
      setEditingPersonalInfo(false);
    } catch (error) {
      console.error('Error al actualizar información personal:', error);
    }
  };
  
  // Manejar el envío del formulario de información de contacto
  const handleContactInfoSubmit = async () => {
    try {
      // En una aplicación real, aquí se enviarían los datos a Firebase
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
      
      setEditingContactInfo(false);
    } catch (error) {
      console.error('Error al actualizar información de contacto:', error);
    }
  };
  
  // Manejar el envío del formulario de preferencias
  const handlePreferencesSubmit = async () => {
    try {
      // En una aplicación real, aquí se enviarían los datos a Firebase
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        'preferences.currency': userProfile.preferences.currency,
        'preferences.language': userProfile.preferences.language,
        'preferences.notifications': userProfile.preferences.notifications,
        'preferences.monthlyReports': userProfile.preferences.monthlyReports
      });
      
      // Actualizar el contexto
      if (updateUserData) {
        updateUserData({
          ...userData,
          preferences: {
            ...userData.preferences,
            currency: userProfile.preferences.currency,
            language: userProfile.preferences.language,
            notifications: userProfile.preferences.notifications,
            monthlyReports: userProfile.preferences.monthlyReports
          }
        });
      }
      
      setEditingPreferences(false);
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
    }
  };
  
  // Manejar la subida de foto de perfil
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
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
    } catch (error) {
      console.error('Error al subir foto de perfil:', error);
    } finally {
      setIsUploading(false);
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
                <MdLock className="mr-2" /> Configuración de Seguridad
              </button>
            </div>
          </div>
        </div>
        
        {/* Columna derecha - Información detallada */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Sección de información personal */}
          <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Información Personal
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
                  >
                    <MdCancel className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handlePersonalInfoSubmit}
                    className={`p-1.5 rounded-lg ${
                      darkMode 
                        ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                    }`}
                  >
                    <MdSave className="h-5 w-5" />
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
                  Fecha de Nacimiento
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
                Información de Contacto
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
                  >
                    <MdCancel className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleContactInfoSubmit}
                    className={`p-1.5 rounded-lg ${
                      darkMode 
                        ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                    }`}
                  >
                    <MdSave className="h-5 w-5" />
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
                  >
                    <MdCancel className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handlePreferencesSubmit}
                    className={`p-1.5 rounded-lg ${
                      darkMode 
                        ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                    }`}
                  >
                    <MdSave className="h-5 w-5" />
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
              
              <div className="md:col-span-2">
                <div className="flex items-center mb-3">
                  {editingPreferences ? (
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="preferences.notifications"
                        checked={userProfile.preferences.notifications}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <span className={`inline-block w-10 h-6 rounded-full transition-colors ${
                        userProfile.preferences.notifications 
                          ? darkMode ? 'bg-cyan-600' : 'bg-cyan-500' 
                          : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}>
                        <span className={`block w-4 h-4 mt-1 ml-1 rounded-full transition-transform transform ${
                          userProfile.preferences.notifications ? 'translate-x-4 bg-white' : 'bg-white'
                        }`}></span>
                      </span>
                      <span className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Notificaciones
                      </span>
                    </label>
                  ) : (
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        userProfile.preferences.notifications 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}></div>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Notificaciones: {userProfile.preferences.notifications ? 'Activadas' : 'Desactivadas'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  {editingPreferences ? (
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="preferences.monthlyReports"
                        checked={userProfile.preferences.monthlyReports}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <span className={`inline-block w-10 h-6 rounded-full transition-colors ${
                        userProfile.preferences.monthlyReports 
                          ? darkMode ? 'bg-cyan-600' : 'bg-cyan-500' 
                          : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}>
                        <span className={`block w-4 h-4 mt-1 ml-1 rounded-full transition-transform transform ${
                          userProfile.preferences.monthlyReports ? 'translate-x-4 bg-white' : 'bg-white'
                        }`}></span>
                      </span>
                      <span className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Informes mensuales por email
                      </span>
                    </label>
                  ) : (
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        userProfile.preferences.monthlyReports 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}></div>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Informes mensuales: {userProfile.preferences.monthlyReports ? 'Activados' : 'Desactivados'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sección para eliminar cuenta */}
          <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Eliminar Cuenta
            </h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.
            </p>
            <button
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
    </div>
  );
};

export default UserProfilePage;