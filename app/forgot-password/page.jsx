'use client'
import { useState, useEffect } from 'react';
import { MdEmail, MdLockReset } from 'react-icons/md';
import { FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';
import WaveAnimation from '../../components/WaveAnimation';

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
            // Aquí irá la lógica de reseteo de contraseña con Firebase
            // Por ejemplo: await sendPasswordResetEmail(auth, email);
            console.log('Password reset requested for:', email);
            
            // Simulamos un pequeño retraso para la demostración
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setSubmitted(true);
        } catch (err) {
            setError('No pudimos enviar el correo de recuperación. Por favor, verifica la dirección e intenta de nuevo.');
            console.error('Error sending password reset:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex">
            {/* Panel izquierdo: Imagen decorativa */}
            <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" 
                style={{ backgroundImage: 'url(/images/finance-cityscape.jpg)' }}>
                <WaveAnimation />
                <div className="absolute bottom-16 left-12 text-white z-10">
                    <h2 className="text-6xl font-bold mb-3">Plutus</h2>
                    <p className="text-2xl max-w-md text-white">Recupera el acceso a tu cuenta de manera segura y rápida.</p>
                </div>
            </div>
            
            {/* Panel derecho: Formulario de recuperación */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6">
                <div className={`w-full max-w-md transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="lg:hidden text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">Plutus Finance</h1>
                        <p className="text-gray-600 mt-2">Recupera tu contraseña</p>
                    </div>
                    
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        {!submitted ? (
                            <>
                                <div className="mb-8 text-center">
                                    <div className="inline-flex items-center justify-center h-16 w-16 bg-cyan-50 rounded-full mb-4">
                                        <MdLockReset className="h-8 w-8 text-cyan-600" />
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-900">¿Olvidaste tu contraseña?</h2>
                                    <p className="text-gray-600 mt-2 text-sm">
                                        Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla
                                    </p>
                                </div>
                                
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
                                                        focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                                                rounded-xl shadow-sm text-sm font-medium text-white
                                                ${loading ? 'opacity-70 cursor-not-allowed' : ''} 
                                                bg-gradient-to-r from-cyan-600 to-teal-600 
                                                hover:from-cyan-700 hover:to-teal-700
                                                focus:outline-none focus:ring-2 focus:ring-offset-2 
                                                focus:ring-cyan-500 transition-colors duration-200 cursor-pointer`}
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
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <FaCheckCircle className="h-16 w-16 text-teal-500 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">Instrucciones enviadas</h3>
                                <p className="text-gray-600 mb-6">
                                    Hemos enviado instrucciones para restablecer tu contraseña a <strong>{email}</strong>. 
                                    Revisa tu bandeja de entrada y sigue los pasos indicados.
                                </p>
                                <p className="text-sm text-gray-500 mb-4">
                                    ¿No recibiste el correo? Revisa tu carpeta de spam o
                                    <button 
                                        onClick={() => setSubmitted(false)}
                                        className="ml-1 text-cyan-600 hover:text-cyan-800 hover:underline"
                                    >
                                        intenta de nuevo
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            <Link href="/" className="font-medium text-cyan-600 hover:text-cyan-500">
                                Volver a iniciar sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
