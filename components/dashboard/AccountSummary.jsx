import React, { useState, useEffect } from 'react';
import { MdTrendingUp, MdTrendingDown, MdAccountBalance } from 'react-icons/md';
import { useTheme } from '../../app/contexts/ThemeContext';
import { useAuth } from '../../app/contexts/AuthContext';
import { db } from '../../app/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

const AccountSummary = ({ balance: propBalance, income: propIncome, expenses: propExpenses, savings, currencySymbol }) => {
  const { darkMode } = useTheme();
  const { currentUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [totalIngresos, setTotalIngresos] = useState(propIncome || 0);
  const [totalGastos, setTotalGastos] = useState(propExpenses || 0);
  const [balance, setBalance] = useState(propBalance || 0);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Cargar los datos de las transacciones y cuentas
    if (currentUser) {
      fetchTransactionSummary();
      fetchUserAccounts();
    }
  }, [currentUser]);

  // Función para obtener las transacciones y calcular los totales
  const fetchTransactionSummary = async () => {
    try {
      setLoadingTransactions(true);
      
      // Consultar todas las transacciones del usuario
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(transactionsQuery);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calcular los totales
      const ingresos = transactions
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + t.monto, 0);
      
      const gastos = transactions
        .filter(t => t.tipo === 'gasto')
        .reduce((sum, t) => sum + t.monto, 0);
      
      const calculatedBalance = ingresos - gastos;
      
      // Actualizar los estados
      setTotalIngresos(ingresos);
      setTotalGastos(gastos);
      setBalance(calculatedBalance);
    } catch (error) {
      console.error('Error al obtener el resumen de transacciones:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };
  
  // Función para obtener las cuentas del usuario
  const fetchUserAccounts = async () => {
    try {
      setLoadingAccounts(true);
      
      // Consultar todas las cuentas del usuario
      const accountsQuery = query(
        collection(db, 'accounts'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(accountsQuery);
      const userAccounts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAccounts(userAccounts);
    } catch (error) {
      console.error('Error al obtener las cuentas del usuario:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Saldo total - Con información de ingresos y gastos */}
        <div className="bg-cyan-600 p-6 rounded-xl text-white shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium uppercase opacity-80">Saldo Total</h3>
            <MdAccountBalance className="h-6 w-6 opacity-80" />
          </div>
          <p className="text-2xl font-bold">{currencySymbol}{balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
          <div className="flex justify-between mt-3 text-xs">
            <div>
              <p className="opacity-80">Ingresos</p>
              <p className="font-medium text-green-300">{currencySymbol}{totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="opacity-80">Gastos</p>
              <p className="font-medium text-red-300">{currencySymbol}{totalGastos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
        
        {/* Ingresos */}
        <div className={`p-6 rounded-xl shadow-sm border
          ${darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-sm font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Ingresos</h3>
            <div className={`p-2 rounded-full ${darkMode ? 'bg-green-900/50' : 'bg-green-50'}`}>
              <MdTrendingUp className={`h-5 w-5 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currencySymbol}{totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
        </div>
        
        {/* Gastos */}
        <div className={`p-6 rounded-xl shadow-sm border
          ${darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-sm font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Gastos</h3>
            <div className={`p-2 rounded-full ${darkMode ? 'bg-red-900/50' : 'bg-red-50'}`}>
              <MdTrendingDown className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currencySymbol}{totalGastos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
        </div>
        
        {/* Ahorros */}
        <div className={`p-6 rounded-xl shadow-sm border
          ${darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-sm font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Ahorros</h3>
            <div className={`p-2 rounded-full ${darkMode ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
              <MdAccountBalance className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currencySymbol}{savings.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Acumulados</p>
        </div>
      </div>
      
      {/* Lista de cuentas */}
      <div className={`p-6 rounded-xl shadow-sm border
        ${darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'}`}>
        <h3 className={`text-base font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tus Cuentas</h3>
        <div className="space-y-4">
          {loadingAccounts ? (
            // Loader para las cuentas
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse flex items-center justify-between p-4 rounded-lg bg-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-600 rounded-full mr-3"></div>
                  <div>
                    <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 w-16 bg-gray-600 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-16 bg-gray-600 rounded"></div>
              </div>
            ))
          ) : accounts.length > 0 ? (
            accounts.map((account) => (
              <div 
                key={account.id} 
                className={`flex items-center justify-between p-4 rounded-lg
                  ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${account.color || 'bg-blue-500'} rounded-full flex items-center justify-center text-white mr-3`}>
                    <MdAccountBalance className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {account.name}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {account.institution || 'Cuenta'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currencySymbol}{account.balance?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className={`w-12 h-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mb-2`}>
                <MdAccountBalance className={`w-6 h-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No tienes cuentas registradas</p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>Añade una cuenta para hacer un seguimiento de tus finanzas</p>
            </div>
          )}
        </div>
        <Link href="/dashboard/accounts"
          className={`mt-5 w-full py-2.5 px-4 border border-transparent text-sm font-medium rounded-md block text-center
            ${darkMode 
              ? 'text-cyan-400 bg-cyan-900/30 hover:bg-cyan-900/50' 
              : 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100'} 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-150
            ${darkMode ? 'focus:ring-offset-gray-900' : ''}`}
        >
          Ver todas las cuentas
        </Link>
      </div>
    </div>
  );
};

export default AccountSummary;
