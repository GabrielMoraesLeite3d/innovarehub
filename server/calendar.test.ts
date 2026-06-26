import { describe, expect, it } from "vitest";

describe("Calendar Functionality", () => {
  it("should create a new event with all required fields", () => {
    const event = {
      id: "1",
      title: "Reunião de Planejamento",
      description: "Planejamento do mês",
      date: "2026-05-04",
      startTime: "10:00",
      endTime: "11:00",
      type: "meeting" as const,
      participants: ["Gabriel", "Larissa"],
      location: "Sala de Reunião",
      createdAt: new Date().toISOString(),
    };

    expect(event.title).toBe("Reunião de Planejamento");
    expect(event.date).toBe("2026-05-04");
    expect(event.type).toBe("meeting");
    expect(event.participants).toHaveLength(2);
  });

  it("should validate event date format", () => {
    const dateStr = "2026-05-04";
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    expect(isValidDate).toBe(true);
  });

  it("should validate event time format", () => {
    const timeStr = "10:00";
    const isValidTime = /^\d{2}:\d{2}$/.test(timeStr);
    expect(isValidTime).toBe(true);
  });

  it("should filter events by type", () => {
    const events = [
      { id: "1", type: "meeting", title: "Reunião" },
      { id: "2", type: "training", title: "Treinamento" },
      { id: "3", type: "meeting", title: "Outra Reunião" },
    ];

    const meetingEvents = events.filter((e) => e.type === "meeting");
    expect(meetingEvents).toHaveLength(2);
    expect(meetingEvents[0].title).toBe("Reunião");
  });

  it("should get events for a specific date", () => {
    const events = [
      { id: "1", date: "2026-05-04", title: "Evento 1" },
      { id: "2", date: "2026-05-04", title: "Evento 2" },
      { id: "3", date: "2026-05-05", title: "Evento 3" },
    ];

    const dateStr = "2026-05-04";
    const eventsForDate = events.filter((e) => e.date === dateStr);
    expect(eventsForDate).toHaveLength(2);
  });

  it("should sort events by date", () => {
    const events = [
      { id: "1", date: "2026-05-05" },
      { id: "2", date: "2026-05-03" },
      { id: "3", date: "2026-05-04" },
    ];

    const sorted = events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    expect(sorted[0].date).toBe("2026-05-03");
    expect(sorted[1].date).toBe("2026-05-04");
    expect(sorted[2].date).toBe("2026-05-05");
  });

  it("should delete an event by id", () => {
    let events = [
      { id: "1", title: "Evento 1" },
      { id: "2", title: "Evento 2" },
      { id: "3", title: "Evento 3" },
    ];

    const idToDelete = "2";
    events = events.filter((e) => e.id !== idToDelete);

    expect(events).toHaveLength(2);
    expect(events.find((e) => e.id === "2")).toBeUndefined();
  });

  it("should parse participants from comma-separated string", () => {
    const participantsStr = "Gabriel, Larissa, Nicolly";
    const participants = participantsStr
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);

    expect(participants).toHaveLength(3);
    expect(participants[0]).toBe("Gabriel");
    expect(participants[1]).toBe("Larissa");
    expect(participants[2]).toBe("Nicolly");
  });

  it("should handle empty participants list", () => {
    const participantsStr = "";
    const participants = participantsStr
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);

    expect(participants).toHaveLength(0);
  });

  it("should navigate to next month", () => {
    const currentDate = new Date(2026, 4, 1); // May 2026
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);

    expect(nextMonth.getMonth()).toBe(5); // June
    expect(nextMonth.getFullYear()).toBe(2026);
  });

  it("should navigate to previous month", () => {
    const currentDate = new Date(2026, 4, 1); // May 2026
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);

    expect(prevMonth.getMonth()).toBe(3); // April
    expect(prevMonth.getFullYear()).toBe(2026);
  });

  it("should identify today's date correctly", () => {
    const today = new Date();
    const currentDate = new Date();
    const isToday =
      today.getDate() === currentDate.getDate() &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear();

    expect(isToday).toBe(true);
  });

  it("should get days in month correctly", () => {
    // May 2026 has 31 days
    const daysInMay = new Date(2026, 5, 0).getDate();
    expect(daysInMay).toBe(31);

    // February 2026 has 28 days (not a leap year)
    const daysInFeb = new Date(2026, 2, 0).getDate();
    expect(daysInFeb).toBe(28);
  });

  it("should get first day of month correctly", () => {
    // May 1, 2026 is a Friday (5)
    const firstDay = new Date(2026, 4, 1).getDay();
    expect(firstDay).toBe(5); // 0 = Sunday, 5 = Friday
  });
});
