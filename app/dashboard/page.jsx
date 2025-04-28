'use client'
import { useState, useEffect } from 'react';
import AccountSummary from '../../components/dashboard/AccountSummary';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import SpendingChart from '../../components/dashboard/SpendingChart';
import BudgetOverview from '../../components/dashboard/BudgetOverview';
import FinancialGoals from '../../components/dashboard/FinancialGoals';
import { useTheme } from '../../app/contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const DashboardPage = () => {
  const { darkMode } = useTheme();
  const { currentUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Estados para datos reales desde Firestore
  const [accountData, setAccountData] = useState({
    totalBalance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
    currencySymbol: '$',
    accounts: []
  });
  
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  
  // Datos procesados para los gráficos
  const [chartData, setChartData] = useState({
    expenses: [],
    income: []
  });

  useEffect(() => {
    setMounted(true);
    
    if (currentUser) {
      // Cargar datos del usuario desde Firestore
      fetchAccounts();
      fetchTransactions();
      fetchBudgets();
      fetchGoals();
    }
  }, [currentUser]);

  // Función para obtener cuentas del usuario
  const fetchAccounts = async () => {
    try {
      const accountsQuery = query(
        collection(db, 'accounts'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(accountsQuery);
      const accountsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calcular el balance total
      const totalBalance = accountsData.reduce((sum, account) => sum + (Number(account.balance) || 0), 0);
      
      setAccountData({
        ...accountData,
        totalBalance,
        accounts: accountsData
      });
      
    } catch (error) {
      console.error('Error al obtener cuentas:', error);
    }
  };

  // Función para obtener transacciones y procesar datos para las gráficas
  const fetchTransactions = async () => {
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(transactionsQuery);
      const transactionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().fecha ? new Date(doc.data().fecha) : new Date()
      }));
      
      // Guardar transacciones
      setTransactions(transactionsData);
      
      // Calcular totales
      const income = transactionsData
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
      
      const expenses = transactionsData
        .filter(t => t.tipo === 'gasto')
        .reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
      
      setAccountData(prevData => ({
        ...prevData,
        income,
        expenses,
        savings: prevData.totalBalance - expenses
      }));
      
      // Procesar datos para gráficas
      processChartData(transactionsData);
      
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
    }
  };
  
  // Función para obtener presupuestos
  const fetchBudgets = async () => {
    try {
      const budgetsQuery = query(
        collection(db, 'budgets'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(budgetsQuery);
      const budgetsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBudgets(budgetsData);
      
    } catch (error) {
      console.error('Error al obtener presupuestos:', error);
    }
  };
  
  // Función para obtener objetivos financieros
  const fetchGoals = async () => {
    try {
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(goalsQuery);
      const goalsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline ? new Date(doc.data().deadline) : new Date()
      }));
      
      setGoals(goalsData);
      
    } catch (error) {
      console.error('Error al obtener objetivos:', error);
    }
  };
  
  // Función para procesar datos para las gráficas
  const processChartData = (transactions) => {
    // Colores para categorías
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', 
      '#6b7280', '#0ea5e9', '#4f46e5', '#ec4899', '#14b8a6'
    ];
    
    // Procesar gastos por categoría
    const gastosPorCategoria = {};
    transactions
      .filter(t => t.tipo === 'gasto')
      .forEach(transaction => {
        const categoria = transaction.categoria || 'Sin categoría';
        const monto = Number(transaction.monto) || 0;
        
        if (gastosPorCategoria[categoria]) {
          gastosPorCategoria[categoria] += monto;
        } else {
          gastosPorCategoria[categoria] = monto;
        }
      });
    
    // Procesar ingresos por categoría
    const ingresosPorCategoria = {};
    transactions
      .filter(t => t.tipo === 'ingreso')
      .forEach(transaction => {
        const categoria = transaction.categoria || 'Sin categoría';
        const monto = Number(transaction.monto) || 0;
        
        if (ingresosPorCategoria[categoria]) {
          ingresosPorCategoria[categoria] += monto;
        } else {
          ingresosPorCategoria[categoria] = monto;
        }
      });
    
    // Convertir a formato para gráfica con precisión de 2 decimales
    const expensesData = Object.keys(gastosPorCategoria).map((categoria, index) => ({
      category: categoria,
      amount: Number(gastosPorCategoria[categoria].toFixed(2)),
      color: colors[index % colors.length]
    }));
    
    const incomeData = Object.keys(ingresosPorCategoria).map((categoria, index) => ({
      category: categoria,
      amount: Number(ingresosPorCategoria[categoria].toFixed(2)),
      color: colors[(index + 5) % colors.length] // Offset para usar diferentes colores
    }));
    
    setChartData({
      expenses: expensesData,
      income: incomeData
    });
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'text-gray-900'}`}>
      <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Dashboard</h1>
      
      {/* Resumen financiero */}
      <div className="mb-6">
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-3`}>Resumen Financiero</h2>
        <AccountSummary 
          balance={accountData.totalBalance}
          income={accountData.income}
          expenses={accountData.expenses}
          savings={accountData.savings}
          currencySymbol={accountData.currencySymbol}
          accounts={accountData.accounts}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Gráficos de distribución */}
        <div className="col-span-1 lg:col-span-1">
          <div className={`p-6 rounded-xl shadow-sm border mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Distribución de Gastos</h2>
            {chartData.expenses.length > 0 ? (
              <SpendingChart data={chartData.expenses} />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay datos de gastos disponibles. Registra tus gastos para ver la distribución por categorías.
                </p>
              </div>
            )}
          </div>
          
          <div className={`p-6 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Distribución de Ingresos</h2>
            {chartData.income.length > 0 ? (
              <SpendingChart data={chartData.income} />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay datos de ingresos disponibles. Registra tus ingresos para ver la distribución por categorías.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Budget overview */}
        <div className="col-span-1 lg:col-span-2">
          <div className={`p-6 rounded-xl shadow-sm border h-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Presupuestos</h2>
            {budgets.length > 0 ? (
              <BudgetOverview budgets={budgets} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No has creado presupuestos. Crea presupuestos para categorías específicas y realiza un seguimiento de tus gastos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Objetivos financieros */}
        <div className={`p-6 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Objetivos Financieros</h2>
          {goals.length > 0 ? (
            <FinancialGoals goals={goals} />
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No has establecido objetivos financieros. Crea metas para ahorros específicos y realiza un seguimiento de tu progreso.
              </p>
            </div>
          )}
        </div>
        
        {/* Transacciones recientes */}
        <div className={`p-6 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Transacciones Recientes</h2>
          {transactions.length > 0 ? (
            <RecentTransactions 
              transactions={transactions.sort((a, b) => b.date - a.date).slice(0, 5)} 
              currencySymbol={accountData.currencySymbol} 
            />
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No hay transacciones recientes. Registra ingresos y gastos para ver tu historial de transacciones.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;