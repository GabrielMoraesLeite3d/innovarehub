import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const crmSource = readFileSync(resolve(process.cwd(), 'client/src/pages/CRM.tsx'), 'utf-8');

describe('CRM lead editing UI wiring', () => {
  it('reaproveita o formulário de lead para criação e edição persistente', () => {
    expect(crmSource).toContain('editingLeadId');
    expect(crmSource).toContain('openEditLeadForm');
    expect(crmSource).toContain('Editar Lead');
    expect(crmSource).toContain('Salvar Alterações');
    expect(crmSource).toContain('updateLeadMutation.mutateAsync');
    expect(crmSource).toContain('utils.crm.leads.invalidate');
  });

  it('mantém ações explícitas de edição e arquivamento nos cards de leads', () => {
    expect(crmSource).toContain('<Edit3 className="w-4 h-4 mr-2" />');
    expect(crmSource).toContain('handleArchiveLead(lead)');
    expect(crmSource).toContain('Lead atualizado e persistido com sucesso.');
  });
});
