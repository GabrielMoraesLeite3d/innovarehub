import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { 
  getAllProjects, getProjectsByPhase, createProject, updateProject, getProjectTasks, createProjectTask, updateProjectTaskStatus, getCrmLeads, createCrmLead, updateCrmLead, updateCrmLeadStatus, createCrmInteraction, createCrmCommission, getFinancials, createFinancial, updateFinancialStatus, deleteFinancial, getResources, createResource, updateResource, deleteResource, createResourceAssignment, getAllEvents, createEvent, updateEventSchedule, deleteEvent, addEventParticipant, getEventParticipants,
  getTrainings, getPndItems, getRocketMissions, createRocketMission, updateRocketMission, getRocketSubsystems, updateRocketSubsystemProgress, getRocketTasks, createRocketTask, updateRocketTaskStatus, createRocketMessage, getRocketMessages, getRocketNotificationHistory, getCompetenciesByUser,
  verifyLocalUserPassword, getAllLocalUsers, createLocalUser, deleteLocalUser, upsertUser
} from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Helper para verificar team type
function requireTeamType(userTeamType: string | undefined, allowedTeams: string[]) {
  if (!userTeamType || !allowedTeams.includes(userTeamType)) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso não autorizado' });
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const user = await verifyLocalUserPassword(input.email, input.password);
        
        if (!user) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Email ou senha inválidos' });
        }

        // Sync local user to the main users table so authenticateRequest finds them
        await upsertUser({
          openId: user.email,
          name: user.name || null,
          email: user.email,
          loginMethod: "local",
          role: user.role,
          teamType: user.teamType,
          department: user.department || null,
          jobTitle: user.jobTitle || null,
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(user.email, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { 
          success: true, 
          message: 'Login realizado com sucesso',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            teamType: user.teamType,
            role: user.role,
          }
        };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Projects (Innovare Team only)
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const teamType = (ctx.user as any)?.teamType;
      requireTeamType(teamType, ['innovare_team']);
      return getAllProjects();
    }),
    byPhase: protectedProcedure
      .input(z.object({ phase: z.string() }))
      .query(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        return getProjectsByPhase(input.phase);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        client: z.string().optional(),
        description: z.string().optional(),
        phase: z.enum(['entrada_lead', 'diagnostico', 'proposta', 'kickoff', 'conceito', 'producao', 'qa', 'pos_projeto']),
        status: z.enum(['backlog', 'em_andamento', 'concluido', 'pausado', 'cancelado']).optional(),
        priority: z.enum(['baixa', 'media', 'alta', 'critica']).optional(),
        responsible: z.string().optional(),
        responsibleId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const project = await createProject({
          name: input.name,
          client: input.client || input.responsible || 'Interno / Innovare Hub',
          description: input.description,
          phase: input.phase,
          status: input.status || 'em_andamento',
          priority: input.priority || 'media',
          responsibleId: input.responsibleId ?? null,
          internalDeadline: input.startDate ?? null,
          externalDeadline: input.endDate ?? null,
        });
        return { success: true, message: 'Projeto criado com sucesso', data: project };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        client: z.string().optional(),
        description: z.string().nullable().optional(),
        phase: z.enum(['entrada_lead', 'diagnostico', 'proposta', 'kickoff', 'conceito', 'producao', 'qa', 'pos_projeto']).optional(),
        status: z.enum(['backlog', 'em_andamento', 'concluido', 'pausado', 'cancelado']).optional(),
        priority: z.enum(['baixa', 'media', 'alta', 'critica']).optional(),
        responsibleId: z.number().nullable().optional(),
        startDate: z.date().nullable().optional(),
        endDate: z.date().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const project = await updateProject({
          id: input.id,
          name: input.name,
          client: input.client,
          description: input.description,
          phase: input.phase,
          status: input.status,
          priority: input.priority,
          responsibleId: input.responsibleId,
          internalDeadline: input.startDate,
          externalDeadline: input.endDate,
        });
        return { success: true, message: 'Projeto atualizado', data: project };
      }),
    tasks: protectedProcedure
      .input(z.object({ projectId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        return getProjectTasks(input.projectId);
      }),
    createTask: protectedProcedure
      .input(z.object({
        projectId: z.number().int().positive(),
        title: z.string().min(1),
        description: z.string().nullable().optional(),
        assignedToId: z.number().int().positive().nullable().optional(),
        priority: z.enum(['baixa', 'media', 'alta', 'critica']).optional(),
        status: z.enum(['nao_iniciada', 'em_andamento', 'bloqueada', 'concluida', 'cancelada']).optional(),
        dueDate: z.date().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const task = await createProjectTask({
          projectId: input.projectId,
          title: input.title,
          description: input.description ?? null,
          assignedToId: input.assignedToId ?? null,
          priority: input.priority ?? 'media',
          status: input.status ?? 'nao_iniciada',
          dueDate: input.dueDate ?? null,
        });
        return { success: true, message: 'Tarefa de projeto criada com sucesso', data: task };
      }),
    updateTaskStatus: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        status: z.enum(['nao_iniciada', 'em_andamento', 'bloqueada', 'concluida', 'cancelada']),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const task = await updateProjectTaskStatus(input);
        return { success: true, message: 'Status da tarefa de projeto atualizado', data: task };
      }),
  }),

  // CRM (Innovare Team only)
  crm: router({
    leads: protectedProcedure.query(async ({ ctx }) => {
      const teamType = (ctx.user as any)?.teamType;
      requireTeamType(teamType, ['innovare_team']);
      return getCrmLeads();
    }),
    createLead: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional().default(''),
        company: z.string().min(1),
        status: z.enum(['entrada', 'triagem', 'aguardando_briefing', 'orcamento_elaboracao', 'proposta_enviada', 'negociacao', 'aprovado', 'recusado', 'virou_projeto', 'arquivado']).default('entrada'),
        estimatedValue: z.number().min(0).optional().default(0),
        assignedTo: z.string().min(1).optional().default('Gabriel'),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const lead = await createCrmLead(input);
        return { success: true, message: 'Lead criado com sucesso', data: lead };
      }),
    updateLead: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().min(1).optional(),
        status: z.enum(['entrada', 'triagem', 'aguardando_briefing', 'orcamento_elaboracao', 'proposta_enviada', 'negociacao', 'aprovado', 'recusado', 'virou_projeto', 'arquivado']).optional(),
        estimatedValue: z.number().min(0).optional(),
        assignedTo: z.string().min(1).optional(),
        commissionPercentage: z.number().min(0).max(100).optional(),
        nextAction: z.string().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const lead = await updateCrmLead(input);
        return { success: true, message: 'Lead atualizado com sucesso', data: lead };
      }),
    updateLeadStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['entrada', 'triagem', 'aguardando_briefing', 'orcamento_elaboracao', 'proposta_enviada', 'negociacao', 'aprovado', 'recusado', 'virou_projeto', 'arquivado']),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const lead = await updateCrmLeadStatus(input);
        return { success: true, message: 'Status do lead atualizado', data: lead };
      }),
    addInteraction: protectedProcedure
      .input(z.object({
        leadId: z.number(),
        type: z.enum(['email', 'telefone', 'reuniao', 'proposta', 'acompanhamento', 'outro']).default('email'),
        description: z.string().min(1),
        date: z.date(),
        nextFollowUp: z.date().nullable().optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const userId = Number((ctx.user as any)?.id);
        if (!Number.isFinite(userId)) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuário autenticado sem identificador para registrar interação CRM.' });
        }
        const interaction = await createCrmInteraction({ ...input, userId });
        return { success: true, message: 'Interação registrada', data: interaction };
      }),
    createCommission: protectedProcedure
      .input(z.object({
        leadId: z.number(),
        value: z.number().min(0),
        percentage: z.number().min(0).max(100).optional().default(5),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const userId = Number((ctx.user as any)?.id);
        if (!Number.isFinite(userId)) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuário autenticado sem identificador para registrar comissão CRM.' });
        }
        const commission = await createCrmCommission({ ...input, userId, status: 'previsto' });
        return { success: true, message: 'Comissão registrada', data: commission };
      }),
  }),

  // Financials (Innovare Team only)
  financials: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const teamType = (ctx.user as any)?.teamType;
      requireTeamType(teamType, ['innovare_team']);
      return getFinancials();
    }),
    addRevenue: protectedProcedure
      .input(z.object({
        description: z.string().min(1),
        amount: z.number().positive(),
        date: z.date(),
        category: z.string().min(1),
        status: z.enum(['previsto', 'confirmado', 'pago']).default('confirmado'),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const financial = await createFinancial({ ...input, type: 'receita' });
        return { success: true, message: 'Receita adicionada', data: financial };
      }),
    addExpense: protectedProcedure
      .input(z.object({
        description: z.string().min(1),
        amount: z.number().positive(),
        date: z.date(),
        category: z.string().min(1),
        status: z.enum(['previsto', 'confirmado', 'pago']).default('pago'),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const financial = await createFinancial({ ...input, type: 'despesa' });
        return { success: true, message: 'Despesa adicionada', data: financial };
      }),
    addCommission: protectedProcedure
      .input(z.object({
        description: z.string().min(1),
        amount: z.number().positive(),
        date: z.date(),
        category: z.string().min(1).default('Comissões'),
        status: z.enum(['previsto', 'confirmado', 'pago']).default('previsto'),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const financial = await createFinancial({ ...input, type: 'comissao' });
        return { success: true, message: 'Comissão adicionada', data: financial };
      }),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        status: z.enum(['previsto', 'confirmado', 'pago']),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const financial = await updateFinancialStatus(input);
        return { success: true, message: 'Status financeiro atualizado', data: financial };
      }),
    remove: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const removed = await deleteFinancial(input);
        return { success: true, message: 'Movimentação financeira excluída', data: removed };
      }),
  }),

  // Resources (Innovare Team only)
  resources: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const teamType = (ctx.user as any)?.teamType;
      requireTeamType(teamType, ['innovare_team']);
      return getResources();
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        location: z.string().nullable().optional(),
        status: z.enum(['disponivel', 'em_uso', 'manutencao', 'descartado']).optional(),
        responsibleId: z.number().int().positive().nullable().optional(),
        availability: z.string().nullable().optional(),
        riskLevel: z.string().nullable().optional(),
        linkedProject: z.number().int().positive().nullable().optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const resource = await createResource(input);
        return { success: true, message: 'Recurso criado com sucesso', data: resource };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).optional(),
        category: z.string().min(1).optional(),
        location: z.string().nullable().optional(),
        status: z.enum(['disponivel', 'em_uso', 'manutencao', 'descartado']).optional(),
        responsibleId: z.number().int().positive().nullable().optional(),
        availability: z.string().nullable().optional(),
        riskLevel: z.string().nullable().optional(),
        linkedProject: z.number().int().positive().nullable().optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const resource = await updateResource(input);
        return { success: true, message: 'Recurso atualizado', data: resource };
      }),
    remove: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const result = await deleteResource(input.id);
        return { success: true, message: 'Recurso removido', data: result };
      }),
    createAssignment: protectedProcedure
      .input(z.object({
        resourceId: z.number().int().positive(),
        userId: z.number().int().positive().optional(),
        projectId: z.number().int().positive().nullable().optional(),
        startDate: z.date(),
        endDate: z.date(),
        purpose: z.string().min(1),
        status: z.enum(['planejado', 'confirmado', 'em_uso', 'concluido', 'cancelado']).optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        if (input.endDate < input.startDate) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Data final deve ser posterior à data inicial do agendamento.' });
        }
        const fallbackUserId = Number((ctx.user as any)?.id);
        const userId = input.userId ?? fallbackUserId;
        if (!Number.isFinite(userId)) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuário autenticado sem identificador para agendar recurso.' });
        }
        const assignment = await createResourceAssignment({ ...input, userId });
        return { success: true, message: 'Agendamento de recurso criado', data: assignment };
      }),
  }),

  // Events and Meetings (Innovare Team only)
  events: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const teamType = (ctx.user as any)?.teamType;
      requireTeamType(teamType, ['innovare_team']);
      return getAllEvents();
    }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().nullable().optional(),
        type: z.enum(['reuniao', 'treinamento', 'apresentacao', 'workshop', 'outro']).optional(),
        startDate: z.date(),
        endDate: z.date(),
        location: z.string().nullable().optional(),
        status: z.enum(['planejado', 'confirmado', 'em_andamento', 'concluido', 'cancelado']).optional(),
        participantIds: z.array(z.number().int().positive()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        if (input.endDate < input.startDate) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Data final deve ser posterior à data inicial do evento.' });
        }
        const organizerId = Number((ctx.user as any)?.id);
        if (!Number.isFinite(organizerId)) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuário autenticado sem identificador para criar evento.' });
        }
        const event = await createEvent({ ...input, organizerId });
        return { success: true, message: 'Evento criado com sucesso', data: event };
      }),
    updateSchedule: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        if (input.endDate < input.startDate) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Data final deve ser posterior à data inicial do evento reagendado.' });
        }
        const event = await updateEventSchedule(input);
        return { success: true, message: 'Evento reagendado com sucesso', data: event };
      }),
    remove: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const result = await deleteEvent(input.id);
        return { success: true, message: 'Evento removido', data: result };
      }),
    addParticipant: protectedProcedure
      .input(z.object({
        eventId: z.number().int().positive(),
        userId: z.number().int().positive(),
        status: z.enum(['convidado', 'confirmado', 'rejeitado', 'nao_respondeu']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const participant = await addEventParticipant(input);
        return { success: true, message: 'Participante adicionado ao evento', data: participant };
      }),
    participants: protectedProcedure
      .input(z.object({ eventId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        return getEventParticipants(input.eventId);
      }),
  }),

  // Trainings (Innovare Team only)
  trainings: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const teamType = (ctx.user as any)?.teamType;
      requireTeamType(teamType, ['innovare_team']);
      return getTrainings();
    }),
    createCourse: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string(),
        instructor: z.string(),
        duration: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        return { success: true, message: 'Curso criado', data: input };
      }),
    assignCourse: protectedProcedure
      .input(z.object({
        courseId: z.number(),
        userId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        return { success: true, message: 'Curso atribuído', data: input };
      }),
  }),

  // P&D (Innovare Team only)
  pnd: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const teamType = (ctx.user as any)?.teamType;
      requireTeamType(teamType, ['innovare_team']);
      return getPndItems();
    }),
    registerPatent: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string(),
        inventors: z.array(z.string()),
        filingDate: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        return { success: true, message: 'Patente registrada', data: input };
      }),
    createResearch: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string(),
        responsible: z.string(),
        status: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        return { success: true, message: 'Projeto de pesquisa criado', data: input };
      }),
  }),

  // Rocket (Innovare Team + Rocket Team)
  rocket: router({
    missions: protectedProcedure.query(async ({ ctx }) => {
      const teamType = (ctx.user as any)?.teamType;
      requireTeamType(teamType, ['innovare_team', 'rocket_team']);
      return getRocketMissions();
    }),
    createMission: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        objective: z.string().optional(),
        payload: z.string().optional(),
        subsystem: z.string().optional(),
        responsibleId: z.number().int().positive().nullable().optional(),
        requirement: z.string().optional(),
        proposedSolution: z.string().optional(),
        status: z.enum(['planejamento', 'desenvolvimento', 'teste', 'validacao', 'concluido']).optional(),
        relatedDocument: z.string().optional(),
        relatedTest: z.string().optional(),
        risk: z.string().optional(),
        nextValidation: z.date().nullable().optional(),
        dueDate: z.date().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const mission = await createRocketMission({ ...input, status: input.status ?? 'planejamento' });
        return { success: true, message: 'Missão Rocket criada com persistência', data: mission };
      }),
    updateMission: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
        category: z.string().nullable().optional(),
        objective: z.string().nullable().optional(),
        payload: z.string().nullable().optional(),
        subsystem: z.string().nullable().optional(),
        responsibleId: z.number().int().positive().nullable().optional(),
        requirement: z.string().nullable().optional(),
        proposedSolution: z.string().nullable().optional(),
        status: z.enum(['planejamento', 'desenvolvimento', 'teste', 'validacao', 'concluido']).optional(),
        relatedDocument: z.string().nullable().optional(),
        relatedTest: z.string().nullable().optional(),
        risk: z.string().nullable().optional(),
        nextValidation: z.date().nullable().optional(),
        dueDate: z.date().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const mission = await updateRocketMission(input);
        return { success: true, message: 'Missão Rocket editada com persistência', data: mission };
      }),
    subsystems: protectedProcedure.query(async ({ ctx }) => {
      const teamType = (ctx.user as any)?.teamType;
      requireTeamType(teamType, ['innovare_team', 'rocket_team']);
      return getRocketSubsystems();
    }),
    updateSubsystemProgress: protectedProcedure
      .input(z.object({
        subsystemId: z.number().int().positive(),
        progress: z.number().int().min(0).max(100),
        status: z.enum(['planejamento', 'desenvolvimento', 'teste', 'validacao', 'concluido']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const updated = await updateRocketSubsystemProgress(input.subsystemId, input.progress, input.status);
        if (!updated) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Não foi possível atualizar o progresso do subsistema Rocket' });
        return { success: true, message: 'Progresso do subsistema Rocket atualizado com persistência', data: updated };
      }),
    tasksBySubsystem: protectedProcedure
      .input(z.object({ subsystemId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team', 'rocket_team']);
        return getRocketTasks(input.subsystemId);
      }),
    messagesBySubsystem: protectedProcedure
      .input(z.object({ subsystemId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team', 'rocket_team']);
        return getRocketMessages(input.subsystemId);
      }),
    notificationHistory: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(20).optional() }).optional())
      .query(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team', 'rocket_team']);
        return getRocketNotificationHistory(input?.limit ?? 8);
      }),
    createTask: protectedProcedure
      .input(z.object({
        subsystemId: z.number().int().positive(),
        title: z.string().min(1),
        description: z.string().optional(),
        assignedToId: z.number().int().positive().optional(),
        priority: z.enum(['baixa', 'media', 'alta', 'critica']).optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team']);
        const created = await createRocketTask(input.subsystemId, input.title, input.description ?? '', ctx.user.id, input.assignedToId, input.priority ?? 'media', input.dueDate);
        return { success: true, message: 'Demanda Rocket criada com persistência', data: created };
      }),
    createDelivery: protectedProcedure
      .input(z.object({
        subsystemId: z.number().int().positive(),
        title: z.string().min(1),
        submittedBy: z.string().min(1),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team', 'rocket_team']);
        const created = await createRocketTask(input.subsystemId, `Entrega para revisão: ${input.title}`, input.notes || `Entrega submetida por ${input.submittedBy}`, ctx.user.id, undefined, 'alta', undefined);
        return { success: true, message: 'Entrega Rocket submetida com persistência', data: created };
      }),
    updateTaskStatus: protectedProcedure
      .input(z.object({
        taskId: z.number().int().positive(),
        status: z.enum(['pendente', 'em_progresso', 'concluida', 'bloqueada']),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team', 'rocket_team']);
        const success = await updateRocketTaskStatus(input.taskId, input.status, input.status === 'concluida' ? ctx.user.id : undefined);
        if (!success) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Não foi possível atualizar a tarefa Rocket' });
        return { success: true, message: 'Status Rocket atualizado' };
      }),
    reviewDelivery: protectedProcedure
      .input(z.object({
        deliveryId: z.number().int().positive(),
        status: z.enum(['aprovado', 'reprovado', 'ajustes']),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team', 'rocket_team']);
        const mappedStatus = input.status === 'aprovado' ? 'concluida' : input.status === 'reprovado' ? 'bloqueada' : 'em_progresso';
        const success = await updateRocketTaskStatus(input.deliveryId, mappedStatus, input.status === 'aprovado' ? ctx.user.id : undefined);
        if (!success) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Não foi possível revisar a entrega Rocket' });
        return { success: true, message: `Entrega Rocket ${input.status}` };
      }),
    createMessage: protectedProcedure
      .input(z.object({
        subsystemId: z.number().int().positive(),
        content: z.string().min(1),
        messageType: z.enum(['instrucao', 'status', 'resposta', 'comentario']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamType = (ctx.user as any)?.teamType;
        requireTeamType(teamType, ['innovare_team', 'rocket_team']);
        const created = await createRocketMessage(input.subsystemId, ctx.user.id, input.content, input.messageType ?? 'comentario');
        return { success: true, message: 'Mensagem Rocket criada com persistência', data: created };
      }),
  }),

  // People (Innovare Team only)
  people: router({
    competencies: protectedProcedure.query(async ({ ctx }) => {
      const teamType = (ctx.user as any)?.teamType;
      requireTeamType(teamType, ['innovare_team']);
      return getCompetenciesByUser(ctx.user.id);
    }),
  }),

  // Admin (Innovare Team Admins only)
  admin: router({
    users: protectedProcedure.query(async ({ ctx }) => {
      const role = (ctx.user as any)?.role;
      const teamType = (ctx.user as any)?.teamType;
      
      if (teamType !== 'innovare_team' || role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas admins podem acessar' });
      }
      
      return getAllLocalUsers();
    }),

    create: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string(),
        teamType: z.enum(['innovare_team', 'rocket_team']),
        role: z.enum(['user', 'admin']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const role = (ctx.user as any)?.role;
        const teamType = (ctx.user as any)?.teamType;
        
        if (teamType !== 'innovare_team' || role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas admins podem criar usuários' });
        }

        const user = await createLocalUser(input);
        if (!user) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao criar usuário' });
        }

        return user;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const role = (ctx.user as any)?.role;
        const teamType = (ctx.user as any)?.teamType;
        
        if (teamType !== 'innovare_team' || role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas admins podem deletar usuários' });
        }

        const success = await deleteLocalUser(input.id);
        if (!success) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao deletar usuário' });
        }

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
