import React from 'react';
import { MdTrendingUp, MdTrendingDown, MdMoreVert } from 'react-icons/md';

const RecentTransactions = ({ transactions, currencySymbol }) => {
  // Función para formatear fechas
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };
  
  // Función para obtener el ícono según el tipo de transacción
  const getTransactionIcon = (amount) => {
    return amount >= 0 ? (
      <div className="p-2 bg-green-50 rounded-full">
        <MdTrendingUp className="h-5 w-5 text-green-500" />
      </div>
    ) : (
      <div className="p-2 bg-red-50 rounded-full">
        <MdTrendingDown className="h-5 w-5 text-red-500" />
      </div>
    );
  };
  
  // Función para obtener el color del texto según el tipo de transacción
  const getAmountColor = (amount) => {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <div className="flex items-center">
              {getTransactionIcon(transaction.amount)}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                <p className="text-xs text-gray-500">{transaction.category} • {formatDate(transaction.date)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <p className={`text-sm font-bold ${getAmountColor(transaction.amount)}`}>
                {transaction.amount >= 0 ? '+' : ''}{currencySymbol}{Math.abs(transaction.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
              <button className="ml-2 text-gray-400 hover:text-gray-700">
                <MdMoreVert className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button className="mt-5 w-full py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-cyan-600 bg-cyan-50 hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-150">
        Ver todas las transacciones
      </button>
    </div>
  );
};

export default RecentTransactions;
