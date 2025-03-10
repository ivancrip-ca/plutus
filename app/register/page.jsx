'use client'
import { useEffect, useState } from 'react';
import { FaUserPlus } from 'react-icons/fa';
import { MdEmail, MdLock, MdPerson, MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WaveAnimation from '../../components/WaveAnimation';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { saveUserToFirestore } from '../utils/userFunctions';

const PageRegister = () => {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [step, setStep] = useState(1);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
        
        // Detectar estado de conexión
        const handleConnectionChange = () => {
            setIsOffline(!navigator.onLine);
        };
        
        window.addEventListener('online', handleConnectionChange);
        window.addEventListener('offline', handleConnectionChange);
        setIsOffline(!navigator.onLine);
        
        return () => {
            window.removeEventListener('online', handleConnectionChange);
            window.removeEventListener('offline', handleConnectionChange);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (name === 'password') {
            // Evaluación simple de fortaleza de contraseña
            let strength = 0;
            if (value.length >= 8) strength += 25;
            if (/[A-Z]/.test(value)) strength += 25;
            if (/[0-9]/.test(value)) strength += 25;
            if (/[^A-Za-z0-9]/.test(value)) strength += 25;
            setPasswordStrength(strength);
        }
    };

    const nextStep = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const prevStep = () => {
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        console.log('Starting registration process...');
        
        // Mostrar advertencia si estamos offline
        if (isOffline) {
            console.warn('Device is offline. Registration will proceed but some features may be limited.');
        }
        
        try {
            // Validar contraseñas
            if (formData.password !== formData.confirmPassword) {
                setError('Las contraseñas no coinciden');
                setLoading(false);
                console.log('Password mismatch');
                return;
            }
            
            console.log('Creating user account...');
            
            // Crear usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            
            const user = userCredential.user;
            console.log('User created:', user.uid);
            
            // Actualizar el perfil con el nombre completo
            const fullName = `${formData.firstName} ${formData.lastName}`;
            await updateProfile(user, {
                displayName: fullName
            });
            
            console.log('Profile updated with name:', fullName);
            
            try {
                // Preparar datos del usuario para Firestore con registrationMethod explícitamente establecido
                const userData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    displayName: fullName,
                    registrationMethod: 'email', // Importante: guardar el método de registro
                    registrationDate: new Date().toISOString(), // También es útil guardar la fecha de registro
                    email: formData.email, // Duplicar esta información puede ser útil para consultas en Firestore
                };
                
                // Intentar guardar datos en Firestore
                await saveUserToFirestore(user, userData, true); // true = permitir offline
                
                console.log('User data saved with registration method:', userData.registrationMethod);
            } catch (firestoreError) {
                console.error('Non-fatal error saving to Firestore:', firestoreError);
                // Continuar aunque falle Firestore
            }
            
            // Finalizar registro exitoso
            if (isOffline) {
                setError(''); // Limpiar cualquier error previo
                console.log('Registration successful (offline mode), redirecting...');
            } else {
                console.log('Registration successful, redirecting to dashboard...');
            }
            
            // Redirect after a short delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);
        } catch (error) {
            console.error('Registration error:', error);
            
            // Mostrar errores específicos
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setError('Este correo electrónico ya está registrado. Intenta iniciar sesión.');
                    break;
                case 'auth/invalid-email':
                    setError('El formato del correo electrónico no es válido.');
                    break;
                case 'auth/weak-password':
                    setError('La contraseña es demasiado débil. Usa al menos 6 caracteres.');
                    break;
                case 'auth/network-request-failed':
                    setError('Error de red. Verifica tu conexión a internet.');
                    break;
                default:
                    setError(`Error al registrarse: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <form onSubmit={nextStep} className="space-y-5">
            <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MdPerson className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                                 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Tu nombre"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MdPerson className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                                 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Tu apellido"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MdEmail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                                 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="ejemplo@correo.com"
                    />
                </div>
            </div>

            <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent 
                         rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r 
                         from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-cyan-500 transition-colors duration-200 cursor-pointer"
            >
                Continuar
            </button>
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MdLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                                 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Crea una contraseña segura"
                    />
                </div>
                {formData.password && (
                    <div className="mt-2">
                        <div className="bg-gray-200 h-2 rounded-full mt-1">
                            <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    passwordStrength < 50 ? 'bg-red-500' : 
                                    passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-500'
                                }`} 
                                style={{ width: `${passwordStrength}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {passwordStrength < 50 ? 'Débil' : 
                             passwordStrength < 75 ? 'Moderada' : 'Fuerte'}
                        </p>
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar contraseña
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MdLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                                 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Repite tu contraseña"
                    />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                    {error}
                </div>
            )}

            {isOffline && (
                <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-lg">
                    Estás en modo sin conexión. Algunas funciones pueden estar limitadas hasta que vuelvas a estar en línea.
                </div>
            )}

            <div className="flex items-center space-x-3">
                <button
                    type="button"
                    onClick={prevStep}
                    className="cursor-pointer flex items-center justify-center py-3 px-4 border border-gray-300 
                             rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white
                             hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2
                             focus:ring-cyan-500 transition-colors duration-200"
                >
                    <MdArrowBack className="mr-1" /> Atrás
                </button>
                <button
                    type="submit"
                    disabled={(formData.confirmPassword && formData.password !== formData.confirmPassword) || loading}
                    className="flex-grow flex justify-center py-3 px-4 border border-transparent 
                             rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r 
                             from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 
                             focus:outline-none focus:ring-2 focus:ring-offset-2 
                             focus:ring-cyan-500 transition-colors duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
            </div>
        </form>
    );

    return (
        <div className="h-screen w-screen flex">
            {/* Panel izquierdo: Imagen decorativa */}
            <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" 
                style={{ backgroundImage: 'url(/images/finance-cityscape.jpg)' }}>
                <WaveAnimation />
                <div className="absolute bottom-16 left-12 text-white z-10">
                    <h2 className="text-6xl font-bold mb-3">Plutus</h2>
                    <p className="text-2xl max-w-md text-white">
                        Únete hoy y comienza a controlar tus finanzas personales de forma inteligente.
                    </p>
                </div>
            </div>
            
            {/* Panel derecho: Formulario de registro */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6">
                <div className={`w-full max-w-md transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="lg:hidden text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">Plutus</h1>
                        <p className="text-gray-600 mt-2">Regístrate para comenzar</p>
                    </div>
                    
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="mb-8 text-center">
                            <div className="inline-flex items-center justify-center h-16 w-16 bg-cyan-50 rounded-full mb-4">
                                <FaUserPlus className="h-8 w-8 text-cyan-600" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900">Crear cuenta</h2>
                            <p className="text-gray-600 mt-2 text-sm">
                                {step === 1 
                                    ? "Comienza con la información básica" 
                                    : "Configura tu contraseña y asegura tu cuenta"}
                            </p>
                        </div>
                        
                        {/* Indicador de paso */}
                        <div className="mb-6">
                            <div className="flex items-center">
                                <div className={`h-2 flex-grow rounded-l-full ${
                                    step >= 1 ? 'bg-cyan-600' : 'bg-gray-200'
                                }`}></div>
                                <div className={`h-2 flex-grow rounded-r-full ${
                                    step >= 2 ? 'bg-cyan-600' : 'bg-gray-200'
                                }`}></div>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-500">Información personal</span>
                                <span className="text-xs text-gray-500">Seguridad</span>
                            </div>
                        </div>
                        
                        {step === 1 ? renderStep1() : renderStep2()}
                    </div>
                    
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            ¿Ya tienes una cuenta? 
                            <Link href="/" className="ml-1 font-medium text-cyan-600 hover:text-cyan-500">
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PageRegister;
