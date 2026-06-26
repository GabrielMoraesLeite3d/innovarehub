import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectsSource = readFileSync(resolve(process.cwd(), 'client/src/pages/Projects.tsx'), 'utf-8');

const expectedPhases = [
  'Entrada do Lead',
  'Diagnóstico & Briefing',
  'Proposta & Viabilidade',
  'Kickoff',
  'Conceito Criativo',
  'Produção / Execução',
  'QA & Entrega',
  'Pós-projeto',
];

const expectedCardMetadata = [
  'priority',
  'responsible',
  'endDate',
  'progress',
  'nextStep',
];

describe('Módulo Projetos - UI operacional', () => {
  it('declara as 8 fases visíveis do canvas/Kanban operacional', () => {
    for (const phase of expectedPhases) {
      expect(projectsSource).toContain(`label: '${phase}'`);
    }

    expect(projectsSource.match(/label: '/g)).toHaveLength(8);
    expect(projectsSource).toContain('grid-cols-8');
    expect(projectsSource).toContain('Canvas Operacional');
  });

  it('mantém os campos essenciais dos cards de projeto e do formulário de criação', () => {
    for (const metadata of expectedCardMetadata) {
      expect(projectsSource).toContain(metadata);
    }

    expect(projectsSource).toContain('PRIORITY_COLORS');
    expect(projectsSource).toContain('UserRound');
    expect(projectsSource).toContain('CalendarDays');
    expect(projectsSource).toContain('Próxima ação');
    expect(projectsSource).toContain('Equipe envolvida');
  });

  it('oferece painel lateral de detalhes com ações de avanço e mudança de fase', () => {
    expect(projectsSource).toContain('Detalhe do projeto');
    expect(projectsSource).toContain('Mover para fase');
    expect(projectsSource).toContain('Registrar avanço');
    expect(projectsSource).toContain('moveProjectToPhase');
    expect(projectsSource).toContain('addProjectAction');
  });

  it('permite editar projetos existentes reaproveitando o formulário e persistindo via mutation update', () => {
    expect(projectsSource).toContain('editingProjectId');
    expect(projectsSource).toContain('openEditForm');
    expect(projectsSource).toContain('Editar projeto');
    expect(projectsSource).toContain('Salvar alterações');
    expect(projectsSource).toContain('updateProjectMutation.mutateAsync');
    expect(projectsSource).toContain('Edição mantida localmente enquanto a persistência é validada');
  });

  it('suporta drag-and-drop entre fases com persistência controlada por updateProject', () => {
    expect(projectsSource).toContain('draggingProjectId');
    expect(projectsSource).toContain('localPhaseOverrides');
    expect(projectsSource).toContain('handleProjectDrop');
    expect(projectsSource).toContain('onDragStart');
    expect(projectsSource).toContain('onDrop={() => void handleProjectDrop(phase.id)}');
    expect(projectsSource).toContain('data-testid={`project-phase-${phase.id}`}');
    expect(projectsSource).toContain('data-testid={`project-card-${project.id}`}');
    expect(projectsSource).toContain("status: phase === 'pos_projeto' ? 'concluido' : 'em_andamento'");
  });

  it('reforça a visualização de membros nos cards e no painel lateral de detalhes', () => {
    expect(projectsSource).toContain('getMemberInitials');
    expect(projectsSource).toContain('Equipe');
    expect(projectsSource).toContain('Equipe atribuída');
    expect(projectsSource).toContain('bg-gradient-to-br from-cyan-400 to-orange-500');
    expect(projectsSource).toContain('project.members ?? [project.responsible]');
  });
});
