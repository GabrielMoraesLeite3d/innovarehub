import { describe, expect, it, vi, beforeEach } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

vi.mock('./db', async () => {
  const actual = await vi.importActual<typeof import('./db')>('./db');
  return {
    ...actual,
    getRocketMissions: vi.fn(async () => [{ id: 7, name: 'MG-VERA CRUZ-N1', status: 'desenvolvimento' }]),
    createRocketMission: vi.fn(async (input) => ({ id: 8, ...input })),
    updateRocketMission: vi.fn(async (input) => ({ ...input, updatedAt: new Date('2026-05-04T12:00:00.000Z') })),
    getRocketSubsystems: vi.fn(async () => [{ id: 1, name: 'Documentação' }]),
    getRocketTasks: vi.fn(async () => [{ id: 10, subsystemId: 1, title: 'Checklist LASC' }]),
    getRocketMessages: vi.fn(async () => [{ id: 20, subsystemId: 1, content: 'Mensagem' }]),
    getRocketNotificationHistory: vi.fn(async (limit = 8) => [
      { id: 'message-20', title: 'Nova mensagem Rocket', description: 'Mensagem', subsystem: 'Documentação', kind: 'mensagem', at: new Date('2026-05-04T10:00:00.000Z') },
      { id: 'progress-1', title: 'Progresso Rocket atualizado', description: 'Documentação está com 72% de avanço.', subsystem: 'Documentação', kind: 'progresso', at: new Date('2026-05-04T09:00:00.000Z') },
    ].slice(0, limit)),
    updateRocketSubsystemProgress: vi.fn(async (id: number, progress: number, status?: string) => ({ id, name: 'Documentação', progress, status })),
    createRocketTask: vi.fn(async () => ({ insertId: 33 })),
    updateRocketTaskStatus: vi.fn(async () => true),
    createRocketMessage: vi.fn(async () => ({ insertId: 44 })),
  };
});

import { createRocketMission, updateRocketMission, getRocketMissions, createRocketTask, updateRocketTaskStatus, createRocketMessage, getRocketMessages, getRocketNotificationHistory, updateRocketSubsystemProgress } from './db';

function createContext(teamType: 'innovare_team' | 'rocket_team'): TrpcContext {
  return {
    req: {} as any,
    res: { clearCookie: vi.fn() } as any,
    user: {
      id: teamType === 'innovare_team' ? 1 : 2,
      openId: `${teamType}-user`,
      email: `${teamType}@example.com`,
      name: teamType === 'innovare_team' ? 'Innovare User' : 'Rocket User',
      role: 'user',
      teamType,
    } as any,
  };
}

