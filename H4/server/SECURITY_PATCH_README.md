Este arquivo documenta as correções críticas planejadas e aplicadas:

1. Padronização PostgreSQL: remover fallback SQLite e exigir `DATABASE_URL` válida.
2. Padronização de UUIDs: usar `gen_random_uuid()` nos schemas e não gerar IDs manualmente.
3. Segurança de imports: substituir `require` dinâmico por imports estáticos.
4. Logging profissional: substituir `console.log` por `server/utils/logger` com níveis e rotação.
5. Backup automático: script `scripts/backup-postgres.ts` e comando `npm run backup:postgres`.

Próximos passos:
- Atualizar `server/index.ts` para usar o logger unificado e remover migrações SQLite.
- Refatorar `server/routes/auth.ts` e `server/routes/testes.ts` para eliminar `console` e `require` dinâmico.
- Validar CORS, rate limiting e headers de segurança (Helmet) nos ambientes de dev, test e prod.