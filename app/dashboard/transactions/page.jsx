'use client';

import { useState, useEffect } from 'react';


// Datos de ejemplo
const transaccionesDeMuestra = [
  { id: 1, tipo: 'ingreso', descripcion: 'Salario', monto: 2500, fecha: '2023-05-01', categoria: 'Trabajo' },
  { id: 2, tipo: 'gasto', descripcion: 'Supermercado', monto: 150, fecha: '2023-05-03', categoria: 'Alimentación' },
  { id: 3, tipo: 'gasto', descripcion: 'Netflix', monto: 15, fecha: '2023-05-05', categoria: 'Entretenimiento' },
  { id: 4, tipo: 'ingreso', descripcion: 'Proyecto freelance', monto: 500, fecha: '2023-05-10', categoria: 'Trabajo' },
  { id: 5, tipo: 'gasto', descripcion: 'Restaurante', monto: 45, fecha: '2023-05-12', categoria: 'Alimentación' },
];

const PageTransacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    // Aquí podrías cargar datos de una API
    setTransacciones(transaccionesDeMuestra);
  }, []);

  // Filtrar transacciones
  const transaccionesFiltradas = transacciones.filter(transaccion => {
    return (
      (filtro === 'todas' || transaccion.tipo === filtro) &&
      (transaccion.descripcion.toLowerCase().includes(busqueda.toLowerCase()) || 
       transaccion.categoria.toLowerCase().includes(busqueda.toLowerCase()))
    );
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Transacciones</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div className="w-full md:w-40">
            <select 
              value={filtro} 
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white transition"
            >
              <option value="todas">Todas</option>
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-lg font-medium opacity-80">Ingresos totales</h2>
          <p className="text-3xl font-bold mt-2">${transacciones.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + t.monto, 0).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-lg font-medium opacity-80">Gastos totales</h2>
          <p className="text-3xl font-bold mt-2">${transacciones.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + t.monto, 0).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-lg font-medium opacity-80">Balance</h2>
          <p className="text-3xl font-bold mt-2">${(
            transacciones.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + t.monto, 0) - 
            transacciones.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + t.monto, 0)
          ).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Historial de Transacciones</h2>
        </div>
        
        {transaccionesFiltradas.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {transaccionesFiltradas.map(transaccion => (
              <div key={transaccion.id} className="flex flex-wrap md:flex-nowrap items-center p-4 hover:bg-gray-50 transition">
                <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full mb-2 md:mb-0 md:mr-4 flex-shrink-0 ${
                  transaccion.tipo === 'ingreso' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {transaccion.tipo === 'ingreso' ? '↑' : '↓'}
                </div>
                <div className="w-full md:w-auto md:flex-1">
                  <p className="font-medium text-gray-800">{transaccion.descripcion}</p>
                  <p className="text-sm text-gray-500">{transaccion.categoria}</p>
                </div>
                <div className="w-full md:w-auto mt-2 md:mt-0">
                  <p className={`font-medium ${
                    transaccion.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                  }`}>${transaccion.monto.toLocaleString()}</p>
                </div>
                <div className="w-full md:w-auto mt-2 md:mt-0">
                  <p className="text-sm text-gray-500">{transaccion.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">No se encontraron transacciones.</div>
        )}
      </div>
    </div>
  );
}

export default PageTransacciones;