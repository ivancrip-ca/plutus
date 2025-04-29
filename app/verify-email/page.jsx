'use client'
import { useState, useEffect } from 'react';
import { MdEmail, MdAccountBalance, MdCheckCircle, MdError, MdSend } from 'react-icons/md';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '../firebase';
import { applyActionCode, sendEmailVerification } from 'firebase/auth';

const EmailVerificationPage = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [verifyingEmail, setVerifyingEmail] = useState(true);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [verificationError, setVerificationError] = useState('');
    const [email, setEmail] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendError, setResendError] = useState('');
    
    const router = useRouter();
    const searchParams = useSearchParams();

    // Verificar el código oobCode cuando cargue la página
    useEffect(() => {
        setIsLoaded(true);
        
        // Obtener el código oobCode de la URL
        const oobCode = searchParams.get('oobCode');
        if (!oobCode) {
            setVerifyingEmail(false);
            setVerificationError('No se ha proporcionado un código de verificación válido.');
            return;
        }
        
        // Verificar el código con Firebase
        const verifyEmail = async () => {
            try {
                await applyActionCode(auth, oobCode);
                setVerificationSuccess(true);
                
                // Si hay un usuario autenticado, podemos obtener su correo
                if (auth.currentUser) {
                    setEmail(auth.currentUser.email || '');
                }
            } catch (error) {
                console.error('Error al verificar el correo electrónico:', error);
                
                // Mostrar mensaje de error específico
                if (error.code === 'auth/invalid-action-code') {
                    setVerificationError('El enlace de verificación no es válido o ha expirado. Por favor, solicita un nuevo enlace.');
                } else if (error.code === 'auth/user-not-found') {
                    setVerificationError('No se ha encontrado ningún usuario asociado a este correo electrónico.');
                } else {
                    setVerificationError('Ha ocurrido un error al verificar tu correo electrónico. Por favor, inténtalo de nuevo.');
                }
            } finally {
                setVerifyingEmail(false);
            }
        };
        
        verifyEmail();
    }, [searchParams]);

    // Función para reenviar el correo de verificación
    const handleResendVerification = async () => {
        if (!auth.currentUser) {
            setResendError('Debes iniciar sesión para reenviar el correo de verificación.');
            return;
        }
        
        setResendLoading(true);
        setResendError('');
        setResendSuccess(false);
        
        try {
            await sendEmailVerification(auth.currentUser, {
                url: window.location.origin + '/dashboard',
                handleCodeInApp: true
            });
            setResendSuccess(true);
        } catch (error) {
            console.error('Error al reenviar correo de verificación:', error);
            setResendError('No se pudo enviar el correo de verificación. Por favor, inténtalo más tarde.');
        } finally {
            setResendLoading(false);
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
                        {verifyingEmail ? (
                            <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-600 mb-4"></div>
                                <p className="text-gray-600">Verificando tu correo electrónico...</p>
                            </div>
                        ) : verificationSuccess ? (
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center h-20 w-20 bg-green-50 rounded-full mb-6">
                                    <MdCheckCircle className="h-12 w-12 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-900">¡Correo verificado correctamente!</h2>
                                <p className="text-gray-600 mt-4 mb-8">
                                    Tu dirección de correo electrónico ha sido verificada exitosamente.
                                    Ahora puedes disfrutar de todas las funcionalidades de Plutus.
                                </p>
                                <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700">
                                    Ir al Dashboard
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center h-20 w-20 bg-red-50 rounded-full mb-6">
                                    <MdError className="h-12 w-12 text-red-500" />
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-900">Error de verificación</h2>
                                <p className="text-gray-600 mt-4 mb-6">
                                    {verificationError}
                                </p>
                                
                                {auth.currentUser && (
                                    <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">¿No has recibido el correo de verificación?</h3>
                                        
                                        {resendSuccess ? (
                                            <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm mb-4">
                                                Correo de verificación reenviado correctamente. Por favor, revisa tu bandeja de entrada.
                                            </div>
                                        ) : resendError ? (
                                            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm mb-4">
                                                {resendError}
                                            </div>
                                        ) : null}
                                        
                                        <button
                                            onClick={handleResendVerification}
                                            disabled={resendLoading}
                                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent
                                                    rounded-xl shadow-sm text-sm font-medium text-white bg-cyan-600
                                                    hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500
                                                    ${resendLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            {resendLoading ? (
                                                <>
                                                    <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-white rounded-full"></div>
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>
                                                    <MdSend className="mr-2" />
                                                    Reenviar correo de verificación
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                                
                                <div className="mt-6">
                                    <Link href="/dashboard" className="text-cyan-600 hover:text-cyan-500 font-medium">
                                        Volver al dashboard
                                    </Link>
                                </div>
                            </div>
                        )}
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

export default EmailVerificationPage;