"use client";

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
    ArrowLeft,
    Play,
    Book,
    Search,
    Clock,
    User,
    Filter,
    ChevronDown,
    Calendar,
    Star,
    Mail,
    Facebook,
    MessageCircle,
    ExternalLink,
    Bookmark,
    Share2,
    ThumbsUp,
    Info,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const VideoTutorialesPage = () => {
    const { darkMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('todos');
    const [activeSort, setActiveSort] = useState('recientes');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackType, setFeedbackType] = useState('');
    const [supportMenuOpen, setSupportMenuOpen] = useState(false);
    const supportMenuRef = useRef(null);
    const videoRefs = useRef({});

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

    // Cerrar el menú de filtros cuando se hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event) {
            if (filtersOpen) {
                setFiltersOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [filtersOpen]);

    // Categorías de videos
    const categories = [
        { id: 'todos', name: 'Todos los videos' },
        { id: 'primeros-pasos', name: 'Primeros pasos' },
        { id: 'cuentas', name: 'Gestión de cuentas' },
        { id: 'transacciones', name: 'Transacciones' },
        { id: 'presupuestos', name: 'Presupuestos' },
        { id: 'reportes', name: 'Reportes y análisis' },
        { id: 'avanzado', name: 'Funciones avanzadas' }
    ];

    // Opciones de ordenación
    const sortOptions = [
        { id: 'recientes', name: 'Más recientes' },
        { id: 'antiguos', name: 'Más antiguos' },
        { id: 'populares', name: 'Más populares' },
        { id: 'cortos', name: 'Más cortos primero' },
        { id: 'largos', name: 'Más largos primero' }
    ];

    // Niveles de dificultad
    const nivelesOptions = [
        { id: 'principiante', name: 'Principiante', color: 'green' },
        { id: 'intermedio', name: 'Intermedio', color: 'blue' },
        { id: 'avanzado', name: 'Avanzado', color: 'purple' }
    ];

    // Lista de videotutoriales
    const videos = [
        {
            id: 'video-inicio',
            title: 'Introducción a Plutus',
            description: 'Descubre cómo Plutus puede ayudarte a gestionar tus finanzas personales de manera eficiente.',
            thumbnail: '/images/videos/intro-plutus.jpg',
            duration: '4:35',
            publishDate: '30 de abril de 2025',
            views: 1542,
            category: 'primeros-pasos',
            instructor: 'Ana Martínez',
            level: 'principiante',
            videoSrc: 'https://youtu.be/plutus-intro',
            recursos: ['Guía de inicio rápido', 'Plantilla de configuración inicial']
        },
        {
            id: 'video-cuentas',
            title: 'Configuración de cuentas bancarias',
            description: 'Aprende a configurar y gestionar tus cuentas bancarias, tarjetas de crédito y efectivo en Plutus.',
            thumbnail: '/images/videos/conf-cuentas.jpg',
            duration: '8:12',
            publishDate: '28 de abril de 2025',
            views: 982,
            category: 'cuentas',
            instructor: 'Carlos Ruiz',
            level: 'principiante',
            videoSrc: 'https://youtu.be/plutus-cuentas',
            recursos: ['Checklist de configuración de cuentas']
        },
        {
            id: 'video-transacciones',
            title: 'Registro y categorización de transacciones',
            description: 'Tutorial detallado sobre cómo registrar transacciones y organizarlas en categorías personalizadas.',
            thumbnail: '/images/videos/trans-categ.jpg',
            duration: '11:45',
            publishDate: '25 de abril de 2025',
            views: 745,
            category: 'transacciones',
            instructor: 'Laura Gómez',
            level: 'principiante',
            videoSrc: 'https://youtu.be/plutus-transacciones',
            recursos: ['Lista de categorías recomendadas']
        },
        {
            id: 'video-presupuesto-mensual',
            title: 'Creación de un presupuesto mensual',
            description: 'Guía paso a paso para crear un presupuesto mensual efectivo que se adapte a tus necesidades.',
            thumbnail: '/images/videos/presupuesto-mensual.jpg',
            duration: '15:20',
            publishDate: '22 de abril de 2025',
            views: 1208,
            category: 'presupuestos',
            instructor: 'Miguel Ángel Pérez',
            level: 'intermedio',
            videoSrc: 'https://youtu.be/plutus-presupuesto',
            recursos: ['Plantilla de presupuesto mensual', 'Calculadora de gastos fijos']
        },
        {
            id: 'video-reportes',
            title: 'Análisis de reportes financieros',
            description: 'Descubre cómo interpretar los reportes que genera Plutus y utilizarlos para tomar mejores decisiones financieras.',
            thumbnail: '/images/videos/reportes-analisis.jpg',
            duration: '12:50',
            publishDate: '20 de abril de 2025',
            views: 634,
            category: 'reportes',
            instructor: 'Elena Torres',
            level: 'intermedio',
            videoSrc: 'https://youtu.be/plutus-reportes',
            recursos: ['Guía de interpretación de gráficos', 'Ejemplos de análisis']
        },
        {
            id: 'video-metas',
            title: 'Establecimiento de metas financieras',
            description: 'Aprende a configurar y dar seguimiento a tus metas financieras a corto, mediano y largo plazo.',
            thumbnail: '/images/videos/metas-financieras.jpg',
            duration: '9:15',
            publishDate: '18 de abril de 2025',
            views: 928,
            category: 'avanzado',
            instructor: 'Roberto Sánchez',
            level: 'intermedio',
            videoSrc: 'https://youtu.be/plutus-metas',
            recursos: ['Plantilla de metas SMART', 'Calculadora de ahorros']
        },
        {
            id: 'video-inversiones',
            title: 'Seguimiento de inversiones',
            description: 'Tutorial avanzado sobre cómo registrar y analizar tus inversiones dentro de Plutus.',
            thumbnail: '/images/videos/inversiones.jpg',
            duration: '18:40',
            publishDate: '15 de abril de 2025',
            views: 512,
            category: 'avanzado',
            instructor: 'Sofía Ramírez',
            level: 'avanzado',
            videoSrc: 'https://youtu.be/plutus-inversiones',
            recursos: ['Glosario de términos de inversión', 'Plantilla de seguimiento de cartera']
        },
        {
            id: 'video-impuestos',
            title: 'Preparación de impuestos con Plutus',
            description: 'Cómo utilizar Plutus para facilitar la declaración de impuestos y optimizar tus deducciones.',
            thumbnail: '/images/videos/impuestos.jpg',
            duration: '16:25',
            publishDate: '12 de abril de 2025',
            views: 726,
            category: 'avanzado',
            instructor: 'Javier López',
            level: 'avanzado',
            videoSrc: 'https://youtu.be/plutus-impuestos',
            recursos: ['Checklist de documentos fiscales', 'Calendario fiscal']
        },
        {
            id: 'video-app-movil',
            title: 'Uso de la aplicación móvil',
            description: 'Guía completa sobre el uso de Plutus en dispositivos móviles para gestionar tus finanzas en cualquier lugar.',
            thumbnail: '/images/videos/app-movil.jpg',
            duration: '7:30',
            publishDate: '10 de abril de 2025',
            views: 1135,
            category: 'primeros-pasos',
            instructor: 'Ana Martínez',
            level: 'principiante',
            videoSrc: 'https://youtu.be/plutus-movil',
            recursos: ['Guía de funciones offline']
        },
        {
            id: 'video-integraciones',
            title: 'Integraciones con otras aplicaciones',
            description: 'Descubre cómo conectar Plutus con otras herramientas financieras para ampliar sus funcionalidades.',
            thumbnail: '/images/videos/integraciones.jpg',
            duration: '14:10',
            publishDate: '8 de abril de 2025',
            views: 487,
            category: 'avanzado',
            instructor: 'Carlos Ruiz',
            level: 'avanzado',
            videoSrc: 'https://youtu.be/plutus-integraciones',
            recursos: ['Lista de aplicaciones compatibles', 'Tutorial de API']
        },
        {
            id: 'video-ahorro',
            title: 'Estrategias de ahorro automático',
            description: 'Configura reglas de ahorro automático para alcanzar tus objetivos financieros sin esfuerzo.',
            thumbnail: '/images/videos/ahorro-auto.jpg',
            duration: '10:55',
            publishDate: '5 de abril de 2025',
            views: 862,
            category: 'presupuestos',
            instructor: 'Laura Gómez',
            level: 'intermedio',
            videoSrc: 'https://youtu.be/plutus-ahorro',
            recursos: ['Calculadora de ahorro mensual', 'Plantilla de retos de ahorro']
        },
        {
            id: 'video-deudas',
            title: 'Gestión y eliminación de deudas',
            description: 'Aprende a registrar tus deudas y elaborar estrategias efectivas para eliminarlas más rápido.',
            thumbnail: '/images/videos/gestion-deudas.jpg',
            duration: '13:45',
            publishDate: '2 de abril de 2025',
            views: 978,
            category: 'presupuestos',
            instructor: 'Miguel Ángel Pérez',
            level: 'intermedio',
            videoSrc: 'https://youtu.be/plutus-deudas',
            recursos: ['Calculadora de método avalancha vs bola de nieve', 'Plantilla de seguimiento de deudas']
        }
    ];

    // Filtrar videos por búsqueda y categoría
    const filteredVideos = videos.filter(video => {
        const matchesSearch = searchQuery === '' ||
            video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = activeCategory === 'todos' || video.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    // Ordenar videos según la opción seleccionada
    const sortedVideos = [...filteredVideos].sort((a, b) => {
        if (activeSort === 'recientes') {
            // Ordenar por fecha (más recientes primero)
            return new Date(b.publishDate) - new Date(a.publishDate);
        } else if (activeSort === 'antiguos') {
            // Ordenar por fecha (más antiguos primero)
            return new Date(a.publishDate) - new Date(b.publishDate);
        } else if (activeSort === 'populares') {
            // Ordenar por vistas (más populares primero)
            return b.views - a.views;
        } else if (activeSort === 'cortos') {
            // Ordenar por duración (más cortos primero)
            return convertToSeconds(a.duration) - convertToSeconds(b.duration);
        } else if (activeSort === 'largos') {
            // Ordenar por duración (más largos primero)
            return convertToSeconds(b.duration) - convertToSeconds(a.duration);
        }
        return 0;
    });

    // Convertir duración en formato "mm:ss" a segundos
    const convertToSeconds = (duration) => {
        const [minutes, seconds] = duration.split(':').map(Number);
        return minutes * 60 + seconds;
    };

    // Obtener color para nivel de dificultad
    const getLevelColor = (level, isDark) => {
        const option = nivelesOptions.find(opt => opt.id === level);
        if (!option) return '';

        const colorMap = {
            green: isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700',
            blue: isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700',
            purple: isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700',
        };

        return colorMap[option.color] || '';
    };

    // Manejar reproducción de video
    const togglePlayVideo = (videoId) => {
        if (isPlaying === videoId) {
            videoRefs.current[videoId].pause();
            setIsPlaying(null);
        } else {
            // Pausar el video actual si hay alguno
            if (isPlaying && videoRefs.current[isPlaying]) {
                videoRefs.current[isPlaying].pause();
            }

            videoRefs.current[videoId].play();
            setIsPlaying(videoId);

            // Mostrar feedback de inicio de reproducción
            setFeedbackMessage('Reproduciendo video');
            setFeedbackType('success');
            setShowFeedback(true);

            setTimeout(() => {
                setShowFeedback(false);
            }, 3000);
        }
    };

    // Guardar video como favorito
    const saveAsFavorite = (videoId, title) => {
        // Aquí iría la lógica para guardar el video como favorito
        setFeedbackMessage(`"${title}" guardado en favoritos`);
        setFeedbackType('success');
        setShowFeedback(true);

        setTimeout(() => {
            setShowFeedback(false);
        }, 3000);
    };

    // Compartir video
    const shareVideo = (videoId, title) => {
        // Aquí iría la lógica para compartir el video
        setFeedbackMessage(`Enlace de "${title}" copiado al portapapeles`);
        setFeedbackType('info');
        setShowFeedback(true);

        setTimeout(() => {
            setShowFeedback(false);
        }, 3000);
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
                            <Play className="h-8 w-8 text-red-500" />
                            Videotutoriales
                        </h1>
                    </div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Aprende a utilizar todas las funciones de Plutus con nuestros videotutoriales explicativos paso a paso.
                    </p>
                </div>

                {/* Barra de búsqueda */}
                <div className="mb-8">
                    <div className={`flex items-center p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} focus-within:ring-2 focus-within:ring-blue-500 shadow-sm`}>
                        <Search className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                            type="text"
                            placeholder="Buscar videotutoriales..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`flex-1 outline-none border-none ${darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                        />
                    </div>
                </div>

                {/* Filtros y ordenación */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                        <div className={`flex flex-wrap gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="text-sm font-medium my-auto">Categorías:</span>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setActiveCategory(category.id)}
                                        className={`px-3 py-1 text-xs rounded-full transition-colors ${activeCategory === category.id
                                                ? `${darkMode ? 'bg-blue-900 bg-opacity-50 text-blue-300' : 'bg-blue-100 text-blue-700'}`
                                                : `${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`
                                            }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setFiltersOpen(!filtersOpen)}
                                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                            >
                                <Filter className="h-4 w-4" />
                                Ordenar por: {sortOptions.find(opt => opt.id === activeSort)?.name}
                                <ChevronDown className={`h-4 w-4 ml-1 transform transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {filtersOpen && (
                                <div className={`absolute right-0 mt-1 w-48 rounded-md shadow-lg z-10 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                                    <div className="py-1">
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => {
                                                    setActiveSort(option.id);
                                                    setFiltersOpen(false);
                                                }}
                                                className={`block w-full text-left px-4 py-2 text-sm ${activeSort === option.id
                                                        ? (darkMode ? 'bg-gray-700 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                        : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                                                    }`}
                                            >
                                                {option.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notificación de feedback */}
                {showFeedback && (
                    <div className={`fixed bottom-6 right-6 flex items-center px-4 py-3 rounded-md shadow-lg transition-all transform ${darkMode
                            ? (feedbackType === 'success' ? 'bg-green-800 text-green-200' : 'bg-blue-800 text-blue-200')
                            : (feedbackType === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800')
                        }`}>
                        {feedbackType === 'success' ? (
                            <CheckCircle className="h-5 w-5 mr-2" />
                        ) : (
                            <Info className="h-5 w-5 mr-2" />
                        )}
                        <span className="text-sm font-medium">{feedbackMessage}</span>
                    </div>
                )}

                {/* Lista de videos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedVideos.length === 0 ? (
                        <div className={`col-span-full text-center py-10 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <AlertCircle className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                No se encontraron videos
                            </h3>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} max-w-md mx-auto mb-4`}>
                                No pudimos encontrar videos que coincidan con tu búsqueda. Intenta con otros términos o categorías.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setActiveCategory('todos');
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            >
                                Ver todos los videos
                            </button>
                        </div>
                    ) : (
                        sortedVideos.map((video) => (
                            <div
                                key={video.id}
                                className={`rounded-lg overflow-hidden border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                            >
                                <div className="relative">
                                    {/* Pseudo-thumbnail */}
                                    <div className={`w-full aspect-video bg-gray-300 flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <button
                                                onClick={() => togglePlayVideo(video.id)}
                                                className={`rounded-full p-3 ${darkMode ? 'bg-gray-900 bg-opacity-70 text-white' : 'bg-white bg-opacity-70 text-gray-800'} hover:scale-110 transition-transform`}
                                                aria-label="Reproducir video"
                                            >
                                                <Play className="h-8 w-8 fill-current" />
                                            </button>
                                        </div>
                                        <video
                                            ref={el => videoRefs.current[video.id] = el}
                                            className="hidden"
                                            src={video.videoSrc}
                                            onEnded={() => setIsPlaying(null)}
                                        >
                                            Tu navegador no soporta el elemento de video.
                                        </video>
                                    </div>

                                    {/* Duración */}
                                    <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium ${darkMode ? 'bg-gray-900 bg-opacity-80 text-white' : 'bg-gray-800 text-white'}`}>
                                        {video.duration}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="flex justify-between mb-2">
                                        <span className={`text-xs ${getLevelColor(video.level, darkMode)} px-2 py-0.5 rounded-full`}>
                                            {nivelesOptions.find(opt => opt.id === video.level)?.name}
                                        </span>
                                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                                            <Eye className="h-3 w-3 mr-1" /> {video.views.toLocaleString()}
                                        </span>
                                    </div>

                                    <h3 className={`font-semibold mb-2 line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {video.title}
                                    </h3>

                                    <p className={`text-sm mb-3 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {video.description}
                                    </p>

                                    <div className="flex items-center mb-4">
                                        <div className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center mr-2`}>
                                            <User className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {video.instructor}
                                            </p>
                                            <div className="flex items-center text-xs mt-0.5">
                                                <Calendar className={`h-3 w-3 mr-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                                <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                                                    {video.publishDate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t text-sm">
                                        <button
                                            onClick={() => togglePlayVideo(video.id)}
                                            className={`px-3 py-1 rounded-md flex items-center ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                        >
                                            <Play className="h-4 w-4 mr-1" />
                                            Ver ahora
                                        </button>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => saveAsFavorite(video.id, video.title)}
                                                className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                                                aria-label="Guardar"
                                            >
                                                <Bookmark className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => shareVideo(video.id, video.title)}
                                                className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                                                aria-label="Compartir"
                                            >
                                                <Share2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sección final con llamado a la acción */}
                <div className={`mt-10 p-6 rounded-lg text-center border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-blue-800'}`}>¿No encuentras lo que buscas?</h3>
                    <p className={`text-sm mb-4 max-w-xl mx-auto ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                        Si necesitas ayuda adicional o tienes sugerencias sobre nuevos tutoriales, no dudes en contactarnos.
                    </p>
                    <div className="flex justify-center gap-3 relative">
                        <Link href="/dashboard/configuracion/ayuda" className={`px-4 py-2 rounded-md text-sm font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-blue-700 hover:bg-gray-50 border border-blue-200'}`}>
                            Volver al Centro de Ayuda
                        </Link>
                        <div className="relative" ref={supportMenuRef}>
                            <button 
                                onClick={() => setSupportMenuOpen(!supportMenuOpen)}
                                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            >
                                Contactar Soporte
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

const Eye = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

export default VideoTutorialesPage;