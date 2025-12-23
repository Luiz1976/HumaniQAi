import React from 'react';
import { SeoHead } from '../../../components/seo/SeoHead';
import { Button } from '../../../components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const IAGestaoArtigo = () => {
    return (
        <div className="min-h-screen bg-background">
            <SeoHead
                title="IA na Gestão de Pessoas: O futuro chegou | Blog HumaniQ AI"
                description="Como a inteligência artificial está revolucionando a forma como o RH cuida do ativo mais precioso das empresas: as pessoas."
                canonicalUrl="/blog/ia-gestao-pessoas"
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o Blog
                </Link>

                <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <img src="/images/blog/ia-gestao-post.png" alt="IA na Gestão de Pessoas" className="w-full h-64 object-contain bg-slate-100" />

                    <div className="p-8">
                        <div className="text-xs font-semibold text-purple-600 uppercase mb-2">Tecnologia</div>
                        <h1 className="text-4xl font-bold mb-4 text-slate-900">IA na Gestão de Pessoas: O futuro chegou</h1>

                        <div className="prose prose-slate max-w-none">
                            <p className="text-lg text-slate-600 mb-6">
                                A Inteligência Artificial está transformando radicalmente a forma como as empresas gerenciam seu capital humano.
                                Longe de substituir o fator humano, a IA potencializa a capacidade dos profissionais de RH de cuidarem melhor
                                das pessoas, tornando processos mais eficientes e decisões mais embasadas.
                            </p>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">A revolução da IA no RH</h2>
                            <p className="text-slate-700 mb-4">
                                Nos últimos anos, testemunhamos uma aceleração sem precedentes na adoção de tecnologias de IA em Recursos Humanos.
                                O que antes era ficção científica agora é realidade em empresas inovadoras ao redor do mundo.
                            </p>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Principais aplicações da IA em Gestão de Pessoas</h2>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">1. Recrutamento e Seleção Inteligentes</h3>
                            <p className="text-slate-700 mb-4">
                                Algoritmos de IA podem analisar milhares de currículos em minutos, identificando candidatos que melhor se
                                adequam ao perfil desejado. Mais importante, a IA pode reduzir vieses inconscientes no processo seletivo,
                                promovendo maior diversidade e inclusão.
                            </p>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li>Triagem automatizada de currículos baseada em competências</li>
                                <li>Análise preditiva de adequação cultural</li>
                                <li>Chatbots para entrevistas preliminares</li>
                                <li>Agendamento automático de entrevistas</li>
                            </ul>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">2. Avaliação de Desempenho Contínua</h3>
                            <p className="text-slate-700 mb-4">
                                Sistemas de IA permitem monitoramento contínuo de performance, substituindo avaliações anuais por
                                feedback constante e construtivo.
                            </p>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li>Análise de produtividade em tempo real</li>
                                <li>Identificação de tendências de desempenho</li>
                                <li>Sugestões personalizadas de desenvolvimento</li>
                                <li>Detecção precoce de quedas de performance</li>
                            </ul>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">3. Gestão de Saúde Mental e Bem-estar</h3>
                            <p className="text-slate-700 mb-4">
                                Uma das aplicações mais importantes da IA está na prevenção de problemas de saúde mental.
                                Sistemas inteligentes podem identificar sinais precoces de burnout, estresse ou outros riscos psicossociais.
                            </p>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li>Mapeamento automático de riscos psicossociais</li>
                                <li>Análise de padrões comportamentais</li>
                                <li>Alertas preventivos para gestores</li>
                                <li>Recomendações personalizadas de intervenção</li>
                            </ul>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">4. Desenvolvimento e Capacitação</h3>
                            <p className="text-slate-700 mb-4">
                                A IA personaliza trilhas de aprendizagem, identificando gaps de competências e sugerindo
                                conteúdos relevantes para cada colaborador.
                            </p>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li>Planos de desenvolvimento individualizados</li>
                                <li>Recomendação de cursos e treinamentos</li>
                                <li>Análise de efetividade de programas de capacitação</li>
                                <li>Gamificação inteligente do aprendizado</li>
                            </ul>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">5. People Analytics</h3>
                            <p className="text-slate-700 mb-4">
                                IA transforma dados de RH em insights acionáveis, permitindo decisões estratégicas baseadas em evidências.
                            </p>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li>Previsão de turnover</li>
                                <li>Identificação de talentos de alto potencial</li>
                                <li>Análise de clima organizacional</li>
                                <li>Otimização de estruturas organizacionais</li>
                            </ul>

                            <div className="bg-purple-50 border-l-4 border-purple-600 p-6 my-8">
                                <p className="text-purple-900 font-semibold mb-2">💡 Insight importante</p>
                                <p className="text-purple-800">
                                    A IA não substitui o toque humano em RH. Ela libera os profissionais de tarefas repetitivas
                                    para que possam focar no que realmente importa: conexões humanas genuínas e desenvolvimento de talentos.
                                </p>
                            </div>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Desafios e considerações éticas</h2>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">Privacidade e proteção de dados</h3>
                            <p className="text-slate-700 mb-4">
                                É fundamental garantir que sistemas de IA em RH estejam em conformidade com a LGPD e outras
                                regulamentações de proteção de dados. A transparência sobre como os dados são coletados e utilizados é essencial.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">Vieses algorítmicos</h3>
                            <p className="text-slate-700 mb-4">
                                Sistemas de IA podem perpetuar ou até amplificar vieses existentes se não forem adequadamente
                                treinados e monitorados. É crucial auditar regularmente os algoritmos para garantir equidade.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">Transparência e explicabilidade</h3>
                            <p className="text-slate-700 mb-4">
                                Colaboradores têm o direito de entender como decisões que os afetam são tomadas.
                                Sistemas de IA devem ser transparentes e suas recomendações explicáveis.
                            </p>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">O futuro da IA em Gestão de Pessoas</h2>
                            <p className="text-slate-700 mb-4">
                                As tendências para os próximos anos incluem:
                            </p>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li><strong>IA Generativa:</strong> Criação automática de descrições de cargo, políticas e comunicações de RH</li>
                                <li><strong>Análise de sentimento em tempo real:</strong> Monitoramento do clima organizacional através de canais de comunicação (com consentimento)</li>
                                <li><strong>Realidade Virtual e IA:</strong> Simulações imersivas para treinamentos e avaliações</li>
                                <li><strong>Assistentes virtuais personalizados:</strong> Cada colaborador terá seu próprio coach de IA</li>
                                <li><strong>Previsão de necessidades futuras:</strong> Antecipação de demandas de contratação e capacitação</li>
                            </ul>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Como começar a usar IA no seu RH</h2>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">1. Identifique pontos de dor</h3>
                            <p className="text-slate-700 mb-4">
                                Comece mapeando quais processos de RH são mais demorados, repetitivos ou propensos a erros.
                                Estes são candidatos ideais para automação com IA.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">2. Invista em dados de qualidade</h3>
                            <p className="text-slate-700 mb-4">
                                IA é tão boa quanto os dados que a alimentam. Certifique-se de ter dados limpos, organizados e atualizados.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">3. Comece pequeno</h3>
                            <p className="text-slate-700 mb-4">
                                Implemente soluções de IA gradualmente, começando com projetos piloto em áreas específicas.
                                Aprenda com os resultados antes de expandir.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">4. Capacite sua equipe</h3>
                            <p className="text-slate-700 mb-4">
                                Prepare os profissionais de RH para trabalharem com IA. Isso inclui tanto habilidades técnicas
                                quanto compreensão sobre ética e governança de IA.
                            </p>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">HumaniQ AI: IA aplicada à saúde mental corporativa</h2>
                            <p className="text-slate-700 mb-4">
                                Nossa plataforma utiliza IA de ponta para revolucionar a gestão de saúde mental e riscos psicossociais:
                            </p>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li>Algoritmos de ML para identificação precoce de burnout e outros riscos</li>
                                <li>Análise preditiva de tendências de saúde mental</li>
                                <li>Recomendações personalizadas de intervenção</li>
                                <li>Dashboard inteligente com insights acionáveis</li>
                                <li>Conformidade automática com NR-01 e outras regulamentações</li>
                            </ul>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Conclusão</h2>
                            <p className="text-slate-700 mb-4">
                                A IA na gestão de pessoas não é mais uma visão futurista — é uma realidade presente que está
                                transformando o RH. Empresas que abraçam essa tecnologia de forma responsável e estratégica
                                ganham vantagem competitiva significativa, não apenas em eficiência operacional, mas principalmente
                                em sua capacidade de criar ambientes de trabalho mais saudáveis, produtivos e humanos.
                            </p>
                            <p className="text-slate-700">
                                O futuro da gestão de pessoas é uma parceria entre humanos e máquinas, onde a tecnologia amplifica
                                nossa capacidade de cuidar, desenvolver e valorizar cada colaborador.
                            </p>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <div className="flex gap-4">
                                <Link to="/quick-check">
                                    <Button className="bg-purple-600 hover:bg-purple-700">
                                        Experimentar IA Grátis
                                    </Button>
                                </Link>
                                <a href="https://wa.me/5511999999999?text=Olá! Gostaria de conhecer a plataforma HumaniQ AI" target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline">
                                        Ver Demonstração
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

export default IAGestaoArtigo;
