"use client";

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
    ArrowLeft,
    Book,
    FileText,
    Download,
    ExternalLink,
    Search,
    Video,
    BookOpen,
    RefreshCw,
    DollarSign,
    PieChart,
    Shield,
    TrendingUp,
    Laptop,
    Smartphone,
    ChevronDown,
    Mail,
    Facebook,
    MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const GuiasRecursosPage = () => {
    const { darkMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('todos');
    const [supportMenuOpen, setSupportMenuOpen] = useState(false);
    const supportMenuRef = useRef(null);

    // Cerrar el menú de soporte cuando se hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event) {
            if (supportMenuRef.current && !supportMenuRef.current.contains(event.target)) {
                setSupportMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [supportMenuRef]);

    // Categorías de recursos
    const categories = [
        { id: 'todos', name: 'Todos los recursos' },
        { id: 'guias', name: 'Guías paso a paso' },
        { id: 'tutoriales', name: 'Tutoriales en video' },
        { id: 'plantillas', name: 'Plantillas descargables' },
        { id: 'articulos', name: 'Artículos educativos' }
    ];

    // Recursos disponibles
    const recursos = [
        {
            id: 'guia-inicio',
            title: 'Guía de inicio rápido',
            description: 'Aprende a configurar Plutus y comenzar a gestionar tus finanzas en menos de 10 minutos.',
            type: 'guias',
            icon: <BookOpen className="h-6 w-6" />,
            color: 'blue',
            fecha: '15 de abril de 2025',
            tiempoLectura: '5 minutos',
            url: '#guia-inicio'
        },
        {
            id: 'tutorial-cuentas',
            title: 'Configuración y gestión de cuentas',
            description: 'Tutorial en video que muestra cómo agregar, editar y organizar tus cuentas financieras.',
            type: 'tutoriales',
            icon: <Video className="h-6 w-6" />,
            color: 'green',
            fecha: '10 de abril de 2025',
            tiempoLectura: '8 minutos',
            url: '#tutorial-cuentas'
        },
        {
            id: 'plantilla-presupuesto',
            title: 'Plantilla de presupuesto mensual',
            description: 'Descarga esta plantilla para planificar tu presupuesto mensual de forma detallada con categorías predefinidas.',
            type: 'plantillas',
            icon: <Download className="h-6 w-6" />,
            color: 'purple',
            fecha: '20 de marzo de 2025',
            tiempoLectura: 'N/A',
            url: '#plantilla-presupuesto'
        },
        {
            id: 'guia-presupuesto',
            title: 'Cómo crear un presupuesto efectivo',
            description: 'Guía completa con métodos prácticos para crear y mantener un presupuesto que realmente puedas seguir.',
            type: 'guias',
            icon: <BookOpen className="h-6 w-6" />,
            color: 'blue',
            fecha: '5 de abril de 2025',
            tiempoLectura: '12 minutos',
            url: '#guia-presupuesto'
        },
        {
            id: 'tutorial-transacciones',
            title: 'Gestión avanzada de transacciones',
            description: 'Aprende a categorizar, etiquetar y analizar tus transacciones para obtener insights financieros útiles.',
            type: 'tutoriales',
            icon: <Video className="h-6 w-6" />,
            color: 'green',
            fecha: '28 de marzo de 2025',
            tiempoLectura: '15 minutos',
            url: '#tutorial-transacciones'
        },
        {
            id: 'articulo-ahorro',
            title: 'Estrategias de ahorro efectivas',
            description: 'Artículo detallado con 10 estrategias probadas para aumentar tu capacidad de ahorro mensual.',
            type: 'articulos',
            icon: <FileText className="h-6 w-6" />,
            color: 'amber',
            fecha: '2 de abril de 2025',
            tiempoLectura: '10 minutos',
            url: '#articulo-ahorro'
        },
        {
            id: 'plantilla-metas',
            title: 'Planificador de metas financieras',
            description: 'Plantilla interactiva para establecer, rastrear y alcanzar tus metas financieras a corto y largo plazo.',
            type: 'plantillas',
            icon: <Download className="h-6 w-6" />,
            color: 'purple',
            fecha: '12 de marzo de 2025',
            tiempoLectura: 'N/A',
            url: '#plantilla-metas'
        },
        {
            id: 'guia-reportes',
            title: 'Interpretación de informes financieros',
            description: 'Aprende a leer y analizar los diferentes informes que Plutus genera para tomar mejores decisiones financieras.',
            type: 'guias',
            icon: <BookOpen className="h-6 w-6" />,
            color: 'blue',
            fecha: '25 de marzo de 2025',
            tiempoLectura: '15 minutos',
            url: '#guia-reportes'
        },
        {
            id: 'articulo-deudas',
            title: 'Cómo eliminar deudas de forma estratégica',
            description: 'Estrategias para priorizar y eliminar deudas basadas en métodos financieros comprobados.',
            type: 'articulos',
            icon: <FileText className="h-6 w-6" />,
            color: 'amber',
            fecha: '30 de marzo de 2025',
            tiempoLectura: '12 minutos',
            url: '#articulo-deudas'
        },
        {
            id: 'tutorial-mobile',
            title: 'Uso de Plutus en dispositivos móviles',
            description: 'Tutorial que muestra cómo aprovechar al máximo la aplicación móvil de Plutus para finanzas sobre la marcha.',
            type: 'tutoriales',
            icon: <Video className="h-6 w-6" />,
            color: 'green',
            fecha: '18 de abril de 2025',
            tiempoLectura: '7 minutos',
            url: '#tutorial-mobile'
        },
        {
            id: 'guia-inversion',
            title: 'Primeros pasos en inversiones',
            description: 'Guía para principiantes sobre cómo registrar y dar seguimiento a tus inversiones en Plutus.',
            type: 'guias',
            icon: <BookOpen className="h-6 w-6" />,
            color: 'blue',
            fecha: '8 de abril de 2025',
            tiempoLectura: '18 minutos',
            url: '#guia-inversion'
        },
    ];

    // Recursos destacados
    const recursosDestacados = [
        {
            id: 'destacado-1',
            title: 'Fundamentos de finanzas personales',
            description: 'Una guía completa para entender los conceptos básicos de finanzas personales y cómo aplicarlos en tu vida diaria.',
            icon: <DollarSign />,
            color: 'blue',
            url: '#fundamentos'
        },
        {
            id: 'destacado-2',
            title: 'Masterclass de presupuestos',
            description: 'Video tutorial avanzado sobre diferentes métodos de presupuesto y cómo adaptarlos a tu situación.',
            icon: <PieChart />,
            color: 'green',
            url: '#masterclass'
        },
        {
            id: 'destacado-3',
            title: 'Seguridad financiera digital',
            description: 'Aprende a proteger tu información financiera y cómo Plutus implementa las mejores prácticas de seguridad.',
            icon: <Shield />,
            color: 'red',
            url: '#seguridad'
        }
    ];

    // Filtrar recursos por búsqueda y categoría
    const filteredRecursos = recursos.filter(recurso => {
        const matchesSearch = searchQuery === '' ||
            recurso.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recurso.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = activeCategory === 'todos' || recurso.type === activeCategory;

        return matchesSearch && matchesCategory;
    });

    // Funciones de utilidad para la interfaz
    const getColorClass = (color, isDark) => {
        const colorMap = {
            blue: isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700',
            green: isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700',
            purple: isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700',
            amber: isDark ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 text-amber-700',
            red: isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700',
        };
        return colorMap[color] || (isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800');
    };

    return (
        <div className={`p-6 min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-6xl mx-auto">
                {/* Encabezado con navegación */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <Link href="/dashboard/configuracion/ayuda" className={`mr-2 ${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'} p-2 rounded-lg border`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>

                        <h1 className={`text-3xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            <Book className="h-8 w-8 text-blue-500" />
                            Guías y recursos
                        </h1>
                    </div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Explora nuestra colección de guías, tutoriales, plantillas y recursos para ayudarte a sacar el máximo provecho de Plutus y mejorar tu gestión financiera.
                    </p>
                </div>

                {/* Barra de búsqueda */}
                <div className="mb-8">
                    <div className={`flex items-center p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} focus-within:ring-2 focus-within:ring-blue-500 shadow-sm`}>
                        <Search className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                            type="text"
                            placeholder="Buscar guías y recursos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`flex-1 outline-none border-none ${darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                        />
                    </div>
                </div>

                {/* Recursos destacados */}
                <div className="mb-10">
                    <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Recursos destacados
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recursosDestacados.map((recurso) => (
                            <Link href={recurso.url} key={recurso.id}>
                                <div className={`h-full rounded-lg border p-5 transition-all hover:shadow-md ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                    <div className={`rounded-full p-3 inline-block mb-4 ${getColorClass(recurso.color, darkMode)}`}>
                                        {recurso.icon}
                                    </div>
                                    <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{recurso.title}</h3>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{recurso.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Filtros de categoría */}
                <div className="mb-6">
                    <div className={`flex flex-wrap gap-2 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`px-4 py-2 text-sm rounded-full transition-colors ${activeCategory === category.id
                                        ? `${darkMode ? 'bg-blue-900 bg-opacity-50 text-blue-300' : 'bg-blue-100 text-blue-700'}`
                                        : `${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de recursos */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredRecursos.length === 0 ? (
                        <div className={`text-center py-10 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center">
                                <RefreshCw className={`h-8 w-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            </div>
                            <h3 className={`text-lg font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                No se encontraron recursos
                            </h3>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} max-w-md mx-auto`}>
                                No pudimos encontrar recursos que coincidan con tu búsqueda. Intenta con otros términos o navega por todas las categorías.
                            </p>
                        </div>
                    ) : (
                        filteredRecursos.map((recurso) => (
                            <Link href={recurso.url} key={recurso.id}>
                                <div className={`p-5 rounded-lg border transition-all hover:shadow-md ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                    <div className="flex items-start">
                                        <div className={`p-2 rounded-lg mr-4 ${getColorClass(recurso.color, darkMode)}`}>
                                            {recurso.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap justify-between items-start mb-2">
                                                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{recurso.title}</h3>
                                                <div className={`rounded-full px-2 py-1 text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                                    {recurso.type === 'guias' && 'Guía paso a paso'}
                                                    {recurso.type === 'tutoriales' && 'Tutorial en video'}
                                                    {recurso.type === 'plantillas' && 'Plantilla descargable'}
                                                    {recurso.type === 'articulos' && 'Artículo educativo'}
                                                </div>
                                            </div>
                                            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{recurso.description}</p>
                                            <div className="flex items-center text-xs">
                                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-3`}>
                                                    {recurso.fecha}
                                                </span>
                                                {recurso.tiempoLectura !== 'N/A' && (
                                                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {recurso.tiempoLectura} de lectura
                                                    </span>
                                                )}
                                                <span className={`ml-auto ${darkMode ? 'text-blue-400' : 'text-blue-600'} flex items-center`}>
                                                    {recurso.type === 'plantillas' ? 'Descargar' : 'Ver recurso'} <ExternalLink className="h-3 w-3 ml-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* Sección de recursos por dispositivo */}
                <div className="mt-10 mb-8">
                    <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Recursos por dispositivo
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-5 rounded-lg border flex items-start ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className={`p-3 rounded-lg mr-4 ${darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                                <Laptop className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Plutus para escritorio</h3>
                                <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Guías y tutoriales específicos para sacar el máximo provecho de Plutus en tu computadora.
                                </p>
                                <Link href="#desktop" className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                    Ver recursos →
                                </Link>
                            </div>
                        </div>
                        <div className={`p-5 rounded-lg border flex items-start ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className={`p-3 rounded-lg mr-4 ${darkMode ? 'bg-cyan-900 text-cyan-300' : 'bg-cyan-100 text-cyan-700'}`}>
                                <Smartphone className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Plutus móvil</h3>
                                <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Recursos optimizados para usar la aplicación móvil de Plutus en iOS y Android.
                                </p>
                                <Link href="#mobile" className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                    Ver recursos →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección final con llamado a la acción */}
                <div className={`mt-10 p-6 rounded-lg text-center border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-blue-800'}`}>¿No encuentras lo que buscas?</h3>
                    <p className={`text-sm mb-4 max-w-xl mx-auto ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                        Si necesitas ayuda adicional o tienes sugerencias sobre nuevos recursos que podríamos incluir, no dudes en contactarnos.
                    </p>
                    <div className="flex justify-center gap-3 relative">
                        <Link href="/dashboard/configuracion/ayuda" className={`px-4 py-2 rounded-md text-sm font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-blue-700 hover:bg-gray-50 border border-blue-200'}`}>
                            Volver al centro de ayuda
                        </Link>
                        <div className="relative" ref={supportMenuRef}>
                            <button 
                                onClick={() => setSupportMenuOpen(!supportMenuOpen)}
                                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            >
                                Contactar soporte
                                <ChevronDown className={`h-4 w-4 transform transition-transform ${supportMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {supportMenuOpen && (
                                <div className={`absolute bottom-full left-0 mb-2 w-48 rounded-md shadow-lg py-1 z-10 ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}`}>
                                    <Link 
                                        href="mailto:soporte@plutus.com" 
                                        className={`flex items-center px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Correo electrónico
                                    </Link>
                                    <Link 
                                        href="https://facebook.com/plutusapp" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className={`flex items-center px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <Facebook className="h-4 w-4 mr-2" />
                                        Facebook
                                    </Link>
                                    <Link 
                                        href="https://wa.me/1234567890" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className={`flex items-center px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        WhatsApp
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuiasRecursosPage;