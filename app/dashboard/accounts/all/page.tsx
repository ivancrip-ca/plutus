"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Wallet, 
  ArrowLeft, 
  CreditCard, 
  MoreVertical,
  Plus,
  Search
} from 'lucide-react';
import { FaUniversity, FaCreditCard, FaMoneyBillWave, FaRegCreditCard } from 'react-icons/fa';
import { BsBank2 } from 'react-icons/bs';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase';
import { collection, getDocs, query, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';

const AllAccountsPage = () => {
  const { darkMode } = useTheme();
  const { currentUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [userAccounts, setUserAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openAccountMenu, setOpenAccountMenu] = useState<string | null>(null);
  const [closingAccountMenu, setClosingAccountMenu] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<{id: string, name: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isFormView, setIsFormView] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  type Account = {
    id: string;
    name: string;
    institution: string;
    number: string;
    balance: number;
    type: string;
    color: string;
    limit?: number;
    userId: string;
  };
  
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Referencia para el menú desplegable
  const menuRef = useRef<HTMLDivElement | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  // Función para cerrar el menú desplegable con animación
  const handleCloseAccountMenu = () => {
    if (openAccountMenu) {
      setClosingAccountMenu(openAccountMenu);
      setTimeout(() => {
        setClosingAccountMenu(null);
        setOpenAccountMenu(null);
      }, 200); // Debe coincidir con la duración de la animación dropdown-out
    }
  };

  // Efecto para manejar clics fuera del menú
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && openAccountMenu) {
        handleCloseAccountMenu();
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openAccountMenu]);

  // Función para manejar clics fuera del modal
  const handleModalBackdropClick = (event: React.MouseEvent) => {
    if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
      setIsAddAccountOpen(false);
      setIsFormView(false);
      setIsEditMode(false);
      setEditingAccount(null);
      setError('');
      setSuccessMessage('');
    }
  };
  
  // Verificar que el componente está montado
  useEffect(() => {
    setMounted(true);
    if (currentUser) {
      fetchUserAccounts();
    }
  }, [currentUser]);

  // Función para obtener todas las cuentas del usuario
  const fetchUserAccounts = async () => {
    try {
      setIsLoading(true);
      if (!currentUser) return;
      
      const accountsQuery = query(
        collection(db, 'accounts'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(accountsQuery);
      const userAccountsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Cuentas del usuario obtenidas:', userAccountsData);
      setUserAccounts(userAccountsData);
    } catch (error) {
      console.error('Error al obtener las cuentas del usuario:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para manejar el clic en el botón de tres puntos
  const handleOptionsClick = (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation();
    
    // Si el menú ya está abierto, cerrarlo con animación, de lo contrario, abrirlo
    if (openAccountMenu === accountId) {
      handleCloseAccountMenu();
    } else {
      setOpenAccountMenu(accountId);
    }
  };
  
  // Función para mostrar el modal de eliminación
  const showDeleteConfirmation = (account) => {
    setAccountToDelete({
      id: account.id,
      name: account.name
    });
    setShowDeleteModal(true);
    handleCloseAccountMenu(); // Usar la función de cierre con animación
  };
  
  // Función para abrir el modal de edición de cuenta
  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setIsEditMode(true);
    setIsFormView(true);
    setIsAddAccountOpen(true);
    handleCloseAccountMenu(); // Cerrar el menú desplegable
  };

  // Función para eliminar una cuenta
  const handleDeleteAccount = async () => {
    if (!accountToDelete || !currentUser) return;
    
    try {
      setLoading(true);
      
      // Eliminar la cuenta de Firestore
      await deleteDoc(doc(db, 'accounts', accountToDelete.id));
      
      // Actualizar la lista de cuentas
      await fetchUserAccounts();
      
      // Mostrar un mensaje de éxito
      setSuccessMessage('Cuenta eliminada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Cerrar modal de confirmación
      setShowDeleteModal(false);
      setAccountToDelete(null);
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
      setError('No se pudo eliminar la cuenta. Inténtalo de nuevo.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para guardar los cambios de una cuenta editada
  const handleSaveAccount = async () => {
    try {
      if (!editingAccount || !currentUser) return;
      
      setLoading(true);
      setError('');
      
      // Obtener los valores actualizados de los campos
      const nameInput = document.getElementById('accountName') as HTMLInputElement;
      const institutionInput = document.getElementById('institution') as HTMLInputElement;
      const numberInput = document.getElementById('accountNumber') as HTMLInputElement;
      const balanceInput = document.getElementById('balance') as HTMLInputElement;
      
      // Para cuentas de tipo crédito, obtener el límite actualizado
      let updatedLimit;
      if (editingAccount.type === 'credit') {
        const limitInput = document.getElementById('limit') as HTMLInputElement;
        updatedLimit = parseFloat(limitInput.value);
      }
      
      // Crear objeto con los datos actualizados
      const updatedAccount = {
        name: nameInput.value,
        institution: institutionInput.value,
        number: numberInput.value,
        balance: parseFloat(balanceInput.value),
        color: editingAccount.color, // El color se actualiza directamente en el estado
        ...(editingAccount.type === 'credit' && { limit: updatedLimit }),
        // Mantener los otros campos inalterados
        type: editingAccount.type,
        userId: currentUser.uid,
        updatedAt: new Date().toISOString()
      };
      
      // Actualizar en Firestore
      await updateDoc(doc(db, 'accounts', editingAccount.id), updatedAccount);
      
      // Refrescar la lista de cuentas
      await fetchUserAccounts();
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Cuenta actualizada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Cerrar el modal
      setIsAddAccountOpen(false);
      setIsFormView(false);
      setIsEditMode(false);
      setEditingAccount(null);
    } catch (error) {
      console.error('Error al actualizar la cuenta:', error);
      setError('No se pudo actualizar la cuenta. Inténtalo de nuevo.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para obtener el ícono adecuado según el tipo de cuenta
  const getAccountIcon = (type) => {
    switch(type) {
      case "checking":
        return <FaUniversity className="text-white text-lg" />;
      case "savings":
        return <FaMoneyBillWave className="text-white text-lg" />;
      case "credit":
        return <FaCreditCard className="text-white text-lg" />;
      case "efectivo":
        return <FaMoneyBillWave className="text-white text-lg" />;
      default:
        return <BsBank2 className="text-white text-lg" />;
    }
  };
  
  // Estado de carga inicial
  if (!mounted) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-6 h-screen ${darkMode ? 'text-white bg-gray-900' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounts" className={`${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'} p-2 rounded-lg border`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
            <Wallet className="h-8 w-8 text-blue-500" />
            Todas mis cuentas
          </h1>
        </div>
        <div className="flex space-x-2">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} px-4 py-2 rounded-lg border flex items-center gap-2`}>
            <Search className="h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar cuenta..."
              className={`${darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'} border-0 focus:outline-none focus:ring-0 w-36 sm:w-40`}
            />
          </div>
          <Link href="/dashboard/accounts" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>Agregar Cuenta</span>
          </Link>
        </div>
      </div>
      
      {/* Mensaje de éxito o error */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}
      
      {/* Lista de todas las cuentas */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            // Skeleton loading state
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-gray-300 h-12 w-12 rounded-lg mr-3"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded w-20 mt-2"></div>
                </div>
              </div>
            ))
          ) : userAccounts.length === 0 ? (
            // Estado vacío
            <div className="col-span-3 py-12 flex flex-col items-center justify-center">
              <div className={`h-20 w-20 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                <CreditCard className={`h-10 w-10 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                No tienes cuentas registradas
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md mb-6`}>
                Agrega tu primera cuenta bancaria o tarjeta para comenzar a administrar tus finanzas.
              </p>
              <Link 
                href="/dashboard/accounts"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Cuenta</span>
              </Link>
            </div>
          ) : (
            // Lista de cuentas
            userAccounts.map((account) => (
              <div 
                key={account.id} 
                className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100 hover:shadow-md'} rounded-xl shadow-sm border p-4 cursor-pointer transition-shadow`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`${account.color} p-3 rounded-lg mr-3`}>
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{account.name}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{account.institution} · {account.number}</p>
                    </div>
                  </div>
                  <div className="relative" ref={menuRef}>
                    <button 
                      className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                      onClick={(e) => handleOptionsClick(e, account.id)}
                    >
                      <MoreVertical className="h-5 w-5 cursor-pointer" />
                    </button>
                    
                    {(openAccountMenu === account.id || closingAccountMenu === account.id) && (
                      <div 
                        className={`absolute z-10 right-0 mt-2 w-48 rounded-md shadow-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border transform origin-top-right 
                        transition-all duration-300 ease-out`}
                        style={{ 
                          right: '-8px',
                          animation: closingAccountMenu === account.id 
                            ? 'dropdown-out 0.2s ease-in forwards' 
                            : 'dropdown-in 0.3s ease-out forwards'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          <button 
                            onClick={() => handleEditAccount(account)}
                            className={`block w-full text-left px-4 py-2 text-sm cursor-pointer ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200 ease-in-out`}
                          >
                            Editar cuenta
                          </button>
                          <button 
                            className={`w-full text-left px-4 py-2 text-sm cursor-pointer ${darkMode ? 'text-red-300 hover:bg-red-900 hover:bg-opacity-30' : 'text-red-600 hover:bg-red-50'} transition-colors duration-200 ease-in-out`}
                            onClick={() => showDeleteConfirmation(account)}
                          >
                            Eliminar cuenta
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className={`text-xl font-bold ${account.balance < 0 ? 'text-red-600' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${Math.abs(account.balance).toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {account.type === 'credit' ? `Límite: $${account.limit?.toLocaleString('en-US') || '0.00'}` : 'Disponible'}
                    </div>
                    
                    {/* Botón para establecer saldo inicial de efectivo */}
                    {account.type === 'efectivo' && (
                      <div className="mt-2 w-full">
                        <label htmlFor={`balance-${account.id}`} className={`block text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                          Actualizar saldo inicial:
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>$</span>
                            </div>
                            <input
                              type="number"
                              id={`balance-${account.id}`}
                              defaultValue={account.balance}
                              className={`w-full pl-5 pr-2 py-1 text-sm rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            />
                          </div>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              
                              try {
                                setLoading(true);
                                setError('');
                                
                                // Obtener el valor actualizado del saldo
                                const balanceInput = document.getElementById(`balance-${account.id}`) as HTMLInputElement;
                                const newBalance = parseFloat(balanceInput.value);
                                
                                if (isNaN(newBalance)) {
                                  setError('Por favor, ingresa un saldo válido');
                                  setTimeout(() => setError(''), 3000);
                                  return;
                                }
                                
                                // Actualizar la cuenta en Firestore
                                await updateDoc(doc(db, 'accounts', account.id), {
                                  balance: newBalance,
                                  updatedAt: new Date().toISOString()
                                });
                                
                                // Refrescar la lista de cuentas
                                await fetchUserAccounts();
                                
                                // Mostrar mensaje de éxito
                                setSuccessMessage('Saldo de efectivo actualizado correctamente');
                                setTimeout(() => setSuccessMessage(''), 3000);
                              } catch (error) {
                                console.error('Error al actualizar el saldo de efectivo:', error);
                                setError('No se pudo actualizar el saldo. Inténtalo de nuevo.');
                                setTimeout(() => setError(''), 3000);
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                          >
                            {loading ? 'Actualizando...' : 'Actualizar'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Modal de confirmación para eliminar cuenta */}
      {showDeleteModal && (
        <div className={`fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-auto ${darkMode ? 'backdrop-blur-sm bg-black/50' : 'backdrop-blur-sm bg-white/50'}`}>
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
                ¿Estás seguro de que deseas eliminar esta cuenta?
              </p>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-5`}>
                <strong>{accountToDelete?.name}</strong>
                <br />
                Esta acción no se puede deshacer.
              </p>
              
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setAccountToDelete(null);
                  }}
                  className={`px-4 py-2 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} border rounded-lg flex-1`}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex-1 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
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

      {/* Add Account Modal */}
      {isAddAccountOpen && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-auto ${darkMode ? 'backdrop-blur-sm bg-black/30' : 'backdrop-blur-sm bg-white/30'}`}
          onClick={handleModalBackdropClick}
        >
          <div 
            ref={modalContentRef}
            className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {isFormView ? (isEditMode ? "Editar Cuenta" : "Agregar Tarjeta") : "Agregar nueva cuenta"}
              </h2>
              <button 
                onClick={() => {
                  setIsAddAccountOpen(false);
                  setIsFormView(false);
                  setIsEditMode(false);
                  setEditingAccount(null);
                  setError('');
                  setSuccessMessage('');
                }} 
                className={`cursor-pointer ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                &times;
              </button>
            </div>
            
            {/* Contenido del formulario de edición */}
            {isEditMode && editingAccount && (
              <div>
                <div className="mt-4 space-y-4">
                  {/* Nombre de la cuenta */}
                  <div>
                    <label htmlFor="accountName" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Nombre de la cuenta
                    </label>
                    <input
                      type="text"
                      id="accountName"
                      defaultValue={editingAccount.name}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  
                  {/* Institución financiera */}
                  <div>
                    <label htmlFor="institution" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Institución
                    </label>
                    <input
                      type="text"
                      id="institution"
                      defaultValue={editingAccount.institution}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  
                  {/* Número de cuenta */}
                  <div>
                    <label htmlFor="accountNumber" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Número de cuenta
                    </label>
                    <input
                      type="text"
                      id="accountNumber"
                      defaultValue={editingAccount.number}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  
                  {/* Saldo */}
                  <div>
                    <label htmlFor="balance" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Saldo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                      </div>
                      <input
                        type="number"
                        id="balance"
                        step="0.01"
                        defaultValue={editingAccount.balance}
                        className={`w-full pl-8 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  
                  {/* Selección de tipo de cuenta */}
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Tipo de Cuenta
                    </label>
                    <div className="flex space-x-2">
                      <div 
                        className={`flex-1 p-3 border rounded-lg cursor-pointer flex flex-col items-center ${
                          editingAccount.type === 'debit' 
                            ? `bg-blue-50 border-blue-500 ${darkMode ? 'bg-blue-900 bg-opacity-20' : ''}` 
                            : darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setEditingAccount({
                            ...editingAccount, 
                            type: 'debit',
                            name: 'Tarjeta de Débito',
                            // Actualizar color si está usando el color predeterminado de crédito
                            color: editingAccount.color === 'bg-purple-500' ? 'bg-blue-500' : editingAccount.color
                          });
                        }}
                      >
                        <div className={`p-2 rounded-full ${editingAccount.type === 'debit' ? 'bg-blue-100' : 'bg-gray-100'} mb-2`}>
                          <FaRegCreditCard className={`h-5 w-5 ${editingAccount.type === 'debit' ? 'text-blue-500' : 'text-gray-500'}`} />
                        </div>
                        <span className={`text-sm font-medium ${editingAccount.type === 'debit' ? (darkMode ? 'text-blue-300' : 'text-blue-700') : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                          Débito
                        </span>
                      </div>
                      
                      <div 
                        className={`flex-1 p-3 border rounded-lg cursor-pointer flex flex-col items-center ${
                          editingAccount.type === 'credit' 
                            ? `bg-purple-50 border-purple-500 ${darkMode ? 'bg-purple-900 bg-opacity-20' : ''}` 
                            : darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setEditingAccount({
                            ...editingAccount, 
                            type: 'credit',
                            name: 'Tarjeta de Crédito',
                            // Actualizar color si está usando el color predeterminado de débito
                            color: editingAccount.color === 'bg-blue-500' ? 'bg-purple-500' : editingAccount.color,
                            // Asegurar que tenga propiedad limit
                            limit: editingAccount.limit || 0
                          });
                        }}
                      >
                        <div className={`p-2 rounded-full ${editingAccount.type === 'credit' ? 'bg-purple-100' : 'bg-gray-100'} mb-2`}>
                          <FaCreditCard className={`h-5 w-5 ${editingAccount.type === 'credit' ? 'text-purple-500' : 'text-gray-500'}`} />
                        </div>
                        <span className={`text-sm font-medium ${editingAccount.type === 'credit' ? (darkMode ? 'text-purple-300' : 'text-purple-700') : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                          Crédito
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Límite (solo si es tarjeta de crédito) */}
                  {editingAccount.type === 'credit' && (
                    <div>
                      <label htmlFor="limit" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Límite de crédito
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                        </div>
                        <input
                          type="number"
                          id="limit"
                          step="0.01"
                          defaultValue={editingAccount.limit}
                          className={`w-full pl-8 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Selección de color */}
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Color
                    </label>
                    <div className="grid grid-cols-5 gap-2 mt-1">
                      {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 
                        'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-gray-500'].map((color) => (
                        <div 
                          key={color}
                          className={`h-8 w-8 rounded-full cursor-pointer ${color} transition-transform ${editingAccount.color === color ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : ''}`}
                          onClick={() => {
                            setEditingAccount({...editingAccount, color});
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => {
                      setIsAddAccountOpen(false);
                      setIsFormView(false);
                      setIsEditMode(false);
                      setEditingAccount(null);
                    }}
                    className={`flex-1 px-4 py-2 ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-lg transition-colors`}
                  >
                    Cancelar
                  </button>
                  <button
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={() => handleSaveAccount()}
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAccountsPage;