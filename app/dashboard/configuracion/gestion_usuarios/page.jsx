'use client'
import { useState, useEffect } from 'react';
import { 
  MdPersonAdd, MdEdit, MdDelete, MdSearch, 
  MdFilterList, MdCheck, MdClose, MdArrowBack 
} from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';

const PageGestionUsuarios = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Estado para los usuarios
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'delete'
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Estados para nuevo/editar usuario
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    createdAt: '',
    photoURL: ''
  });
  
  // Mock data para usuarios
  const mockUsers = [
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2023-01-10',
      photoURL: '/images/user-1.jpg'
    },
    {
      id: '2',
      name: 'María González',
      email: 'maria@example.com',
      role: 'user',
      status: 'active',
      createdAt: '2023-02-15',
      photoURL: '/images/user-2.jpg'
    },
    {
      id: '3',
      name: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      role: 'user',
      status: 'inactive',
      createdAt: '2023-03-20',
      photoURL: '/images/user-3.jpg'
    },
    {
      id: '4',
      name: 'Ana Martínez',
      email: 'ana@example.com',
      role: 'editor',
      status: 'active',
      createdAt: '2023-04-05',
      photoURL: '/images/user-4.jpg'
    },
    {
      id: '5',
      name: 'Roberto Fernández',
      email: 'roberto@example.com',
      role: 'user',
      status: 'pending',
      createdAt: '2023-05-18',
      photoURL: '/images/user-5.jpg'
    }
  ];
  
  // Asegurar que el componente está montado antes de renderizar elementos dependientes del tema
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar usuarios cuando el componente se monte
  useEffect(() => {
    // En un caso real, aquí cargaríamos los datos de una API
    setIsLoading(true);
    
    // Simulando una carga desde API
    setTimeout(() => {
      try {
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        setIsLoading(false);
      } catch (error) {
        setError("Error al cargar los usuarios");
        setIsLoading(false);
      }
    }, 800);
  }, []);
  
  // Filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);
  
  // Manejadores de eventos para el formulario modal
  const handleOpenModal = (mode, user = null) => {
    if (mode === 'add') {
      setFormData({
        id: '',
        name: '',
        email: '',
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        photoURL: ''
      });
    } else if (user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        photoURL: user.photoURL
      });
      setSelectedUser(user);
    }
    
    setModalMode(mode);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalMode === 'add') {
      // Agregar nuevo usuario (en un caso real, se enviaría a una API)
      const newUser = {
        ...formData,
        id: Date.now().toString(), // ID temporal
      };
      setUsers([newUser, ...users]);
    } else if (modalMode === 'edit') {
      // Actualizar usuario existente
      const updatedUsers = users.map(user => 
        user.id === formData.id ? formData : user
      );
      setUsers(updatedUsers);
    } else if (modalMode === 'delete' && selectedUser) {
      // Eliminar usuario
      const filteredUsers = users.filter(user => user.id !== selectedUser.id);
      setUsers(filteredUsers);
    }
    
    handleCloseModal();
  };
  
  // Renderizar estado de usuario con color
  const renderStatus = (status) => {
    let bgColor = '';
    let textColor = 'text-white';
    
    switch(status) {
      case 'active':
        bgColor = 'bg-green-500';
        break;
      case 'inactive':
        bgColor = 'bg-gray-500';
        break;
      case 'pending':
        bgColor = 'bg-yellow-500';
        break;
      default:
        bgColor = 'bg-gray-500';
    }
    
    return (
      <span className={`${bgColor} ${textColor} px-2 py-1 rounded-full text-xs font-medium`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // Renderizar rol de usuario con color
  const renderRole = (role) => {
    let bgColor = '';
    let textColor = 'text-white';
    
    switch(role) {
      case 'admin':
        bgColor = 'bg-purple-600';
        break;
      case 'editor':
        bgColor = 'bg-blue-600';
        break;
      case 'user':
        bgColor = 'bg-cyan-600';
        break;
      default:
        bgColor = 'bg-gray-600';
    }
    
    return (
      <span className={`${bgColor} ${textColor} px-2 py-1 rounded-full text-xs font-medium`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };
  
  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-6 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900 text-white' : ''}`}>
      {/* Header con botón de volver */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => router.push('/dashboard')}
            className={`mr-4 p-2 rounded-full ${
              darkMode 
                ? 'text-gray-400 hover:bg-gray-800' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MdArrowBack className="w-6 h-6" />
          </button>
          <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Gestión de Usuarios</h1>
        </div>
        <button
          onClick={() => handleOpenModal('add')}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        >
          <MdPersonAdd className="mr-2 h-5 w-5" />
          Añadir Usuario
        </button>
      </div>
      
      {/* Barra de búsqueda y filtrado */}
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuarios por nombre, correo o rol..."
              className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-cyan-500 focus:border-cyan-500' 
                  : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-cyan-500 focus:border-cyan-500'
              } sm:text-sm`}
            />
          </div>
          <div className="md:w-48">
            <button
              type="button"
              className={`w-full inline-flex justify-center items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              } focus:outline-none`}
            >
              <MdFilterList className={`mr-2 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              Filtrar
            </button>
          </div>
        </div>
      </div>
      
      {/* Lista de usuarios */}
      {isLoading ? (
        <div className="text-center py-10 h-screen">
          <div className="spinner border-t-4 border-cyan-500 border-solid rounded-full w-12 h-12 mx-auto animate-spin"></div>
          <p className={`mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cargando usuarios...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden sm:rounded-md`}>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No se encontraron usuarios que coincidan con su búsqueda.</p>
            </div>
          ) : (
            <ul className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredUsers.map(user => (
                <li key={user.id}>
                  <div className={`px-4 py-4 sm:px-6 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img 
                            className="h-12 w-12 rounded-full object-cover" 
                            src={user.photoURL || '/images/logoPlutus.png'} 
                            alt={user.name} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/logoPlutus.png';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user.name}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user.email}
                          </div>
                          <div className="mt-1 flex">
                            <span className="mr-2">{renderRole(user.role)}</span>
                            {renderStatus(user.status)}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal('edit', user)}
                          className={`inline-flex items-center p-2 border border-transparent rounded-full shadow-sm ${
                            darkMode
                              ? 'text-gray-300 hover:bg-gray-600'
                              : 'text-gray-600 hover:bg-gray-100'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500`}
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenModal('delete', user)}
                          className={`inline-flex items-center p-2 border border-transparent rounded-full shadow-sm ${
                            darkMode
                              ? 'text-gray-300 hover:bg-gray-600'
                              : 'text-gray-600 hover:bg-gray-100'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                        >
                          <MdDelete className="h-5 w-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Fecha de registro: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {/* Modal para añadir/editar/eliminar usuario */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Encabezado del modal */}
              <div className="bg-cyan-600 px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-white">
                    {modalMode === 'add' ? 'Añadir Usuario' : 
                     modalMode === 'edit' ? 'Editar Usuario' : 'Eliminar Usuario'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="bg-cyan-600 rounded-md text-white hover:text-gray-200 focus:outline-none"
                  >
                    <MdClose className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              {/* Contenido del modal */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                {modalMode === 'delete' ? (
                  <div>
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <MdDelete className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className={`text-lg leading-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Eliminar usuario
                        </h3>
                        <div className="mt-2">
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ¿Estás seguro de que deseas eliminar a {selectedUser?.name}? Esta acción no se puede deshacer.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500' 
                              : 'border-gray-300 focus:ring-cyan-500 focus:border-cyan-500'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500' 
                              : 'border-gray-300 focus:ring-cyan-500 focus:border-cyan-500'
                          }`}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="role" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Rol
                          </label>
                          <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full py-2 px-3 border rounded-md shadow-sm sm:text-sm ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500' 
                                : 'border-gray-300 bg-white focus:ring-cyan-500 focus:border-cyan-500'
                            }`}
                          >
                            <option value="user">Usuario</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="status" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Estado
                          </label>
                          <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full py-2 px-3 border rounded-md shadow-sm sm:text-sm ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500' 
                                : 'border-gray-300 bg-white focus:ring-cyan-500 focus:border-cyan-500'
                            }`}
                          >
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                            <option value="pending">Pendiente</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
              
              {/* Botones del modal */}
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                {modalMode === 'delete' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500`}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-cyan-600 text-base font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {modalMode === 'add' ? 'Guardar' : 'Actualizar'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500`}
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageGestionUsuarios;