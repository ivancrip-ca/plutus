'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdPerson, MdEmail, MdLock, MdAccountBalance, MdCheckCircle } from 'react-icons/md';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Register() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
    
    const { strength, text } = calculatePasswordStrength(newPassword);
    setPasswordStrength(strength);
    setStrengthText(text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
        role: 'user',
        emailVerified: false
      });
      
      // Se ha eliminado el envío del correo de verificación
      
      setRegistrationSuccess(true);
      
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado');
      } else if (error.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil');
      } else {
        setError('Error al crear la cuenta. Por favor, inténtalo de nuevo.');
      }
      
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500';
    if (passwordStrength < 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-white">
        <header className="py-4 px-6 flex justify-between items-center bg-white sticky top-0 z-50 shadow-sm">
          <Link href="/" className="flex items-center">
            <MdAccountBalance className="h-8 w-8 text-cyan-500 mr-2" />
            <span className="text-xl font-bold">Plutus</span>
          </Link>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-20 w-20 bg-green-50 rounded-full mb-6">
                <MdCheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">¡Cuenta creada exitosamente!</h2>
              <p className="text-gray-600 mt-4 mb-6">
                Tu cuenta ha sido creada correctamente. Ahora puedes acceder a tu dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard" className="px-6 py-3 rounded-lg text-base font-medium bg-cyan-600 text-white hover:bg-cyan-700 text-center">
                  Ir al Dashboard
                </Link>
                <Link href="/login" className="px-6 py-3 rounded-lg text-base font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 text-center">
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
        
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
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="py-4 px-6 flex justify-between items-center bg-white sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center">
          <MdAccountBalance className="h-8 w-8 text-cyan-500 mr-2" />
          <span className="text-xl font-bold">Plutus</span>
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Crea tu cuenta</h2>
              <p className="text-gray-600 mt-2 text-sm">Empieza a gestionar tus finanzas con Plutus</p>
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                        autoComplete="given-name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                                  text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                                  focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        placeholder="Juan"
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
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                                  text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                                  focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        placeholder="Pérez"
                      />
                    </div>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                                text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                                focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                      placeholder="juan.perez@ejemplo.com"
                    />
                  </div>
                </div>

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
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        passwordError ? 'border-red-300' : 'border-gray-200'
                      } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                                focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm`}
                      placeholder="••••••••"
                    />
                  </div>
                  
                  {password && (
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
                        password !== confirmPassword && confirmPassword
                          ? 'border-red-300'
                          : 'border-gray-200'
                      } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                                focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm`}
                      placeholder="••••••••"
                    />
                  </div>
                  {password !== confirmPassword && confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">Las contraseñas no coinciden.</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading || password !== confirmPassword || !!passwordError}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent
                              rounded-xl shadow-sm text-sm font-medium text-white bg-cyan-600
                              hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                              focus:ring-cyan-500 transition-colors
                              ${
                                loading || password !== confirmPassword || !!passwordError
                                  ? 'opacity-70 cursor-not-allowed'
                                  : 'cursor-pointer'
                              }`}
                  >
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta? 
                <Link href="/login" className="ml-1 font-medium text-cyan-600 hover:text-cyan-500">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
            
            <div className="mt-6 text-center text-xs text-gray-500">
              Al crear una cuenta, aceptas nuestros 
              <Link href="/terms" className="text-cyan-600 hover:text-cyan-500">
                {' '}Términos de Servicio
              </Link>{' '}
              y{' '}
              <Link href="/privacy" className="text-cyan-600 hover:text-cyan-500">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>

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
}
