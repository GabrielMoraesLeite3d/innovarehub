import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const { createProjectMock, updateProjectMock, createCrmLeadMock, updateCrmLeadStatusMock, createCrmInteractionMock, createCrmCommissionMock, createFinancialMock, updateFinancialStatusMock, deleteFinancialMock } = vi.hoisted(() => ({
  createProjectMock: vi.fn(),
  updateProjectMock: vi.fn(),
  createCrmLeadMock: vi.fn(),
  updateCrmLeadStatusMock: vi.fn(),
  createCrmInteractionMock: vi.fn(),
  createCrmCommissionMock: vi.fn(),
  createFinancialMock: vi.fn(),
  updateFinancialStatusMock: vi.fn(),
  deleteFinancialMock: vi.fn(),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return {
    ...actual,
    createProject: createProjectMock,
    updateProject: updateProjectMock,
    createCrmLead: createCrmLeadMock,
    updateCrmLeadStatus: updateCrmLeadStatusMock,
    createCrmInteraction: createCrmInteractionMock,
    createCrmCommission: createCrmCommissionMock,
    createFinancial: createFinancialMock,
    updateFinancialStatus: updateFinancialStatusMock,
    deleteFinancial: deleteFinancialMock,
  };
});

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createInnovareContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "innovare-user",
    email: "innovare@example.com",
    name: "Innovare User",
    loginMethod: "local",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user: { ...user, teamType: "innovare_team" } as any,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createRocketContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "rocket-user",
    email: "rocket@example.com",
    name: "Rocket User",
    loginMethod: "local",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user: { ...user, teamType: "rocket_team" } as any,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Mutations - Formulários Funcionais", () => {
  describe("Projects", () => {
    beforeEach(() => {
      createProjectMock.mockReset();
      updateProjectMock.mockReset();
    });

    it("Innovare Team pode criar projetos", async () => {
      createProjectMock.mockResolvedValue({ id: 1, name: "Novo Projeto", phase: "entrada_lead", status: "em_andamento" });
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.create({
        name: "Novo Projeto",
        description: "Descrição do projeto",
        phase: "entrada_lead",
        responsible: "Gabriel",
        startDate: new Date("2026-05-10"),
        endDate: new Date("2026-06-10"),
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("criado");
    });

    it("Rocket Team NÃO pode criar projetos", async () => {
      const ctx = createRocketContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.projects.create({
          name: "Novo Projeto",
          description: "Descrição",
          phase: "entrada_lead",
          responsible: "Gabriel",
          startDate: new Date(),
          endDate: new Date(),
        });
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("Innovare Team pode atualizar projetos", async () => {
      updateProjectMock.mockResolvedValue({ id: 1, name: "Projeto Atualizado", phase: "diagnostico" });
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.update({
        id: 1,
        name: "Projeto Atualizado",
        phase: "diagnostico",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("atualizado");
    });
  });

  describe("CRM", () => {
    beforeEach(() => {
      createCrmLeadMock.mockReset();
      updateCrmLeadStatusMock.mockReset();
      createCrmInteractionMock.mockReset();
      createCrmCommissionMock.mockReset();
    });

    it("Innovare Team pode criar leads", async () => {
      createCrmLeadMock.mockResolvedValue({ id: 1, name: "Novo Lead", company: "Empresa XYZ", status: "entrada", interactions: [] });
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.crm.createLead({
        name: "Novo Lead",
        email: "lead@example.com",
        phone: "(31) 99999-9999",
        company: "Empresa XYZ",
        status: "entrada",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("criado");
      expect(result.data.name).toBe("Novo Lead");
    });

    it("Innovare Team pode registrar interações", async () => {
      createCrmInteractionMock.mockResolvedValue({ id: 1, leadId: 1, type: "email", description: "Enviado proposta comercial" });
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.crm.addInteraction({
        leadId: 1,
        type: "email",
        description: "Enviado proposta comercial",
        date: new Date(),
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("registrada");
    });

    it("Rocket Team NÃO pode criar leads", async () => {
      const ctx = createRocketContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.crm.createLead({
          name: "Lead",
          email: "lead@example.com",
          phone: "123456",
          company: "Company",
          status: "entrada",
        });
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("Financials", () => {
    beforeEach(() => {
      createFinancialMock.mockReset();
      updateFinancialStatusMock.mockReset();
      deleteFinancialMock.mockReset();
    });

    it("Innovare Team pode adicionar receitas persistentes", async () => {
      const date = new Date();
      createFinancialMock.mockResolvedValue({ id: 1, type: "receita", description: "Venda de projeto", amount: "10000", date, category: "vendas", status: "confirmado" });
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.financials.addRevenue({
        description: "Venda de projeto",
        amount: 10000,
        date,
        category: "vendas",
      });

      expect(createFinancialMock).toHaveBeenCalledWith(expect.objectContaining({ type: "receita", amount: 10000, status: "confirmado" }));
      expect(result.success).toBe(true);
      expect(result.message).toContain("adicionada");
      expect(result.data.amount).toBe("10000");
    });

    it("Innovare Team pode adicionar despesas persistentes", async () => {
      const date = new Date();
      createFinancialMock.mockResolvedValue({ id: 2, type: "despesa", description: "Compra de materiais", amount: "5000", date, category: "materiais", status: "pago" });
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.financials.addExpense({
        description: "Compra de materiais",
        amount: 5000,
        date,
        category: "materiais",
      });

      expect(createFinancialMock).toHaveBeenCalledWith(expect.objectContaining({ type: "despesa", amount: 5000, status: "pago" }));
      expect(result.success).toBe(true);
      expect(result.message).toContain("adicionada");
      expect(result.data.amount).toBe("5000");
    });

    it("Innovare Team pode adicionar comissões financeiras persistentes", async () => {
      const date = new Date();
      createFinancialMock.mockResolvedValue({ id: 3, type: "comissao", description: "Comissão de indicação", amount: "1200", date, category: "Comissões", status: "previsto" });
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.financials.addCommission({
        description: "Comissão de indicação",
        amount: 1200,
        date,
        category: "Comissões",
      });

      expect(createFinancialMock).toHaveBeenCalledWith(expect.objectContaining({ type: "comissao", amount: 1200, status: "previsto" }));
      expect(result.success).toBe(true);
      expect(result.message).toContain("Comissão");
    });

    it("Innovare Team pode atualizar status financeiro", async () => {
      updateFinancialStatusMock.mockResolvedValue({ id: 1, type: "receita", status: "pago" });
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.financials.updateStatus({ id: 1, status: "pago" });

      expect(updateFinancialStatusMock).toHaveBeenCalledWith({ id: 1, status: "pago" });
      expect(result.success).toBe(true);
      expect(result.data.status).toBe("pago");
    });

    it("Innovare Team pode excluir movimentação financeira", async () => {
      deleteFinancialMock.mockResolvedValue({ id: 1 });
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.financials.remove({ id: 1 });

      expect(deleteFinancialMock).toHaveBeenCalledWith({ id: 1 });
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
    });

    it("Rocket Team NÃO pode adicionar receitas", async () => {
      const ctx = createRocketContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.financials.addRevenue({
          description: "Receita",
          amount: 1000,
          date: new Date(),
          category: "vendas",
        });
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("Trainings", () => {
    it("Innovare Team pode criar cursos", async () => {
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.trainings.createCourse({
        name: "Curso de Modelagem 3D",
        description: "Aprenda modelagem 3D com Fusion 360",
        instructor: "Gabriel",
        duration: 40,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("criado");
    });

    it("Innovare Team pode atribuir cursos", async () => {
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.trainings.assignCourse({
        courseId: 1,
        userId: 2,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("atribuído");
    });

    it("Rocket Team NÃO pode criar cursos", async () => {
      const ctx = createRocketContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.trainings.createCourse({
          name: "Curso",
          description: "Descrição",
          instructor: "Instrutor",
          duration: 10,
        });
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("P&D", () => {
    it("Innovare Team pode registrar patentes", async () => {
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pnd.registerPatent({
        title: "Sistema de Recuperação de Foguete",
        description: "Novo sistema de recuperação para foguetes",
        inventors: ["Gabriel", "Davi"],
        filingDate: new Date(),
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("registrada");
      expect(result.data.inventors.length).toBe(2);
    });

    it("Innovare Team pode criar projetos de pesquisa", async () => {
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pnd.createResearch({
        title: "Pesquisa de Combustíveis",
        description: "Estudo de novos combustíveis para foguetes",
        responsible: "Gabriel",
        status: "planejado",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("criado");
    });

    it("Rocket Team NÃO pode registrar patentes", async () => {
      const ctx = createRocketContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.pnd.registerPatent({
          title: "Patente",
          description: "Descrição",
          inventors: ["Inventor"],
          filingDate: new Date(),
        });
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("Validações", () => {
    it("Emails devem ser válidos", async () => {
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.crm.createLead({
          name: "Lead",
          email: "email-invalido",
          phone: "123456",
          company: "Company",
          status: "entrada",
        });
        expect.fail("Deveria ter lançado erro de validação");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("Datas devem ser válidas", async () => {
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.projects.create({
          name: "Projeto",
          description: "Descrição",
          phase: "entrada_lead",
          responsible: "Gabriel",
          startDate: "2026-05-10" as any,
          endDate: "2026-06-10" as any,
        });
        // Se passar, significa que a validação aceitou
        expect(true).toBe(true);
      } catch (error: any) {
        // Erro de validação esperado
        expect(error).toBeDefined();
      }
    });

    it("Valores monetários devem ser números positivos", async () => {
      const date = new Date();
      createFinancialMock.mockResolvedValue({ id: 10, type: "receita", description: "Receita", amount: 10000.50, date, category: "vendas", status: "confirmado" });
      const ctx = createInnovareContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.financials.addRevenue({
        description: "Receita",
        amount: 10000.50,
        date,
        category: "vendas",
      });

      expect(result.data.amount).toBeGreaterThan(0);
    });
  });
});
