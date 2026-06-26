import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  teamType: mysqlEnum("teamType", ["innovare_team", "rocket_team"]).default("innovare_team").notNull(),
  department: varchar("department", { length: 100 }),
  jobTitle: varchar("jobTitle", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Usuários com autenticação local (email/senha)
export const localUsers = mysqlTable("local_users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name"),
  teamType: mysqlEnum("teamType", ["innovare_team", "rocket_team"]).default("innovare_team").notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  area: varchar("area", { length: 100 }), // Aviónica, Estrutura, Motor, etc.
  department: varchar("department", { length: 100 }), // Departamento/Setor
  jobTitle: varchar("jobTitle", { length: 100 }), // Cargo/Função no CNPJ
  responsibilities: text("responsibilities"), // Responsabilidades
  isActive: int("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

// Projetos (8 fases: Entrada Lead, Diagnóstico, Proposta, Kickoff, Conceito, Produção, QA, Pós-projeto)
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  client: varchar("client", { length: 255 }).notNull(),
  description: text("description"),
  phase: mysqlEnum("phase", [
    "entrada_lead",
    "diagnostico",
    "proposta",
    "kickoff",
    "conceito",
    "producao",
    "qa",
    "pos_projeto"
  ]).notNull(),
  status: mysqlEnum("status", ["backlog", "em_andamento", "concluido", "pausado", "cancelado"]).default("backlog"),
  priority: mysqlEnum("priority", ["baixa", "media", "alta", "critica"]).default("media"),
  responsibleId: int("responsibleId"),
  value: decimal("value", { precision: 12, scale: 2 }),
  estimatedCost: decimal("estimatedCost", { precision: 12, scale: 2 }),
  internalDeadline: timestamp("internalDeadline"),
  externalDeadline: timestamp("externalDeadline"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// CRM - Leads
export const crmLeads = mysqlTable("crm_leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }),
  origin: varchar("origin", { length: 100 }),
  contact: varchar("contact", { length: 255 }),
  company: varchar("company", { length: 255 }),
  description: text("description"),
  status: mysqlEnum("status", [
    "entrada",
    "triagem",
    "aguardando_briefing",
    "orcamento_elaboracao",
    "proposta_enviada",
    "negociacao",
    "aprovado",
    "recusado",
    "virou_projeto",
    "arquivado"
  ]).default("entrada"),
  estimatedValue: decimal("estimatedValue", { precision: 12, scale: 2 }),
  commissionApplicable: boolean("commissionApplicable").default(true),
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }),
  responsibleId: int("responsibleId"),
  personInCharge: varchar("personInCharge", { length: 255 }),
  nextAction: varchar("nextAction", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmLead = typeof crmLeads.$inferSelect;
export type InsertCrmLead = typeof crmLeads.$inferInsert;

// CRM - Comissões
export const commissions = mysqlTable("commissions", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  status: mysqlEnum("status", ["previsto", "aprovado", "pago"]).default("previsto"),
  paymentDate: timestamp("paymentDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

// Pessoas - Competências
export const competencies = mysqlTable("competencies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  skill: varchar("skill", { length: 255 }).notNull(),
  level: int("level").default(0), // 0-5
  evaluationDate: timestamp("evaluationDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Competency = typeof competencies.$inferSelect;
export type InsertCompetency = typeof competencies.$inferInsert;

// Financeiro - Receitas e Despesas
export const financials = mysqlTable("financials", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["receita", "despesa", "comissao", "reembolso", "aporte"]).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  date: timestamp("date").notNull(),
  status: mysqlEnum("status", ["previsto", "confirmado", "pago"]).default("previsto"),
  projectId: int("projectId"),
  userId: int("userId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Financial = typeof financials.$inferSelect;
export type InsertFinancial = typeof financials.$inferInsert;

// P&D - Patentes e Propriedade Intelectual
export const pnd = mysqlTable("pnd", {
  id: int("id").autoincrement().primaryKey(),
  provisionalName: varchar("provisionalName", { length: 255 }).notNull(),
  internalCode: varchar("internalCode", { length: 100 }),
  area: varchar("area", { length: 100 }),
  problemStatement: text("problemStatement"),
  proposedSolution: text("proposedSolution"),
  technicalDifferential: text("technicalDifferential"),
  status: mysqlEnum("status", [
    "ideia",
    "registro_interno",
    "pesquisa_referencia",
    "hipotese_tecnica",
    "conceito",
    "prototipo",
    "teste",
    "contraprova",
    "documentacao",
    "analise_patente"
  ]).default("ideia"),
  patentPotential: varchar("patentPotential", { length: 100 }),
  editorialPotential: varchar("editorialPotential", { length: 100 }),
  secretLevel: varchar("secretLevel", { length: 100 }),
  piStatus: varchar("piStatus", { length: 100 }),
  nextStep: varchar("nextStep", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Pnd = typeof pnd.$inferSelect;
export type InsertPnd = typeof pnd.$inferInsert;

// Contraprovas Técnicas
export const technicalCounterproofs = mysqlTable("technical_counterproofs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId"),
  subsystem: varchar("subsystem", { length: 255 }),
  hypothesis: text("hypothesis"),
  calculation: text("calculation"),
  simulation: text("simulation"),
  prototype: text("prototype"),
  test: text("test"),
  result: text("result"),
  failure: text("failure"),
  correction: text("correction"),
  evidence: text("evidence"),
  conclusion: text("conclusion"),
  status: mysqlEnum("status", ["em_andamento", "concluida", "falha", "revisao"]).default("em_andamento"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TechnicalCounterproof = typeof technicalCounterproofs.$inferSelect;
export type InsertTechnicalCounterproof = typeof technicalCounterproofs.$inferInsert;

// Innovare Rocket - Missões
export const rocketMissions = mysqlTable("rocket_missions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  objective: text("objective"),
  payload: varchar("payload", { length: 255 }),
  subsystem: varchar("subsystem", { length: 255 }),
  responsibleId: int("responsibleId"),
  requirement: text("requirement"),
  proposedSolution: text("proposedSolution"),
  status: mysqlEnum("status", ["planejamento", "desenvolvimento", "teste", "validacao", "concluido"]).default("planejamento"),
  relatedDocument: varchar("relatedDocument", { length: 255 }),
  relatedTest: varchar("relatedTest", { length: 255 }),
  risk: varchar("risk", { length: 100 }),
  nextValidation: timestamp("nextValidation"),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RocketMission = typeof rocketMissions.$inferSelect;
export type InsertRocketMission = typeof rocketMissions.$inferInsert;

// Treinamentos
export const trainings = mysqlTable("trainings", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructor: varchar("instructor", { length: 255 }),
  area: varchar("area", { length: 100 }),
  status: mysqlEnum("status", ["planejado", "em_andamento", "concluido"]).default("planejado"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Training = typeof trainings.$inferSelect;
export type InsertTraining = typeof trainings.$inferInsert;

// Treinamentos - Progresso
export const trainingProgress = mysqlTable("training_progress", {
  id: int("id").autoincrement().primaryKey(),
  trainingId: int("trainingId").notNull(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["nao_iniciado", "em_andamento", "concluido"]).default("nao_iniciado"),
  completionDate: timestamp("completionDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrainingProgress = typeof trainingProgress.$inferSelect;
export type InsertTrainingProgress = typeof trainingProgress.$inferInsert;

// Recursos e Infraestrutura
export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  location: varchar("location", { length: 255 }),
  responsibleId: int("responsibleId"),
  status: mysqlEnum("status", ["disponivel", "em_uso", "manutencao", "descartado"]).default("disponivel"),
  availability: varchar("availability", { length: 100 }),
  riskLevel: varchar("riskLevel", { length: 100 }),
  linkedProject: int("linkedProject"),
  lastUsage: timestamp("lastUsage"),
  maintenanceNeeded: boolean("maintenanceNeeded").default(false),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

// Solicitações de Recursos
export const resourceRequests = mysqlTable("resource_requests", {
  id: int("id").autoincrement().primaryKey(),
  resourceId: int("resourceId").notNull(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  purpose: text("purpose"),
  status: mysqlEnum("status", ["solicitado", "aprovado", "em_uso", "concluido", "cancelado"]).default("solicitado"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResourceRequest = typeof resourceRequests.$inferSelect;
export type InsertResourceRequest = typeof resourceRequests.$inferInsert;

// Eventos e Reuniões
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["reuniao", "treinamento", "apresentacao", "workshop", "outro"]).default("reuniao"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  location: varchar("location", { length: 255 }),
  organizerId: int("organizerId").notNull(),
  status: mysqlEnum("status", ["planejado", "confirmado", "em_andamento", "concluido", "cancelado"]).default("planejado"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// Participantes de Eventos
export const eventParticipants = mysqlTable("event_participants", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["convidado", "confirmado", "rejeitado", "nao_respondeu"]).default("convidado"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertEventParticipant = typeof eventParticipants.$inferInsert;

// Atribuição de Recursos (agendamentos)
export const resourceAssignments = mysqlTable("resource_assignments", {
  id: int("id").autoincrement().primaryKey(),
  resourceId: int("resourceId").notNull(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  purpose: text("purpose"),
  status: mysqlEnum("status", ["planejado", "confirmado", "em_uso", "concluido", "cancelado"]).default("planejado"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResourceAssignment = typeof resourceAssignments.$inferSelect;
export type InsertResourceAssignment = typeof resourceAssignments.$inferInsert;

// Tarefas de Projetos
export const projectTasks = mysqlTable("project_tasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedToId: int("assignedToId"),
  priority: mysqlEnum("priority", ["baixa", "media", "alta", "critica"]).default("media"),
  status: mysqlEnum("status", ["nao_iniciada", "em_andamento", "bloqueada", "concluida", "cancelada"]).default("nao_iniciada"),
  dueDate: timestamp("dueDate"),
  completedDate: timestamp("completedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = typeof projectTasks.$inferInsert;

// Interações de CRM
export const crmInteractions = mysqlTable("crm_interactions", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  type: mysqlEnum("type", ["email", "telefone", "reuniao", "proposta", "acompanhamento", "outro"]).default("email"),
  description: text("description"),
  interactionDate: timestamp("interactionDate").notNull(),
  userId: int("userId").notNull(),
  nextFollowUp: timestamp("nextFollowUp"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmInteraction = typeof crmInteractions.$inferSelect;
export type InsertCrmInteraction = typeof crmInteractions.$inferInsert;

// Innovare Rocket - Subsistemas
export const rocketSubsystems = mysqlTable("rocket_subsystems", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  leadId: int("leadId"),
  progress: int("progress").default(0),
  status: mysqlEnum("status", ["planejamento", "desenvolvimento", "teste", "validacao", "concluido"]).default("planejamento"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RocketSubsystem = typeof rocketSubsystems.$inferSelect;
export type InsertRocketSubsystem = typeof rocketSubsystems.$inferInsert;

// Innovare Rocket - Mensagens por Subsistema
export const rocketMessages = mysqlTable("rocket_messages", {
  id: int("id").autoincrement().primaryKey(),
  subsystemId: int("subsystemId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  messageType: mysqlEnum("messageType", ["instrucao", "status", "resposta", "comentario"]).default("comentario"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RocketMessage = typeof rocketMessages.$inferSelect;
export type InsertRocketMessage = typeof rocketMessages.$inferInsert;

// Innovare Rocket - Tarefas por Subsistema
export const rocketTasks = mysqlTable("rocket_tasks", {
  id: int("id").autoincrement().primaryKey(),
  subsystemId: int("subsystemId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdById: int("createdById").notNull(),
  assignedToId: int("assignedToId"),
  priority: mysqlEnum("priority", ["baixa", "media", "alta", "critica"]).default("media"),
  status: mysqlEnum("status", ["pendente", "em_progresso", "concluida", "bloqueada"]).default("pendente"),
  dueDate: timestamp("dueDate"),
  completedDate: timestamp("completedDate"),
  completedById: int("completedById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RocketTask = typeof rocketTasks.$inferSelect;
export type InsertRocketTask = typeof rocketTasks.$inferInsert;
