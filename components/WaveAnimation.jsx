import React from 'react';

const WaveAnimation = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Capa de gradiente principal */}
      <div className="absolute inset-0 bg-gradient-to-t from-green-200 via-cyan-900 to-cyan-900"></div>
      
      {/* Primera ola (más lenta, más grande) */}
      <div className="absolute bottom-0 left-0 right-0 w-[200%]">
        <svg 
          className="animate-wave-fast w-full h-56 fill-current text-white/10"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.11,130.83,141.14,213.2,56.44Z"></path>
        </svg>
      </div>
      
      {/* Segunda ola (velocidad media, tamaño medio) */}
      <div className="absolute bottom-0 left-0 right-0 w-[200%]">
        <svg 
          className="animate-wave-fast w-full h-40 fill-current text-white/5"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
        </svg>
      </div>
      
      {/* Tercera ola (más rápida, más pequeña) */}
      <div className="absolute bottom-0 left-0 right-0 w-[200%]">
        <svg 
          className="animate-wave-fast w-full h-24 fill-current text-white/10"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
        </svg>
      </div>
    </div>
  );
};

export default WaveAnimation;
