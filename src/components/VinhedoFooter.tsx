import React, { useState } from 'react';

export function VinhedoFooter() {
  const localPath = new URL('/Bandeira_de_Vinhedo_-_SP.svg.png', window.location.origin).toString();
  const [src, setSrc] = useState<string>(localPath);
  const handleError = () => {
    if (src === localPath) {
      setSrc('https://www.humaniqai.com.br/Bandeira_de_Vinhedo_-_SP.svg.png');
    }
  };
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-4 mt-auto">
      <div className="container mx-auto px-4 flex items-center justify-center gap-3">
        <img 
          src={src}
          alt="Bandeira de Vinhedo - SP" 
          className="h-8 w-auto object-contain"
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={handleError}
        />
        <span className="text-gray-600 text-sm font-medium">
          Feito em Vinhedo-SP
        </span>
      </div>
    </footer>
  );
}