import React from 'react';
import { MdFlag, MdAdd } from 'react-icons/md';

const FinancialGoals = ({ goals }) => {
  // Función para calcular el porcentaje de progreso
  const calculateProgress = (current, target) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };
  
  // Función para formatear la fecha límite
  const formatDeadline = (date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Vencido';
    }
    if (diffDays === 0) {
      return 'Hoy';
    }
    if (diffDays === 1) {
      return 'Mañana';
    }
    if (diffDays < 30) {
      return `En ${diffDays} días`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `En ${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
    
    const years = Math.floor(diffDays / 365);
    return `En ${years} ${years === 1 ? 'año' : 'años'}`;
  };

  return (
    <div className="space-y-5">
      {goals.map((goal) => (
        <div key={goal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center">
                <div className={`w-8 h-8 ${goal.color} rounded-full flex items-center justify-center text-white mr-2`}>
                  <MdFlag className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-medium text-gray-900">{goal.name}</h4>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Meta: ${goal.target.toLocaleString('es-ES')} • {formatDeadline(goal.deadline)}
              </p>
            </div>
            <div className="text-sm font-medium text-gray-900">
              ${goal.current.toLocaleString('es-ES')}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div 
              className={`h-2 rounded-full ${goal.color}`} 
              style={{width: `${calculateProgress(goal.current, goal.target)}%`}}
            ></div>
          </div>
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{calculateProgress(goal.current, goal.target)}% completado</span>
            <span>Faltan: ${(goal.target - goal.current).toLocaleString('es-ES')}</span>
          </div>
        </div>
      ))}
      
      <button className="mt-4 flex items-center justify-center w-full py-2.5 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-600 hover:text-cyan-600 hover:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-150">
        <MdAdd className="mr-2" />
        Añadir nuevo objetivo
      </button>
    </div>
  );
};

export default FinancialGoals;
