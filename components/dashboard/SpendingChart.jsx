import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const SpendingChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && data) {
      // Destruir el gráfico anterior si existe
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Crear nuevo gráfico
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
                }
              }
            },
            tooltip: {
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
  }, [data]);

  // Calcular el total de gastos
  const totalSpending = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="relative h-64">
      <canvas ref={chartRef} className="w-full h-full"></canvas>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-sm text-gray-500">Total</p>
        <p className="text-xl font-bold text-gray-900">${totalSpending.toLocaleString('es-ES')}</p>
      </div>
    </div>
  );
};

export default SpendingChart;
