import React, { useState, useEffect } from 'react';
import { MdTrendingUp, MdTrendingDown, MdAccountBalance } from 'react-icons/md';
import { useTheme } from '../../app/contexts/ThemeContext';

const AccountSummary = ({ balance, income, expenses, savings, currencySymbol, accounts }) => {
  const { darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

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
        {/* Saldo total - Mantiene su color cyan */}
        <div className="bg-cyan-600 p-6 rounded-xl text-white shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium uppercase opacity-80">Saldo Total</h3>
            <MdAccountBalance className="h-6 w-6 opacity-80" />
          </div>
          <p className="text-2xl font-bold">{currencySymbol}{balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs mt-1 opacity-80">En todas tus cuentas</p>
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
            {currencySymbol}{income.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Este mes</p>
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
            {currencySymbol}{expenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Este mes</p>
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
          {accounts.map((account) => (
            <div 
              key={account.id} 
              className={`flex items-center justify-between p-4 rounded-lg
                ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 ${account.color} rounded-full flex items-center justify-center text-white mr-3`}>
                  <MdAccountBalance className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {account.name}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {account.type === 'checking' ? 'Cuenta Corriente' : account.type === 'savings' ? 'Ahorros' : 'Inversión'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currencySymbol}{account.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
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
          Ver todas las cuentas
        </button>
      </div>
    </div>
  );
};

export default AccountSummary;
