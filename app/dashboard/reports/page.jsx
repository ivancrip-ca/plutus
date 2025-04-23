'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../app/contexts/ThemeContext';
import {
  MdCalendarToday,
  MdPictureAsPdf,
  MdFileDownload,
  MdInfoOutline,
  MdFilterList,
  MdMoreVert,
  MdZoomIn,
  MdZoomOut,
  MdKeyboardArrowDown,
  MdArrowForward,
  MdArrowUpward,
  MdArrowDownward,
  MdPieChart,
  MdBarChart,
  MdTimeline,
  MdInsertDriveFile,
  MdRefresh,
  MdShare,
  MdPrint
} from 'react-icons/md';
import { format, subMonths, subYears, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente para seleccionar el tipo de informe
const ReportTypeSelector = ({ reportType, setReportType, darkMode }) => {
  const reportTypes = [
    { id: 'summary', name: 'Resumen General', icon: <MdPieChart className="h-5 w-5" /> },
    { id: 'income-expense', name: 'Ingresos vs Gastos', icon: <MdBarChart className="h-5 w-5" /> },
    { id: 'categories', name: 'Gastos por Categoría', icon: <MdPieChart className="h-5 w-5" /> },
    { id: 'trends', name: 'Tendencias', icon: <MdTimeline className="h-5 w-5" /> },
    { id: 'monthly', name: 'Informe Mensual', icon: <MdInsertDriveFile className="h-5 w-5" /> },
    { id: 'annual', name: 'Informe Anual', icon: <MdInsertDriveFile className="h-5 w-5" /> },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {reportTypes.map((type) => (
        <button
          key={type.id}
          className={`flex items-center p-4 rounded-xl border transition-colors
            ${reportType === type.id
              ? darkMode
                ? 'bg-cyan-900/30 border-cyan-700 text-cyan-400'
                : 'bg-cyan-50 border-cyan-200 text-cyan-600'
              : darkMode
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          onClick={() => setReportType(type.id)}
        >
          <div className={`p-2 rounded-full mr-3 flex-shrink-0
            ${reportType === type.id
              ? darkMode ? 'bg-cyan-800 text-cyan-400' : 'bg-cyan-100 text-cyan-600'
              : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {type.icon}
          </div>
          <span className="text-sm font-medium">{type.name}</span>
        </button>
      ))}
    </div>
  );
};

// Componente para seleccionar el periodo de tiempo
const TimeRangeSelector = ({ timeRange, setTimeRange, darkMode }) => {
  const ranges = [
    { id: '1m', name: 'Último mes' },
    { id: '3m', name: 'Últimos 3 meses' },
    { id: '6m', name: 'Últimos 6 meses' },
    { id: '1y', name: 'Último año' },
    { id: 'ytd', name: 'Año hasta la fecha' },
    { id: 'custom', name: 'Personalizado' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {ranges.map((range) => (
        <button
          key={range.id}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${timeRange === range.id
              ? darkMode
                ? 'bg-cyan-900/30 text-cyan-400'
                : 'bg-cyan-100 text-cyan-600'
              : darkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
            }`}
          onClick={() => setTimeRange(range.id)}
        >
          {range.name}
        </button>
      ))}
    </div>
  );
};

// Componente que renderiza los diferentes tipos de gráficos según el informe seleccionado
const ReportContent = ({ reportType, timeRange, darkMode }) => {
  // En una implementación real, aquí tendrías lógica para obtener datos según el tipo de informe y rango de tiempo
  
  // Datos de ejemplo para el informe de resumen general
  const summaryData = {
    income: 8500.35,
    expenses: 5320.50,
    savings: 3179.85,
    balance: 12750.22,
    trends: {
      incomeChange: 12.5,
      expensesChange: -3.2,
      savingsChange: 8.7
    }
  };

  // Datos de ejemplo para el informe de ingresos vs gastos
  const incomeVsExpenseData = [
    { month: 'Enero', income: 7500, expenses: 4800 },
    { month: 'Febrero', income: 7800, expenses: 5100 },
    { month: 'Marzo', income: 8200, expenses: 5200 },
    { month: 'Abril', income: 8500, expenses: 5320 },
  ];

  // Datos de ejemplo para el informe de gastos por categoría
  const categoriesData = [
    { category: 'Alimentación', amount: 1250.30, percentage: 23.5 },
    { category: 'Vivienda', amount: 1800.00, percentage: 33.8 },
    { category: 'Transporte', amount: 580.20, percentage: 10.9 },
    { category: 'Entretenimiento', amount: 420.50, percentage: 7.9 },
    { category: 'Salud', amount: 350.00, percentage: 6.6 },
    { category: 'Servicios', amount: 620.00, percentage: 11.7 },
    { category: 'Otros', amount: 299.50, percentage: 5.6 },
  ];

  // Datos de ejemplo para el informe de tendencias
  const trendsData = {
    months: ['Ene', 'Feb', 'Mar', 'Abr'],
    savings: [1500, 1700, 2200, 3179.85],
    netWorth: [9800, 10500, 11800, 12750.22]
  };

  // Función para obtener el título del informe según el tipo seleccionado
  const getReportTitle = () => {
    const titles = {
      'summary': 'Resumen General',
      'income-expense': 'Ingresos vs Gastos',
      'categories': 'Gastos por Categoría',
      'trends': 'Tendencias de Ahorro',
      'monthly': 'Informe Mensual Detallado',
      'annual': 'Informe Anual Consolidado'
    };
    return titles[reportType] || 'Informe';
  };

  // Función para obtener el período del informe en formato texto
  const getTimeRangeText = () => {
    const now = new Date();
    
    switch(timeRange) {
      case '1m':
        return `${format(subMonths(now, 1), 'dd MMM yyyy', { locale: es })} - ${format(now, 'dd MMM yyyy', { locale: es })}`;
      case '3m':
        return `${format(subMonths(now, 3), 'dd MMM yyyy', { locale: es })} - ${format(now, 'dd MMM yyyy', { locale: es })}`;
      case '6m':
        return `${format(subMonths(now, 6), 'dd MMM yyyy', { locale: es })} - ${format(now, 'dd MMM yyyy', { locale: es })}`;
      case '1y':
        return `${format(subYears(now, 1), 'dd MMM yyyy', { locale: es })} - ${format(now, 'dd MMM yyyy', { locale: es })}`;
      case 'ytd':
        return `${format(new Date(now.getFullYear(), 0, 1), 'dd MMM yyyy', { locale: es })} - ${format(now, 'dd MMM yyyy', { locale: es })}`;
      case 'custom':
        return 'Rango personalizado';
      default:
        return 'Período actual';
    }
  };

  // Renderizar visualización según el tipo de informe
  if (reportType === 'summary') {
    return (
      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{getReportTitle()}</h3>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getTimeRangeText()}</span>
          </div>
          
          {/* Resumen de finanzas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ingresos</p>
              <div className="flex justify-between items-end">
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${summaryData.income.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                <span className={`text-xs flex items-center ${summaryData.trends.incomeChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {summaryData.trends.incomeChange >= 0 ? <MdArrowUpward className="mr-0.5" /> : <MdArrowDownward className="mr-0.5" />}
                  {Math.abs(summaryData.trends.incomeChange)}%
                </span>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gastos</p>
              <div className="flex justify-between items-end">
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${summaryData.expenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                <span className={`text-xs flex items-center ${summaryData.trends.expensesChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {summaryData.trends.expensesChange >= 0 ? <MdArrowUpward className="mr-0.5" /> : <MdArrowDownward className="mr-0.5" />}
                  {Math.abs(summaryData.trends.expensesChange)}%
                </span>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ahorros</p>
              <div className="flex justify-between items-end">
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${summaryData.savings.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                <span className={`text-xs flex items-center ${summaryData.trends.savingsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {summaryData.trends.savingsChange >= 0 ? <MdArrowUpward className="mr-0.5" /> : <MdArrowDownward className="mr-0.5" />}
                  {Math.abs(summaryData.trends.savingsChange)}%
                </span>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Balance</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${summaryData.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          
          {/* Aquí iría el gráfico de resumen - representación visual */}
          <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4 h-64 flex items-center justify-center`}>
            <div className="text-center">
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gráfico de Resumen</p>
              <p className="text-xs mt-1 opacity-60">La visualización mostraría la distribución de ingresos y gastos</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4`}>
            <h3 className={`font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Análisis de Gastos</h3>
            
            {/* Tabla simplificada de gastos por categoría */}
            <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={darkMode ? 'bg-gray-900/30' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Categoría</th>
                    <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Monto</th>
                    <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>%</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {categoriesData.slice(0, 4).map((category, index) => (
                    <tr key={index}>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{category.category}</td>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>${category.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{category.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button className={`mt-3 w-full py-2 rounded-lg text-sm font-medium 
              ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'}`}>
              Ver todas las categorías
            </button>
          </div>
          
          <div className={`rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4`}>
            <h3 className={`font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Tendencias de Ahorro</h3>
            
            {/* Representación visual de las tendencias */}
            <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4 h-64 flex items-center justify-center`}>
              <div className="text-center">
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gráfico de Tendencias</p>
                <p className="text-xs mt-1 opacity-60">La visualización mostraría la evolución de tus ahorros</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (reportType === 'income-expense') {
    return (
      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{getReportTitle()}</h3>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getTimeRangeText()}</span>
          </div>
          
          {/* Gráfico de barras ingresos vs gastos */}
          <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6 h-80 mb-4`}>
            <div className="h-full flex flex-col justify-center items-center">
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gráfico de Ingresos vs Gastos</p>
              <p className="text-xs mt-1 opacity-60">Comparativa mensual de ingresos y gastos</p>
            </div>
          </div>
          
          {/* Tabla de datos de ingresos y gastos */}
          <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-900/30' : 'bg-gray-50'}>
                <tr>
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Mes</th>
                  <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Ingresos</th>
                  <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Gastos</th>
                  <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Balance</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {incomeVsExpenseData.map((data, index) => (
                  <tr key={index}>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{data.month}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${darkMode ? 'text-green-400' : 'text-green-600'}`}>${data.income.toLocaleString('es-ES')}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${darkMode ? 'text-red-400' : 'text-red-600'}`}>${data.expenses.toLocaleString('es-ES')}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>${(data.income - data.expenses).toLocaleString('es-ES')}</td>
                  </tr>
                ))}
                <tr className={darkMode ? 'bg-gray-900/30' : 'bg-gray-50'}>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total</td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ${incomeVsExpenseData.reduce((sum, data) => sum + data.income, 0).toLocaleString('es-ES')}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    ${incomeVsExpenseData.reduce((sum, data) => sum + data.expenses, 0).toLocaleString('es-ES')}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ${incomeVsExpenseData.reduce((sum, data) => sum + (data.income - data.expenses), 0).toLocaleString('es-ES')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } else if (reportType === 'categories') {
    return (
      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{getReportTitle()}</h3>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getTimeRangeText()}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico de pastel categorías */}
            <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4 h-80 flex items-center justify-center`}>
              <div className="text-center">
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gráfico de Categorías</p>
                <p className="text-xs mt-1 opacity-60">Distribución de gastos por categoría</p>
              </div>
            </div>
            
            {/* Tabla de categorías */}
            <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={darkMode ? 'bg-gray-900/30' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Categoría</th>
                    <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Monto</th>
                    <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>%</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {categoriesData.map((category, index) => (
                    <tr key={index}>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{category.category}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>${category.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{category.percentage}%</td>
                    </tr>
                  ))}
                  <tr className={darkMode ? 'bg-gray-900/30' : 'bg-gray-50'}>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      ${categoriesData.reduce((sum, category) => sum + category.amount, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Análisis adicional */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
              <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mayor Gasto</h4>
              <div className="flex justify-between items-center">
                <div>
                  <p className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{categoriesData[0].category}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{categoriesData[0].percentage}% del total</p>
                </div>
                <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>${categoriesData[0].amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            
            <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
              <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Comparación con Mes Anterior</h4>
              <div className="flex justify-between items-center">
                <p className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium`}>Total de Gastos</p>
                <div className="flex items-center">
                  <p className={`font-medium mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>-4.5%</p>
                  <span className="text-green-500">
                    <MdArrowDownward className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (reportType === 'trends') {
    return (
      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{getReportTitle()}</h3>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getTimeRangeText()}</span>
          </div>
          
          {/* Gráfico de líneas de tendencias */}
          <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4 h-80 mb-6 flex items-center justify-center`}>
            <div className="text-center">
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gráfico de Tendencias</p>
              <p className="text-xs mt-1 opacity-60">Evolución de tus finanzas en el tiempo</p>
            </div>
          </div>
          
          {/* Indicadores clave */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
              <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tendencia de Ingresos</p>
              <div className="flex justify-between items-end">
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>+12.5%</p>
                <span className="text-xs text-green-500 flex items-center">
                  <MdArrowUpward className="mr-0.5" /> Creciente
                </span>
              </div>
            </div>
            
            <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
              <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tendencia de Gastos</p>
              <div className="flex justify-between items-end">
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>-3.2%</p>
                <span className="text-xs text-green-500 flex items-center">
                  <MdArrowDownward className="mr-0.5" /> Decreciente
                </span>
              </div>
            </div>
            
            <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
              <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ratio Ahorro/Ingreso</p>
              <div className="flex justify-between items-end">
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>37.4%</p>
                <span className="text-xs text-green-500 flex items-center">
                  <MdArrowUpward className="mr-0.5" /> Óptimo
                </span>
              </div>
            </div>
          </div>
          
          {/* Tabla de datos de tendencias */}
          <div className={`mt-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-900/30' : 'bg-gray-50'}>
                <tr>
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Mes</th>
                  <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Ahorros</th>
                  <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Patrimonio Neto</th>
                  <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Cambio</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {trendsData.months.map((month, index) => (
                  <tr key={index}>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{month}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>${trendsData.savings[index].toLocaleString('es-ES')}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>${trendsData.netWorth[index].toLocaleString('es-ES')}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${
                      index > 0 && trendsData.netWorth[index] > trendsData.netWorth[index-1]
                        ? darkMode ? 'text-green-400' : 'text-green-600'
                        : darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {index > 0 
                        ? `${((trendsData.netWorth[index] - trendsData.netWorth[index-1]) / trendsData.netWorth[index-1] * 100).toFixed(1)}%`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } else if (reportType === 'monthly' || reportType === 'annual') {
    return (
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{getReportTitle()}</h3>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getTimeRangeText()}</span>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12">
          <div className={`p-4 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}>
            <MdInsertDriveFile className={`h-16 w-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {reportType === 'monthly' ? 'Informe Mensual Detallado' : 'Informe Anual Consolidado'}
          </h4>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6 text-center max-w-md`}>
            {reportType === 'monthly' 
              ? 'Este informe contiene un desglose detallado de todas tus transacciones financieras para el período seleccionado.'
              : 'Este informe proporciona una visión consolidada de tus finanzas durante todo el año, incluyendo análisis de tendencias y comparativas anuales.'}
          </p>
          <div className="flex space-x-4">
            <button className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium 
              ${darkMode 
                ? 'bg-cyan-700 text-white hover:bg-cyan-600' 
                : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}>
              <MdPictureAsPdf className="mr-2" /> Generar PDF
            </button>
            <button className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium 
              ${darkMode 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
              <MdFileDownload className="mr-2" /> Exportar Excel
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={`p-12 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Selecciona un tipo de informe para visualizar los datos</p>
      </div>
    );
  }
};

const ReportsPage = () => {
  const { darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [timeRange, setTimeRange] = useState('1m');
  const [showExportOptions, setShowExportOptions] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para imprimir el informe actual con formato similar a PDF
  const handlePrint = () => {
    // Ocultar el menú desplegable
    setShowExportOptions(false);
    
    // Crear un estilo para la impresión con diseño similar a PDF
    const printStyles = `
      @media print {
        @page {
          size: A4;
          margin: 20mm 15mm;
        }
        
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          line-height: 1.5;
          color: #333;
          background: #fff;
        }
        
        .print-container {
          max-width: 100%;
        }
        
        .print-header {
          text-align: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #ddd;
        }
        
        .print-header h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 0 0 5px 0;
          color: #2563eb;
        }
        
        .print-header p {
          margin: 5px 0;
          font-size: 12px;
          color: #555;
        }
        
        .print-logo {
          text-align: center;
          margin-bottom: 15px;
        }
        
        .print-logo img {
          height: 50px;
        }
        
        .print-meta {
          margin: 20px 0;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #555;
        }
        
        .print-summary {
          margin: 20px 0;
          padding: 15px;
          background-color: #f7f9fc;
          border-radius: 5px;
        }
        
        .print-summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        
        .print-summary-item {
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        
        .print-summary-label {
          font-size: 12px;
          color: #555;
          margin-bottom: 5px;
        }
        
        .print-summary-value {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
        
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }
        
        .print-table th {
          background-color: #f1f5f9;
          color: #334155;
          font-weight: bold;
          text-align: left;
          padding: 10px;
          border: 1px solid #e2e8f0;
        }
        
        .print-table td {
          padding: 10px;
          border: 1px solid #e2e8f0;
          vertical-align: top;
        }
        
        .print-table tr:nth-child(even) {
          background-color: #f8fafc;
        }
        
        .print-table tr:hover {
          background-color: #f1f5f9;
        }
        
        .print-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #6b7280;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
        
        .amount-positive {
          color: #059669;
        }
        
        .amount-negative {
          color: #dc2626;
        }
        
        .print-chart {
          margin: 20px 0;
          text-align: center;
          padding: 20px;
          background-color: #f9fafb;
          border-radius: 5px;
          border: 1px dashed #d1d5db;
        }
        
        .no-print {
          display: none;
        }
      }
    `;
    
    // Obtener datos del informe actual
    let reportTitle = '';
    let reportData = [];
    
    // Determinar el título y los datos según el tipo de informe
    switch(reportType) {
      case 'summary':
        reportTitle = 'Resumen General';
        break;
      case 'income-expense':
        reportTitle = 'Ingresos vs Gastos';
        const incomeExpenseData = document.querySelectorAll('[class*="rounded-lg bg-gray"] table tbody tr');
        incomeExpenseData.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length > 0) {
            reportData.push({
              month: cells[0]?.textContent || '',
              income: cells[1]?.textContent || '',
              expenses: cells[2]?.textContent || '',
              balance: cells[3]?.textContent || ''
            });
          }
        });
        break;
      case 'categories':
        reportTitle = 'Gastos por Categoría';
        const categoriesData = document.querySelectorAll('[class*="rounded-lg bg-gray"] table tbody tr');
        categoriesData.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length > 0) {
            reportData.push({
              category: cells[0]?.textContent || '',
              amount: cells[1]?.textContent || '',
              percentage: cells[2]?.textContent || ''
            });
          }
        });
        break;
      case 'trends':
        reportTitle = 'Tendencias';
        const trendsData = document.querySelectorAll('[class*="rounded-lg bg-gray"] table tbody tr');
        trendsData.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length > 0) {
            reportData.push({
              month: cells[0]?.textContent || '',
              savings: cells[1]?.textContent || '',
              netWorth: cells[2]?.textContent || '',
              change: cells[3]?.textContent || ''
            });
          }
        });
        break;
      case 'monthly':
        reportTitle = 'Informe Mensual';
        break;
      case 'annual':
        reportTitle = 'Informe Anual';
        break;
      default:
        reportTitle = 'Informe';
    }
    
    // Formatear la fecha actual
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Crear el contenido HTML para la impresión con aspecto similar a PDF
    let printContent = `
      <html>
        <head>
          <title>${reportTitle} - Plutus</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-logo">
              <span style="font-size: 28px; font-weight: bold; color: #0891b2;">Plutus</span>
              <span style="font-size: 28px; color: #64748b;"> | Finanzas</span>
            </div>
            
            <div class="print-header">
              <h1>${reportTitle}</h1>
              <p>Período: ${getTimeRangeText()}</p>
            </div>
            
            <div class="print-meta">
              <div>
                <strong>Fecha de generación:</strong> ${formattedDate}
              </div>
              <div>
                <strong>Ref:</strong> REP-${Math.floor(Math.random()*10000).toString().padStart(4, '0')}
              </div>
            </div>
    `;
    
    // Añadir resumen si es el tipo de informe "summary"
    if (reportType === 'summary') {
      // Obtener datos del resumen general (asumiendo que existen en la página)
      const summaryData = {
        income: document.querySelector('[class*="rounded-lg"] p:contains("Ingresos")').nextElementSibling?.textContent || '$8,500.35',
        expenses: document.querySelector('[class*="rounded-lg"] p:contains("Gastos")').nextElementSibling?.textContent || '$5,320.50',
        savings: document.querySelector('[class*="rounded-lg"] p:contains("Ahorros")').nextElementSibling?.textContent || '$3,179.85',
        balance: document.querySelector('[class*="rounded-lg"] p:contains("Balance")').nextElementSibling?.textContent || '$12,750.22'
      };
      
      printContent += `
        <div class="print-summary">
          <h2 style="margin-top: 0; font-size: 16px; color: #334155;">Resumen Financiero</h2>
          <div class="print-summary-grid">
            <div class="print-summary-item">
              <div class="print-summary-label">Ingresos Totales</div>
              <div class="print-summary-value amount-positive">${summaryData.income}</div>
            </div>
            <div class="print-summary-item">
              <div class="print-summary-label">Gastos Totales</div>
              <div class="print-summary-value amount-negative">${summaryData.expenses}</div>
            </div>
            <div class="print-summary-item">
              <div class="print-summary-label">Ahorros</div>
              <div class="print-summary-value">${summaryData.savings}</div>
            </div>
            <div class="print-summary-item">
              <div class="print-summary-label">Balance General</div>
              <div class="print-summary-value">${summaryData.balance}</div>
            </div>
          </div>
        </div>
        
        <div class="print-chart">
          <p style="font-size: 14px; margin-bottom: 5px; color: #334155;">Visualización Gráfica</p>
          <p style="font-size: 12px; color: #6b7280;">Este informe incluye una visualización gráfica en la aplicación Plutus</p>
        </div>
      `;
    }
    
    // Añadir tabla según el tipo de informe
    if (reportData.length > 0) {
      printContent += `
        <h2 style="font-size: 16px; color: #334155; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #e2e8f0;">Detalle del Informe</h2>
        <table class="print-table">
          <thead>
            <tr>
      `;
      
      // Determinar las columnas según el tipo de informe
      if (reportType === 'income-expense') {
        printContent += `
              <th>Mes</th>
              <th>Ingresos</th>
              <th>Gastos</th>
              <th>Balance</th>
        `;
      } else if (reportType === 'categories') {
        printContent += `
              <th>Categoría</th>
              <th>Monto</th>
              <th>Porcentaje</th>
        `;
      } else if (reportType === 'trends') {
        printContent += `
              <th>Mes</th>
              <th>Ahorros</th>
              <th>Patrimonio Neto</th>
              <th>Cambio</th>
        `;
      }
      
      printContent += `
            </tr>
          </thead>
          <tbody>
      `;
      
      // Agregar filas según el tipo de informe
      if (reportType === 'income-expense') {
        reportData.forEach(data => {
          printContent += `
            <tr>
              <td>${data.month}</td>
              <td class="amount-positive">${data.income}</td>
              <td class="amount-negative">${data.expenses}</td>
              <td>${data.balance}</td>
            </tr>
          `;
        });
      } else if (reportType === 'categories') {
        reportData.forEach(data => {
          printContent += `
            <tr>
              <td>${data.category}</td>
              <td>${data.amount}</td>
              <td>${data.percentage}</td>
            </tr>
          `;
        });
      } else if (reportType === 'trends') {
        reportData.forEach(data => {
          // Determinar si el cambio es positivo (para aplicar color)
          const isPositiveChange = data.change && !data.change.includes('-');
          printContent += `
            <tr>
              <td>${data.month}</td>
              <td>${data.savings}</td>
              <td>${data.netWorth}</td>
              <td class="${isPositiveChange ? 'amount-positive' : 'amount-negative'}">${data.change}</td>
            </tr>
          `;
        });
      }
      
      printContent += `
          </tbody>
        </table>
      `;
      
      // Añadir una nota sobre la visualización de datos si corresponde
      if (reportType === 'categories' || reportType === 'income-expense' || reportType === 'trends') {
        printContent += `
          <div class="print-chart">
            <p style="font-size: 14px; margin-bottom: 5px; color: #334155;">Visualización Gráfica</p>
            <p style="font-size: 12px; color: #6b7280;">Este informe incluye gráficos interactivos en la aplicación Plutus</p>
          </div>
        `;
      }
    } else {
      // Si no hay datos tabulares
      printContent += `
        <div style="padding: 30px; text-align: center; background-color: #f9fafb; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 16px; color: #4b5563; margin-bottom: 10px;">Este informe ofrece una visualización detallada de tus datos financieros</p>
          <p style="font-size: 14px; color: #6b7280;">Para interactuar con todos los componentes del informe, consulta la aplicación Plutus</p>
        </div>
      `;
    }
    
    // Añadir notas y recomendaciones
    printContent += `
      <div style="margin-top: 30px; padding: 15px; background-color: #f0f9ff; border-radius: 5px; border-left: 4px solid #0ea5e9;">
        <h3 style="margin-top: 0; font-size: 14px; color: #0c4a6e;">Notas y Recomendaciones</h3>
        <ul style="margin: 10px 0; padding-left: 20px; font-size: 12px; color: #334155;">
          <li>Este informe ha sido generado automáticamente por Plutus.</li>
          <li>Los datos presentados corresponden al período: ${getTimeRangeText()}.</li>
          <li>Para un análisis más detallado, consulta la aplicación web de Plutus.</li>
        </ul>
      </div>
    `;
    
    // Añadir pie de página
    printContent += `
      <div class="print-footer">
        <p>Generado por Plutus | Gestión de Finanzas Personales | ${formattedDate}</p>
        <p>© ${currentDate.getFullYear()} Plutus. Todos los derechos reservados.</p>
      </div>
    `;
    
    // Cerrar el HTML
    printContent += `
          </div>
        </body>
      </html>
    `;
    
    // Crear una ventana para imprimir
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Esperar a que el contenido se cargue antes de imprimir
    printWindow.onload = function() {
      printWindow.print();
      printWindow.onafterprint = function() {
        printWindow.close();
      };
    };
  };

  // Mostrar indicador de carga durante la hidratación
  if (!mounted) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
          ))}
        </div>
        <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Informes Financieros</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors 
              ${darkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'}`}
          >
            <span className="flex items-center">
              <MdFileDownload className="mr-2" /> Exportar <MdKeyboardArrowDown className="ml-1" />
            </span>
            
            {/* Menú desplegable de opciones de exportación */}
            {showExportOptions && (
              <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10
                ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
                style={{ top: '100%' }}
              >
                <div className="py-1">
                  <button className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <div className="flex items-center">
                      <MdPictureAsPdf className="mr-2 h-5 w-5" /> Exportar como PDF
                    </div>
                  </button>
                  <button className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <div className="flex items-center">
                      <MdFileDownload className="mr-2 h-5 w-5" /> Exportar como Excel
                    </div>
                  </button>
                  <button 
                    onClick={handlePrint}
                    className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <div className="flex items-center">
                      <MdPrint className="mr-2 h-5 w-5" /> Imprimir
                    </div>
                  </button>
                  <button className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <div className="flex items-center">
                      <MdShare className="mr-2 h-5 w-5" /> Compartir Informe
                    </div>
                  </button>
                </div>
              </div>
            )}
          </button>
          
          <button 
            className={`px-3 py-2 rounded-lg text-sm font-medium 
              ${darkMode
                ? 'bg-cyan-700 text-white hover:bg-cyan-600'
                : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
          >
            <div className="flex items-center">
              <MdRefresh className="mr-2" /> Actualizar
            </div>
          </button>
        </div>
      </div>
      
      {/* Descripción */}
      <div className={`p-4 rounded-lg mb-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex items-start">
          <div className={`p-2 rounded-full mr-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <MdInfoOutline className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <div>
            <h2 className={`text-md font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Análisis Financiero
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Usa esta sección para generar informes detallados sobre tus finanzas. Puedes filtrar por período, tipo de informe, y exportar los resultados en diferentes formatos.
            </p>
          </div>
        </div>
      </div>
      
      {/* Selector de tipo de informe */}
      <div className="mb-6">
        <h2 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Tipo de Informe</h2>
        <ReportTypeSelector reportType={reportType} setReportType={setReportType} darkMode={darkMode} />
      </div>
      
      {/* Selector de período */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Período</h2>
          <button className={`flex items-center text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
            <MdCalendarToday className="mr-1" /> Seleccionar fechas
          </button>
        </div>
        <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} darkMode={darkMode} />
      </div>
      
      {/* Contenido del informe */}
      <div className="mb-6">
        <ReportContent reportType={reportType} timeRange={timeRange} darkMode={darkMode} />
      </div>
      
      {/* Sugerencias de informes */}
      <div className="mt-8">
        <h2 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Informes Recomendados</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} hover:shadow-md transition-shadow`}>
            <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Análisis de Tendencias Anuales</h3>
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Analiza cómo han evolucionado tus finanzas durante el último año.
            </p>
            <button 
              onClick={() => {
                setReportType('trends');
                setTimeRange('1y');
              }}
              className={`text-sm flex items-center ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}
            >
              Ver informe <MdArrowForward className="ml-1" />
            </button>
          </div>
          
          <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} hover:shadow-md transition-shadow`}>
            <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Resumen del Mes Actual</h3>
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Visualiza un resumen completo de tu situación financiera este mes.
            </p>
            <button 
              onClick={() => {
                setReportType('summary');
                setTimeRange('1m');
              }}
              className={`text-sm flex items-center ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}
            >
              Ver informe <MdArrowForward className="ml-1" />
            </button>
          </div>
          
          <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} hover:shadow-md transition-shadow`}>
            <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Análisis de Gastos por Categoría</h3>
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Identifica en qué categorías estás gastando más durante los últimos 3 meses.
            </p>
            <button 
              onClick={() => {
                setReportType('categories');
                setTimeRange('3m');
              }}
              className={`text-sm flex items-center ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}
            >
              Ver informe <MdArrowForward className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

