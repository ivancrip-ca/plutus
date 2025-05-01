import React, { useState, useEffect } from 'react';
import { MdWarning, MdPictureAsPdf } from 'react-icons/md';
import { useTheme } from '../../app/contexts/ThemeContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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

  // Función para generar PDF del presupuesto con diseño moderno y profesional
  const generatePDF = async (budget) => {
    // Crear un nuevo documento PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Importar fuentes
    doc.setFont('helvetica');
    
    // Definir colores principales
    const primaryColor = '#0891b2'; // Color cyan para elementos principales
    const secondaryColor = '#475569'; // Color slate para textos secundarios
    const accentColor = '#6366f1'; // Color indigo para acentos
    
    // Medidas de la página
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = 20; // Posición inicial en el eje Y
    let currentPage = 1; // Contador de páginas
    
    // Función para añadir un rectángulo con color de fondo
    const addColorRect = (y, height, color) => {
      doc.setFillColor(color);
      doc.rect(0, y, pageWidth, height, 'F');
    };
    
    // Función para añadir la cabecera
    const addHeader = () => {
      // Fondo del encabezado
      addColorRect(0, 40, primaryColor);
      
      // Título del documento
      doc.setTextColor('#ffffff');
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text("PRESUPUESTO", pageWidth / 2, 20, { align: 'center' });
      
      // Subtítulo o eslogan
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text("Documento generado por Plutus - Sistema de Gestión Financiera", pageWidth / 2, 30, { align: 'center' });
      
      // Resetear texto a color por defecto
      doc.setTextColor('#000000');
      
      return 45; // Retornar la nueva posición Y después del encabezado
    };
    
    // Función para añadir sección con título
    const addSection = (title, yPos) => {
      // Barra coloreada antes del título de sección
      doc.setFillColor(primaryColor);
      doc.rect(margin, yPos, contentWidth, 0.5, 'F');
      
      yPos += 6;
      
      // Título de la sección
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.text(title, margin, yPos);
      
      // Resetear texto a color por defecto
      doc.setTextColor('#000000');
      
      return yPos + 8;
    };
    
    // Función para añadir campo de información
    const addField = (label, value, yPos, labelWidth = 40) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor);
      doc.text(label + ":", margin, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#000000');
      if (value) {
        // Si el valor es largo, dividirlo en múltiples líneas
        if (value.length > 60) {
          const splitValue = doc.splitTextToSize(value, contentWidth - labelWidth);
          doc.text(splitValue, margin + labelWidth, yPos);
          return yPos + (splitValue.length * 5);
        } else {
          doc.text(value, margin + labelWidth, yPos);
          return yPos + 6;
        }
      }
      return yPos + 6;
    };
    
    // Función para añadir pie de página
    const addFooter = (pageNum, totalPages) => {
      // Línea separadora
      doc.setDrawColor(primaryColor);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
      
      // Texto del pie de página
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor);
      doc.text("© " + new Date().getFullYear() + " Plutus. Todos los derechos reservados.", margin, pageHeight - 20);
      doc.text("Documento generado el " + new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 20, { align: 'right' });
      
      // Agregar fecha actual
      const fechaActual = "30 de abril de 2025";
      doc.text(`Fecha de impresión: ${fechaActual}`, margin, pageHeight - 15);
      
      // Número de página
      doc.setFontSize(8);
      doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    };
    
    // Comprobar si hay espacio suficiente para el siguiente bloque
    const checkPageBreak = (requiredSpace) => {
      if (y + requiredSpace > pageHeight - 35) {
        // Añadir pie de página a la página actual
        addFooter(currentPage, 2);
        
        // Añadir nueva página
        doc.addPage();
        currentPage++;
        
        // Reiniciar posición Y y añadir encabezado ligero en la segunda página
        y = 20;
        
        // Encabezado de segunda página más ligero
        doc.setFillColor(primaryColor);
        doc.rect(0, 0, pageWidth, 15, 'F');
        
        doc.setTextColor('#ffffff');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Presupuesto - ${budget.category} (Continuación)`, pageWidth / 2, 10, { align: 'center' });
        
        doc.setTextColor('#000000');
        y = 25;
      }
    };
    
    // Iniciar con el encabezado
    y = addHeader();
    
    // Número y fecha del presupuesto - Info destacada
    doc.setFillColor('#f8fafc'); // Fondo gris muy claro
    doc.rect(margin, y, contentWidth, 20, 'F');
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, contentWidth, 20, 'S');
    
    doc.setFontSize(11);
    doc.setTextColor(secondaryColor);
    
    // Lado izquierdo - Número
    doc.setFont('helvetica', 'bold');
    doc.text("Presupuesto N°:", margin + 5, y + 8);
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'normal');
    doc.text(budget.budgetNumber || `BUD-${Date.now()}`, margin + 38, y + 8);
    
    // Lado derecho - Fechas
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(secondaryColor);
    doc.text("Emisión:", pageWidth - margin - 75, y + 8);
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'normal');
    doc.text(budget.issueDate || new Date().toLocaleDateString(), pageWidth - margin - 45, y + 8);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(secondaryColor);
    doc.text("Válido hasta:", pageWidth - margin - 75, y + 15);
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'normal');
    doc.text(budget.expiryDate || "No especificado", pageWidth - margin - 45, y + 15);
    
    y += 25;
    
    // Información del cliente
    y = addSection("INFORMACIÓN DEL CLIENTE", y);
    
    if (budget.clientName || budget.clientAddress || budget.clientContact) {
      // Recuadro para info del cliente
      doc.setFillColor('#f8fafc');
      doc.rect(margin, y, contentWidth, 24, 'F');
      
      y = addField("Cliente", budget.clientName || "No especificado", y + 6);
      y = addField("Dirección", budget.clientAddress || "No especificada", y);
      y = addField("Contacto", budget.clientContact || "No especificado", y);
    } else {
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor);
      doc.text("No se ha especificado información del cliente", margin, y + 6);
      y += 12;
    }
    
    y += 10;
    
    // Detalles del presupuesto
    y = addSection("DETALLE DEL PRESUPUESTO", y);
    
    // Recuadro para categoría y descripción
    doc.setFillColor('#f8fafc');
    doc.rect(margin, y, contentWidth, budget.description ? 30 : 18, 'F');
    
    y = addField("Categoría", budget.category, y + 6);
    
    if (budget.description) {
      y = addField("Descripción", budget.description, y);
    }
    
    y += 10;
    
    // Verificar espacio para la tabla e información financiera (aproximadamente 50mm)
    checkPageBreak(50);
    
    // Tabla de información financiera
    const tableY = y;
    
    // Encabezados de la tabla
    doc.setFillColor(primaryColor);
    doc.rect(margin, y, contentWidth, 8, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#ffffff');
    doc.text("CONCEPTO", margin + 5, y + 5.5);
    doc.text("PERÍODO", margin + 70, y + 5.5);
    doc.text("VIGENCIA", margin + 110, y + 5.5);
    doc.text("IMPORTE", pageWidth - margin - 25, y + 5.5, { align: 'right' });
    
    y += 8;
    
    // Datos de la tabla
    doc.setFillColor('#f8fafc');
    doc.rect(margin, y, contentWidth, 10, 'F');
    
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(budget.category, margin + 5, y + 6);
    doc.text(budget.period || "No especificado", margin + 70, y + 6);
    const vigencia = budget.startDate && budget.endDate ? 
      `${budget.startDate} - ${budget.endDate}` : "No especificada";
    doc.text(vigencia, margin + 110, y + 6);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`$${budget.limit.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
      pageWidth - margin - 5, y + 6, { align: 'right' });
    
    y += 10;
    
    // Línea inferior de la tabla
    doc.setDrawColor('#e2e8f0');
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);
    
    y += 10;
    
    // Información de progreso/estado
    if (typeof budget.spent === 'number') {
      const percentage = Math.min(Math.round((budget.spent / budget.limit) * 100), 100);
      
      doc.setFontSize(9);
      doc.setTextColor(secondaryColor);
      doc.text("PROGRESO DE PRESUPUESTO:", margin, y + 6);
      
      // Barra de progreso
      const barWidth = 60;
      const barHeight = 5;
      const barY = y + 10;
      
      // Fondo de la barra
      doc.setFillColor('#e2e8f0');
      doc.rect(margin + 70, barY, barWidth, barHeight, 'F');
      
      // Progreso de la barra
      let progressColor = '#10b981'; // Verde por defecto
      if (percentage > 75) progressColor = '#f59e0b'; // Amarillo
      if (percentage > 100) progressColor = '#ef4444'; // Rojo
      
      doc.setFillColor(progressColor);
      doc.rect(margin + 70, barY, (barWidth * percentage) / 100, barHeight, 'F');
      
      // Porcentaje y gasto
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(progressColor);
      doc.text(`${percentage}%`, margin + 70 + barWidth + 5, barY + 4);
      
      doc.setTextColor('#000000');
      doc.text(`Gastado: $${budget.spent.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
        pageWidth - margin - 5, barY + 4, { align: 'right' });
      
      y += 25;
    }
    
    // Verificar si necesitamos cambiar de página para las condiciones (aproximadamente 60mm)
    checkPageBreak(60);
    
    // Condiciones
    if (budget.paymentTerms || budget.deliveryTime || budget.warranty) {
      y = addSection("CONDICIONES", y);
      
      doc.setFillColor('#f8fafc');
      doc.rect(margin, y, contentWidth, 24, 'F');
      
      y = addField("Forma de pago", budget.paymentTerms || "No especificada", y + 6);
      y = addField("Tiempo de entrega", budget.deliveryTime || "No especificado", y);
      y = addField("Garantía", budget.warranty || "No especificada", y);
      
      y += 10;
    }
    
    // Verificar si necesitamos cambiar de página para las notas adicionales (aprox. 60mm)
    checkPageBreak(60);
    
    // Notas adicionales
    if (budget.notes || budget.specialClauses) {
      y = addSection("NOTAS ADICIONALES", y);
      
      doc.setFillColor('#f8fafc');
      doc.rect(margin, y, contentWidth, budget.notes && budget.specialClauses ? 40 : 25, 'F');
      
      if (budget.notes) {
        y = addField("Observaciones", budget.notes, y + 6);
        y += 5; // Añadir espacio adicional después de observaciones
      }
      
      if (budget.specialClauses) {
        y = addField("Cláusulas especiales", budget.specialClauses, y);
      }
      
      y += 10;
    }
    
    // Verificar si necesitamos cambiar de página para los datos del responsable (aprox. 50mm)
    checkPageBreak(50);
    
    // Datos de responsable
    if (budget.responsibleName || budget.responsibleContact) {
      y = addSection("DATOS DEL RESPONSABLE", y);
      
      doc.setFillColor('#f8fafc');
      doc.rect(margin, y, contentWidth, 20, 'F');
      
      y = addField("Nombre", budget.responsibleName || "No especificado", y + 6);
      y = addField("Contacto", budget.responsibleContact || "No especificado", y);
      
      // Espacio para firma
      y += 15;
      doc.setDrawColor(secondaryColor);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + 70, y);
      
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor);
      doc.text("Firma del responsable", margin, y + 5);
      
      y += 10;
    }
    
    // Añadir pie de página a la última página
    addFooter(currentPage, 2);
    
    // Guardar el PDF
    doc.save(`presupuesto_${budget.category.replace(/\s+/g, '_').toLowerCase()}.pdf`);
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
            <div className="flex items-center space-x-2">
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                ${budget.spent.toLocaleString('es-ES')} / ${budget.limit.toLocaleString('es-ES')}
              </div>
              <button
                onClick={() => generatePDF(budget)}
                className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                title="Generar PDF"
              >
                <MdPictureAsPdf className={`text-lg ${darkMode ? 'text-gray-300 hover:text-cyan-400' : 'text-gray-500 hover:text-cyan-600'}`} />
              </button>
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
        className={`cursor-pointer mt-4 w-full py-2.5 px-4 border border-transparent text-sm font-medium rounded-md
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
