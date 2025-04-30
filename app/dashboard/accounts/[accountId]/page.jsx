"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  RefreshCcw, 
  MoreVertical,
  Download,
  Printer,
  Filter
} from "lucide-react";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import Link from "next/link";
import { useRouter, useParams } from 'next/navigation';
import { FaMoneyBillWave, FaRegCreditCard, FaCreditCard, FaUniversity } from 'react-icons/fa';
import { BsBank2 } from 'react-icons/bs';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const AccountTransactionsPage = () => {
  const { darkMode } = useTheme();
  const { currentUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [balance, setBalance] = useState(0);
  const transactionsPerPage = 10;
  const router = useRouter();
  const params = useParams();
  const { accountId } = params;
  
  // Verificar que el componente está montado
  useEffect(() => {
    setMounted(true);
    if (currentUser && accountId) {
      fetchAccountDetails();
      fetchAccountTransactions();
    }
  }, [currentUser, accountId]);
  
  // Función para obtener los detalles de la cuenta
  const fetchAccountDetails = async () => {
    try {
      if (!currentUser || !accountId) return;
      
      // Si el ID es "efectivo", creamos un objeto de cuenta especial
      if (accountId === "efectivo") {
        setAccount({
          id: "efectivo",
          name: "Efectivo",
          institution: "Cuenta predeterminada",
          type: "efectivo",
          color: "bg-green-500"
        });
        return;
      }
      
      // Obtener la cuenta de Firestore
      const accountDoc = await getDoc(doc(db, 'accounts', accountId));
      
      if (accountDoc.exists()) {
        setAccount({
          id: accountDoc.id,
          ...accountDoc.data()
        });
      } else {
        setError('No se encontró la cuenta solicitada');
        setTimeout(() => router.push('/dashboard/accounts'), 3000);
      }
    } catch (error) {
      console.error('Error al obtener detalles de la cuenta:', error);
      setError('Error al cargar los detalles de la cuenta');
    }
  };
  
  // Función para obtener las transacciones de la cuenta
  const fetchAccountTransactions = async () => {
    try {
      setLoading(true);
      if (!currentUser || !accountId) return;
      
      // Construir la consulta para obtener transacciones
      let transactionsQuery;
      
      if (accountId === "efectivo") {
        // Consulta para cuenta de efectivo
        transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', currentUser.uid),
          where('cuenta', '==', 'Efectivo')
        );
      } else {
        // Consulta para otras cuentas usando el ID de cuenta
        transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', currentUser.uid),
          where('cuentaId', '==', accountId)
        );
      }
      
      const querySnapshot = await getDocs(transactionsQuery);
      const transactionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar transacciones por fecha (más reciente primero)
      const sortedTransactions = transactionsData.sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      );
      
      setTransactions(sortedTransactions);
      setFilteredTransactions(sortedTransactions);
      
      // Calcular totales
      const ingresos = sortedTransactions
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
      
      const gastos = sortedTransactions
        .filter(t => t.tipo === 'gasto')
        .reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
      
      setTotalIngresos(ingresos);
      setTotalGastos(gastos);
      setBalance(ingresos - gastos);
      
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      setError('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para filtrar transacciones
  useEffect(() => {
    if (!transactions) return;
    
    const filtered = transactions.filter(transaction => {
      // Filtrar por tipo
      if (filter === 'ingresos' && transaction.tipo !== 'ingreso') return false;
      if (filter === 'gastos' && transaction.tipo !== 'gasto') return false;
      
      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          (transaction.descripcion && transaction.descripcion.toLowerCase().includes(term)) ||
          (transaction.categoria && transaction.categoria.toLowerCase().includes(term)) ||
          (transaction.cuenta && transaction.cuenta.toLowerCase().includes(term))
        );
      }
      
      return true;
    });
    
    setFilteredTransactions(filtered);
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  }, [filter, searchTerm, transactions]);
  
  // Función para obtener el ícono adecuado según el tipo de cuenta
  const getAccountIcon = (type) => {
    switch(type) {
      case "checking":
        return <FaUniversity className="text-white text-lg" />;
      case "savings":
        return <FaMoneyBillWave className="text-white text-lg" />;
      case "credit":
        return <FaCreditCard className="text-white text-lg" />;
      case "debit":
        return <FaRegCreditCard className="text-white text-lg" />;
      case "efectivo":
        return <FaMoneyBillWave className="text-white text-lg" />;
      default:
        return <BsBank2 className="text-white text-lg" />;
    }
  };
  
  // Paginación
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  
  // Estado de carga inicial
  if (!mounted) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-40 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
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
            {account && (
              <div className={`${account.color} p-2 rounded-lg`}>
                {getAccountIcon(account.type)}
              </div>
            )}
            {account ? account.name : 'Detalles de Cuenta'}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Link 
            href="/dashboard/transactions" 
            className={`${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'} px-4 py-2 rounded-lg border flex items-center`}
          >
            <span>Todas las transacciones</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
      
    {/* Mensaje de error */}
    {error && (
        <div className={`mb-4 p-3 ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'} text-sm rounded-lg`}>
            {error}
        </div>
    )}

    {/* Detalles de cuenta */}
    {account && (
        <div className={`bg-gradient-to-r from-cyan-500 to-cyan-700 rounded-2xl p-6 mb-8 text-white shadow-lg ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-500 to-blue-700' }`}>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-semibold opacity-90">{account.name}</h2>
                    <p className="text-sm opacity-75">{account.institution || 'Cuenta personal'} {account.number ? `· ${account.number}` : ''}</p>
                </div>
                <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    {getAccountIcon(account.type)}
                </div>
            </div>
            <div className="flex flex-col mt-4">
                <div className="text-4xl font-bold">${account.balance ? Math.abs(account.balance).toLocaleString('en-US', {minimumFractionDigits: 2}) : balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                <div className="text-sm opacity-75 mt-1">Balance actual</div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 ">
                <div className={`bg-white bg-opacity-10 p-3 rounded-xl ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-white bg-opacity-20 text-gray-700'}`}>
                    <div className="text-sm opacity-75">Ingresos</div>
                    <div className="text-xl font-semibold">${totalIngresos.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                </div>
                <div className={`bg-white bg-opacity-10 p-3 rounded-xl ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-white bg-opacity-20 text-gray-700'}`}>
                    <div className="text-sm opacity-75">Gastos</div>
                    <div className="text-xl font-semibold">${totalGastos.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                </div>
            </div>
        </div>
    )}

    {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 items-center justify-between mb-6">
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : darkMode
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFilter('ingresos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === 'ingresos' 
                ? 'bg-green-600 text-white' 
                : darkMode
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Ingresos
          </button>
          <button 
            onClick={() => setFilter('gastos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === 'gastos' 
                ? 'bg-red-600 text-white' 
                : darkMode
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Gastos
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Buscar transacciones..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-gray-800 text-white border-0' : 'border border-gray-300'
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Lista de transacciones */}
      <div className={` rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} overflow-visible mb-6`}>
        <div className="p-6">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Historial de transacciones</h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((index) => (
                <div key={index} className="animate-pulse">
                  <div className={`flex flex-wrap md:flex-nowrap items-center p-4 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-lg`}>
                    <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 mb-2 md:mb-0 md:mr-4"></div>
                    <div className="w-full md:w-auto md:flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                    <div className="w-full md:w-auto mt-2 md:mt-0 md:mr-8">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                    </div>
                    <div className="w-full md:w-auto mt-2 md:mt-0">
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-3">
              {currentTransactions.map((transaction) => (
                <div key={transaction.id} className={`flex flex-wrap md:flex-nowrap items-center p-4 ${
                  darkMode 
                    ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' 
                    : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                } transition rounded-lg border`}>
                  <div className={`inline-flex items-center justify-center h-12 w-12 rounded-full mb-2 md:mb-0 md:mr-4 flex-shrink-0 ${
                    transaction.tipo === 'ingreso' 
                      ? darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600' 
                      : darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.tipo === 'ingreso' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                    )}
                  </div>
                  <div className="w-full md:w-auto md:flex-1">
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{transaction.descripcion}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{transaction.categoria || 'Sin categoría'}</p>
                      <span className={`hidden sm:inline mx-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                        {transaction.cuenta}
                      </p>
                    </div>
                  </div>
                  <div className="w-full md:w-auto mt-2 md:mt-0 md:mr-8">
                    <p className={`font-medium ${
                      transaction.tipo === 'ingreso' 
                        ? darkMode ? 'text-green-400' : 'text-green-600' 
                        : darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>${transaction.monto.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                  </div>
                  <div className="w-full md:w-auto mt-2 md:mt-0">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {format(parseISO(transaction.fecha), 'dd MMM, yyyy', { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <RefreshCcw className={`h-12 w-12 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm || filter !== 'all' ? 'No hay transacciones que coincidan con tus filtros' : 'No hay transacciones para esta cuenta'}
              </h3>
              {searchTerm || filter !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                  className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  Limpiar filtros
                </button>
              ) : (
                <Link href="/dashboard/transactions" className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium">
                  Registrar nueva transacción
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Paginación */}
      {filteredTransactions.length > transactionsPerPage && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md border ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-300 disabled:text-gray-600' 
                : 'bg-white border-gray-300 text-gray-700 disabled:text-gray-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Anterior
          </button>
          
          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Página {currentPage} de {totalPages}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md border ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-300 disabled:text-gray-600' 
                : 'bg-white border-gray-300 text-gray-700 disabled:text-gray-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountTransactionsPage;