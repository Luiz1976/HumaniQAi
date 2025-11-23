CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"nome" varchar(255) NOT NULL,
	"senha" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "colaboradores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"senha" varchar(255) NOT NULL,
	"cargo" varchar(255),
	"departamento" varchar(255),
	"avatar" text,
	"empresa_id" uuid,
	"permissoes" jsonb DEFAULT '{}'::jsonb,
	"ativo" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "colaboradores_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "convites_colaborador" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(255) NOT NULL,
	"nome" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"cargo" varchar(255),
	"departamento" varchar(255),
	"empresa_id" uuid,
	"validade" timestamp with time zone NOT NULL,
	"status" varchar(50) DEFAULT 'pendente' NOT NULL,
	"metadados" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "convites_colaborador_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "convites_empresa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(255) NOT NULL,
	"nome_empresa" varchar(255) NOT NULL,
	"email_contato" varchar(255) NOT NULL,
	"telefone" varchar(20),
	"cnpj" varchar(18),
	"numero_colaboradores" integer,
	"dias_acesso" integer,
	"admin_id" uuid,
	"validade" timestamp with time zone NOT NULL,
	"status" varchar(50) DEFAULT 'pendente' NOT NULL,
	"metadados" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "convites_empresa_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "curso_avaliacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"colaborador_id" uuid NOT NULL,
	"curso_id" varchar(100) NOT NULL,
	"curso_slug" varchar(255) NOT NULL,
	"respostas" jsonb NOT NULL,
	"pontuacao" integer NOT NULL,
	"total_questoes" integer NOT NULL,
	"aprovado" boolean NOT NULL,
	"tempo_gasto" integer,
	"data_realizacao" timestamp with time zone DEFAULT now() NOT NULL,
	"metadados" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curso_certificados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"colaborador_id" uuid NOT NULL,
	"curso_id" varchar(100) NOT NULL,
	"curso_slug" varchar(255) NOT NULL,
	"curso_titulo" varchar(500) NOT NULL,
	"colaborador_nome" varchar(255) NOT NULL,
	"carga_horaria" varchar(50) NOT NULL,
	"data_emissao" timestamp with time zone DEFAULT now() NOT NULL,
	"codigo_autenticacao" varchar(100) NOT NULL,
	"qr_code_url" text,
	"assinatura_digital" text,
	"validado" boolean DEFAULT true NOT NULL,
	"metadados" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "curso_certificados_codigo_autenticacao_unique" UNIQUE("codigo_autenticacao")
);
--> statement-breakpoint
CREATE TABLE "curso_disponibilidade" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"colaborador_id" uuid NOT NULL,
	"curso_id" varchar(100) NOT NULL,
	"empresa_id" uuid NOT NULL,
	"disponivel" boolean DEFAULT false NOT NULL,
	"periodicidade_dias" integer,
	"ultima_liberacao" timestamp with time zone,
	"proxima_disponibilidade" timestamp with time zone,
	"liberado_por" uuid,
	"historico_liberacoes" jsonb DEFAULT '[]'::jsonb,
	"metadados" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curso_progresso" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"colaborador_id" uuid NOT NULL,
	"curso_id" varchar(100) NOT NULL,
	"curso_slug" varchar(255) NOT NULL,
	"modulos_completados" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_modulos" integer NOT NULL,
	"progresso_porcentagem" integer DEFAULT 0 NOT NULL,
	"avaliacao_final_realizada" boolean DEFAULT false NOT NULL,
	"avaliacao_final_pontuacao" integer,
	"tentativas_avaliacao" integer DEFAULT 0 NOT NULL,
	"data_inicio" timestamp with time zone DEFAULT now() NOT NULL,
	"data_ultima_atualizacao" timestamp with time zone DEFAULT now() NOT NULL,
	"data_conclusao" timestamp with time zone,
	"metadados" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empresas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome_empresa" varchar(255) NOT NULL,
	"email_contato" varchar(255) NOT NULL,
	"senha" varchar(255) NOT NULL,
	"cnpj" varchar(18),
	"endereco" text,
	"setor" varchar(255),
	"numero_colaboradores" integer,
	"dias_acesso" integer,
	"data_expiracao" timestamp with time zone,
	"admin_id" uuid,
	"configuracoes" jsonb DEFAULT '{}'::jsonb,
	"ativa" boolean DEFAULT true,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"stripe_price_id" varchar(255),
	"plano" varchar(50),
	"status_assinatura" varchar(50) DEFAULT 'inativo',
	"token_convite" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "empresas_email_contato_unique" UNIQUE("email_contato")
);
--> statement-breakpoint
CREATE TABLE "erp_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"erp_type" varchar(100) NOT NULL,
	"api_url" text NOT NULL,
	"api_key" text NOT NULL,
	"api_secret" text,
	"configuracoes" jsonb DEFAULT '{}'::jsonb,
	"ativo" boolean DEFAULT true,
	"ultima_sincronizacao" timestamp with time zone,
	"status_conexao" varchar(50) DEFAULT 'nao_testado',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "perguntas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teste_id" uuid NOT NULL,
	"texto" text NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"opcoes" jsonb,
	"escala_min" integer,
	"escala_max" integer,
	"obrigatoria" boolean DEFAULT true,
	"ordem" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "respostas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resultado_id" uuid NOT NULL,
	"pergunta_id" uuid NOT NULL,
	"valor" text NOT NULL,
	"pontuacao" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resultados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teste_id" uuid,
	"usuario_id" uuid,
	"pontuacao_total" real,
	"tempo_gasto" integer,
	"data_realizacao" timestamp with time zone DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'concluido' NOT NULL,
	"metadados" jsonb,
	"session_id" varchar(255),
	"user_agent" text,
	"ip_address" "inet",
	"colaborador_id" uuid,
	"empresa_id" uuid,
	"user_email" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "teste_disponibilidade" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"colaborador_id" uuid NOT NULL,
	"teste_id" uuid NOT NULL,
	"empresa_id" uuid NOT NULL,
	"disponivel" boolean DEFAULT true NOT NULL,
	"periodicidade_dias" integer,
	"ultima_liberacao" timestamp with time zone,
	"proxima_disponibilidade" timestamp with time zone,
	"historico_liberacoes" jsonb DEFAULT '[]'::jsonb,
	"metadados" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(255) NOT NULL,
	"descricao" text,
	"categoria" varchar(100),
	"tempo_estimado" integer,
	"instrucoes" text,
	"ativo" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "colaboradores" ADD CONSTRAINT "colaboradores_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convites_colaborador" ADD CONSTRAINT "convites_colaborador_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convites_empresa" ADD CONSTRAINT "convites_empresa_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curso_avaliacoes" ADD CONSTRAINT "curso_avaliacoes_colaborador_id_colaboradores_id_fk" FOREIGN KEY ("colaborador_id") REFERENCES "public"."colaboradores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curso_certificados" ADD CONSTRAINT "curso_certificados_colaborador_id_colaboradores_id_fk" FOREIGN KEY ("colaborador_id") REFERENCES "public"."colaboradores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curso_disponibilidade" ADD CONSTRAINT "curso_disponibilidade_colaborador_id_colaboradores_id_fk" FOREIGN KEY ("colaborador_id") REFERENCES "public"."colaboradores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curso_disponibilidade" ADD CONSTRAINT "curso_disponibilidade_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curso_progresso" ADD CONSTRAINT "curso_progresso_colaborador_id_colaboradores_id_fk" FOREIGN KEY ("colaborador_id") REFERENCES "public"."colaboradores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empresas" ADD CONSTRAINT "empresas_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_configurations" ADD CONSTRAINT "erp_configurations_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perguntas" ADD CONSTRAINT "perguntas_teste_id_testes_id_fk" FOREIGN KEY ("teste_id") REFERENCES "public"."testes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_resultado_id_resultados_id_fk" FOREIGN KEY ("resultado_id") REFERENCES "public"."resultados"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_pergunta_id_perguntas_id_fk" FOREIGN KEY ("pergunta_id") REFERENCES "public"."perguntas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resultados" ADD CONSTRAINT "resultados_teste_id_testes_id_fk" FOREIGN KEY ("teste_id") REFERENCES "public"."testes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resultados" ADD CONSTRAINT "resultados_colaborador_id_colaboradores_id_fk" FOREIGN KEY ("colaborador_id") REFERENCES "public"."colaboradores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resultados" ADD CONSTRAINT "resultados_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teste_disponibilidade" ADD CONSTRAINT "teste_disponibilidade_colaborador_id_colaboradores_id_fk" FOREIGN KEY ("colaborador_id") REFERENCES "public"."colaboradores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teste_disponibilidade" ADD CONSTRAINT "teste_disponibilidade_teste_id_testes_id_fk" FOREIGN KEY ("teste_id") REFERENCES "public"."testes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teste_disponibilidade" ADD CONSTRAINT "teste_disponibilidade_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admins_email" ON "admins" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_colaboradores_empresa_id" ON "colaboradores" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_colaboradores_email" ON "colaboradores" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_colaboradores_ativo" ON "colaboradores" USING btree ("ativo");--> statement-breakpoint
