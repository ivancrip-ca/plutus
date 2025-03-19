"use client";

import { useState } from "react";
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

const PageAccounts = () => {
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  // Define the Account type based on the structure of your account objects
  type Account = {
    id: number;
    name: string;
    type: string;
    institution: string;
    balance: number;
    number: string;
    currency: string;
    color: string;
    limit?: number;
  };
  
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  
  // Mock data for accounts
  const accounts = [
    {
      id: 1,
      name: "Cuenta Principal",
      type: "checking",
      institution: "BBVA",
      balance: 5240.50,
      number: "**** 4519",
      currency: "USD",
      color: "bg-blue-500"
    },
    {
      id: 2,
      name: "Ahorro",
      type: "savings",
      institution: "Santander",
      balance: 12680.75,
      number: "**** 8732",
      currency: "USD",
      color: "bg-green-500"
    },
    {
      id: 3,
      name: "Tarjeta de Crédito",
      type: "credit",
      institution: "American Express",
      balance: -2450.25,
      number: "**** 3251",
      currency: "USD",
      limit: 10000,
      color: "bg-purple-500"
    }
  ];
  
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
  
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
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
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="h-8 w-8 text-blue-500" />
          Mis Cuentas
        </h1>
        <div className="flex space-x-2">
          <button className="bg-white text-gray-600 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-1">
            <Search className="h-4 w-4" />
            <span>Buscar</span>
          </button>
          <button 
            onClick={() => setIsAddAccountOpen(true)} 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar Cuenta</span>
          </button>
        </div>
      </div>
      
      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold opacity-90">Balance Total</h2>
          <button className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30">
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-end gap-2">
          <div className="text-4xl font-bold">${totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          <div className="text-sm opacity-75 mb-1">USD</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-10 p-3 rounded-xl">
            <div className="text-sm opacity-75">Ingresos</div>
            <div className="text-xl font-semibold flex items-center gap-1">
              <ArrowDownRight className="h-4 w-4 text-green-300" />
              $3,250.00
            </div>
          </div>
          <div className="bg-white bg-opacity-10 p-3 rounded-xl">
            <div className="text-sm opacity-75">Gastos</div>
            <div className="text-xl font-semibold flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4 text-red-300" />
              $1,842.30
            </div>
          </div>
        </div>
      </div>
      
      {/* Accounts Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Cuentas</h2>
          <button className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center">
            Ver todas <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div 
              key={account.id} 
              onClick={() => setSelectedAccount(account)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`${account.color} p-3 rounded-lg mr-3`}>
                    {getAccountIcon(account.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-500">{account.institution} · {account.number}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-2">
                <div className={`text-xl font-bold ${account.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  ${Math.abs(account.balance).toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {account.type === 'credit' ? `Límite: $${account.limit?.toLocaleString('en-US') || '0.00'}` : 'Disponible'}
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Account Card */}
          <div 
            onClick={() => setIsAddAccountOpen(true)}
            className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-4 cursor-pointer hover:bg-gray-100 transition-colors flex flex-col items-center justify-center min-h-[160px]"
          >
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Plus className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-medium text-gray-900">Agregar Cuenta</h3>
            <p className="text-sm text-gray-500 text-center mt-1">Conectar banco o tarjeta</p>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Transacciones Recientes</h2>
          <button className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center">
            Ver todas <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-500">
                      {accounts.find(a => a.id === transaction.accountId)?.name}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">{transaction.category}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{transaction.date}</td>
                  <td className={`py-4 px-6 text-sm font-medium text-right ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800">Distribución de Gastos</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center justify-center h-40 mb-4 bg-gray-50 rounded-lg">
            <PieChart className="h-20 w-20 text-gray-300" />
            {/* This would be replaced with an actual chart component */}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Comida</span>
              </div>
              <span className="text-sm font-medium">32%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Transporte</span>
              </div>
              <span className="text-sm font-medium">24%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Entretenimiento</span>
              </div>
              <span className="text-sm font-medium">18%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800">Ingresos vs Gastos</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center justify-center h-40 mb-4 bg-gray-50 rounded-lg">
            <BarChart4 className="h-20 w-20 text-gray-300" />
            {/* This would be replaced with an actual chart component */}
          </div>
          <div className="flex justify-between">
            <div>
              <div className="text-xs text-gray-500">Ingresos</div>
              <div className="text-lg font-bold text-gray-900">$3,250.00</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Gastos</div>
              <div className="text-lg font-bold text-gray-900">$1,842.30</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Balance</div>
              <div className="text-lg font-bold text-green-600">+$1,407.70</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Account Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-auto backdrop-blur-sm bg-white/30">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Agregar Nueva Cuenta</h2>
              <button 
                onClick={() => setIsAddAccountOpen(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">Conecta tu cuenta bancaria o agrega una manualmente.</p>
            
            <div className="space-y-3 mb-4">
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FaRegCreditCard className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Conectar con banco</h3>
                  <p className="text-sm text-gray-500">Conecta de forma segura con tu banco</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
              </div>
              
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <CreditCard className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Agregar tarjeta</h3>
                  <p className="text-sm text-gray-500">Agrega una tarjeta de débito o crédito</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
              </div>
              
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Plus className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Cuenta manual</h3>
                  <p className="text-sm text-gray-500">Crea una cuenta manualmente</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsAddAccountOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PageAccounts;