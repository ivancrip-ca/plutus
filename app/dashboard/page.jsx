'use client'
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  MdDashboard, MdAccountBalance, MdAttachMoney, MdTrendingUp, 
  MdPieChart, MdSettings, MdLogout, MdMenu, MdClose,
  MdAdd, MdMoreVert, MdNotifications
} from 'react-icons/md';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AccountSummary from '../../components/dashboard/AccountSummary';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import SpendingChart from '../../components/dashboard/SpendingChart';
import BudgetOverview from '../../components/dashboard/BudgetOverview';
import FinancialGoals from '../../components/dashboard/FinancialGoals';

const DashboardPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, userData } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  
  // Detectar sección activa basada en la ruta
  useEffect(() => {
    if (pathname.includes('/gestion_usuarios')) {
      setActiveSection('user_management');
    } else if (pathname.includes('/perfil')) {
      setActiveSection('user_settings');
    } else if (pathname.includes('/seguridad')) {
      setActiveSection('security');
    } else if (pathname.includes('/ayuda')) {
      setActiveSection('help');
    } else {
      setActiveSection('overview');
    }
  }, [pathname]);
  
  // Datos simulados para mostrar en el dashboard
  const [accountData, setAccountData] = useState({
    totalBalance: 25750.85,
    income: 4500.00,
    expenses: 2345.67,
    savings: 12405.18,
    currencySymbol: '$',
    accounts: [
      { id: 1, name: 'Cuenta Principal', balance: 15250.50, type: 'checking', color: 'bg-cyan-600' },
      { id: 2, name: 'Ahorros', balance: 8500.35, type: 'savings', color: 'bg-cyan-500' },
      { id: 3, name: 'Inversiones', balance: 2000.00, type: 'investment', color: 'bg-cyan-700' }
    ]
  });

  const [transactions, setTransactions] = useState([
    {
      id: 't1',
      description: 'Supermercado Local',
      amount: -125.50,
      date: new Date(2023, 10, 25),
      category: 'Alimentación',
      account: 'Cuenta Principal'
    },
    {
      id: 't2',
      description: 'Depósito Salario',
      amount: 2500.00,
      date: new Date(2023, 10, 24),
      category: 'Ingresos',
      account: 'Cuenta Principal'
    },
    {
      id: 't3',
      description: 'Netflix',
      amount: -15.99,
      date: new Date(2023, 10, 23),
      category: 'Entretenimiento',
      account: 'Cuenta Principal'
    },
    {
      id: 't4',
      description: 'Transferencia a Ahorros',
      amount: -500.00,
      date: new Date(2023, 10, 22),
      category: 'Transferencia',
      account: 'Cuenta Principal'
    },
    {
      id: 't5',
      description: 'Restaurante La Plaza',
      amount: -45.80,
      date: new Date(2023, 10, 21),
      category: 'Restaurantes',
      account: 'Cuenta Principal'
    }
  ]);

  const [budgets, setBudgets] = useState([
    { category: 'Alimentación', spent: 450, limit: 600, color: 'bg-blue-500' },
    { category: 'Transporte', spent: 120, limit: 200, color: 'bg-green-500' },
    { category: 'Entretenimiento', spent: 180, limit: 150, color: 'bg-red-500' },
    { category: 'Salud', spent: 75, limit: 300, color: 'bg-purple-500' },
    { category: 'Servicios', spent: 320, limit: 350, color: 'bg-yellow-500' }
  ]);

  const [goals, setGoals] = useState([
    { id: 'g1', name: 'Vacaciones', current: 3500, target: 5000, deadline: new Date(2024, 5, 15), color: 'bg-cyan-600' },
    { id: 'g2', name: 'Nuevo Auto', current: 8000, target: 25000, deadline: new Date(2025, 2, 1), color: 'bg-cyan-700' },
    { id: 'g3', name: 'Fondo de Emergencia', current: 7500, target: 10000, deadline: new Date(2023, 11, 31), color: 'bg-cyan-500' }
  ]);

  const [chartData, setChartData] = useState({
    expenses: [
      { category: 'Alimentación', amount: 450, color: '#3b82f6' },
      { category: 'Vivienda', amount: 1200, color: '#10b981' },
      { category: 'Transporte', amount: 120, color: '#f59e0b' },
      { category: 'Entretenimiento', amount: 180, color: '#8b5cf6' },
      { category: 'Salud', amount: 75, color: '#ef4444' },
      { category: 'Otros', amount: 320, color: '#6b7280' }
    ]
  });

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        handleLogout={handleLogout}
        user={currentUser}
        userData={userData}
      />

      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <DashboardHeader 
          toggleSidebar={toggleSidebar}
          user={currentUser}
          userData={userData}
        />

        {/* Main content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Contenido principal del dashboard */}
              <div className="py-4">
                {activeSection === 'overview' && (
                  <>
                    {/* Resumen financiero */}
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-3">Resumen Financiero</h2>
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
                      {/* Gráfico de gastos */}
                      <div className="col-span-1 lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                          <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribución de Gastos</h2> {/* Aumentar espaciado inferior */}
                          <SpendingChart data={chartData.expenses} />
                        </div>
                      </div>
                      
                      {/* Budget overview */}
                      <div className="col-span-1 lg:col-span-2">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                          <h2 className="text-lg font-semibold text-gray-800 mb-4">Presupuestos</h2> {/* Aumentar espaciado inferior */}
                          <BudgetOverview budgets={budgets} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Objetivos financieros */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Objetivos Financieros</h2> {/* Aumentar espaciado inferior */}
                        <FinancialGoals goals={goals} />
                      </div>
                      
                      {/* Transacciones recientes */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Transacciones Recientes</h2> {/* Aumentar espaciado inferior */}
                        <RecentTransactions 
                          transactions={transactions} 
                          currencySymbol={accountData.currencySymbol} 
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {activeSection === 'accounts' && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Mis Cuentas</h2>
                    <p>Sección de gestión de cuentas.</p>
                  </div>
                )}
                
                {activeSection === 'transactions' && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Transacciones</h2>
                    <p>Sección completa de transacciones.</p>
                  </div>
                )}
                
                {activeSection === 'budget' && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Presupuestos</h2>
                    <p>Gestión detallada de presupuestos.</p>
                  </div>
                )}
                
                {activeSection === 'reports' && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Informes y Análisis</h2>
                    <p>Sección de informes financieros.</p>
                  </div>
                )}
                
                {activeSection === 'settings' && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Configuración</h2>
                    <p>Ajustes de tu cuenta y preferencias.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;