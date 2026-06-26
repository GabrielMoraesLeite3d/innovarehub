import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, projects, crmLeads, crmInteractions, commissions, financials, resources, trainings, pnd, rocketMissions, competencies, localUsers, LocalUser, InsertLocalUser, InsertProject, projectTasks, InsertProjectTask, InsertCrmLead, InsertCrmInteraction, InsertCommission, InsertFinancial, InsertResource, InsertResourceAssignment, resourceAssignments, events, eventParticipants, InsertEvent, InsertEventParticipant, InsertRocketMission, rocketSubsystems, rocketMessages, rocketTasks } from "../drizzle/schema";
import { ENV } from './_core/env';
import { hashPassword, verifyPassword } from './auth-helpers';

let _db: ReturnType<typeof drizzle> | null = null;

export function __resetDbForTests() {
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    _db = null;
  }
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Projects
export async function getProjectsByPhase(phase: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.phase, phase as any));
}

export async function getAllProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects);
}

export type CreateProjectInput = {
  name: string;
  client?: string;
  description?: string | null;
  phase: InsertProject['phase'];
  status?: InsertProject['status'];
  priority?: InsertProject['priority'];
  responsibleId?: number | null;
  value?: string | null;
  estimatedCost?: string | null;
  internalDeadline?: Date | null;
  externalDeadline?: Date | null;
};

export async function createProject(input: CreateProjectInput) {
  const values: InsertProject = {
    name: input.name,
    client: input.client || 'Interno / Innovare Hub',
    description: input.description || null,
    phase: input.phase,
    status: input.status || 'backlog',
    priority: input.priority || 'media',
    responsibleId: input.responsibleId ?? null,
    value: input.value ?? null,
    estimatedCost: input.estimatedCost ?? null,
    internalDeadline: input.internalDeadline ?? null,
    externalDeadline: input.externalDeadline ?? null,
  };

  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para criar projeto.');
  }

  const created = await db.insert(projects).values(values).returning();
  if (!created[0]) {
    throw new Error('Projeto criado, mas não foi possível confirmar a leitura no banco.');
  }
  return created[0];
}

export type UpdateProjectInput = {
  id: number;
  name?: string;
  client?: string;
  description?: string | null;
  phase?: InsertProject['phase'];
  status?: InsertProject['status'];
  priority?: InsertProject['priority'];
  responsibleId?: number | null;
  value?: string | null;
  estimatedCost?: string | null;
  internalDeadline?: Date | null;
  externalDeadline?: Date | null;
};

export async function updateProject(input: UpdateProjectInput) {
  const { id, ...patch } = input;
  const updateSet = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined)
  ) as Partial<InsertProject>;

  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para atualizar projeto.');
  }

  if (Object.keys(updateSet).length > 0) {
    await db.update(projects).set(updateSet).where(eq(projects.id, id));
  }

  const updated = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!updated[0]) {
    throw new Error('Projeto não encontrado para atualização.');
  }
  return updated[0];
}

// Project Tasks
export async function getProjectTasks(projectId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para listar tarefas de projeto.');
  }

  return db.select().from(projectTasks).where(eq(projectTasks.projectId, projectId)).orderBy(desc(projectTasks.createdAt));
}

export type CreateProjectTaskInput = {
  projectId: number;
  title: string;
  description?: string | null;
  assignedToId?: number | null;
  priority?: InsertProjectTask['priority'];
  status?: InsertProjectTask['status'];
  dueDate?: Date | null;
};

export async function createProjectTask(input: CreateProjectTaskInput) {
  const values: InsertProjectTask = {
    projectId: input.projectId,
    title: input.title,
    description: input.description ?? null,
    assignedToId: input.assignedToId ?? null,
    priority: input.priority ?? 'media',
    status: input.status ?? 'nao_iniciada',
    dueDate: input.dueDate ?? null,
    completedDate: input.status === 'concluida' ? new Date() : null,
  };

  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para criar tarefa de projeto.');
  }

  const created = await db.insert(projectTasks).values(values).returning();
  if (!created[0]) {
    throw new Error('Tarefa criada, mas não foi possível confirmar a leitura no banco.');
  }
  return created[0];
}

