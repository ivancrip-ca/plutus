'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../app/contexts/ThemeContext';
import { useAuth } from '../../../app/contexts/AuthContext';
import { db } from '../../../app/firebase';
import { collection, query, where, getDocs, orderBy, limit, startAfter, 
         Timestamp, addDoc, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
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
import { format, subMonths, subYears, parseISO, startOfMonth, endOfMonth, 
         startOfYear, endOfYear, isBefore, isAfter, addMonths } from 'date-fns';
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
const ReportContent = ({ reportType, timeRange, darkMode, reportData, getTimeRangeText }) => {
  // Obtener el título del informe según el tipo seleccionado
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
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${reportData.summary.income.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                <span className={`text-xs flex items-center ${reportData.summary.trends.incomeChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {reportData.summary.trends.incomeChange >= 0 ? <MdArrowUpward className="mr-0.5" /> : <MdArrowDownward className="mr-0.5" />}
                  {Math.abs(reportData.summary.trends.incomeChange)}%
                </span>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gastos</p>
              <div className="flex justify-between items-end">
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${reportData.summary.expenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                <span className={`text-xs flex items-center ${reportData.summary.trends.expensesChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {reportData.summary.trends.expensesChange >= 0 ? <MdArrowUpward className="mr-0.5" /> : <MdArrowDownward className="mr-0.5" />}
                  {Math.abs(reportData.summary.trends.expensesChange)}%
                </span>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ahorros</p>
              <div className="flex justify-between items-end">
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${reportData.summary.savings.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                <span className={`text-xs flex items-center ${reportData.summary.trends.savingsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {reportData.summary.trends.savingsChange >= 0 ? <MdArrowUpward className="mr-0.5" /> : <MdArrowDownward className="mr-0.5" />}
                  {Math.abs(reportData.summary.trends.savingsChange)}%
                </span>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Balance</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${reportData.summary.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
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
                  {reportData.categories.slice(0, 4).map((category, index) => (
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
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Período</th>
                  <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Ingresos</th>
                  <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Gastos</th>
                  <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Balance</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {reportData.incomeVsExpense.map((data, index) => (
                  <tr key={index}>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{data.month || data.label}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${darkMode ? 'text-green-400' : 'text-green-600'}`}>${data.income.toLocaleString('es-ES')}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${darkMode ? 'text-red-400' : 'text-red-600'}`}>${data.expenses.toLocaleString('es-ES')}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>${(data.income - data.expenses).toLocaleString('es-ES')}</td>
                  </tr>
                ))}
                <tr className={darkMode ? 'bg-gray-900/30' : 'bg-gray-50'}>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total</td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ${reportData.incomeVsExpense.reduce((sum, data) => sum + data.income, 0).toLocaleString('es-ES')}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    ${reportData.incomeVsExpense.reduce((sum, data) => sum + data.expenses, 0).toLocaleString('es-ES')}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ${reportData.incomeVsExpense.reduce((sum, data) => sum + (data.income - data.expenses), 0).toLocaleString('es-ES')}
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
                  {reportData.categories.map((category, index) => (
                    <tr key={index}>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{category.category}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>${category.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{category.percentage}%</td>
                    </tr>
                  ))}
                  <tr className={darkMode ? 'bg-gray-900/30' : 'bg-gray-50'}>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      ${reportData.categories.reduce((sum, category) => sum + category.amount, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
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
          {reportData.categories.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
                <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mayor Gasto</h4>
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{reportData.categories[0].category}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{reportData.categories[0].percentage}% del total</p>
                  </div>
                  <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>${reportData.categories[0].amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              
              <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
                <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Comparación con Mes Anterior</h4>
                <div className="flex justify-between items-center">
                  <p className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium`}>Total de Gastos</p>
                  <div className="flex items-center">
                    <p className={`font-medium mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{reportData.summary.trends.expensesChange}%</p>
                    <span className={reportData.summary.trends.expensesChange <= 0 ? "text-green-500" : "text-red-500"}>
                      {reportData.summary.trends.expensesChange <= 0 ? 
                        <MdArrowDownward className="h-5 w-5" /> : 
                        <MdArrowUpward className="h-5 w-5" />}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{reportData.summary.trends.incomeChange}%</p>
                <span className={`text-xs ${reportData.summary.trends.incomeChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                  {reportData.summary.trends.incomeChange >= 0 ? <MdArrowUpward className="mr-0.5" /> : <MdArrowDownward className="mr-0.5" />}
                  {reportData.summary.trends.incomeChange >= 0 ? 'Creciente' : 'Decreciente'}
                </span>
              </div>
            </div>
            
            <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
              <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tendencia de Gastos</p>
              <div className="flex justify-between items-end">
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{reportData.summary.trends.expensesChange}%</p>
                <span className={`text-xs ${reportData.summary.trends.expensesChange <= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                  {reportData.summary.trends.expensesChange >= 0 ? <MdArrowUpward className="mr-0.5" /> : <MdArrowDownward className="mr-0.5" />}
                  {reportData.summary.trends.expensesChange <= 0 ? 'Decreciente' : 'Creciente'}
                </span>
              </div>
            </div>
            
            <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
              <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ratio Ahorro/Ingreso</p>
              <div className="flex justify-between items-end">
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {reportData.summary.income > 0 ? ((reportData.summary.savings / reportData.summary.income) * 100).toFixed(1) : 0}%
                </p>
                <span className={`text-xs ${reportData.summary.trends.savingsChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                  {reportData.summary.trends.savingsChange >= 0 ? <MdArrowUpward className="mr-0.5" /> : <MdArrowDownward className="mr-0.5" />}
                  {reportData.summary.trends.savingsChange >= 25 ? 'Óptimo' : reportData.summary.trends.savingsChange >= 0 ? 'Adecuado' : 'Bajo'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Tabla de datos de tendencias */}
          {reportData.trends.months.length > 0 && (
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
                  {reportData.trends.months.map((month, index) => (
                    <tr key={index}>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{month}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>${reportData.trends.savings[index].toLocaleString('es-ES')}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>${reportData.trends.netWorth[index].toLocaleString('es-ES')}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${
                        index > 0 && reportData.trends.netWorth[index] > reportData.trends.netWorth[index-1]
                          ? darkMode ? 'text-green-400' : 'text-green-600'
                          : darkMode ? 'text-red-400' : 'text-red-600'
                      }`}>
                        {index > 0 
                          ? `${((reportData.trends.netWorth[index] - reportData.trends.netWorth[index-1]) / Math.abs(reportData.trends.netWorth[index-1]) * 100).toFixed(1)}%`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

  // Datos de ejemplo para el informe
  const reportData = {
    summary: {
      income: 8500.35,
      expenses: 5320.50,
      savings: 3179.85,
      balance: 12750.22,
      trends: {
        incomeChange: 12.5,
        expensesChange: -3.2,
        savingsChange: 8.7
      }
    },
    incomeVsExpense: [
      { month: 'Enero', income: 7500, expenses: 4800 },
      { month: 'Febrero', income: 7800, expenses: 5100 },
      { month: 'Marzo', income: 8200, expenses: 5200 },
      { month: 'Abril', income: 8500, expenses: 5320 },
    ],
    categories: [
      { category: 'Alimentación', amount: 1250.30, percentage: 23.5 },
      { category: 'Vivienda', amount: 1800.00, percentage: 33.8 },
      { category: 'Transporte', amount: 580.20, percentage: 10.9 },
      { category: 'Entretenimiento', amount: 420.50, percentage: 7.9 },
      { category: 'Salud', amount: 350.00, percentage: 6.6 },
      { category: 'Servicios', amount: 620.00, percentage: 11.7 },
      { category: 'Otros', amount: 299.50, percentage: 5.6 },
    ],
    trends: {
      months: ['Ene', 'Feb', 'Mar', 'Abr'],
      savings: [1500, 1700, 2200, 3179.85],
      netWorth: [9800, 10500, 11800, 12750.22]
    }
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
        <ReportContent reportType={reportType} timeRange={timeRange} darkMode={darkMode} reportData={reportData} getTimeRangeText={getTimeRangeText} />
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

