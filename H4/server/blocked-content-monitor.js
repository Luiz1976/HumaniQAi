/**
 * HumaniQ PAS - Sistema de Bloqueio Automático para Assédio Moral e Sexual
 * Implementa detecção e bloqueio automático de conteúdo inadequado
 */

const fs = require('fs');
const path = require('path');

// Palavras-chave e padrões para detecção de assédio
const ASSEDIO_PATTERNS = {
  moral: {
    palavras_chave: [
      'humilhação', 'humilhante', 'ridicularização', 'ridicularizar',
      'exclusão', 'excluir', 'isolamento', 'isolar', 'boicote',
      'sabotagem', 'sabotar', 'difamação', 'difamar', 'calúnia',
      'chantagem', 'chantagear', 'ameaça', 'ameaçar', 'intimidação',
      'intimidar', 'pressão psicológica', 'pressão excessiva',
      'tratamento desumano', 'despotismo', 'tirania', 'abuso de poder',
      'perseguição', 'perseguir', 'assédio moral', 'bullying'
    ],
    categorias: ['agressão verbal', 'exclusão social', 'sabotagem profissional']
  },
  sexual: {
    palavras_chave: [
      'assédio sexual', 'assédio sexo', 'conotação sexual', 'sexual',
      'comentário sexual', 'insinuação sexual', 'avanço sexual',
      'proposição sexual', 'toque inapropriado', 'toque desrespeitoso',
      'importunação sexual', 'importunar', 'molestar', 'molestação',
      'abuso sexual', 'violência sexual', 'estupro', 'coação sexual',
      'chantagem sexual', 'retaliação sexual', 'favorecimento sexual'
    ],
    categorias: ['comentários sexuais', 'avanços físicos', 'proposições indecentes']
  }
};

// Limiares para ativação do bloqueio
const LIMIARES = {
  CRITICO: 0.8,    // Bloqueio imediato
  ALTO: 0.6,       // Revisão urgente
  MODERADO: 0.4,   // Monitoramento intensivo
  BAIXO: 0.2       // Observação
};

class BlockedContentMonitor {
  constructor() {
    this.logsDir = path.join(__dirname, 'logs');
    this.ensureLogsDirectory();
    this.blockedContent = new Map();
    this.loadBlockedContent();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  loadBlockedContent() {
    try {
      const filePath = path.join(this.logsDir, 'blocked-content.json');
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.blockedContent = new Map(data);
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo bloqueado:', error);
      this.blockedContent = new Map();
    }
  }

  saveBlockedContent() {
    try {
      const filePath = path.join(this.logsDir, 'blocked-content.json');
      const data = Array.from(this.blockedContent.entries());
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Erro ao salvar conteúdo bloqueado:', error);
    }
  }

  /**
   * Analisa texto para detectar possível assédio
   * @param {string} texto - Texto a ser analisado
   * @param {string} contexto - Contexto do texto (pergunta, resposta, etc.)
   * @param {string} usuarioId - ID do usuário
   * @param {string} testeId - ID do teste
   * @returns {Object} Resultado da análise
   */
  analisarConteudo(texto, contexto = 'desconhecido', usuarioId = null, testeId = null) {
    const timestamp = new Date().toISOString();
    const textoLower = texto.toLowerCase();
    
    console.log(`[BLOQUEIO] Analisando conteúdo para ${usuarioId} no teste ${testeId}`);

    let scoreMoral = 0;
    let scoreSexual = 0;
    let palavrasDetectadas = [];
    let categoriasDetectadas = [];

    // Análise de assédio moral
    ASSEDIO_PATTERNS.moral.palavras_chave.forEach(palavra => {
      if (textoLower.includes(palavra.toLowerCase())) {
        scoreMoral += 0.2;
        palavrasDetectadas.push({ palavra, tipo: 'moral' });
        categoriasDetectadas.push(...ASSEDIO_PATTERNS.moral.categorias);
      }
    });

    // Análise de assédio sexual
    ASSEDIO_PATTERNS.sexual.palavras_chave.forEach(palavra => {
      if (textoLower.includes(palavra.toLowerCase())) {
        scoreSexual += 0.25;
        palavrasDetectadas.push({ palavra, tipo: 'sexual' });
        categoriasDetectadas.push(...ASSEDIO_PATTERNS.sexual.categorias);
      }
    });

    // Score geral (máximo entre os dois tipos)
    const scoreGeral = Math.max(scoreMoral, scoreSexual);
    
    // Determinar nível de risco
    let nivelRisco = 'BAIXO';
    let acaoRecomendada = 'permitir';
    
    if (scoreGeral >= LIMIARES.CRITICO) {
      nivelRisco = 'CRÍTICO';
      acaoRecomendada = 'bloquear_imediato';
    } else if (scoreGeral >= LIMIARES.ALTO) {
      nivelRisco = 'ALTO';
      acaoRecomendada = 'revisar_urgente';
    } else if (scoreGeral >= LIMIARES.MODERADO) {
      nivelRisco = 'MODERADO';
      acaoRecomendada = 'monitorar';
    }

    const resultado = {
      timestamp,
      usuarioId,
      testeId,
      contexto,
      texto: texto.substring(0, 200) + (texto.length > 200 ? '...' : ''),
      scoreGeral,
      scoreMoral,
      scoreSexual,
      nivelRisco,
      acaoRecomendada,
      palavrasDetectadas,
      categoriasDetectadas: [...new Set(categoriasDetectadas)],
      bloqueado: acaoRecomendada === 'bloquear_imediato'
    };

    // Registrar log detalhado
    this.registrarLog('analise', resultado);

    // Executar ação recomendada
    if (acaoRecomendada === 'bloquear_imediato') {
      this.bloquearConteudo(resultado);
    }

    return resultado;
  }

  /**
   * Bloqueia conteúdo e registra o bloqueio
   */
  bloquearConteudo(resultado) {
    const blockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const bloqueio = {
      id: blockId,
      timestamp: resultado.timestamp,
      usuarioId: resultado.usuarioId,
      testeId: resultado.testeId,
      motivo: 'deteccao_automatica_assedio',
      scoreGeral: resultado.scoreGeral,
      nivelRisco: resultado.nivelRisco,
      palavrasDetectadas: resultado.palavrasDetectadas,
      categorias: resultado.categoriasDetectadas,
      ativo: true,
      dataDesbloqueio: null,
      revisadoPor: null,
      observacoes: 'Bloqueio automático ativado pelo sistema HumaniQ PAS'
    };

    this.blockedContent.set(blockId, bloqueio);
    this.saveBlockedContent();
    
    // Registrar log de bloqueio
    this.registrarLog('bloqueio', bloqueio);
    
    console.log(`[BLOQUEIO] Conteúdo bloqueado automaticamente: ${blockId}`);
    
    return bloqueio;
  }

  /**
   * Registra logs detalhados
   */
  registrarLog(tipo, dados) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        tipo,
        dados,
        pid: process.pid
      };

