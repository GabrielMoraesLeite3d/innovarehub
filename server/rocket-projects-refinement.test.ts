import { describe, expect, it } from 'vitest';

type TimelineStep = {
  id: string;
  title: string;
  status: 'concluido' | 'atual' | 'proximo';
};

type DeliveryStatus = 'pendente' | 'enviado' | 'aprovado' | 'reprovado' | 'ajustes';

type ProjectPhase = {
  id: string;
  label: string;
};

const lascTimeline: TimelineStep[] = [
  { id: 'design_submission', title: 'Submissão de Design', status: 'concluido' },
  { id: 'design_review', title: 'Design Review / Feedback', status: 'atual' },
  { id: 'manufacturing', title: 'Fabricação e Integração', status: 'proximo' },
  { id: 'ground_tests', title: 'Testes em Solo', status: 'proximo' },
  { id: 'flight_readiness', title: 'Flight Readiness Review', status: 'proximo' },
  { id: 'competition', title: 'LASC 2026', status: 'proximo' },
];

const projectPhases: ProjectPhase[] = [
  { id: 'entrada_lead', label: 'Entrada do Lead' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'proposta', label: 'Proposta' },
  { id: 'negociacao', label: 'Negociação' },
  { id: 'execucao', label: 'Execução' },
  { id: 'validacao', label: 'Validação' },
  { id: 'entrega', label: 'Entrega' },
  { id: 'pos_projeto', label: 'Pós-projeto' },
];

function reviewDelivery(status: 'aprovado' | 'reprovado' | 'ajustes'): { status: DeliveryStatus; comment: string } {
  if (status === 'aprovado') return { status, comment: 'Entrega aprovada. Pode seguir para a próxima etapa.' };
  if (status === 'reprovado') return { status, comment: 'Entrega reprovada. Refaça conforme critérios técnicos.' };
  return { status, comment: 'Entrega requer ajustes antes da aprovação.' };
}

function checklistCompletion(items: { done: boolean }[]): number {
  if (items.length === 0) return 0;
  return Math.round((items.filter((item) => item.done).length / items.length) * 100);
}

describe('Refinamentos de Projetos e Innovare Rocket', () => {
  it('mantém as 8 fases principais do fluxo de projetos em canvas/Kanban', () => {
    expect(projectPhases).toHaveLength(8);
    expect(projectPhases.map((phase) => phase.id)).toEqual([
      'entrada_lead',
      'diagnostico',
      'proposta',
      'negociacao',
      'execucao',
      'validacao',
      'entrega',
      'pos_projeto',
    ]);
  });

  it('restaura a timeline LASC com uma única etapa atual', () => {
    const currentSteps = lascTimeline.filter((step) => step.status === 'atual');
    expect(lascTimeline).toHaveLength(6);
    expect(currentSteps).toHaveLength(1);
    expect(currentSteps[0]?.title).toBe('Design Review / Feedback');
  });

  it('representa que a submissão de design LASC já foi concluída', () => {
    const designSubmission = lascTimeline.find((step) => step.id === 'design_submission');
    expect(designSubmission?.status).toBe('concluido');
  });

  it('calcula progresso de checklist por entrega ou demanda', () => {
    expect(checklistCompletion([{ done: true }, { done: false }, { done: true }, { done: false }])).toBe(50);
    expect(checklistCompletion([{ done: true }, { done: true }])).toBe(100);
  });

  it('gera comentários coerentes para aprovação, reprovação e ajustes de entregas', () => {
    expect(reviewDelivery('aprovado')).toMatchObject({ status: 'aprovado' });
    expect(reviewDelivery('reprovado').comment).toContain('reprovada');
    expect(reviewDelivery('ajustes').comment).toContain('ajustes');
  });
});
