CREATE TYPE "public"."commission_status" AS ENUM('previsto', 'aprovado', 'pago');--> statement-breakpoint
CREATE TYPE "public"."counterproof_status" AS ENUM('em_andamento', 'concluida', 'falha', 'revisao');--> statement-breakpoint
CREATE TYPE "public"."crm_interaction_type" AS ENUM('email', 'telefone', 'reuniao', 'proposta', 'acompanhamento', 'outro');--> statement-breakpoint
CREATE TYPE "public"."event_participant_status" AS ENUM('convidado', 'confirmado', 'rejeitado', 'nao_respondeu');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('planejado', 'confirmado', 'em_andamento', 'concluido', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('reuniao', 'treinamento', 'apresentacao', 'workshop', 'outro');--> statement-breakpoint
CREATE TYPE "public"."financial_status" AS ENUM('previsto', 'confirmado', 'pago');--> statement-breakpoint
CREATE TYPE "public"."financial_type" AS ENUM('receita', 'despesa', 'comissao', 'reembolso', 'aporte');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('entrada', 'triagem', 'aguardando_briefing', 'orcamento_elaboracao', 'proposta_enviada', 'negociacao', 'aprovado', 'recusado', 'virou_projeto', 'arquivado');--> statement-breakpoint
CREATE TYPE "public"."phase" AS ENUM('entrada_lead', 'diagnostico', 'proposta', 'kickoff', 'conceito', 'producao', 'qa', 'pos_projeto');--> statement-breakpoint
CREATE TYPE "public"."pnd_status" AS ENUM('ideia', 'registro_interno', 'pesquisa_referencia', 'hipotese_tecnica', 'conceito', 'prototipo', 'teste', 'contraprova', 'documentacao', 'analise_patente');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('baixa', 'media', 'alta', 'critica');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('backlog', 'em_andamento', 'concluido', 'pausado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."project_task_status" AS ENUM('nao_iniciada', 'em_andamento', 'bloqueada', 'concluida', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."resource_assignment_status" AS ENUM('planejado', 'confirmado', 'em_uso', 'concluido', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."resource_request_status" AS ENUM('solicitado', 'aprovado', 'em_uso', 'concluido', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."resource_status" AS ENUM('disponivel', 'em_uso', 'manutencao', 'descartado');--> statement-breakpoint
CREATE TYPE "public"."rocket_message_type" AS ENUM('instrucao', 'status', 'resposta', 'comentario');--> statement-breakpoint
CREATE TYPE "public"."rocket_mission_status" AS ENUM('planejamento', 'desenvolvimento', 'teste', 'validacao', 'concluido');--> statement-breakpoint
CREATE TYPE "public"."rocket_task_status" AS ENUM('pendente', 'em_progresso', 'concluida', 'bloqueada');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."teamType" AS ENUM('innovare_team', 'rocket_team');--> statement-breakpoint
CREATE TYPE "public"."training_progress_status" AS ENUM('nao_iniciado', 'em_andamento', 'concluido');--> statement-breakpoint
CREATE TYPE "public"."training_status" AS ENUM('planejado', 'em_andamento', 'concluido');--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer NOT NULL,
	"userId" integer NOT NULL,
	"projectId" integer,
	"value" numeric(12, 2) NOT NULL,
	"percentage" numeric(5, 2),
	"status" "commission_status" DEFAULT 'previsto',
	"paymentDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"skill" varchar(255) NOT NULL,
	"level" integer DEFAULT 0,
	"evaluationDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer NOT NULL,
	"type" "crm_interaction_type" DEFAULT 'email',
	"description" text,
	"interactionDate" timestamp NOT NULL,
	"userId" integer NOT NULL,
	"nextFollowUp" timestamp,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(100),
	"origin" varchar(100),
	"contact" varchar(255),
	"company" varchar(255),
	"description" text,
	"status" "lead_status" DEFAULT 'entrada',
	"estimatedValue" numeric(12, 2),
	"commissionApplicable" boolean DEFAULT true,
	"commissionPercentage" numeric(5, 2),
	"responsibleId" integer,
	"personInCharge" varchar(255),
	"nextAction" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventId" integer NOT NULL,
	"userId" integer NOT NULL,
	"status" "event_participant_status" DEFAULT 'convidado',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" "event_type" DEFAULT 'reuniao',
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"location" varchar(255),
	"organizerId" integer NOT NULL,
	"status" "event_status" DEFAULT 'planejado',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financials" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "financial_type" NOT NULL,
	"description" varchar(255) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"category" varchar(100),
	"date" timestamp NOT NULL,
	"status" "financial_status" DEFAULT 'previsto',
	"projectId" integer,
	"userId" integer,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"name" text,
	"teamType" "teamType" DEFAULT 'innovare_team' NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"area" varchar(100),
	"department" varchar(100),
	"jobTitle" varchar(100),
	"responsibilities" text,
	"isActive" integer DEFAULT 1,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "local_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "pnd" (
	"id" serial PRIMARY KEY NOT NULL,
	"provisionalName" varchar(255) NOT NULL,
	"internalCode" varchar(100),
	"area" varchar(100),
	"problemStatement" text,
	"proposedSolution" text,
	"technicalDifferential" text,
	"status" "pnd_status" DEFAULT 'ideia',
	"patentPotential" varchar(100),
	"editorialPotential" varchar(100),
	"secretLevel" varchar(100),
	"piStatus" varchar(100),
	"nextStep" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"assignedToId" integer,
	"priority" "priority" DEFAULT 'media',
	"status" "project_task_status" DEFAULT 'nao_iniciada',
	"dueDate" timestamp,
	"completedDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"client" varchar(255) NOT NULL,
	"description" text,
	"phase" "phase" NOT NULL,
	"status" "project_status" DEFAULT 'backlog',
	"priority" "priority" DEFAULT 'media',
	"responsibleId" integer,
	"value" numeric(12, 2),
	"estimatedCost" numeric(12, 2),
	"internalDeadline" timestamp,
	"externalDeadline" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"resourceId" integer NOT NULL,
	"userId" integer NOT NULL,
	"projectId" integer,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"purpose" text,
	"status" "resource_assignment_status" DEFAULT 'planejado',
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"resourceId" integer NOT NULL,
	"userId" integer NOT NULL,
	"projectId" integer,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp,
	"purpose" text,
	"status" "resource_request_status" DEFAULT 'solicitado',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"location" varchar(255),
	"responsibleId" integer,
	"status" "resource_status" DEFAULT 'disponivel',
	"availability" varchar(100),
	"riskLevel" varchar(100),
	"linkedProject" integer,
	"lastUsage" timestamp,
	"maintenanceNeeded" boolean DEFAULT false,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rocket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"subsystemId" integer NOT NULL,
	"userId" integer NOT NULL,
	"content" text NOT NULL,
	"messageType" "rocket_message_type" DEFAULT 'comentario',
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rocket_missions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"objective" text,
	"payload" varchar(255),
	"subsystem" varchar(255),
	"responsibleId" integer,
	"requirement" text,
	"proposedSolution" text,
	"status" "rocket_mission_status" DEFAULT 'planejamento',
	"relatedDocument" varchar(255),
	"relatedTest" varchar(255),
	"risk" varchar(100),
	"nextValidation" timestamp,
	"dueDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rocket_subsystems" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"leadId" integer,
	"progress" integer DEFAULT 0,
	"status" "rocket_mission_status" DEFAULT 'planejamento',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rocket_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"subsystemId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"createdById" integer NOT NULL,
	"assignedToId" integer,
	"priority" "priority" DEFAULT 'media',
	"status" "rocket_task_status" DEFAULT 'pendente',
	"dueDate" timestamp,
	"completedDate" timestamp,
	"completedById" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technical_counterproofs" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer,
	"subsystem" varchar(255),
	"hypothesis" text,
	"calculation" text,
	"simulation" text,
	"prototype" text,
	"test" text,
	"result" text,
	"failure" text,
	"correction" text,
	"evidence" text,
	"conclusion" text,
	"status" "counterproof_status" DEFAULT 'em_andamento',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"trainingId" integer NOT NULL,
	"userId" integer NOT NULL,
	"status" "training_progress_status" DEFAULT 'nao_iniciado',
	"completionDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"instructor" varchar(255),
	"area" varchar(100),
	"status" "training_status" DEFAULT 'planejado',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"teamType" "teamType" DEFAULT 'innovare_team' NOT NULL,
	"department" varchar(100),
	"jobTitle" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
