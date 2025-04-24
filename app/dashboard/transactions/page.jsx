'use client';

import { useState, useEffect, useRef } from 'react';
import { format, parseISO, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';

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

const TransactionItem = ({ transaccion, onEdit, onDelete, onDuplicate, selectionMode, selectedTransactions, setSelectedTransactions }) => {
  const { darkMode } = useTheme();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  
  // Manejar clics fuera del menú
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);
  
  return (
    <div className={`flex flex-wrap md:flex-nowrap items-center p-4 ${
      darkMode 
        ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' 
        : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
    } transition rounded-lg border`}>
      {selectionMode && (
        <input
          type="checkbox"
          className="mr-4"
          checked={selectedTransactions[transaccion.id] || false}
          onChange={() => {
            setSelectedTransactions(prev => ({
              ...prev,
              [transaccion.id]: !prev[transaccion.id]
            }));
          }}
        />
      )}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
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
      {!selectionMode && (
        <div className="w-full md:w-auto ml-auto mt-2 md:mt-0 md:ml-4 relative" ref={menuRef}>
          <button 
            className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
            onClick={() => setOpenMenu(!openMenu)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
          
          {openMenu && (
            <div 
              className={`absolute z-20 mt-2 w-48 rounded-md shadow-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border`}
              style={{ 
                animation: 'dropdown-in 0.3s ease-out forwards',
                top: '100%',
                right: 0
              }}
            >
              <div className="py-1">
                <button 
                  className={`block w-full text-left px-4 py-2 text-sm cursor-pointer ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                  onClick={() => {
                    setOpenMenu(false);
                    onEdit(transaccion);
                  }}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar transacción
                  </div>
                </button>
                
                <button 
                  className={`block w-full text-left px-4 py-2 text-sm cursor-pointer ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                  onClick={() => {
                    setOpenMenu(false);
                    onDuplicate(transaccion);
                  }}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicar
                  </div>
                </button>
                
                <button 
                  className={`block w-full text-left px-4 py-2 text-sm cursor-pointer ${darkMode ? 'text-red-300 hover:bg-red-900 hover:bg-opacity-30' : 'text-red-600 hover:bg-red-50'} transition-colors`}
                  onClick={() => {
                    setOpenMenu(false);
                    onDelete(transaccion);
                  }}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const FilterButton = ({ active, children, onClick }) => {
  const { darkMode } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
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

// Función para imprimir transacciones
const printTransactions = (filter, searchTerm, filteredTransactions, totalIngresos, totalGastos, balance, setError) => {
  try {
    // Crear un estilo para la impresión con diseño similar al usado en reportes
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
        
        .print-logo span {
          font-size: 28px;
        }
        
        .print-meta {
          margin: 20px 0;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #555;
        }
        
        .print-filters {
          margin: 15px 0;
          padding: 10px;
          background-color: #f7f9fc;
          border-radius: 5px;
          font-size: 13px;
        }
        
        .print-summary {
          margin: 20px 0;
          padding: 15px;
          background-color: #f7f9fc;
          border-radius: 5px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        
        .summary-item {
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        
        .summary-label {
          font-size: 12px;
          color: #555;
          margin-bottom: 5px;
        }
        
        .summary-value {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
        
        .income-value {
          color: #059669;
        }
        
        .expense-value {
          color: #dc2626;
        }
        
        .balance-value {
          color: #2563eb;
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
        
        .transaction-ingreso {
          color: #059669;
        }
        
        .transaction-gasto {
          color: #dc2626;
        }
      }
    `;
    
    // Formatear fecha en español
    const formatFecha = (fecha) => {
      try {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
      } catch (error) {
        return fecha;
      }
    };
    
    // Función para formatear montos
    const formatMonto = (monto) => {
      return parseFloat(monto).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };
    
    // Formatear la fecha actual
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Obtener el texto del filtro aplicado
    const getFilterText = () => {
      switch (filter) {
        case 'all':
          return 'Todas las transacciones';
        case 'ingresos':
          return 'Solo ingresos';
        case 'gastos':
          return 'Solo gastos';
        default:
          return 'Todas las transacciones';
      }
    };
    
    // Crear contenido para imprimir
    const printContent = `
      <html>
        <head>
          <title>Transacciones - Plutus</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-logo">
              <span style="font-weight: bold; color: #0891b2;">Plutus</span>
              <span style="color: #64748b;"> | Finanzas</span>
            </div>
            
            <div class="print-header">
              <h1>Reporte de Transacciones</h1>
              <p>Plutus - Gestión Financiera Personal</p>
            </div>
            
            <div class="print-meta">
              <div>
                <strong>Fecha de generación:</strong> ${formattedDate}
              </div>
              <div>
                <strong>Ref:</strong> TRX-${Math.floor(Math.random()*10000).toString().padStart(4, '0')}
              </div>
            </div>
            
            <div class="print-filters">
              <strong>Filtros aplicados:</strong> ${getFilterText()}
              ${searchTerm ? ` | Búsqueda: "${searchTerm}"` : ''}
            </div>
            
            <div class="print-summary">
              <div class="summary-item">
                <div class="summary-label">Ingresos totales</div>
                <div class="summary-value income-value">$${formatMonto(totalIngresos)}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Gastos totales</div>
                <div class="summary-value expense-value">$${formatMonto(totalGastos)}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Balance</div>
                <div class="summary-value balance-value">$${formatMonto(balance)}</div>
              </div>
            </div>
            
            <h2 style="font-size: 16px; color: #334155; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #e2e8f0;">Detalle de Transacciones</h2>
            
            <table class="print-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Cuenta</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransactions.map(tx => `
                  <tr>
                    <td>${formatFecha(tx.fecha)}</td>
                    <td>${tx.descripcion}</td>
                    <td>${tx.categoria}</td>
                    <td>${tx.cuenta}${tx.institution ? ` - ${tx.institution}` : ''}</td>
                    <td class="transaction-${tx.tipo}">${tx.tipo === 'ingreso' ? '+' : '-'}$${formatMonto(tx.monto)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background-color: #f1f5f9; font-weight: bold;">
                  <td colspan="4" style="text-align: right;">Total:</td>
                  <td class="balance-value">$${formatMonto(balance)}</td>
                </tr>
              </tfoot>
            </table>
            
            <div style="margin-top: 30px; padding: 15px; background-color: #f0f9ff; border-radius: 5px; border-left: 4px solid #0ea5e9;">
              <h3 style="margin-top: 0; font-size: 14px; color: #0c4a6e;">Notas</h3>
              <ul style="margin: 10px 0; padding-left: 20px; font-size: 12px; color: #334155;">
                <li>Este reporte ha sido generado automáticamente por Plutus.</li>
                <li>Las cantidades negativas representan gastos y las positivas ingresos.</li>
                <li>Para un análisis más detallado, consulta la aplicación web de Plutus.</li>
              </ul>
            </div>
            
            <div class="print-footer">
              <p>Generado por Plutus | Gestión de Finanzas Personales | ${formattedDate}</p>
              <p>© ${currentDate.getFullYear()} Plutus. Todos los derechos reservados.</p>
            </div>
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
      
      // Cerrar la ventana automáticamente después de imprimir o cuando se cancela
      printWindow.onafterprint = function() {
        printWindow.close();
      };
      
      // También cerrar la ventana si el usuario cancela la impresión
      // Esto detecta cuando el diálogo de impresión se cierra sin imprimir
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.close();
        }
      }, 1000);
    };
  } catch (error) {
    console.error('Error al imprimir las transacciones:', error);
    setError("No se pudieron imprimir las transacciones");
    setTimeout(() => setError(""), 3000);
  }
};

// Función para exportar transacciones a PDF con diseño profesional
const exportTransactionsToPDF = () => {
  try {
    // Importar dinámicamente para evitar problemas con SSR
    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(({ default: autoTable }) => {
        // Filtrar las transacciones según los filtros actuales
        const dataToExport = filteredTransactions;

        if (dataToExport.length === 0) {
          setSuccessMessage("No hay transacciones para exportar con los filtros actuales");
          setTimeout(() => setSuccessMessage(""), 3000);
          return;
        }

        // Crear un nuevo documento PDF
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        // Añadir encabezado con logo
        const addHeader = () => {
          // Dibujar un rectángulo de color para el encabezado
          doc.setFillColor(darkMode ? 32 : 59, darkMode ? 44 : 130, darkMode ? 55 : 246);
          doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');

          // Añadir título del documento
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(22);
          doc.setTextColor(255, 255, 255);
          doc.text('Reporte de Transacciones', 14, 15);

          // Añadir logo (representado como un círculo)
          doc.setFillColor(255, 255, 255);
          doc.circle(doc.internal.pageSize.width - 15, 12, 8, 'F');

          // Dibujar un icono de moneda dentro del círculo
          doc.setFillColor(darkMode ? 32 : 59, darkMode ? 44 : 130, darkMode ? 55 : 246);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(darkMode ? 32 : 59, darkMode ? 44 : 130, darkMode ? 55 : 246);
          doc.text('P', doc.internal.pageSize.width - 15, 15, { align: 'center' });

          // Resetear estilo de texto
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
        };

        // Añadir pie de página con número de página
        const addFooter = () => {
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Añadir línea divisoria
            doc.setDrawColor(200, 200, 200);
            doc.line(14, doc.internal.pageSize.height - 20, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 20);

            // Añadir texto del pie de página
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generado el ${new Date().toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}`, 14, doc.internal.pageSize.height - 15);

            // Añadir número de página
            doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 15);
          }
        };

        // Aplicar el encabezado
        addHeader();

        // Meta-información para el PDF
        doc.setProperties({
          title: 'Reporte de Transacciones',
          subject: 'Historial de transacciones financieras',
          author: 'Plutus',
          keywords: 'finanzas, transacciones, reporte',
          creator: 'Plutus App'
        });

        // Añadir fecha de generación y periodo
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`, 14, 30);

        // Añadir filtros aplicados
        doc.text(`Filtro aplicado: ${filter === 'all' ? 'Todas las transacciones' : filter === 'ingresos' ? 'Solo ingresos' : 'Solo gastos'}`, 14, 35);
        if (searchTerm) {
          doc.text(`Término de búsqueda: "${searchTerm}"`, 14, 40);
        }

        // Añadir resumen financiero
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, 45, doc.internal.pageSize.width - 28, 35, 3, 3, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        doc.text('Resumen Financiero', 20, 55);

        // Crear gráfico visual de la distribución
        const barWidth = 120;
        const barHeight = 8;
        const barX = 20;
        const barY = 70;

        // Total para calcular porcentajes
        const total = totalIngresos + totalGastos;

        // Fondo del gráfico
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');

        // Barra de ingresos
        if (total > 0) {
          const ingresoWidth = (totalIngresos / total) * barWidth;
          doc.setFillColor(39, 174, 96); // Verde
          doc.roundedRect(barX, barY, ingresoWidth, barHeight, 2, 2, 'F');

          // Barra de gastos
          const gastoWidth = (totalGastos / total) * barWidth;
          doc.setFillColor(231, 76, 60); // Rojo
          doc.roundedRect(barX + ingresoWidth, barY, gastoWidth, barHeight, 2, 2, 'F');
        }

        // Leyenda
        doc.setFillColor(39, 174, 96);
        doc.rect(barX + barWidth + 10, barY - 3, 5, 5, 'F');
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Ingresos: $${totalIngresos.toLocaleString()}`, barX + barWidth + 20, barY);

        doc.setFillColor(231, 76, 60);
        doc.rect(barX + barWidth + 10, barY + 7, 5, 5, 'F');
        doc.text(`Gastos: $${totalGastos.toLocaleString()}`, barX + barWidth + 20, barY + 10);

        doc.setFont('helvetica', 'bold');
        doc.text(`Balance: $${Math.abs(balance).toLocaleString()}`, barX, barY + 20);

        // Información adicional sobre el periodo 
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 90, doc.internal.pageSize.width - 14, 90);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);

        const hoy = new Date();
        const fechaInicio = new Date(hoy);
        fechaInicio.setMonth(hoy.getMonth() - 1);

        doc.text(`Periodo analizado: del ${fechaInicio.toLocaleDateString('es-ES')} al ${hoy.toLocaleDateString('es-ES')}`, 14, 96);

        // Tabla de transacciones
        const tableColumn = [
          "Fecha", 
          "Descripción", 
          "Categoría", 
          "Cuenta", 
          "Monto"
        ];

        const tableRows = [];

        // Convertir datos para la tabla - usamos el mismo formato que en printTransactions
        dataToExport.forEach(transaction => {
          const formattedDate = new Date(transaction.fecha).toLocaleDateString('es-ES');
          const formattedAmount = `${transaction.tipo === 'ingreso' ? '+' : '-'}$${transaction.monto.toLocaleString()}`;

          // Aplicar el mismo formato que en printTransactions para la cuenta
          const accountDisplay = transaction.institution 
            ? `${transaction.cuenta} - ${transaction.institution}`
            : transaction.cuenta;
            
          const transactionData = [
            formattedDate,
            transaction.descripcion,
            transaction.categoria || '—',
            accountDisplay,
            formattedAmount
          ];
          tableRows.push(transactionData);
        });

        // Añadir la tabla al documento
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 105,
          theme: 'grid',
          headStyles: {
            fillColor: darkMode ? [50, 55, 65] : [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          bodyStyles: {
            fontSize: 9,
            cellPadding: 4,
          },
          columnStyles: {
            0: {cellWidth: 25, halign: 'center'}, // Fecha
            1: {cellWidth: 45}, // Descripción
            2: {cellWidth: 25}, // Categoría
            3: {cellWidth: 40}, // Cuenta
            4: {cellWidth: 25, halign: 'right'} // Monto
          },
          didDrawCell: (data) => {
            // Colorear los montos según sea ingreso o gasto
            if (data.section === 'body' && data.column.index === 4) {
              const montoStr = data.cell.raw;
              if (montoStr.startsWith('+')) {
                doc.setTextColor(39, 174, 96); // Verde para ingresos
              } else {
                doc.setTextColor(231, 76, 60); // Rojo para gastos
              }
              return true; // Permitir que se dibuje el texto automáticamente
            }
            
            return true; // Permitir que se dibuje el texto automáticamente para otras celdas
          },
          didDrawPage: function (data) {
            // Añadir encabezado en cada página excepto la primera
            if (data.pageNumber > 1) {
              addHeader();
            }
          }
        });

        // Añadir pie de página
        addFooter();

        // Guardar el PDF
        doc.save(`Plutus_Reporte_Transacciones_${new Date().toISOString().split('T')[0]}.pdf`);

        setSuccessMessage("Reporte PDF generado correctamente");
        setTimeout(() => setSuccessMessage(""), 3000);
      });
    });
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    setError("No se pudo generar el PDF. Inténtalo de nuevo.");
    setTimeout(() => setError(""), 3000);
  }
};

export default function TransactionsPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;
  const { darkMode } = useTheme();
  const { currentUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('ingreso');
  const [userAccounts, setUserAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [transactions, setTransactions] = useState(transaccionesEjemplo);
  const [openOptionsMenu, setOpenOptionsMenu] = useState(false);
  const optionsMenuRef = useRef(null);
  
  // Estados para los modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const deleteModalRef = useRef(null);
  const editModalRef = useRef(null);

  // Estados para selección múltiple
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState({});
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false);
  const deleteMultipleModalRef = useRef(null);

  // Función para eliminar múltiples transacciones
  const deleteMultipleTransactions = async () => {
    try {
      setLoading(true);
      
      const selectedIds = Object.keys(selectedTransactions).filter(id => selectedTransactions[id]);
      
      if (selectedIds.length === 0) {
        setError("No hay transacciones seleccionadas para eliminar");
        setTimeout(() => setError(""), 3000);
        return;
      }
      
      // Por cada transacción seleccionada...
      for (const transactionId of selectedIds) {
        const transaction = transactions.find(t => t.id === transactionId);
        
        if (transaction) {
          // Actualizar el saldo de la cuenta solo si hay una cuentaId válida
          if (transaction.cuentaId) {
            const accountRef = doc(db, 'accounts', transaction.cuentaId);
            const accountSnap = await getDoc(accountRef);
            
            if (accountSnap.exists()) {
              const accountData = accountSnap.data();
              const newBalance = transaction.tipo === 'ingreso'
                ? accountData.balance - transaction.monto
                : accountData.balance + transaction.monto;
              
              await updateDoc(accountRef, {
                balance: newBalance,
                updatedAt: new Date().toISOString()
              });
            }
          } else {
            console.log(`La transacción ${transactionId} no tiene una cuenta asociada o es efectivo.`);
          }
          
          // Eliminar la transacción
          await deleteDoc(doc(db, 'transactions', transactionId));
        }
      }
      
      // Actualizar la interfaz
      await fetchUserAccounts();
      await fetchTransactions();
      
      // Mostrar mensaje de éxito
      setSuccessMessage(`${selectedIds.length} transacciones eliminadas correctamente`);
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Cerrar modal y resetear estado
      setShowDeleteMultipleModal(false);
      setSelectedTransactions({});
      setSelectionMode(false);
    } catch (error) {
      console.error('Error al eliminar múltiples transacciones:', error);
      setError("No se pudieron eliminar las transacciones seleccionadas");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Función para activar/desactivar el modo de selección multiple
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedTransactions({});
    
    if (!selectionMode) {
      setSuccessMessage("Modo selección activado: selecciona las transacciones que deseas eliminar");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Función para seleccionar/deseleccionar todas las transacciones
  const toggleSelectAll = () => {
    if (Object.keys(selectedTransactions).length === currentTransactions.length) {
      // Si todas están seleccionadas, deseleccionar todas
      setSelectedTransactions({});
    } else {
      // Seleccionar todas
      const allSelected = {};
      currentTransactions.forEach(transaction => {
        allSelected[transaction.id] = true;
      });
      setSelectedTransactions(allSelected);
    }
  };

  // Función para exportar transacciones a CSV
  const exportTransactionsToCSV = () => {
  try {
    // Filtrar las transacciones según los filtros actuales
    const dataToExport = filteredTransactions;
    
    if (dataToExport.length === 0) {
      setSuccessMessage("No hay transacciones para exportar con los filtros actuales");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    
    // Definir las columnas del CSV
    const headers = [
      'Descripción',
      'Categoría',
      'Monto',
      'Tipo',
      'Fecha',
      'Cuenta'
    ];
    
    // Convertir los datos a formato CSV
    const csvContent = [
      headers.join(','), // Encabezados
      ...dataToExport.map(transaction => [
        // Escapar comas y comillas en los campos de texto
        `"${transaction.descripcion.replace(/"/g, '""')}"`,
        `"${transaction.categoria ? transaction.categoria.replace(/"/g, '""') : ''}"`,
        transaction.monto,
        transaction.tipo,
        new Date(transaction.fecha).toLocaleDateString('es-ES'),
        `"${transaction.cuenta.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    
    // Crear un blob con los datos
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Crear un link para descargar el archivo
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Configurar el link
    link.setAttribute('href', url);
    link.setAttribute('download', `plutus_transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    
    // Añadir el link al documento, hacer clic y eliminarlo
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccessMessage("Transacciones exportadas a CSV correctamente");
    setTimeout(() => setSuccessMessage(""), 3000);
  } catch (error) {
    console.error('Error al exportar las transacciones a CSV:', error);
    setError("No se pudieron exportar las transacciones a CSV");
    setTimeout(() => setError(""), 3000);
  }
};

  // Función para abrir el modal de edición
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditingTransaction(true);
  };

  // Función para duplicar una transacción
  const handleDuplicateTransaction = (transaction) => {
    // Crear una copia de la transacción
    const duplicatedTransaction = {
      ...transaction,
      fecha: new Date().toISOString(), // Actualizar la fecha a hoy
      createdAt: new Date().toISOString(),
      id: null // Eliminar el ID para que se genere uno nuevo al guardar
    };
    
    // Configurar el modal con los datos duplicados
    setTransactionType(duplicatedTransaction.tipo);
    setIsModalOpen(true);
    
    // Esperar a que el modal se cargue completamente
    setTimeout(() => {
      // Rellenar los campos del formulario con los datos duplicados
      const descripcionInput = document.getElementById('descripcion');
      const categoriaInput = document.getElementById('categoria');
      const montoInput = document.getElementById('monto');
      const fechaInput = document.getElementById('fecha');
      const cuentaInput = document.getElementById('cuenta');
      
      if (descripcionInput) descripcionInput.value = duplicatedTransaction.descripcion;
      if (categoriaInput) categoriaInput.value = duplicatedTransaction.categoria || '';
      if (montoInput) montoInput.value = duplicatedTransaction.monto;
      if (fechaInput) fechaInput.value = new Date().toISOString().split('T')[0]; // Fecha actual
      if (cuentaInput) cuentaInput.value = duplicatedTransaction.cuentaId || '';
      
      // Mostrar mensaje
      setSuccessMessage("Transacción duplicada. Modifica los datos si es necesario y haz clic en Guardar.");
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 100);
  };

  // Función para mostrar el modal de eliminación
  const showDeleteConfirmation = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  // Función para guardar los cambios de una transacción editada
  const handleSaveEditedTransaction = async () => {
    try {
      if (!editingTransaction || !currentUser) return;
      
      setLoading(true);
      setError('');
      
      // Obtener los valores actualizados de los campos
      const descripcionInput = document.getElementById('edit-descripcion');
      const categoriaInput = document.getElementById('edit-categoria');
      const montoInput = document.getElementById('edit-monto');
      const fechaInput = document.getElementById('edit-fecha');
      const cuentaInput = document.getElementById('edit-cuenta');
      
      // Validar campos obligatorios
      if (!descripcionInput.value || !montoInput.value || !fechaInput.value || !cuentaInput.value) {
        setError('Por favor completa todos los campos obligatorios');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      // Encontrar la cuenta seleccionada
      const cuentaSeleccionada = userAccounts.find(account => account.id === cuentaInput.value);
      if (!cuentaSeleccionada) {
        setError('Por favor selecciona una cuenta válida');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      const monto = parseFloat(montoInput.value);
      
      // Si cambia la cuenta o el monto, actualizar los saldos correspondientes
      if (editingTransaction.cuentaId !== cuentaInput.value || editingTransaction.monto !== monto) {
        // Revertir la transacción original
        const cuentaOriginal = userAccounts.find(account => account.id === editingTransaction.cuentaId);
        if (cuentaOriginal) {
          const saldoOriginalActualizado = editingTransaction.tipo === 'ingreso'
            ? cuentaOriginal.balance - editingTransaction.monto
            : cuentaOriginal.balance + editingTransaction.monto;
          
          await updateDoc(doc(db, 'accounts', cuentaOriginal.id), {
            balance: saldoOriginalActualizado,
            updatedAt: new Date().toISOString()
          });
        }
        
        // Aplicar nueva transacción a la cuenta seleccionada
        const nuevoSaldo = editingTransaction.tipo === 'ingreso'
          ? cuentaSeleccionada.balance + monto
          : cuentaSeleccionada.balance - monto;
        
        await updateDoc(doc(db, 'accounts', cuentaSeleccionada.id), {
          balance: nuevoSaldo,
          updatedAt: new Date().toISOString()
        });
      }
      
      // Crear objeto con los datos actualizados
      const updatedTransaction = {
        descripcion: descripcionInput.value,
        categoria: categoriaInput.value,
        monto: monto,
        fecha: new Date(fechaInput.value).toISOString(),
        cuenta: cuentaSeleccionada.name,
        cuentaId: cuentaSeleccionada.id,
        updatedAt: new Date().toISOString()
      };
      
      // Actualizar en Firestore
      await updateDoc(doc(db, 'transactions', editingTransaction.id), updatedTransaction);
      
      // Refrescar los datos
      await fetchUserAccounts();
      await fetchTransactions();
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Transacción actualizada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Cerrar el modal
      setIsEditingTransaction(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error al actualizar la transacción:', error);
      setError('No se pudo actualizar la transacción. Inténtalo de nuevo.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para eliminar una transacción
  const handleDeleteTransaction = async () => {
    if (!transactionToDelete || !currentUser) return;
    
    try {
      setLoading(true);
      
      // Actualizar el saldo de la cuenta solo si la transacción tiene una cuenta asociada
      if (transactionToDelete.cuentaId) {
        const accountRef = doc(db, 'accounts', transactionToDelete.cuentaId);
        const accountSnap = await getDoc(accountRef);
        
        if (accountSnap.exists()) {
          const accountData = accountSnap.data();
          const newBalance = transactionToDelete.tipo === 'ingreso'
            ? accountData.balance - transactionToDelete.monto
            : accountData.balance + transactionToDelete.monto;
          
          await updateDoc(accountRef, {
            balance: newBalance,
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        console.log('Transacción de efectivo eliminada - no hay cuenta que actualizar');
      }
      
      // Eliminar la transacción
      await deleteDoc(doc(db, 'transactions', transactionToDelete.id));
      
      // Actualizar los datos
      await fetchUserAccounts();
      await fetchTransactions();
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Transacción eliminada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Cerrar modal de confirmación
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error al eliminar la transacción:', error);
      setError('No se pudo eliminar la transacción. Inténtalo de nuevo.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Referencia para el contenido del modal
  const modalContentRef = useRef(null);

  // Función para manejar clics fuera del modal
  const handleModalBackdropClick = (event) => {
    if (modalContentRef.current && !modalContentRef.current.contains(event.target)) {
      setIsModalOpen(false);
    }
  };

  // Función para manejar clics fuera del menú de opciones
  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setOpenOptionsMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [optionsMenuRef]);
  
  // Efecto para detectar parámetros URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const newTransactionParam = params.get('newTransaction');
      
      if (newTransactionParam === 'efectivo') {
        // Abrir modal de nueva transacción con cuenta efectivo preseleccionada
        setIsModalOpen(true);
        setTransactionType('gasto'); // Preseleccionar tipo gasto por defecto
        
        // Esperar a que el modal se cargue completamente
        setTimeout(() => {
          const cuentaInput = document.getElementById('cuenta');
          if (cuentaInput) {
            // Buscar la cuenta de efectivo en las cuentas del usuario
            const efectivoCuenta = userAccounts.find(account => 
              account.name.toLowerCase() === 'efectivo' || 
              account.type === 'efectivo'
            );
            
            if (efectivoCuenta) {
              cuentaInput.value = efectivoCuenta.id;
            } else {
              // Si no hay una cuenta de efectivo específica, usar "efectivo"
              cuentaInput.value = 'efectivo';
            }
          }
          
          // También establecer la fecha automáticamente
          const fechaInput = document.getElementById('fecha');
          if (fechaInput) {
            fechaInput.value = new Date().toISOString().split('T')[0];
          }
        }, 300);
        
        // Limpiar los parámetros de la URL para evitar que se abra el modal nuevamente si se recarga la página
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [userAccounts]);

  // Asegurar que el componente está montado antes de renderizar elementos dependientes del tema
  useEffect(() => {
    setMounted(true);
    if (currentUser) {
      fetchUserAccounts();
      fetchTransactions();
    }
  }, [currentUser]);

  // Función para obtener todas las cuentas del usuario
  const fetchUserAccounts = async () => {
    try {
      if (!currentUser) return;
      
      const accountsQuery = query(
        collection(db, 'accounts'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(accountsQuery);
      const userAccountsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUserAccounts(userAccountsData);
    } catch (error) {
      console.error('Error al obtener las cuentas del usuario:', error);
    }
  };

  // Función para obtener todas las transacciones del usuario
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      if (!currentUser) return;
      
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(transactionsQuery);
      const userTransactionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (userTransactionsData.length > 0) {
        // Ordenar transacciones por fecha (más recientes primero)
        const sortedTransactions = userTransactionsData.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        setTransactions(sortedTransactions);
        // Resetear a la primera página cuando cambian las transacciones
        setCurrentPage(1);
      } else {
        // Si no hay transacciones del usuario, usar array vacío en lugar de datos de ejemplo
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error al obtener las transacciones:', error);
      setError('No se pudieron cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar una nueva transacción
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      if (!currentUser) {
        setError('Debes iniciar sesión para registrar una transacción');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      // Obtener valores del formulario
      const descripcionInput = document.getElementById('descripcion');
      const categoriaInput = document.getElementById('categoria');
      const montoInput = document.getElementById('monto');
      const fechaInput = document.getElementById('fecha');
      const cuentaInput = document.getElementById('cuenta');
      
      // Validar campos obligatorios
      if (!descripcionInput.value || !montoInput.value || !fechaInput.value || !cuentaInput.value) {
        setError('Por favor completa todos los campos obligatorios');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      // Encontrar la cuenta seleccionada
      const cuentaSeleccionada = userAccounts.find(account => account.id === cuentaInput.value);
      if (!cuentaSeleccionada && cuentaInput.value !== 'efectivo') {
        setError('Por favor selecciona una cuenta válida');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      // Validar que hay fondos suficientes para gastos
      const monto = parseFloat(montoInput.value);
      if (transactionType === 'gasto' && cuentaInput.value !== 'efectivo' && monto > cuentaSeleccionada.balance) {
        setError(`Fondos insuficientes en ${cuentaSeleccionada.name}. El saldo actual es $${cuentaSeleccionada.balance.toLocaleString()}`);
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      // Crear objeto con los datos de la transacción
      const newTransaction = {
        descripcion: descripcionInput.value,
        categoria: categoriaInput.value,
        monto: monto,
        tipo: transactionType,
        fecha: new Date(fechaInput.value).toISOString(),
        cuenta: cuentaInput.value === 'efectivo' ? 'Efectivo' : cuentaSeleccionada.name,
        numero: cuentaSeleccionada?.number || '',
        cuentaId: cuentaInput.value === 'efectivo' ? null : cuentaSeleccionada.id,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      };
      
      // Guardar la transacción en Firestore
      const docRef = await addDoc(collection(db, 'transactions'), newTransaction);
      
      // Actualizar saldo de la cuenta
      if (cuentaInput.value !== 'efectivo') {
        const nuevaSaldo = transactionType === 'ingreso' 
          ? cuentaSeleccionada.balance + monto
          : cuentaSeleccionada.balance - monto;
        
        await updateDoc(doc(db, 'accounts', cuentaSeleccionada.id), {
          balance: nuevaSaldo,
          updatedAt: new Date().toISOString()
        });
      }
      
      // Refrescar datos
      await fetchUserAccounts();
      await fetchTransactions();
      
      // Mensaje de éxito y cerrar modal
      setSuccessMessage('Transacción registrada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsModalOpen(false);
      
      // Limpiar formulario
      descripcionInput.value = '';
      categoriaInput.value = '';
      montoInput.value = '';
      fechaInput.value = '';
    } catch (error) {
      console.error('Error al registrar la transacción:', error);
      setError('No se pudo registrar la transacción. Inténtalo de nuevo.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

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
  const totalIngresos = transactions
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0);
  
  const totalGastos = transactions
    .filter(t => t.tipo === 'gasto')
    .reduce((sum, t) => sum + t.monto, 0);
  
  const balance = totalIngresos - totalGastos;

  // Filtrar transacciones
  const filteredTransactions = transactions
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

  // Categorías de ejemplo
  const categoriasIngresos = ['Salario', 'Freelance', 'Inversiones', 'Regalo', 'Reembolso', 'Otros'];
  const categoriasGastos = ['Alimentación', 'Vivienda', 'Transporte', 'Ocio', 'Salud', 'Educación', 'Compras', 'Facturas', 'Otros'];

  return (
    <div className={`container mx-auto min-h-screen px-4 py-8 ${darkMode ? 'bg-gray-900 text-white' : ''}`}>
      {/* Mensaje de éxito (solo este, quitamos el de error) */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Transacciones</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona y visualiza tus movimientos financieros
            </p>
          </div>  
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button 
          className={`cursor-pointer ${darkMode ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'} px-4 py-2 rounded-lg border flex items-center gap-1`}
          onClick={() => setIsModalOpen(true)}
            >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nueva transacción
            </button>
            <div className="relative" ref={optionsMenuRef}>
          <button 
            className={`p-3 cursor-pointer ${darkMode ? 'text-gray-300 bg-gray-800 hover:bg-gray-700' : 'text-gray-600 bg-gray-200 hover:bg-gray-300'} rounded-lg transition-colors`}
            onClick={() => setOpenOptionsMenu(!openOptionsMenu)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          {openOptionsMenu && (
            <div 
              className={`absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border`}
              style={{ 
            animation: 'dropdown-in 0.3s ease-out forwards',
            top: '100%',
            right: 0
              }}
            >
              <div className="py-1">
            <button 
              className={`cursor-pointer block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
              onClick={() => {
                      setOpenOptionsMenu(false);
                      exportTransactionsToCSV();
                    }}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Exportar a CSV
                    </div>
                  </button>
                  <button 
                    className={`cursor-pointer block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                    onClick={() => {
                      setOpenOptionsMenu(false);
                      exportTransactionsToPDF();
                    }}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-1 1v3M4 7h16" />
                      </svg>
                      Exportar a PDF
                    </div>
                  </button>
                  <button 
                    className={`cursor-pointer block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                    onClick={() => {
                      setOpenOptionsMenu(false);
                      printTransactions(filter, searchTerm, filteredTransactions, totalIngresos, totalGastos, balance, setError);
                    }}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                      Imprimir
                    </div>
                  </button>
                  <button 
                    className={`cursor-pointer block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                    onClick={() => {
                      setOpenOptionsMenu(false);
                      toggleSelectionMode();
                    }}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar múltiples
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`rounded-xl border-2 ${darkMode ? 'border-green-500/50 bg-gray-800/50' : 'border-green-500/30 bg-white'} shadow-lg p-6 transition-transform hover:scale-105`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Ingresos totales</h2>
            <div className={`p-2 rounded-full ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>${totalIngresos.toLocaleString()}</p>
        </div>
        
        <div className={`rounded-xl border-2 ${darkMode ? 'border-red-500/50 bg-gray-800/50' : 'border-red-500/30 bg-white'} shadow-lg p-6 transition-transform hover:scale-105`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Gastos totales</h2>
            <div className={`p-2 rounded-full ${darkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
          </div>
          <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>${totalGastos.toLocaleString()}</p>
        </div>
        
        <div className={`rounded-xl border-2 ${
          balance >= 0 
            ? darkMode ? 'border-blue-500/50 bg-gray-800/50' : 'border-blue-500/30 bg-white'
            : darkMode ? 'border-orange-500/50 bg-gray-800/50' : 'border-orange-500/30 bg-white'
        } shadow-lg p-6 transition-transform hover:scale-105`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Balance actual</h2>
            <div className={`p-2 rounded-full ${
              balance >= 0
                ? darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                : darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
                balance >= 0 ? 'text-blue-500' : 'text-orange-500'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className={`text-3xl font-bold mt-2 ${
            balance >= 0
              ? darkMode ? 'text-blue-400' : 'text-blue-600'
              : darkMode ? 'text-orange-400' : 'text-orange-600'
          }`}>${Math.abs(balance).toLocaleString()}</p>
        </div>
      </div>

   
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
          className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            darkMode ? 'bg-gray-800 text-white border-0' : 'border border-gray-300'
          }`}
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
      <div id="transaction-container" className={`z-10 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} overflow-visible mb-6`}>
        <div className="p-6">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Historial de transacciones</h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((index) => (
                <div key={index} className="animate-pulse">
                  <div className={`flex flex-wrap md:flex-nowrap items-center p-4 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-lg`}>
                    <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 mb-2 md:mb-0 md:mr-4"></div>
                    <div className="w-full md:w-auto md:flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                    <div className="w-full md:w-auto mt-2 md:mt-0 md:mr-8">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                    </div>
                    <div className="w-full md:w-auto mt-2 md:mt-0">
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentTransactions.length > 0 ? (
            <div className="space-y-3">
              {selectionMode && (
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={toggleSelectAll}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {Object.keys(selectedTransactions).length === currentTransactions.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                  </button>
                  <button
                    onClick={() => setShowDeleteMultipleModal(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                  >
                    Eliminar seleccionadas
                  </button>
                </div>
              )}
              {currentTransactions.map((transaction) => (
                <TransactionItem 
                  key={transaction.id} 
                  transaccion={transaction} 
                  onEdit={handleEditTransaction} 
                  onDelete={showDeleteConfirmation} 
                  onDuplicate={handleDuplicateTransaction} 
                  selectionMode={selectionMode}
                  selectedTransactions={selectedTransactions}
                  setSelectedTransactions={setSelectedTransactions}
                />
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

      {/* Paginación mejorada */}
      {filteredTransactions.length > transactionsPerPage && (
        <div className={`flex flex-wrap justify-center items-center gap-2 mt-6 rounded-xl p-4 shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-l-md border cursor-pointer ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 disabled:text-gray-600' 
                  : 'bg-gray-50 border-gray-300 text-gray-700 disabled:text-gray-400'
              } disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 dark:hover:bg-gray-600`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M7.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L3.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Generar números de página */}
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-1 border-t border-b border-gray-300 ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
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

      {/* Modal para añadir   sacción */}
      {isModalOpen && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-auto ${darkMode ? 'backdrop-blur-sm bg-black/30' : 'backdrop-blur-sm bg-white/30'}`}
          onClick={handleModalBackdropClick}
        >
          <div 
            ref={modalContentRef}
            className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Registrar nueva transacción
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className={`cursor-pointer ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                &times;
              </button>
            </div>
            
            {/* Mostrar error dentro del modal */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSaveTransaction}>
              {/* Tipo de transacción */}
              <div className="mb-5">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Tipo de transacción
                </label>
                <div className="flex space-x-2">
                  <div 
                    className={`flex-1 p-3 border rounded-lg cursor-pointer flex flex-col items-center ${
                      transactionType === 'ingreso' 
                        ? `bg-green-50 border-green-500 ${darkMode ? 'bg-green-900 bg-opacity-20' : ''}` 
                        : darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setTransactionType('ingreso')}
                  >
                    <div className={`p-2 rounded-full ${transactionType === 'ingreso' ? 'bg-green-100' : 'bg-gray-100'} mb-2`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${transactionType === 'ingreso' ? 'text-green-500' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </div>
                    <span className={`text-sm ${transactionType === 'ingreso' ? darkMode ? 'text-green-400' : 'text-green-600' : darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ingreso</span>
                  </div>

                  <div 
                    className={`flex-1 p-3 border rounded-lg cursor-pointer flex flex-col items-center ${
                      transactionType === 'gasto' 
                        ? `bg-red-50 border-red-500 ${darkMode ? 'bg-red-900 bg-opacity-20' : ''}` 
                        : darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setTransactionType('gasto')}
                  >
                    <div className={`p-2 rounded-full ${transactionType === 'gasto' ? 'bg-red-100' : 'bg-gray-100'} mb-2`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${transactionType === 'gasto' ? 'text-red-500' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                    </div>
                    <span className={`text-sm ${transactionType === 'gasto' ? darkMode ? 'text-red-400' : 'text-red-600' : darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gasto</span>
                  </div>
                </div>
              </div>

              {/* Resto del formulario... */}
              <div className="mb-4">
                <label htmlFor="descripcion" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Descripción <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="descripcion" 
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600'
                  }`}
                  placeholder="Ej: Compra supermercado, Nómina..."
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="categoria" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Categoría
                </label>
                <select 
                  id="categoria" 
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600'
                  }`}
                >
                  <option value="">Selecciona una categoría</option>
                  {transactionType === 'ingreso' ? (
                    categoriasIngresos.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))
                  ) : (
                    categoriasGastos.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="monto" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Monto <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                  </div>
                  <input 
                    type="number" 
                    id="monto" 
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600'
                    }`}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="fecha" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  id="fecha" 
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600'
                  }`}
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="cuenta" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Cuenta <span className="text-red-500">*</span>
                </label>
                <select 
                  id="cuenta" 
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600'
                  }`}
                  required
                >
                  <option value="">Selecciona una cuenta</option>
                  <option value="efectivo">Efectivo</option>
                  {userAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.institution || "Sin institución"} (${account.balance?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-medium text-sm text-white transition ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </span>
                  ) : 'Guardar transacción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar múltiples transacciones */}
      {showDeleteMultipleModal && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-auto ${darkMode ? 'backdrop-blur-sm bg-black/30' : 'backdrop-blur-sm bg-white/30'}`}
          onClick={(e) => {
            if (deleteMultipleModalRef.current && !deleteMultipleModalRef.current.contains(e.target)) {
              setShowDeleteMultipleModal(false);
            }
          }}
        >
          <div
            ref={deleteMultipleModalRef}
            className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6`}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Eliminar transacciones</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>
                ¿Estás seguro de que deseas eliminar las {Object.values(selectedTransactions).filter(Boolean).length} transacciones seleccionadas? Esta acción no se puede deshacer.
              </p>
              <p className={`text-xs ${darkMode ? 'text-yellow-300' : 'text-yellow-600'} mb-6`}>
                Nota: Esta acción afectará a los saldos de las cuentas asociadas.
              </p>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 justify-center">
                <button
                  onClick={() => setShowDeleteMultipleModal(false)}
                  className={`cursor-pointer  px-4 py-2 rounded-lg font-medium text-sm transition ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteMultipleTransactions}
                  className="px-4 py-2 rounded-lg font-medium text-sm text-white transition bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </span>
                  ) : 'Eliminar transacciones'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar una transacción */}
      {showDeleteModal && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-auto ${darkMode ? 'backdrop-blur-sm bg-black/30' : 'backdrop-blur-sm bg-white/30'}`}
          onClick={(e) => {
            if (deleteModalRef.current && !deleteModalRef.current.contains(e.target)) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div 
            ref={deleteModalRef}
            className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6`}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Eliminar transacción</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>
                ¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.
              </p>
              <div className="mt-2 mb-4">
                <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full mb-2 ${
                  transactionToDelete?.tipo === 'ingreso' 
                    ? darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600' 
                    : darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600'
                }`}>
                  {transactionToDelete?.tipo === 'ingreso' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{transactionToDelete?.descripcion}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{transactionToDelete?.cuenta}</p>
                  <p className={`font-medium ${
                    transactionToDelete?.tipo === 'ingreso' 
                      ? darkMode ? 'text-green-400' : 'text-green-600' 
                      : darkMode ? 'text-red-400' : 'text-red-600'
                  }`}>${transactionToDelete?.monto?.toLocaleString()}</p>
                </div>
              </div>
              <p className={`text-xs ${darkMode ? 'text-yellow-300' : 'text-yellow-600'} mb-6`}>
                Nota: Esta acción afectará al saldo de la cuenta asociada.
              </p>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`cursor-pointer px-4 py-2 rounded-lg font-medium text-sm transition ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteTransaction}
                  className="cursor-pointer px-4 py-2 rounded-lg font-medium text-sm text-white transition bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </span>
                  ) : 'Eliminar transacción'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar una transacción */}
      {isEditingTransaction && editingTransaction && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-auto ${darkMode ? 'backdrop-blur-sm bg-black/30' : 'backdrop-blur-sm bg-white/30'}`}
          onClick={(e) => {
            if (editModalRef.current && !editModalRef.current.contains(e.target)) {
              setIsEditingTransaction(false);
              setEditingTransaction(null);
            }
          }}
        >
          <div 
            ref={editModalRef}
            className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Editar transacción
              </h2>
              <button 
                onClick={() => {
                  setIsEditingTransaction(false);
                  setEditingTransaction(null);
                }} 
                className={`cursor-pointer ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                &times;
              </button>
            </div>
            
            {/* Mostrar error dentro del modal */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
            
            {/* Tipo de transacción (solo lectura) */}
            <div className="mb-4">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Tipo de transacción
              </label>
              <div className={`p-3 rounded-lg ${
                editingTransaction.tipo === 'ingreso' 
                  ? darkMode ? 'bg-green-900/20 text-green-400 border border-green-600/30' : 'bg-green-50 text-green-700 border border-green-200'
                  : darkMode ? 'bg-red-900/20 text-red-400 border border-red-600/30' : 'bg-red-50 text-red-700 border border-red-200'
              } flex items-center`}>
                {editingTransaction.tipo === 'ingreso' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    <span className="font-medium">Ingreso</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                    <span className="font-medium">Gasto</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="edit-descripcion" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Descripción <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="edit-descripcion" 
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600'
                }`}
                placeholder="Ej: Compra supermercado, Nómina..."
                defaultValue={editingTransaction.descripcion}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="edit-categoria" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Categoría
              </label>
              <select 
                id="edit-categoria" 
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600'
                }`}
                defaultValue={editingTransaction.categoria || ''}
              >
                <option value="">Selecciona una categoría</option>
                {editingTransaction.tipo === 'ingreso' ? (
                  categoriasIngresos.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))
                ) : (
                  categoriasGastos.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))
                )}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="edit-monto" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Monto <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                </div>
                <input 
                  type="number" 
                  id="edit-monto" 
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600'
                  }`}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  defaultValue={editingTransaction.monto}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="edit-fecha" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Fecha <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                id="edit-fecha" 
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600'
                }`}
                defaultValue={new Date(editingTransaction.fecha).toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="edit-cuenta" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Cuenta <span className="text-red-500">*</span>
              </label>
              <select 
                id="edit-cuenta" 
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600'
                }`}
                defaultValue={editingTransaction.cuentaId || ''}
                required
              >
                <option value="">Selecciona una cuenta</option>
                <option value="efectivo">Efectivo</option>
                {userAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.institution || "Sin institución"} (${account.balance?.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditingTransaction(false);
                  setEditingTransaction(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEditedTransaction}
                className={`px-4 py-2 rounded-lg font-medium text-sm text-white transition ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};