CREATE INDEX "idx_convites_colaborador_token" ON "convites_colaborador" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_convites_colaborador_empresa_id" ON "convites_colaborador" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_convites_colaborador_status" ON "convites_colaborador" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_convites_empresa_token" ON "convites_empresa" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_convites_empresa_status" ON "convites_empresa" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_convites_empresa_validade" ON "convites_empresa" USING btree ("validade");--> statement-breakpoint
CREATE INDEX "idx_curso_avaliacoes_colaborador_id" ON "curso_avaliacoes" USING btree ("colaborador_id");--> statement-breakpoint
CREATE INDEX "idx_curso_avaliacoes_curso_id" ON "curso_avaliacoes" USING btree ("curso_id");--> statement-breakpoint
CREATE INDEX "idx_curso_avaliacoes_aprovado" ON "curso_avaliacoes" USING btree ("aprovado");--> statement-breakpoint
CREATE INDEX "idx_curso_certificados_colaborador_id" ON "curso_certificados" USING btree ("colaborador_id");--> statement-breakpoint
CREATE INDEX "idx_curso_certificados_curso_id" ON "curso_certificados" USING btree ("curso_id");--> statement-breakpoint
CREATE INDEX "idx_curso_certificados_codigo" ON "curso_certificados" USING btree ("codigo_autenticacao");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_curso_certificados_colab_curso_unique" ON "curso_certificados" USING btree ("colaborador_id","curso_id");--> statement-breakpoint
CREATE INDEX "idx_curso_disp_colaborador_id" ON "curso_disponibilidade" USING btree ("colaborador_id");--> statement-breakpoint
CREATE INDEX "idx_curso_disp_curso_id" ON "curso_disponibilidade" USING btree ("curso_id");--> statement-breakpoint
CREATE INDEX "idx_curso_disp_empresa_id" ON "curso_disponibilidade" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_curso_disp_disponivel" ON "curso_disponibilidade" USING btree ("disponivel");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_curso_disp_colab_curso_unique" ON "curso_disponibilidade" USING btree ("colaborador_id","curso_id");--> statement-breakpoint
CREATE INDEX "idx_curso_progresso_colaborador_id" ON "curso_progresso" USING btree ("colaborador_id");--> statement-breakpoint
CREATE INDEX "idx_curso_progresso_curso_id" ON "curso_progresso" USING btree ("curso_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_curso_progresso_colab_curso_unique" ON "curso_progresso" USING btree ("colaborador_id","curso_id");--> statement-breakpoint
CREATE INDEX "idx_empresas_admin_id" ON "empresas" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_empresas_email" ON "empresas" USING btree ("email_contato");--> statement-breakpoint
CREATE INDEX "idx_empresas_ativa" ON "empresas" USING btree ("ativa");--> statement-breakpoint
CREATE INDEX "idx_empresas_stripe_customer" ON "empresas" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "idx_empresas_data_expiracao" ON "empresas" USING btree ("data_expiracao");--> statement-breakpoint
CREATE INDEX "idx_erp_configurations_empresa_id" ON "erp_configurations" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_erp_configurations_erp_type" ON "erp_configurations" USING btree ("erp_type");--> statement-breakpoint
CREATE INDEX "idx_perguntas_teste_id" ON "perguntas" USING btree ("teste_id");--> statement-breakpoint
CREATE INDEX "idx_respostas_resultado_id" ON "respostas" USING btree ("resultado_id");--> statement-breakpoint
CREATE INDEX "idx_respostas_pergunta_id" ON "respostas" USING btree ("pergunta_id");--> statement-breakpoint
CREATE INDEX "idx_resultados_teste_id" ON "resultados" USING btree ("teste_id");--> statement-breakpoint
CREATE INDEX "idx_resultados_usuario_data" ON "resultados" USING btree ("usuario_id","data_realizacao");--> statement-breakpoint
CREATE INDEX "idx_resultados_status" ON "resultados" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_teste_disp_colaborador_id" ON "teste_disponibilidade" USING btree ("colaborador_id");--> statement-breakpoint
CREATE INDEX "idx_teste_disp_teste_id" ON "teste_disponibilidade" USING btree ("teste_id");--> statement-breakpoint
CREATE INDEX "idx_teste_disp_empresa_id" ON "teste_disponibilidade" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_teste_disp_disponivel" ON "teste_disponibilidade" USING btree ("disponivel");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_teste_disp_colab_teste_unique" ON "teste_disponibilidade" USING btree ("colaborador_id","teste_id");--> statement-breakpoint
CREATE INDEX "idx_testes_nome" ON "testes" USING btree ("nome");--> statement-breakpoint
CREATE INDEX "idx_testes_categoria" ON "testes" USING btree ("categoria");