export type UpdateProjectTaskStatusInput = {
  id: number;
  status: InsertProjectTask['status'];
};

export async function updateProjectTaskStatus(input: UpdateProjectTaskStatusInput) {
  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para atualizar tarefa de projeto.');
  }

  const updateSet: Partial<InsertProjectTask> = {
    status: input.status,
    completedDate: input.status === 'concluida' ? new Date() : null,
  };
  await db.update(projectTasks).set(updateSet).where(eq(projectTasks.id, input.id));

  const updated = await db.select().from(projectTasks).where(eq(projectTasks.id, input.id)).limit(1);
  if (!updated[0]) {
    throw new Error('Tarefa de projeto não encontrada para atualização.');
  }
  return updated[0];
}

// CRM Leads
export async function getCrmLeads() {
  const db = await getDb();
  if (!db) return [];

  const leads = await db.select().from(crmLeads).orderBy(desc(crmLeads.createdAt));
  const interactions = await db.select().from(crmInteractions).orderBy(desc(crmInteractions.interactionDate));
  const interactionsByLead = interactions.reduce<Record<number, typeof interactions>>((acc, interaction) => {
    acc[interaction.leadId] = acc[interaction.leadId] || [];
    acc[interaction.leadId].push(interaction);
    return acc;
  }, {});

  return leads.map((lead) => ({
    ...lead,
    interactions: interactionsByLead[lead.id] || [],
  }));
}

export type CreateCrmLeadInput = {
  name: string;
  email: string;
  phone?: string | null;
  company: string;
  status?: InsertCrmLead['status'];
  estimatedValue?: number | string | null;
  assignedTo?: string | null;
  commissionPercentage?: number | string | null;
};

export async function createCrmLead(input: CreateCrmLeadInput) {
  const values: InsertCrmLead = {
    name: input.name,
    type: 'lead_comercial',
    origin: 'crm_interno',
    contact: [input.email, input.phone].filter(Boolean).join(' • '),
    company: input.company,
    description: `Email: ${input.email}${input.phone ? ` | Telefone: ${input.phone}` : ''}`,
    status: input.status || 'entrada',
    estimatedValue: input.estimatedValue != null ? String(input.estimatedValue) : '0',
    commissionApplicable: true,
    commissionPercentage: input.commissionPercentage != null ? String(input.commissionPercentage) : '5',
    personInCharge: input.assignedTo || 'Gabriel',
    nextAction: 'Registrar próxima interação comercial',
  };

  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para criar lead CRM.');
  }

  const created = await db.insert(crmLeads).values(values).returning();
  if (!created[0]) {
    throw new Error('Lead criado, mas não foi possível confirmar a leitura no banco.');
  }
  return { ...created[0], interactions: [] };
}

export type UpdateCrmLeadInput = {
  id: number;
  name?: string;
  email?: string;
  phone?: string | null;
  company?: string;
  status?: InsertCrmLead['status'];
  estimatedValue?: number | string | null;
  assignedTo?: string | null;
  commissionPercentage?: number | string | null;
  nextAction?: string | null;
};

