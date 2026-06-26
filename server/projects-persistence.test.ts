import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TrpcContext } from './_core/context';

const createProjectMock = vi.fn();
const updateProjectMock = vi.fn();

vi.mock('./db', async () => {
  const actual = await vi.importActual<typeof import('./db')>('./db');
  return {
    ...actual,
    createProject: createProjectMock,
    updateProject: updateProjectMock,
  };
});

const { appRouter } = await import('./routers');

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createContext(teamType: 'innovare_team' | 'rocket_team'): TrpcContext {
  const user: AuthenticatedUser = {
    id: teamType === 'innovare_team' ? 11 : 22,
    openId: `${teamType}-user`,
    email: `${teamType}@example.com`,
    name: teamType === 'innovare_team' ? 'Innovare User' : 'Rocket User',
    loginMethod: 'local',
    role: 'user',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    lastSignedIn: new Date('2026-01-01'),
  };

  return {
    user: { ...user, teamType } as any,
    req: { protocol: 'https', headers: {} } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };
}

describe('Projects - persistência via tRPC', () => {
  beforeEach(() => {
    createProjectMock.mockReset();
    updateProjectMock.mockReset();
  });

  it('normaliza e encaminha criação de projeto para o helper persistente', async () => {
    createProjectMock.mockResolvedValue({
      id: 101,
      name: 'Canvas Operacional',
      client: 'Gabriel',
      phase: 'entrada_lead',
      status: 'em_andamento',
      priority: 'alta',
    });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const startDate = new Date('2026-05-10');
    const endDate = new Date('2026-06-10');

    const result = await caller.projects.create({
      name: 'Canvas Operacional',
      client: 'Gabriel',
      description: 'Projeto persistente com dados completos.',
      phase: 'entrada_lead',
      status: 'em_andamento',
      priority: 'alta',
      responsible: 'Gabriel',
      startDate,
      endDate,
    });

    expect(result.success).toBe(true);
    expect(result.data.id).toBe(101);
    expect(createProjectMock).toHaveBeenCalledWith({
      name: 'Canvas Operacional',
      client: 'Gabriel',
      description: 'Projeto persistente com dados completos.',
      phase: 'entrada_lead',
      status: 'em_andamento',
      priority: 'alta',
      responsibleId: null,
      internalDeadline: startDate,
      externalDeadline: endDate,
    });
  });

  it('normaliza atualização de fase e status para o helper persistente', async () => {
    updateProjectMock.mockResolvedValue({
      id: 101,
      phase: 'pos_projeto',
      status: 'concluido',
    });

    const caller = appRouter.createCaller(createContext('innovare_team'));

    const result = await caller.projects.update({
      id: 101,
      phase: 'pos_projeto',
      status: 'concluido',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 101, phase: 'pos_projeto', status: 'concluido' });
    expect(updateProjectMock).toHaveBeenCalledWith({
      id: 101,
      name: undefined,
      client: undefined,
      description: undefined,
      phase: 'pos_projeto',
      status: 'concluido',
      priority: undefined,
      responsibleId: undefined,
      internalDeadline: undefined,
      externalDeadline: undefined,
    });
  });

  it('bloqueia criação persistente de projetos para Rocket Team', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));

    await expect(caller.projects.create({
      name: 'Projeto não autorizado',
      description: 'Rocket Team não deve criar projetos Innovare.',
      phase: 'entrada_lead',
      responsible: 'Membro Rocket',
      startDate: new Date('2026-05-10'),
      endDate: new Date('2026-06-10'),
    })).rejects.toMatchObject({ code: 'FORBIDDEN' });

    expect(createProjectMock).not.toHaveBeenCalled();
  });
});
