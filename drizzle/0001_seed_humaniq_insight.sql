
-- Seed HumaniQ Insight test
INSERT INTO "testes" ("id", "nome", "descricao", "categoria", "tempo_estimado", "ativo", "instrucoes", "created_at", "updated_at")
VALUES (
  'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
  'HumaniQ Insight',
  'Avalia a percepção dos colaboradores sobre aspectos psicossociais do ambiente de trabalho que influenciam diretamente o bem-estar, a motivação e o engajamento, com foco especial em segurança psicológica, pertencimento e justiça.',
  'humaniq-insight',
  20,
  true,
  '["Leia cada afirmação com atenção","Responda com base na sua percepção atual do ambiente de trabalho","Use a escala de 1 (Discordo totalmente) a 5 (Concordo totalmente)","Seja honesto e objetivo em suas respostas","Não há respostas certas ou erradas"]',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;
