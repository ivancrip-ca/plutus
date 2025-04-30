'use client'
import { useEffect, useState } from 'react';
import { FaFacebook, FaFingerprint } from 'react-icons/fa';
import { MdEmail, MdLock, MdAccountBalance } from 'react-icons/md';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, googleProvider, facebookProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Import just the db instance

// Add the missing function
const saveUserToFirestore = async (user, userData, permitOffline = false) => {
    try {
        // Create a reference to the user document in Firestore
        const userRef = doc(db, 'users', user.uid);

        // Check if the user document already exists
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            // If the user exists, update only the provided fields
            // This preserves existing data like registrationDate and registrationMethod
            await setDoc(userRef, userData, { merge: true });
            console.log('User data updated in Firestore');
        } else {
            // If user doesn't exist, create a new document
            // Set registration date if not already provided
            if (!userData.registrationDate) {
                userData.registrationDate = new Date().toISOString();
            }
            await setDoc(userRef, userData);
            console.log('New user created in Firestore');
        }

        return true;
    } catch (error) {
        console.error('Error saving user to Firestore:', error);

        // If we're permitting offline operation and encounter a network error,
        // don't throw - the data will sync when connection is restored
        if (permitOffline && error.code === 'failed-precondition') {
            console.warn('Offline mode: Changes will sync when connection is restored.');
            return true;
        }

        // Re-throw if we're not permitting offline or for other errors
        throw error;
    }
};

