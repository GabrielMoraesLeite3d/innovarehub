import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const rocketSource = readFileSync(resolve(process.cwd(), 'client/src/pages/Rocket.tsx'), 'utf-8');

describe('Innovare Rocket UI avançado', () => {
  it('destaca claramente onde a equipe está na timeline LASC', () => {
    expect(rocketSource).toContain('Timeline LASC 2026 — onde estamos agora');
    expect(rocketSource).toContain('Estamos em <strong>{currentTimelineStep?.title}</strong>');
    expect(rocketSource).toContain('timelineProgress');
    expect(rocketSource).toContain('próximo marco');
  });

  it('mantém checklists por demanda/subsistema com alternância visual', () => {
    expect(rocketSource).toContain('Checklist: um item por linha');
    expect(rocketSource).toContain('toggleChecklist');
    expect(rocketSource).toContain('Demandas e checklists');
    expect(rocketSource).toContain('completion}%');
  });

  it('exibe aprovação, ajustes e reprovação com responsável da revisão', () => {
    expect(rocketSource).toContain('Entregas e aprovação');
    expect(rocketSource).toContain('Aprovar');
    expect(rocketSource).toContain('Reprovar');
    expect(rocketSource).toContain('Ajustes');
    expect(rocketSource).toContain('Revisado por ${delivery.reviewer}');
  });

  it('usa tRPC para persistir revisões quando a entrega possui id numérico de banco', () => {
    expect(rocketSource).toContain('trpc.rocket.reviewDelivery.useMutation');
    expect(rocketSource).toContain('trpc.rocket.createTask.useMutation');
    expect(rocketSource).toContain('trpc.rocket.createDelivery.useMutation');
    expect(rocketSource).toContain('trpc.rocket.createMessage.useMutation');
    expect(rocketSource).toContain('trpc.rocket.updateSubsystemProgress.useMutation');
    expect(rocketSource).toContain('trpc.rocket.subsystems.useQuery');
    expect(rocketSource).toContain('trpc.rocket.messagesBySubsystem.useQuery');
    expect(rocketSource).toContain('trpc.rocket.updateTaskStatus.useMutation');
    expect(rocketSource).toContain("typeof deliveryId === 'number'");
    expect(rocketSource).toContain('mutateAsync({ deliveryId, status })');
    expect(rocketSource).toContain('reviewer: activeUserName');
  });



  it('usa formulário reutilizável e tRPC para criar e editar missões Rocket persistentes', () => {
    expect(rocketSource).toContain('trpc.rocket.missions.useQuery');
    expect(rocketSource).toContain('trpc.rocket.createMission.useMutation');
    expect(rocketSource).toContain('trpc.rocket.updateMission.useMutation');
    expect(rocketSource).toContain('editingMissionId');
    expect(rocketSource).toContain('openCreateMissionForm');
    expect(rocketSource).toContain('openEditMissionForm');
    expect(rocketSource).toContain('handleSaveMission');
    expect(rocketSource).toContain('createRocketMissionMutation.mutateAsync');
    expect(rocketSource).toContain('updateRocketMissionMutation.mutateAsync');
    expect(rocketSource).toContain('utils.rocket.missions.invalidate');
    expect(rocketSource).toContain("{editingMissionId ? 'Editar missão' : 'Criar nova missão'}");
    expect(rocketSource).toContain("editingMissionId ? 'Salvar alterações' : 'Criar missão'");
    expect(rocketSource).toContain('Missão Rocket criada com persistência.');
    expect(rocketSource).toContain('Missão Rocket editada com persistência.');
    expect(rocketSource).toContain('Não foi possível persistir a edição da missão Rocket.');
    expect(rocketSource).toContain('Pencil');
    expect(rocketSource).toContain('aria-label={`Editar missão ${mission.name}`}');
    expect(rocketSource).toContain('Somente a Innovare Team pode criar ou editar missões Rocket.');
  });

  it('renderiza cards de subsistemas com progresso, última mensagem, status e indicador de mensagens', () => {
    expect(rocketSource).toContain("name: 'Aviónica'");
    expect(rocketSource).toContain("name: 'Estrutura'");
    expect(rocketSource).toContain("name: 'Motor'");
    expect(rocketSource).toContain("name: 'Propulsão'");
    expect(rocketSource).toContain("name: 'Telemetria'");
    expect(rocketSource).toContain("name: 'Recuperação'");
    expect(rocketSource).toContain("name: 'Energia'");
    expect(rocketSource).toContain("name: 'Payload'");
    expect(rocketSource).toContain('subsystemSummaries');
    expect(rocketSource).toContain('Último recado: {summary?.lastMessage}');
    expect(rocketSource).toContain("summary?.status");
    expect(rocketSource).toContain("summary?.progress");
    expect(rocketSource).toContain("summary?.unread");
    expect(rocketSource).toContain('readMessageIds');
    expect(rocketSource).toContain('setReadMessageIds');
  });

  it('carrega histórico persistido por subsistema com estados de loading, vazio e erro', () => {
    expect(rocketSource).toContain('persistedMessagesQuery');
    expect(rocketSource).toContain('Carregando histórico persistido do subsistema');
    expect(rocketSource).toContain('Não foi possível carregar o histórico persistido agora');
    expect(rocketSource).toContain('Nenhuma mensagem registrada para este subsistema');
    expect(rocketSource).toContain('messagesBySubsystem.invalidate');
  });

  it('exibe status lido/não lido, badge persistido/local e toast de nova mensagem', () => {
    expect(rocketSource).toContain('messagesEndRef');
    expect(rocketSource).toContain("scrollIntoView({ behavior: 'smooth', block: 'end' })");
    expect(rocketSource).toContain('knownMessageIdsBySubsystemRef');
    expect(rocketSource).toContain('toast.info(`Nova mensagem em ${selectedSubsystemInfo.name}');
    expect(rocketSource).toContain('notificationHistory');
    expect(rocketSource).toContain('trpc.rocket.notificationHistory.useQuery');
    expect(rocketSource).toContain('visibleNotificationHistory');
    expect(rocketSource).toContain('Histórico de notificações');
    expect(rocketSource).toContain('Últimos eventos do Rocket');
    expect(rocketSource).toContain('Carregado do histórico persistido de mensagens, demandas, entregas e progresso.');
    expect(rocketSource).toContain('Carregando histórico de notificações Rocket...');
    expect(rocketSource).toContain('Não foi possível carregar o histórico persistido agora.');
    expect(rocketSource).toContain('Nenhuma notificação Rocket registrada ainda.');
    expect(rocketSource).toContain('utils.rocket.notificationHistory.invalidate');
    expect(rocketSource).toContain('addNotification({ title: \'Mensagem enviada\'');
    expect(rocketSource).toContain('persistedSubsystemMessages');
    expect(rocketSource).toContain('const unreadCount = subsystemMessages.filter');
    expect(rocketSource).toContain('{summary?.unread}');
    expect(rocketSource).toContain("isRead ? 'Lido' : 'Não lido'");
    expect(rocketSource).toContain("isRead ? 'text-emerald-300' : 'text-orange-300'");
  });

  it('mostra responsáveis, status, histórico de mudanças e ação Marcar como OK nas tarefas', () => {
    expect(rocketSource).toContain('TASK_STATUS_LABEL');
    expect(rocketSource).toContain('TASK_STATUS_STYLE');
    expect(rocketSource).toContain('statusHistory');
    expect(rocketSource).toContain('Histórico de mudanças de status');
    expect(rocketSource).toContain('Responsáveis: {task.assignedTo.join');
    expect(rocketSource).toContain('markTaskOk');
    expect(rocketSource).toContain('Marcar como OK');
    expect(rocketSource).toContain("Time confirmou conclusão pelo botão Marcar como OK.");
  });

  it('mantém formulário de criação de tarefa com campos explícitos, validação e persistência sem fallback local silencioso', () => {
    expect(rocketSource).toContain('Título da atividade *');
    expect(rocketSource).toContain('aria-label="Título da atividade"');
    expect(rocketSource).toContain('Descrição da demanda *');
    expect(rocketSource).toContain('aria-label="Descreva o que precisa ser feito"');
    expect(rocketSource).toContain('Responsável pela demanda *');
    expect(rocketSource).toContain('aria-label={`Responsável ${member}`}');
    expect(rocketSource).toContain('Prazo da demanda *');
    expect(rocketSource).toContain('type="date"');
    expect(rocketSource).toContain('Checklist: um item por linha');
    expect(rocketSource).toContain('Preencha título, descrição, responsável e prazo da demanda.');
    expect(rocketSource).toContain('role="alert"');
    expect(rocketSource).toContain('Somente a Innovare Team pode criar demandas');
    expect(rocketSource).toContain("toast.error('Não foi possível persistir a demanda Rocket. Verifique o banco e tente novamente.')");
    expect(rocketSource).toContain('A demanda só entra na lista após confirmação de persistência no banco.');
    expect(rocketSource).not.toContain("assignedTo: taskForm.assignedTo.length ? taskForm.assignedTo : ['Time Rocket']");
    expect(rocketSource).not.toContain('dueDate: taskForm.dueDate || new Date()');
  });

  it('inclui formulário de atualização de progresso por subsistema com validação, RBAC e registro no histórico', () => {
    expect(rocketSource).toContain('Atualizar progresso por subsistema');
    expect(rocketSource).toContain('Progresso técnico (%) *');
    expect(rocketSource).toContain('aria-label="Progresso técnico do subsistema"');
    expect(rocketSource).toContain('min="0" max="100"');
    expect(rocketSource).toContain('Justificativa técnica *');
    expect(rocketSource).toContain('aria-label="Justificativa técnica do progresso"');
    expect(rocketSource).toContain('Registrar progresso do subsistema');
    expect(rocketSource).toContain('updateSubsystemProgress');
    expect(rocketSource).toContain('updateRocketSubsystemProgressMutation.mutateAsync');
    expect(rocketSource).toContain('utils.rocket.subsystems.invalidate');
    expect(rocketSource).toContain('persistedSubsystemsQuery.data');
    expect(rocketSource).toContain('Somente a Innovare Team pode atualizar progresso técnico por subsistema.');
    expect(rocketSource).toContain('Informe um progresso entre 0 e 100 e registre uma justificativa técnica.');
    expect(rocketSource).toContain('Atualização de progresso do subsistema');
    expect(rocketSource).toContain('createRocketMessageMutation.mutateAsync');
    expect(rocketSource).toContain("messageType: 'status'");
    expect(rocketSource).toContain('setSubsystemProgressOverrides');
    expect(rocketSource).toContain('Progresso atual:');
  });
});
