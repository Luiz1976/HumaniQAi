import React from 'react';
import logoTransparentImage from '@/assets/logo-transparent.png';

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
    sm: 'h-24 w-auto',
    md: 'h-32 w-auto',
    lg: 'h-40 w-auto'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Logo em imagem */}
      <div className="transform transition-all duration-300 hover:scale-110">
        <img
          src={logoTransparentImage}
          alt="HumaniQ AI - Inteligência Psicossocial"
          className={`${sizeClasses[size]} object-contain`}
          style={{
            filter: 'drop-shadow(0 0 25px rgba(57, 167, 255, 0.4))'
          }}
        />
      </div>

      {/* Texto INTELIGÊNCIA PSICOSSOCIAL abaixo */}
      {showText && (
        <div className={`mt-3 text-center ${textSizes[size]}`}>
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