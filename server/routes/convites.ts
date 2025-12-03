import express from 'express';
import crypto from 'crypto';
import { db, dbType } from '../db-config';
import { convitesEmpresa, convitesColaborador, empresas, colaboradores, insertConviteEmpresaSchema, insertConviteColaboradorSchema, insertEmpresaSchema, insertColaboradorSchema } from '../../shared/schema';
import { hashPassword, generateInviteToken } from '../utils/auth';
import { authenticateToken, requireAdmin, requireEmpresa, AuthRequest } from '../middleware/auth';
import { eq, and, gt, sql, or } from 'drizzle-orm';
import { z } from 'zod';
import { enviarConviteEmpresa, enviarConviteColaborador, enviarBoasVindas } from '../services/emailService';
import logger from '../utils/logger';

const router = express.Router();

// Admin cria convite para empresa
router.post('/empresa', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    logger.info('📥 [Convites/Empresa] Requisição recebida (admin)', {
      bodyKeys: Object.keys(req.body || {})
    });
    const validationResult = insertConviteEmpresaSchema.omit({ token: true, validade: true, adminId: true }).extend({
      diasValidade: z.coerce.number().min(1).max(30).default(7),
      numeroColaboradores: z.coerce.number().optional().nullable(),
      diasAcesso: z.coerce.number().optional().nullable(),
      telefone: z.string().optional().nullable(),
    }).safeParse(req.body);

    if (!validationResult.success) {
      logger.warn('⚠️ [Convites/Empresa] Falha na validação:', {
        errors: validationResult.error.issues,
        body: req.body
      });
      return res.status(400).json({ error: 'Dados inválidos', details: validationResult.error.issues });
    }

    const { nomeEmpresa, emailContato, telefone, cnpj, numeroColaboradores, diasAcesso, diasValidade, status } = validationResult.data as any;
    logger.debug('🔎 [Convites/Empresa] Dados validados', {
      nomeEmpresa,
      emailContato,
      telefone,
      cnpj,
      numeroColaboradores,
      diasAcesso,
      diasValidade,
      status
    });

    const [existingEmpresa] = await db.select().from(empresas).where(eq(empresas.emailContato, emailContato)).limit(1);
    if (existingEmpresa) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Validar limite de colaboradores
    if (numeroColaboradores && (numeroColaboradores < 1 || numeroColaboradores > 10000)) {
      return res.status(400).json({ error: 'Número de colaboradores deve estar entre 1 e 10.000' });
    }

    // Verificar limite de convites por empresa (se já existir empresa com mesmo email)
    if (numeroColaboradores) {
      try {
        let limiteMaximo = 1000;
        // Configuração de sistema removida temporariamente
        // if (typeof configuracoesSistema !== 'undefined') { ... }

        // Verificar se já existe empresa com este email de contato
        const [empresaExistente] = await db
          .select()
          .from(empresas)
          .where(eq(empresas.emailContato, emailContato))
          .limit(1);

        if (empresaExistente) {
          // Verificar quantidade atual de colaboradores da empresa
          const [result] = await db
            .select({ count: sql<number>`count(*)` })
            .from(colaboradores)
            .where(eq(colaboradores.empresaId, empresaExistente.id));

          const colaboradoresAtuais = (result as any)?.count || 0;
          const totalAposConvite = colaboradoresAtuais + (numeroColaboradores || 0);

          if (totalAposConvite > limiteMaximo) {
            return res.status(400).json({
              error: `Limite de colaboradores excedido. A empresa já possui ${colaboradoresAtuais} colaboradores. O máximo permitido é ${limiteMaximo} colaboradores.`
            });
          }
        }
      } catch (error) {
        logger.error('Erro ao verificar limite de colaboradores:', error);
        // Continuar com o convite mesmo se houver erro na verificação
      }
    }

    const token = generateInviteToken();
    const validade = new Date();
    validade.setDate(validade.getDate() + (diasValidade || 7));

    // Inserção compatível com SQLite (sem returning) e Postgres (com returning)
    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    logger.info('🔎 [Convites/Empresa/Aceitar] Tipo de DB', { dbType, isSqlite });
    // Evitar chamadas a toISOString que podem falhar em bindings alternativos
    logger.info('🗄️ [Convites/Empresa] Tipo de DB e validade', {
      dbType,
      isSqlite,
      validadeMs: validade.getTime()
    });
    let convite: any;
    try {
      if (isSqlite) {
        // Usar better-sqlite3 diretamente para evitar geração de NOW() pelo dialect PG
        const { sqlite } = await import('../db-sqlite');
        const localId = crypto.randomUUID();
        const validadeStr = validade.toISOString();
        const stmt = sqlite.prepare(`
          INSERT INTO convites_empresa (
            id, token, nome_empresa, email_contato, telefone, cnpj,
            numero_colaboradores, dias_acesso, admin_id, validade, status, metadados
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          localId,
          token,
          nomeEmpresa,
          emailContato,
          telefone || null,
          cnpj || null,
          numeroColaboradores || null,
          diasAcesso || null,
          req.user!.userId,
          validadeStr,
          status || 'pendente',
          JSON.stringify({})
        );
        logger.debug('📝 [Convites/Empresa] Inserção realizada (SQLite, raw), buscando registro pelo token');
        const selectStmt = sqlite.prepare('SELECT * FROM convites_empresa WHERE token = ? LIMIT 1');
        const row: any = selectStmt.get(token);
        convite = row ? {
          id: row.id,
          token: row.token,
          nomeEmpresa: row.nome_empresa,
          emailContato: row.email_contato,
          telefone: row.telefone,
          cnpj: row.cnpj,
          numeroColaboradores: row.numero_colaboradores,
          diasAcesso: row.dias_acesso,
          adminId: row.admin_id,
          validade: new Date(row.validade),
          status: row.status,
          metadados: (() => { try { return JSON.parse(row.metadados || '{}'); } catch { return {}; } })(),
          createdAt: row.created_at ? new Date(row.created_at) : undefined,
        } : undefined;
        if (!convite) {
          logger.warn('⚠️ [Convites/Empresa] Registro não encontrado após inserção (SQLite)', { token });
        }
      } else {
        [convite] = await db
          .insert(convitesEmpresa)
          .values({
            token,
            nomeEmpresa,
            emailContato,
            telefone: telefone || null,
            cnpj: cnpj || null,
            numeroColaboradores: numeroColaboradores || null,
            diasAcesso: diasAcesso || null,
            adminId: req.user!.userId,
            validade,
            status: status || 'pendente',
          })
          .returning();
        logger.debug('📝 [Convites/Empresa] Inserção Postgres retornou registro', { hasConvite: !!convite });
      }
    } catch (e: any) {
      logger.error('❌ [Convites/Empresa] Erro durante inserção no banco', {
        code: e?.code,
        name: e?.name,
        message: e?.message,
        stack: typeof e?.stack === 'string' ? e.stack.split('\n').slice(0, 2).join(' | ') : undefined,
      });
      throw e;
    }

    const linkConvite = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/convite/empresa/${token}`;

    // Enviar email de convite e refletir resultado na resposta
    let emailEnviado = false;
    try {
      // Envio de email deve ser tolerante a falhas em dev: não quebrar criação do convite
      const success = await enviarConviteEmpresa(emailContato, nomeEmpresa, linkConvite);
      emailEnviado = !!success;
      if (success) {
        logger.info('✅ Email de convite enviado para:', emailContato);
      } else {
        logger.warn('⚠️ Falha ao enviar email de convite para:', emailContato);
      }
    } catch (error) {
      logger.error('❌ Erro ao enviar email de convite:', error);
      emailEnviado = false;
    }

    // Resposta padronizada e compatível com versões anteriores
    const conviteData = convite || {
      token,
      nomeEmpresa,
      emailContato,
      telefone: telefone || null,
      cnpj: cnpj || null,
      numeroColaboradores: numeroColaboradores || null,
      diasAcesso: diasAcesso || null,
      adminId: req.user!.userId,
      validade: isSqlite ? new Date(validade) : validade,
      status: status || 'pendente',
      metadados: {}
    };

    res.status(201).json({
      success: true,
      message: 'Convite criado com sucesso',
      data: {
        ...conviteData,
        linkConvite,
        emailEnviado,
      },
      // Campos de compatibilidade legada
      convite: conviteData,
      linkConvite,
      emailEnviado,
    });
  } catch (error: any) {
    // Logar no logger e também no console para capturar no terminal
    logger.error('Erro ao criar convite empresa:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: typeof error?.stack === 'string' ? error.stack.split('\n').slice(0, 2).join(' | ') : undefined,
    });
    console.error('❌ [Convites/Empresa] Falha:', error?.message, error?.code, error?.name);
    if (error?.stack) {
      console.error('Stack:', String(error.stack).split('\n').slice(0, 3).join(' | '));
    }
    const isProd = (process.env.NODE_ENV || 'development') === 'production';
    res.status(500).json({
      error: 'Erro interno do servidor',
      ...(isProd ? {} : { details: { message: error?.message, code: error?.code, name: error?.name } })
    });
  }
});

