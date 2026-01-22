import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot, CheckCircle2, Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
// import { Button } from '../ui/button'; // Not used in this version but kept if needed

// --- Interfaces ---
interface Message {
    id: string;
    text: string;
    sender: 'user' | 'agent';
    timestamp: Date;
    suggestions?: string[];
}

// --- Letícia Premium Brain (v4.0) ---
// Persona: Consultora Sênior, Especialista em NR-01 e PNL.
// Techniques: Rapport, Espelhamento (Simulated), SPIN Selling, Gatilhos Mentais.

const KNOWLEDGE_BASE = {
    // 1. ABERTURA & RAPPORT (SITUAÇÃO)
    saudacao: {
        keywords: ['olá', 'oi', 'bom dia', 'boa tarde', 'tarde', 'noite', 'começar', 'iniciar', 'tudo bem', 'hello'],
        responses: [
            "Olá! É um prazer ter você aqui. 😊 Sou a Letícia, consultora da HumaniQ. Eu entendo perfeitamente os desafios atuais do RH. Me conta, hoje sua maior preocupação é a conformidade jurídica com a NR-01 ou o clima organizacional da equipe?",
            "Oi! Seja muito bem-vindo(a). Sou a Letícia. Sabe, tenho conversado com muitos gestores e a pauta é sempre a mesma: como equilibrar produtividade e saúde mental. É esse o seu desafio também no momento?"
        ],
        suggestions: ["Conformidade NR-01", "Clima e Burnout", "Ambos", "Quero conhecer a HumaniQ"]
    },

    // 2. DOR - NR-01 & MULTAS (PROBLEMA & IMPLICAÇÃO)
    nr01_riscos: {
        keywords: ['nr01', 'nr-01', 'lei', 'norma', 'multa', 'fiscalização', 'obrigatório', 'risco', 'processo', 'governo', 'prazos', '2026'],
        responses: [
            "Você tocou num ponto crítico. A fiscalização da NR-01 começa pra valer em 25/05/2026, e as multas podem chegar a R$ 6.708 por dia. ⚠️ Mas o pior não é a multa, é o passivo trabalhista de longo prazo. Você já tem evidências auditáveis de que cuida da saúde mental da sua equipe?",
            "Exato. A regra mudou. O que era subjetivo agora exige dados. Se um fiscal batesse na sua porta amanhã e pedisse o inventário de riscos psicossociais atualizado, você teria esse documento em mãos em menos de 10 minutos? Nosso sistema gera isso automaticamente.",
            "Compreendo a preocupação. O relógio está correndo. Empresas que deixarem para a última hora vão enfrentar um gargalo enorme. A HumaniQ blinda sua empresa hoje, gerando histórico de proteção jurídica desde o primeiro dia. Quer ver como funciona nosso 'Escudo Jurídico'?"
        ],
        suggestions: ["Sim, quero blindagem", "Como funciona o relatório?", "Qual o valor da multa?"]
    },

    // 3. DOR - BURNOUT & GESTÃO (PROBLEMA & IMPLICAÇÃO)
    burnout_gestao: {
        keywords: ['burnout', 'estresse', 'ansiedade', 'clima', 'equipe', 'produtividade', 'afastamento', 'doença', 'turnover', 'reter', 'talentos'],
        responses: [
            "Entendo perfeitamente. Perder um talento por exaustão custa, em média, 20 a 50% do salário anual dele. Sem falar no impacto moral no time. 📉 A HumaniQ atua como um 'radar preventivo': identificamos quem está em risco antes do afastamento acontecer. Imagine o impacto financeiro de reduzir seu turnover pela metade?",
            "É uma situação delicada, e você não está sozinho nessa. O Brasil é um dos países mais ansiosos do mundo. Nossa plataforma cria um canal seguro onde o colaborador se sente ouvido, e o RH recebe dados para agir. Transformamos 'achismo' em estratégia. Faz sentido para você ter esse controle?",
            "Sei como é. Clima pesado mata a produtividade. Mas a culpa não é da gestão, é da falta de ferramentas. Com a HumaniQ, você identifica focos de estresse (assédio, sobrecarga, metas irreais) com proteção de sigilo. É o fim do 'ele disse, ela disse'."
        ],
        suggestions: ["Quero reduzir burnout", "Como monitorar riscos?", "Ver Funcionalidades"]
    },

    // 4. SOLUÇÃO HUMANIQ (NECESSIDADE DE SOLUÇÃO)
    solucao_modulos: {
        keywords: ['como funciona', 'funciona', 'plataforma', 'sistema', 'ferramenta', 'software', 'app', 'o que faz', 'módulos', 'dashboard', 'relatório'],
        responses: [
            "A HumaniQ é a única plataforma 360° do mercado. 🚀 Nós integramos tudo: 1) Diagnóstico Online (sem papel), 2) Planos de Ação via IA (o sistema diz o que fazer) e 3) Treinamento de Líderes com certificação. É automação total para você focar nas pessoas, não na planilha. Qual desses pontos te chama mais atenção?",
            "Imagine ter um consultor sênior trabalhando 24h por dia. O sistema roda os testes, gera o Dashboard de Riscos, emite o Relatório PGR para o auditor e ainda treina seus gestores. Tudo num lugar só. É conformidade com um clique. Quer ver uma demonstração rápida?",
            "Nossa tecnologia elimina a burocracia. O sistema monitora, audita e propõe soluções. Seja para NR-01, gestão de estresse ou conformidade, a HumaniQ entrega a solução pronta. Sua única tarefa será colher os resultados e apresentar para a diretoria."
        ],
        suggestions: ["Ver Dashboard", "Sobre os Treinamentos", "Fazer Teste Grátis"]
    },

    // 5. TRILHA DE CAPACITAÇÃO (DIFERENCIAL)
    treinamento: {
        keywords: ['treinamento', 'curso', 'liderança', 'líder', 'certificado', 'ead', 'capacitação', 'ensinar'],
        responses: [
            "Excelente ponto! A maioria das empresas falha justamente na liderança. Por isso incluímos 8 cursos certificados na plataforma. Seus líderes aprendem a identificar riscos, dar feedback e prevenir burnout. E o melhor: cada certificado emitido serve como evidência de conformidade para a fiscalização. 🎓",
            "Nossa 'Universidade Corporativa' já vem inclusa. São trilhas de 'Liderança Saudável' e 'Gestão de Riscos'. Você capacita o time e ainda se protege juridicamente, provando que a empresa investe em prevenção. É um ganho duplo."
        ],
        suggestions: ["Quais são os cursos?", "Está incluso no preço?", "Começar agora"]
    },

    // 6. OBJEÇÃO - PREÇO (CUSTO X BENEFÍCIO)
    objecao_preco: {
        keywords: ['caro', 'preço', 'valor', 'custo', 'orçamento', 'dinheiro', 'investimento', 'mensalidade', 'quanto custa'],
        responses: [
            "Entendo a preocupação com o budget. Mas vamos fazer uma conta rápida? 🧮 Um único processo trabalhista custa, em média, R$ 50 mil. A HumaniQ custa a partir de R$ 35,00 por colaborador. É menos que um café por dia para blindar sua empresa. É um seguro barato pela paz que traz, não acha?",
            "Na verdade, caro é o custo da inércia. Multas diárias, advogados, rescisões... A HumaniQ é um investimento que se paga no primeiro passivo evitado. Além disso, não temos fidelidade. Você é livre para ficar apenas se ver valor. Que tal testar?",
            "Temos uma condição especial agora. Por um valor acessível, você leva a plataforma completa + a trilha de treinamentos. Sem custos ocultos de implantação. É o melhor ROI do mercado de RH hoje."
        ],
        suggestions: ["Ver Planos", "Teste Grátis", "R$ 35 é viável"]
    },

    // 7. FECHAMENTO & CTA (GATILHOS FINAIS)
    fechamento: {
        keywords: ['comprar', 'assinar', 'quero', 'agendar', 'contratar', 'testar', 'fechar', 'topo', 'interesse', 'eu quero', 'vamos'],
        responses: [
            "Ótima decisão! 🌟 Você está a um passo de transformar a gestão da sua empresa. Vou liberar seu acesso imediato ao nosso ambiente de setup. São apenas 3 cliques e você já estará em conformidade. Vamos lá?",
            "Perfeito! Não vamos deixar para depois o que pode evitar um problema amanhã. Clique no link abaixo para finalizar sua inscrição segura e começar a usar a HumaniQ agora mesmo. Estou ansiosa para ver seus resultados!"
        ],
        suggestions: ["Acessar Checkout", "Fazer Teste Grátis"]
    },

    // 8. CHECKOUT & LINKS
    checkout_links: {
        keywords: ['link', 'checkout', 'pagar', 'pagamento', 'cartão', 'boleto', 'onde clico'],
        responses: [
            "Aqui está! 🎟️ Liberei seu acesso prioritário. Clique no link abaixo para finalizar sua inscrição segura:\n\n👉 [CLIQUE AQUI PARA ACESSAR O CHECKOUT]\n\nAssim que confirmar, você recebe o login de administrador no e-mail. Bem-vindo(a) à nova era do RH!",
            "Tudo pronto. 🔐 Link gerado com sucesso! Aproveite a condição especial:\n\n👉 [IR PARA PAGAMENTO SEGURO]\n\nQualquer dúvida no processo, estou por aqui!"
        ],
        suggestions: ["Já cliquei", "Aguardando confirmação"]
    },

    // 9. QUICK CHECK (RECIPROCIDADE)
    quick_check: {
        keywords: ['teste grátis', 'fazer teste', 'gratis', 'gratuito', 'testar', 'demonstração', 'demo', 'quick check'],
        responses: [
            "Excelente iniciativa! Vamos fazer um diagnóstico rápido agora? Clique no link abaixo para rodar o 'Quick Check' da NR-01. É gratuito e te dá um panorama imediato da sua situação:\n\n👉 [INICIAR TESTE GRÁTIS](/quick-check)\n\nMe avise o resultado!",
            "Perfeito. Ver na prática é sempre melhor. Acesse nossa ferramenta de diagnóstico:\n\n👉 [ABRIR FERRAMENTA DE TESTE](/quick-check)\n\nÉ rapidinho e já te entrega um relatório preliminar de riscos."
        ],
        suggestions: ["Abrir Teste Agora", "Como funciona?"]
    },

    // 10. IDENTIDADE & HUMANIZAÇÃO
    identidade: {
        keywords: ['quem é você', 'voce é robo', 'ia', 'bot', 'humana', 'real', 'seu nome'],
        responses: [
            "Sou a Letícia, sua consultora sênior na HumaniQ. 🤖✨ Embora eu seja uma inteligência artificial, minha missão é 100% humana: cuidar de pessoas e empresas. Fui treinada com as melhores práticas de psicologia e legislação para te dar suporte real.",
            "Pode me tratar como parte do seu time! 😊 Estou conectada a toda a base de conhecimento da HumaniQ para te dar respostas precisas. Meu objetivo é ver sua empresa segura e seu time feliz."
        ],
        suggestions: ["Entendi", "Voltar para NR-01"]
    }
};