export async function updateCrmLead(input: UpdateCrmLeadInput) {
  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para editar lead CRM.');
  }

  const updateValues: Partial<InsertCrmLead> = {};

  if (input.name !== undefined) updateValues.name = input.name;
  if (input.company !== undefined) updateValues.company = input.company;
  if (input.status !== undefined) updateValues.status = input.status;
  if (input.estimatedValue !== undefined) updateValues.estimatedValue = input.estimatedValue != null ? String(input.estimatedValue) : '0';
  if (input.assignedTo !== undefined) updateValues.personInCharge = input.assignedTo || null;
  if (input.commissionPercentage !== undefined) updateValues.commissionPercentage = input.commissionPercentage != null ? String(input.commissionPercentage) : '5';
  if (input.nextAction !== undefined) updateValues.nextAction = input.nextAction || null;

  if (input.email !== undefined || input.phone !== undefined) {
    const current = await db.select().from(crmLeads).where(eq(crmLeads.id, input.id)).limit(1);
    if (!current[0]) {
      throw new Error('Lead CRM não encontrado para edição.');
    }
    const [currentEmail = '', currentPhone = ''] = String(current[0].contact || '').split(' • ');
    const email = input.email !== undefined ? input.email : currentEmail;
    const phone = input.phone !== undefined ? input.phone || '' : currentPhone;
    updateValues.contact = [email, phone].filter(Boolean).join(' • ');
    updateValues.description = `Email: ${email}${phone ? ` | Telefone: ${phone}` : ''}`;
  }

  await db.update(crmLeads).set(updateValues).where(eq(crmLeads.id, input.id));
  const updated = await db.select().from(crmLeads).where(eq(crmLeads.id, input.id)).limit(1);
  if (!updated[0]) {
    throw new Error('Lead CRM não encontrado para edição.');
  }
  const interactions = await db.select().from(crmInteractions).where(eq(crmInteractions.leadId, input.id)).orderBy(desc(crmInteractions.interactionDate));
  return { ...updated[0], interactions };
}

export type UpdateCrmLeadStatusInput = {
  id: number;
  status: InsertCrmLead['status'];
};

export async function updateCrmLeadStatus(input: UpdateCrmLeadStatusInput) {
  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para atualizar lead CRM.');
  }

  await db.update(crmLeads).set({ status: input.status }).where(eq(crmLeads.id, input.id));
  const updated = await db.select().from(crmLeads).where(eq(crmLeads.id, input.id)).limit(1);
  if (!updated[0]) {
    throw new Error('Lead CRM não encontrado para atualização.');
  }
  return updated[0];
}

export type CreateCrmInteractionInput = {
  leadId: number;
  type: InsertCrmInteraction['type'];
  description: string;
  date: Date;
  userId: number;
  notes?: string | null;
  nextFollowUp?: Date | null;
};

export async function createCrmInteraction(input: CreateCrmInteractionInput) {
  const values: InsertCrmInteraction = {
    leadId: input.leadId,
    type: input.type || 'email',
    description: input.description,
    interactionDate: input.date,
    userId: input.userId,
    nextFollowUp: input.nextFollowUp ?? null,
    notes: input.notes ?? null,
  };

  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para registrar interação CRM.');
  }

  const created = await db.insert(crmInteractions).values(values).returning();
  if (!created[0]) {
    throw new Error('Interação registrada, mas não foi possível confirmar a leitura no banco.');
  }
  return created[0];
}

export type CreateCrmCommissionInput = {
  leadId: number;
  userId: number;
  value: number | string;
  percentage?: number | string | null;
  status?: InsertCommission['status'];
};

export async function createCrmCommission(input: CreateCrmCommissionInput) {
  const values: InsertCommission = {
    leadId: input.leadId,
    userId: input.userId,
    value: String(input.value),
    percentage: input.percentage != null ? String(input.percentage) : '5',
    status: input.status || 'previsto',
  };

  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para registrar comissão CRM.');
  }

  const created = await db.insert(commissions).values(values).returning();
  if (!created[0]) {
    throw new Error('Comissão registrada, mas não foi possível confirmar a leitura no banco.');
  }
  return created[0];
}

// Financials
export async function getFinancials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(financials).orderBy(desc(financials.date));
}

export type CreateFinancialInput = {
  type: InsertFinancial['type'];
  description: string;
  amount: number | string;
  date: Date;
  category?: string | null;
  status?: InsertFinancial['status'];
  projectId?: number | null;
  userId?: number | null;
  notes?: string | null;
};

