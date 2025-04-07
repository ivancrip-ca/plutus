import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useTheme } from '../../app/contexts/ThemeContext';

const SpendingChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (chartRef.current && data && mounted) {
      // Destruir el gráfico anterior si existe
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Crear nuevo gráfico con colores adaptados al modo oscuro
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.map(item => item.category),
          datasets: [
            {
              data: data.map(item => item.amount),
              backgroundColor: data.map(item => item.color),
              borderWidth: 0,
              hoverOffset: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                boxWidth: 8,
                font: {
                  size: 10
                },
                color: darkMode ? '#e5e7eb' : '#4b5563' // Texto gris claro en modo oscuro
              }
            },
            tooltip: {
              backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              titleColor: darkMode ? '#e5e7eb' : '#1f2937',
              bodyColor: darkMode ? '#e5e7eb' : '#4b5563',
              borderColor: darkMode ? 'rgba(71, 85, 105, 0.2)' : 'rgba(203, 213, 225, 0.8)',
              borderWidth: 1,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: $${value.toLocaleString('es-ES')} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '70%'
        }
      });

      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }
  }, [data, darkMode, mounted]);

  // Calcular el total de gastos
  const totalSpending = data.reduce((sum, item) => sum + item.amount, 0);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>;
  }

  return (
    <div className="relative h-64">
      <canvas ref={chartRef} className="w-full h-full"></canvas>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
        <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ${totalSpending.toLocaleString('es-ES')}
        </p>
      </div>
    </div>
  );
};

export default SpendingChart;