// Empresa cria convite para colaborador
router.post('/colaborador', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    logger.info('📥 [Convites/Colaborador] Requisição recebida', {
      empresaId: req.user?.empresaId,
      bodyKeys: Object.keys(req.body || {})
    });

    const validationResult = insertConviteColaboradorSchema.omit({ token: true, validade: true, empresaId: true }).extend({
      diasValidade: z.coerce.number().min(1).max(30).default(3),
    }).safeParse(req.body);

    if (!validationResult.success) {
      logger.warn('⚠️ [Convites/Colaborador] Dados inválidos', {
        issues: validationResult.error.issues
      });
      return res.status(400).json({ error: 'Dados inválidos', details: validationResult.error.issues });
    }

    const { nome, email, diasValidade, cargo, departamento, status } = validationResult.data as any;
    logger.debug('🔎 [Convites/Colaborador] Dados validados', {
      nome,
      email,
      diasValidade,
      cargo,
      departamento,
      status
    });

    // Verificar existência da empresa antes de inserir (evita erro de FK)
    const [empresaExiste] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.id, req.user!.empresaId!))
      .limit(1);

    if (!empresaExiste) {
      logger.warn('⚠️ [Convites/Colaborador] Empresa não encontrada para empresaId', { empresaId: req.user!.empresaId });
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // Verificação de limite de convites por empresa
    try {
      const limiteConvites = (empresaExiste as any).numeroColaboradores || 0;
      if (limiteConvites > 0) {
        const [countResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(convitesColaborador)
          .where(
            and(
              eq(convitesColaborador.empresaId, req.user!.empresaId!),
              or(
                eq(convitesColaborador.status, 'pendente'),
                eq(convitesColaborador.status, 'aceito')
              )
            )
          );

        const convitesCriados = (countResult as any)?.count || 0;
        const convitesDisponiveis = Math.max(0, limiteConvites - convitesCriados);

        logger.info('📊 [Convites/Colaborador] Limite verificado', {
          limiteConvites,
          convitesCriados,
          convitesDisponiveis
        });

        if (convitesDisponiveis <= 0) {
          return res.status(403).json({
            success: false,
            error: 'Limite de convites atingido',
            message: `Limite de ${limiteConvites} convites atingido. Não é possível criar novos convites.`,
          });
        }
      }
    } catch (limitError) {
      logger.error('❌ [Convites/Colaborador] Erro ao verificar limite de convites', { error: (limitError as any)?.message });
      // Em caso de erro na verificação de limite, seguir com a criação para não bloquear indevidamente
    }
    if (!empresaExiste) {
      logger.warn('⚠️ [Convites/Colaborador] Empresa não encontrada para empresaId', { empresaId: req.user!.empresaId });
      return res.status(404).json({ error: 'Empresa não encontrada', message: 'empresaId inválido no token' });
    }

    const [existingColaborador] = await db.select().from(colaboradores).where(eq(colaboradores.email, email)).limit(1);
    if (existingColaborador) {
      logger.info('ℹ️ [Convites/Colaborador] Email já cadastrado, retornando 409', { email });
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const token = generateInviteToken();
    // Garantir Date válido independentemente do ambiente
    const validade = new Date(Date.now() + ((diasValidade || 3) * 24 * 60 * 60 * 1000));
    logger.debug('🧪 [Convites/Colaborador] Tipo de validade', {
      typeofValidade: typeof validade,
      isDate: validade instanceof Date,
      iso: validade.toISOString(),
    });

    // Inserção compatível com SQLite (sem returning) e Postgres (com returning)
    const isSqliteColab = (dbType || '').toLowerCase().includes('sqlite');
    let convite: any;
    logger.debug('🛠️ [Convites/Colaborador] Inserindo convite', { isSqliteColab });
    try {
      if (isSqliteColab) {
        const localId = crypto.randomUUID();
        await db
          .insert(convitesColaborador)
          .values({
            id: localId,
            token,
            nome,
            email,
            empresaId: req.user!.empresaId!,
            // Usar Date; Drizzle faz o mapeamento correto
            validade,
            status: status || 'pendente',
            cargo: cargo || null,
            departamento: departamento || null,
            // Ignorar metadados (idade/sexo): persistir vazio
            metadados: JSON.stringify({}),
            createdAt: new Date(),
          });
        logger.debug('🧾 [Convites/Colaborador] Inserção concluída (SQLite), buscando registro pelo token');
        [convite] = await db
          .select()
          .from(convitesColaborador)
          .where(eq(convitesColaborador.token, token))
          .limit(1);
      } else {
        logger.debug('🧾 [Convites/Colaborador] Inserindo com returning (PostgreSQL)');
        [convite] = await db
          .insert(convitesColaborador)
          .values({
            token,
            nome,
            email,
            empresaId: req.user!.empresaId!,
            validade,
            status: status || 'pendente',
            cargo: cargo || null,
            departamento: departamento || null,
            // Ignorar metadados (idade/sexo): persistir vazio
            metadados: {},
          })
          .returning();
      }
    } catch (e: any) {
      logger.error('❌ [Convites/Colaborador] Erro durante inserção no banco', {
        code: e?.code,
        name: e?.name,
        message: e?.message,
        stack: typeof e?.stack === 'string' ? e.stack.split('\n').slice(0, 2).join(' | ') : undefined,
      });
      throw e;
    }

    const linkConvite = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/convite/colaborador/${token}`;
    logger.debug('🔗 [Convites/Colaborador] Link de convite gerado', { linkConvite });

    // Buscar nome da empresa para incluir no email
    const [empresa] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.id, req.user!.empresaId!))
      .limit(1);
    logger.debug('🏢 [Convites/Colaborador] Empresa carregada', { empresaId: req.user!.empresaId, temEmpresa: !!empresa });

    // Enviar email de convite (não bloqueia a resposta)
    if (empresa) {
      logger.info('📧 [Convites/Colaborador] Enviando email de convite', { to: email });
      enviarConviteColaborador(email, nome, empresa.nomeEmpresa, linkConvite)
        .then(success => {
          if (success) {
            logger.info('✅ Email de convite enviado para:', email);
          } else {
            logger.warn('⚠️ Falha ao enviar email de convite para:', email);
          }
        })
        .catch(error => {
          logger.error('❌ Erro ao enviar email de convite:', error);
        });
    }

    const conviteResponse = convite ? convite : {
      token,
      nome,
      email,
      cargo: cargo || null,
      departamento: departamento || null,
      empresaId: req.user!.empresaId!,
      validade,
      status: status || 'pendente',
      // Ignorar metadados (idade/sexo): retornar vazio
      metadados: {},
    };

    if (!convite) {
      logger.warn('⚠️ [Convites/Colaborador] Convite não encontrado após inserção; retornando objeto de fallback', { token, email });
    }

    res.status(201).json({
      success: true,
      message: 'Convite criado com sucesso',
      data: {
        ...conviteResponse,
        linkConvite,
        emailEnviado: true,
      }
    });
  } catch (error) {
    logger.error('❌ [Convites/Colaborador] Erro ao criar convite colaborador', {
      errorMessage: (error as any)?.message,
      stack: (error as any)?.stack
    });
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar o convite'
    });
  }
});

// Buscar convite por token (público)
router.get('/token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { tipo } = req.query;

    if (tipo === 'empresa') {
      const [convite] = await db
        .select()
        .from(convitesEmpresa)
        .where(
          and(
            eq(convitesEmpresa.token, token),
            eq(convitesEmpresa.status, 'pendente'),
            gt(convitesEmpresa.validade, new Date())
          )
        )
        .limit(1);

      if (!convite) {
        return res.status(404).json({ error: 'Convite não encontrado ou expirado' });
      }

      return res.json({ convite, tipo: 'empresa' });
    } else if (tipo === 'colaborador') {
      const [row] = await db
        .select()
        .from(convitesColaborador)
        .where(eq(convitesColaborador.token, token))
        .limit(1);

      if (!row) {
        return res.status(404).json({ error: 'Token de convite inexistente' });
      }
      const agora = new Date();
      const validadeData = row.validade instanceof Date ? row.validade : new Date(row.validade as any);
      const expirado = validadeData ? validadeData.getTime() <= agora.getTime() : true;
      if (expirado) {
        return res.status(410).json({ error: 'Convite expirado' });
      }
      if (row.status !== 'pendente') {
        return res.status(409).json({ error: 'Convite já utilizado' });
      }

      return res.json({ convite: row, tipo: 'colaborador' });
    }

    res.status(400).json({ error: 'Tipo de convite inválido' });
  } catch (error) {
    console.error('Erro ao buscar convite:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Aceitar convite de empresa
router.post('/empresa/aceitar/:token', async (req, res) => {
  try {
    const { token } = req.params;
    logger.info('📥 [Convites/Empresa/Aceitar] Requisição recebida', {
      token,
      bodyKeys: Object.keys(req.body || {})
    });

    const validationResult = z.object({
      senha: z.string().min(8),
      logoBase64: z.string().optional().nullable(),
    }).safeParse(req.body);

    if (!validationResult.success) {
      logger.warn('⚠️ [Convites/Empresa/Aceitar] Senha inválida', { issues: validationResult.error.issues });
      return res.status(400).json({ error: 'Senha inválida', details: validationResult.error.issues });
    }

    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    let convite: any;
    if (isSqlite) {
      try {
        const { sqlite } = await import('../db-sqlite');
        logger.debug('🗄️ [Convites/Empresa/Aceitar] Buscando convite via SQLite raw');
        const row: any = sqlite.prepare('SELECT * FROM convites_empresa WHERE token = ? LIMIT 1').get(token);
        if (!row) {
          logger.warn('⚠️ [Convites/Empresa/Aceitar] Token inexistente', { token });
          return res.status(404).json({ error: 'Token de convite inexistente' });
        }
        const agora = new Date();
        const validadeData = row.validade ? new Date(row.validade) : null;
        const expirado = validadeData ? validadeData.getTime() <= agora.getTime() : true;
        if (expirado) {
          logger.warn('⚠️ [Convites/Empresa/Aceitar] Convite expirado', { token, validade: row.validade });
          return res.status(410).json({ error: 'Convite expirado' });
        }
        if (row.status !== 'pendente') {
          logger.warn('⚠️ [Convites/Empresa/Aceitar] Convite já utilizado', { token, status: row.status });
          return res.status(409).json({ error: 'Convite já utilizado' });
        }
        convite = {
          id: row.id,
          token: row.token,
          nomeEmpresa: row.nome_empresa,
          emailContato: row.email_contato,
          telefone: row.telefone,
          cnpj: row.cnpj,
          numeroColaboradores: row.numero_colaboradores,
          diasAcesso: row.dias_acesso,
          adminId: row.admin_id,
          validade: new Date(row.validade),
          status: row.status,
        };
      } catch (e) {
        logger.error('❌ [Convites/Empresa/Aceitar] Falha ao buscar convite (SQLite)', { message: (e as any)?.message });
        throw e;
      }
    } else {
      // Postgres: buscar por token e diferenciar casos
      const [row] = await db
        .select()
        .from(convitesEmpresa)
        .where(eq(convitesEmpresa.token, token))
        .limit(1);

      if (!row) {
        logger.warn('⚠️ [Convites/Empresa/Aceitar] Token inexistente (PG)', { token });
        return res.status(404).json({ error: 'Token de convite inexistente' });
      }

      const agora = new Date();
      const expirado = row.validade ? row.validade.getTime() <= agora.getTime() : true;
      if (expirado) {
        logger.warn('⚠️ [Convites/Empresa/Aceitar] Convite expirado (PG)', { token, validade: row.validade });
        return res.status(410).json({ error: 'Convite expirado' });
      }
      if (row.status !== 'pendente') {
        logger.warn('⚠️ [Convites/Empresa/Aceitar] Convite já utilizado (PG)', { token, status: row.status });
        return res.status(409).json({ error: 'Convite já utilizado' });
      }

      convite = row;
    }

    const hashedPassword = await hashPassword(validationResult.data.senha);

    const dataExpiracao = convite.diasAcesso
      ? (() => {
        const data = new Date();
        data.setDate(data.getDate() + convite.diasAcesso);
        return data;
      })()
      : null;

    const configuracoesObj: any = {};
    if (validationResult.data.logoBase64) {
      configuracoesObj.logo = validationResult.data.logoBase64;
    }

    let novaEmpresa: any;
    if (isSqlite) {
      const { sqlite } = await import('../db-sqlite');
      // Checar duplicidade de email antes de inserir
      const existsRow = sqlite.prepare('SELECT 1 AS ok FROM empresas WHERE email_contato = ? LIMIT 1').get(convite.emailContato);
      if (existsRow && (existsRow as any).ok) {
        logger.warn('⚠️ [Convites/Empresa/Aceitar] Email já cadastrado, abortando', { emailContato: convite.emailContato });
        return res.status(409).json({ error: 'Email já cadastrado' });
      }
      const configStr = JSON.stringify(configuracoesObj || {});
      const dataExpStr = dataExpiracao ? dataExpiracao.toISOString() : null;
      logger.debug('🛠️ [Convites/Empresa/Aceitar] Inserindo empresa via SQLite raw', {
        emailContato: convite.emailContato.trim(),
        dataExp: dataExpStr,
      });
      const insertStmt = sqlite.prepare(`
        INSERT INTO empresas (
          nome_empresa, email_contato, senha, cnpj, numero_colaboradores,
          dias_acesso, data_expiracao, admin_id, configuracoes, ativa
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `);
      insertStmt.run(
        convite.nomeEmpresa,
        convite.emailContato.trim(),
        hashedPassword,
        convite.cnpj || null,
        convite.numeroColaboradores || null,
        convite.diasAcesso || null,
        dataExpStr,
        convite.adminId || null,
        configStr
      );
      const selectStmt = sqlite.prepare('SELECT * FROM empresas WHERE email_contato = ? LIMIT 1');
      const row: any = selectStmt.get(convite.emailContato);
      if (!row) {
        logger.error('❌ [Convites/Empresa/Aceitar] Empresa não encontrada após inserção (SQLite)', { emailContato: convite.emailContato });
        return res.status(500).json({ error: 'Falha ao criar empresa' });
      }
      novaEmpresa = {
        id: row.id,
        nomeEmpresa: row.nome_empresa,
        emailContato: row.email_contato,
        dataExpiracao: row.data_expiracao ? new Date(row.data_expiracao) : null,
      };

      // Atualizar convite para 'aceito'
      sqlite.prepare('UPDATE convites_empresa SET status = ? WHERE id = ?').run('aceito', convite.id);
    } else {
      // Checar duplicidade de email em Postgres
      const [existingEmpresa] = await db
        .select()
        .from(empresas)
        .where(eq(empresas.emailContato, convite.emailContato))
        .limit(1);
      if (existingEmpresa) {
        logger.warn('⚠️ [Convites/Empresa/Aceitar] Email já cadastrado (PG), abortando', { emailContato: convite.emailContato });
        return res.status(409).json({ error: 'Email já cadastrado' });
      }
      [novaEmpresa] = await db
        .insert(empresas)
        .values({
          nomeEmpresa: convite.nomeEmpresa,
          emailContato: convite.emailContato.trim(),
          senha: hashedPassword,
          cnpj: convite.cnpj || null,
          numeroColaboradores: convite.numeroColaboradores || null,
          diasAcesso: convite.diasAcesso || null,
          dataExpiracao: dataExpiracao,
          adminId: convite.adminId,
          configuracoes: configuracoesObj,
          ativa: true,
        })
        .returning();

      await db
        .update(convitesEmpresa)
        .set({ status: 'aceito' })
        .where(eq(convitesEmpresa.id, convite.id));
    }

    logger.info('✅ [Convites/Empresa/Aceitar] Empresa criada', {
      empresaId: novaEmpresa.id,
      emailContato: novaEmpresa.emailContato,
      dataExpiracao: novaEmpresa.dataExpiracao || null,
    });

    res.status(201).json({
      message: 'Empresa cadastrada com sucesso',
      empresa: {
        id: novaEmpresa.id,
        nome: novaEmpresa.nomeEmpresa,
        email: novaEmpresa.emailContato,
        dataExpiracao: novaEmpresa.dataExpiracao,
      },
    });
  } catch (error) {
    logger.error('❌ [Convites/Empresa/Aceitar] Erro ao aceitar convite', { message: (error as any)?.message });
    console.error('Erro ao aceitar convite empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Aceitar convite de colaborador
router.post('/colaborador/aceitar/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const validationResult = z.object({
      senha: z.string().min(8),
    }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ error: 'Senha inválida', details: validationResult.error.issues });
    }

    const [row] = await db
      .select()
      .from(convitesColaborador)
      .where(eq(convitesColaborador.token, token))
      .limit(1);

    if (!row) {
      return res.status(404).json({ error: 'Token de convite inexistente' });
    }
    const agora = new Date();
    const validadeData = row.validade instanceof Date ? row.validade : new Date(row.validade as any);
    const expirado = validadeData ? validadeData.getTime() <= agora.getTime() : true;
    if (expirado) {
      return res.status(410).json({ error: 'Convite expirado' });
    }
    if (row.status !== 'pendente') {
      return res.status(409).json({ error: 'Convite já utilizado' });
    }
    const convite = row;

    const hashedPassword = await hashPassword(validationResult.data.senha);

    // Inserção compatível com SQLite e Postgres
    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    let novoColaborador: any;
    if (isSqlite) {
      logger.debug('🧾 [Convites/Colaborador/Aceitar] Dados para inserção (SQLite)', {
        nome: convite.nome,
        email: convite.email,
        cargo: convite.cargo ?? null,
        departamento: convite.departamento ?? null,
        empresaId: convite.empresaId ?? null,
      });
      const { sqlite } = await import('../db-sqlite');
      const localId = crypto.randomUUID();
      const created = new Date().toISOString();
      const updated = created;
      const stmt = sqlite.prepare(`
        INSERT INTO colaboradores (
          id, nome, email, senha, cargo, departamento, empresa_id,
          permissoes, ativo, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        localId,
        convite.nome,
        convite.email.trim(),
        hashedPassword,
        convite.cargo || null,
        convite.departamento || null,
        convite.empresaId || null,
        JSON.stringify({}),
        1,
        created,
        updated,
      );
      const sel = sqlite.prepare('SELECT * FROM colaboradores WHERE email = ? LIMIT 1');
      const row: any = sel.get(convite.email);
      novoColaborador = row ? { id: row.id, nome: row.nome, email: row.email } : undefined;
    } else {
      [novoColaborador] = await db
        .insert(colaboradores)
        .values({
          nome: convite.nome,
          email: convite.email.trim(),
          senha: hashedPassword,
          cargo: convite.cargo,
          departamento: convite.departamento,
          empresaId: convite.empresaId,
        })
        .returning();
    }

    // Seeding: Criar registros de disponibilidade de cursos (bloqueados por padrão)
    if (convite.empresaId) {
      try {
        const { cursos } = await import('../../src/data/cursosData');
        const { cursoDisponibilidade } = await import('../../shared/schema');

        const cursosDisponibilidadeData = cursos.map(curso => ({
          colaboradorId: novoColaborador.id,
          cursoId: curso.slug,
          empresaId: convite.empresaId!,
          disponivel: false, // Bloqueado por padrão
        }));

        await db
          .insert(cursoDisponibilidade)
          .values(cursosDisponibilidadeData)
          .onConflictDoNothing();

        console.log(`✅ [SEEDING] Criados ${cursosDisponibilidadeData.length} registros de disponibilidade de cursos para colaborador ${novoColaborador.id}`);
      } catch (seedError) {
        console.error('⚠️ [SEEDING] Erro ao criar disponibilidade de cursos:', seedError);
        // Não falhar a criação do colaborador se o seeding falhar
      }
    }

    await db
      .update(convitesColaborador)
      .set({ status: 'aceito' })
      .where(eq(convitesColaborador.id, convite.id));

    res.status(201).json({
      message: 'Colaborador cadastrado com sucesso',
      colaborador: {
        id: novoColaborador.id,
        nome: novoColaborador.nome,
        email: novoColaborador.email,
      },
    });
  } catch (error) {
    console.error('Erro ao aceitar convite colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar convites (admin vê TODOS de empresa, empresa vê seus de colaborador)
router.get('/listar', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role === 'admin') {
      // Admin vê TODOS os convites de empresa, não apenas os que ele criou
      const convitesEmpresas = await db
        .select()
        .from(convitesEmpresa)
        .orderBy(convitesEmpresa.createdAt);

      try {
        console.log(`📤 [API] /convites/listar (admin) → convites_empresa count: ${convitesEmpresas.length}`);
        if (convitesEmpresas.length > 0) {
          const amostra = convitesEmpresas[0] as any;
          console.log('🔎 [API] Convite empresa (amostra) chaves:', Object.keys(amostra));
          console.log('⏰ [API] createdAt:', amostra.createdAt, 'validade:', amostra.validade, 'diasAcesso:', amostra.diasAcesso);
        }
      } catch (logErr) {
        console.warn('⚠️ [API] Falha ao logar convites_empresa:', logErr);
      }

      return res.json({ success: true, convites: convitesEmpresas, tipo: 'empresa' });
    } else if (req.user!.role === 'empresa') {
      const convitesColaboradores = await db
        .select()
        .from(convitesColaborador)
        .where(eq(convitesColaborador.empresaId, req.user!.empresaId!))
        .orderBy(convitesColaborador.createdAt);

      try {
        console.log(`📤 [API] /convites/listar (empresa) → convites_colaborador count: ${convitesColaboradores.length}`);
        if (convitesColaboradores.length > 0) {
          const amostra = convitesColaboradores[0] as any;
          console.log('🔎 [API] Convite colaborador (amostra) chaves:', Object.keys(amostra));
          console.log('⏰ [API] createdAt:', amostra.createdAt, 'validade:', amostra.validade);
        }
      } catch (logErr) {
        console.warn('⚠️ [API] Falha ao logar convites_colaborador:', logErr);
      }

      return res.json({ success: true, convites: convitesColaboradores, tipo: 'colaborador' });
    }

    res.status(403).json({ error: 'Sem permissão' });
  } catch (error) {
    console.error('Erro ao listar convites:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cancelar/Excluir convite de colaborador
router.delete('/colaborador/:token', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const { token } = req.params;

    // Verificar se o convite existe e pertence à empresa
    const [convite] = await db
      .select()
      .from(convitesColaborador)
      .where(
        and(
          eq(convitesColaborador.token, token),
          eq(convitesColaborador.empresaId, req.user!.empresaId!)
        )
      )
      .limit(1);

    if (!convite) {
      return res.status(404).json({ error: 'Convite não encontrado ou você não tem permissão' });
    }

    // Atualizar status para cancelado
    await db
      .update(convitesColaborador)
      .set({ status: 'cancelado' })
      .where(eq(convitesColaborador.id, convite.id));

    res.json({
      success: true,
      message: 'Convite cancelado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar convite colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cancelar/Excluir convite de empresa
router.delete('/empresa/:token', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { token } = req.params;

    // Verificar se o convite existe e pertence ao admin
    const [convite] = await db
      .select()
      .from(convitesEmpresa)
      .where(
        and(
          eq(convitesEmpresa.token, token),
          eq(convitesEmpresa.adminId, req.user!.userId)
        )
      )
      .limit(1);

    if (!convite) {
      return res.status(404).json({ error: 'Convite não encontrado ou você não tem permissão' });
    }

    // Atualizar status para cancelado
    await db
      .update(convitesEmpresa)
      .set({ status: 'cancelado' })
      .where(eq(convitesEmpresa.id, convite.id));

    res.json({
      success: true,
      message: 'Convite cancelado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar convite empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar configuração de limite de colaboradores
router.get('/configuracoes/limite-colaboradores', authenticateToken, async (req: AuthRequest, res) => {
  try {
    let limiteMaximo = 1000;
    let descricao = 'Número máximo de colaboradores por empresa';

    // Configuração de sistema removida temporariamente
    // if (typeof configuracoesSistema !== 'undefined') { ... }

    res.json({ limiteMaximo, descricao });
  } catch (error) {
    console.error('Erro ao buscar configuração de limite:', error);
    res.status(500).json({
      error: 'Erro ao buscar configuração',
      limiteMaximo: 1000
    });
  }
});

// Métricas de convites da empresa
router.get('/metricas-empresa', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const empresaId = req.user!.empresaId!;

    // Buscar empresa para obter o limite total
    const [empresa] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.id, empresaId))
      .limit(1);

    if (!empresa) {
      return res.status(404).json({ success: false, error: 'Empresa não encontrada' });
    }

    const limiteTotal = (empresa as any).numeroColaboradores || 0;

    // Buscar convites de colaborador da empresa
    const convites = await db
      .select()
      .from(convitesColaborador)
      .where(eq(convitesColaborador.empresaId, empresaId));

    const agora = new Date();
    // Contagens robustas: não considerar cancelados como "criados"
    const usados = convites.filter((c: any) => c.status === 'aceito').length;
    const pendentes = convites.filter((c: any) => c.status === 'pendente' && new Date(c.validade) > agora).length;
    const cancelados = convites.filter((c: any) => c.status === 'cancelado').length;
    // "Criados" reflete convites ativos (pendentes + aceitos), ignorando cancelados
    const criados = convites.filter((c: any) => c.status !== 'cancelado').length;
    // Disponíveis calculados sobre convites ativos
    const disponiveis = Math.max(0, (limiteTotal || 0) - criados);

    logger.info('📈 [Convites] Métricas da empresa', {
      empresaId,
      limiteTotal,
      criados,
      usados,
      pendentes,
      cancelados,
      disponiveis,
    });

    return res.json({
      success: true,
      data: {
        limiteTotal,
        criados,
        usados,
        disponiveis,
        pendentes,
        cancelados,
      },
    });
  } catch (error) {
    logger.error('❌ [Convites] Erro ao obter métricas da empresa', { error: (error as any)?.message });
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;
