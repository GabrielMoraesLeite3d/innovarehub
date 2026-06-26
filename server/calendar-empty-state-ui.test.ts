import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Calendário - estado vazio persistente na UI', () => {
  it('não injeta eventos demonstrativos quando a lista persistida está vazia', () => {
    const calendarSource = readFileSync(resolve(process.cwd(), 'client/src/pages/Calendar.tsx'), 'utf-8');

    expect(calendarSource).not.toContain('DEMO_EVENTS');
    expect(calendarSource).not.toContain('source: "demo"');
    expect(calendarSource).toContain('const events = persistentEvents;');
    expect(calendarSource).toContain('Nenhum evento encontrado para os filtros selecionados.');
  });

  it('mantém filtros de histórico, busca e contadores baseados em eventos persistidos', () => {
    const calendarSource = readFileSync(resolve(process.cwd(), 'client/src/pages/Calendar.tsx'), 'utf-8');

    expect(calendarSource).toContain('type PeriodFilter = "all" | "future" | "past";');
    expect(calendarSource).toContain('const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");');
    expect(calendarSource).toContain('const [searchQuery, setSearchQuery] = useState("");');
    expect(calendarSource).toContain('const [participantFilter, setParticipantFilter] = useState<string>("all");');
    expect(calendarSource).toContain('const [resourceFilter, setResourceFilter] = useState<string>("all");');
    expect(calendarSource).toContain('const eventHistoryStats = useMemo');
    expect(calendarSource).toContain('periodFilter === "future" && event.date >= todayKey');
    expect(calendarSource).toContain('periodFilter === "past" && event.date < todayKey');
    expect(calendarSource).toContain('Buscar por título, local ou descrição');
    expect(calendarSource).toContain('Histórico passado');
    expect(calendarSource).toContain('const resourcesQuery = trpc.resources.list.useQuery();');
    expect(calendarSource).toContain('const participantOptions = useMemo');
    expect(calendarSource).toContain('event.participantIds.includes(Number(participantFilter))');
    expect(calendarSource).toContain('const matchesResource = resourceMatchesEvent(event, resourceFilter);');
    expect(calendarSource).toContain('Todos os participantes');
    expect(calendarSource).toContain('Todos os recursos');
  });

  it('expõe visualizações mensal, semanal e anual com navegação por período', () => {
    const calendarSource = readFileSync(resolve(process.cwd(), 'client/src/pages/Calendar.tsx'), 'utf-8');

    expect(calendarSource).toContain('type CalendarView = "month" | "week" | "year";');
    expect(calendarSource).toContain('const [calendarView, setCalendarView] = useState<CalendarView>("month");');
    expect(calendarSource).toContain('const previousPeriod = () => {');
    expect(calendarSource).toContain('const nextPeriod = () => {');
    expect(calendarSource).toContain('const renderWeekCalendar = () => {');
    expect(calendarSource).toContain('const renderYearCalendar = () => {');
    expect(calendarSource).toContain('Visão mensal');
    expect(calendarSource).toContain('Visão semanal');
    expect(calendarSource).toContain('Visão anual');
    expect(calendarSource).toContain('calendarView === "week" ? renderWeekCalendar() : renderCalendar()');
    expect(calendarSource).toContain('calendarView === "year" ? String(currentDate.getFullYear())');
  });

  it('mantém fluxo de drag-and-drop para reagendar eventos persistidos via tRPC', () => {
    const calendarSource = readFileSync(resolve(process.cwd(), 'client/src/pages/Calendar.tsx'), 'utf-8');
    const routerSource = readFileSync(resolve(process.cwd(), 'server/routers.ts'), 'utf-8');

    expect(calendarSource).toContain('const [draggedEventId, setDraggedEventId]');
    expect(calendarSource).toContain('trpc.events.updateSchedule.useMutation');
    expect(calendarSource).toContain('const handleDragStart =');
    expect(calendarSource).toContain('const handleDragOver =');
    expect(calendarSource).toContain('const handleDropEvent =');
    expect(calendarSource).toContain('draggable={typeof event.id === "number"');
    expect(calendarSource).toContain('dataTransfer.setData("text/plain", String(event.id))');
    expect(calendarSource).toContain('onDrop={(dragEvent) => handleDropEvent');
    expect(calendarSource).toContain('arraste para outro dia para reagendar');
    expect(routerSource).toContain('updateSchedule: protectedProcedure');
    expect(routerSource).toContain("requireTeamType(teamType, ['innovare_team']);");
    expect(routerSource).toContain('Evento reagendado com sucesso');
  });
});
