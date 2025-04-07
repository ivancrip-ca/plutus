import React, { useState, useEffect } from 'react';
import { MdWarning } from 'react-icons/md';
import { useTheme } from '../../app/contexts/ThemeContext';

const BudgetOverview = ({ budgets }) => {
  const { darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para calcular el porcentaje de progreso
  const calculateProgress = (spent, limit) => {
    return Math.min(Math.round((spent / limit) * 100), 100);
  };
  
  // Función para determinar el color de la barra de progreso
  // Los colores son independientes del modo oscuro ya que representan estados de alerta
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

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-5 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {budgets.map((budget, index) => (
        <div 
          key={index} 
          className={`border rounded-lg p-4 transition-shadow hover:shadow-sm
            ${darkMode 
              ? 'border-gray-700 bg-gray-800/50' 
              : 'border-gray-200 bg-white'}`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${budget.color} mr-2`}></div>
              <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {budget.category}
              </h4>
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              ${budget.spent.toLocaleString('es-ES')} / ${budget.limit.toLocaleString('es-ES')}
            </div>
          </div>
          
          <div className={`w-full rounded-full h-2 mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className={`h-2 rounded-full ${getProgressColor(budget.spent, budget.limit)}`} 
              style={{width: `${calculateProgress(budget.spent, budget.limit)}%`}}
            ></div>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className={`${darkMode ? 'text-white' : 'text-gray-500'}`}>
              {calculateProgress(budget.spent, budget.limit)}% usado
            </span>
            
            {budget.spent > budget.limit && (
              <span className={`flex items-center ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
                <MdWarning className="mr-1" />
                Límite excedido
              </span>
            )}
            
            {budget.spent <= budget.limit && (
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {getStatusMessage(budget.spent, budget.limit)}
              </span>
            )}
          </div>
        </div>
      ))}
      
      <button 
        className={`mt-4 w-full py-2.5 px-4 border border-transparent text-sm font-medium rounded-md
          ${darkMode 
            ? 'text-cyan-400 bg-cyan-900/30 hover:bg-cyan-900/50' 
            : 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100'} 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-150
          ${darkMode ? 'focus:ring-offset-gray-900' : ''}`}
      >
        Gestionar presupuestos
      </button>
    </div>
  );
};

export default BudgetOverview;
