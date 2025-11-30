import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lock, Unlock, Calendar, CheckCircle2, Clock, AlertCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getCursoBySlug } from '@/data/cursosData';
import type { Curso } from '@/data/cursosData';

interface CursoInfo {
  id: number;
  slug: string;
  titulo: string;
  descricao: string;
  duracao: string;
  nivel: string;
  categoria: string;
  subtitulo?: string;
  icone?: string;
  modulos?: unknown[];
  cor?: string;
  disponibilidade: {
    id: string;
    disponivel: boolean;
    periodicidadeDias: number | null;
    ultimaLiberacao: string | null;
    proximaDisponibilidade: string | null;
  } | null;
  ultimaAvaliacao: {
    id: string;
    pontuacao: number;
    dataRealizacao: string;
  } | null;
  foiConcluido: boolean;
}

interface GerenciamentoCursosColaboradorProps {
  colaboradorId: string;
  colaboradorNome: string;
}

export function GerenciamentoCursosColaborador({
  colaboradorId,
  colaboradorNome,
}: GerenciamentoCursosColaboradorProps) {
  const [cursos, setCursos] = useState<CursoInfo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [showPeriodicidadeModal, setShowPeriodicidadeModal] = useState(false);
  const [cursoAtual, setCursoAtual] = useState<CursoInfo | null>(null);
  const [periodicidade, setPeriodicidade] = useState<number | null>(null);
  const [processando, setProcessando] = useState(false);

  const carregarCursos = useCallback(async () => {
    try {
      setCarregando(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `/api/curso-disponibilidade/empresa/colaborador/${colaboradorId}/cursos`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar cursos');
      }

      const data = await response.json();
      setCursos(data.cursos || []);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      toast.error('Erro ao carregar cursos');
    } finally {
      setCarregando(false);
    }
  }, [colaboradorId]);

  useEffect(() => {
    carregarCursos();
  }, [carregarCursos]);

  

  const liberarCurso = async (cursoSlug: string) => {
    try {
      setProcessando(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `/api/curso-disponibilidade/empresa/colaborador/${colaboradorId}/curso/${cursoSlug}/liberar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao liberar curso');
      }

      toast.success('Curso liberado com sucesso');
      await carregarCursos();
    } catch (error) {
      console.error('Erro ao liberar curso:', error);
      toast.error('Erro ao liberar curso');
    } finally {
      setProcessando(false);
    }
  };

  const bloquearCurso = async (cursoSlug: string) => {
    try {
      setProcessando(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `/api/curso-disponibilidade/empresa/colaborador/${colaboradorId}/curso/${cursoSlug}/bloquear`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao bloquear curso');
      }

      toast.success('Curso bloqueado com sucesso');
      await carregarCursos();
    } catch (error) {
      console.error('Erro ao bloquear curso:', error);
      toast.error('Erro ao bloquear curso');
    } finally {
      setProcessando(false);
    }
  };

  const configurarPeriodicidade = async () => {
    if (!cursoAtual) return;

    try {
      setProcessando(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `/api/curso-disponibilidade/empresa/colaborador/${colaboradorId}/curso/${cursoAtual.slug}/periodicidade`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            periodicidadeDias: periodicidade,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao configurar periodicidade');
      }

      toast.success('Periodicidade configurada com sucesso');
      setShowPeriodicidadeModal(false);
      setCursoAtual(null);
      setPeriodicidade(null);
      await carregarCursos();
    } catch (error) {
      console.error('Erro ao configurar periodicidade:', error);
      toast.error('Erro ao configurar periodicidade');
    } finally {
      setProcessando(false);
    }
  };

  const abrirModalPeriodicidade = (curso: CursoInfo) => {
    setCursoAtual(curso);
    setPeriodicidade(curso.disponibilidade?.periodicidadeDias || null);
    setShowPeriodicidadeModal(true);
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Gerenciar Cursos - {colaboradorNome}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure a disponibilidade e periodicidade dos cursos para este colaborador
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursos.map((curso) => (
          <Card
            key={curso.slug}
            className={`${
              curso.disponibilidade?.disponivel === false
                ? 'bg-gray-50 dark:bg-gray-800/50'
                : 'bg-white dark:bg-gray-800'
            } border-2 border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group hover:border-blue-200`}
            data-testid={`card-curso-${curso.slug}`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                  {(() => {
                    const info = getCursoBySlug(curso.slug) as Curso | undefined;
                    const iconStr = curso.icone ?? info?.['ícone'] ?? '';
                    return iconStr || <BookOpen className="h-12 w-12 text-blue-600" />;
                  })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <CardTitle className="text-xl md:text-2xl font-bold leading-snug">
                      {(() => {
                        const info = getCursoBySlug(curso.slug) as Curso | undefined;
                        return curso.titulo || info?.['título'] || '';
                      })()}
                    </CardTitle>
                    {curso.foiConcluido && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shrink-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Concluído
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {(() => {
                        const info = getCursoBySlug(curso.slug) as Curso | undefined;
                        return curso.categoria || info?.['categoria'] || '';
                      })()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {(() => {
                        const info = getCursoBySlug(curso.slug) as Curso | undefined;
                        return curso.nivel || info?.['nível'] || '';
                      })()}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Informações do Curso */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{(() => { const info = getCursoBySlug(curso.slug) as Curso | undefined; return curso.duracao || info?.['duração'] || ''; })()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{(() => { const info = getCursoBySlug(curso.slug) as Curso | undefined; const m = Array.isArray(curso.modulos) ? curso.modulos.length : Array.isArray(info?.['módulos']) ? (info as Curso)['módulos'].length : 0; return `${m} módulos`; })()}</span>
                  </div>
                </div>
                {(() => { const info = getCursoBySlug(curso.slug) as Curso | undefined; const subt = curso.subtitulo || info?.['subtítulo'] || ''; return subt; })() && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {(() => { const info = getCursoBySlug(curso.slug) as Curso | undefined; return curso.subtitulo || info?.['subtítulo'] || ''; })()}
                  </p>
                )}

                {/* Status do Curso */}
                <div className="flex items-center gap-2 text-sm">
                  {curso.disponibilidade?.disponivel ? (
                    <>
                      <Unlock className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium" data-testid={`status-${curso.slug}`}>
                        Disponível
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600 font-medium" data-testid={`status-${curso.slug}`}>
                        Bloqueado
                      </span>
                    </>
                  )}
                </div>

                {/* Informações adicionais */}
                {curso.ultimaAvaliacao && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>
                      Concluído em:{' '}
                      {format(new Date(curso.ultimaAvaliacao.dataRealizacao), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                )}

                {curso.disponibilidade?.periodicidadeDias && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>Periodicidade: {curso.disponibilidade.periodicidadeDias} dias</span>
                  </div>
                )}

                {curso.disponibilidade?.proximaDisponibilidade && (
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>
                      Próxima disponibilidade:{' '}
                      {format(
                        new Date(curso.disponibilidade.proximaDisponibilidade),
                        "dd/MM/yyyy",
                        { locale: ptBR }
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex flex-col gap-2">
                {!curso.disponibilidade?.disponivel ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => liberarCurso(curso.slug)}
                    disabled={processando}
                    className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    data-testid={`button-liberar-${curso.slug}`}
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    Liberar Curso
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bloquearCurso(curso.slug)}
                    disabled={processando}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                    data-testid={`button-bloquear-${curso.slug}`}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Bloquear Curso
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => abrirModalPeriodicidade(curso)}
                  disabled={processando}
                  className="w-full"
                  data-testid={`button-periodicidade-${curso.slug}`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Configurar Periodicidade
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Periodicidade */}
      <Dialog open={showPeriodicidadeModal} onOpenChange={setShowPeriodicidadeModal}>
        <DialogContent data-testid="modal-periodicidade">
          <DialogHeader>
            <DialogTitle>Configurar Periodicidade</DialogTitle>
            <DialogDescription>
              Defina o intervalo de tempo (em dias) para que o curso "{cursoAtual?.titulo}" fique
              disponível novamente após a conclusão.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="periodicidade" className="text-sm font-medium">
              Periodicidade (dias)
            </Label>
            <Input
              id="periodicidade"
              type="number"
              min="1"
              value={periodicidade || ''}
              onChange={(e) => setPeriodicidade(e.target.value ? Number(e.target.value) : null)}
              placeholder="Ex: 30, 90, 180..."
              className="mt-2"
              data-testid="input-periodicidade"
            />
            <p className="text-xs text-gray-500 mt-2">
              Deixe vazio para desabilitar a liberação automática
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPeriodicidadeModal(false);
                setCursoAtual(null);
                setPeriodicidade(null);
              }}
              disabled={processando}
              data-testid="button-cancelar"
            >
              Cancelar
            </Button>
            <Button
              onClick={configurarPeriodicidade}
              disabled={processando}
              data-testid="button-salvar"
            >
              {processando ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
