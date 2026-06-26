import { useMemo, useState, type DragEvent } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type EventType = "reuniao" | "treinamento" | "apresentacao" | "workshop" | "outro";
type EventStatus = "planejado" | "confirmado" | "em_andamento" | "concluido" | "cancelado";
type PeriodFilter = "all" | "future" | "past";
type CalendarView = "month" | "week" | "year";

interface CalendarEvent {
  id: number | string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  type: EventType;
  location: string;
  organizerId?: number;
  status?: EventStatus;
  createdAt?: string;
  source: "db";
  participantIds: number[];
}

const EVENT_TYPES: Record<EventType, { label: string; color: string }> = {
  reuniao: { label: "Reunião", color: "bg-blue-500" },
  treinamento: { label: "Treinamento", color: "bg-purple-500" },
  apresentacao: { label: "Apresentação", color: "bg-cyan-500" },
  workshop: { label: "Workshop", color: "bg-orange-500" },
  outro: { label: "Outro", color: "bg-gray-500" },
};

const INITIAL_FORM = {
  title: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  startTime: "09:00",
  endTime: "10:00",
  type: "reuniao" as EventType,
  location: "",
  participants: "",
};

function toDate(value: Date | string | number | null | undefined) {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
}

function toDateInput(value: Date | string | number | null | undefined) {
  const date = toDate(value);
  return date.toISOString().split("T")[0];
}