export async function createFinancial(input: CreateFinancialInput) {
  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para registrar movimentação financeira.');
  }

  const values: InsertFinancial = {
    type: input.type,
    description: input.description,
    amount: String(input.amount),
    date: input.date,
    category: input.category || null,
    status: input.status || 'previsto',
    projectId: input.projectId || null,
    userId: input.userId || null,
    notes: input.notes || null,
  };

  const created = await db.insert(financials).values(values).returning();
  if (created[0]) return created[0];
  return values;
}

export async function updateFinancialStatus(input: { id: number; status: InsertFinancial['status'] }) {
  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para atualizar movimentação financeira.');
  }
  await db.update(financials).set({ status: input.status }).where(eq(financials.id, input.id));
  const updated = await db.select().from(financials).where(eq(financials.id, input.id)).limit(1);
  if (!updated[0]) {
    throw new Error('Movimentação financeira não encontrada.');
  }
  return updated[0];
}

export async function deleteFinancial(input: { id: number }) {
  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para excluir movimentação financeira.');
  }
  await db.delete(financials).where(eq(financials.id, input.id));
  return { id: input.id };
}

// Resources
export async function getResources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).orderBy(desc(resources.createdAt));
}

export type CreateResourceInput = {
  name: string;
  category: string;
  location?: string | null;
  status?: InsertResource['status'];
  responsibleId?: number | null;
  availability?: string | null;
  riskLevel?: string | null;
  linkedProject?: number | null;
  notes?: string | null;
};

export async function createResource(input: CreateResourceInput) {
  const values: InsertResource = {
    name: input.name,
    category: input.category,
    location: input.location ?? null,
    status: input.status ?? 'disponivel',
    responsibleId: input.responsibleId ?? null,
    availability: input.availability ?? null,
    riskLevel: input.riskLevel ?? null,
    linkedProject: input.linkedProject ?? null,
    notes: input.notes ?? null,
    maintenanceNeeded: input.status === 'manutencao',
  };

  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para criar recurso.');
  }

  const created = await db.insert(resources).values(values).returning();
  if (!created[0]) {
    throw new Error('Recurso criado, mas não foi possível confirmar a leitura no banco.');
  }
  return created[0];
}

export type UpdateResourceInput = {
  id: number;
  name?: string;
  category?: string;
  location?: string | null;
  status?: InsertResource['status'];
  responsibleId?: number | null;
  availability?: string | null;
  riskLevel?: string | null;
  linkedProject?: number | null;
  notes?: string | null;
};

export async function updateResource(input: UpdateResourceInput) {
  const { id, ...patch } = input;
  const updateSet = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined)
  ) as Partial<InsertResource>;

  if (patch.status !== undefined) {
    updateSet.maintenanceNeeded = patch.status === 'manutencao';
    if (patch.status === 'em_uso') {
      updateSet.lastUsage = new Date();
    }
  }

  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para atualizar recurso.');
  }

  if (Object.keys(updateSet).length > 0) {
    await db.update(resources).set(updateSet).where(eq(resources.id, id));
  }

  const updated = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
  if (!updated[0]) {
    throw new Error('Recurso não encontrado para atualização.');
  }
  return updated[0];
}

export async function deleteResource(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para remover recurso.');
  }

  await db.delete(resources).where(eq(resources.id, id));
  return { id, deleted: true };
}

export type CreateResourceAssignmentInput = {
  resourceId: number;
  userId: number;
  projectId?: number | null;
  startDate: Date;
  endDate: Date;
  purpose?: string | null;
  status?: InsertResourceAssignment['status'];
  notes?: string | null;
};

