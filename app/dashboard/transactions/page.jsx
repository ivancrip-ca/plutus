'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '../../contexts/ThemeContext';

// Components
const SummaryCard = ({ title, amount, gradient, icon }) => {
  const { darkMode } = useTheme();
  return (
  <div className={`bg-gradient-to-r ${gradient} rounded-xl shadow-lg p-6 text-white transition-transform hover:scale-105`}>
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-lg font-medium opacity-80">{title}</h2>
      <div className="p-2 bg-white bg-opacity-20 rounded-full">
        {icon}
      </div>
    </div>
    <p className="text-3xl font-bold mt-2">${amount.toLocaleString()}</p>
  </div>
  );
};

const TransactionItem = ({ transaccion }) => {
  const { darkMode } = useTheme();
  return (
  <div className={`flex flex-wrap md:flex-nowrap items-center p-4 ${
    darkMode 
      ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' 
      : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
  } transition rounded-lg border`}>
    <div className={`inline-flex items-center justify-center h-12 w-12 rounded-full mb-2 md:mb-0 md:mr-4 flex-shrink-0 ${
      transaccion.tipo === 'ingreso' 
        ? darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600' 
        : darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600'
    }`}>
      {transaccion.tipo === 'ingreso' ? (
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
      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{transaccion.descripcion}</p>
      <div className="flex flex-col sm:flex-row sm:items-center">
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{transaccion.categoria}</p>
        <span className={`hidden sm:inline mx-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {transaccion.cuenta === 'Efectivo' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            )}
          </svg>
          {transaccion.cuenta}
        </p>
      </div>
    </div>
    <div className="w-full md:w-auto mt-2 md:mt-0 md:mr-8">
      <p className={`font-medium ${
        transaccion.tipo === 'ingreso' 
          ? darkMode ? 'text-green-400' : 'text-green-600' 
          : darkMode ? 'text-red-400' : 'text-red-600'
      }`}>${transaccion.monto.toLocaleString()}</p>
    </div>
    <div className="w-full md:w-auto mt-2 md:mt-0">
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {format(parseISO(transaccion.fecha), 'dd MMM, yyyy', { locale: es })}
      </p>
    </div>
    <div className="w-full md:w-auto ml-auto mt-2 md:mt-0 md:ml-4">
      <button className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>
    </div>
  </div>
  );
};

const FilterButton = ({ active, children, onClick }) => {
  const { darkMode } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active 
          ? 'bg-blue-600 text-white' 
          : darkMode
              ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
};

// Datos de ejemplo
const transaccionesEjemplo = [
  {
    id: 1,
    descripcion: 'Depósito de nómina',
    categoria: 'Salario',
    monto: 2500.00,
    tipo: 'ingreso',
    fecha: '2025-04-15T10:30:00',
    cuenta: 'BBVA Cuenta Nómina'
  },
  {
    id: 2,
    descripcion: 'Supermercado El Corte Inglés',
    categoria: 'Alimentación',
    monto: 125.40,
    tipo: 'gasto',
    fecha: '2025-04-14T14:20:00',
    cuenta: 'Tarjeta de crédito Santander'
  },
  {
    id: 3,
    descripcion: 'Pago Netflix',
    categoria: 'Entretenimiento',
    monto: 12.99,
    tipo: 'gasto',
    fecha: '2025-04-12T08:15:00',
    cuenta: 'PayPal'
  },
  {
    id: 4,
    descripcion: 'Transferencia de Juan',
    categoria: 'Transferencia',
    monto: 50.00,
    tipo: 'ingreso',
    fecha: '2025-04-10T16:45:00',
    cuenta: 'Caixabank'
  },
  {
    id: 5,
    descripcion: 'Restaurante La Taberna',
    categoria: 'Restaurantes',
    monto: 78.50,
    tipo: 'gasto',
    fecha: '2025-04-08T21:30:00',
    cuenta: 'Efectivo'
  },
  {
    id: 6,
    descripcion: 'Gasolina Repsol',
    categoria: 'Transporte',
    monto: 60.75,
    tipo: 'gasto',
    fecha: '2025-04-06T11:20:00',
    cuenta: 'Tarjeta Débito BBVA'
  },
  {
    id: 7,
    descripcion: 'Ingresos freelance',
    categoria: 'Trabajo extra',
    monto: 350.00,
    tipo: 'ingreso',
    fecha: '2025-04-05T09:15:00',
    cuenta: 'Efectivo'
  },
  {
    id: 8,
    descripcion: 'Zara - Ropa',
    categoria: 'Compras',
    monto: 89.95,
    tipo: 'gasto',
    fecha: '2025-04-03T17:40:00',
    cuenta: 'Tarjeta ING Direct'
  },
];

export default function TransactionsPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;
  const { darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Asegurar que el componente está montado antes de renderizar elementos dependientes del tema
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Calcular totales
  const totalIngresos = transaccionesEjemplo
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0);
  
  const totalGastos = transaccionesEjemplo
    .filter(t => t.tipo === 'gasto')
    .reduce((sum, t) => sum + t.monto, 0);
  
  const balance = totalIngresos - totalGastos;

  // Filtrar transacciones
  const filteredTransactions = transaccionesEjemplo
    .filter(t => {
      if (filter === 'ingresos') return t.tipo === 'ingreso';
      if (filter === 'gastos') return t.tipo === 'gasto';
      return true;
    })
    .filter(t => 
      t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Paginación
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'bg-gray-900 text-white' : ''}`}>
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transacciones</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona y visualiza tus movimientos financieros
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva transacción
          </button>
          <button className="p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard 
          title="Ingresos totales" 
          amount={totalIngresos} 
          gradient="from-green-500 to-green-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        />
        <SummaryCard 
          title="Gastos totales" 
          amount={totalGastos} 
          gradient="from-red-500 to-red-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          }
        />
        <SummaryCard 
          title="Balance actual" 
          amount={balance} 
          gradient={balance >= 0 ? "from-blue-500 to-blue-600" : "from-orange-500 to-orange-600"}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center mb-6">
        <div className="flex space-x-2">
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            Todas
          </FilterButton>
          <FilterButton 
            active={filter === 'ingresos'} 
            onClick={() => setFilter('ingresos')}
          >
            Ingresos
          </FilterButton>
          <FilterButton 
            active={filter === 'gastos'} 
            onClick={() => setFilter('gastos')}
          >
            Gastos
          </FilterButton>
        </div>

        <div className="relative w-full md:w-64 ml-auto">
          <input
            type="text"
            placeholder="Buscar transacciones..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Lista de transacciones */}
      <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} overflow-hidden mb-6`}>
        <div className="p-6">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Historial de transacciones</h2>
          
          {currentTransactions.length > 0 ? (
            <div className="space-y-3">
              {currentTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaccion={transaction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No se encontraron transacciones</h3>
            </div>
          )}
        </div>
      </div>

      {/* Paginación */}
      {filteredTransactions.length > transactionsPerPage && (
        <div className="flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            >
              Anterior
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border-t border-b border-gray-300 ${
                  currentPage === page 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            >
              Siguiente
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}