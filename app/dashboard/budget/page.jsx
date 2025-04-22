'use client';

import { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdWarning, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { useTheme } from '../../../app/contexts/ThemeContext';

const BudgetPage = () => {
  const { darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [activeTab, setActiveTab] = useState('activos');
  const [sortConfig, setSortConfig] = useState({ key: 'category', direction: 'asc' });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Datos de ejemplo para presupuestos
  const [budgets, setBudgets] = useState([
    { 
      id: 1, 
      category: 'Alimentación', 
      spent: 450, 
      limit: 600, 
      color: 'bg-blue-500',
      period: 'Mensual',
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      description: 'Incluye supermercados y comida para llevar',
      status: 'activo'
    },
    { 
      id: 2, 
      category: 'Transporte', 
      spent: 120, 
      limit: 200, 
      color: 'bg-green-500',
      period: 'Mensual',
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      description: 'Gasolina, transporte público y taxis',
      status: 'activo'
    },
    { 
      id: 3, 
      category: 'Entretenimiento', 
      spent: 180, 
      limit: 150, 
      color: 'bg-red-500',
      period: 'Mensual',
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      description: 'Cine, conciertos y eventos',
      status: 'activo'
    },
    { 
      id: 4, 
      category: 'Salud', 
      spent: 75, 
      limit: 300, 
      color: 'bg-purple-500',
      period: 'Mensual',
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      description: 'Medicamentos y consultas médicas',
      status: 'activo'
    },
    { 
      id: 5, 
      category: 'Servicios', 
      spent: 320, 
      limit: 350, 
      color: 'bg-yellow-500',
      period: 'Mensual',
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      description: 'Agua, luz, internet, teléfono',
      status: 'activo'
    },
    { 
      id: 6, 
      category: 'Educación', 
      spent: 0, 
      limit: 500, 
      color: 'bg-indigo-500',
      period: 'Mensual',
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      description: 'Cursos, libros y material educativo',
      status: 'inactivo'
    },
  ]);

  // Función para calcular el porcentaje de progreso
  const calculateProgress = (spent, limit) => {
    return Math.min(Math.round((spent / limit) * 100), 100);
  };
  
  // Función para determinar el color de la barra de progreso
  const getProgressColor = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Función para obtener mensaje de estado
  const getStatusMessage = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage > 100) return 'Has superado tu presupuesto';
    if (percentage > 75) return 'Estás cerca del límite';
    if (percentage > 50) return 'Vas por buen camino';
    return 'Excelente manejo';
  };

  // Función para ordenar los presupuestos
  const sortedBudgets = () => {
    const filtered = budgets.filter(budget => 
      activeTab === 'activos' ? budget.status === 'activo' : budget.status === 'inactivo'
    );
    
    return [...filtered].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Función para cambiar el criterio de ordenación
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Función para obtener el icono de ordenación
  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) return null;
    
    return sortConfig.direction === 'asc' ? 
      <MdArrowUpward className="inline ml-1" /> : 
      <MdArrowDownward className="inline ml-1" />;
  };

  // Mostrar indicador de carga durante la hidratación
  if (!mounted) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6"></div>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  // Calcular totales para el resumen
  const activeBudgets = budgets.filter(b => b.status === 'activo');
  const totalLimit = activeBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spent, 0);
  const averageUsage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const overBudgetCount = activeBudgets.filter(b => b.spent > b.limit).length;

  // Datos para el gráfico de distribución (implementación completa requeriría un componente Chart.js)
  const chartData = activeBudgets.map(budget => ({
    category: budget.category,
    limit: budget.limit,
    spent: budget.spent,
    color: budget.color
  }));

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Presupuestos</h1>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total presupuestado */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border rounded-xl p-6 shadow-sm`}>
          <h3 className={`text-sm font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-4`}>Total Presupuestado</h3>
          <p className="text-2xl font-bold">${totalLimit.toLocaleString('es-ES')}</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Para este periodo</p>
        </div>
        
        {/* Total gastado */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border rounded-xl p-6 shadow-sm`}>
          <h3 className={`text-sm font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-4`}>Total Gastado</h3>
          <p className="text-2xl font-bold">${totalSpent.toLocaleString('es-ES')}</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{averageUsage}% del presupuesto total</p>
        </div>
        
        {/* Presupuestos activos */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border rounded-xl p-6 shadow-sm`}>
          <h3 className={`text-sm font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-4`}>Presupuestos Activos</h3>
          <p className="text-2xl font-bold">{activeBudgets.length}</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>De {budgets.length} presupuestos totales</p>
        </div>
        
        {/* Presupuestos excedidos */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border rounded-xl p-6 shadow-sm`}>
          <h3 className={`text-sm font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-4`}>Presupuestos Excedidos</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold">{overBudgetCount}</p>
            {overBudgetCount > 0 && (
              <span className={`ml-2 p-1 rounded-full ${darkMode ? 'bg-red-900' : 'bg-red-100'}`}>
                <MdWarning className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Necesitan atención</p>
        </div>
      </div>

      {/* Gráfico y panel de detalles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Gráfico de distribución - Aquí iría la implementación del gráfico */}
        <div className={`col-span-1 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border rounded-xl p-6 shadow-sm`}>
          <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Distribución de Presupuestos</h3>
          
          <div className="h-64 flex flex-col justify-center items-center">
            <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="mb-2">Distribución de tus presupuestos por categoría</p>
              <p className="text-xs">El gráfico mostraría la distribución visual de los presupuestos</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Leyenda</h4>
            <div className="space-y-2">
              {chartData.map((item) => (
                <div key={item.category} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                  <span className="text-xs flex-1">{item.category}</span>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ${item.spent.toLocaleString('es-ES')} / ${item.limit.toLocaleString('es-ES')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Panel detallado de presupuestos */}
        <div className={`col-span-1 md:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border rounded-xl p-6 shadow-sm`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Detalle de Presupuestos</h3>
            <button
              onClick={() => {
                setEditingBudget(null);
                setShowAddModal(true);
              }}
              className={`flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium 
                ${darkMode 
                  ? 'bg-cyan-700 text-white hover:bg-cyan-600' 
                  : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
            >
              <MdAdd className="mr-1" /> Nuevo Presupuesto
            </button>
          </div>
          
          {/* Tabs para alternar entre presupuestos activos e inactivos */}
          <div className="flex border-b mb-4 space-x-4">
            <button 
              onClick={() => setActiveTab('activos')}
              className={`pb-2 px-1 text-sm font-medium transition-colors duration-150 ${
                activeTab === 'activos' 
                  ? darkMode 
                    ? 'text-cyan-400 border-b-2 border-cyan-400' 
                    : 'text-cyan-600 border-b-2 border-cyan-600'
                  : darkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Activos ({budgets.filter(b => b.status === 'activo').length})
            </button>
            <button 
              onClick={() => setActiveTab('inactivos')}
              className={`pb-2 px-1 text-sm font-medium transition-colors duration-150 ${
                activeTab === 'inactivos' 
                  ? darkMode 
                    ? 'text-cyan-400 border-b-2 border-cyan-400' 
                    : 'text-cyan-600 border-b-2 border-cyan-600'
                  : darkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Inactivos ({budgets.filter(b => b.status === 'inactivo').length})
            </button>
          </div>
          
          {/* Tabla de presupuestos */}
          <div className={`rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} overflow-hidden`}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-600' : 'bg-gray-100'}>
                <tr>
                  <th 
                    scope="col" 
                    className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                    onClick={() => requestSort('category')}
                  >
                    <span>Categoría {getSortIcon('category')}</span>
                  </th>
                  <th 
                    scope="col" 
                    className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                    onClick={() => requestSort('limit')}
                  >
                    <span>Límite {getSortIcon('limit')}</span>
                  </th>
                  <th 
                    scope="col" 
                    className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                    onClick={() => requestSort('spent')}
                  >
                    <span>Gastado {getSortIcon('spent')}</span>
                  </th>
                  <th 
                    scope="col" 
                    className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}
                  >
                    Progreso
                  </th>
                  <th 
                    scope="col" 
                    className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                {sortedBudgets().map((budget) => (
                  <tr key={budget.id} className={darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${budget.color} mr-2`}></div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {budget.category}
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      ${budget.limit.toLocaleString('es-ES')}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      budget.spent > budget.limit 
                        ? 'text-red-500' 
                        : darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      ${budget.spent.toLocaleString('es-ES')}
                      {budget.spent > budget.limit && (
                        <MdWarning className="inline ml-1 text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>
                            {calculateProgress(budget.spent, budget.limit)}%
                          </span>
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                            {getStatusMessage(budget.spent, budget.limit)}
                          </span>
                        </div>
                        <div className={`w-full rounded-full h-1.5 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div 
                            className={`h-1.5 rounded-full ${getProgressColor(budget.spent, budget.limit)}`} 
                            style={{width: `${calculateProgress(budget.spent, budget.limit)}%`}}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setEditingBudget(budget);
                            setShowAddModal(true);
                          }}
                          className={`p-1 rounded-full ${
                            darkMode 
                              ? 'text-gray-300 hover:text-cyan-400 hover:bg-gray-600' 
                              : 'text-gray-500 hover:text-cyan-600 hover:bg-gray-100'
                          }`}
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button 
                          className={`p-1 rounded-full ${
                            darkMode 
                              ? 'text-gray-300 hover:text-red-400 hover:bg-gray-600' 
                              : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                          }`}
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedBudgets().length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No hay presupuestos {activeTab === 'activos' ? 'activos' : 'inactivos'} para mostrar.
                      </p>
                      <button
                        onClick={() => {
                          setEditingBudget(null);
                          setShowAddModal(true);
                        }}
                        className={`mt-3 inline-flex items-center px-4 py-2 rounded-md text-sm font-medium 
                          ${darkMode 
                            ? 'bg-cyan-700 text-white hover:bg-cyan-600' 
                            : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
                      >
                        <MdAdd className="mr-1" /> Crear nuevo presupuesto
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Sección de consejos de presupuesto */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border rounded-xl p-6 shadow-sm mb-6`}>
        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Consejos para un mejor presupuesto</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`text-md font-medium mb-2 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>Regla 50/30/20</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Dedica el 50% de tus ingresos a necesidades, 30% a deseos y 20% a ahorro e inversión.
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`text-md font-medium mb-2 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>Revisa regularmente</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Ajusta tus presupuestos mensualmente basándote en tus patrones de gasto reales.
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`text-md font-medium mb-2 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>Prioriza el ahorro</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Trata tus metas de ahorro como un gasto más en tu presupuesto mensual.
            </p>
          </div>
        </div>
      </div>

      {/* Modal para añadir/editar presupuesto (simplificado para este ejemplo) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowAddModal(false)}></div>
          <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
            </h3>
            <div className="space-y-4">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Esta sería una forma completa para {editingBudget ? 'editar el' : 'añadir un nuevo'} presupuesto.
                En una implementación completa, incluiría campos para:
              </p>
              <ul className={`text-sm list-disc ml-5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                <li>Categoría</li>
                <li>Límite de presupuesto</li>
                <li>Periodo (mensual, semanal, etc.)</li>
                <li>Fechas de inicio y fin</li>
                <li>Color</li>
                <li>Descripción</li>
                <li>Estado</li>
              </ul>
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancelar
                </button>
                <button 
                  className={`px-4 py-2 rounded ${
                    darkMode 
                      ? 'bg-cyan-700 text-white hover:bg-cyan-600' 
                      : 'bg-cyan-600 text-white hover:bg-cyan-700'
                  }`}
                >
                  {editingBudget ? 'Guardar Cambios' : 'Crear Presupuesto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;