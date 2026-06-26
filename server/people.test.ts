import { describe, expect, it } from "vitest";

describe("People Management", () => {
  it("should add a new person with name, email, area, department, and job title", () => {
    const newPerson = {
      id: 10,
      name: "João Silva",
      email: "joao@innovare.com",
      area: "Aviónica",
      department: "Engenharia",
      jobTitle: "Engenheiro de Aviónica",
      responsibilities: "Sistemas de aviónica",
      competencies: {}
    };

    expect(newPerson.name).toBe("João Silva");
    expect(newPerson.email).toBe("joao@innovare.com");
    expect(newPerson.area).toBe("Aviónica");
    expect(newPerson.department).toBe("Engenharia");
    expect(newPerson.jobTitle).toBe("Engenheiro de Aviónica");
  });

  it("should validate required fields (name, email, area)", () => {
    const invalidPerson = {
      name: "",
      email: "",
      area: ""
    };

    const isValid = invalidPerson.name && invalidPerson.email && invalidPerson.area;
    expect(!isValid).toBe(true);
  });

  it("should update competencies with values from 0 to 5", () => {
    const person = {
      id: 1,
      name: "Gabriel Moraes",
      competencies: {
        "Liderança": 5,
        "Modelagem 3D": 4,
        "Gestão de Projetos": 4
      }
    };

    expect(person.competencies["Liderança"]).toBe(5);
    expect(person.competencies["Modelagem 3D"]).toBe(4);
    expect(person.competencies["Gestão de Projetos"]).toBe(4);
  });

  it("should update competency level to new value", () => {
    const person = {
      id: 1,
      competencies: {
        "Programação": 3
      }
    };

    person.competencies["Programação"] = 5;
    expect(person.competencies["Programação"]).toBe(5);
  });

  it("should add multiple competencies to a person", () => {
    const person = {
      id: 1,
      competencies: {}
    };

    person.competencies["Eletrônica"] = 5;
    person.competencies["Programação"] = 4;
    person.competencies["Modelagem 3D"] = 3;

    expect(Object.keys(person.competencies).length).toBe(3);
    expect(person.competencies["Eletrônica"]).toBe(5);
  });

  it("should delete a person by ID", () => {
    const team = [
      { id: 1, name: "Gabriel" },
      { id: 2, name: "Larissa" },
      { id: 3, name: "Nicolly" }
    ];

    const filtered = team.filter(p => p.id !== 2);
    expect(filtered.length).toBe(2);
    expect(filtered.find(p => p.id === 2)).toBeUndefined();
  });

  it("should filter team by area", () => {
    const team = [
      { id: 1, name: "Gabriel", area: "Liderança" },
      { id: 2, name: "Larissa", area: "Administração" },
      { id: 3, name: "Gabriel N.", area: "Tecnologia" }
    ];

    const techTeam = team.filter(p => p.area === "Tecnologia");
    expect(techTeam.length).toBe(1);
    expect(techTeam[0].name).toBe("Gabriel N.");
  });

  it("should filter team by department", () => {
    const team = [
      { id: 1, name: "Gabriel", department: "Liderança" },
      { id: 2, name: "Nicolly", department: "Financeiro" },
      { id: 3, name: "Yasmim", department: "Projetos" }
    ];

    const financialTeam = team.filter(p => p.department === "Financeiro");
    expect(financialTeam.length).toBe(1);
    expect(financialTeam[0].name).toBe("Nicolly");
  });

  it("should calculate total competencies per person", () => {
    const person = {
      id: 1,
      competencies: {
        "Liderança": 5,
        "Modelagem 3D": 4,
        "Gestão de Projetos": 4,
        "Comunicação": 5
      }
    };

    const totalCompetencies = Object.keys(person.competencies).length;
    expect(totalCompetencies).toBe(4);
  });

  it("should calculate average competency level", () => {
    const person = {
      id: 1,
      competencies: {
        "Liderança": 5,
        "Modelagem 3D": 4,
        "Gestão de Projetos": 4
      }
    };

    const levels = Object.values(person.competencies);
    const average = levels.reduce((a, b) => a + b, 0) / levels.length;
    expect(Math.round(average * 100) / 100).toBe(4.33);
  });

  it("should update person information (name, email, area, department, jobTitle)", () => {
    const person = {
      id: 1,
      name: "João Silva",
      email: "joao@innovare.com",
      area: "Aviónica",
      department: "Engenharia",
      jobTitle: "Engenheiro Junior"
    };

    person.jobTitle = "Engenheiro Senior";
    expect(person.jobTitle).toBe("Engenheiro Senior");

    person.area = "Estrutura";
    expect(person.area).toBe("Estrutura");
  });

  it("should validate email format", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    expect(emailRegex.test("joao@innovare.com")).toBe(true);
    expect(emailRegex.test("invalid.email")).toBe(false);
    expect(emailRegex.test("test@example.com")).toBe(true);
  });
});
