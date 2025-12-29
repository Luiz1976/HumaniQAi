import React from 'react';
import { SeoHead } from '../../components/seo/SeoHead';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

const NR01Page = () => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "NR-01 e Riscos Psicossociais: Guia Completo para Conformidade",
        "author": {
            "@type": "Organization",
            "name": "HumaniQ AI"
        },
        "publisher": {
            "@type": "Organization",
            "name": "HumaniQ AI",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.humaniqai.com.br/logo.png"
            }
        },
        "description": "Descubra como a NR-01 aborda os riscos psicossociais e o que sua empresa precisa fazer para estar em conformidade legal e promover a saúde mental."
    };

    return (
        <div className="min-h-screen bg-background">
            <SeoHead
                title="Guia da NR-01: Gestão de Riscos Psicossociais | HumaniQ AI"
                description="Guia técnico sobre a NR-01 atualizada. Entenda as obrigatoriedades legais, multas, e como incluir os riscos psicossociais no PGR e GRO."
                canonicalUrl="/nr01"
                schema={schema}
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <nav className="mb-8 text-sm text-slate-500">
                    <Link to="/" className="hover:text-blue-600">Home</Link> &gt; <span className="text-slate-900">Guia NR-01</span>
                </nav>

                <h1 className="text-4xl font-bold mb-6 text-slate-900">NR-01 e os Riscos Psicossociais: O que diz a Lei?</h1>

                <div className="prose prose-lg max-w-none text-slate-700">
                    <p className="lead text-xl mb-8 border-l-4 border-blue-600 pl-4 bg-blue-50 py-2 rounded-r">
                        A Norma Regulamentadora nº 01 (NR-01) determina as disposições gerais sobre saúde e segurança.
                        <strong>Aviso Legal:</strong> A nova redação torna obrigatória a inclusão dos riscos psicossociais no Gerenciamento de Riscos Ocupacionais (GRO).
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Obrigatoriedade e Fiscalização</h2>
                    <p>
                        Não é mais uma recomendação, é lei. As empresas devem identificar perigos e avaliar riscos que afetem a saúde mental.
                        O não cumprimento pode acarretar multas administrativas pesadas aplicadas pelo Ministério do Trabalho, além de responsabilização civil em casos de doenças ocupacionais.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">O Novo Texto da NR-01 e a Portaria MTP nº 672/2021</h2>
                    <p>
                        A nova redação da NR-01 trouxe uma mudança de paradigma: deixamos de olhar apenas para "insalubridade e periculosidade" (PPRA) para gerenciar <strong>todos</strong> os riscos ocupacionais (PGR).
                        O item 1.5.3.1.3 é claro: a organização deve adotar mecanismos para consultar os trabalhadores quanto à percepção de riscos ocupacionais, podendo para este fim ser adotadas as manifestações da CIPA.
                    </p>
                    <p className="mt-4">
                        Além disso, a <strong>ISO 45003</strong>, norma internacional que complementa a gestão de saúde e segurança, serve como balizadora para o que se espera de uma gestão de riscos psicossociais eficiente, citando explicitamente fatores como:
                    </p>
                    <ul className="list-disc pl-6 mb-6">
                        <li>Carga de trabalho excessiva ou mal distribuída;</li>
                        <li>Falta de autonomia e controle sobre o trabalho;</li>
                        <li>Relações interpessoais precárias e assédio;</li>
                        <li>Falta de reconhecimento e recompensa;</li>
                        <li>Insegurança contratual.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Checklist de Conformidade NR-01</h2>
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <p className="mb-4 font-semibold">Sua empresa passaria em uma auditoria do MTE hoje? Verifique os itens obrigatórios:</p>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                Inventário de Riscos (PGR) atualizado incluindo fatores psicossociais?
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                Plano de Ação com medidas de controle cronogramadas?
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                Evidências de consulta aos trabalhadores (avaliações, pesquisas)?
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                Treinamento e orientações repassadas às lideranças?
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                Monitoramento contínuo da eficácia das medidas?
                            </li>
                        </ul>
                    </div>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Riscos Legais: Multas e Consequências</h2>
                    <p>
                        O não cumprimento das disposições da NR-01 acarreta multas que variam conforme o número de empregados e o tipo de infração (segurança ou medicina do trabalho).
                    </p>
                    <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500 my-6">
                        <h4 className="font-bold text-red-800 mb-2">Atenção aos valores:</h4>
                        <p className="text-red-700">
                            As multas podem variar de <strong>R$ 1.799,39 a R$ 6.708,08</strong> por infração. Em caso de reincidência, embaraço à fiscalização ou tentativa de fraude, os valores são multiplicados.
                            <br /><br />
                            Entretanto, o custo mais alto costuma vir de <strong>Ações Civis Públicas</strong> movidas pelo Ministério Público do Trabalho (MPT) em casos de denúncias de assédio ou epidemia de burnout, cujas indenizações por Dano Moral Coletivo podem ultrapassar a casa dos milhões de reais.
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Como a HumaniQ AI Garante sua Conformidade</h2>
                    <p className="mb-6">
                        A plataforma HumaniQ AI foi desenhada especificamente para atender a todos os requisitos da NR-01 no que tange aos riscos psicossociais.
                        Não entregamos apenas uma "pesquisa de clima", entregamos um <Link to="/software-nr01" className="text-blue-600 hover:underline font-medium">software de gestão de conformidade completo</Link>:
                    </p>
                    <ul className="list-disc pl-6 mb-6">
                        <li><strong>Identificação Técnica:</strong> Mapeamento baseado em modelos científicos (Karasek/COPSOQ).</li>
                        <li><strong>Análise de Risco:</strong> Classificação automática da probabilidade e severidade dos riscos.</li>
                        <li><strong>Plano de Ação Inteligente:</strong> A IA sugere medidas de controle específicas para os riscos encontrados.</li>
                        <li><strong>Monitoramento:</strong> Dashboards em tempo real para acompanhar a evolução dos indicadores.</li>
                        <li><strong>Documentação:</strong> Geração automática do capítulo de Riscos Psicossociais para o seu PGR.</li>
                    </ul>
                </div>

                <div className="mt-12 bg-blue-50 p-8 rounded-xl border border-blue-100 text-center">
                    <h3 className="text-2xl font-bold mb-4 text-blue-900">Não corra riscos desnecessários</h3>
                    <p className="mb-6 text-blue-800">
                        Adequar-se à NR-01 é mais simples e barato do que você imagina. Regularize sua empresa agora.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/quick-check">
                            <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-bold">
                                Fazer Diagnóstico Gratuito
                            </Button>
                        </Link>
                        <a href="https://api.whatsapp.com/send/?phone=5519983835867&text=Ol%C3%A1%2C+vi+o+artigo+sobre+NR-01+e+quero+conhecer+a+plataforma.&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                Falar com Consultor
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NR01Page;
