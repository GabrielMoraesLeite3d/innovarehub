import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TrpcContext } from './_core/context';

const getResourcesMock = vi.fn();
const createResourceMock = vi.fn();
const updateResourceMock = vi.fn();
const deleteResourceMock = vi.fn();
const createResourceAssignmentMock = vi.fn();

vi.mock('./db', async () => {
  const actual = await vi.importActual<typeof import('./db')>('./db');
  return {
    ...actual,
    getResources: getResourcesMock,
    createResource: createResourceMock,
    updateResource: updateResourceMock,
    deleteResource: deleteResourceMock,
    createResourceAssignment: createResourceAssignmentMock,
  };
});

const { appRouter } = await import('./routers');

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createContext(teamType: 'innovare_team' | 'rocket_team'): TrpcContext {
  const user: AuthenticatedUser = {
    id: teamType === 'innovare_team' ? 41 : 42,
    openId: `${teamType}-resources-user`,
    email: `${teamType}-resources@example.com`,
    name: teamType === 'innovare_team' ? 'Innovare Resources User' : 'Rocket Resources User',
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

describe('Resources - persistência via tRPC', () => {
  beforeEach(() => {
    getResourcesMock.mockReset();
    createResourceMock.mockReset();
    updateResourceMock.mockReset();
    deleteResourceMock.mockReset();
    createResourceAssignmentMock.mockReset();
  });

  it('lista recursos persistentes para Innovare Team', async () => {
    getResourcesMock.mockResolvedValue([
      { id: 701, name: 'Creality K2 Pro', category: 'Impressão 3D', status: 'disponivel', location: 'Lab 1' },
    ]);

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.resources.list();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Creality K2 Pro');
    expect(getResourcesMock).toHaveBeenCalledTimes(1);
  });

  it('normaliza criação de recurso para o helper persistente', async () => {
    createResourceMock.mockResolvedValue({
      id: 702,
      name: 'Microretífica de bancada',
      category: 'Prototipagem',
      status: 'disponivel',
      location: 'Lab 2',
      notes: 'Uso controlado para acabamento fino.',
    });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.resources.create({
      name: 'Microretífica de bancada',
      category: 'Prototipagem',
      status: 'disponivel',
      location: 'Lab 2',
      notes: 'Uso controlado para acabamento fino.',
    });

    expect(result.success).toBe(true);
    expect(result.data.id).toBe(702);
    expect(createResourceMock).toHaveBeenCalledWith({
      name: 'Microretífica de bancada',
      category: 'Prototipagem',
      status: 'disponivel',
      location: 'Lab 2',
      notes: 'Uso controlado para acabamento fino.',
    });
  });

  it('encaminha atualização de status e dados para o helper persistente', async () => {
    updateResourceMock.mockResolvedValue({ id: 702, status: 'manutencao', location: 'Bancada técnica' });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.resources.update({
      id: 702,
      status: 'manutencao',
      location: 'Bancada técnica',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 702, status: 'manutencao', location: 'Bancada técnica' });
    expect(updateResourceMock).toHaveBeenCalledWith({
      id: 702,
      status: 'manutencao',
      location: 'Bancada técnica',
    });
  });

  it('remove recurso pelo helper persistente', async () => {
    deleteResourceMock.mockResolvedValue({ id: 702, deleted: true });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.resources.remove({ id: 702 });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 702, deleted: true });
    expect(deleteResourceMock).toHaveBeenCalledWith(702);
  });

  it('cria agendamento de recurso com usuário, datas e propósito', async () => {
    const startDate = new Date('2026-06-20T09:00:00');
    const endDate = new Date('2026-06-21T18:00:00');
    createResourceAssignmentMock.mockResolvedValue({
      id: 801,
      resourceId: 702,
      userId: 41,
      status: 'planejado',
      purpose: 'Protótipo funcional de saneamento.',
    });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.resources.createAssignment({
      resourceId: 702,
      userId: 41,
      startDate,
      endDate,
      purpose: 'Protótipo funcional de saneamento.',
      status: 'planejado',
    });

    expect(result.success).toBe(true);
    expect(result.data.id).toBe(801);
    expect(createResourceAssignmentMock).toHaveBeenCalledWith({
      resourceId: 702,
      userId: 41,
      startDate,
      endDate,
      purpose: 'Protótipo funcional de saneamento.',
      status: 'planejado',
    });
  });

  it('bloqueia criação de recursos para Rocket Team', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));

    await expect(caller.resources.create({
      name: 'Recurso não autorizado',
      category: 'Infraestrutura',
    })).rejects.toMatchObject({ code: 'FORBIDDEN' });

    expect(createResourceMock).not.toHaveBeenCalled();
  });
});
