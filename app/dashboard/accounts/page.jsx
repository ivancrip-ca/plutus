"use client";

import { useState, useEffect, useRef } from "react";
import { 
  CreditCard, 
  Plus, 
  ChevronRight, 
  MoreVertical, 
  ArrowDownRight, 
  ArrowUpRight,
  Wallet,
  Search,
  BarChart4,
  PieChart,
  RefreshCcw
} from "lucide-react";
import { FaUniversity, FaCreditCard, FaMoneyBillWave, FaRegCreditCard } from 'react-icons/fa';
import { BsBank2 } from 'react-icons/bs';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import Link from "next/link";

const PageAccounts = () => {
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const { darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { currentUser } = useAuth();
  const [isFormView, setIsFormView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userAccounts, setUserAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openAccountMenu, setOpenAccountMenu] = useState(null);
  const [closingAccountMenu, setClosingAccountMenu] = useState(null);
  
  // Modal de confirmación para eliminar cuenta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  
  // Estados para el formulario de agregar tarjeta
  const [formData, setFormData] = useState({
    bankName: '',
    lastDigits: '',
    initialBalance: '',
    accountType: 'debit',
    color: ''
  });

  // Estado para edición de cuenta
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);
  
  // Referencia para el menú desplegable
  const menuRef = useRef(null);

  // Referencia para el contenido del modal
  const modalContentRef = useRef(null);
  
  // Agregar efecto para manejar clics fuera del menú
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target) && openAccountMenu) {
        handleCloseAccountMenu();
      }
    }
    
    // Agregar el event listener
    document.addEventListener("mousedown", handleClickOutside);
    
    // Limpiar el event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openAccountMenu]);

  // Función para manejar clics en el backdrop del modal (fuera del contenido)
  const handleModalBackdropClick = (e) => {
    // Solo cerrar si el clic fue directamente en el backdrop, no en el contenido
    if (modalContentRef.current && !modalContentRef.current.contains(e.target)) {
      // Cerrar completamente el modal, independientemente del estado actual
      setIsAddAccountOpen(false);
      setIsFormView(false);
      setIsEditMode(false);
      setEditingAccount(null);
      setError('');
      setSuccessMessage('');
    }
  };

  // Función para cerrar el modal
  const closeModal = () => {
    // Si estamos en modo edición, cerrar completamente
    if (isEditMode) {
      setIsAddAccountOpen(false);
      setIsFormView(false);
      setIsEditMode(false);
      setEditingAccount(null);
      setError('');
      setSuccessMessage('');
    } else if (isFormView) {
      // Si estamos en el formulario pero no en modo edición, volver al menú de opciones
      setIsFormView(false);
      setError('');
      setSuccessMessage('');
    } else {
      // Si estamos en el menú de opciones, cerrar el modal
      setIsAddAccountOpen(false);
    }
  };

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

  // Ensure component is mounted before rendering theme-dependent UI
  useEffect(() => {
    setMounted(true);
    if (currentUser) {
      fetchUserAccounts();
    }
  }, [currentUser]);
  
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  // Usar solo userAccounts, sin datos de ejemplo
  const accounts = userAccounts;
  
  // Calcular el balance total sumando todas las cuentas
  const totalBalance = accounts.reduce((sum, account) => sum + (Number(account.balance) || 0), 0);
  
  const getAccountIcon = (type) => {
    switch(type) {
      case "checking":
        return <FaUniversity className="text-white text-lg" />;
      case "savings":
        return <FaMoneyBillWave className="text-white text-lg" />;
      case "credit":
        return <FaCreditCard className="text-white text-lg" />;
      default:
        return <BsBank2 className="text-white text-lg" />;
    }
  };

  // Función para obtener las cuentas del usuario desde Firestore
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
  
  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si el campo es initialBalance, formatear el valor
    if (name === 'initialBalance') {
      // Eliminar cualquier caracter que no sea número o punto decimal
      const numericValue = value.replace(/[^\d.]/g, '');
      
      // Convertir a número y formatear
      if (numericValue) {
        // Utilizamos parseFloat para manejar correctamente los decimales
        const numberValue = parseFloat(numericValue);
        if (!isNaN(numberValue)) {
          // Guardamos el valor sin formato para procesamiento
          setFormData({
            ...formData,
            [name]: numericValue
          });
          
          // Formateamos el valor en el campo de entrada para mostrar las comas
          e.target.value = formatCurrency(numericValue);
          return;
        }
      }
      // Si está vacío o no es un número válido
      setFormData({
        ...formData,
        [name]: numericValue
      });
      return;
    }
    
    // Para otros campos, comportamiento normal
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Función para formatear números con separador de miles y decimales
  const formatCurrency = (value) => {
    if (!value) return '';
    // Convertir a número para asegurar el formato correcto
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) return value;
    
    // Formatear con separador de miles (punto) y decimales (coma)
    return numberValue.toLocaleString('es-ES', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Función para guardar una nueva cuenta en Firestore
  const handleAddAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('Debes iniciar sesión para añadir cuentas');
      }
      
      // Validar campos del formulario
      if (!formData.bankName.trim()) {
        throw new Error('El nombre del banco es obligatorio');
      }
      
      if (!formData.lastDigits.trim() || formData.lastDigits.length !== 2) {
        throw new Error('Debes ingresar los 2 últimos dígitos de la tarjeta');
      }
      
      if (!formData.initialBalance.trim() || isNaN(Number(formData.initialBalance))) {
        throw new Error('El saldo inicial debe ser un número válido');
      }
      
      // Crear el objeto de cuenta
      const accountData = {
        userId: currentUser.uid,
        name: `Tarjeta ${formData.accountType === 'credit' ? 'de Crédito' : 'de Débito'}`,
        institution: formData.bankName,
        type: formData.accountType,
        balance: Number(formData.initialBalance),
        number: `**** **${formData.lastDigits}`,
        currency: 'MXN',
        createdAt: serverTimestamp(),
        color: formData.color || (formData.accountType === 'credit' ? 'bg-purple-500' : 'bg-blue-500'),
      };
      
      // Si es tarjeta de crédito, agregar límite (opcional)
      if (formData.accountType === 'credit') {
        accountData.limit = 0; // Podría ser un campo adicional en el formulario
      }
      
      // Guardar en Firestore
      const docRef = await addDoc(collection(db, 'accounts'), accountData);
      
      console.log('Cuenta agregada con ID:', docRef.id);
      setSuccessMessage('Tarjeta agregada correctamente');
      
      // Limpiar formulario
      setFormData({
        bankName: '',
        lastDigits: '',
        initialBalance: '',
        accountType: 'debit',
        color: ''
      });
      
      // Actualizar lista de cuentas
      fetchUserAccounts();
      
      // Cerrar modal después de un breve momento
      setTimeout(() => {
        setIsFormView(false);
        setIsAddAccountOpen(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error al agregar cuenta:', error);
      setError(error.message || 'Error al agregar la cuenta');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para mostrar el formulario de tarjeta
  const showCardForm = () => {
    setError('');
    setSuccessMessage('');
    setIsFormView(true);
  };

  // Función para mostrar el modal de eliminación
  const showDeleteConfirmation = (account) => {
    setAccountToDelete({
      id: account.id,
      name: account.name
    });
    setShowDeleteModal(true);
    handleCloseAccountMenu();
  };
  
  // Función para eliminar una cuenta (nueva versión sin alerta del navegador)
  const handleDeleteAccount = async () => {
    if (!accountToDelete || !currentUser) return;
    
    try {
      setLoading(true);
      // Importar funciones de Firestore necesarias para eliminación
      const { doc, deleteDoc } = await import('firebase/firestore');
      
      // Eliminar la cuenta de Firestore
      await deleteDoc(doc(db, 'accounts', accountToDelete.id));
      
      // Actualizar la lista de cuentas
      await fetchUserAccounts();
      
      // Cerrar modal de confirmación
      setShowDeleteModal(false);
      setAccountToDelete(null);
      
      // Mostrar mensaje de éxito en la interfaz principal después de cerrar el modal
      setSuccessMessage('Cuenta eliminada correctamente');
      
      // Limpiar el mensaje después de un tiempo
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
      setError('No se pudo eliminar la cuenta. Inténtalo de nuevo.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para manejar el clic en el botón de tres puntos
  const handleOptionsClick = (e, accountId) => {
    e.stopPropagation(); // Evitar que se active el onClick del div contenedor
    
    // Si el menú ya está abierto, cerrarlo, de lo contrario, abrirlo
    if (openAccountMenu === accountId) {
      handleCloseAccountMenu();
    } else {
      setOpenAccountMenu(accountId);
    }
  };

  // Función para iniciar edición de cuenta
  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setFormData({
      bankName: account.institution || '',
      lastDigits: account.number ? account.number.slice(-2) : '',
      initialBalance: account.balance ? account.balance.toString() : '0',
      accountType: account.type || 'debit',
      color: account.color || ''
    });
    // Guardar una copia de los datos originales para comparar si hay cambios
    setOriginalFormData({
      bankName: account.institution || '',
      lastDigits: account.number ? account.number.slice(-2) : '',
      initialBalance: account.balance ? account.balance.toString() : '0',
      accountType: account.type || 'debit',
      color: account.color || ''
    });
    setIsEditMode(true);
    setIsFormView(true);
    setIsAddAccountOpen(true);
    setError(''); // Limpiar mensajes de error previos
    setSuccessMessage(''); // Limpiar mensajes de éxito previos
    handleCloseAccountMenu();
  };
  
  // Función para actualizar cuenta existente
  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Verificar si hay cambios reales en los datos del formulario
    const hasChanges = 
      formData.bankName !== originalFormData.bankName ||
      formData.lastDigits !== originalFormData.lastDigits ||
      formData.initialBalance !== originalFormData.initialBalance ||
      formData.accountType !== originalFormData.accountType ||
      formData.color !== originalFormData.color;
      
    if (!hasChanges) {
      setSuccessMessage('No hay cambios para guardar');
      return;
    }
    
    setLoading(true);
    
    try {
      if (!currentUser || !editingAccount) {
        throw new Error('Ocurrió un error al actualizar la cuenta');
      }
      
      // Validar campos del formulario (similar a agregar cuenta)
      if (!formData.bankName.trim()) {
        throw new Error('El nombre del banco es obligatorio');
      }
      
      if (!formData.lastDigits.trim() || formData.lastDigits.length !== 2) {
        throw new Error('Debes ingresar los 2 últimos dígitos de la tarjeta');
      }
      
      if (!formData.initialBalance.trim() || isNaN(Number(formData.initialBalance))) {
        throw new Error('El saldo inicial debe ser un número válido');
      }
      
      // Importar funciones de Firestore necesarias para actualización
      const { doc, updateDoc } = await import('firebase/firestore');
      
      // Crear el objeto de cuenta actualizado
      const accountData = {
        institution: formData.bankName,
        type: formData.accountType,
        balance: Number(formData.initialBalance),
        number: `**** **${formData.lastDigits}`,
        name: `Tarjeta ${formData.accountType === 'credit' ? 'de Crédito' : 'de Débito'}`,
        color: formData.color || (formData.accountType === 'credit' ? 'bg-purple-500' : 'bg-blue-500'),
        updatedAt: serverTimestamp()
      };
      
      // Si es tarjeta de crédito, actualizar el límite
      if (formData.accountType === 'credit') {
        accountData.limit = editingAccount.limit || 0;
      }
      
      // Actualizar en Firestore
      await updateDoc(doc(db, 'accounts', editingAccount.id), accountData);
      
      console.log('Cuenta actualizada con ID:', editingAccount.id);
      setSuccessMessage('Tarjeta actualizada correctamente');
      
      // Actualizar lista de cuentas
      await fetchUserAccounts();
      
      // No reseteamos el formulario inmediatamente para mantener los valores en la vista
      // Solo programamos el cierre del modal después de un breve momento
      setTimeout(() => {
        setIsFormView(false);
        setIsAddAccountOpen(false);
        setIsEditMode(false);
        setEditingAccount(null);
        setSuccessMessage(''); // Limpiar mensaje de éxito
        
        // Recién aquí limpiamos el formulario
        setFormData({
          bankName: '',
          lastDigits: '',
          initialBalance: '',
          accountType: 'debit',
          color: ''
        });
      }, 1500);
      
    } catch (error) {
      console.error('Error al actualizar cuenta:', error);
      setError(error.message || 'Error al actualizar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  // Mock transaction data
  const transactions = [
    {
      id: 1,
      description: "Supermercado Local",
      amount: -85.25,
      date: "2023-11-28",
      category: "Groceries",
      accountId: 1
    },
    {
      id: 2,
      description: "Depósito Nómina",
      amount: 2750.00,
      date: "2023-11-25",
      category: "Income",
      accountId: 1
    },
    {
      id: 3,
      description: "Netflix Suscripción",
      amount: -15.99,
      date: "2023-11-24",
      category: "Entertainment",
      accountId: 3
    },
    {
      id: 4,
      description: "Transferencia a Ahorro",
      amount: -500.00,
      date: "2023-11-22",
      category: "Transfers",
      accountId: 1
    },
    {
      id: 5,
      description: "Transferencia desde Principal",
      amount: 500.00,
      date: "2023-11-22",
      category: "Transfers",
      accountId: 2
    },
  ];

  // Don't render theme-specific elements until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Minimal loading placeholder */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-40 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-6  ${darkMode ? 'text-white bg-gray-900' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
          <Wallet className="h-8 w-8 text-blue-500" />
          Mis cuentas
        </h1>
        <div className="flex space-x-2">
          <button className={`${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'} px-4 py-2 rounded-lg border flex items-center gap-1`}>
            <Search className="h-4 w-4" />
            <span>Buscar</span>
          </button>
          <button 
            onClick={() => {
              setIsAddAccountOpen(true);
              setError('');
              setSuccessMessage('');
              // Resetear el formulario al abrir el modal
              setFormData({
                bankName: '',
                lastDigits: '',
                initialBalance: '',
                accountType: 'debit',
                color: ''
              });
            }} 
            className={`cursor-pointer text-white px-4 py-2 rounded-lg  flex items-center gap-1 ${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            <Plus className="h-4 w-4" />
            <span>Agregar cuenta</span>
          </button>
        </div>
      </div>
      
      {/* Total Balance Card */}
      <div className={`bg-gradient-to-r from-cyan-500 to-cyan-700 rounded-2xl p-6 mb-8 text-white shadow-lg ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-500 to-blue-700' }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold opacity-90">Balance Total</h2>
          <button className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30">
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-end gap-2">
          <div className="text-4xl font-bold">${totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          <div className="text-sm opacity-75 mb-1">MXN</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {userAccounts.length > 0 ? (
            <>
              <div className={`bg-white bg-opacity-10 p-3 rounded-xl ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-white bg-opacity-20 text-gray-700'}`}>
                <div className="text-sm opacity-75">Ingresos</div>
                <div className="text-xl font-semibold flex items-center gap-1">
                  <ArrowDownRight className="h-4 w-4 text-green-300" />
                  <span>$0.00</span>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  Registra tus ingresos
                </p>
              </div>
              <div className={`bg-white bg-opacity-10 p-3 rounded-xl ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-white bg-opacity-20 text-gray-700'}`}>
                <div className="text-sm opacity-75">Gastos</div>
                <div className="text-xl font-semibold flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-red-300" />
                  <span>$0.00</span>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  Registra tus gastos
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={`bg-white bg-opacity-10 p-3 rounded-xl ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-white' }`}>
                <div className="text-sm opacity-75">Ingresos</div>
                <div className="text-xl font-semibold flex items-center gap-1">
                  <span>--</span>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-white opacity-60'}`}>
                  Agrega una cuenta
                </p>
              </div>
              <div className={`bg-white bg-opacity-10 p-3 rounded-xl ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-white' }`}>
                <div className="text-sm opacity-75">Gastos</div>
                <div className="text-xl font-semibold flex items-center gap-1">
                  <span>--</span>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-white opacity-60'}`}>
                  Agrega una cuenta
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Accounts Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Cuentas</h2>
          <Link href="/dashboard/accounts/all" className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center">
            Ver todas <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Mostrar solo las últimas 6 cuentas registradas */}
          {accounts.slice(0, 6).map((account) => (
            <div 
              key={account.id} 
              onClick={() => setSelectedAccount(account)}
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
                      className={`absolute z-10 cursor right-0 mt-2 w-48 rounded-md shadow-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border transform origin-top-right 
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
                          className={`w-full text-left px-4 py-2 cursor-pointer text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200 ease-in-out`}
                          onClick={() => handleEditAccount(account)}
                        >
                          Editar cuenta
                        </button>
                        <button 
                          className={`w-full text-left px-4 py-2 cursor-pointer text-sm ${darkMode ? 'text-red-300 hover:bg-red-900 hover:bg-opacity-30' : 'text-red-600 hover:bg-red-50'} transition-colors duration-200 ease-in-out`}
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
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {account.type === 'credit' ? `Límite: $${account.limit?.toLocaleString('en-US') || '0.00'}` : 'Disponible'}
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Account Card */}
          <div 
            onClick={() => {
              setIsAddAccountOpen(true);
              setError('');
              setSuccessMessage('');
              // Resetear el formulario al abrir el modal
              setFormData({
                bankName: '',
                lastDigits: '',
                initialBalance: '',
                accountType: 'debit',
                color: ''
              });
            }}
            className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'} rounded-xl border border-dashed p-4 cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[160px]`}
          >
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Plus className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className={`font-medium cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'}`}>Agregar cuenta</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center mt-1`}>Conectar banco o tarjeta</p>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border mb-8`}>
        <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b flex justify-between items-center`}>
          <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Transacciones Recientes</h2>
          <button className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center cursor-pointer">
            Ver todas <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {userAccounts.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className={`h-16 w-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                <RefreshCcw className={`h-8 w-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                Aún no hay transacciones para mostrar. Las transacciones aparecerán aquí cuando realices movimientos en tus cuentas.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <div className={`h-16 w-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                <CreditCard className={`h-8 w-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                Agrega una cuenta para empezar a registrar tus transacciones.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-4`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Distribución de Gastos</h3>
            <button className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          {userAccounts.length > 0 ? (
            <div className="flex flex-col items-center justify-center h-60">
              <div className={`h-16 w-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                <PieChart className={`h-8 w-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                Aún no hay datos suficientes para mostrar la distribución de gastos.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60">
              <div className={`h-16 w-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                <CreditCard className={`h-8 w-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                Agrega una cuenta para comenzar a visualizar tu distribución de gastos.
              </p>
            </div>
          )}
        </div>
        
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-4`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ingresos vs Gastos</h3>
            <button className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          {userAccounts.length > 0 ? (
            <div className="flex flex-col items-center justify-center h-60">
              <div className={`h-16 w-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                <BarChart4 className={`h-8 w-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                Registra tus ingresos y gastos para ver comparativas en esta sección.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60">
              <div className={`h-16 w-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                <CreditCard className={`h-8 w-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                Agrega una cuenta para comenzar a visualizar tus ingresos y gastos.
              </p>
            </div>
          )}
        </div>
      </div>
      
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
                {isFormView ? (isEditMode ? "Editar Cuenta" : "Agregar tarjeta") : "Agregar nueva cuenta"}
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
            
            {isFormView ? (
              // Formulario para agregar o editar tarjeta
              <form onSubmit={isEditMode ? handleUpdateAccount : handleAddAccount}>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                    {error}
                  </div>
                )}
                
                {successMessage && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">
                    {successMessage}
                  </div>
                )}
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="bankName" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nombre del Banco
                    </label>
                    <input
                      type="text"
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      placeholder="Ej. BBVA, Santander, HSBC"
                      className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastDigits" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Últimos 2 dígitos
                    </label>
                    <input
                      type="text"
                      id="lastDigits"
                      name="lastDigits"
                      value={formData.lastDigits}
                      onChange={handleInputChange}
                      placeholder="Ej. 42"
                      maxLength={2}
                      pattern="[0-9]{2}"
                      className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Solo los últimos 2 dígitos de tu tarjeta para identificarla
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="initialBalance" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Saldo Inicial
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                      </div>
                      <input
                        type="number"
                        id="initialBalance"
                        name="initialBalance"
                        value={formData.initialBalance}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className={`block w-full pl-8 px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tipo de Cuenta
                    </label>
                    <div className="flex space-x-2">
                      <div 
                        className={`flex-1 p-3 border rounded-lg cursor-pointer flex flex-col items-center ${
                          formData.accountType === 'debit' 
                            ? `bg-blue-50 border-blue-500 ${darkMode ? 'bg-blue-900 bg-opacity-20' : ''}` 
                            : darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setFormData({...formData, accountType: 'debit'})}
                      >
                        <div className={`p-2 rounded-full ${formData.accountType === 'debit' ? 'bg-blue-100' : 'bg-gray-100'} mb-2`}>
                          <FaRegCreditCard className={`h-5 w-5 ${formData.accountType === 'debit' ? 'text-blue-500' : 'text-gray-500'}`} />
                        </div>
                        <span className={`text-sm font-medium ${formData.accountType === 'debit' ? (darkMode ? 'text-blue-300' : 'text-blue-700') : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                          Débito
                        </span>
                      </div>
                      
                      <div 
                        className={`flex-1 p-3 border rounded-lg cursor-pointer flex flex-col items-center ${
                          formData.accountType === 'credit' 
                            ? `bg-purple-50 border-purple-500 ${darkMode ? 'bg-purple-900 bg-opacity-20' : ''}` 
                            : darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setFormData({...formData, accountType: 'credit'})}
                      >
                        <div className={`p-2 rounded-full ${formData.accountType === 'credit' ? 'bg-purple-100' : 'bg-gray-100'} mb-2`}>
                          <FaCreditCard className={`h-5 w-5 ${formData.accountType === 'credit' ? 'text-purple-500' : 'text-gray-500'}`} />
                        </div>
                        <span className={`text-sm font-medium ${formData.accountType === 'credit' ? (darkMode ? 'text-purple-300' : 'text-purple-700') : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                          Crédito
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selección de color */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Color
                    </label>
                    <div className="grid grid-cols-5 gap-2 mt-1">
                      {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 
                        'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-gray-500'].map((color) => (
                        <div 
                          key={color}
                          className={`h-8 w-8 rounded-full cursor-pointer ${color} transition-transform ${
                            // Si el color en formData coincide con este color o usar color por defecto según tipo de cuenta
                            formData.color === color || 
                            (!formData.color && formData.accountType === 'credit' && color === 'bg-purple-500') ||
                            (!formData.color && formData.accountType === 'debit' && color === 'bg-blue-500')
                              ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' 
                              : ''
                          }`}
                          onClick={() => {
                            setFormData({...formData, color: color});
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      if (isEditMode) {
                        // Si estamos en modo edición, cerrar completamente el modal
                        setIsAddAccountOpen(false);
                        setIsFormView(false);
                        setIsEditMode(false);
                        setEditingAccount(null);
                        setError('');
                        setSuccessMessage('');
                      } else {
                        // Si estamos en modo agregar, volver al menú de opciones
                        setIsFormView(false);
                        setError('');
                        setSuccessMessage('');
                      }
                    }}
                    className={`px-4 py-2 cursor-pointer ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} border rounded-lg`}
                  >
                    {isEditMode ? "Cancelar" : "Atrás"}
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 cursor-pointer bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditMode ? "Actualizando..." : "Guardando..."}
                      </>
                    ) : isEditMode ? "Actualizar" : "Guardar" }
                  </button>
                </div>
              </form>
            ) : (
              // Vista de opciones
              <>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Conecta tu cuenta bancaria o agrega una manualmente.</p>
                
                <div className="space-y-3 mb-4">
                  <div 
                    onClick={showCardForm}
                    className={`p-3 ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} border rounded-lg cursor-pointer flex items-center`}
                  >
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <CreditCard className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Agregar tarjeta</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Agrega una tarjeta de débito o crédito</p>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} ml-auto`} />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => setIsAddAccountOpen(false)}
                    className={`px-4 py-2 cursor-pointer ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} border rounded-lg`}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar cuenta */}
      {showDeleteModal && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-auto ${darkMode ? 'backdrop-blur-sm bg-black/50' : 'backdrop-blur-sm bg-white/50'}`}
          onClick={(e) => {
            // Cerrar el modal al hacer clic fuera de su contenido
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
              setAccountToDelete(null);
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
                ¿Estás seguro de que deseas eliminar esta cuenta?
              </p>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-5`}>
                <strong>{accountToDelete?.name}</strong>
                <br />
                Esta acción no se puede deshacer.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}
              
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
    </div>
  );
}

export default PageAccounts;