import React from 'react';
import { SeoHead } from '../../../components/seo/SeoHead';
import { Button } from '../../../components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BurnoutArtigo = () => {
    return (
        <div className="min-h-screen bg-background">
            <SeoHead
                title="Sinais de Burnout na equipe: Como identificar? | Blog HumaniQ AI"
                description="Aprenda a reconhecer os primeiros sinais de esgotamento profissional nos seus colaboradores e como intervir precocemente."
                canonicalUrl="/blog/sinais-burnout"
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o Blog
                </Link>

                <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <img src="/images/blog/mapeamento-post.png" alt="Mapeamento Psicossocial" className="w-full h-64 object-contain bg-slate-100" />

                    <div className="p-8">
                        <div className="text-xs font-semibold text-green-600 uppercase mb-2">Saúde Mental</div>
                        <h1 className="text-4xl font-bold mb-4 text-slate-900">Sinais de Burnout na equipe: Como identificar?</h1>

                        <div className="prose prose-slate max-w-none">
                            <p className="text-lg text-slate-600 mb-6">
                                O Burnout, reconhecido pela OMS como fenômeno ocupacional desde 2022, é caracterizado por exaustão
                                emocional, despersonalização e redução da realização pessoal relacionadas ao trabalho. Identificar
                                precocemente os sinais é fundamental para prevenir consequências graves.
                            </p>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">O que é Burnout?</h2>
                            <p className="text-slate-700 mb-4">
                                Também conhecido como Síndrome do Esgotamento Profissional, o Burnout é resultado de estresse crônico
                                no ambiente de trabalho que não foi adequadamente gerenciado. Diferente do estresse comum, o Burnout
                                é um estado de exaustão física e mental prolongado.
                            </p>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Principais sinais de alerta</h2>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">Sinais comportamentais</h3>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li><strong>Queda na produtividade:</strong> Dificuldade em manter o ritmo habitual de trabalho</li>
                                <li><strong>Procrastinação frequente:</strong> Adiamento constante de tarefas importantes</li>
                                <li><strong>Isolamento social:</strong> Evitar interações com colegas e participação em atividades da equipe</li>
                                <li><strong>Aumento do absenteísmo:</strong> Faltas frequentes ou atrasos recorrentes</li>
                                <li><strong>Cinismo e negatividade:</strong> Atitude pessimista em relação ao trabalho e à empresa</li>
                            </ul>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">Sinais físicos</h3>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li>Fadiga constante, mesmo após períodos de descanso</li>
                                <li>Dores de cabeça frequentes</li>
                                <li>Problemas gastrointestinais</li>
                                <li>Tensão muscular, especialmente em ombros e pescoço</li>
                                <li>Alterações no sono (insônia ou sono excessivo)</li>
                                <li>Mudanças no apetite</li>
                            </ul>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">Sinais emocionais</h3>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li>Irritabilidade e mudanças bruscas de humor</li>
                                <li>Sensação de desamparo e desesperança</li>
                                <li>Perda de motivação e entusiasmo</li>
                                <li>Sentimento de fracasso ou inadequação</li>
                                <li>Ansiedade e preocupação excessiva</li>
                                <li>Distanciamento emocional do trabalho</li>
                            </ul>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Como identificar na sua equipe</h2>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">1. Observe mudanças de comportamento</h3>
                            <p className="text-slate-700 mb-4">
                                Preste atenção em colaboradores que apresentam mudanças significativas em seu padrão de comportamento.
                                Um funcionário normalmente sociável que se torna isolado pode estar sinalizando problemas.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">2. Monitore indicadores de desempenho</h3>
                            <p className="text-slate-700 mb-4">
                                Quedas consistentes no desempenho, aumento de erros ou dificuldade em cumprir prazos podem ser sinais
                                de esgotamento. Analise dados de produtividade com sensibilidade.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">3. Realize avaliações periódicas</h3>
                            <p className="text-slate-700 mb-4">
                                Implemente ferramentas de avaliação de clima organizacional e saúde mental. Questionários padronizados
                                podem identificar riscos antes que se tornem problemas graves.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">4. Mantenha canais de comunicação abertos</h3>
                            <p className="text-slate-700 mb-4">
                                Crie um ambiente onde os colaboradores se sintam seguros para compartilhar suas dificuldades.
                                Reuniões one-on-one regulares são essenciais.
                            </p>

                            <div className="bg-amber-50 border-l-4 border-amber-600 p-6 my-8">
                                <p className="text-amber-900 font-semibold mb-2">⚠️ Atenção</p>
                                <p className="text-amber-800">
                                    Burnout não tratado pode levar a consequências graves, incluindo depressão, problemas cardiovasculares
                                    e outras doenças físicas. A intervenção precoce é fundamental.
                                </p>
                            </div>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Como intervir efetivamente</h2>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">Ações imediatas</h3>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li>Converse com o colaborador de forma empática e confidencial</li>
                                <li>Avalie a carga de trabalho e redistribua tarefas se necessário</li>
                                <li>Oriente sobre recursos de apoio disponíveis (psicólogos, programas de assistência)</li>
                                <li>Considere ajustes temporários na jornada ou nas responsabilidades</li>
                            </ul>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">Ações preventivas</h3>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li>Promova uma cultura organizacional que valorize o equilíbrio vida-trabalho</li>
                                <li>Estabeleça metas realistas e prazos razoáveis</li>
                                <li>Reconheça e celebre conquistas da equipe</li>
                                <li>Ofereça oportunidades de desenvolvimento e crescimento</li>
                                <li>Invista em programas de qualidade de vida</li>
                            </ul>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Como a HumaniQ AI auxilia na prevenção</h2>
                            <p className="text-slate-700 mb-4">
                                Nossa plataforma oferece ferramentas especializadas para identificação precoce de Burnout:
                            </p>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li>Questionários validados para detecção de sinais de esgotamento</li>
                                <li>Dashboard com indicadores de risco em tempo real</li>
                                <li>Relatórios individuais e coletivos preservando a confidencialidade</li>
                                <li>Alertas automáticos para gestores quando riscos são identificados</li>
                                <li>Histórico de avaliações para acompanhamento da evolução</li>
                            </ul>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Conclusão</h2>
                            <p className="text-slate-700 mb-4">
                                Identificar e prevenir o Burnout é responsabilidade compartilhada entre empresa, gestores e colaboradores.
                                Ao criar um ambiente de trabalho saudável e implementar ferramentas de monitoramento adequadas,
                                você não apenas cumpre obrigações legais, mas também investe no bem-estar e na produtividade da sua equipe.
                            </p>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <div className="flex gap-4">
                                <Link to="/quick-check">
                                    <Button className="bg-green-600 hover:bg-green-700">
                                        Avaliar Saúde Mental da Equipe
                                    </Button>
                                </Link>
                                <a href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre prevenção de Burnout" target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline">
                                        Falar com Especialista
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BurnoutArtigo;
