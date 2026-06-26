import { afterEach, describe, expect, it, vi } from 'vitest';
import { __resetDbForTests, createProject, updateProject } from './db';

describe('Projects DB helpers - banco indisponível', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    __resetDbForTests();
  });

  it('não retorna projeto sintético quando o banco está indisponível na criação', async () => {
    vi.stubEnv('DATABASE_URL', '');
    __resetDbForTests();

    await expect(createProject({
      name: 'Fallback local obrigatório',
      client: 'Gabriel',
      description: 'Sem banco, a UI deve manter localmente em vez de aceitar pseudo-persistência.',
      phase: 'entrada_lead',
      status: 'em_andamento',
      priority: 'media',
      responsibleId: null,
      internalDeadline: new Date('2026-05-10'),
      externalDeadline: new Date('2026-06-10'),
    })).rejects.toThrow('Banco de dados indisponível para criar projeto.');
  });

  it('não retorna atualização sintética quando o banco está indisponível na atualização', async () => {
    vi.stubEnv('DATABASE_URL', '');
    __resetDbForTests();

    await expect(updateProject({
      id: 99,
      phase: 'qa',
      status: 'em_andamento',
    })).rejects.toThrow('Banco de dados indisponível para atualizar projeto.');
  });
});
