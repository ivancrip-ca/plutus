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
// Importar Chart.js y sus componentes
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Registramos los componentes necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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
  const [userTransactions, setUserTransactions] = useState([]);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [efectivoTransactions, setEfectivoTransactions] = useState([]);
  const [saldoEfectivo, setSaldoEfectivo] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para datos de gráficos
  const [gastosPorCategoria, setGastosPorCategoria] = useState({});
  const [ingresosPorCategoria, setIngresosPorCategoria] = useState({});
  const [datosIngresoVsGasto, setDatosIngresoVsGasto] = useState({});
  const [tipoGrafica, setTipoGrafica] = useState('gastos'); // 'gastos' o 'ingresos'
  
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

  // Estado para el modal de edición de saldo inicial de efectivo
  const [isEfectivoModalOpen, setIsEfectivoModalOpen] = useState(false);
  const [saldoInicialEfectivo, setSaldoInicialEfectivo] = useState('0');
  const [updateEfectivoLoading, setUpdateEfectivoLoading] = useState(false);
  const [efectivoError, setEfectivoError] = useState('');
  const [efectivoSuccess, setEfectivoSuccess] = useState('');
  
  // Función para manejar el cambio en el input del saldo inicial de efectivo
  const handleEfectivoInputChange = (e) => {
    const value = e.target.value;
    // Eliminar cualquier caracter que no sea número o punto decimal
    const numericValue = value.replace(/[^\d.]/g, '');
    setSaldoInicialEfectivo(numericValue);
  };
  
  // Función para guardar el saldo inicial de efectivo
  const handleSaveEfectivoSaldoInicial = async (e) => {
    e.preventDefault();
    setEfectivoError('');
    setEfectivoSuccess('');
    setUpdateEfectivoLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('Debes iniciar sesión para realizar esta acción');
      }
      
      if (!saldoInicialEfectivo.trim() || isNaN(Number(saldoInicialEfectivo))) {
        throw new Error('El saldo inicial debe ser un número válido');
      }
      
      // Importar las funciones necesarias de Firestore
      const { doc, setDoc, collection, getDocs, query, where, serverTimestamp, deleteDoc } = await import('firebase/firestore');
      
      // Primero comprobar si ya existe una transacción de saldo inicial
      const saldoInicialQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid),
        where('cuenta', '==', 'Efectivo'),
        where('esSaldoInicial', '==', true)
      );
      
      const querySnapshot = await getDocs(saldoInicialQuery);
      
      // Si hay transacciones existentes con esSaldoInicial=true, eliminarlas
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Crear la nueva transacción de saldo inicial
      const saldoInicialData = {
        userId: currentUser.uid,
        descripcion: 'Saldo inicial de efectivo',
        monto: Number(saldoInicialEfectivo),
        tipo: 'ingreso',
        categoria: 'Saldo Inicial',
        cuenta: 'Efectivo',
        fecha: new Date().toISOString(),
        createdAt: serverTimestamp(),
        esSaldoInicial: true
      };
      
      // Guardar en Firestore
      const docRef = await addDoc(collection(db, 'transactions'), saldoInicialData);
      
      console.log('Saldo inicial guardado con ID:', docRef.id);
      setEfectivoSuccess('Saldo inicial guardado correctamente');
      
      // Actualizar lista de transacciones
      await fetchUserTransactions();
      
      // Cerrar modal después de un breve momento
      setTimeout(() => {
        setIsEfectivoModalOpen(false);
        setEfectivoSuccess('');
      }, 1500);
      
    } catch (error) {
      console.error('Error al guardar saldo inicial:', error);
      setEfectivoError(error.message || 'Error al guardar el saldo inicial');
    } finally {
      setUpdateEfectivoLoading(false);
    }
  };

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
      fetchUserTransactions();
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

  // Función para obtener todas las transacciones del usuario
  const fetchUserTransactions = async () => {
    try {
      if (!currentUser) return;
      
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(transactionsQuery);
      const transactionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUserTransactions(transactionsData);
      
      // Calcular totales
      const ingresos = transactionsData
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
      
      const gastos = transactionsData
        .filter(t => t.tipo === 'gasto')
        .reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
      
      setTotalIngresos(ingresos);
      setTotalGastos(gastos);
      
      // Filtrar transacciones de efectivo
      const efectivoData = transactionsData.filter(t => 
        t.cuenta && t.cuenta.toLowerCase() === 'efectivo'
      );
      
      setEfectivoTransactions(efectivoData);
      
      // Calcular saldo de efectivo
      const ingresosEfectivo = efectivoData
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
      
      const gastosEfectivo = efectivoData
        .filter(t => t.tipo === 'gasto')
        .reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
      
      setSaldoEfectivo(ingresosEfectivo - gastosEfectivo);
      
      // Procesar datos para gráficas
      processChartData(transactionsData);
      
    } catch (error) {
      console.error('Error al obtener las transacciones del usuario:', error);
    }
  };
  
  // Función para procesar datos para las gráficas
  const processChartData = (transactions) => {
    // Procesamiento para la gráfica de distribución de gastos por categoría
    const gastosPorCategoriaObj = {};
    const ingresosPorCategoriaObj = {};
    
    // Filtrar transacciones de tipo gasto e ingreso
    const gastosTransactions = transactions.filter(t => t.tipo === 'gasto');
    const ingresosTransactions = transactions.filter(t => t.tipo === 'ingreso');
    
    // Agrupar gastos por categoría y sumar montos
    gastosTransactions.forEach(transaction => {
      const categoria = transaction.categoria || 'Sin categoría';
      const monto = Number(transaction.monto) || 0;
      
      if (gastosPorCategoriaObj[categoria]) {
        gastosPorCategoriaObj[categoria] += monto;
      } else {
        gastosPorCategoriaObj[categoria] = monto;
      }
    });
    
    // Agrupar ingresos por categoría y sumar montos
    ingresosTransactions.forEach(transaction => {
      const categoria = transaction.categoria || 'Sin categoría';
      const monto = Number(transaction.monto) || 0;
      
      if (ingresosPorCategoriaObj[categoria]) {
        ingresosPorCategoriaObj[categoria] += monto;
      } else {
        ingresosPorCategoriaObj[categoria] = monto;
      }
    });
    
    setGastosPorCategoria(gastosPorCategoriaObj);
    setIngresosPorCategoria(ingresosPorCategoriaObj);
    
    // Procesamiento para la gráfica de ingresos vs gastos (por mes)
    const últimos6Meses = [];
    const hoy = new Date();
    
    // Generar array con los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const añoMes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const nombreMes = fecha.toLocaleString('es-ES', { month: 'short' });
      
      últimos6Meses.push({
        añoMes,
        nombreMes,
        ingresos: 0,
        gastos: 0
      });
    }
    
    // Agrupar transacciones por mes
    transactions.forEach(transaction => {
      if (!transaction.fecha) return;
      
      const fechaTransaccion = new Date(transaction.fecha);
      const añoMesTransaccion = `${fechaTransaccion.getFullYear()}-${String(fechaTransaccion.getMonth() + 1).padStart(2, '0')}`;
      
      const mesIndex = últimos6Meses.findIndex(m => m.añoMes === añoMesTransaccion);
      if (mesIndex === -1) return; // No está en los últimos 6 meses
      
      const monto = Number(transaction.monto) || 0;
      
      if (transaction.tipo === 'ingreso') {
        últimos6Meses[mesIndex].ingresos += monto;
      } else if (transaction.tipo === 'gasto') {
        últimos6Meses[mesIndex].gastos += monto;
      }
    });
    
    setDatosIngresoVsGasto(últimos6Meses);
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
    <div className={`p-6 ${darkMode ? 'text-white bg-gray-900' : ''}`}>
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
                  <span>${totalIngresos.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  Total de ingresos registrados
                </p>
              </div>
              <div className={`bg-white bg-opacity-10 p-3 rounded-xl ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-white bg-opacity-20 text-gray-700'}`}>
                <div className="text-sm opacity-75">Gastos</div>
                <div className="text-xl font-semibold flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-red-300" />
                  <span>${totalGastos.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  Total de gastos registrados
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={`bg-white bg-opacity-10 p-3 rounded-xl ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-white text-gray-800' }`}>
                <div className="text-sm opacity-75">Ingresos</div>
                <div className="text-xl font-semibold flex items-center gap-1">
                  <span>--</span>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-800 opacity-60'}`}>
                  Agrega una cuenta
                </p>
              </div>
              <div className={`bg-white bg-opacity-10 p-3 rounded-xl ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-white text-gray-800' }`}>
                <div className="text-sm opacity-75">Gastos</div>
                <div className="text-xl font-semibold flex items-center gap-1">
                  <span>--</span>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-800 opacity-60'}`}>
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
          {/* Cuenta de Efectivo (siempre presente) */}
          <Link href="/dashboard/accounts/efectivo" className={`block p-6 rounded-xl shadow-sm transition-all duration-300 ${
            darkMode ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-100 hover:border-gray-300'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-full mr-3 ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                    <FaMoneyBillWave className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Efectivo</h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Cuenta predeterminada
                    </p>
                  </div>
                </div>
                
                {/* Saldo de efectivo y mensaje */}
                        {efectivoTransactions.length > 0 ? (
                          <>
                          <div className={`mt-4 text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            ${saldoEfectivo.toLocaleString('en-US', {minimumFractionDigits: 2})}
                          </div>
                          <div className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {efectivoTransactions.length} transacciones registradas
                          </div>
                          </>
                        ) : (
                          <div className={`mt-4 text-sm p-3 rounded-lg ${
                          darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
                          }`}>
                          No has registrado transacciones en efectivo aún. 
                          <br/>
                          <span className={`font-medium mt-1 inline-block ${
                            darkMode ? 'text-blue-400' : 'text-blue-600'
                          } hover:underline`}>
                            Registra tu primera transacción →
                          </span>
                          </div>
                        )}
                </div>
             </div>
             
             {/* Botones de acción */}
            <div className="mt-6 flex justify-between items-center">
              <button 
                onClick={(e) => {
                  e.preventDefault(); // Evitar que el Link se active
                  setIsEfectivoModalOpen(true);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Configurar
              </button>
              <div className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                Ver transacciones →
              </div>
            </div>
          </Link>
          
          {/* Mostrar solo las últimas 5 cuentas registradas */}
          {accounts.slice(0, 5).map((account) => (
            <Link 
              key={account.id} 
              href={`/dashboard/accounts/${account.id}`}
              className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-100 hover:shadow-md'} rounded-xl shadow-sm border p-4 cursor-pointer transition-shadow block`}
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
                    onClick={(e) => {
                      e.preventDefault(); // Evitar que el Link se active
                      handleOptionsClick(e, account.id);
                    }}
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
                          onClick={(e) => {
                            e.preventDefault(); // Evitar que el Link se active
                            handleEditAccount(account);
                          }}
                        >
                          Editar cuenta
                        </button>
                        <button 
                          className={`w-full text-left px-4 py-2 cursor-pointer text-sm ${darkMode ? 'text-red-300 hover:bg-red-900 hover:bg-opacity-30' : 'text-red-600 hover:bg-red-50'} transition-colors duration-200 ease-in-out`}
                          onClick={(e) => {
                            e.preventDefault(); // Evitar que el Link se active
                            showDeleteConfirmation(account);
                          }}
                        >
                          Eliminar cuenta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-2">
                <div className={`text-xl font-bold ${account.balance < 0 ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${Math.abs(account.balance).toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
                <div className="flex justify-between items-center">
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    {account.type === 'credit' ? `Límite: $${account.limit?.toLocaleString('en-US') || '0.00'}` : 'Disponible'}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Ver transacciones →
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {/* Add Account Card */}
          {accounts.length < 5 && (
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
              className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'} rounded-xl border border-dashed p-4 cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[160px]`}
            >
              <div className={`h-12 w-12 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} flex items-center justify-center mb-2`}>
                <Plus className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              </div>
              <h3 className={`font-medium cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'}`}>Agregar cuenta</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center mt-1`}>Conectar banco o tarjeta</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border mb-8`}>
        <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b flex justify-between items-center`}>
          <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Transacciones recientes</h2>
          <Link href="/dashboard/transactions" className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center cursor-pointer">
            Ver todas <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {userTransactions.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {userTransactions
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                .slice(0, 5)
                .map((transaction) => (
                  <div key={transaction.id} className={`p-4 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} flex items-center justify-between transition-colors`}>
                    <div className="flex items-center">
                      <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full mb-0 mr-3 flex-shrink-0 ${
                        transaction.tipo === 'ingreso' 
                          ? darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600' 
                          : darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.tipo === 'ingreso' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{transaction.descripcion}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{transaction.categoria || 'Sin categoría'}</p>
                          <span className={`hidden sm:inline mx-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(transaction.fecha).toLocaleDateString('es-ES', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.tipo === 'ingreso' 
                          ? darkMode ? 'text-green-400' : 'text-green-600' 
                          : darkMode ? 'text-red-400' : 'text-red-600'
                      }`}>${transaction.monto.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {transaction.cuenta}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <div className={`h-16 w-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                <RefreshCcw className={`h-8 w-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                Aún no hay transacciones para mostrar. Las transacciones aparecerán aquí cuando realices movimientos en tus cuentas.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-4`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Distribución por categoría</h3>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setTipoGrafica('gastos')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  tipoGrafica === 'gastos' 
                    ? darkMode 
                      ? 'bg-red-900/20 text-red-400 border border-red-800/30' 
                      : 'bg-red-50 text-red-700 border border-red-100 ' 
                    : darkMode 
                      ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Gastos
              </button>
              <button 
                onClick={() => setTipoGrafica('ingresos')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  tipoGrafica === 'ingresos' 
                    ? darkMode 
                      ? 'bg-green-900/20 text-green-400 border border-green-800/30' 
                      : 'bg-green-50 text-green-700 border border-green-100' 
                    : darkMode 
                      ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Ingresos
              </button>
            </div>
          </div>
          
          {tipoGrafica === 'gastos' ? (
            // Gráfica de gastos
            Object.keys(gastosPorCategoria).length > 0 ? (
              <div className="h-60">
                <Pie 
                  data={{
                    labels: Object.keys(gastosPorCategoria),
                    datasets: [
                      {
                        data: Object.values(gastosPorCategoria),
                        backgroundColor: [
                          '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', 
                          '#F97316', '#14B8A6', '#6366F1', '#84CC16'
                        ],
                        borderWidth: 1,
                        borderColor: darkMode ? '#111827' : '#ffffff',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          color: darkMode ? '#ffffff' : '#111827',
                          usePointStyle: true,
                          boxWidth: 10
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: $${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${percentage}%)`;
                          }
                        }
                      },
                      title: {
                        display: true,
                        text: 'Distribución de gastos',
                        color: darkMode ? '#ffffff' : '#111827',
                        font: {
                          size: 14
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60">
                <div className={`h-16 w-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                  <PieChart className={`h-8 w-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                  Aún no hay datos suficientes para mostrar la distribución de gastos.
                </p>
              </div>
            )
          ) : (
            // Gráfica de ingresos
            Object.keys(ingresosPorCategoria).length > 0 ? (
              <div className="h-60">
                <Pie 
                  data={{
                    labels: Object.keys(ingresosPorCategoria),
                    datasets: [
                      {
                        data: Object.values(ingresosPorCategoria),
                        backgroundColor: [
                          '#10B981', '#0EA5E9', '#4F46E5', '#A855F7',
                          '#0891B2', '#059669', '#7C3AED', '#2563EB'
                        ],
                        borderWidth: 1,
                        borderColor: darkMode ? '#111827' : '#ffffff',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          color: darkMode ? '#ffffff' : '#111827',
                          usePointStyle: true,
                          boxWidth: 10
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: $${value.toLocaleString('es-ES')} (${percentage}%)`;
                          }
                        }
                      },
                      title: {
                        display: true,
                        text: 'Distribución de ingresos',
                        color: darkMode ? '#ffffff' : '#111827',
                        font: {
                          size: 14
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60">
                <div className={`h-16 w-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                  <PieChart className={`h-8 w-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                  Aún no hay datos suficientes para mostrar la distribución de ingresos.
                </p>
              </div>
            )
          )}
        </div>
        
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-4`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ingresos vs Gastos</h3>
            <button className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          {datosIngresoVsGasto.length > 0 && datosIngresoVsGasto.some(mes => mes.ingresos > 0 || mes.gastos > 0) ? (
            <div className="h-60">
              <Bar 
                data={{
                  labels: datosIngresoVsGasto.map(mes => mes.nombreMes),
                  datasets: [
                    {
                      label: 'Ingresos',
                      data: datosIngresoVsGasto.map(mes => mes.ingresos),
                      backgroundColor: '#10B981',
                      borderColor: '#10B981',
                      borderWidth: 1,
                    },
                    {
                      label: 'Gastos',
                      data: datosIngresoVsGasto.map(mes => mes.gastos),
                      backgroundColor: '#EF4444',
                      borderColor: '#EF4444',
                      borderWidth: 1,
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: darkMode ? '#ffffff' : '#111827',
                        usePointStyle: true,
                        boxWidth: 10
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context.raw;
                          return `${context.dataset.label}: $${value.toLocaleString('es-ES')}`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: darkMode ? '#9CA3AF' : '#4B5563'
                      },
                      grid: {
                        color: darkMode ? '#374151' : '#E5E7EB',
                        display: false
                      }
                    },
                    y: {
                      ticks: {
                        color: darkMode ? '#9CA3AF' : '#4B5563',
                        callback: function(value) {
                          if (value >= 1000) {
                            return '$' + value / 1000 + 'k';
                          }
                          return '$' + value;
                        }
                      },
                      grid: {
                        color: darkMode ? '#374151' : '#E5E7EB'
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60">
              <div className={`h-16 w-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                <BarChart4 className={`h-8 w-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                Registra tus ingresos y gastos para ver comparativas en esta sección.
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
                {isFormView ? (isEditMode ? "Editar cuenta" : "Agregar tarjeta") : "Agregar nueva cuenta"}
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
                      Nombre del banco
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
                      Saldo inicial
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
                      Tipo de cuenta
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

      {/* Modal de edición de saldo inicial de efectivo */}
      {isEfectivoModalOpen && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-auto ${darkMode ? 'backdrop-blur-sm bg-black/30' : 'backdrop-blur-sm bg-white/30'}`}
          onClick={(e) => {
            // Cerrar el modal al hacer clic fuera de su contenido
            if (e.target === e.currentTarget) {
              setIsEfectivoModalOpen(false);
              setEfectivoError('');
              setEfectivoSuccess('');
            }
          }}
        >
          <div 
            className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Efectivo - Configuración
              </h2>
              <button 
                onClick={() => {
                  setIsEfectivoModalOpen(false);
                  setEfectivoError('');
                  setEfectivoSuccess('');
                }} 
                className={`cursor-pointer ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSaveEfectivoSaldoInicial}>
              {efectivoError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                  {efectivoError}
                </div>
              )}
              
              {efectivoSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">
                  {efectivoSuccess}
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                <div className={`px-4 py-3 rounded-lg  ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'} text-sm mb-4`}>
                  Esta opción te permite establecer un saldo inicial para tu cuenta de efectivo.
                  Los cambios que realices aquí afectarán todas tus transacciones de efectivo.
                </div>
                
                <div>
                  <label htmlFor="saldoInicialEfectivo" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Saldo inicial
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                    </div>
                    <input
                      type="text"
                      id="saldoInicialEfectivo"
                      name="saldoInicialEfectivo"
                      value={saldoInicialEfectivo}
                      onChange={handleEfectivoInputChange}
                      placeholder="0.00"
                      className={`block w-full pl-8 px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Ingresa el monto que tienes actualmente en efectivo.
                  </p>
                </div>
                
                <div className={`px-4 py-3 rounded-lg bg-yellow-50 text-yellow-700 text-sm ${darkMode ? 'bg-yellow-900/30 text-yellow-200' : 'bg-yellow-50 text-yellow-700'} mb-4`}>
                  <p className="font-medium mb-1">Información importante</p>
                  <p>Este valor se registrará como una transacción de tipo "Ingreso" con la categoría "Saldo Inicial" en tu cuenta de efectivo.</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEfectivoModalOpen(false);
                    setEfectivoError('');
                    setEfectivoSuccess('');
                  }}
                  className={`cursor-pointer px-4 py-2 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} border rounded-lg`}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={updateEfectivoLoading}
                  className={`px-4 py-2 cursor-pointer bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center ${updateEfectivoLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {updateEfectivoLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : "Guardar" }
                </button> 
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageAccounts;