'use client'
import { useState, useEffect } from 'react';
import { MdLock, MdAccountBalance, MdPassword, MdSecurity } from 'react-icons/md';
import { FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '../firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

const ResetPasswordPage = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [strengthText, setStrengthText] = useState('');
    const [email, setEmail] = useState('');
    const [oobCode, setOobCode] = useState('');
    const [verifying, setVerifying] = useState(true);
    const [verifyError, setVerifyError] = useState('');
    
    const router = useRouter();
    const searchParams = useSearchParams();

    // Calcular la fortaleza de la contraseña
    const calculatePasswordStrength = (password) => {
        if (!password) return { strength: 0, text: '' };
        
        let strength = 0;
        let text = '';
        
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        
        if (strength < 50) {
            text = 'Insegura';
        } else if (strength < 100) {
            text = 'Poco segura';
        } else {
            text = 'Segura';
        }
        
        return { strength, text };
    };

    // Validar la contraseña
    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'La contraseña debe tener al menos 8 caracteres';
        }
        if (!/[A-Z]/.test(password)) {
            return 'La contraseña debe contener al menos una letra mayúscula';
        }
        if (!/[a-z]/.test(password)) {
            return 'La contraseña debe contener al menos una letra minúscula';
        }
        if (!/[0-9]/.test(password)) {
            return 'La contraseña debe contener al menos un número';
        }
        return '';
    };

    // Manejar cambios en el input de contraseña
    const handlePasswordChange = (e) => {
        const newPasswordValue = e.target.value;
        setNewPassword(newPasswordValue);
        setPasswordError(validatePassword(newPasswordValue));
        
        const { strength, text } = calculatePasswordStrength(newPasswordValue);
        setPasswordStrength(strength);
        setStrengthText(text);
    };

    // Obtener el código oobCode de la URL y verificarlo
    useEffect(() => {
        setIsLoaded(true);
        
        // Obtener el código oobCode de la URL
        const code = searchParams.get('oobCode');
        if (!code) {
            setVerifyError('No se ha proporcionado un código de verificación válido.');
            setVerifying(false);
            return;
        }
        
        setOobCode(code);
        
        // Verificar el código oobCode con Firebase
        const verifyCode = async () => {
            try {
                setVerifying(true);
                // Verificar el código y obtener el email asociado
                const email = await verifyPasswordResetCode(auth, code);
                setEmail(email);
                setVerifying(false);
            } catch (error) {
                console.error('Error al verificar el código:', error);
                setVerifyError('El enlace de restablecimiento de contraseña no es válido o ha expirado. Por favor, solicita un nuevo enlace.');
                setVerifying(false);
            }
        };
        
        verifyCode();
    }, [searchParams]);

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            setResetError('Las contraseñas no coinciden');
            return;
        }
        
        // Validar la fortaleza de la contraseña
        if (passwordError) {
            setResetError(passwordError);
            return;
        }
        
        setLoading(true);
        setResetError('');
        
        try {
            // Confirmar el restablecimiento de contraseña con Firebase
            await confirmPasswordReset(auth, oobCode, newPassword);
            
            // Mostrar mensaje de éxito
            setResetSuccess(true);
            
            // Limpiar el formulario
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error al restablecer la contraseña:', error);
            
            // Mostrar mensaje de error específico
            if (error.code === 'auth/weak-password') {
                setResetError('La contraseña es demasiado débil. Utiliza una combinación de letras, números y símbolos.');
            } else if (error.code === 'auth/invalid-action-code') {
                setResetError('El enlace de restablecimiento de contraseña ha expirado o ya ha sido utilizado.');
            } else {
                setResetError('Ha ocurrido un error al restablecer la contraseña. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Obtener el color de la barra de fortaleza
    const getStrengthColor = () => {
        if (passwordStrength < 50) return 'bg-red-500';
        if (passwordStrength < 100) return 'bg-yellow-500';
        return 'bg-green-500';
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
                        {verifying ? (
                            <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-600 mb-4"></div>
                                <p className="text-gray-600">Verificando enlace de restablecimiento...</p>
                            </div>
                        ) : verifyError ? (
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center h-16 w-16 bg-red-50 rounded-full mb-4">
                                    <MdSecurity className="h-8 w-8 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-900">Enlace no válido</h2>
                                <p className="text-gray-600 mt-2 mb-6">{verifyError}</p>
                                <Link href="/forgot-password" className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700">
                                    Solicitar nuevo enlace
                                </Link>
                            </div>
                        ) : resetSuccess ? (
                            <div className="text-center mb-8">
                                <FaCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-semibold text-gray-900">¡Contraseña actualizada!</h2>
                                <p className="text-gray-600 mt-2 mb-6">
                                    Tu contraseña se ha restablecido correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
                                </p>
                                <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700">
                                    Iniciar sesión
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center h-16 w-16 bg-cyan-50 rounded-full mb-4">
                                        <MdPassword className="h-8 w-8 text-cyan-600" />
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-900">Crea una nueva contraseña</h2>
                                    <p className="text-gray-600 mt-2">
                                        Estás restableciendo la contraseña para <strong>{email}</strong>
                                    </p>
                                </div>
                                
                                {resetError && (
                                    <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                                        {resetError}
                                    </div>
                                )}
                                
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Nueva contraseña
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <MdLock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="newPassword"
                                                name="newPassword"
                                                type="password"
                                                autoComplete="new-password"
                                                required
                                                value={newPassword}
                                                onChange={handlePasswordChange}
                                                className={`block w-full pl-10 pr-3 py-3 border ${
                                                    passwordError ? 'border-red-300' : 'border-gray-200'
                                                } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                                                        focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm`}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        
                                        {newPassword && (
                                            <div className="mt-2">
                                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-300 ${getStrengthColor()}`} 
                                                        style={{ width: `${passwordStrength}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between mt-1">
                                                    <p className="text-xs text-gray-500">Seguridad:</p>
                                                    <p className={`text-xs font-medium ${
                                                        passwordStrength < 50 ? 'text-red-600' : 
                                                        passwordStrength < 100 ? 'text-yellow-600' : 
                                                        'text-green-600'
                                                    }`}>
                                                        {strengthText}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {passwordError && (
                                            <p className="mt-1 text-xs text-red-600">{passwordError}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número.
                                        </p>
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
                                                autoComplete="new-password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`block w-full pl-10 pr-3 py-3 border ${
                                                    newPassword !== confirmPassword && confirmPassword
                                                        ? 'border-red-300'
                                                        : 'border-gray-200'
                                                } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                                                        focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm`}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {newPassword !== confirmPassword && confirmPassword && (
                                            <p className="mt-1 text-xs text-red-600">Las contraseñas no coinciden.</p>
                                        )}
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={loading || newPassword !== confirmPassword || !!passwordError}
                                            className={`w-full flex justify-center py-3 px-4 border border-transparent
                                                    rounded-xl shadow-sm text-sm font-medium text-white bg-cyan-600
                                                    hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                                                    focus:ring-cyan-500 transition-colors
                                                    ${
                                                        loading || newPassword !== confirmPassword || !!passwordError
                                                            ? 'opacity-70 cursor-not-allowed'
                                                            : 'cursor-pointer'
                                                    }`}
                                        >
                                            {loading ? 'Actualizando...' : 'Restablecer contraseña'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                        
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                ¿Recordaste tu contraseña? 
                                <Link href="/login" className="ml-1 font-medium text-cyan-600 hover:text-cyan-500">
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

export default ResetPasswordPage;