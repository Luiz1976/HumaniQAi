import React from 'react';

export const SeoFooterCTA = () => {
    return (
        <div className="mt-16 border-t pt-12">
            <h3 className="text-2xl font-bold text-center mb-8 text-slate-900">Próximos Passos</h3>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center no-prose">
                <a
                    href="https://www.humaniqai.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl text-slate-700 bg-white border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 transition-all duration-300 w-full md:w-auto min-w-[200px] shadow-sm hover:shadow-md group"
                >
                    <span>🌐</span> Visitar Site Oficial
                </a>

                <a
                    href="https://www.humaniqai.com.br/quick-check"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 w-full md:w-auto min-w-[200px] shadow-lg hover:shadow-indigo-200 hover:-translate-y-1"
                >
                    <span>⚡</span> Fazer Quick Check
                </a>

                <a
                    href="https://buy.stripe.com/3cI5kE3gic0g04U2Cd6sw00"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-xl text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 w-full md:w-auto min-w-[200px] shadow-lg hover:shadow-emerald-200 hover:-translate-y-1 ring-4 ring-emerald-50/50"
                >
                    <span>💎</span> Contratar Plano
                </a>
            </div>
        </div>
    );
};