const FALLBACK_FLOWS = [
    {
        text: "Essa é uma excelente pergunta. 🤔 Enquanto consulto esse detalhe específico na nossa base técnica, me diga: como você faz esse controle hoje na sua empresa? Usa planilhas manuais?",
        suggestions: ["Uso Planilhas", "Não controlo", "Quero automatizar"]
    },
    {
        text: "Interessante ponto. Muitos clientes chegavam com essa mesma dúvida. O que percebemos é que, ao automatizar esse processo, o RH ganha tempo para ser estratégico. Você sente que seu RH hoje é mais operacional ou estratégico?",
        suggestions: ["Muito operacional", "Estratégico", "Quero mudar isso"]
    },
    {
        text: "Compreendo. Cada empresa tem seu cenário único. A HumaniQ se adapta à sua realidade, seja você uma empresa de 10 ou 10.000 funcionários. Quer ver como personalizamos a análise para o seu setor?",
        suggestions: ["Sim, quero ver", "Fazer Teste Grátis"]
    }
];

// --- Brain Logic: Generate Response with 'Mirroring' Simulation ---
const generateResponse = async (input: string): Promise<{ text: string, suggestions?: string[] }> => {
    const lowerInput = input.toLowerCase();

    // Typing simulation
    const typingTime = 1200 + Math.random() * 1500; // Slightly slower to feel more "thoughtful"
    await new Promise(resolve => setTimeout(resolve, typingTime));

    // 1. Keyword Scoring
    let bestMatch = { topic: null as string | null, score: 0 };
    Object.entries(KNOWLEDGE_BASE).forEach(([topic, data]) => {
        let score = 0;
        data.keywords.forEach(kw => {
            if (lowerInput.includes(kw)) score += 1; // Simple occurence count
        });
        // Bonus points for exact matches or high priority keywords could be added here
        if (score > bestMatch.score) {
            bestMatch = { topic, score };
        }
    });

    // 2. Response Selection
    if (bestMatch.topic && bestMatch.score > 0) {
        const topicData = KNOWLEDGE_BASE[bestMatch.topic as keyof typeof KNOWLEDGE_BASE];
        // Random selection for variety
        const response = topicData.responses[Math.floor(Math.random() * topicData.responses.length)];
        return { text: response, suggestions: topicData.suggestions };
    }

    // 3. PNL / Bridge Fallback (If no keyword matches)
    // Try to detect sentiment or intent vaguely, otherwise use Bridge technique
    const bridgeResponse = FALLBACK_FLOWS[Math.floor(Math.random() * FALLBACK_FLOWS.length)];

    return {
        text: bridgeResponse.text,
        suggestions: bridgeResponse.suggestions
    };
};

