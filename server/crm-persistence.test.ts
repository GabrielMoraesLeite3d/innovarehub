import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TrpcContext } from './_core/context';

const { createCrmLeadMock, updateCrmLeadMock, updateCrmLeadStatusMock, createCrmInteractionMock, createCrmCommissionMock } = vi.hoisted(() => ({
  createCrmLeadMock: vi.fn(),
  updateCrmLeadMock: vi.fn(),
  updateCrmLeadStatusMock: vi.fn(),
  createCrmInteractionMock: vi.fn(),
  createCrmCommissionMock: vi.fn(),
}));

vi.mock('./db', async () => {
  const actual = await vi.importActual<typeof import('./db')>('./db');
  return {
    ...actual,
    createCrmLead: createCrmLeadMock,
    updateCrmLead: updateCrmLeadMock,
    updateCrmLeadStatus: updateCrmLeadStatusMock,
    createCrmInteraction: createCrmInteractionMock,
    createCrmCommission: createCrmCommissionMock,
  };
});

const { appRouter } = await import('./routers');

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createContext(teamType: 'innovare_team' | 'rocket_team'): TrpcContext {
  const user: AuthenticatedUser = {
    id: teamType === 'innovare_team' ? 1 : 2,
    openId: `${teamType}-user`,
    email: `${teamType}@example.com`,
    name: teamType === 'innovare_team' ? 'Innovare User' : 'Rocket User',
    loginMethod: 'local',
    role: 'user',
    teamType,
    department: 'Inovação',
    jobTitle: 'Analista',
    createdAt: new Date('2026-05-01T12:00:00.000Z'),
    updatedAt: new Date('2026-05-01T12:00:00.000Z'),
    lastSignedIn: new Date('2026-05-01T12:00:00.000Z'),
  };

  return {
    user,
    req: { protocol: 'https', headers: {} } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };
}

describe('CRM persistence via tRPC', () => {
  beforeEach(() => {
    createCrmLeadMock.mockReset();
    updateCrmLeadMock.mockReset();
    updateCrmLeadStatusMock.mockReset();
    createCrmInteractionMock.mockReset();
    createCrmCommissionMock.mockReset();
  });

  it('encaminha criação de lead com dados comerciais completos para o helper persistente', async () => {
    createCrmLeadMock.mockResolvedValue({
      id: 11,
      name: 'Lead Industrial',
      company: 'Mineração Alfa',
      status: 'entrada',
      estimatedValue: '125000',
      personInCharge: 'Gabriel',
      interactions: [],
    });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.crm.createLead({
      name: 'Lead Industrial',
      email: 'contato@mineracaoalfa.com.br',
      phone: '(31) 99999-0000',
      company: 'Mineração Alfa',
      status: 'entrada',
      estimatedValue: 125000,
      assignedTo: 'Gabriel',
    });

    expect(result.success).toBe(true);
    expect(result.data.id).toBe(11);
    expect(createCrmLeadMock).toHaveBeenCalledWith({
      name: 'Lead Industrial',
      email: 'contato@mineracaoalfa.com.br',
      phone: '(31) 99999-0000',
      company: 'Mineração Alfa',
      status: 'entrada',
      estimatedValue: 125000,
      assignedTo: 'Gabriel',
    });
  });

  it('encaminha edição completa de lead para o helper persistente', async () => {
    updateCrmLeadMock.mockResolvedValue({
      id: 11,
      name: 'Lead Industrial Revisado',
      company: 'Mineração Alfa Revisada',
      contact: 'novo@mineracaoalfa.com.br • (31) 98888-7777',
      status: 'negociacao',
      estimatedValue: '145000',
      personInCharge: 'Larissa',
      interactions: [],
    });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.crm.updateLead({
      id: 11,
      name: 'Lead Industrial Revisado',
      email: 'novo@mineracaoalfa.com.br',
      phone: '(31) 98888-7777',
      company: 'Mineração Alfa Revisada',
      status: 'negociacao',
      estimatedValue: 145000,
      assignedTo: 'Larissa',
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('atualizado');
    expect(updateCrmLeadMock).toHaveBeenCalledWith({
      id: 11,
      name: 'Lead Industrial Revisado',
      email: 'novo@mineracaoalfa.com.br',
      phone: '(31) 98888-7777',
      company: 'Mineração Alfa Revisada',
      status: 'negociacao',
      estimatedValue: 145000,
      assignedTo: 'Larissa',
    });
  });

  it('persiste atualização de status do lead sem permitir retorno apenas local', async () => {
    updateCrmLeadStatusMock.mockResolvedValue({ id: 11, status: 'virou_projeto' });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.crm.updateLeadStatus({ id: 11, status: 'virou_projeto' });

    expect(result.success).toBe(true);
    expect(result.message).toContain('atualizado');
    expect(updateCrmLeadStatusMock).toHaveBeenCalledWith({ id: 11, status: 'virou_projeto' });
  });

  it('registra interação com o usuário autenticado como responsável pela persistência', async () => {
    const interactionDate = new Date('2026-05-04T14:30:00.000Z');
    createCrmInteractionMock.mockResolvedValue({
      id: 21,
      leadId: 11,
      type: 'reuniao',
      description: 'Reunião de diagnóstico técnico',
      userId: 1,
      interactionDate,
    });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.crm.addInteraction({
      leadId: 11,
      type: 'reuniao',
      description: 'Reunião de diagnóstico técnico',
      date: interactionDate,
    });

    expect(result.success).toBe(true);
    expect(createCrmInteractionMock).toHaveBeenCalledWith({
      leadId: 11,
      type: 'reuniao',
      description: 'Reunião de diagnóstico técnico',
      date: interactionDate,
      userId: 1,
    });
  });

  it('registra comissão prevista para leads convertidos', async () => {
    createCrmCommissionMock.mockResolvedValue({
      id: 31,
      leadId: 11,
      userId: 1,
      value: '6250',
      percentage: '5',
      status: 'previsto',
    });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.crm.createCommission({
      leadId: 11,
      value: 6250,
      percentage: 5,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('Comissão');
    expect(createCrmCommissionMock).toHaveBeenCalledWith({
      leadId: 11,
      value: 6250,
      percentage: 5,
      userId: 1,
      status: 'previsto',
    });
  });

  it('bloqueia persistência CRM para usuários Rocket Team', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));

    await expect(caller.crm.createLead({
      name: 'Lead bloqueado',
      email: 'bloqueado@example.com',
      phone: '123456',
      company: 'Empresa externa',
      status: 'entrada',
      estimatedValue: 1000,
      assignedTo: 'Gabriel',
    })).rejects.toMatchObject({ code: 'FORBIDDEN' });

    expect(createCrmLeadMock).not.toHaveBeenCalled();
    expect(updateCrmLeadMock).not.toHaveBeenCalled();
  });
});
