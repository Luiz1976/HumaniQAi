-- Índices de performance para escalar consultas com centenas de usuários
-- Observação: usar IF NOT EXISTS para execuções idempotentes

-- Resultados: filtro por empresa + data (dashboards e relatórios)
CREATE INDEX IF NOT EXISTS idx_resultados_empresa_data ON resultados (empresa_id, data_realizacao);

-- Resultados: filtro por colaborador + data (histórico individual)
CREATE INDEX IF NOT EXISTS idx_resultados_colaborador_data ON resultados (colaborador_id, data_realizacao);

-- Colaboradores: consultas por empresa + email (buscas e validações)
CREATE INDEX IF NOT EXISTS idx_colaboradores_empresa_email ON colaboradores (empresa_id, email);

-- Curso Progresso: ordenação por última atualização
CREATE INDEX IF NOT EXISTS idx_curso_progresso_updated_at ON curso_progresso (data_ultima_atualizacao DESC);

-- Curso Certificados: consultas por colaborador
CREATE INDEX IF NOT EXISTS idx_curso_certificados_colaborador ON curso_certificados (colaborador_id);

-- Curso Disponibilidade: filtro por empresa + curso
CREATE INDEX IF NOT EXISTS idx_curso_disp_empresa_curso ON curso_disponibilidade (empresa_id, curso_id);

-- Teste Disponibilidade: filtro por empresa + colaborador
CREATE INDEX IF NOT EXISTS idx_teste_disp_empresa_colaborador ON teste_disponibilidade (empresa_id, colaborador_id);

-- Convites Empresa: acesso por admin
CREATE INDEX IF NOT EXISTS idx_convites_empresa_admin_id ON convites_empresa (admin_id);

-- Empresas: acesso via token de convite
CREATE INDEX IF NOT EXISTS idx_empresas_token_convite ON empresas (token_convite);