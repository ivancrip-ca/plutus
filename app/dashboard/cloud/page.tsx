"use client";

import { useState, useEffect } from "react";
import { Search, Upload, FolderPlus, MoreVertical, FileText, Image, Film, Music, Archive, File } from "lucide-react";
import { FaCloud } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const PageCloud = () => {
    const [selectedFilter, setSelectedFilter] = useState("all");
    const { darkMode } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    // Ensure component is mounted before rendering theme-dependent UI
    useEffect(() => {
        setMounted(true);
    }, []);
    
    // Mock data for demonstration
    const storageUsed = 34; // GB
    const storageTotal = 100; // GB
    const storagePercentage = (storageUsed / storageTotal) * 100;
    
    // Separate folders from files
    const folders = [
        { id: 2, name: "Vacation Photos", type: "folder", size: "128 MB", modified: "2023-11-25" },
        { id: 6, name: "Work Documents", type: "folder", size: "256 MB", modified: "2023-11-22" },
        { id: 7, name: "Projects", type: "folder", size: "64 MB", modified: "2023-11-18" },
    ];
    
    const files = [
        { id: 1, name: "Project Report.pdf", type: "document", size: "2.4 MB", modified: "2023-11-28" },
        { id: 3, name: "Presentation.pptx", type: "document", size: "5.7 MB", modified: "2023-11-24" },
        { id: 4, name: "Budget_2024.xlsx", type: "document", size: "1.2 MB", modified: "2023-11-20" },
        { id: 5, name: "Profile Picture.jpg", type: "image", size: "3.8 MB", modified: "2023-11-15" },
    ];
    
    const getFileIcon = (type) => {
        switch(type) {
            case "document": return <FileText className="h-10 w-10 text-blue-500" />;
            case "image": return <Image className="h-10 w-10 text-green-500" />;
            case "video": return <Film className="h-10 w-10 text-red-500" />;
            case "audio": return <Music className="h-10 w-10 text-purple-500" />;
            case "archive": return <Archive className="h-10 w-10 text-orange-500" />;
            case "folder": return <div className="bg-blue-100 p-2 rounded-lg"><FolderPlus className="h-6 w-6 text-blue-500" /></div>;
            default: return <File className="h-10 w-10 text-gray-500" />;
        }
    };

    // Don't render theme-specific elements until client-side hydration is complete
    if (!mounted) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                {/* Minimal loading placeholder */}
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                    <div className="h-20 bg-gray-200 rounded-lg mb-6"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    return ( 
        <div className={`p-6 max-w-7xl mx-auto ${darkMode ? 'text-white bg-gray-900' : ''}`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                    <FaCloud className="h-8 w-8 text-blue-500" />
                    Mi Nube
                </h1>
                <div className="flex space-x-2">
                    <button className={`${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'} px-4 py-2 rounded-lg border flex items-center gap-1`}>
                        <Search className="h-4 w-4" />
                        <span>Buscar</span>
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-1">
                        <Upload className="h-4 w-4" />
                        <span>Subir</span>
                    </button>
                </div>
            </div>

            {/* Storage stats */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-5 rounded-lg shadow-sm mb-6 border`}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Almacenamiento</h2>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{storageUsed} GB de {storageTotal} GB usados</span>
                </div>
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
                    <div 
                        className="bg-blue-500 h-2.5 rounded-full" 
                        style={{ width: `${storagePercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* File filters */}
            <div className="flex space-x-1 mb-6 overflow-x-auto">
                {["all", "documents", "images", "videos", "audio", "archives"].map((filter) => (
                    <button
                        key={filter}
                        className={`px-4 py-2 rounded-full whitespace-nowrap ${
                            selectedFilter === filter 
                                ? "bg-blue-100 text-blue-600" 
                                : darkMode 
                                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
                                    : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setSelectedFilter(filter)}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
            </div>

            {/* Folders section */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-sm border mb-6`}>
                <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b flex justify-between items-center`}>
                    <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Mis Carpetas</h2>
                    <button className="text-blue-500 hover:text-blue-700 flex items-center gap-1">
                        <FolderPlus className="h-4 w-4" />
                        <span>Nueva Carpeta</span>
                    </button>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {folders.map((folder) => (
                        <div key={folder.id} className={`${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} border rounded-lg p-4 cursor-pointer transition-colors`}>
                            <div className="flex items-center mb-2">
                                <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-100'} p-3 rounded-lg`}>
                                    <FolderPlus className="h-6 w-6 text-blue-500" />
                                </div>
                                <div className="ml-3 flex-grow truncate">
                                    <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>{folder.name}</div>
                                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{folder.size}</div>
                                </div>
                                <button className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Modificado: {folder.modified}</div>
                        </div>
                    ))}
                </div>
                {folders.length === 0 && (
                    <div className="text-center py-10">
                        <div className={`mx-auto h-16 w-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mb-3`}>
                            <FolderPlus className={`h-8 w-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        </div>
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>No hay carpetas</h3>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Crea una carpeta para organizar tus archivos</p>
                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto">
                            <FolderPlus className="h-4 w-4" />
                            <span>Nueva Carpeta</span>
                        </button>
                    </div>
                )}
            </div>

            {/* File browser */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-sm border`}>
                <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b flex justify-between items-center`}>
                    <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Archivos recientes</h2>
                    <button className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className={`${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-500'} text-xs font-medium uppercase tracking-wider`}>
                                <th className="py-3 px-6 text-left">Nombre</th>
                                <th className="py-3 px-6 text-left">Tamaño</th>
                                <th className="py-3 px-6 text-left">Modificado</th>
                                <th className="py-3 px-6 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className={darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-100'}>
                            {files.map((file) => (
                                <tr key={file.id} className={darkMode ? 'hover:bg-gray-700 cursor-pointer' : 'hover:bg-gray-50 cursor-pointer'}>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center">
                                            {getFileIcon(file.type)}
                                            <div className="ml-3">
                                                <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{file.name}</div>
                                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{file.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`py-4 px-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{file.size}</td>
                                    <td className={`py-4 px-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{file.modified}</td>
                                    <td className="py-4 px-6 text-right text-sm font-medium">
                                        <button className="text-blue-500 hover:text-blue-700">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {files.length === 0 && (
                    <div className="text-center py-12">
                        <div className={`mx-auto h-16 w-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mb-3`}>
                            <Upload className={`h-8 w-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        </div>
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>No hay archivos</h3>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Sube tus archivos para empezar</p>
                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                            Subir archivo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
 
export default PageCloud;