function toTimeInput(value: Date | string | number | null | undefined) {
  const date = toDate(value);
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function combineDateAndTime(date: string, time: string) {
  return new Date(`${date}T${time || "00:00"}:00`);
}

function parseParticipantIds(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((id) => Number.isInteger(id) && id > 0)
    )
  );
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [filterType, setFilterType] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [participantFilter, setParticipantFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedEventId, setDraggedEventId] = useState<number | string | null>(null);

  const utils = trpc.useUtils();
  const eventsQuery = trpc.events.list.useQuery();
  const resourcesQuery = trpc.resources.list.useQuery();
  const createEventMutation = trpc.events.create.useMutation({
    onSuccess: async (result) => {
      await utils.events.list.invalidate();
      toast.success(`Evento "${result.data.title}" criado com sucesso.`);
      setShowForm(false);
      setFormData({ ...INITIAL_FORM, date: new Date().toISOString().split("T")[0] });
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível criar o evento.");
    },
  });
  const removeEventMutation = trpc.events.remove.useMutation({
    onSuccess: async () => {
      await utils.events.list.invalidate();
      toast.success("Evento removido com sucesso.");
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível remover o evento.");
    },
  });
  const updateScheduleMutation = trpc.events.updateSchedule.useMutation({
    onSuccess: async (result) => {
      await utils.events.list.invalidate();
      toast.success(`Evento "${result.data.title}" reagendado com sucesso.`);
      setDraggedEventId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível reagendar o evento.");
      setDraggedEventId(null);
    },
  });

  const persistentEvents = useMemo<CalendarEvent[]>(() => {
    return (eventsQuery.data ?? []).map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description ?? "",
      date: toDateInput(event.startDate),
      startTime: toTimeInput(event.startDate),
      endTime: toTimeInput(event.endDate),
      type: (event.type ?? "reuniao") as EventType,
      location: event.location ?? "",
      organizerId: event.organizerId,
      status: (event.status ?? "planejado") as EventStatus,
      createdAt: event.createdAt ? toDate(event.createdAt).toISOString() : undefined,
      source: "db",
      participantIds: Array.isArray((event as any).participantIds) ? (event as any).participantIds : [],
    }));
  }, [eventsQuery.data]);

  const resources = useMemo(() => resourcesQuery.data ?? [], [resourcesQuery.data]);
  const events = persistentEvents;

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousPeriod = () => {
    if (calendarView === "year") {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
      return;
    }

    if (calendarView === "week") {
      const previousWeek = new Date(currentDate);
      previousWeek.setDate(currentDate.getDate() - 7);
      setCurrentDate(previousWeek);
      return;
    }

    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextPeriod = () => {
    if (calendarView === "year") {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
      return;
    }

    if (calendarView === "week") {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextWeek);
      return;
    }

    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateEvent = () => {
    if (!formData.title || !formData.date) {
      toast.error("Preencha título e data do evento.");
      return;
    }

    const startDate = combineDateAndTime(formData.date, formData.startTime);
    const endDate = combineDateAndTime(formData.date, formData.endTime);
    if (endDate < startDate) {
      toast.error("A hora final deve ser posterior à hora inicial.");
      return;
    }

    const participantIds = parseParticipantIds(formData.participants);
    createEventMutation.mutate({
      title: formData.title,
      description: formData.description || null,
      type: formData.type,
      startDate,
      endDate,
      location: formData.location || null,
      participantIds,
      status: "planejado",
    });
  };

  const handleDeleteEvent = (id: number | string) => {
    if (typeof id !== "number") return;
    removeEventMutation.mutate({ id });
  };

  const handleDragStart = (event: CalendarEvent, dragEvent: DragEvent<HTMLDivElement>) => {
    if (typeof event.id !== "number" || updateScheduleMutation.isPending) return;
    setDraggedEventId(event.id);
    dragEvent.dataTransfer.setData("text/plain", String(event.id));
    dragEvent.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (dragEvent: DragEvent<HTMLDivElement>) => {
    if (!draggedEventId || updateScheduleMutation.isPending) return;
    dragEvent.preventDefault();
    dragEvent.dataTransfer.dropEffect = "move";
  };

  const handleDropEvent = (targetDate: string, dragEvent: DragEvent<HTMLDivElement>) => {
    dragEvent.preventDefault();
    const rawEventId = dragEvent.dataTransfer.getData("text/plain");
    const numericEventId = Number(rawEventId || draggedEventId);
    const eventToMove = events.find((event) => event.id === numericEventId);
    if (!eventToMove || typeof eventToMove.id !== "number") {
      setDraggedEventId(null);
      return;
    }

    if (eventToMove.date === targetDate) {
      toast.info("O evento já está nesta data.");
      setDraggedEventId(null);
      return;
    }

    const startDate = combineDateAndTime(targetDate, eventToMove.startTime);
    const endDate = combineDateAndTime(targetDate, eventToMove.endTime);
    if (endDate < startDate) {
      toast.error("Não foi possível reagendar eventos com término anterior ao início.");
      setDraggedEventId(null);
      return;
    }

    updateScheduleMutation.mutate({ id: eventToMove.id, startDate, endDate });
  };

  const todayKey = new Date().toISOString().split("T")[0];

  const participantOptions = useMemo(() => {
    return Array.from(new Set(events.flatMap((event) => event.participantIds))).sort((a, b) => a - b);
  }, [events]);

  const normalizeText = (value: string | null | undefined) => value?.toLowerCase().trim() ?? "";

  const resourceMatchesEvent = (event: CalendarEvent, selectedResourceId: string) => {
    if (selectedResourceId === "all") return true;
    const resource = resources.find((item) => String(item.id) === selectedResourceId);
    if (!resource) return false;

    const haystack = [event.title, event.description, event.location]
      .map(normalizeText)
      .join(" ");
    const needles = [resource.name, resource.category, resource.location]
      .map(normalizeText)
      .filter(Boolean);

    return needles.some((needle) => haystack.includes(needle));
  };

  const eventHistoryStats = useMemo(() => {
    return events.reduce(
      (acc, event) => {
        if (event.date < todayKey) acc.past += 1;
        else acc.future += 1;
        return acc;
      },
      { total: events.length, future: 0, past: 0 }
    );
  }, [events, todayKey]);

  const filteredEvents = events.filter((event) => {
    const matchesType = filterType === "all" || event.type === filterType;
    const matchesPeriod =
      periodFilter === "all" ||
      (periodFilter === "future" && event.date >= todayKey) ||
      (periodFilter === "past" && event.date < todayKey);
    const matchesParticipant =
      participantFilter === "all" || event.participantIds.includes(Number(participantFilter));
    const matchesResource = resourceMatchesEvent(event, resourceFilter);
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [event.title, event.description, event.location, EVENT_TYPES[event.type].label]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));

    return matchesType && matchesPeriod && matchesParticipant && matchesResource && matchesSearch;
  });

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const getEventsForDateKey = (dateKey: string) => filteredEvents.filter((event) => event.date === dateKey);

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return getEventsForDateKey(dateStr);
  };

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return Array.from({ length: 7 }, (_, index) => {
      const weekDate = new Date(start);
      weekDate.setDate(start.getDate() + index);
      return weekDate;
    });
  };

  const renderEventChip = (event: CalendarEvent) => (
    <div
      key={event.id}
      draggable={typeof event.id === "number" && !updateScheduleMutation.isPending}
      onDragStart={(dragEvent) => handleDragStart(event, dragEvent)}
      onDragEnd={() => setDraggedEventId(null)}
      className={`text-xs px-2 py-1 rounded text-white truncate cursor-grab active:cursor-grabbing hover:opacity-80 ${EVENT_TYPES[event.type].color} ${draggedEventId === event.id ? "opacity-50 ring-2 ring-white/60" : ""}`}
      title={`${event.title} — arraste para outro dia para reagendar`}
      aria-label={`Arrastar evento ${event.title} para reagendar`}
    >
      {event.startTime} - {event.title}
    </div>
  );

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 bg-gray-900/30 border border-gray-700/30" />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isToday =
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          onDragOver={handleDragOver}
          onDrop={(dragEvent) => handleDropEvent(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`, dragEvent)}
          className={`h-24 border border-gray-700/30 p-2 overflow-hidden ${
            isToday ? "bg-cyan-500/10 border-cyan-500/50" : "bg-gray-900/20 hover:bg-gray-900/40"
          } ${draggedEventId ? "ring-1 ring-cyan-400/30" : ""} transition-colors`}
        >
          <div className={`font-bold text-sm ${isToday ? "text-cyan-400" : "text-gray-300"}`}>
            {day}
          </div>
          <div className="space-y-1 mt-1">
            {dayEvents.slice(0, 2).map(renderEventChip)}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-400">+{dayEvents.length - 2} mais</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderWeekCalendar = () => {
    const today = formatDateKey(new Date());
    return getWeekDates(currentDate).map((date) => {
      const dateKey = formatDateKey(date);
      const dayEvents = getEventsForDateKey(dateKey);
      const isToday = dateKey === today;

      return (
        <div
          key={dateKey}
          onDragOver={handleDragOver}
          onDrop={(dragEvent) => handleDropEvent(dateKey, dragEvent)}
          className={`min-h-40 border border-gray-700/30 p-3 ${
            isToday ? "bg-cyan-500/10 border-cyan-500/50" : "bg-gray-900/20 hover:bg-gray-900/40"
          } ${draggedEventId ? "ring-1 ring-cyan-400/30" : ""} transition-colors`}
        >
          <div className={`font-bold text-sm ${isToday ? "text-cyan-400" : "text-gray-300"}`}>
            {date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
          </div>
          <div className="space-y-1 mt-2">
            {dayEvents.length === 0 ? (
              <p className="text-xs text-gray-500">Sem eventos</p>
            ) : (
              dayEvents.slice(0, 5).map(renderEventChip)
            )}
            {dayEvents.length > 5 && (
              <div className="text-xs text-gray-400">+{dayEvents.length - 5} mais</div>
            )}
          </div>
        </div>
      );
    });
  };

  const renderYearCalendar = () => {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const monthDate = new Date(currentDate.getFullYear(), monthIndex, 1);
      const monthEvents = filteredEvents.filter((event) => {
        const eventDate = new Date(event.date + "T00:00:00");
        return eventDate.getFullYear() === currentDate.getFullYear() && eventDate.getMonth() === monthIndex;
      });

      return (
        <div key={monthIndex} className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-4 min-h-32">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-semibold text-cyan-300 capitalize">
              {monthDate.toLocaleDateString("pt-BR", { month: "long" })}
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-cyan-950/60 text-cyan-200 border border-cyan-500/30">
              {monthEvents.length} evento{monthEvents.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="space-y-2">
            {monthEvents.length === 0 ? (
              <p className="text-xs text-gray-500">Sem eventos filtrados</p>
            ) : (
              monthEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="text-xs text-gray-300 truncate">
                  <span className="text-cyan-400">{new Date(event.date + "T00:00:00").getDate().toString().padStart(2, "0")}</span> · {event.title}
                </div>
              ))
            )}
            {monthEvents.length > 3 && (
              <div className="text-xs text-gray-400">+{monthEvents.length - 3} eventos</div>
            )}
          </div>
        </div>
      );
    });
  };

  const monthName = currentDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const weekRangeLabel = getWeekDates(currentDate)
    .map((date, index) => index === 0 || index === 6 ? date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : null)
    .filter(Boolean)
    .join(" – ");

  const calendarTitle =
    calendarView === "year" ? String(currentDate.getFullYear()) : calendarView === "week" ? `Semana ${weekRangeLabel}` : monthName;

  const isMutating = createEventMutation.isPending || removeEventMutation.isPending || updateScheduleMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Calendário</h1>
            <p className="text-sm text-gray-400 mt-1">Eventos, reuniões e marcos internos persistidos no Innovare OS.</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo evento
          </Button>
        </div>

        {eventsQuery.isLoading && (
          <Card className="bg-gray-900/50 border-cyan-500/30 p-4 text-cyan-200 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando eventos persistidos...
          </Card>
        )}

        {eventsQuery.isError && (
          <Card className="bg-red-950/30 border-red-500/40 p-4 text-red-200">
            Não foi possível carregar os eventos persistidos. A visualização demonstrativa permanece disponível para referência.
          </Card>
        )}

        {showForm && (
          <Card className="bg-gray-900/50 border-gray-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Criar novo evento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Título *</Label>
                <Input
                  placeholder="Ex: Reunião com cliente"
                  value={formData.title}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Tipo de evento *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as EventType })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {Object.entries(EVENT_TYPES).map(([key, value]) => (
                      <SelectItem key={key} value={key} className="text-white">
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Data *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(event) => setFormData({ ...formData, date: event.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Local</Label>
                <Input
                  placeholder="Ex: Sala de reunião"
                  value={formData.location}
                  onChange={(event) => setFormData({ ...formData, location: event.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Hora inicial</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(event) => setFormData({ ...formData, startTime: event.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Hora final</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(event) => setFormData({ ...formData, endTime: event.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-gray-300">Descrição</Label>
                <Input
                  placeholder="Detalhes do evento"
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-gray-300">IDs dos participantes, separados por vírgula</Label>
                <Input
                  placeholder="Ex: 1, 2, 3"
                  value={formData.participants}
                  onChange={(event) => setFormData({ ...formData, participants: event.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">O criador autenticado é incluído automaticamente como organizador confirmado.</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleCreateEvent}
                disabled={createEventMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {createEventMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar evento
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="bg-gray-900/50 border-gray-700/50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Total persistido</p>
            <p className="text-2xl font-bold text-white">{eventHistoryStats.total}</p>
          </Card>
          <Card className="bg-cyan-950/30 border-cyan-500/30 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Próximos eventos</p>
            <p className="text-2xl font-bold text-cyan-200">{eventHistoryStats.future}</p>
          </Card>
          <Card className="bg-orange-950/30 border-orange-500/30 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-300/70">Histórico passado</p>
            <p className="text-2xl font-bold text-orange-200">{eventHistoryStats.past}</p>
          </Card>
        </div>

        <div className="flex justify-between items-center bg-gray-900/50 border border-gray-700/50 p-4 rounded-lg flex-wrap gap-4">
          <div className="flex gap-2">
            <Button
              onClick={previousPeriod}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={goToToday}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Hoje
            </Button>
            <Button
              onClick={nextPeriod}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-lg font-bold text-cyan-400 capitalize">{calendarTitle}</div>

          <div className="flex flex-wrap gap-2 justify-end">
            <Select value={calendarView} onValueChange={(value) => setCalendarView(value as CalendarView)}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="month" className="text-white">Visão mensal</SelectItem>
                <SelectItem value="week" className="text-white">Visão semanal</SelectItem>
                <SelectItem value="year" className="text-white">Visão anual</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar por título, local ou descrição"
              className="w-64 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
            <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as PeriodFilter)}>
              <SelectTrigger className="w-44 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">Todos os períodos</SelectItem>
                <SelectItem value="future" className="text-white">Futuros</SelectItem>
                <SelectItem value="past" className="text-white">Passados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-44 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">
                  Todos os tipos
                </SelectItem>
                {Object.entries(EVENT_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={key} className="text-white">
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={participantFilter} onValueChange={setParticipantFilter}>
              <SelectTrigger className="w-44 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">Todos os participantes</SelectItem>
                {participantOptions.map((participantId) => (
                  <SelectItem key={participantId} value={String(participantId)} className="text-white">
                    Participante #{participantId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">Todos os recursos</SelectItem>
                {resources.map((resource) => (
                  <SelectItem key={resource.id} value={String(resource.id)} className="text-white">
                    {resource.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          {calendarView === "year" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {renderYearCalendar()}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-0 mb-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                  <div key={day} className="text-center font-bold text-cyan-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0 border border-gray-700/30">
                {calendarView === "week" ? renderWeekCalendar() : renderCalendar()}
              </div>
            </>
          )}
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-6">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-white">
              Eventos ({filteredEvents.length})
            </h2>
            <p className="text-sm text-gray-400">Filtro atual: {periodFilter === "all" ? "todos os períodos" : periodFilter === "future" ? "eventos futuros" : "eventos passados"}</p>
          </div>

          {filteredEvents.length === 0 ? (
            <p className="text-gray-400">Nenhum evento encontrado para os filtros selecionados.</p>
          ) : (
            <div className="space-y-3">
              {[...filteredEvents]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border-l-4 ${EVENT_TYPES[event.type].color} bg-gray-800/50 border-gray-700/50`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-white">{event.title}</h3>
                          {event.status && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/70 text-cyan-200 border border-cyan-500/30">
                              {event.status.replace("_", " ")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {new Date(`${event.date}T00:00:00`).toLocaleDateString("pt-BR")} • {event.startTime} - {event.endTime}
                        </p>
                        {event.description && (
                          <p className="text-sm text-gray-300 mt-1">{event.description}</p>
                        )}
                        {event.location && (
                          <p className="text-sm text-gray-400">Local: {event.location}</p>
                        )}
                        {event.organizerId && (
                          <p className="text-xs text-gray-500">Organizador interno: usuário #{event.organizerId}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleDeleteEvent(event.id)}
                        variant="destructive"
                        size="sm"
                        disabled={isMutating}
                        className="ml-2"
                      >
                        {removeEventMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <h3 className="font-bold text-white mb-2">Legenda de cores</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(EVENT_TYPES).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${value.color}`} />
                <span className="text-sm text-gray-300">{value.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
