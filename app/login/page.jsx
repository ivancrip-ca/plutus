'use client'
import { useEffect, useState } from 'react';

const PageLogin = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return ( 
        <div className="h-screen w-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(/path/to/your/background-image.jpg)' }}>
            <div className={`h-auto w-96 p-8 flex flex-col items-center justify-center shadow-2xl rounded-lg bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg ${isLoaded ? 'animate-slide-in' : ''}`}>
                <div className="w-full text-center mb-8">
                    <img src="/path/to/your/logo.png" alt="Plutus Logo" className="mx-auto mb-4 w-24 h-24 animate-bounce" />
                    <h1 className="text-gray-800 text-4xl font-extrabold mb-2">Plutus Finance</h1>
                    <p className="text-gray-600 text-lg">Gestiona tus finanzas de manera inteligente</p>
                </div>

                <form className="w-full space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700" htmlFor="email">
                            Correo Electrónico
                        </label>
                        <input 
                            type="email" 
                            id="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="ejemplo@correo.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700" htmlFor="password">
                            Contraseña
                        </label>
                        <input 
                            type="password" 
                            id="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-pink-600" />
                            <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                        </label>
                        <a href="#" className="text-sm text-pink-600 hover:text-pink-800">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-700 hover:from-pink-600 hover:to-purple-800 text-white font-semibold rounded-md transition duration-200 transform hover:scale-105"
                    >
                        Iniciar Sesión
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        ¿No tienes una cuenta?{' '}
                        <a href="#" className="text-pink-600 hover:text-pink-800 font-medium">
                            Regístrate aquí
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default PageLogin;