'use client';

import { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdWarning, MdArrowUpward, MdArrowDownward, MdPictureAsPdf } from 'react-icons/md';
import { useTheme } from '../../../app/contexts/ThemeContext';
import { useAuth } from '../../../app/contexts/AuthContext';
import { db } from '../../../app/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetPage = () => {
  const { darkMode } = useTheme();
  const { currentUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [activeTab, setActiveTab] = useState('activos');
  const [sortConfig, setSortConfig] = useState({ key: 'category ', direction: 'asc' });
  const [isLoading, setIsLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    // Encabezado
    budgetNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    
    // Datos del cliente
    clientName: '',
    clientAddress: '',
    clientContact: '',
    
    // Información del presupuesto
    category: '',
    description: '',
    limit: '',
    period: 'Mensual',
    startDate: '',
    endDate: '',
    color: 'bg-blue-500',
    status: 'activo',
    spent: '0',
    
    // Condiciones
    paymentTerms: '',
    deliveryTime: '',
    warranty: '',
    
    // Notas adicionales
    notes: '',
    specialClauses: '',
    
    // Persona responsable
    responsibleName: '',
    responsibleContact: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modalContentRef, setModalContentRef] = useState(null);

  // Función para manejar los cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Si el campo es limit, formatear el valor
    if (name === 'limit') {
      // Eliminar cualquier carácter que no sea número o punto decimal
      const numericValue = value.replace(/[^\d.]/g, '');

      setFormData({
        ...formData,
        [name]: numericValue
      });
      return;
    }

    // Para otros campos, comportamiento normal
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Función para manejar clic en el backdrop del modal
  const handleModalBackdropClick = (e) => {
    // Solo cerrar si el clic fue directamente en el backdrop, no en el contenido
    if (modalContentRef && !modalContentRef.contains(e.target)) {
      closeModal();
    }
  };

  // Función para avanzar al siguiente paso del formulario
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Función para retroceder al paso anterior del formulario
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setShowAddModal(false);
    setEditingBudget(null);
    setError('');
    setSuccessMessage('');
    setCurrentStep(1);
    // Resetear el formulario
    setFormData({
      // Encabezado
      budgetNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      
      // Datos del cliente
      clientName: '',
      clientAddress: '',
      clientContact: '',
      
      // Información del presupuesto
      category: '',
      description: '',
      limit: '',
      period: 'Mensual',
      startDate: '',
      endDate: '',
      color: 'bg-blue-500',
      status: 'activo',
      spent: '0',
      
      // Condiciones
      paymentTerms: '',
      deliveryTime: '',
      warranty: '',
      
      // Notas adicionales
      notes: '',
      specialClauses: '',
      
      // Persona responsable
      responsibleName: '',
      responsibleContact: '',
    });
  };

  // Función para crear un nuevo presupuesto
  const handleAddBudget = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('Debes iniciar sesión para crear un presupuesto');
      }
      
      // Validar campos del formulario
      if (!formData.category.trim()) {
        throw new Error('La categoría es obligatoria');
      }
      
      if (!formData.limit.trim() || isNaN(Number(formData.limit))) {
        throw new Error('El límite debe ser un número válido');
      }
      
      if (!formData.startDate.trim()) {
        throw new Error('La fecha de inicio es obligatoria');
      }
      
      if (!formData.endDate.trim()) {
        throw new Error('La fecha de fin es obligatoria');
      }
      
      // Verificar que la fecha de fin sea mayor que la de inicio
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      
      // Crear el objeto del presupuesto para Firestore
      const newBudget = {
        userId: currentUser.uid,
        
        // Encabezado
        budgetNumber: formData.budgetNumber || `BUD-${Date.now()}`, // Generar número automático si no se proporciona
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        
        // Datos del cliente
        clientName: formData.clientName,
        clientAddress: formData.clientAddress,
        clientContact: formData.clientContact,
        
        // Información del presupuesto
        category: formData.category,
        spent: 0, // Comienza en 0
        limit: Number(formData.limit),
        color: formData.color,
        period: formData.period,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        status: formData.status,
        
        // Condiciones
        paymentTerms: formData.paymentTerms,
        deliveryTime: formData.deliveryTime,
        warranty: formData.warranty,
        
        // Notas adicionales
        notes: formData.notes,
        specialClauses: formData.specialClauses,
        
        // Persona responsable
        responsibleName: formData.responsibleName,
        responsibleContact: formData.responsibleContact,
        
        createdAt: serverTimestamp()
      };
      
      // Guardar en Firestore
      const docRef = await addDoc(collection(db, 'budgets'), newBudget);
      console.log('Presupuesto creado con ID:', docRef.id);
      
      // Actualizar la lista de presupuestos
      await fetchBudgets();
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Presupuesto creado correctamente');
      
      // Cerrar modal después de un breve momento
      setTimeout(() => {
        closeModal();
      }, 1500);
      
    } catch (error) {
      console.error('Error al crear presupuesto:', error);
      setError(error.message || 'Error al crear el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar un presupuesto existente
  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      if (!currentUser || !editingBudget) {
        throw new Error('Debes iniciar sesión para actualizar un presupuesto');
      }
      
      // Las mismas validaciones que en la creación
      if (!formData.category.trim()) {
        throw new Error('La categoría es obligatoria');
      }
      
      if (!formData.limit.trim() || isNaN(Number(formData.limit))) {
        throw new Error('El límite debe ser un número válido');
      }
      
      if (!formData.startDate.trim()) {
        throw new Error('La fecha de inicio es obligatoria');
      }
      
      if (!formData.endDate.trim()) {
        throw new Error('La fecha de fin es obligatoria');
      }
      
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      
      // Validar que el valor de spent sea un número válido
      if (isNaN(Number(formData.spent))) {
        throw new Error('La cantidad gastada debe ser un número válido');
      }
      
      // Crear el objeto de presupuesto actualizado
      const updatedBudget = {
        // Encabezado
        budgetNumber: formData.budgetNumber,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        
        // Datos del cliente
        clientName: formData.clientName,
        clientAddress: formData.clientAddress,
        clientContact: formData.clientContact,
        
        // Información del presupuesto
        category: formData.category,
        limit: Number(formData.limit),
        spent: Number(formData.spent), // Actualizar el valor de spent
        color: formData.color,
        period: formData.period,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        status: formData.status,
        
        // Condiciones
        paymentTerms: formData.paymentTerms,
        deliveryTime: formData.deliveryTime,
        warranty: formData.warranty,
        
        // Notas adicionales
        notes: formData.notes,
        specialClauses: formData.specialClauses,
        
        // Persona responsable
        responsibleName: formData.responsibleName,
        responsibleContact: formData.responsibleContact,
        
        updatedAt: serverTimestamp()
      };
      
      // Actualizar en Firestore
      await updateDoc(doc(db, 'budgets', editingBudget.id), updatedBudget);
      
      // Actualizar la lista de presupuestos
      await fetchBudgets();
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Presupuesto actualizado correctamente');
      
      // Cerrar modal después de un breve momento
      setTimeout(() => {
        closeModal();
      }, 1500);
      
    } catch (error) {
      console.error('Error al actualizar presupuesto:', error);
      setError(error.message || 'Error al actualizar el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener presupuestos desde Firestore
  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      if (!currentUser) return;
      
      const budgetsQuery = query(
        collection(db, 'budgets'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(budgetsQuery);
      const budgetsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Presupuestos obtenidos:', budgetsData);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error al obtener los presupuestos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para mostrar modal de confirmación para eliminar presupuesto
  const showDeleteConfirmation = (budget) => {
    setBudgetToDelete(budget);
    setShowDeleteModal(true);
  };

  // Función para eliminar un presupuesto
  const handleDeleteBudget = async () => {
    if (!budgetToDelete || !currentUser) return;
    
    try {
      setLoading(true);
      
      // Eliminar el presupuesto de Firestore
      await deleteDoc(doc(db, 'budgets', budgetToDelete.id));
      
      // Actualizar la lista de presupuestos
      await fetchBudgets();
      
      // Cerrar modal de confirmación
      setShowDeleteModal(false);
      setBudgetToDelete(null);
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Presupuesto eliminado correctamente');
      
      // Limpiar el mensaje después de un tiempo
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error al eliminar el presupuesto:', error);
      setError('No se pudo eliminar el presupuesto. Inténtalo de nuevo.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Función para generar PDF del presupuesto con diseño moderno y profesional
  const generatePDF = (budget) => {
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

  // Cargar los datos del presupuesto a editar cuando cambia editingBudget
  useEffect(() => {
    if (editingBudget) {
      setFormData({
        // Encabezado
        budgetNumber: editingBudget.budgetNumber || '',
        issueDate: editingBudget.issueDate || new Date().toISOString().split('T')[0],
        expiryDate: editingBudget.expiryDate || '',
        
        // Datos del cliente
        clientName: editingBudget.clientName || '',
        clientAddress: editingBudget.clientAddress || '',
        clientContact: editingBudget.clientContact || '',
        
        // Información del presupuesto
        category: editingBudget.category || '',
        description: editingBudget.description || '',
        limit: editingBudget.limit ? editingBudget.limit.toString() : '',
        period: editingBudget.period || 'Mensual',
        startDate: editingBudget.startDate || '',
        endDate: editingBudget.endDate || '',
        color: editingBudget.color || 'bg-blue-500',
        status: editingBudget.status || 'activo',
        spent: editingBudget.spent ? editingBudget.spent.toString() : '0',
        
        // Condiciones
        paymentTerms: editingBudget.paymentTerms || '',
        deliveryTime: editingBudget.deliveryTime || '',
        warranty: editingBudget.warranty || '',
        
        // Notas adicionales
        notes: editingBudget.notes || '',
        specialClauses: editingBudget.specialClauses || '',
        
        // Persona responsable
        responsibleName: editingBudget.responsibleName || '',
        responsibleContact: editingBudget.responsibleContact || '',
      });
    }
  }, [editingBudget]);

  useEffect(() => {
    setMounted(true);
    if (currentUser) {
      fetchBudgets();
    }
  }, [currentUser]);

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
    if (percentage > 100) return 'Excedido';
    if (percentage > 75) return 'Cerca del límite';
    if (percentage > 50) return 'Buen camino';
    return 'Excelente';
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
        {/* Gráfico de distribución de presupuestos (Gráfica de pastel) */}
        <div className={`col-span-1 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border rounded-xl p-6 shadow-sm`}>
          <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Distribución de presupuestos</h3>
          
          {chartData.length > 0 ? (
            <div className="h-64">
              <Pie 
                data={{
                  labels: chartData.map(budget => budget.category),
                  datasets: [
                    {
                      data: chartData.map(budget => budget.limit),
                      backgroundColor: chartData.map(budget => {
                        // Convertir clases de Tailwind a colores HEX para Chart.js
                        const colorMap = {
                          'bg-blue-500': '#3B82F6',
                          'bg-green-500': '#10B981', 
                          'bg-purple-500': '#8B5CF6',
                          'bg-red-500': '#EF4444',
                          'bg-yellow-500': '#F59E0B',
                          'bg-pink-500': '#EC4899',
                          'bg-indigo-500': '#6366F1',
                          'bg-teal-500': '#14B8A6',
                          'bg-orange-500': '#F97316',
                          'bg-gray-500': '#6B7280'
                        };
                        return colorMap[budget.color] || '#3B82F6';
                      }),
                      borderWidth: 1,
                      borderColor: darkMode ? '#111827' : '#ffffff',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        color: darkMode ? '#ffffff' : '#111827',
                        usePointStyle: true,
                        boxWidth: 10,
                        font: {
                          size: 11
                        }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context.raw;
                          const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${context.label}: $${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-64 flex flex-col justify-center items-center">
              <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p className="mb-2">No hay presupuestos activos para mostrar</p>
                <p className="text-xs">Crea presupuestos para visualizar su distribución</p>
              </div>
            </div>
          )}
          
          {chartData.length > 0 && (
            <div className="mt-4">
              <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Leyenda</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {chartData.map((item, index) => (
                  <div key={`${item.category}-${index}`} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                    <span className="text-xs flex-1">{item.category}</span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ${item.spent.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} / ${item.limit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Panel detallado de presupuestos */}
        <div className={`col-span-1 md:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border rounded-xl p-6 shadow-sm`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Detalle de presupuestos</h3>
            <button
              onClick={() => {
                setEditingBudget(null);
                setShowAddModal(true);
              }}
              className={`cursor-pointer flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium 
                ${darkMode 
                  ? 'bg-cyan-700 text-white hover:bg-cyan-600' 
                  : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
            >
              <MdAdd className="mr-1" /> Nuevo presupuesto
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
                      ${budget.limit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      budget.spent > budget.limit 
                        ? 'text-red-500' 
                        : darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      ${budget.spent.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
                          className={`cursor-pointer p-1 rounded-full ${
                            darkMode 
                              ? 'text-gray-300 hover:text-cyan-400 hover:bg-gray-600' 
                              : 'text-gray-500 hover:text-cyan-600 hover:bg-gray-100'
                          }`}
                          title="Editar presupuesto"
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => showDeleteConfirmation(budget)}
                          className={`cursor-pointer p-1 rounded-full ${
                            darkMode 
                              ? 'text-gray-300 hover:text-red-400 hover:bg-gray-600' 
                              : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                          }`}
                          title="Eliminar presupuesto"
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => generatePDF(budget)}
                          className={`cursor-pointer p-1 rounded-full ${
                            darkMode 
                              ? 'text-gray-300 hover:text-cyan-400 hover:bg-gray-600' 
                              : 'text-gray-500 hover:text-cyan-600 hover:bg-gray-100'
                          }`}
                          title="Generar PDF"
                        >
                          <MdPictureAsPdf className="h-5 w-5" />
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

      {/* Modal para añadir/editar presupuesto - Formulario profesional completo */}
      {showAddModal && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-auto ${darkMode ? 'backdrop-blur-sm bg-black/30' : 'backdrop-blur-sm bg-white/30'}`}
          onClick={handleModalBackdropClick}
        >
          <div 
            ref={setModalContentRef}
            className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {editingBudget ? "Editar presupuesto" : "Crear nuevo presupuesto"}
              </h2>
              <button 
                onClick={closeModal} 
                className={`cursor-pointer ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={editingBudget ? handleUpdateBudget : handleAddBudget}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg dark:bg-red-900/30 dark:text-red-400">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg dark:bg-green-900/30 dark:text-green-400">
                  {successMessage}
                </div>
              )}
              
              {/* Pasos del formulario */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentStep === 1
                          ? darkMode
                            ? 'bg-cyan-600 text-white'
                            : 'bg-cyan-600 text-white'
                          : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      1. Encabezado y Cliente
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentStep === 2
                          ? darkMode
                            ? 'bg-cyan-600 text-white'
                            : 'bg-cyan-600 text-white'
                          : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      2. Detalles del Presupuesto
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentStep === 3
                          ? darkMode
                            ? 'bg-cyan-600 text-white'
                            : 'bg-cyan-600 text-white'
                          : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      3. Condiciones y Notas
                    </button>
                  </div>
                </div>
                
                {/* Paso 1: Encabezado y datos del cliente */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} mb-6`}>
                      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Encabezado del Presupuesto</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Número de presupuesto */}
                        <div>
                          <label htmlFor="budgetNumber" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Número de Presupuesto
                          </label>
                          <input
                            type="text"
                            id="budgetNumber"
                            name="budgetNumber"
                            value={formData.budgetNumber}
                            onChange={handleInputChange}
                            placeholder="Ej. PRES-0001"
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          />
                          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Si se deja vacío, se generará automáticamente
                          </p>
                        </div>
                        
                        {/* Fecha de emisión */}
                        <div>
                          <label htmlFor="issueDate" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Fecha de Emisión
                          </label>
                          <input
                            type="date"
                            id="issueDate"
                            name="issueDate"
                            value={formData.issueDate}
                            onChange={handleInputChange}
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          />
                        </div>
                        
                        {/* Fecha de validez/expiración */}
                        <div>
                          <label htmlFor="expiryDate" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Fecha de Vigencia
                          </label>
                          <input
                            type="date"
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          />
                          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Hasta cuándo es válido este presupuesto
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Datos del Cliente</h3>
                      <div className="space-y-4">
                        {/* Nombre del cliente */}
                        <div>
                          <label htmlFor="clientName" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Nombre o Razón Social
                          </label>
                          <input
                            type="text"
                            id="clientName"
                            name="clientName"
                            value={formData.clientName}
                            onChange={handleInputChange}
                            placeholder="Ej. Juan Pérez / Empresa S.A."
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          />
                        </div>
                        
                        {/* Dirección del cliente */}
                        <div>
                          <label htmlFor="clientAddress" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Domicilio o Dirección
                          </label>
                          <input
                            type="text"
                            id="clientAddress"
                            name="clientAddress"
                            value={formData.clientAddress}
                            onChange={handleInputChange}
                            placeholder="Ej. Calle Principal #123, Ciudad"
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          />
                        </div>
                        
                        {/* Contacto del cliente */}
                        <div>
                          <label htmlFor="clientContact" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Teléfono o Correo Electrónico
                          </label>
                          <input
                            type="text"
                            id="clientContact"
                            name="clientContact"
                            value={formData.clientContact}
                            onChange={handleInputChange}
                            placeholder="Ej. +52 123 456 7890 / cliente@ejemplo.com"
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Paso 2: Detalles del presupuesto */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Detalles del Presupuesto</h3>
                      <div className="space-y-4">
                        {/* Categoría */}
                        <div>
                          <label htmlFor="category" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Categoría <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            placeholder="Ej. Alimentación, Transporte, Entretenimiento"
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                            required
                          />
                        </div>
                        
                        {/* Descripción */}
                        <div>
                          <label htmlFor="description" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Descripción detallada
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="Describa detalladamente los productos o servicios incluidos en este presupuesto"
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          ></textarea>
                        </div>
                        
                        {/* Límite de presupuesto */}
                        <div>
                          <label htmlFor="limit" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Límite de presupuesto <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                            </div>
                            <input
                              type="text"
                              id="limit"
                              name="limit"
                              value={formData.limit}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              className={`block w-full pl-8 px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                              required
                            />
                          </div>
                        </div>
                        
                        {/* Cantidad gastada - Solo visible al editar */}
                        {editingBudget && (
                          <div>
                            <label htmlFor="spent" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Cantidad gastada
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                              </div>
                              <input
                                type="text"
                                id="spent"
                                name="spent"
                                value={formData.spent}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className={`block w-full pl-8 px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Periodo y fechas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="period" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Periodo
                            </label>
                            <select
                              id="period"
                              name="period"
                              value={formData.period}
                              onChange={handleInputChange}
                              className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                            >
                              <option value="Mensual">Mensual</option>
                              <option value="Semanal">Semanal</option>
                              <option value="Quincenal">Quincenal</option>
                              <option value="Trimestral">Trimestral</option>
                              <option value="Anual">Anual</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="startDate" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Fecha de inicio <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              id="startDate"
                              name="startDate"
                              value={formData.startDate}
                              onChange={handleInputChange}
                              className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="endDate" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Fecha de fin <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              id="endDate"
                              name="endDate"
                              value={formData.endDate}
                              onChange={handleInputChange}
                              className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                              required
                            />
                          </div>
                        </div>
                        
                        {/* Color y estado */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Color
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                              {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 
                                'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-gray-500'].map((color) => (
                                <div 
                                  key={color}
                                  className={`h-8 w-8 rounded-full cursor-pointer ${color} transition-transform ${
                                    formData.color === color ? 'ring-2 ring-offset-2 ring-cyan-600 scale-110' : ''
                                  }`}
                                  onClick={() => {
                                    setFormData({...formData, color: color});
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Estado
                            </label>
                            <div className="flex space-x-4">
                              <div 
                                className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer flex-1 ${
                                  formData.status === 'activo' 
                                    ? `bg-green-50 border-green-500 ${darkMode ? 'bg-green-900 bg-opacity-20' : ''}` 
                                    : darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={() => setFormData({...formData, status: 'activo'})}
                              >
                                <div className={`h-4 w-4 rounded-full ${formData.status === 'activo' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                <span className={`text-sm ${formData.status === 'activo' ? (darkMode ? 'text-green-400' : 'text-green-700') : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                                  Activo
                                </span>
                              </div>
                              <div 
                                className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer flex-1 ${
                                  formData.status === 'inactivo' 
                                    ? `bg-red-50 border-red-500 ${darkMode ? 'bg-red-900 bg-opacity-20' : ''}` 
                                    : darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={() => setFormData({...formData, status: 'inactivo'})}
                              >
                                <div className={`h-4 w-4 rounded-full ${formData.status === 'inactivo' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                <span className={`text-sm ${formData.status === 'inactivo' ? (darkMode ? 'text-red-400' : 'text-red-700') : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                                  Inactivo
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Paso 3: Condiciones y notas adicionales */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} mb-6`}>
                      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Condiciones</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Forma de pago */}
                        <div>
                          <label htmlFor="paymentTerms" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Forma de Pago
                          </label>
                          <input
                            type="text"
                            id="paymentTerms"
                            name="paymentTerms"
                            value={formData.paymentTerms}
                            onChange={handleInputChange}
                            placeholder="Ej. Efectivo, Transferencia, Tarjeta"
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          />
                        </div>
                        
                        {/* Tiempos de entrega */}
                        <div>
                          <label htmlFor="deliveryTime" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Tiempos de Entrega
                          </label>
                          <input
                            type="text"
                            id="deliveryTime"
                            name="deliveryTime"
                            value={formData.deliveryTime}
                            onChange={handleInputChange}
                            placeholder="Ej. 15 días hábiles"
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          />
                        </div>
                        
                        {/* Garantías */}
                        <div>
                          <label htmlFor="warranty" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Garantías
                          </label>
                          <input
                            type="text"
                            id="warranty"
                            name="warranty"
                            value={formData.warranty}
                            onChange={handleInputChange}
                            placeholder="Ej. 1 año en partes y mano de obra"
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} mb-6`}>
                      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Notas Adicionales</h3>
                      <div className="space-y-4">
                        {/* Observaciones */}
                        <div>
                          <label htmlFor="notes" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Observaciones
                          </label>
                          <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="Observaciones o aclaraciones importantes sobre el presupuesto"
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          ></textarea>
                        </div>
                        
                        {/* Cláusulas especiales */}
                        <div>
                          <label htmlFor="specialClauses" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Cláusulas Especiales
                          </label>
                          <textarea
                            id="specialClauses"
                            name="specialClauses"
                            value={formData.specialClauses}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="Ej. Penalizaciones por cancelación, condiciones especiales, etc."
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Datos de Contacto</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre del responsable */}
                        <div>
                          <label htmlFor="responsibleName" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Nombre del Responsable
                          </label>
                          <input
                            type="text"
                            id="responsibleName"
                            name="responsibleName"
                            value={formData.responsibleName}
                            onChange={handleInputChange}
                            placeholder="Nombre de la persona que emite el presupuesto"
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          />
                        </div>
                        
                        {/* Contacto del responsable */}
                        <div>
                          <label htmlFor="responsibleContact" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Contacto del Responsable
                          </label>
                          <input
                            type="text"
                            id="responsibleContact"
                            name="responsibleContact"
                            value={formData.responsibleContact}
                            onChange={handleInputChange}
                            placeholder="Teléfono o correo del responsable"
                            className={`block w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Botones de navegación y envío */}
              <div className="flex justify-between mt-6">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className={`px-4 py-2 border rounded-lg ${
                        darkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Anterior
                    </button>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className={`px-4 py-2 border rounded-lg ${
                      darkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancelar
                  </button>
                  
                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className={`px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700`}
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      disabled={loading}
                      className={`px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {editingBudget ? "Actualizando..." : "Creando..."}
                        </>
                      ) : editingBudget ? "Guardar Cambios" : "Crear Presupuesto" }
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar presupuesto */}
      {showDeleteModal && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-auto ${darkMode ? 'backdrop-blur-sm bg-black/50' : 'backdrop-blur-sm bg-white/50'}`}
          onClick={(e) => {
            // Cerrar el modal al hacer clic fuera de su contenido
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
              setBudgetToDelete(null);
            }
          }}
        >
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-center mb-6">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Eliminar presupuesto
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                ¿Estás seguro de que deseas eliminar este presupuesto?
              </p>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-5`}>
                <strong>{budgetToDelete?.category}</strong>
                <br />
                Esta acción no se puede deshacer.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg dark:bg-red-900/30 dark:text-red-400">
                  {error}
                </div>
              )}
              
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setBudgetToDelete(null);
                  }}
                  className={`px-4 py-2 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} border rounded-lg flex-1`}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDeleteBudget}
                  disabled={loading}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex-1 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : "Eliminar" }
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