export async function createResourceAssignment(input: CreateResourceAssignmentInput) {
  const values: InsertResourceAssignment = {
    resourceId: input.resourceId,
    userId: input.userId,
    projectId: input.projectId ?? null,
    startDate: input.startDate,
    endDate: input.endDate,
    purpose: input.purpose ?? null,
    status: input.status ?? 'planejado',
    notes: input.notes ?? null,
  };

  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para agendar recurso.');
  }

  const created = await db.insert(resourceAssignments).values(values).returning();
  await db.update(resources).set({ status: 'em_uso', lastUsage: new Date() }).where(eq(resources.id, input.resourceId));

  if (!created[0]) {
    throw new Error('Agendamento criado, mas não foi possível confirmar a leitura no banco.');
  }
  return created[0];
}

// Events and Meetings
export async function getAllEvents() {
  const db = await getDb();
  if (!db) return [];
  const eventRows = await db.select().from(events).orderBy(desc(events.startDate));
  if (eventRows.length === 0) return [];

  const participantRows = await db.select().from(eventParticipants);
  const participantsByEvent = new Map<number, number[]>();
  for (const participant of participantRows) {
    const list = participantsByEvent.get(participant.eventId) ?? [];
    list.push(participant.userId);
    participantsByEvent.set(participant.eventId, list);
  }

  return eventRows.map((event) => ({
    ...event,
    participantIds: participantsByEvent.get(event.id) ?? [],
  }));
}

export type CreateEventInput = {
  title: string;
  description?: string | null;
  type?: InsertEvent['type'];
  startDate: Date;
  endDate: Date;
  location?: string | null;
  organizerId: number;
  status?: InsertEvent['status'];
  participantIds?: number[];
};

export async function createEvent(input: CreateEventInput) {
  const values: InsertEvent = {
    title: input.title,
    description: input.description ?? null,
    type: input.type ?? 'reuniao',
    startDate: input.startDate,
    endDate: input.endDate,
    location: input.location ?? null,
    organizerId: input.organizerId,
    status: input.status ?? 'planejado',
  };

  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para criar evento.');
  }

  const created = await db.insert(events).values(values).returning();
  if (!created[0]) {
    throw new Error('Evento criado, mas não foi possível confirmar a leitura no banco.');
  }

  const participantIds = Array.from(new Set([input.organizerId, ...(input.participantIds ?? [])])).filter((id) => Number.isFinite(id));
  if (participantIds.length > 0) {
    await db.insert(eventParticipants).values(
      participantIds.map((userId) => ({ eventId: created[0].id, userId, status: userId === input.organizerId ? 'confirmado' : 'convidado' } satisfies InsertEventParticipant))
    );
  }

  return created[0];
}

export type UpdateEventScheduleInput = {
  id: number;
  startDate: Date;
  endDate: Date;
};

export async function updateEventSchedule(input: UpdateEventScheduleInput) {
  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para reagendar evento.');
  }

  await db.update(events).set({ startDate: input.startDate, endDate: input.endDate }).where(eq(events.id, input.id));
  const updated = await db.select().from(events).where(eq(events.id, input.id)).limit(1);
  if (!updated[0]) {
    throw new Error('Evento não encontrado para reagendamento.');
  }

  const participantRows = await db.select().from(eventParticipants).where(eq(eventParticipants.eventId, input.id));
  return {
    ...updated[0],
    participantIds: participantRows.map((participant) => participant.userId),
  };
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para remover evento.');
  }

  await db.delete(eventParticipants).where(eq(eventParticipants.eventId, id));
  await db.delete(events).where(eq(events.id, id));
  return { id, deleted: true };
}

export type AddEventParticipantInput = {
  eventId: number;
  userId: number;
  status?: InsertEventParticipant['status'];
};

export async function addEventParticipant(input: AddEventParticipantInput) {
  const db = await getDb();
  if (!db) {
    throw new Error('Banco de dados indisponível para adicionar participante ao evento.');
  }

  const values: InsertEventParticipant = {
    eventId: input.eventId,
    userId: input.userId,
    status: input.status ?? 'convidado',
  };
  const created = await db.insert(eventParticipants).values(values).returning();
  if (!created[0]) {
    throw new Error('Participante adicionado, mas não foi possível confirmar a leitura no banco.');
  }
  return created[0];
}

