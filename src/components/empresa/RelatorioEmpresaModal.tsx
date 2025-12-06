import React, { useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Download,
    Share2,
    Printer,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Info,
    BarChart3,
    PieChart,
    Target,
    Lightbulb,
    FileText
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Cell
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface RelatorioEmpresaModalProps {
    isOpen: boolean;
    onClose: () => void;
    dados: any; // Tipar melhor se possível com a interface do backend
    loading?: boolean;
}

export function RelatorioEmpresaModal({ isOpen, onClose, dados, loading }: RelatorioEmpresaModalProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!contentRef.current) return;

        setGeneratingPdf(true);
        try {
            const canvas = await html2canvas(contentRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`Relatorio_HumaniQ_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("Relatório baixado com sucesso!");
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            toast.error("Erro ao gerar PDF.");
        } finally {
            setGeneratingPdf(false);
        }
    };

    if (!dados && !loading) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[90vw] w-[1200px] h-[90vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-6 border-b bg-white shrink-0 z-10 flex flex-row items-center justify-between">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6 text-blue-600" />
                        Relatório Analítico Integrado
                    </DialogTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir
                        </Button>
                        <Button variant="default" size="sm" onClick={handleDownloadPDF} disabled={generatingPdf}>
                            <Download className="h-4 w-4 mr-2" />
                            {generatingPdf ? 'Gerando...' : 'Baixar PDF'}
                        </Button>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 bg-gray-50/50">
                    <div className="p-8 max-w-5xl mx-auto bg-white min-h-full shadow-sm" id="relatorio-content" ref={contentRef}>

                        {/* 1. CAPA */}
                        <div className="flex flex-col items-center justify-center py-20 border-b-2 border-blue-100 mb-12 text-center">
                            <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                <span className="text-white text-3xl font-bold">HQ</span>
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">Relatório de Diagnóstico Organizacional</h1>
                            <h2 className="text-2xl text-gray-600 mb-8">{dados?.empresa?.nome || 'Empresa'}</h2>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Target className="h-4 w-4" /> {dados?.empresa?.setor || 'Geral'}</span>
                                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> {dados?.empresa?.totalParticipantes || 0} Participantes</span>
                                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                                <span>{new Date().toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>

                        {/* 2. SUMÁRIO EXECUTIVO */}
                        <section className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                                <h3 className="text-2xl font-bold text-gray-800">Sumário Executivo</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {dados?.resumoExecutivo?.destaques?.map((destaque: any, idx: number) => (
                                    <Card key={idx} className={`border-l-4 ${destaque.cor === 'green' ? 'border-l-green-500' : destaque.cor === 'blue' ? 'border-l-blue-500' : 'border-l-yellow-500'}`}>
                                        <CardContent className="pt-6">
                                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">{destaque.label}</p>
                                            <p className={`text-3xl font-bold ${destaque.cor === 'green' ? 'text-green-700' : destaque.cor === 'blue' ? 'text-blue-700' : 'text-yellow-700'}`}>
                                                {destaque.valor}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-900 leading-relaxed">
                                <p className="text-lg">{dados?.resumoExecutivo?.texto || "Aguardando análise dos dados..."}</p>
                            </div>
                        </section>

                        {/* 3. METODOLOGIA */}
                        <section className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1 bg-gray-400 rounded-full"></div>
                                <h3 className="text-2xl font-bold text-gray-800">Metodologia Aplicada</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Este diagnóstico baseia-se em instrumentos validados cientificamente para aferição de Clima Organizacional,
                                Riscos Psicossociais (protocolo RPO), Bem-Estar e Qualidade de Vida no Trabalho.
                                Os dados foram coletados de forma anônima e confidencial, garantindo a fidedignidade das respostas.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                {['Clima Organizacional', 'Bem-Estar Psicológico', 'Riscos Psicossociais', 'Assédio & Compliance'].map((item, i) => (
                                    <div key={i} className="bg-gray-50 p-3 rounded-lg text-center text-sm font-medium text-gray-700 border">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 4. RESULTADOS DETALHADOS */}
                        <section className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1 bg-purple-600 rounded-full"></div>
                                <h3 className="text-2xl font-bold text-gray-800">Resultados por Área</h3>
                            </div>

                            {dados?.resultadosPorArea && Object.entries(dados.resultadosPorArea).map(([key, modulo]: [string, any]) => (
                                <div key={key} className="mb-12 last:mb-0">
                                    <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-gray-500" />
                                        {modulo.nome}
                                    </h4>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Gráfico de Distribuição */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Distribuição de Resultados</CardTitle>
                                            </CardHeader>
                                            <CardContent className="h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={[
                                                        { name: 'Excelente', valor: modulo.distribuicao.excelente, fill: '#22c55e' },
                                                        { name: 'Bom', valor: modulo.distribuicao.bom, fill: '#3b82f6' },
                                                        { name: 'Regular', valor: modulo.distribuicao.regular, fill: '#eab308' },
                                                        { name: 'Crítico', valor: modulo.distribuicao.critico, fill: '#ef4444' },
                                                    ]}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip
                                                            cursor={{ fill: 'transparent' }}
                                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                        />
                                                        <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                                                            {
                                                                [
                                                                    { fill: '#22c55e' },
                                                                    { fill: '#3b82f6' },
                                                                    { fill: '#eab308' },
                                                                    { fill: '#ef4444' }
                                                                ].map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))
                                                            }
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>

                                        {/* Detalhes dos Testes */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Média por Teste</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {Object.values(modulo.testes).map((teste: any) => (
                                                        <div key={teste.nome}>
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="font-medium text-gray-700">{teste.nome}</span>
                                                                <span className="font-bold text-gray-900">{teste.media}%</span>
                                                            </div>
                                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${teste.media >= 80 ? 'bg-green-500' :
                                                                            teste.media >= 60 ? 'bg-blue-500' :
                                                                                teste.media >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                                        }`}
                                                                    style={{ width: `${teste.media}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* 5. INSIGHTS E RECOMENDAÇÕES */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                            {/* Insights */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-8 w-1 bg-yellow-500 rounded-full"></div>
                                    <h3 className="text-2xl font-bold text-gray-800">Insights Principais</h3>
                                </div>
                                <div className="space-y-4">
                                    {dados?.insights?.map((insight: any, idx: number) => (
                                        <div key={idx} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-start gap-3">
                                                {insight.tipo === 'forca' ? (
                                                    <TrendingUp className="h-6 w-6 text-green-500 mt-1" />
                                                ) : (
                                                    <AlertTriangle className="h-6 w-6 text-yellow-500 mt-1" />
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg mb-1">{insight.titulo}</h4>
                                                    <p className="text-gray-600">{insight.descricao}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Recomendações */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                                    <h3 className="text-2xl font-bold text-gray-800">Plano de Ação</h3>
                                </div>
                                <div className="space-y-4">
                                    {dados?.recomendacoes?.map((rec: any, idx: number) => (
                                        <div key={idx} className="bg-green-50 border border-green-100 p-5 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant={rec.prioridade === 'alta' ? 'destructive' : 'secondary'}>
                                                    {rec.prioridade === 'alta' ? 'Alta Prioridade' : 'Média Prioridade'}
                                                </Badge>
                                                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border">
                                                    Prazo: {rec.prazo}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 mb-2">{rec.acao}</h4>
                                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                                <Target className="h-3 w-3" /> Responsável: {rec.responsavel}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* RODAPÉ */}
                        <div className="pt-12 border-t text-center text-gray-400 text-sm">
                            <p>Gerado automaticamente pela plataforma HumaniQ</p>
                            <p className="mt-1">© {new Date().getFullYear()} HumaniQ. Todos os direitos reservados.</p>
                        </div>

                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