      const logFile = path.join(this.logsDir, 'blocked-content-monitor.log');
      const logLine = JSON.stringify(logEntry) + '\n';
      
      fs.appendFileSync(logFile, logLine);
      
      // Também logar no console para monitoramento em tempo real
      if (tipo === 'bloqueio') {
        console.log(`🚨 [BLOQUEIO] ${timestamp} - Usuário ${dados.usuarioId} bloqueado por assédio detectado`);
      }
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  }

  /**
   * Verifica se usuário está bloqueado
   */
  isUsuarioBloqueado(usuarioId) {
    for (const [blockId, bloqueio] of this.blockedContent) {
      if (bloqueio.usuarioId === usuarioId && bloqueio.ativo) {
        return bloqueio;
      }
    }
    return null;
  }

  /**
   * Obtém estatísticas de bloqueios
   */
  getEstatisticas() {
    const totalBloqueios = this.blockedContent.size;
    const bloqueiosAtivos = Array.from(this.blockedContent.values()).filter(b => b.ativo).length;
    const bloqueiosPorCategoria = {};
    
    this.blockedContent.forEach(bloqueio => {
      bloqueio.categorias.forEach(categoria => {
        bloqueiosPorCategoria[categoria] = (bloqueiosPorCategoria[categoria] || 0) + 1;
      });
    });

    return {
      totalBloqueios,
      bloqueiosAtivos,
      bloqueiosPorCategoria,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Lista todos os bloqueios
   */
  listarBloqueios(ativo = null) {
    const bloqueios = Array.from(this.blockedContent.values());
    
    if (ativo !== null) {
      return bloqueios.filter(b => b.ativo === ativo);
    }
    
    return bloqueios;
  }

  /**
   * Desbloqueia conteúdo (requer revisão humana)
   */
  desbloquearConteudo(blockId, revisadoPor, observacoes = '') {
    const bloqueio = this.blockedContent.get(blockId);
    
    if (!bloqueio) {
      throw new Error('Bloqueio não encontrado');
    }

    bloqueio.ativo = false;
    bloqueio.dataDesbloqueio = new Date().toISOString();
    bloqueio.revisadoPor = revisadoPor;
    bloqueio.observacoes = observacoes;

    this.blockedContent.set(blockId, bloqueio);
    this.saveBlockedContent();
    
    this.registrarLog('desbloqueio', {
      blockId,
      revisadoPor,
      observacoes,
      timestamp: bloqueio.dataDesbloqueio
    });

    console.log(`[DESBLOQUEIO] Conteúdo desbloqueado por ${revisadoPor}: ${blockId}`);
    
    return bloqueio;
  }
}

// Exportar instância singleton
const monitor = new BlockedContentMonitor();

module.exports = {
  BlockedContentMonitor,
  monitor,
  ASSEDIO_PATTERNS,
  LIMIARES
};