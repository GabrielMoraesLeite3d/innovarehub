import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { TrpcContext } from './_core/context';

const getAllEventsMock = vi.fn();
const createEventMock = vi.fn();
const deleteEventMock = vi.fn();
const updateEventScheduleMock = vi.fn();
const addEventParticipantMock = vi.fn();
const getEventParticipantsMock = vi.fn();

vi.mock('./db', async () => {
  const actual = await vi.importActual<typeof import('./db')>('./db');
  return {
    ...actual,
    getAllEvents: getAllEventsMock,
    createEvent: createEventMock,
    deleteEvent: deleteEventMock,
    updateEventSchedule: updateEventScheduleMock,
    addEventParticipant: addEventParticipantMock,
    getEventParticipants: getEventParticipantsMock,
  };
});

const { appRouter } = await import('./routers');

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createContext(teamType: 'innovare_team' | 'rocket_team'): TrpcContext {
  const user: AuthenticatedUser = {
    id: teamType === 'innovare_team' ? 51 : 52,
    openId: `${teamType}-events-user`,
    email: `${teamType}-events@example.com`,
    name: teamType === 'innovare_team' ? 'Innovare Events User' : 'Rocket Events User',
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

describe('Eventos e Calendário - persistência via tRPC', () => {
  beforeEach(() => {
    getAllEventsMock.mockReset();
    createEventMock.mockReset();
    deleteEventMock.mockReset();
    updateEventScheduleMock.mockReset();
    addEventParticipantMock.mockReset();
    getEventParticipantsMock.mockReset();
  });

  it('lista eventos persistentes para Innovare Team', async () => {
    getAllEventsMock.mockResolvedValue([
      {
        id: 901,
        title: 'Reunião técnica de saneamento',
        type: 'reuniao',
        startDate: new Date('2026-07-10T09:00:00'),
        endDate: new Date('2026-07-10T10:00:00'),
        organizerId: 51,
      },
    ]);

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.events.list();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Reunião técnica de saneamento');
    expect(getAllEventsMock).toHaveBeenCalledTimes(1);
  });

  it('normaliza criação de evento com organizador autenticado e participantes', async () => {
    const startDate = new Date('2026-07-10T09:00:00');
    const endDate = new Date('2026-07-10T10:30:00');
    createEventMock.mockResolvedValue({
      id: 902,
      title: 'Workshop interno de prototipagem',
      type: 'workshop',
      startDate,
      endDate,
      location: 'Laboratório Innovare',
      organizerId: 51,
      status: 'planejado',
    });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.events.create({
      title: 'Workshop interno de prototipagem',
      description: 'Alinhamento de métodos para fabricação digital.',
      type: 'workshop',
      startDate,
      endDate,
      location: 'Laboratório Innovare',
      participantIds: [11, 12],
      status: 'planejado',
    });

    expect(result.success).toBe(true);
    expect(result.data.id).toBe(902);
    expect(createEventMock).toHaveBeenCalledWith({
      title: 'Workshop interno de prototipagem',
      description: 'Alinhamento de métodos para fabricação digital.',
      type: 'workshop',
      startDate,
      endDate,
      location: 'Laboratório Innovare',
      participantIds: [11, 12],
      status: 'planejado',
      organizerId: 51,
    });
  });

  it('bloqueia criação de evento com data final anterior à inicial', async () => {
    const caller = appRouter.createCaller(createContext('innovare_team'));

    await expect(caller.events.create({
      title: 'Evento inválido',
      type: 'reuniao',
      startDate: new Date('2026-07-10T11:00:00'),
      endDate: new Date('2026-07-10T10:00:00'),
    })).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    expect(createEventMock).not.toHaveBeenCalled();
  });

  it('remove evento pelo helper persistente', async () => {
    deleteEventMock.mockResolvedValue({ id: 902, deleted: true });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.events.remove({ id: 902 });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 902, deleted: true });
    expect(deleteEventMock).toHaveBeenCalledWith(902);
  });

  it('reagenda evento persistente via mutation updateSchedule usada pelo drag-and-drop', async () => {
    const startDate = new Date('2026-07-12T09:00:00');
    const endDate = new Date('2026-07-12T10:30:00');
    updateEventScheduleMock.mockResolvedValue({
      id: 902,
      title: 'Workshop interno de prototipagem',
      type: 'workshop',
      startDate,
      endDate,
      organizerId: 51,
      status: 'planejado',
    });

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const result = await caller.events.updateSchedule({ id: 902, startDate, endDate });

    expect(result.success).toBe(true);
    expect(result.data.startDate).toEqual(startDate);
    expect(updateEventScheduleMock).toHaveBeenCalledWith({ id: 902, startDate, endDate });
  });

  it('bloqueia reagendamento com data final anterior à inicial', async () => {
    const caller = appRouter.createCaller(createContext('innovare_team'));

    await expect(caller.events.updateSchedule({
      id: 902,
      startDate: new Date('2026-07-12T11:00:00'),
      endDate: new Date('2026-07-12T10:30:00'),
    })).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    expect(updateEventScheduleMock).not.toHaveBeenCalled();
  });

  it('adiciona e lista participantes de evento com RBAC Innovare Team', async () => {
    addEventParticipantMock.mockResolvedValue({ id: 1001, eventId: 902, userId: 12, status: 'confirmado' });
    getEventParticipantsMock.mockResolvedValue([
      { id: 1001, eventId: 902, userId: 12, status: 'confirmado' },
    ]);

    const caller = appRouter.createCaller(createContext('innovare_team'));
    const added = await caller.events.addParticipant({ eventId: 902, userId: 12, status: 'confirmado' });
    const participants = await caller.events.participants({ eventId: 902 });

    expect(added.success).toBe(true);
    expect(participants).toHaveLength(1);
    expect(addEventParticipantMock).toHaveBeenCalledWith({ eventId: 902, userId: 12, status: 'confirmado' });
    expect(getEventParticipantsMock).toHaveBeenCalledWith(902);
  });

  it('bloqueia acesso a eventos para Rocket Team', async () => {
    const caller = appRouter.createCaller(createContext('rocket_team'));

    await expect(caller.events.list()).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(caller.events.create({
      title: 'Evento não autorizado',
      type: 'reuniao',
      startDate: new Date('2026-07-10T09:00:00'),
      endDate: new Date('2026-07-10T10:00:00'),
    })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(caller.events.updateSchedule({
      id: 902,
      startDate: new Date('2026-07-12T09:00:00'),
      endDate: new Date('2026-07-12T10:00:00'),
    })).rejects.toMatchObject({ code: 'FORBIDDEN' });

    expect(getAllEventsMock).not.toHaveBeenCalled();
    expect(createEventMock).not.toHaveBeenCalled();
    expect(updateEventScheduleMock).not.toHaveBeenCalled();
  });
});
