import React from 'react';

interface HumaniQLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HumaniQLogo: React.FC<HumaniQLogoProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Container com gradiente diagonal e brilho */}
      <div 
        className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 shadow-lg shadow-blue-500/50 transform transition-all duration-300 hover:scale-110 hover:shadow-blue-500/70"
        style={{
          background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 40%, #9333ea 100%)',
          boxShadow: '0 0 25px rgba(59, 130, 246, 0.6), 0 0 50px rgba(147, 51, 234, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Estrela de 4 pontas centralizada */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Estrela principal */}
          <svg 
            width="60%" 
            height="60%" 
            viewBox="0 0 24 24" 
            fill="white"
            className="relative z-10"
          >
            {/* Estrela de 4 pontas */}
            <path 
              d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z"
              fill="white"
            />
          </svg>

          {/* Símbolo de + no canto superior direito */}
          <div className="absolute top-1 right-1 w-2 h-2 flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
              <path d="M3 1H5V3H7V5H5V7H3V5H1V3H3V1Z" fill="white" />
            </svg>
          </div>

          {/* Ponto pequeno no lado esquerdo/inferior esquerdo */}
          <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-white opacity-80"></div>
        </div>
      </div>
    </div>
  );
};

export default HumaniQLogo;