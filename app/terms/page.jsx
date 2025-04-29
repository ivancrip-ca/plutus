'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdAccountBalance, MdGavel } from 'react-icons/md';

export default function TermsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-cyan-50 rounded-full mb-4">
                <MdGavel className="h-8 w-8 text-cyan-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Términos y Condiciones</h1>
              <p className="text-gray-600 mt-2">
                Última actualización: 28 de abril de 2025
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-gray-800">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">1. Introducción</h2>
                <p className="mb-4">
                  Bienvenido a Plutus Finance ("nosotros", "nuestro", "Plutus"). Al utilizar nuestra aplicación y servicios, 
                  usted acepta estos Términos y Condiciones en su totalidad. Si no está de acuerdo con estos Términos y Condiciones
                  o cualquier parte de los mismos, no debe utilizar nuestros servicios.
                </p>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">2. Definiciones</h2>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">
                    <strong>"Aplicación"</strong> significa la aplicación web Plutus Finance accesible a través de cualquier dispositivo.
                  </li>
                  <li className="mb-2">
                    <strong>"Servicios"</strong> significa todos los servicios proporcionados por Plutus, incluyendo pero no limitado a la 
                    gestión financiera personal, seguimiento de gastos, presupuestos y reportes financieros.
                  </li>
                  <li className="mb-2">
                    <strong>"Usuario"</strong> significa cualquier persona que acceda o utilice nuestros Servicios.
                  </li>
                  <li className="mb-2">
                    <strong>"Datos del Usuario"</strong> significa cualquier información que un Usuario proporcione o genere 
                    durante el uso de nuestros Servicios.
                  </li>
                </ul>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">3. Registro y Cuentas de Usuario</h2>
                <p className="mb-4">
                  Al registrarse en Plutus, usted acepta:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">Proporcionar información precisa, actual y completa.</li>
                  <li className="mb-2">Mantener y actualizar prontamente su información para que siga siendo precisa.</li>
                  <li className="mb-2">Ser responsable de salvaguardar su contraseña y cualquier actividad bajo su cuenta.</li>
                  <li className="mb-2">Notificarnos de inmediato sobre cualquier uso no autorizado de su cuenta.</li>
                </ul>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">4. Uso Aceptable</h2>
                <p className="mb-4">
                  Usted se compromete a no utilizar nuestros Servicios para:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">Actividades ilegales o fraudulentas.</li>
                  <li className="mb-2">Transmitir material ofensivo, difamatorio o de cualquier manera objetable.</li>
                  <li className="mb-2">Intentar acceder no autorizado a nuestros sistemas o interferir con ellos.</li>
                  <li className="mb-2">Recolectar o almacenar datos personales de otros usuarios sin su consentimiento.</li>
                </ul>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">5. Privacidad y Protección de Datos</h2>
                <p className="mb-4">
                  La protección de sus datos es de suma importancia para nosotros. Nuestra Política de Privacidad describe cómo 
                  recopilamos, usamos y protegemos su información personal. Al utilizar nuestros Servicios, usted acepta 
                  nuestras prácticas de privacidad.
                </p>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">6. Planes de Suscripción y Pagos</h2>
                <p className="mb-4">
                  Plutus ofrece diferentes planes de suscripción, incluyendo opciones gratuitas y premium. Para los planes de pago:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">Las suscripciones se renuevan automáticamente a menos que se cancelen.</li>
                  <li className="mb-2">Los precios pueden cambiar con previo aviso.</li>
                  <li className="mb-2">No se ofrecen reembolsos por periodos parciales de suscripción.</li>
                </ul>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">7. Limitación de Responsabilidad</h2>
                <p className="mb-4">
                  Plutus proporciona herramientas para el manejo financiero personal, pero:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">No garantizamos la precisión de los cálculos o análisis financieros.</li>
                  <li className="mb-2">No somos responsables de decisiones financieras tomadas basadas en nuestra plataforma.</li>
                  <li className="mb-2">No sustituimos el consejo financiero profesional.</li>
                </ul>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">8. Propiedad Intelectual</h2>
                <p className="mb-4">
                  Todos los derechos de propiedad intelectual en relación con Plutus y sus contenidos son propiedad nuestra o 
                  de nuestros licenciantes. Usted no puede copiar, modificar, distribuir, vender o arrendar ninguna parte de 
                  nuestros servicios sin nuestro permiso explícito.
                </p>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">9. Terminación</h2>
                <p className="mb-4">
                  Podemos suspender o terminar su acceso a nuestros Servicios en cualquier momento, por cualquier motivo, sin previo aviso.
                  Usted puede cancelar su cuenta en cualquier momento a través de la configuración de su cuenta.
                </p>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">10. Cambios a estos Términos</h2>
                <p className="mb-4">
                  Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios entrarán en vigor 
                  inmediatamente después de su publicación. El uso continuado de nuestros Servicios después de cualquier 
                  cambio constituye su aceptación de los nuevos Términos.
                </p>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">11. Ley Aplicable</h2>
                <p className="mb-4">
                  Estos Términos se rigen por las leyes de España, sin tener en cuenta sus conflictos de principios legales.
                </p>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">12. Contacto</h2>
                <p className="mb-4">
                  Si tiene alguna pregunta sobre estos Términos, por favor contáctenos en: 
                  <a href="mailto:support@plutusfinance.com" className="text-cyan-600 hover:text-cyan-800">
                    support@plutusfinance.com
                  </a>
                </p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link href="/register" className="inline-flex items-center text-cyan-600 hover:text-cyan-800">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Volver
              </Link>
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
}