const PremiumSalesAgent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Initial State: Hook based on Guidelines (Situation/Awareness)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Olá! 👋 Sou a Letícia, consultora sênior da HumaniQ.\n\nSabia que a nova NR-01 tornou a gestão de riscos psicossociais obrigatória? \n\nPosso te mostrar se sua empresa passaria numa fiscalização hoje ou prefere conhecer nossos planos?",
            sender: 'agent',
            timestamp: new Date(),
            suggestions: ["Passaria na fiscalização?", "Ver Planos", "Fazer Teste Grátis"]
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        // User Message
        const userMsg: Message = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        try {
            const { text: responseText, suggestions } = await generateResponse(text);
            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'agent',
                timestamp: new Date(),
                suggestions
            };
            setIsTyping(false);
            setMessages(prev => [...prev, agentMsg]);
        } catch (error) {
            setIsTyping(false);
            console.error(error);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(inputValue);
    };

    // Listen to custom event to open chatbot
    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener('chatbot:open', handleOpenChat);
        return () => window.removeEventListener('chatbot:open', handleOpenChat);
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="pointer-events-auto mb-4 w-[360px] md:w-[400px] h-[600px] max-h-[80vh] bg-white/95 backdrop-blur-xl border border-indigo-50/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                        style={{ boxShadow: "0 20px 60px -10px rgba(79, 70, 229, 0.3)" }}
                    >
                        {/* Header Premium */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 flex items-center justify-between shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div className="flex items-center gap-3.5 relative z-10">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full border-2 border-white/30 shadow-md overflow-hidden relative bg-white">
                                        <img src="/leticia-avatar.png" alt="Letícia" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-indigo-700 rounded-full animate-pulse"></span>
                                </div>
                                <div className="text-white">
                                    <h3 className="font-bold text-base leading-tight">Letícia</h3>
                                    <p className="text-indigo-100 text-xs font-medium mt-0.5 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Consultora Premium
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all relative z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50 scroll-smooth">
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={cn(
                                        "flex flex-col w-full",
                                        msg.sender === 'user' ? "items-end" : "items-start"
                                    )}
                                >
                                    {msg.sender === 'agent' && (
                                        <div className="flex items-center gap-2 mb-1 ml-1">
                                            <span className="text-xs text-slate-500 font-bold">Letícia</span>
                                        </div>
                                    )}

                                    <div className={cn(
                                        "max-w-[88%] text-sm leading-relaxed shadow-sm relative p-4",
                                        msg.sender === 'user'
                                            ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-200"
                                            : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
                                    )}>
                                        {msg.text.split('\n').map((line, i) => (
                                            <span key={i} className="block min-h-[1.2em] mb-1 last:mb-0">
                                                {/* Parsing basic markdown links if present in static text */}
                                                {line.includes('[') && line.includes('](') ? (
                                                    <span dangerouslySetInnerHTML={{
                                                        __html: line.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="underline font-bold hover:text-indigo-500" target="_blank">$1</a>')
                                                    }} />
                                                ) : line}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Suggestions */}
                                    {msg.sender === 'agent' && msg.suggestions && (
                                        <div className="flex flex-wrap gap-2 mt-3 ml-1 max-w-[95%]">
                                            {msg.suggestions.map((suggestion, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSendMessage(suggestion)}
                                                    className="bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-700 text-xs px-3 py-2 rounded-lg transition-all shadow-sm font-medium active:scale-95"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <span className="text-[10px] text-slate-300 mt-1 mx-1">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
                                    <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-12 w-20">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                    <span className="text-xs text-slate-400">Digitando...</span>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                            <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Digite sua mensagem..."
                                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl py-3.5 pl-4 pr-12 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg transition-all text-white flex items-center justify-center"
                                >
                                    {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </form>
                            <div className="flex justify-center mt-3">
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" /> HumaniQ AI Oficial
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button (FAB) */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="pointer-events-auto group relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full shadow-[0_8px_30px_rgb(79,70,229,0.4)] text-white z-[9999] overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse-slow"></div>

                <AnimatePresence mode='wait'>
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X className="w-7 h-7" />
                        </motion.div>
                    ) : (
                        <motion.div key="chat" className="relative w-full h-full p-1" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                            <img src="/leticia-avatar.png" alt="Chat" className="w-full h-full rounded-full object-cover border-2 border-white/20" />
                            <span className="absolute top-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Tooltip / Call to Action */}
            <AnimatePresence>
                {!isOpen && isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -5, opacity: 0 }}
                        className="absolute right-20 bottom-4 bg-white px-4 py-3 rounded-xl shadow-xl border border-indigo-50 max-w-[260px] pointer-events-none"
                    >
                        <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            👋 Olá! Posso ajudar?
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Sou especialista em NR-01. Vamos verificar seus riscos?
                        </p>
                        <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-white transform rotate-45 -translate-y-1/2 border-t border-r border-indigo-50"></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PremiumSalesAgent;
