'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdAccountBalance, MdSecurity } from 'react-icons/md';

export default function PrivacyPage() {
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
          <span className="text-xl font-bold text-black">Plutus</span>
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
                <MdSecurity className="h-8 w-8 text-cyan-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Política de Privacidad</h1>
              <p className="text-gray-600 mt-2">
                Última actualización: 28 de abril de 2025
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-gray-800">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">1. Introducción</h2>
                <p className="mb-4">
                  En Plutus Finance ("nosotros", "nuestro", "la Compañía"), respetamos su privacidad y estamos comprometidos a protegerla.
                  Esta Política de Privacidad explica qué información recopilamos, cómo la utilizamos y las opciones que tiene con respecto a ella.
                </p>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">2. Información que Recopilamos</h2>
                <p className="mb-4">
                  Recopilamos los siguientes tipos de información:
                </p>
                
                <h3 className="text-lg font-medium mb-2">2.1 Información que usted nos proporciona</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">
                    <strong>Información de cuenta:</strong> Al registrarse, recopilamos su nombre, dirección de correo electrónico,
                    y contraseña (almacenada de forma segura).
                  </li>
                  <li className="mb-2">
                    <strong>Información financiera:</strong> Datos que usted introduce sobre sus finanzas personales,
                    incluyendo transacciones, cuentas, presupuestos y metas financieras.
                  </li>
                  <li className="mb-2">
                    <strong>Comunicaciones:</strong> Cuando se comunica con nosotros, recopilamos la información proporcionada
                    en dichas comunicaciones.
                  </li>
                </ul>
                
                <h3 className="text-lg font-medium mb-2">2.2 Información recopilada automáticamente</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">
                    <strong>Información del dispositivo:</strong> Tipo de dispositivo, sistema operativo, y navegador web.
                  </li>
                  <li className="mb-2">
                    <strong>Datos de uso:</strong> Información sobre cómo utiliza nuestra aplicación, como patrones de navegación,
                    características utilizadas y tiempo dedicado a cada sección.
                  </li>
                  <li className="mb-2">
                    <strong>Cookies y tecnologías similares:</strong> Utilizamos cookies y tecnologías similares para mejorar su experiencia,
                    recordar sus preferencias y para fines analíticos.
                  </li>
                </ul>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">3. Cómo Utilizamos Su Información</h2>
                <p className="mb-4">
                  Utilizamos la información recopilada para:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">Proporcionar, mantener y mejorar nuestros servicios.</li>
                  <li className="mb-2">Crear y mantener su cuenta.</li>
                  <li className="mb-2">Personalizar su experiencia en nuestra aplicación.</li>
                  <li className="mb-2">Comunicarnos con usted sobre actualizaciones, funciones o promociones.</li>
                  <li className="mb-2">Detectar, investigar y prevenir actividades fraudulentas o no autorizadas.</li>
                  <li className="mb-2">Cumplir con nuestras obligaciones legales.</li>
                </ul>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">4. Compartición de Información</h2>
                <p className="mb-4">
                  No vendemos su información personal. Podemos compartir su información en las siguientes circunstancias:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">
                    <strong>Proveedores de servicios:</strong> Compartimos información con terceros que nos ayudan a operar
                    nuestra aplicación y proporcionar nuestros servicios.
                  </li>
                  <li className="mb-2">
                    <strong>Cumplimiento legal:</strong> Podemos divulgar información si creemos de buena fe que es necesario
                    para cumplir con una obligación legal o proteger los derechos, propiedad o seguridad de Plutus, nuestros usuarios u otros.
                  </li>
                  <li className="mb-2">
                    <strong>Consentimiento:</strong> Podemos compartir información con su consentimiento.
                  </li>
                </ul>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">5. Seguridad de los Datos</h2>
                <p className="mb-4">
                  Implementamos medidas de seguridad adecuadas para proteger su información personal contra acceso no autorizado,
                  alteración, divulgación o destrucción. Estas medidas incluyen:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">Encriptación de datos sensibles.</li>
                  <li className="mb-2">Acceso restringido a información personal por parte de nuestros empleados.</li>
                  <li className="mb-2">Sistemas de seguridad física y digital.</li>
                  <li className="mb-2">Evaluaciones regulares de nuestras prácticas de seguridad.</li>
                </ul>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">6. Sus Derechos de Privacidad</h2>
                <p className="mb-4">
                  Dependiendo de su ubicación, puede tener ciertos derechos relacionados con su información personal:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">Acceder a la información personal que tenemos sobre usted.</li>
                  <li className="mb-2">Corregir información inexacta o incompleta.</li>
                  <li className="mb-2">Eliminar su información personal.</li>
                  <li className="mb-2">Oponerse o restringir el procesamiento de su información.</li>
                  <li className="mb-2">Solicitar la portabilidad de sus datos.</li>
                  <li className="mb-2">Retirar su consentimiento en cualquier momento.</li>
                </ul>
                <p className="mb-4">
                  Para ejercer estos derechos, contáctenos a través de la información proporcionada en la sección "Contacto".
                </p>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">7. Retención de Datos</h2>
                <p className="mb-4">
                  Conservamos su información personal mientras mantenga una cuenta con nosotros o mientras sea necesario para
                  proporcionarle nuestros servicios. También podemos retener información para cumplir con obligaciones legales,
                  resolver disputas y hacer cumplir nuestros acuerdos.
                </p>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">8. Menores</h2>
                <p className="mb-4">
                  Nuestros servicios no están dirigidos a personas menores de 18 años, y no recopilamos información personal
                  a sabiendas de niños menores de 18 años. Si descubrimos que hemos recopilado información personal de un niño
                  menor de 18 años, tomaremos medidas para eliminar esa información.
                </p>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">9. Cambios a Esta Política</h2>
                <p className="mb-4">
                  Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos cualquier cambio material
                  publicando la nueva Política de Privacidad en esta página y, cuando sea apropiado, le enviaremos una notificación.
                  La fecha de "última actualización" en la parte superior de esta política indica cuándo fue revisada por última vez.
                </p>
                
                <h2 className="text-xl font-semibold mb-4 mt-6">10. Contacto</h2>
                <p className="mb-4">
                  Si tiene preguntas o inquietudes sobre esta Política de Privacidad o nuestras prácticas de privacidad,
                  puede contactarnos en:{' '}
                  <a href="mailto:privacy@plutusfinance.com" className="text-cyan-600 hover:text-cyan-800">
                    privacy@plutusfinance.com
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