import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, Clock } from 'lucide-react';
import type { Módulo } from '@/data/cursosData';

interface Props {
  modulos: Módulo[];
  modulosCompletados: number[];
  moduloExpandido: number | null;
  onToggleExpand: (id: number) => void;
  onCompletarModulo: (id: number) => void;
  bloqueioEfetivo: boolean;
  completarPending: boolean;
  normalizarLinha: (texto: unknown) => string;
}

export default function ConteudoProgramatico(props: Props) {
  const {
    modulos,
    modulosCompletados,
    moduloExpandido,
    onToggleExpand,
    onCompletarModulo,
    bloqueioEfetivo,
    completarPending,
    normalizarLinha,
  } = props;

  return (
    <div className="space-y-4">
      {modulos.map((modulo, index) => {
        const moduloConcluido = modulosCompletados.includes(modulo.id);
        const expandido = moduloExpandido === modulo.id;
        const duracaoModulo = modulo.duração || '';
        const topicosModulo = Array.isArray(modulo.tópicos) ? modulo.tópicos : [];
        const material = modulo.materialDidático || '';

        return (
          <Card
            key={modulo.id}
            className={`border-2 transition-all ${moduloConcluido ? 'border-green-200 bg-green-50/50' : 'border-gray-100'}`}
            data-testid={`card-modulo-${modulo.id}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${moduloConcluido ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {moduloConcluido ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 flex items-center gap-2">
                      {normalizarLinha(modulo.título)}
                      {moduloConcluido && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                          Concluído
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{duracaoModulo}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {expandido && (
                <div className="space-y-6 mb-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Tópicos Abordados:
                    </h4>
                    <ul className="space-y-2">
                      {topicosModulo.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>{normalizarLinha(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">📚 Material de Estudo Completo</h4>
                    <div className="prose prose-sm max-w-none" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#374151' }}>
                      {normalizarLinha(material)}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => onToggleExpand(expandido ? null as any : modulo.id)} data-testid={`button-ver-modulo-${modulo.id}`}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  {expandido ? 'Ocultar Conteúdo' : 'Ver Conteúdo'}
                </Button>

                {!moduloConcluido && expandido && (
                  <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800" onClick={() => onCompletarModulo(modulo.id)} disabled={completarPending || bloqueioEfetivo} data-testid={`button-completar-modulo-${modulo.id}`}>
                    {completarPending ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-green-600 border-t-transparent rounded-full" />
                        Marcando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Marcar como Concluído
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