export async function getEventParticipants(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventParticipants).where(eq(eventParticipants.eventId, eventId)).orderBy(desc(eventParticipants.createdAt));
}

// Trainings
export async function getTrainings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainings);
}

// P&D
export async function getPndItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pnd);
}

// Rocket Missions
export async function getRocketMissions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rocketMissions).orderBy(desc(rocketMissions.updatedAt));
}

export type CreateRocketMissionInput = {
  name: string;
  description?: string | null;
  category?: string | null;
  objective?: string | null;
  payload?: string | null;
  subsystem?: string | null;
  responsibleId?: number | null;
  requirement?: string | null;
  proposedSolution?: string | null;
  status?: InsertRocketMission['status'];
  relatedDocument?: string | null;
  relatedTest?: string | null;
  risk?: string | null;
  nextValidation?: Date | null;
  dueDate?: Date | null;
};

export async function createRocketMission(input: CreateRocketMissionInput) {
  const db = await getDb();
  if (!db) throw new Error('Banco de dados indisponível para criar missão Rocket');

  const values: InsertRocketMission = {
    name: input.name,
    description: input.description || null,
    category: input.category || null,
    objective: input.objective || null,
    payload: input.payload || null,
    subsystem: input.subsystem || null,
    responsibleId: input.responsibleId ?? null,
    requirement: input.requirement || null,
    proposedSolution: input.proposedSolution || null,
    status: input.status ?? 'planejamento',
    relatedDocument: input.relatedDocument || null,
    relatedTest: input.relatedTest || null,
    risk: input.risk || null,
    nextValidation: input.nextValidation ?? null,
    dueDate: input.dueDate ?? null,
  };

  const created = await db.insert(rocketMissions).values(values).returning();
  if (!created[0]) {
    throw new Error('Missão Rocket criada, mas não foi possível confirmar a leitura no banco.');
  }
  return created[0];
}

export type UpdateRocketMissionInput = Partial<CreateRocketMissionInput> & { id: number };

export async function updateRocketMission(input: UpdateRocketMissionInput) {
  const db = await getDb();
  if (!db) throw new Error('Banco de dados indisponível para editar missão Rocket');

  const updateValues: Partial<InsertRocketMission> = {};
  if (input.name !== undefined) updateValues.name = input.name;
  if (input.description !== undefined) updateValues.description = input.description || null;
  if (input.category !== undefined) updateValues.category = input.category || null;
  if (input.objective !== undefined) updateValues.objective = input.objective || null;
  if (input.payload !== undefined) updateValues.payload = input.payload || null;
  if (input.subsystem !== undefined) updateValues.subsystem = input.subsystem || null;
  if (input.responsibleId !== undefined) updateValues.responsibleId = input.responsibleId ?? null;
  if (input.requirement !== undefined) updateValues.requirement = input.requirement || null;
  if (input.proposedSolution !== undefined) updateValues.proposedSolution = input.proposedSolution || null;
  if (input.status !== undefined) updateValues.status = input.status;
  if (input.relatedDocument !== undefined) updateValues.relatedDocument = input.relatedDocument || null;
  if (input.relatedTest !== undefined) updateValues.relatedTest = input.relatedTest || null;
  if (input.risk !== undefined) updateValues.risk = input.risk || null;
  if (input.nextValidation !== undefined) updateValues.nextValidation = input.nextValidation ?? null;
  if (input.dueDate !== undefined) updateValues.dueDate = input.dueDate ?? null;

  await db.update(rocketMissions).set(updateValues).where(eq(rocketMissions.id, input.id));
  const updated = await db.select().from(rocketMissions).where(eq(rocketMissions.id, input.id)).limit(1);
  if (!updated[0]) {
    throw new Error('Missão Rocket editada, mas não foi possível confirmar a leitura no banco.');
  }
  return updated[0];
}

