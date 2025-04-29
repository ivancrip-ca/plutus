'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { MdAccountBalance, MdDashboard, MdAttachMoney, MdInsights, MdShowChart, MdSecurity, MdDevices } from "react-icons/md";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Evitar errores de hidratación
  useEffect(() => {
    setMounted(true);

    // Verificar si hay parámetros de restablecimiento de contraseña o verificación de correo
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    
    if (mode === 'resetPassword' && oobCode) {
      console.log('Detectado enlace de restablecimiento de contraseña, redirigiendo...');
      // Redirigir a la página personalizada de restablecimiento de contraseña
      router.push(`/reset-password?oobCode=${oobCode}`);
    } else if (mode === 'verifyEmail' && oobCode) {
      console.log('Detectado enlace de verificación de correo electrónico, redirigiendo...');
      // Redirigir a la página personalizada de verificación de correo
      router.push(`/verify-email?oobCode=${oobCode}`);
    }
  }, [searchParams, router]);

  // Función para manejar desplazamiento suave a las secciones
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80, // Restamos 80px para compensar la altura del header
        behavior: 'smooth'
      });
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="py-4 px-6 flex justify-between items-center bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center">
          
          <MdAccountBalance className="h-8 w-8 text-cyan-500 mr-2" />
          <span className="text-xl font-bold">Plutus</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-sm font-medium text-gray-700 hover:text-black">Funcionalidades</a>
            <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="text-sm font-medium text-gray-700 hover:text-black">Precios</a>
            <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="text-sm font-medium text-gray-700 hover:text-black">FAQ</a>
          </nav>
          
          <div className="flex items-center space-x-2">
            <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200">
              Iniciar sesión
            </Link>
            
            <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700">
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Controla tus finanzas de manera <span className="text-cyan-500">inteligente</span>
            </h1>
            <p className="text-lg mb-8 text-gray-600">
              Plutus es tu compañero financiero personal que te ayuda a gestionar gastos, ahorros y presupuestos de forma efectiva. Toma el control de tu dinero hoy mismo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="px-8 py-3 rounded-lg text-base font-medium bg-cyan-600 text-white hover:bg-cyan-700 text-center">
                Comenzar gratis
              </Link>
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="px-8 py-3 rounded-lg text-base font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 text-center">
                Ver funcionalidades
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="rounded-2xl overflow-hidden shadow-xl shadow-cyan-200 max-w-md relative">
              <Image 
                src="/images/logoPlutus.png" 
                alt="Plutus Dashboard Preview" 
                width={600} 
                height={400}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-100/30 to-purple-100/30 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Funcionalidades principales</h2>
            <p className="max-w-3xl mx-auto text-gray-600">
              Plutus ofrece todas las herramientas que necesitas para administrar tus finanzas de manera efectiva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-white shadow-sm">
              <div className="rounded-full w-12 h-12 flex items-center justify-center mb-4 bg-cyan-100">
                <MdDashboard className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Panel de control</h3>
              <p className="text-gray-600">
                Visualiza todas tus finanzas en un solo lugar con un panel intuitivo y personalizable.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-white shadow-sm">
              <div className="rounded-full w-12 h-12 flex items-center justify-center mb-4 bg-cyan-100">
                <MdAttachMoney className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestión de gastos</h3>
              <p className="text-gray-600">
                Registra y categoriza tus gastos para saber exactamente en qué estás gastando tu dinero.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-white shadow-sm">
              <div className="rounded-full w-12 h-12 flex items-center justify-center mb-4 bg-cyan-100">
                <MdInsights className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Presupuestos</h3>
              <p className="text-gray-600">
                Crea y gestiona presupuestos personalizados para alcanzar tus metas financieras.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl bg-white shadow-sm">
              <div className="rounded-full w-12 h-12 flex items-center justify-center mb-4 bg-cyan-100">
                <MdShowChart className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Informes y reportes</h3>
              <p className="text-gray-600">
                Genera informes detallados para analizar tus patrones de gasto y ahorro a lo largo del tiempo.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl bg-white shadow-sm">
              <div className="rounded-full w-12 h-12 flex items-center justify-center mb-4 bg-cyan-100">
                <MdSecurity className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seguridad garantizada</h3>
              <p className="text-gray-600">
                Tus datos financieros están protegidos con encriptación de nivel bancario y autenticación segura.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl bg-white shadow-sm">
              <div className="rounded-full w-12 h-12 flex items-center justify-center mb-4 bg-cyan-100">
                <MdDevices className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Acceso multiplataforma</h3>
              <p className="text-gray-600">
                Accede a tus finanzas desde cualquier dispositivo, en cualquier momento y lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Planes simples y transparentes</h2>
            <p className="max-w-3xl mx-auto text-gray-600">
              Selecciona el plan que mejor se adapte a tus necesidades financieras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-2">Plan Básico</h3>
                <p className="text-gray-600 mb-6">Ideal para empezar</p>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold">Gratis</span>
                  <span className="ml-2 text-gray-500">para siempre</span>
                </div>
                <Link href="/register" className="block w-full py-3 px-4 rounded-lg text-center font-medium bg-gray-100 text-gray-800 hover:bg-gray-200">
                  Comenzar Ahora
                </Link>
              </div>
              <div className="px-8 pb-8 text-gray-600">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Hasta 5 cuentas financieras
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Reportes básicos
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Presupuestos limitados
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Soporte por email
                  </li>
                </ul>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="rounded-2xl overflow-hidden bg-white border-2 border-cyan-500 shadow-xl relative">
              <div className="absolute top-0 right-0 bg-cyan-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                Popular
              </div>
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-2">Plan Premium</h3>
                <p className="text-gray-600 mb-6">Para finanzas personales avanzadas</p>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold">$9.99</span>
                  <span className="ml-2 text-gray-500">/mes</span>
                </div>
                <Link href="/register" className="block w-full py-3 px-4 rounded-lg text-center font-medium bg-cyan-600 text-white hover:bg-cyan-700">
                  Comenzar Prueba Gratuita
                </Link>
              </div>
              <div className="px-8 pb-8 text-gray-600">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Cuentas financieras ilimitadas
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Reportes avanzados
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Presupuestos ilimitados
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Exportación de datos
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Soporte prioritario
                  </li>
                </ul>
              </div>
            </div>

            {/* Business Plan */}
            <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-2">Plan Empresarial</h3>
                <p className="text-gray-600 mb-6">Para equipos y negocios</p>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold">$29.99</span>
                  <span className="ml-2 text-gray-500">/mes</span>
                </div>
                <Link href="/register" className="block w-full py-3 px-4 rounded-lg text-center font-medium bg-gray-100 text-gray-800 hover:bg-gray-200">
                  Contactar Ventas
                </Link>
              </div>
              <div className="px-8 pb-8 text-gray-600">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Todo lo incluido en Premium
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Hasta 10 usuarios
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Funciones contables
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    API para integración
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Soporte dedicado 24/7
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-6 bg-gray-50 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Preguntas frecuentes</h2>
            <p className="max-w-3xl mx-auto text-gray-600">
              Resolvemos tus dudas más comunes sobre Plutus
            </p>
          </div>

          <div className="space-y-6">
            <FaqItem 
              question="¿Cómo protege Plutus mis datos financieros?" 
              answer="Plutus utiliza encriptación de nivel bancario para proteger tus datos. Todos los datos se almacenan de forma segura en servidores con certificación de seguridad, y nunca compartimos tu información con terceros sin tu consentimiento explícito."
            />
            
            <FaqItem 
              question="¿Puedo sincronizar mis cuentas bancarias con Plutus?" 
              answer="Actualmente, Plutus no ofrece sincronización directa con instituciones bancarias. Todas las transacciones deben ser ingresadas manualmente. Estamos trabajando en implementar esta función en futuras actualizaciones."
            />
            
            <FaqItem 
              question="¿Cómo funciona la prueba gratuita del Plan Premium?" 
              answer="La prueba gratuita del Plan Premium tiene una duración de 30 días, durante los cuales tendrás acceso a todas las funcionalidades premium. No se requiere tarjeta de crédito para comenzar, y puedes cancelar en cualquier momento."
            />
            
            <FaqItem 
              question="¿Puedo acceder a Plutus desde múltiples dispositivos?" 
              answer="Sí, Plutus es completamente multiplataforma. Puedes acceder a tu cuenta desde cualquier navegador web en computadoras, tablets y smartphones. Además, está optimizado para funcionar correctamente en todos los tamaños de pantalla."
            />
            
            <FaqItem 
              question="¿Qué sucede con mis datos si cancelo mi suscripción?" 
              answer="Si cancelas tu suscripción premium, tu cuenta se degradará automáticamente al plan gratuito, manteniendo tus datos básicos. Tendrás 30 días para exportar cualquier dato adicional antes de que se limiten algunas funcionalidades."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-cyan-50 p-10 md:p-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Comienza tu viaje financiero hoy mismo</h2>
          <p className="max-w-2xl mx-auto mb-8 text-gray-600">
            Únete a miles de personas que ya están tomando el control de sus finanzas con Plutus. Registrarse es gratis y solo toma unos minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 rounded-lg text-base font-medium bg-cyan-600 text-white hover:bg-cyan-700 text-center">
              Crear una cuenta gratis
            </Link>
            <Link href="/login" className="px-8 py-3 rounded-lg text-base font-medium bg-white text-gray-800 hover:bg-gray-50 text-center">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-gray-100">
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

// Componente para los items del FAQ
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 flex justify-between items-center focus:outline-none"
      >
        <h3 className="text-lg font-medium">{question}</h3>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''} text-gray-500`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 text-gray-600">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};
