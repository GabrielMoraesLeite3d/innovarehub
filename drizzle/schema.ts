import { integer, pgEnum, pgTable, text, timestamp, varchar, decimal, boolean, jsonb, serial } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const teamTypeEnum = pgEnum("teamType", ["innovare_team", "rocket_team"]);
export const phaseEnum = pgEnum("phase", [
  "entrada_lead",
  "diagnostico",
  "proposta",
  "kickoff",
  "conceito",
  "producao",
  "qa",
  "pos_projeto"
]);
export const projectStatusEnum = pgEnum("project_status", ["backlog", "em_andamento", "concluido", "pausado", "cancelado"]);
export const priorityEnum = pgEnum("priority", ["baixa", "media", "alta", "critica"]);
export const leadStatusEnum = pgEnum("lead_status", [
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
]);
export const commissionStatusEnum = pgEnum("commission_status", ["previsto", "aprovado", "pago"]);
export const financialTypeEnum = pgEnum("financial_type", ["receita", "despesa", "comissao", "reembolso", "aporte"]);
export const financialStatusEnum = pgEnum("financial_status", ["previsto", "confirmado", "pago"]);
export const pndStatusEnum = pgEnum("pnd_status", [
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
]);
export const counterproofStatusEnum = pgEnum("counterproof_status", ["em_andamento", "concluida", "falha", "revisao"]);
export const rocketMissionStatusEnum = pgEnum("rocket_mission_status", ["planejamento", "desenvolvimento", "teste", "validacao", "concluido"]);
export const trainingStatusEnum = pgEnum("training_status", ["planejado", "em_andamento", "concluido"]);
export const trainingProgressStatusEnum = pgEnum("training_progress_status", ["nao_iniciado", "em_andamento", "concluido"]);
export const resourceStatusEnum = pgEnum("resource_status", ["disponivel", "em_uso", "manutencao", "descartado"]);
export const resourceRequestStatusEnum = pgEnum("resource_request_status", ["solicitado", "aprovado", "em_uso", "concluido", "cancelado"]);
export const eventTypeEnum = pgEnum("event_type", ["reuniao", "treinamento", "apresentacao", "workshop", "outro"]);
export const eventStatusEnum = pgEnum("event_status", ["planejado", "confirmado", "em_andamento", "concluido", "cancelado"]);
export const eventParticipantStatusEnum = pgEnum("event_participant_status", ["convidado", "confirmado", "rejeitado", "nao_respondeu"]);
export const resourceAssignmentStatusEnum = pgEnum("resource_assignment_status", ["planejado", "confirmado", "em_uso", "concluido", "cancelado"]);
export const projectTaskStatusEnum = pgEnum("project_task_status", ["nao_iniciada", "em_andamento", "bloqueada", "concluida", "cancelada"]);
export const crmInteractionTypeEnum = pgEnum("crm_interaction_type", ["email", "telefone", "reuniao", "proposta", "acompanhamento", "outro"]);
export const rocketMessageTypeEnum = pgEnum("rocket_message_type", ["instrucao", "status", "resposta", "comentario"]);
export const rocketTaskStatusEnum = pgEnum("rocket_task_status", ["pendente", "em_progresso", "concluida", "bloqueada"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  teamType: teamTypeEnum("teamType").default("innovare_team").notNull(),
  department: varchar("department", { length: 100 }),
  jobTitle: varchar("jobTitle", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const localUsers = pgTable("local_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name"),
  teamType: teamTypeEnum("teamType").default("innovare_team").notNull(),
  role: roleEnum("role").default("user").notNull(),
  area: varchar("area", { length: 100 }),
  department: varchar("department", { length: 100 }),
  jobTitle: varchar("jobTitle", { length: 100 }),
  responsibilities: text("responsibilities"),
  isActive: integer("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  client: varchar("client", { length: 255 }).notNull(),
  description: text("description"),
  phase: phaseEnum("phase").notNull(),
  status: projectStatusEnum("status").default("backlog"),
  priority: priorityEnum("priority").default("media"),
  responsibleId: integer("responsibleId"),
  value: decimal("value", { precision: 12, scale: 2 }),
  estimatedCost: decimal("estimatedCost", { precision: 12, scale: 2 }),
  internalDeadline: timestamp("internalDeadline"),
  externalDeadline: timestamp("externalDeadline"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export const crmLeads = pgTable("crm_leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }),
  origin: varchar("origin", { length: 100 }),
  contact: varchar("contact", { length: 255 }),
  company: varchar("company", { length: 255 }),
  description: text("description"),
  status: leadStatusEnum("status").default("entrada"),
  estimatedValue: decimal("estimatedValue", { precision: 12, scale: 2 }),
  commissionApplicable: boolean("commissionApplicable").default(true),
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }),
  responsibleId: integer("responsibleId"),
  personInCharge: varchar("personInCharge", { length: 255 }),
  nextAction: varchar("nextAction", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CrmLead = typeof crmLeads.$inferSelect;
export type InsertCrmLead = typeof crmLeads.$inferInsert;

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  leadId: integer("leadId").notNull(),
  userId: integer("userId").notNull(),
  projectId: integer("projectId"),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  status: commissionStatusEnum("status").default("previsto"),
  paymentDate: timestamp("paymentDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

export const competencies = pgTable("competencies", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  skill: varchar("skill", { length: 255 }).notNull(),
  level: integer("level").default(0),
  evaluationDate: timestamp("evaluationDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Competency = typeof competencies.$inferSelect;
export type InsertCompetency = typeof competencies.$inferInsert;

export const financials = pgTable("financials", {
  id: serial("id").primaryKey(),
  type: financialTypeEnum("type").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  date: timestamp("date").notNull(),
  status: financialStatusEnum("status").default("previsto"),
  projectId: integer("projectId"),
  userId: integer("userId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Financial = typeof financials.$inferSelect;
export type InsertFinancial = typeof financials.$inferInsert;

export const pnd = pgTable("pnd", {
  id: serial("id").primaryKey(),
  provisionalName: varchar("provisionalName", { length: 255 }).notNull(),
  internalCode: varchar("internalCode", { length: 100 }),
  area: varchar("area", { length: 100 }),
  problemStatement: text("problemStatement"),
  proposedSolution: text("proposedSolution"),
  technicalDifferential: text("technicalDifferential"),
  status: pndStatusEnum("status").default("ideia"),
  patentPotential: varchar("patentPotential", { length: 100 }),
  editorialPotential: varchar("editorialPotential", { length: 100 }),
  secretLevel: varchar("secretLevel", { length: 100 }),
  piStatus: varchar("piStatus", { length: 100 }),
  nextStep: varchar("nextStep", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Pnd = typeof pnd.$inferSelect;
export type InsertPnd = typeof pnd.$inferInsert;

export const technicalCounterproofs = pgTable("technical_counterproofs", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId"),
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
  status: counterproofStatusEnum("status").default("em_andamento"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TechnicalCounterproof = typeof technicalCounterproofs.$inferSelect;
export type InsertTechnicalCounterproof = typeof technicalCounterproofs.$inferInsert;

export const rocketMissions = pgTable("rocket_missions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  objective: text("objective"),
  payload: varchar("payload", { length: 255 }),
  subsystem: varchar("subsystem", { length: 255 }),
  responsibleId: integer("responsibleId"),
  requirement: text("requirement"),
  proposedSolution: text("proposedSolution"),
  status: rocketMissionStatusEnum("status").default("planejamento"),
  relatedDocument: varchar("relatedDocument", { length: 255 }),
  relatedTest: varchar("relatedTest", { length: 255 }),
  risk: varchar("risk", { length: 100 }),
  nextValidation: timestamp("nextValidation"),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type RocketMission = typeof rocketMissions.$inferSelect;
export type InsertRocketMission = typeof rocketMissions.$inferInsert;

export const trainings = pgTable("trainings", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructor: varchar("instructor", { length: 255 }),
  area: varchar("area", { length: 100 }),
  status: trainingStatusEnum("status").default("planejado"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Training = typeof trainings.$inferSelect;
export type InsertTraining = typeof trainings.$inferInsert;

export const trainingProgress = pgTable("training_progress", {
  id: serial("id").primaryKey(),
  trainingId: integer("trainingId").notNull(),
  userId: integer("userId").notNull(),
  status: trainingProgressStatusEnum("status").default("nao_iniciado"),
  completionDate: timestamp("completionDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TrainingProgress = typeof trainingProgress.$inferSelect;
export type InsertTrainingProgress = typeof trainingProgress.$inferInsert;

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  location: varchar("location", { length: 255 }),
  responsibleId: integer("responsibleId"),
  status: resourceStatusEnum("status").default("disponivel"),
  availability: varchar("availability", { length: 100 }),
  riskLevel: varchar("riskLevel", { length: 100 }),
  linkedProject: integer("linkedProject"),
  lastUsage: timestamp("lastUsage"),
  maintenanceNeeded: boolean("maintenanceNeeded").default(false),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

export const resourceRequests = pgTable("resource_requests", {
  id: serial("id").primaryKey(),
  resourceId: integer("resourceId").notNull(),
  userId: integer("userId").notNull(),
  projectId: integer("projectId"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  purpose: text("purpose"),
  status: resourceRequestStatusEnum("status").default("solicitado"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ResourceRequest = typeof resourceRequests.$inferSelect;
export type InsertResourceRequest = typeof resourceRequests.$inferInsert;

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: eventTypeEnum("type").default("reuniao"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  location: varchar("location", { length: 255 }),
  organizerId: integer("organizerId").notNull(),
  status: eventStatusEnum("status").default("planejado"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("eventId").notNull(),
  userId: integer("userId").notNull(),
  status: eventParticipantStatusEnum("status").default("convidado"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertEventParticipant = typeof eventParticipants.$inferInsert;

export const resourceAssignments = pgTable("resource_assignments", {
  id: serial("id").primaryKey(),
  resourceId: integer("resourceId").notNull(),
  userId: integer("userId").notNull(),
  projectId: integer("projectId"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  purpose: text("purpose"),
  status: resourceAssignmentStatusEnum("status").default("planejado"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ResourceAssignment = typeof resourceAssignments.$inferSelect;
export type InsertResourceAssignment = typeof resourceAssignments.$inferInsert;

export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedToId: integer("assignedToId"),
  priority: priorityEnum("priority").default("media"),
  status: projectTaskStatusEnum("status").default("nao_iniciada"),
  dueDate: timestamp("dueDate"),
  completedDate: timestamp("completedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = typeof projectTasks.$inferInsert;

export const crmInteractions = pgTable("crm_interactions", {
  id: serial("id").primaryKey(),
  leadId: integer("leadId").notNull(),
  type: crmInteractionTypeEnum("type").default("email"),
  description: text("description"),
  interactionDate: timestamp("interactionDate").notNull(),
  userId: integer("userId").notNull(),
  nextFollowUp: timestamp("nextFollowUp"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CrmInteraction = typeof crmInteractions.$inferSelect;
export type InsertCrmInteraction = typeof crmInteractions.$inferInsert;

export const rocketSubsystems = pgTable("rocket_subsystems", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  leadId: integer("leadId"),
  progress: integer("progress").default(0),
  status: rocketMissionStatusEnum("status").default("planejamento"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type RocketSubsystem = typeof rocketSubsystems.$inferSelect;
export type InsertRocketSubsystem = typeof rocketSubsystems.$inferInsert;

export const rocketMessages = pgTable("rocket_messages", {
  id: serial("id").primaryKey(),
  subsystemId: integer("subsystemId").notNull(),
  userId: integer("userId").notNull(),
  content: text("content").notNull(),
  messageType: rocketMessageTypeEnum("messageType").default("comentario"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type RocketMessage = typeof rocketMessages.$inferSelect;
export type InsertRocketMessage = typeof rocketMessages.$inferInsert;

export const rocketTasks = pgTable("rocket_tasks", {
  id: serial("id").primaryKey(),
  subsystemId: integer("subsystemId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdById: integer("createdById").notNull(),
  assignedToId: integer("assignedToId"),
  priority: priorityEnum("priority").default("media"),
  status: rocketTaskStatusEnum("status").default("pendente"),
  dueDate: timestamp("dueDate"),
  completedDate: timestamp("completedDate"),
  completedById: integer("completedById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type RocketTask = typeof rocketTasks.$inferSelect;
export type InsertRocketTask = typeof rocketTasks.$inferInsert;