// Competencies
export async function getCompetenciesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(competencies).where(eq(competencies.userId, userId));
}

// Local Authentication (email/password)
export async function createLocalUser(input: { email: string; password: string; name: string; teamType: 'innovare_team' | 'rocket_team'; role?: 'user' | 'admin' }): Promise<LocalUser | null> {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot create local user: database not available');
    return null;
  }

  try {
    const passwordHash = hashPassword(input.password);
    const created = await db.insert(localUsers).values({
      email: input.email,
      passwordHash,
      name: input.name,
      teamType: input.teamType,
      role: input.role || 'user',
      isActive: 1,
    }).returning();

    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error('[Database] Failed to create local user:', error);
    return null;
  }
}

export async function getLocalUserByEmail(email: string): Promise<LocalUser | null> {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot get local user: database not available');
    return null;
  }

  try {
    const result = await db.select().from(localUsers).where(eq(localUsers.email, email)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get local user:', error);
    return null;
  }
}

export async function verifyLocalUserPassword(email: string, password: string): Promise<LocalUser | null> {
  const user = await getLocalUserByEmail(email);
  if (!user || !user.isActive) return null;

  if (verifyPassword(password, user.passwordHash)) {
    return user;
  }

  return null;
}

export async function getAllLocalUsers(): Promise<LocalUser[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(localUsers);
}

export async function deleteLocalUser(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(localUsers).where(eq(localUsers.id, id));
    return true;
  } catch (error) {
    console.error('[Database] Failed to delete local user:', error);
    return false;
  }
}

// TODO: add feature queries here as your schema grows.


// Innovare Rocket - Subsistemas
export async function getRocketSubsystems() {
  const db = await getDb();
  if (!db) throw new Error('Banco de dados indisponível para listar subsistemas Rocket');
  return db.select().from(rocketSubsystems);
}