describe('Persistência tRPC do Innovare Rocket', () => {
  beforeEach(() => vi.clearAllMocks());


  it('lista missões Rocket persistidas para equipes autorizadas', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));
    const missions = await caller.rocket.missions();
    expect(missions).toEqual([{ id: 7, name: 'MG-VERA CRUZ-N1', status: 'desenvolvimento' }]);
    expect(getRocketMissions).toHaveBeenCalled();
  });

  it('cria missão Rocket persistente apenas para Innovare Team', async () => {
    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.rocket.createMission({
      name: 'MG-NOVA-MISSÃO',
      category: 'Foguete sólido',
      description: 'Missão incremental de validação',
      objective: '1 km',
      payload: 'LASC 2026',
      requirement: 'Gabriel, Time Rocket',
    });

    expect(result.success).toBe(true);
    expect(createRocketMission).toHaveBeenCalledWith({
      name: 'MG-NOVA-MISSÃO',
      category: 'Foguete sólido',
      description: 'Missão incremental de validação',
      objective: '1 km',
      payload: 'LASC 2026',
      requirement: 'Gabriel, Time Rocket',
      status: 'planejamento',
    });
  });

  it('bloqueia Rocket Team na criação de missões Rocket', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));
    await expect(caller.rocket.createMission({ name: 'Missão indevida' })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(createRocketMission).not.toHaveBeenCalled();
  });

  it('edita missão Rocket persistente apenas para Innovare Team', async () => {
    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.rocket.updateMission({
      id: 8,
      name: 'MG-NOVA-MISSÃO Revisada',
      category: 'CubeSat',
      objective: '2U',
      payload: 'Validação interna',
      requirement: 'Larissa, Davi',
      status: 'desenvolvimento',
    });

    expect(result.success).toBe(true);
    expect(updateRocketMission).toHaveBeenCalledWith({
      id: 8,
      name: 'MG-NOVA-MISSÃO Revisada',
      category: 'CubeSat',
      objective: '2U',
      payload: 'Validação interna',
      requirement: 'Larissa, Davi',
      status: 'desenvolvimento',
    });
  });

  it('bloqueia Rocket Team na edição de missões Rocket', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));
    await expect(caller.rocket.updateMission({ id: 8, name: 'Alteração indevida' })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(updateRocketMission).not.toHaveBeenCalled();
  });

  it('cria demanda Rocket persistente apenas para Innovare Team', async () => {
    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.rocket.createTask({ subsystemId: 1, title: 'Checklist de integração', description: 'Validar interfaces', priority: 'alta' });
    expect(result.success).toBe(true);
    expect(createRocketTask).toHaveBeenCalledWith(1, 'Checklist de integração', 'Validar interfaces', 1, undefined, 'alta', undefined);
  });

  it('bloqueia Rocket Team na criação de demandas e instruções', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));
    await expect(caller.rocket.createTask({ subsystemId: 1, title: 'Demanda indevida', description: 'Criar instrução', priority: 'alta' })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(createRocketTask).not.toHaveBeenCalled();
  });

  it('permite que Rocket Team submeta entregas para aprovação', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));
    const result = await caller.rocket.createDelivery({ subsystemId: 1, title: 'Relatório de recuperação', submittedBy: 'Rocket User', notes: 'Evidências anexadas' });
    expect(result.success).toBe(true);
    expect(createRocketTask).toHaveBeenCalledWith(1, 'Entrega para revisão: Relatório de recuperação', 'Evidências anexadas', 2, undefined, 'alta', undefined);
  });

  it('mapeia aprovação de entrega para tarefa concluída', async () => {
    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.rocket.reviewDelivery({ deliveryId: 99, status: 'aprovado' });
    expect(result.success).toBe(true);
    expect(updateRocketTaskStatus).toHaveBeenCalledWith(99, 'concluida', 1);
  });

  it('mapeia reprovação para bloqueio e ajustes para em progresso', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));
    await caller.rocket.reviewDelivery({ deliveryId: 100, status: 'reprovado' });
    await caller.rocket.reviewDelivery({ deliveryId: 101, status: 'ajustes' });
    expect(updateRocketTaskStatus).toHaveBeenCalledWith(100, 'bloqueada', undefined);
    expect(updateRocketTaskStatus).toHaveBeenCalledWith(101, 'em_progresso', undefined);
  });

  it('registra mensagem persistente de subsistema', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));
    const result = await caller.rocket.createMessage({ subsystemId: 1, content: 'Atualização de teste', messageType: 'status' });
    expect(result.success).toBe(true);
    expect(createRocketMessage).toHaveBeenCalledWith(1, 2, 'Atualização de teste', 'status');
  });

  it('persiste progresso de subsistema apenas para Innovare Team', async () => {
    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.rocket.updateSubsystemProgress({ subsystemId: 1, progress: 72, status: 'teste' });
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ id: 1, progress: 72, status: 'teste' });
    expect(updateRocketSubsystemProgress).toHaveBeenCalledWith(1, 72, 'teste');
  });

  it('bloqueia Rocket Team na atualização de progresso de subsistema', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));
    await expect(caller.rocket.updateSubsystemProgress({ subsystemId: 1, progress: 80, status: 'validacao' })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(updateRocketSubsystemProgress).not.toHaveBeenCalled();
  });

  it('consulta histórico de mensagens por subsistema Rocket', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));
    const messages = await caller.rocket.messagesBySubsystem({ subsystemId: 1 });
    expect(messages).toEqual([{ id: 20, subsystemId: 1, content: 'Mensagem' }]);
    expect(getRocketMessages).toHaveBeenCalledWith(1);
  });

  it('consulta histórico persistente/derivado de notificações Rocket para equipes autorizadas', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));
    const notifications = await caller.rocket.notificationHistory({ limit: 2 });
    expect(notifications).toHaveLength(2);
    expect(notifications[0]).toMatchObject({ id: 'message-20', title: 'Nova mensagem Rocket', kind: 'mensagem' });
    expect(getRocketNotificationHistory).toHaveBeenCalledWith(2);
  });

  it('atualiza status de demanda quando checklist muda para concluído', async () => {
    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.rocket.updateTaskStatus({ taskId: 77, status: 'concluida' });
    expect(result.success).toBe(true);
    expect(updateRocketTaskStatus).toHaveBeenCalledWith(77, 'concluida', 1);
  });
});
