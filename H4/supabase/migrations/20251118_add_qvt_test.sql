-- Migration para adicionar o teste HumaniQ QVT - Qualidade de Vida no Trabalho
INSERT INTO testes (id, nome, descricao, categoria, tempo_estimado, ativo) VALUES
('7b3c8d4e-9f0a-1b2c-3d4e-5f6a7b8c9d0e', 'HumaniQ QVT - Qualidade de Vida no Trabalho', 'Avaliação da satisfação dos colaboradores em cinco dimensões-chave da vida profissional, alinhada com ISO 45001 e conceitos ESG.', 'Bem-estar e Engajamento', 15, true)
ON CONFLICT (id) DO NOTHING;

-- Adicionar algumas perguntas de exemplo para o teste QVT
INSERT INTO perguntas (teste_id, texto, tipo, opcoes, ordem) VALUES
('7b3c8d4e-9f0a-1b2c-3d4e-5f6a7b8c9d0e', 'Estou satisfeito com as condições físicas do meu ambiente de trabalho (iluminação, temperatura, ruído, ergonomia).', 'escala_likert', '["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"]', 1),
('7b3c8d4e-9f0a-1b2c-3d4e-5f6a7b8c9d0e', 'Sinto que posso conciliar adequadamente minha vida pessoal e profissional.', 'escala_likert', '["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"]', 2),
('7b3c8d4e-9f0a-1b2c-3d4e-5f6a7b8c9d0e', 'Recebo reconhecimento adequado pelo trabalho que realizo.', 'escala_likert', '["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"]', 3)
ON CONFLICT DO NOTHING;