export async function getRocketSubsystemById(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Banco de dados indisponível para carregar subsistema Rocket');
  const result = await db.select().from(rocketSubsystems).where(eq(rocketSubsystems.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateRocketSubsystemProgress(id: number, progress: number, status?: 'planejamento' | 'desenvolvimento' | 'teste' | 'validacao' | 'concluido') {
  const db = await getDb();
  if (!db) throw new Error('Banco de dados indisponível para atualizar progresso Rocket');

  try {
    const updateData: any = { progress };
    if (status) updateData.status = status;
    await db.update(rocketSubsystems).set(updateData).where(eq(rocketSubsystems.id, id));
    return getRocketSubsystemById(id);
  } catch (error) {
    console.error('[Database] Failed to update rocket subsystem progress:', error);
    return null;
  }
}

// Innovare Rocket - Mensagens
export async function getRocketMessages(subsystemId: number) {
  const db = await getDb();
  if (!db) throw new Error('Banco de dados indisponível para listar mensagens Rocket');
  return db.select().from(rocketMessages).where(eq(rocketMessages.subsystemId, subsystemId));
}

export async function createRocketMessage(subsystemId: number, userId: number, content: string, messageType: 'instrucao' | 'status' | 'resposta' | 'comentario' = 'comentario') {
  const db = await getDb();
  if (!db) throw new Error('Banco de dados indisponível para criar mensagem Rocket');
  
  try {
    const result = await db.insert(rocketMessages).values({
      subsystemId,
      userId,
      content,
      messageType,
    }).returning();
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Database] Failed to create rocket message:', error);
    return null;
  }
}

export async function getRocketNotificationHistory(limit = 8) {
  const db = await getDb();
  if (!db) throw new Error('Banco de dados indisponível para listar histórico Rocket');

  const [subsystems, messages, tasks] = await Promise.all([
    db.select().from(rocketSubsystems),
    db.select().from(rocketMessages),
    db.select().from(rocketTasks),
  ]);

  const subsystemById = new Map(subsystems.map((subsystem) => [Number(subsystem.id), String(subsystem.name)]));
  const toTimestamp = (value: unknown) => {
    const parsed = value instanceof Date ? value.getTime() : new Date(String(value ?? '')).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const messageNotifications = messages.map((message) => ({
    id: `message-${message.id}`,
    title: message.messageType === 'instrucao' ? 'Nova instrução Rocket' : 'Nova mensagem Rocket',
    description: String(message.content ?? '').slice(0, 160),
    subsystem: subsystemById.get(Number(message.subsystemId)) ?? `Subsistema #${message.subsystemId}`,
    kind: 'mensagem' as const,
    at: message.createdAt,
    atMs: toTimestamp(message.createdAt),
  }));

  const taskNotifications = tasks.map((task) => ({
    id: `task-${task.id}`,
    title: String(task.title ?? '').startsWith('Entrega para revisão:') ? 'Entrega Rocket registrada' : 'Demanda Rocket registrada',
    description: String(task.description ?? task.title ?? '').slice(0, 160),
    subsystem: subsystemById.get(Number(task.subsystemId)) ?? `Subsistema #${task.subsystemId}`,
    kind: String(task.title ?? '').startsWith('Entrega para revisão:') ? 'entrega' as const : 'demanda' as const,
    at: task.createdAt,
    atMs: toTimestamp(task.createdAt),
  }));

  const progressNotifications = subsystems
    .filter((subsystem) => Number(subsystem.progress ?? 0) > 0)
    .map((subsystem) => ({
      id: `progress-${subsystem.id}`,
      title: 'Progresso Rocket atualizado',
      description: `${subsystem.name} está com ${subsystem.progress}% de avanço e status ${String(subsystem.status ?? 'planejamento').replace('_', ' ')}.`,
      subsystem: String(subsystem.name),
      kind: 'progresso' as const,
      at: subsystem.updatedAt,
      atMs: toTimestamp(subsystem.updatedAt),
    }));

  return [...messageNotifications, ...taskNotifications, ...progressNotifications]
    .sort((a, b) => b.atMs - a.atMs)
    .slice(0, limit)
    .map(({ atMs, ...notification }) => notification);
}

// Innovare Rocket - Tarefas
export async function getRocketTasks(subsystemId: number) {
  const db = await getDb();
  if (!db) throw new Error('Banco de dados indisponível para listar tarefas Rocket');
  return db.select().from(rocketTasks).where(eq(rocketTasks.subsystemId, subsystemId));
}

export async function createRocketTask(subsystemId: number, title: string, description: string, createdById: number, assignedToId?: number, priority: 'baixa' | 'media' | 'alta' | 'critica' = 'media', dueDate?: Date) {
  const db = await getDb();
  if (!db) throw new Error('Banco de dados indisponível para criar tarefa Rocket');
  
  try {
    const result = await db.insert(rocketTasks).values({
      subsystemId,
      title,
      description,
      createdById,
      assignedToId,
      priority,
      dueDate,
    }).returning();
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Database] Failed to create rocket task:', error);
    return null;
  }
}

export async function updateRocketTaskStatus(taskId: number, status: 'pendente' | 'em_progresso' | 'concluida' | 'bloqueada', completedById?: number) {
  const db = await getDb();
  if (!db) throw new Error('Banco de dados indisponível para atualizar tarefa Rocket');
  
  try {
    const updateData: any = { status };
    if (status === 'concluida') {
      updateData.completedDate = new Date();
      updateData.completedById = completedById;
    }
    await db.update(rocketTasks).set(updateData).where(eq(rocketTasks.id, taskId));
    return true;
  } catch (error) {
    console.error('[Database] Failed to update rocket task:', error);
    return false;
  }
}
