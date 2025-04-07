'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

// Components
const SummaryCard = ({ title, amount, gradient }) => (
  <div className={`bg-gradient-to-r ${gradient} rounded-xl shadow-lg p-6 text-white`}>
    <h2 className="text-lg font-medium opacity-80">{title}</h2>
    <p className="text-3xl font-bold mt-2">${amount.toLocaleString()}</p>
  </div>
);

const TransactionItem = ({ transaccion }) => (
  <div className="flex flex-wrap md:flex-nowrap items-center p-4 hover:bg-gray-50 transition">
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
      <p className="text-sm text-gray-500">
        {format(parseISO(transaccion.fecha), 'dd MMM, yyyy')}
      </p>
    </div>
  </div>
);

// Datos