'use client'
import { useState, useEffect } from 'react';
import { MdEmail, MdLockReset, MdAccountBalance } from 'react-icons/md';
import { FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // Determinar si estamos en desarrollo o producción
            const isLocalhost = window.location.hostname === 'localhost' || 
                                window.location.hostname === '127.0.0.1';
            
            // URL base para el redireccionamiento
            let baseUrl;
            if (isLocalhost) {
                // Para desarrollo local (usando puerto 3000 por defecto para Next.js)
                baseUrl = `http://${window.location.hostname}:${window.location.port || '3000'}`;
            } else {
                // Para producción
                baseUrl = window.location.origin;
            }
            
            // Configurar los ajustes de restablecimiento de contraseña para redireccionar a nuestra página personalizada
            const actionCodeSettings = {
                // URL para redireccionar a nuestra página personalizada de restablecimiento de contraseña
                url: `${baseUrl}/reset-password`,
                // Esta URL debe ser incluida en la configuración de dominios autorizados en Firebase Console
                handleCodeInApp: true
            };
            
            console.log('Reset password redirect URL:', actionCodeSettings.url);
            
            // Enviar el correo de restablecimiento de contraseña con la URL personalizada
            await sendPasswordResetEmail(auth, email, actionCodeSettings);
            console.log('Password reset email sent to:', email);
            
            setSubmitted(true);
        } catch (err) {
            console.error('Error sending password reset:', err);
            
            // Mostrar mensajes de error específicos
            if (err.code === 'auth/user-not-found') {
                setError('No existe una cuenta con este correo electrónico.');
            } else if (err.code === 'auth/invalid-email') {
                setError('El formato del correo electrónico no es válido.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Demasiados intentos. Por favor, inténtalo más tarde.');
            } else {
                setError('No pudimos enviar el correo de recuperación. Por favor, verifica la dirección e intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Header */}
            <header className="py-4 px-6 flex justify-between items-center bg-white sticky top-0 z-50 shadow-sm">
                <Link href="/" className="flex items-center">
                    <MdAccountBalance className="h-8 w-8 text-cyan-500 mr-2" />
                    <span className="text-xl font-bold">Plutus</span>
                </Link>
                
                <div className="flex items-center space-x-2">
                    <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200">
                        Iniciar Sesión
                    </Link>
                    <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700">
                        Registrarse
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center h-16 w-16 bg-cyan-50 rounded-full mb-4">
                                <MdLockReset className="h-8 w-8 text-cyan-600" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900">¿Olvidaste tu contraseña?</h2>
                            <p className="text-gray-600 mt-2 text-sm">
                                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla
                            </p>
                        </div>
                        
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            {!submitted ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
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
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                                                        text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 
                                                        focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                                placeholder="ejemplo@correo.com"
                                            />
                                        </div>
                                        {error && (
                                            <p className="mt-2 text-sm text-red-600">{error}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full flex justify-center py-3 px-4 border border-transparent 
                                                rounded-xl shadow-sm text-sm font-medium text-white bg-cyan-600 
                                                hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                                focus:ring-cyan-500 transition-colors duration-200 
                                                ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Enviando...
                                            </>
                                        ) : 'Enviar instrucciones'}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-6">
                                    <FaCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-gray-900 mb-2">Instrucciones enviadas</h3>
                                    <p className="text-gray-600 mb-6">
                                        Hemos enviado instrucciones para restablecer tu contraseña a <strong>{email}</strong>. 
                                        Revisa tu bandeja de entrada y sigue los pasos indicados.
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        ¿No recibiste el correo? Revisa tu carpeta de spam o{' '}
                                        <button 
                                            onClick={() => setSubmitted(false)}
                                            className="text-cyan-600 hover:text-cyan-800 hover:underline"
                                        >
                                            intenta de nuevo
                                        </button>
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                <Link href="/login" className="font-medium text-cyan-600 hover:text-cyan-500">
                                    Volver a iniciar sesión
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-10 px-6 bg-gray-100 mt-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between flex-col md:flex-row items-center">
                        <div className="flex items-center mb-6 md:mb-0">
                            <MdAccountBalance className="h-8 w-8 text-cyan-500 mr-2" />
                            <span className="text-xl font-bold">Plutus</span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            &copy; {new Date().getFullYear()} Plutus Finance. Todos los derechos reservados.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ForgotPasswordPage;
