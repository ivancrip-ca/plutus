"use client";

import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  MessageCircle, 
  Mail, 
  Book, 
  Video, 
  FileText, 
  Star
} from 'lucide-react';
import Link from 'next/link';

const AyudaPage = () => {
  const { darkMode } = useTheme();
  const [activeCategory, setActiveCategory] = useState('general');
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Categorías de ayuda
  const categories = [
    { id: 'general', name: 'General', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'cuentas', name: 'Cuentas', icon: <FileText className="h-4 w-4" /> },
    { id: 'transacciones', name: 'Transacciones', icon: <FileText className="h-4 w-4" /> },
    { id: 'presupuesto', name: 'Presupuesto', icon: <FileText className="h-4 w-4" /> },
    { id: 'reportes', name: 'Reportes', icon: <Book className="h-4 w-4" /> },
    { id: 'tutoriales', name: 'Tutoriales', icon: <Video className="h-4 w-4" /> },
  ];

  // Preguntas frecuentes por categoría
  const faqsByCategory = {
    general: [
      {
        id: 'que-es-plutus',
        question: '¿Qué es Plutus?',
        answer: 'Plutus es una aplicación de finanzas personales diseñada para ayudarte a administrar tu dinero de manera efectiva. Te permite rastrear tus gastos, establecer presupuestos, administrar múltiples cuentas y visualizar tus hábitos financieros con informes detallados.'
      },
      {
        id: 'como-empezar',
        question: '¿Cómo empiezo a usar Plutus?',
        answer: 'Para comenzar a usar Plutus, primero debes añadir tus cuentas en la sección "Cuentas". Después, podrás registrar tus transacciones, crear presupuestos y consultar los informes que se generarán automáticamente basados en tus datos financieros.'
      },
      {
        id: 'seguridad-datos',
        question: '¿Cómo se protegen mis datos financieros?',
        answer: 'Plutus utiliza encriptación de extremo a extremo para proteger tu información financiera. Tus datos se almacenan de forma segura y no se comparten con terceros. Además, ofrecemos autenticación de dos factores para una capa adicional de seguridad.'
      },
      {
        id: 'costo-plutus',
        question: '¿Cuánto cuesta usar Plutus?',
        answer: 'Plutus ofrece un plan gratuito con funcionalidades básicas para la gestión de finanzas personales. También contamos con planes premium que ofrecen características avanzadas como exportación de datos, categorización automática y análisis detallados.'
      }
    ],
    cuentas: [
      {
        id: 'agregar-cuenta',
        question: '¿Cómo agrego una nueva cuenta?',
        answer: 'Para agregar una cuenta, ve a la sección "Cuentas" y haz clic en el botón "Agregar cuenta". Completa los detalles solicitados como nombre del banco, tipo de cuenta y saldo inicial. Puedes agregar cuentas bancarias, tarjetas de crédito y efectivo.'
      },
      {
        id: 'editar-cuenta',
        question: '¿Cómo edito o elimino una cuenta existente?',
        answer: 'Para editar una cuenta, ve a la sección "Cuentas", localiza la cuenta que deseas modificar y haz clic en el ícono de tres puntos. Selecciona "Editar cuenta" para modificar sus detalles o "Eliminar cuenta" para eliminarla del sistema.'
      },
      {
        id: 'sincronizar-banco',
        question: '¿Puedo sincronizar Plutus con mi banco?',
        answer: 'Actualmente, Plutus no ofrece sincronización directa con instituciones bancarias. Todas las transacciones deben ser ingresadas manualmente. Estamos trabajando en implementar esta función en futuras actualizaciones.'
      }
    ],
    transacciones: [
      {
        id: 'agregar-transaccion',
        question: '¿Cómo registro una nueva transacción?',
        answer: 'Para registrar una transacción, ve a la sección "Transacciones" y haz clic en "Agregar transacción". Selecciona la cuenta, ingresa el monto, elige una categoría y añade una descripción. También puedes establecer si es un ingreso o un gasto.'
      },
      {
        id: 'categorias-transaccion',
        question: '¿Puedo crear mis propias categorías de transacciones?',
        answer: 'Sí, puedes crear categorías personalizadas para tus transacciones. Ve a "Configuración" > "Categorías" y haz clic en "Agregar categoría". Define un nombre, un color y un ícono para tu nueva categoría.'
      },
      {
        id: 'transacciones-recurrentes',
        question: '¿Cómo configuro transacciones recurrentes?',
        answer: 'Para configurar transacciones recurrentes como pagos de servicios o suscripciones, ve a "Transacciones", haz clic en "Agregar transacción" y activa la opción "Recurrente". Define la frecuencia (semanal, mensual, anual) y la duración.'
      }
    ],
    presupuesto: [
      {
        id: 'crear-presupuesto',
        question: '¿Cómo creo un presupuesto?',
        answer: 'Para crear un presupuesto, ve a la sección "Presupuesto" y haz clic en "Crear presupuesto". Establece un límite para cada categoría de gasto y el período (mensual, semanal). Plutus rastreará tus gastos y te alertará cuando te acerques al límite.'
      },
      {
        id: 'ajustar-presupuesto',
        question: '¿Cómo ajusto mi presupuesto?',
        answer: 'Para ajustar un presupuesto existente, ve a "Presupuesto", selecciona el presupuesto que deseas modificar y haz clic en "Editar". Puedes cambiar los límites, añadir o eliminar categorías, o modificar el período del presupuesto.'
      }
    ],
    reportes: [
      {
        id: 'tipos-informes',
        question: '¿Qué tipos de informes ofrece Plutus?',
        answer: 'Plutus ofrece varios tipos de informes financieros: gastos por categoría, ingresos vs gastos, tendencias mensuales, flujo de efectivo y análisis anual. Todos los informes incluyen gráficos interactivos para una mejor visualización de tus finanzas.'
      },
      {
        id: 'exportar-informes',
        question: '¿Puedo exportar mis informes?',
        answer: 'Sí, puedes exportar tus informes en formato PDF, CSV o Excel. Navega al informe que deseas exportar y haz clic en el botón "Exportar" en la esquina superior derecha. Selecciona el formato deseado y guarda el archivo en tu dispositivo.'
      }
    ],
    tutoriales: [
      {
        id: 'tutoriales-disponibles',
        question: '¿Dónde puedo encontrar tutoriales sobre cómo usar Plutus?',
        answer: 'Ofrecemos una serie de tutoriales en video y guías paso a paso sobre cómo usar todas las funciones de Plutus. Visita nuestra sección de "Tutoriales" en el Centro de Ayuda para acceder a estos recursos educativos.'
      },
      {
        id: 'webinars',
        question: '¿Ofrecen webinars o sesiones de capacitación?',
        answer: 'Sí, realizamos webinars mensuales sobre finanzas personales y cómo aprovechar al máximo Plutus. Suscríbete a nuestro boletín para recibir notificaciones sobre próximos eventos y sesiones de capacitación.'
      }
    ]
  };

  // Filtrar preguntas por búsqueda
  const filteredFaqs = searchQuery
    ? Object.values(faqsByCategory).flat().filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqsByCategory[activeCategory];

  return (
    <div className={`p-6 min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold flex items-center gap-2 mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <HelpCircle className="h-8 w-8 text-blue-500" />
            Centro de Ayuda
          </h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Encuentra respuestas a tus preguntas sobre Plutus y aprende a gestionar mejor tus finanzas.
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-8">
          <div className={`flex items-center p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} focus-within:ring-2 focus-within:ring-blue-500 shadow-sm`}>
            <Search className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Buscar en el centro de ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 outline-none border-none ${darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Navegación lateral */}
          <div className="md:col-span-1">
            <div className={`rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border p-4 sticky top-6`}>
              <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Categorías</h2>
              <nav className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                      activeCategory === category.id
                        ? `${darkMode ? 'bg-blue-900 bg-opacity-50 text-blue-300' : 'bg-blue-50 text-blue-700'}`
                        : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </nav>

              <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>¿Necesitas más ayuda?</h3>
                <div className="space-y-2">
                  <Link href="#" className={`flex items-center px-3 py-2 text-sm rounded-md ${darkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'}`}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat en vivo
                  </Link>
                  <Link href="#" className={`flex items-center px-3 py-2 text-sm rounded-md ${darkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Contactar soporte
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="md:col-span-3">
            <div className={`rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border p-6`}>
              {searchQuery ? (
                <>
                  <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Resultados de búsqueda para "{searchQuery}"
                  </h2>
                  {filteredFaqs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className={`h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <Search className={`h-8 w-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        No se encontraron resultados
                      </h3>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} max-w-md mx-auto`}>
                        No pudimos encontrar resultados para tu búsqueda. Intenta con términos diferentes o contacta a soporte.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredFaqs.map((faq) => (
                        <div key={faq.id} className={`border rounded-lg overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <button
                            className={`w-full flex justify-between items-center p-4 text-left font-medium ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                            onClick={() => setActiveQuestion(activeQuestion === faq.id ? null : faq.id)}
                          >
                            <span className={darkMode ? 'text-white' : 'text-gray-800'}>{faq.question}</span>
                            <ChevronDown className={`h-5 w-5 transform transition-transform ${activeQuestion === faq.id ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                          {activeQuestion === faq.id && (
                            <div className={`p-4 border-t ${darkMode ? 'bg-gray-750 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {categories.find(c => c.id === activeCategory).name}
                  </h2>
                  <div className="space-y-4">
                    {faqsByCategory[activeCategory].map((faq) => (
                      <div key={faq.id} className={`border rounded-lg overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <button
                          className={`w-full flex justify-between items-center p-4 text-left font-medium ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                          onClick={() => setActiveQuestion(activeQuestion === faq.id ? null : faq.id)}
                        >
                          <span className={darkMode ? 'text-white' : 'text-gray-800'}>{faq.question}</span>
                          <ChevronDown className={`h-5 w-5 transform transition-transform ${activeQuestion === faq.id ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </button>
                        {activeQuestion === faq.id && (
                          <div className={`p-4 border-t ${darkMode ? 'bg-gray-750 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Recursos adicionales */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`rounded-lg border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg mr-4 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                    <Book className={`h-6 w-6 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h3 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Guías y recursos</h3>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Explora nuestras guías detalladas sobre gestión financiera
                    </p>
                    <Link href="#" className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      Ver recursos →
                    </Link>
                  </div>
                </div>
              </div>
              <div className={`rounded-lg border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg mr-4 ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                    <Video className={`h-6 w-6 ${darkMode ? 'text-green-300' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <h3 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Videotutoriales</h3>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Aprende a utilizar todas las funciones de Plutus con nuestros tutoriales
                    </p>
                    <Link href="#" className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      Ver videos →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de valoración */}
            <div className={`mt-8 p-6 rounded-lg text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
              <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>¿Te fue útil esta información?</h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Ayúdanos a mejorar nuestro centro de ayuda con tus comentarios
              </p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button 
                    key={rating}
                    className={`p-2 rounded-full hover:bg-opacity-10 ${darkMode ? 'hover:bg-yellow-500' : 'hover:bg-yellow-200'}`}
                  >
                    <Star className={`h-6 w-6 ${darkMode ? 'text-gray-400 hover:text-yellow-300' : 'text-gray-300 hover:text-yellow-400'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AyudaPage;