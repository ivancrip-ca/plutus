import React, { useState, useEffect } from 'react';
import { MdTrendingUp, MdTrendingDown, MdMoreVert } from 'react-icons/md';
import { useTheme } from '../../app/contexts/ThemeContext';

const RecentTransactions = ({ transactions, currencySymbol }) => {
  const { darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para formatear fechas
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Función para obtener el ícono según el tipo de transacción
  const getTransactionIcon = (amount) => {
    return amount >= 0 ? (
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
  const getAmountColor = (amount) => {
    if (amount >= 0) {
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
              {getTransactionIcon(transaction.amount)}
              <div className="ml-3">
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {transaction.description}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {transaction.category} • {formatDate(transaction.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <p className={`text-sm font-bold ${getAmountColor(transaction.amount)}`}>
                {transaction.amount >= 0 ? '+' : ''}{currencySymbol}{Math.abs(transaction.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
              <button className={`ml-2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}>
                <MdMoreVert className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

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
    </div>
  );
};

export default RecentTransactions;
