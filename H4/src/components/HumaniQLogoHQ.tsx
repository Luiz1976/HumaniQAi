import React from 'react';

interface HumaniQLogoHQProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export const HumaniQLogoHQ: React.FC<HumaniQLogoHQProps> = ({ 
  size = 'md', 
  className = '',
  showText = true
}) => {
  const sizeClasses = {
    sm: 'w-20 h-12',
    md: 'w-28 h-16', 
    lg: 'w-36 h-20'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Container HQ com gradiente */}
      <div className={`${sizeClasses[size]} relative`}>
        <div 
          className="w-full h-full rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-lg transform transition-all duration-300 hover:scale-110"
          style={{
            background: 'linear-gradient(90deg, #39A7FF 0%, #5BB8FF 30%, #8A3DE0 70%, #9E3BCF 100%)',
            boxShadow: '0 0 25px rgba(57, 167, 255, 0.4), 0 0 50px rgba(138, 61, 224, 0.2), inset 0 0 15px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Letras HQ */}
          <div className="w-full h-full flex items-center justify-center">
            <span 
            className="font-bold text-white tracking-wider select-none"
            style={{ 
              fontSize: size === 'sm' ? '20px' : size === 'md' ? '28px' : '36px',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: '800',
              letterSpacing: '0.02em',
              textShadow: '0 2px 8px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}
          >
            HQ
          </span>
          </div>

          {/* Efeito de brilho sutil */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Texto INTELIGÊNCIA PSICOSSOCIAL abaixo */}
      {showText && (
        <div className={`mt-1 text-center ${textSizes[size]}`}>
          <span 
            className="font-medium uppercase tracking-[0.2em] select-none"
            style={{
              color: '#FFFFFF',
              fontWeight: '600',
              fontSize: size === 'sm' ? '9px' : size === 'md' ? '10px' : '11px',
              letterSpacing: '0.15em',
              textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}
          >
            INTELIGÊNCIA PSICOSSOCIAL
          </span>
        </div>
      )}
    </div>
  );
};

export default HumaniQLogoHQ;