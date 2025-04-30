'use client'
import { useState, useEffect, useContext } from 'react';
import { MdEmail, MdAccountBalance, MdCheckCircle, MdError, MdSend, MdLogin } from 'react-icons/md';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '../firebase';
import { applyActionCode, sendEmailVerification, signInWithEmailAndPassword, checkActionCode } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { NotificationContext } from '../contexts/NotificationContext';

const EmailVerificationPage = () => {
    const { showNotification } = useContext(NotificationContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const [verifyingEmail, setVerifyingEmail] = useState(true);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [verificationError, setVerificationError] = useState('');
    const [actionCodeInfo, setActionCodeInfo] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
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
        
        // Verificar si ya hay un intento previo (para evitar bucles)
        const processingAttempts = localStorage.getItem(`verification_attempts_${oobCode}`) || '0';
        const attempts = parseInt(processingAttempts, 10);
        
        // Si hay más de 1 intento para el mismo código, probablemente estamos en un bucle
        if (attempts > 1) {
            console.log(`Posible bucle detectado para el código ${oobCode}. Deteniendo procesamiento.`);
            setVerifyingEmail(false);
            setVerificationError('Se ha detectado un problema al procesar la verificación de correo. Por favor, intenta de nuevo o contacta soporte.');
            return;
        }
        
        // Incrementar el contador de intentos para este código
        localStorage.setItem(`verification_attempts_${oobCode}`, (attempts + 1).toString());
        
        const processCode = async () => {
            try {
                // Primero, intentar verificar qué tipo de código es
                const info = await checkActionCode(auth, oobCode);
                setActionCodeInfo(info);
                setEmail(info.data.email || '');
                
                // Intentar aplicar el código directamente
                try {
                    await applyActionCode(auth, oobCode);
                    setVerificationSuccess(true);
                    
                    // Actualizar el estado de verificación en Firestore
                    if (auth.currentUser) {
                        try {
                            const userRef = doc(db, 'users', auth.currentUser.uid);
                            await updateDoc(userRef, {
                                emailVerified: true
                            });
                        } catch (firestoreError) {
                            console.error('Error al actualizar estado de verificación en Firestore:', firestoreError);
                        }
                    }
                    
                    // Mostrar notificación de éxito
                    showNotification('¡Tu correo electrónico ha sido verificado correctamente!', 'success');
                } catch (applyError) {
                    console.error('Error al aplicar el código de acción:', applyError);
                    
                    // Si hay error porque no está autenticado, mostrar formulario de login
                    if (applyError.code === 'auth/requires-recent-login' || 
                        applyError.code === 'auth/user-not-found' || 
                        applyError.code === 'auth/invalid-action-code') {
                        setShowLoginForm(true);
                        setVerificationError('Debes iniciar sesión para verificar tu correo electrónico.');
                    } else {
                        handleVerificationError(applyError);
                    }
                }
            } catch (error) {
                console.error('Error al verificar el código de acción:', error);
                handleVerificationError(error);
            } finally {
                setVerifyingEmail(false);
            }
        };
        
        processCode();
        
        // Limpieza al desmontar el componente
        return () => {
            setTimeout(() => {
                // Eliminar el contador de intentos después de 1 minuto para permitir futuros intentos
                localStorage.removeItem(`verification_attempts_${oobCode}`);
            }, 60000);
        };
    }, [searchParams, showNotification]);
    
    const handleVerificationError = (error) => {
        console.error('Error detallado de verificación:', error);
        
        if (error.code === 'auth/expired-action-code') {
            setVerificationError('El enlace de verificación ha expirado. Por favor, solicita un nuevo enlace.');
            showNotification('El enlace de verificación ha expirado.', 'error');
        } else if (error.code === 'auth/invalid-action-code') {
            setVerificationError('El enlace de verificación no es válido o ya ha sido utilizado. Por favor, solicita un nuevo enlace.');
            showNotification('El enlace de verificación no es válido o ya ha sido utilizado.', 'error');
        } else if (error.code === 'auth/user-not-found') {
            setVerificationError('No se ha encontrado ningún usuario asociado a este correo electrónico.');
            showNotification('No se ha encontrado ningún usuario con este correo.', 'error');
        } else if (error.code === 'auth/user-disabled') {
            setVerificationError('Esta cuenta de usuario ha sido deshabilitada.');
            showNotification('Esta cuenta ha sido deshabilitada.', 'error');
        } else if (error.code === 'auth/requires-recent-login') {
            setVerificationError('Esta operación es sensible y requiere que inicies sesión recientemente.');
            showNotification('Necesitas iniciar sesión para verificar el correo.', 'warning');
            setShowLoginForm(true);
        } else {
            setVerificationError('Ha ocurrido un error al verificar tu correo electrónico. Por favor, inténtalo de nuevo.');
            showNotification('Error al verificar tu correo.', 'error');
        }
    };

    // Función para iniciar sesión y luego intentar verificar el email
    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            setLoginError('Por favor, introduce tu correo electrónico y contraseña.');
            return;
        }
        
        setLoginLoading(true);
        setLoginError('');
        
        try {
            // Iniciar sesión
            await signInWithEmailAndPassword(auth, email, password);
            
            // Reintentar la verificación
            const oobCode = searchParams.get('oobCode');
            if (oobCode) {
                try {
                    await applyActionCode(auth, oobCode);
                    
                    // Actualizar el estado de verificación en Firestore
                    if (auth.currentUser) {
                        try {
                            const userRef = doc(db, 'users', auth.currentUser.uid);
                            await updateDoc(userRef, {
                                emailVerified: true
                            });
                        } catch (firestoreError) {
                            console.error('Error al actualizar estado de verificación en Firestore:', firestoreError);
                        }
                    }
                    
                    setVerificationSuccess(true);
                    setShowLoginForm(false);
                    showNotification('¡Tu correo electrónico ha sido verificado correctamente!', 'success');
                } catch (error) {
                    console.error('Error al verificar el correo después de iniciar sesión:', error);
                    handleVerificationError(error);
                }
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            
            if (error.code === 'auth/wrong-password') {
                setLoginError('Contraseña incorrecta. Por favor, intenta de nuevo.');
            } else if (error.code === 'auth/user-not-found') {
                setLoginError('No existe una cuenta con este correo electrónico.');
            } else if (error.code === 'auth/too-many-requests') {
                setLoginError('Demasiados intentos fallidos. Por favor, intenta más tarde.');
            } else {
                setLoginError('Error al iniciar sesión. Por favor, intenta de nuevo.');
            }
        } finally {
            setLoginLoading(false);
        }
    };

    // Función para reenviar el correo de verificación
    const handleResendVerification = async () => {
        if (!auth.currentUser) {
            setResendError('Debes iniciar sesión para reenviar el correo de verificación.');
            setShowLoginForm(true);
            return;
        }
        
        setResendLoading(true);
        setResendError('');
        setResendSuccess(false);
        
        try {
            // Determinar si estamos en desarrollo o producción
            const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
            
            // URL base para el redireccionamiento
            let baseUrl;
            if (isLocalhost) {
                baseUrl = `http://${window.location.hostname}:${window.location.port || '3000'}`;
            } else {
                baseUrl = window.location.origin;
            }
            
            const actionCodeSettings = {
                // Usar la URL de la página principal, NO la página de verificación para evitar bucles
                url: `${baseUrl}?mode=verifyEmail`, // La página principal interceptará el modo y el código
                handleCodeInApp: false // Cambiar a false para que use el flujo estándar de Firebase
            };
            
            await sendEmailVerification(auth.currentUser, actionCodeSettings);
            setResendSuccess(true);
            showNotification('Correo de verificación enviado correctamente.', 'success');
        } catch (error) {
            console.error('Error al reenviar correo de verificación:', error);
            
            if (error.code === 'auth/too-many-requests') {
                setResendError('Has enviado demasiadas solicitudes. Por favor, espera unos minutos antes de intentarlo de nuevo.');
                showNotification('Demasiadas solicitudes de verificación. Espera unos minutos.', 'warning');
            } else {
                setResendError('No se pudo enviar el correo de verificación. Por favor, inténtalo más tarde.');
                showNotification('Error al enviar correo de verificación.', 'error');
            }
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
                        ) : showLoginForm ? (
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">Iniciar sesión para continuar</h2>
                                <p className="text-gray-600 mb-6 text-center">
                                    Para verificar tu correo electrónico, primero debes iniciar sesión.
                                </p>
                                
                                {loginError && (
                                    <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                                        {loginError}
                                    </div>
                                )}
                                
                                <form onSubmit={handleLogin} className="space-y-5">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Correo electrónico
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full px-3 py-3 border border-gray-200 rounded-xl
                                                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                                                    focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                            placeholder="ejemplo@correo.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Contraseña
                                        </label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full px-3 py-3 border border-gray-200 rounded-xl
                                                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                                                    focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setShowLoginForm(false)}
                                            className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                        >
                                            Cancelar
                                        </button>
                                        
                                        <button
                                            type="submit"
                                            disabled={loginLoading}
                                            className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 flex items-center"
                                        >
                                            {loginLoading ? (
                                                <>
                                                    <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-white rounded-full"></div>
                                                    Iniciando sesión...
                                                </>
                                            ) : (
                                                <>
                                                    <MdLogin className="mr-2" />
                                                    Iniciar sesión
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
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
                                
                                <div className="flex justify-center space-x-4 mb-8">
                                    <button
                                        onClick={() => setShowLoginForm(true)}
                                        className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 flex items-center"
                                    >
                                        <MdLogin className="mr-2" />
                                        Iniciar sesión
                                    </button>
                                    
                                    <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200">
                                        Ir al Dashboard
                                    </Link>
                                </div>
                                
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