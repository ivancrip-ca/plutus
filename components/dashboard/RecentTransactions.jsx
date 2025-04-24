import React, { useState, useEffect } from 'react';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { useTheme } from '../../app/contexts/ThemeContext';
import { useAuth } from '../../app/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../app/firebase';
import Link from 'next/link';

const RecentTransactions = () => {
  const { darkMode } = useTheme();
  const { currentUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (currentUser) {
      fetchRecentTransactions();
    }
  }, [currentUser]);

  // Función para obtener las transacciones recientes
  const fetchRecentTransactions = async () => {
    try {
      if (!currentUser) return;
      
      setLoading(true);
      
      // Consulta simplificada que solo usa el filtro por userId (no requiere índice)
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(transactionsQuery);
      let recentTransactionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar localmente por fecha (más recientes primero)
      recentTransactionsData.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      
      // Limitar a las 5 transacciones más recientes
      recentTransactionsData = recentTransactionsData.slice(0, 5);
      
      setTransactions(recentTransactionsData);
    } catch (error) {
      console.error('Error al obtener transacciones recientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch (error) {
      return dateString;
    }
  };

  // Función para obtener el ícono según el tipo de transacción
  const getTransactionIcon = (tipo) => {
    return tipo === 'ingreso' ? (
      <div className={`p-2 ${darkMode ? 'bg-green-900' : 'bg-green-50'} rounded-full`}>
        <MdTrendingUp className={`h-5 w-5 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
      </div>
    ) : (
      <div className={`p-2 ${darkMode ? 'bg-red-900' : 'bg-red-50'} rounded-full`}>
        <MdTrendingDown className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
      </div>
    );
  };

  // Función para obtener el color del texto según el tipo de transacción
  const getAmountColor = (tipo) => {
    if (tipo === 'ingreso') {
      return darkMode ? 'text-green-400' : 'text-green-600';
    } else {
      return darkMode ? 'text-red-400' : 'text-red-600';
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {loading ? (
        <div className="animate-pulse">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`flex items-center justify-between p-4 
                ${darkMode
                  ? 'bg-gray-800 border-gray-700 border hover:bg-gray-700'
                  : 'bg-gray-50 hover:bg-gray-100'} 
                rounded-lg transition-colors cursor-pointer`}
            >
              <div className="flex items-center">
                {getTransactionIcon(transaction.tipo)}
                <div className="ml-3">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {transaction.descripcion}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {transaction.categoria || 'Sin categoría'} • {formatDate(transaction.fecha)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <p className={`text-sm font-bold ${getAmountColor(transaction.tipo)}`}>
                  {transaction.tipo === 'ingreso' ? '+' : '-'}${Math.abs(transaction.monto).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>No hay transacciones recientes</p>
        </div>
      )}

      <Link href="/dashboard/transactions">
        <button
          className={`mt-5 w-full py-2.5 px-4 border border-transparent text-sm font-medium rounded-md
             ${darkMode
              ? 'text-cyan-400 bg-cyan-900/30 hover:bg-cyan-900/50'
              : 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100'} 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-150
            ${darkMode ? 'focus:ring-offset-gray-900' : ''}`}
        >
          Ver todas las transacciones
        </button>
      </Link>
    </div>
  );
};

export default RecentTransactions;
