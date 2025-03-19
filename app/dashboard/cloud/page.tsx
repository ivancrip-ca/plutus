"use client";

import { useState } from "react";
import { Search, Upload, FolderPlus, MoreVertical, FileText, Image, Film, Music, Archive, File } from "lucide-react";
import { FaCloud } from 'react-icons/fa';

const PageCloud = () => {
    const [selectedFilter, setSelectedFilter] = useState("all");
    
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

    return ( 
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                 <FaCloud className="h-8 w-8 text-blue-500" />
                    Mi Nube
                </h1>
                <div className="flex space-x-2">
                    <button className="bg-white text-gray-600 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-1">
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
            <div className="bg-white p-5 rounded-lg shadow-sm mb-6 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-medium text-gray-800">Almacenamiento</h2>
                    <span className="text-gray-500 text-sm">{storageUsed} GB de {storageTotal} GB usados</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
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
                                : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setSelectedFilter(filter)}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
            </div>

            {/* Folders section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-800">Mis Carpetas</h2>
                    <button className="text-blue-500 hover:text-blue-700 flex items-center gap-1">
                        <FolderPlus className="h-4 w-4" />
                        <span>Nueva Carpeta</span>
                    </button>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {folders.map((folder) => (
                        <div key={folder.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="flex items-center mb-2">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <FolderPlus className="h-6 w-6 text-blue-500" />
                                </div>
                                <div className="ml-3 flex-grow truncate">
                                    <div className="text-sm font-medium text-gray-900 truncate">{folder.name}</div>
                                    <div className="text-xs text-gray-500">{folder.size}</div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="text-xs text-gray-500">Modificado: {folder.modified}</div>
                        </div>
                    ))}
                </div>
                {folders.length === 0 && (
                    <div className="text-center py-10">
                        <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <FolderPlus className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No hay carpetas</h3>
                        <p className="text-gray-500 mt-1">Crea una carpeta para organizar tus archivos</p>
                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto">
                            <FolderPlus className="h-4 w-4" />
                            <span>Nueva Carpeta</span>
                        </button>
                    </div>
                )}
            </div>

            {/* File browser */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-800">Archivos recientes</h2>
                    <button className="text-gray-500 hover:text-gray-700">
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs font-medium uppercase tracking-wider">
                                <th className="py-3 px-6 text-left">Nombre</th>
                                <th className="py-3 px-6 text-left">Tamaño</th>
                                <th className="py-3 px-6 text-left">Modificado</th>
                                <th className="py-3 px-6 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {files.map((file) => (
                                <tr key={file.id} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center">
                                            {getFileIcon(file.type)}
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{file.name}</div>
                                                <div className="text-xs text-gray-500">{file.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500">{file.size}</td>
                                    <td className="py-4 px-6 text-sm text-gray-500">{file.modified}</td>
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
                        <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No hay archivos</h3>
                        <p className="text-gray-500 mt-1">Sube tus archivos para empezar</p>
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