const PageLogin = () => {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('Iniciando proceso de login...');

        // Mostrar advertencia si estamos offline
        if (isOffline) {
            console.warn('Device is offline. Login will proceed but some features may be limited.');
        }

        try {
            console.log('Intentando autenticar con email/password...');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('Usuario autenticado exitosamente:', user.uid);

            try {
                // Intentar actualizar Firestore (pero no bloquear si falla)
                console.log('Actualizando datos en Firestore...');

                // Datos a actualizar durante el inicio de sesión
                const loginData = {
                    lastLogin: new Date().toISOString(),
                    // No sobreescribir registrationMethod aquí, solo actualizar lastLogin
                };

                await saveUserToFirestore(user, loginData, true); // true = permitir offline
                console.log('Datos de usuario actualizados en Firestore (o en cola para sincronizar)');
            } catch (firestoreError) {
                console.error('Error no fatal de Firestore:', firestoreError);
                // Continuar aunque falle Firestore
            }

            // Indicar éxito antes de redirigir
            console.log('Sesión iniciada correctamente, redirigiendo...');

            // Establecer un timeout para asegurar que no se quede atascado
            const redirectTimeout = setTimeout(() => {
                console.log('Redirigiendo a dashboard (desde timeout)...');
                router.push('/dashboard');
            }, 2000); // 2 segundos como máximo

            // Intentar redirección inmediata
            console.log('Intentando redirección inmediata...');
            router.push('/dashboard');

            // Limpiar el timeout si la redirección inmediata funciona
            return () => clearTimeout(redirectTimeout);
        } catch (error) {
            console.error('Error de login:', error);

            // Manejar errores de manera más específica
            switch (error.code) {
                case 'auth/user-not-found':
                    setError('No existe una cuenta con este correo electrónico.');
                    break;
                case 'auth/wrong-password':
                    setError('Contraseña incorrecta.');
                    break;
                case 'auth/too-many-requests':
                    setError('Demasiados intentos fallidos. Por favor, intenta más tarde o restablece tu contraseña.');
                    break;
                case 'auth/network-request-failed':
                    setError('Error de red. Verifica tu conexión a internet.');
                    break;
                case 'auth/user-disabled':
                    setError('Esta cuenta ha sido deshabilitada. Contacta a soporte.');
                    break;
                case 'auth/invalid-credential':
                    setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
                    break;
                default:
                    setError(`Error al iniciar sesión: ${error.message}`);
            }

            console.log('Login fallido, error mostrado al usuario');
        } finally {
            setLoading(false);
            console.log('Estado de carga desactivado');
        }
    };

    const handleSocialLogin = async (provider, providerName) => {
        setError('');
        setLoading(true);

        console.log(`Iniciando login con ${providerName}...`);

        try {
            // Configurar el proveedor adecuadamente
            if (providerName === 'google') {
                googleProvider.setCustomParameters({
                    prompt: 'select_account'
                });
            } else if (providerName === 'facebook') {
                facebookProvider.setCustomParameters({
                    display: 'popup',
                    redirect_uri: window.location.origin
                });
            }

            console.log(`Intentando login con ${providerName}. URI de origen:`, window.location.origin);

            // Realizar el inicio de sesión
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Extraer datos para guardar en Firestore con fecha de registro si es primera vez
            const userData = {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                registrationMethod: providerName, // Importante: guardar método de registro
                lastLogin: new Date().toISOString(),
            };

            // Dividir el nombre si está disponible
            if (user.displayName) {
                const nameParts = user.displayName.split(' ');
                userData.firstName = nameParts[0] || '';
                userData.lastName = nameParts.slice(1).join(' ') || '';
            }

            // Verificar si es primera vez que inicia sesión para registrar fecha
            try {
                const userRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userRef);

                if (!userDoc.exists()) {
                    // Es la primera vez que inicia sesión, establecer fecha de registro
                    userData.registrationDate = new Date().toISOString();
                    console.log(`Nuevo usuario registrado con ${providerName}`);
                }
            } catch (error) {
                console.warn('Error al verificar si el usuario existe:', error);
                // Si hay error en la verificación, intentamos guardar de todas formas
                userData.registrationDate = new Date().toISOString();
            }

            // Guardar o actualizar en Firestore
            await saveUserToFirestore(user, userData, true);

            console.log(`${providerName} login successful:`, user);

            // Establecer un timeout para asegurar que no se quede atascado
            const redirectTimeout = setTimeout(() => {
                console.log(`Redirigiendo a dashboard desde ${providerName} (timeout)...`);
                router.push('/dashboard');
            }, 2000); // 2 segundos como máximo

            // Intentar redirección inmediata
            console.log('Intentando redirección inmediata...');
            router.push('/dashboard');

            // Limpiar el timeout si la redirección inmediata funciona
            return () => clearTimeout(redirectTimeout);
        } catch (error) {
            console.error(`${providerName} login error:`, error);

            // Mensajes de error específicos
            if (error.code === 'auth/popup-closed-by-user') {
                setError('Ventana emergente cerrada. Por favor, inténtalo de nuevo.');
            } else if (error.code === 'auth/popup-blocked') {
                setError('El navegador ha bloqueado la ventana emergente. Por favor, permite las ventanas emergentes para este sitio.');
            } else if (error.message && error.message.includes('domain')) {
                setError(`Error de dominio: ${window.location.origin} no está autorizado en la configuración de la aplicación. 
                        Debes agregar este dominio en la configuración de tu aplicación.`);
            } else {
                setError(`Error al iniciar sesión con ${providerName} (${error.code}): ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => handleSocialLogin(googleProvider, 'google');
    const handleFacebookLogin = () => handleSocialLogin(facebookProvider, 'facebook');

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="py-4 px-6 flex justify-between items-center bg-white sticky top-0 z-50 shadow-sm">
                <Link href="/" className="flex items-center">
                    <MdAccountBalance className="h-8 w-8 text-cyan-500 mr-2" />
                    <span className="text-xl font-bold text-black">Plutus</span>
                </Link>


            </header>

            {/* Login Section */}
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center h-16 w-16 bg-cyan-50 rounded-full mb-4">
                                <FaFingerprint className="h-8 w-8 text-cyan-600" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900">Bienvenido de nuevo</h2>
                            <p className="text-gray-600 mt-2 text-sm">Inicia sesión para continuar</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        {isOffline && (
                            <div className="mb-6 p-3 bg-yellow-50 text-yellow-700 text-sm rounded-lg">
                                Estás en modo sin conexión. Algunas funciones pueden estar limitadas.
                            </div>
                        )}

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <form onSubmit={handleSubmit} className="space-y-5">
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
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                                                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 
                                                    focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                            placeholder="ejemplo@correo.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Contraseña
                                        </label>
                                        <Link href="/forgot-password" className="text-xs text-cyan-600 hover:text-cyan-800">
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MdLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                                                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                                                    focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
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
                                    {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                                </button>
                            </form>

                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">O continúa con</span>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        disabled={loading}
                                        className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 
                                                rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 
                                                hover:bg-gray-50 transition-colors"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleFacebookLogin}
                                        disabled={loading}
                                        className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 
                                                rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 
                                                hover:bg-gray-50 transition-colors"
                                    >
                                        <FaFacebook className='text-blue-500 text-lg' />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                ¿No tienes una cuenta?
                                <Link href="/register" className="ml-1 font-medium text-cyan-600 hover:text-cyan-500">
                                    Regístrate aquí
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 px-6 bg-gray-100 mt-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between flex-col md:flex-row items-center">
                        <div className="flex items-center mb-6 md:mb-0">
                            <MdAccountBalance className="h-8 w-8 text-cyan-500 mr-2" />
                            <span className="text-xl font-bold text-black">Plutus</span>
                        </div>

                        <div className="text-sm text-gray-600">
                            &copy; {new Date().getFullYear()} Plutus Finance. Todos los derechos reservados.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default PageLogin;