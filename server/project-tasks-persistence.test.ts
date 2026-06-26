import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TrpcContext } from './_core/context';

const getProjectTasksMock = vi.fn();
const createProjectTaskMock = vi.fn();
const updateProjectTaskStatusMock = vi.fn();

vi.mock('./db', async () => {
  const actual = await vi.importActual<typeof import('./db')>('./db');
  return {
    ...actual,
    getProjectTasks: getProjectTasksMock,
    createProjectTask: createProjectTaskMock,
    updateProjectTaskStatus: updateProjectTaskStatusMock,
  };
});

const { appRouter } = await import('./routers');

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createContext(teamType: 'innovare_team' | 'rocket_team'): TrpcContext {
  const user: AuthenticatedUser = {
    id: teamType === 'innovare_team' ? 31 : 32,
    openId: `${teamType}-tasks-user`,
    email: `${teamType}-tasks@example.com`,
    name: teamType === 'innovare_team' ? 'Innovare Tasks User' : 'Rocket Tasks User',
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

describe('Project Tasks - persistência via tRPC', () => {
  beforeEach(() => {
    getProjectTasksMock.mockReset();
    createProjectTaskMock.mockReset();
    updateProjectTaskStatusMock.mockReset();
  });

  it('lista tarefas persistentes por projeto para Innovare Team', async () => {
    getProjectTasksMock.mockResolvedValue([
      { id: 501, projectId: 101, title: 'Validar interfaces', status: 'em_andamento', priority: 'alta' },
    ]);

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.projects.tasks({ projectId: 101 });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Validar interfaces');
    expect(getProjectTasksMock).toHaveBeenCalledWith(101);
  });

  it('normaliza criação de tarefa de projeto para o helper persistente', async () => {
    const dueDate = new Date('2026-06-14');
    createProjectTaskMock.mockResolvedValue({
      id: 502,
      projectId: 101,
      title: 'Gerar plano de fabricação',
      status: 'nao_iniciada',
      priority: 'critica',
      dueDate,
    });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.projects.createTask({
      projectId: 101,
      title: 'Gerar plano de fabricação',
      description: 'Fechar roteiro técnico e checklist de materiais.',
      assignedToId: 31,
      priority: 'critica',
      status: 'nao_iniciada',
      dueDate,
    });

    expect(result.success).toBe(true);
    expect(result.data.id).toBe(502);
    expect(createProjectTaskMock).toHaveBeenCalledWith({
      projectId: 101,
      title: 'Gerar plano de fabricação',
      description: 'Fechar roteiro técnico e checklist de materiais.',
      assignedToId: 31,
      priority: 'critica',
      status: 'nao_iniciada',
      dueDate,
    });
  });

  it('encaminha atualização de status de tarefa para o helper persistente', async () => {
    updateProjectTaskStatusMock.mockResolvedValue({ id: 502, status: 'concluida' });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.projects.updateTaskStatus({ id: 502, status: 'concluida' });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 502, status: 'concluida' });
    expect(updateProjectTaskStatusMock).toHaveBeenCalledWith({ id: 502, status: 'concluida' });
  });

  it('bloqueia tarefas de projetos para Rocket Team', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));

    await expect(caller.projects.createTask({
      projectId: 101,
      title: 'Tarefa não autorizada',
    })).rejects.toMatchObject({ code: 'FORBIDDEN' });

    expect(createProjectTaskMock).not.toHaveBeenCalled();
  });
});
