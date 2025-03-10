import React from 'react';
import { MdTrendingUp, MdTrendingDown, MdAccountBalance } from 'react-icons/md';

const AccountSummary = ({ balance, income, expenses, savings, currencySymbol, accounts }) => {
  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Saldo total - Usando color sólido de azul */}
        <div className="bg-cyan-600 p-6 rounded-xl text-white shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium uppercase opacity-80">Saldo Total</h3>
            <MdAccountBalance className="h-6 w-6 opacity-80" />
          </div>
          <p className="text-2xl font-bold">{currencySymbol}{balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs mt-1 opacity-80">En todas tus cuentas</p>
        </div>
        
        {/* Ingresos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Ingresos</h3>
            <div className="p-2 bg-green-50 rounded-full">
              <MdTrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{currencySymbol}{income.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs mt-1 text-gray-500">Este mes</p>
        </div>
        
        {/* Gastos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Gastos</h3>
            <div className="p-2 bg-red-50 rounded-full">
              <MdTrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{currencySymbol}{expenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs mt-1 text-gray-500">Este mes</p>
        </div>
        
        {/* Ahorros */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Ahorros</h3>
            <div className="p-2 bg-blue-50 rounded-full">
              <MdAccountBalance className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{currencySymbol}{savings.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs mt-1 text-gray-500">Acumulados</p>
        </div>
      </div>
      
      {/* Lista de cuentas */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-base font-medium text-gray-900 mb-4">Tus Cuentas</h3>
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-10 h-10 ${account.color} rounded-full flex items-center justify-center text-white mr-3`}>
                  <MdAccountBalance className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{account.name}</p>
                  <p className="text-xs text-gray-500">{account.type === 'checking' ? 'Cuenta Corriente' : account.type === 'savings' ? 'Ahorros' : 'Inversión'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{currencySymbol}{account.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-5 w-full py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-cyan-600 bg-cyan-50 hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-150">
          Ver todas las cuentas
        </button>
      </div>
    </div>
  );
};

export default AccountSummary;
