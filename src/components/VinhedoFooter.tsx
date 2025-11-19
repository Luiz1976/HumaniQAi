import React from 'react';

export function VinhedoFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-4 mt-auto">
      <div className="container mx-auto px-4 flex items-center justify-center gap-3">
        <img 
          src="/Bandeira_de_Vinhedo_-_SP.svg.png" 
          alt="Bandeira de Vinhedo - SP" 
          className="h-8 w-auto object-contain"
        />
        <span className="text-gray-600 text-sm font-medium">
          Feito em Vinhedo-SP
        </span>
      </div>
    </footer>
  );
}