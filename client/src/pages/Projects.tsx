import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { CalendarDays, CheckCircle2, Clock, Filter, ListChecks, Pencil, Plus, Target, UserRound, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type Priority = 'baixa' | 'media' | 'alta' | 'critica';
type ProjectPhase = 'entrada_lead' | 'diagnostico' | 'proposta' | 'kickoff' | 'conceito' | 'producao' | 'qa' | 'pos_projeto';
type ProjectTaskStatus = 'nao_iniciada' | 'em_andamento' | 'bloqueada' | 'concluida' | 'cancelada';

const PROJECT_TASK_STATUS_LABELS: Record<ProjectTaskStatus, string> = {
  nao_iniciada: 'Não iniciada',
  em_andamento: 'Em andamento',
  bloqueada: 'Bloqueada',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

type ProjectTaskRecord = {
  id: number;
  projectId: number;
  title: string;
  description?: string | null;
  priority?: Priority | null;
  status?: ProjectTaskStatus | null;
  dueDate?: string | Date | null;
  completedDate?: string | Date | null;
};

type LocalProject = {
  id: string | number;
  name: string;
  description?: string | null;
  phase: ProjectPhase;
  priority?: Priority;
  responsible?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  progress?: number;
  nextStep?: string;
  members?: string[];
  deliverables?: string[];
};

const TEAM_MEMBERS = ['Gabriel', 'Larissa', 'Nicolly', 'Amanda', 'Yasmim', 'Davi', 'Gabriel N.', 'Vinícius', 'Laura'];

const PHASES: Array<{ id: ProjectPhase; label: string; description: string; color: string }> = [
  { id: 'entrada_lead', label: 'Entrada do Lead', description: 'Lead recebido e triagem inicial.', color: 'from-blue-400 to-blue-600' },
  { id: 'diagnostico', label: 'Diagnóstico & Briefing', description: 'Entendimento técnico, briefing e escopo.', color: 'from-cyan-400 to-cyan-600' },
  { id: 'proposta', label: 'Proposta & Viabilidade', description: 'Proposta, custo, prazo e viabilidade.', color: 'from-purple-400 to-purple-600' },
  { id: 'kickoff', label: 'Kickoff', description: 'Abertura interna e alinhamento do time.', color: 'from-pink-400 to-pink-600' },
  { id: 'conceito', label: 'Conceito Criativo', description: 'Solução, arquitetura, conceito e direção.', color: 'from-orange-400 to-orange-600' },
  { id: 'producao', label: 'Produção / Execução', description: 'Execução técnica, modelagem, fabricação ou desenvolvimento.', color: 'from-red-400 to-red-600' },
  { id: 'qa', label: 'QA & Entrega', description: 'Validação, contraprova, revisão e entrega.', color: 'from-green-400 to-green-600' },
  { id: 'pos_projeto', label: 'Pós-projeto', description: 'Feedback, documentação e recorrência.', color: 'from-indigo-400 to-indigo-600' },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  baixa: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  media: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  alta: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  critica: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const INITIAL_EXAMPLE_PROJECTS: LocalProject[] = [
  {
    id: 'demo-1',
    name: 'Sistema Modular de Saneamento',
    description: 'Projeto técnico para solução modular pré-fabricada com documentação executiva e prototipagem de subsistemas.',
    phase: 'producao',
    priority: 'critica',
    responsible: 'Gabriel',
    startDate: '2026-04-20',
    endDate: '2026-06-12',
    progress: 62,
    nextStep: 'Validar interfaces de montagem e revisar lista de materiais.',
    members: ['Gabriel', 'Larissa', 'Davi'],
    deliverables: ['Modelo 3D revisado', 'Memorial técnico', 'Plano de fabricação'],
  },
  {
    id: 'demo-2',
    name: 'Briefing Comercial - Mineração',
    description: 'Diagnóstico inicial para equipamento com potencial de patente aplicado à operação industrial.',
    phase: 'diagnostico',
    priority: 'alta',
    responsible: 'Larissa',
    startDate: '2026-05-02',
    endDate: '2026-05-18',
    progress: 28,
    nextStep: 'Consolidar perguntas de diagnóstico e anexar referências visuais.',
    members: ['Larissa', 'Nicolly'],
    deliverables: ['Briefing técnico', 'Mapa de riscos', 'Estimativa preliminar'],
  },
  {
    id: 'demo-3',
    name: 'Treinamento Interno de Modelagem 3D',
    description: 'Estruturação de trilha interna para padronização de modelagem e comunicação técnica.',
    phase: 'conceito',
    priority: 'media',
    responsible: 'Amanda',
    startDate: '2026-05-08',
    endDate: '2026-05-30',
    progress: 40,
    nextStep: 'Definir checklist de aula e critérios de conclusão.',
    members: ['Amanda', 'Yasmim'],
    deliverables: ['Plano de aulas', 'Checklist de competências'],
  },
];

function formatDate(value?: string | Date | null) {
  if (!value) return 'Sem data';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sem data';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Projects() {
  const utils = trpc.useUtils();
  const { data: dbProjects = [] } = trpc.projects.list.useQuery();
  const createProjectMutation = trpc.projects.create.useMutation();
  const updateProjectMutation = trpc.projects.update.useMutation();
  const createProjectTaskMutation = trpc.projects.createTask.useMutation();
  const updateProjectTaskStatusMutation = trpc.projects.updateTaskStatus.useMutation();
  const [localProjects, setLocalProjects] = useState<LocalProject[]>(INITIAL_EXAMPLE_PROJECTS);
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'todos'>('todos');
  const [selectedProjectId, setSelectedProjectId] = useState<string | number>('demo-1');
  const [showForm, setShowForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | number | null>(null);
  const [draggingProjectId, setDraggingProjectId] = useState<string | number | null>(null);
  const [localPhaseOverrides, setLocalPhaseOverrides] = useState<Record<string, ProjectPhase>>({});
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'media' as Priority,
    status: 'nao_iniciada' as ProjectTaskStatus,
    dueDate: '',
  });

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    phase: ProjectPhase;
    priority: Priority;
    responsible: string;
    startDate: string;
    endDate: string;
    nextStep: string;
    members: string[];
  }>({
    name: '',
    description: '',
    phase: 'entrada_lead',
    priority: 'media',
    responsible: '',
    startDate: '',
    endDate: '',
    nextStep: '',
    members: [],
  });

  const mergedProjects = useMemo<LocalProject[]>(() => {
    const normalizedDbProjects: LocalProject[] = (dbProjects as any[]).map((project) => ({
      ...project,
      phase: localPhaseOverrides[String(project.id)] ?? project.phase as ProjectPhase,
      progress: project.progress ?? 15,
      priority: (project.priority ?? 'media') as Priority,
      nextStep: project.nextStep ?? 'Definir próxima ação e responsável.',
      members: project.members ?? [project.responsible].filter(Boolean),
      deliverables: project.deliverables ?? ['Escopo', 'Cronograma', 'Entrega técnica'],
    }));
    return [
      ...localProjects.map((project) => ({ ...project, phase: localPhaseOverrides[String(project.id)] ?? project.phase })),
      ...normalizedDbProjects,
    ];
  }, [dbProjects, localProjects, localPhaseOverrides]);

  const filteredProjects = selectedPriority === 'todos'
    ? mergedProjects
    : mergedProjects.filter((project) => project.priority === selectedPriority);

  const projectsByPhase = PHASES.map((phase) => ({
    ...phase,
    projects: filteredProjects.filter((project) => project.phase === phase.id),
  }));

  const selectedProject = mergedProjects.find((project) => project.id === selectedProjectId) ?? mergedProjects[0];
  const selectedProjectNumericId = typeof selectedProject?.id === 'number' ? selectedProject.id : null;
  const selectedProjectTasksInput = useMemo(() => ({ projectId: selectedProjectNumericId ?? 1 }), [selectedProjectNumericId]);
  const { data: selectedProjectTasks = [], isLoading: isProjectTasksLoading, isError: isProjectTasksError } = trpc.projects.tasks.useQuery(selectedProjectTasksInput, { enabled: selectedProjectNumericId !== null });

  const resetProjectForm = () => {
    setFormData({ name: '', description: '', phase: 'entrada_lead', priority: 'media', responsible: '', startDate: '', endDate: '', nextStep: '', members: [] });
    setEditingProjectId(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setEditingProjectId(null);
    setFormData({ name: '', description: '', phase: 'entrada_lead', priority: 'media', responsible: '', startDate: '', endDate: '', nextStep: '', members: [] });
    setShowForm(true);
  };

  const openEditForm = (project: LocalProject) => {
    setEditingProjectId(project.id);
    setFormData({
      name: project.name,
      description: project.description ?? '',
      phase: project.phase,
      priority: (project.priority ?? 'media') as Priority,
      responsible: project.responsible ?? '',
      startDate: typeof project.startDate === 'string' ? project.startDate.slice(0, 10) : project.startDate ? project.startDate.toISOString().slice(0, 10) : '',
      endDate: typeof project.endDate === 'string' ? project.endDate.slice(0, 10) : project.endDate ? project.endDate.toISOString().slice(0, 10) : '',
      nextStep: project.nextStep ?? '',
      members: project.members ?? [project.responsible].filter(Boolean) as string[],
    });
    setShowForm(true);
  };

  const handleMemberToggle = (member: string) => {
    setFormData((current) => ({
      ...current,
      members: current.members.includes(member)
        ? current.members.filter((item) => item !== member)
        : [...current.members, member],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name || !formData.responsible || !formData.startDate || !formData.endDate) {
      toast.error('Preencha nome, responsável e datas do projeto.');
      return;
    }

    const projectPayload: LocalProject = {
      id: editingProjectId ?? `local-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      phase: formData.phase,
      priority: formData.priority,
      responsible: formData.responsible,
      startDate: formData.startDate,
      endDate: formData.endDate,
      progress: editingProjectId ? (selectedProject?.progress ?? 15) : 8,
      nextStep: formData.nextStep || 'Detalhar primeira tarefa operacional.',
      members: formData.members.length > 0 ? formData.members : [formData.responsible],
      deliverables: selectedProject?.deliverables ?? ['Briefing', 'Plano de execução', 'Entrega final'],
    };

    if (editingProjectId) {
      let shouldUseLocalFallback = typeof editingProjectId !== 'number';

      if (typeof editingProjectId === 'number') {
        try {
          const result = await updateProjectMutation.mutateAsync({
            id: editingProjectId,
            name: formData.name,
            client: formData.responsible,
            description: formData.description,
            phase: formData.phase,
            status: formData.phase === 'pos_projeto' ? 'concluido' : 'em_andamento',
            priority: formData.priority,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
          });
          await utils.projects.list.invalidate();
          shouldUseLocalFallback = !result.data?.id;
        } catch (error) {
          shouldUseLocalFallback = true;
          console.warn('Edição mantida localmente enquanto a persistência é validada:', error);
        }
      }

      if (shouldUseLocalFallback) {
        setLocalProjects((current) => {
          const exists = current.some((project) => project.id === editingProjectId);
          return exists
            ? current.map((project) => project.id === editingProjectId ? projectPayload : project)
            : [projectPayload, ...current];
        });
      }
      setSelectedProjectId(editingProjectId);
      resetProjectForm();
      toast.success('Projeto atualizado no canvas.');
      return;
    }

    let shouldAddLocalFallback = true;

    try {
      const result = await createProjectMutation.mutateAsync({
        name: formData.name,
        client: formData.responsible,
        description: formData.description,
        phase: formData.phase,
        status: 'em_andamento',
        priority: formData.priority,
        responsible: formData.responsible,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      });
      await utils.projects.list.invalidate();
      if (result.data?.id) {
        shouldAddLocalFallback = false;
        setSelectedProjectId(result.data.id);
      }
    } catch (error) {
      console.warn('Projeto mantido localmente enquanto a persistência é validada:', error);
    }

    if (shouldAddLocalFallback) {
      setLocalProjects((current) => [projectPayload, ...current]);
      setSelectedProjectId(projectPayload.id);
    }
    resetProjectForm();
    toast.success('Projeto criado e adicionado ao quadro.');
  };

  const moveProjectToPhase = async (projectId: string | number, phase: ProjectPhase) => {
    const project = mergedProjects.find((item) => item.id === projectId);
    if (!project || project.phase === phase) return;

    setLocalPhaseOverrides((current) => ({ ...current, [String(projectId)]: phase }));
    setLocalProjects((current) => current.map((item) => item.id === projectId ? { ...item, phase, progress: Math.min((item.progress ?? 0) + 12, 100) } : item));

    if (typeof projectId === 'number') {
      try {
        await updateProjectMutation.mutateAsync({ id: projectId, phase, status: phase === 'pos_projeto' ? 'concluido' : 'em_andamento' });
        await utils.projects.list.invalidate();
        setLocalPhaseOverrides((current) => {
          const next = { ...current };
          delete next[String(projectId)];
          return next;
        });
      } catch (error) {
        console.warn('Mudança mantida localmente enquanto a persistência é validada:', error);
      }
    }

    setSelectedProjectId(projectId);
    toast.success('Projeto movido para nova fase.');
  };

  const handleProjectDrop = async (phase: ProjectPhase) => {
    if (!draggingProjectId) return;
    await moveProjectToPhase(draggingProjectId, phase);
    setDraggingProjectId(null);
  };

  const getMemberInitials = (member: string) => member.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  const addProjectAction = () => {
    if (!selectedProject) return;
    setLocalProjects((current) => current.map((project) => project.id === selectedProject.id ? { ...project, progress: Math.min((project.progress ?? 0) + 10, 100), nextStep: 'Ação registrada. Revisar próximo bloqueio e atualizar responsável.' } : project));
    toast.success('Ação registrada no projeto.');
  };

  const handleCreateProjectTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProjectNumericId) {
      toast.error('Salve o projeto no banco antes de criar tarefas persistentes.');
      return;
    }
    if (!taskFormData.title.trim()) {
      toast.error('Informe o título da tarefa.');
      return;
    }

    try {
      await createProjectTaskMutation.mutateAsync({
        projectId: selectedProjectNumericId,
        title: taskFormData.title.trim(),
        description: taskFormData.description.trim() || null,
        priority: taskFormData.priority,
        status: taskFormData.status,
        dueDate: taskFormData.dueDate ? new Date(taskFormData.dueDate) : null,
      });
      await utils.projects.tasks.invalidate();
      setTaskFormData({ title: '', description: '', priority: 'media', status: 'nao_iniciada', dueDate: '' });
      toast.success('Tarefa persistente criada para o projeto.');
    } catch (error) {
      console.warn('Falha ao criar tarefa de projeto:', error);
      toast.error('Não foi possível salvar a tarefa no banco.');
    }
  };

  const handleUpdateProjectTaskStatus = async (taskId: number, status: ProjectTaskStatus) => {
    try {
      await updateProjectTaskStatusMutation.mutateAsync({ id: taskId, status });
      await utils.projects.tasks.invalidate();
      toast.success('Status da tarefa atualizado.');
    } catch (error) {
      console.warn('Falha ao atualizar tarefa de projeto:', error);
      toast.error('Não foi possível atualizar a tarefa.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Canvas Operacional</p>
            <h1 className="mt-2 text-4xl font-bold text-gradient">Projetos</h1>
            <p className="mt-2 max-w-3xl text-slate-400">Quadro visual para acompanhar a jornada completa do projeto, do lead ao pós-projeto, com responsável, prioridade, prazo, progresso e próxima ação sempre visíveis.</p>
          </div>
          <Button onClick={openCreateForm} className="btn-cinema">
            <Plus className="mr-2 h-5 w-5" /> Novo Projeto
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border-cyan-500/20 bg-cyan-500/10 p-4">
            <p className="text-sm text-slate-400">Projetos no quadro</p>
            <p className="mt-2 text-3xl font-bold text-white">{mergedProjects.length}</p>
          </Card>
          <Card className="border-orange-500/20 bg-orange-500/10 p-4">
            <p className="text-sm text-slate-400">Críticos / Alta</p>
            <p className="mt-2 text-3xl font-bold text-white">{mergedProjects.filter((p) => p.priority === 'critica' || p.priority === 'alta').length}</p>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-sm text-slate-400">Em execução</p>
            <p className="mt-2 text-3xl font-bold text-white">{mergedProjects.filter((p) => ['kickoff', 'conceito', 'producao', 'qa'].includes(p.phase)).length}</p>
          </Card>
          <Card className="border-violet-500/20 bg-violet-500/10 p-4">
            <p className="text-sm text-slate-400">Progresso médio</p>
            <p className="mt-2 text-3xl font-bold text-white">{Math.round(mergedProjects.reduce((sum, p) => sum + (p.progress ?? 0), 0) / Math.max(mergedProjects.length, 1))}%</p>
          </Card>
        </div>

        {showForm && (
          <Card className="border border-orange-500/30 bg-white/5 p-6 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingProjectId ? 'Editar projeto' : 'Criar novo projeto'}</h2>
              <button onClick={resetProjectForm} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">Nome do projeto *
                  <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-orange-500" placeholder="Ex: Planta modular, protótipo, proposta técnica" />
                </label>
                <label className="space-y-2 text-sm text-slate-300">Responsável *
                  <select value={formData.responsible} onChange={(e) => setFormData({ ...formData, responsible: e.target.value })} className="w-full rounded border border-white/20 bg-slate-950 px-3 py-2 text-white outline-none focus:border-orange-500">
                    <option value="">Selecione</option>
                    {TEAM_MEMBERS.map((member) => <option key={member} value={member}>{member}</option>)}
                  </select>
                </label>
              </div>
              <label className="space-y-2 text-sm text-slate-300">Descrição
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-24 w-full rounded border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-orange-500" placeholder="Contexto, objetivo técnico, oportunidade e restrições." />
              </label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <label className="space-y-2 text-sm text-slate-300">Fase
                  <select value={formData.phase} onChange={(e) => setFormData({ ...formData, phase: e.target.value as ProjectPhase })} className="w-full rounded border border-white/20 bg-slate-950 px-3 py-2 text-white outline-none focus:border-orange-500">
                    {PHASES.map((phase) => <option key={phase.id} value={phase.id}>{phase.label}</option>)}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">Prioridade
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })} className="w-full rounded border border-white/20 bg-slate-950 px-3 py-2 text-white outline-none focus:border-orange-500">
                    <option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="critica">Crítica</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">Início *
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full rounded border border-white/20 bg-slate-950 px-3 py-2 text-white outline-none focus:border-orange-500" />
                </label>
                <label className="space-y-2 text-sm text-slate-300">Fim *
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full rounded border border-white/20 bg-slate-950 px-3 py-2 text-white outline-none focus:border-orange-500" />
                </label>
              </div>
              <label className="space-y-2 text-sm text-slate-300">Próxima ação
                <input value={formData.nextStep} onChange={(e) => setFormData({ ...formData, nextStep: e.target.value })} className="w-full rounded border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-orange-500" placeholder="Ex: validar briefing com cliente, gerar proposta, revisar modelo 3D" />
              </label>
              <div className="space-y-2">
                <p className="text-sm text-slate-300">Equipe envolvida</p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                  {TEAM_MEMBERS.map((member) => (
                    <label key={member} className="flex cursor-pointer items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                      <input type="checkbox" checked={formData.members.includes(member)} onChange={() => handleMemberToggle(member)} /> {member}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="btn-cinema flex-1">{editingProjectId ? 'Salvar alterações' : 'Criar e colocar no canvas'}</Button>
                <Button type="button" onClick={resetProjectForm} className="flex-1 bg-slate-700 hover:bg-slate-600">Cancelar</Button>
              </div>
            </form>
          </Card>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          {(['todos', 'baixa', 'media', 'alta', 'critica'] as const).map((priority) => (
            <button key={priority} onClick={() => setSelectedPriority(priority)} className={`rounded px-3 py-1 text-sm font-semibold capitalize transition-all ${selectedPriority === priority ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}>{priority}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1fr_360px]">
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="grid min-w-[1380px] grid-cols-8 gap-3">
              {projectsByPhase.map((phase, index) => (
                <div key={phase.id} onDragOver={(event) => event.preventDefault()} onDrop={() => void handleProjectDrop(phase.id)} className={`rounded-xl border p-3 transition-all ${draggingProjectId ? 'border-cyan-400/50 bg-cyan-500/[0.06]' : 'border-white/10 bg-white/[0.03]'}`} data-testid={`project-phase-${phase.id}`}>
                  <div className={`rounded-lg bg-gradient-to-r ${phase.color} p-3 shadow-lg`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white/80">{String(index + 1).padStart(2, '0')}</span>
                      <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs font-semibold text-white">{phase.projects.length}</span>
                    </div>
                    <h2 className="mt-2 text-sm font-bold text-white">{phase.label}</h2>
                    <p className="mt-1 text-[11px] leading-relaxed text-white/80">{phase.description}</p>
                  </div>

                  <div className="mt-3 space-y-3">
                    {phase.projects.length > 0 ? phase.projects.map((project) => (
                      <Card key={project.id} draggable onDragStart={() => { setDraggingProjectId(project.id); setSelectedProjectId(project.id); }} onDragEnd={() => setDraggingProjectId(null)} onClick={() => setSelectedProjectId(project.id)} className={`cursor-grab border p-3 transition-all active:cursor-grabbing ${draggingProjectId === project.id ? 'scale-[0.98] border-orange-300 bg-orange-500/10 opacity-70' : selectedProject?.id === project.id ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.16)]' : 'border-white/10 bg-slate-950/70 hover:border-orange-400/60'}`} data-testid={`project-card-${project.id}`}>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold leading-tight text-white">{project.name}</h3>
                          <span className={`whitespace-nowrap rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_COLORS[(project.priority ?? 'media') as Priority]}`}>{project.priority ?? 'media'}</span>
                        </div>
                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-400">{project.description}</p>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${project.progress ?? 0}%` }} /></div>
                        <div className="mt-3 space-y-1 text-[11px] text-slate-400">
                          <p className="flex items-center gap-1"><UserRound className="h-3 w-3 text-cyan-300" /> {project.responsible ?? 'Sem responsável'}</p>
                          <p className="flex items-center gap-1"><CalendarDays className="h-3 w-3 text-orange-300" /> {formatDate(project.endDate)}</p>
                          <p className="flex items-center gap-1"><Target className="h-3 w-3 text-emerald-300" /> {project.progress ?? 0}%</p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Equipe</span>
                            <div className="flex -space-x-2">
                              {(project.members ?? [project.responsible].filter(Boolean) as string[]).slice(0, 4).map((member) => <span key={member} title={member} className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-950 bg-gradient-to-br from-cyan-400 to-orange-500 text-[10px] font-black text-white shadow-sm">{getMemberInitials(member)}</span>)}
                              {(project.members?.length ?? 0) > 4 && <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-950 bg-white/10 text-[10px] font-bold text-slate-200">+{(project.members?.length ?? 0) - 4}</span>}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )) : (
                      <div className="rounded border border-dashed border-white/15 p-4 text-center text-xs text-slate-500">Sem projetos nesta fase</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="h-fit border-cyan-500/20 bg-slate-950/80 p-5 shadow-2xl">
            {selectedProject ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Detalhe do projeto</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">{selectedProject.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{selectedProject.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-white/5 p-3"><p className="text-slate-500">Responsável</p><p className="font-semibold text-white">{selectedProject.responsible}</p></div>
                  <div className="rounded-lg bg-white/5 p-3"><p className="text-slate-500">Prioridade</p><p className="font-semibold capitalize text-white">{selectedProject.priority}</p></div>
                  <div className="rounded-lg bg-white/5 p-3"><p className="text-slate-500">Início</p><p className="font-semibold text-white">{formatDate(selectedProject.startDate)}</p></div>
                  <div className="rounded-lg bg-white/5 p-3"><p className="text-slate-500">Entrega</p><p className="font-semibold text-white">{formatDate(selectedProject.endDate)}</p></div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm"><span className="text-slate-400">Progresso</span><span className="font-bold text-cyan-300">{selectedProject.progress ?? 0}%</span></div>
                  <div className="h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-orange-400" style={{ width: `${selectedProject.progress ?? 0}%` }} /></div>
                </div>
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-orange-200"><Clock className="h-4 w-4" /> Próxima ação</p>
                  <p className="mt-2 text-sm text-slate-200">{selectedProject.nextStep}</p>
                </div>
                <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <p className="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-100"><UserRound className="h-4 w-4" /> Equipe atribuída</p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedProject.members ?? [selectedProject.responsible].filter(Boolean) as string[]).map((member) => (
                      <span key={member} className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-slate-100">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-orange-500 text-[10px] font-black text-white">{getMemberInitials(member)}</span>
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-bold text-white"><ListChecks className="h-4 w-4 text-cyan-300" /> Entregáveis</p>
                  <div className="space-y-2">
                    {(selectedProject.deliverables ?? []).map((deliverable) => <div key={deliverable} className="flex items-center gap-2 rounded bg-white/5 px-3 py-2 text-sm text-slate-300"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> {deliverable}</div>)}
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-100"><ListChecks className="h-4 w-4" /> Tarefas persistentes</p>
                  {selectedProjectNumericId ? (
                    <div className="space-y-3">
                      <form onSubmit={handleCreateProjectTask} className="space-y-2 rounded-lg border border-white/10 bg-slate-950/60 p-3">
                        <input value={taskFormData.title} onChange={(event) => setTaskFormData({ ...taskFormData, title: event.target.value })} className="w-full rounded border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400" placeholder="Título da tarefa" />
                        <textarea value={taskFormData.description} onChange={(event) => setTaskFormData({ ...taskFormData, description: event.target.value })} className="min-h-16 w-full rounded border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400" placeholder="Descrição, critério de aceite ou bloqueio" />
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <select value={taskFormData.priority} onChange={(event) => setTaskFormData({ ...taskFormData, priority: event.target.value as Priority })} className="rounded border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400">
                            <option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="critica">Crítica</option>
                          </select>
                          <select value={taskFormData.status} onChange={(event) => setTaskFormData({ ...taskFormData, status: event.target.value as ProjectTaskStatus })} className="rounded border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400">
                            {Object.entries(PROJECT_TASK_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </select>
                          <input type="date" value={taskFormData.dueDate} onChange={(event) => setTaskFormData({ ...taskFormData, dueDate: event.target.value })} className="rounded border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400" />
                        </div>
                        <Button type="submit" disabled={createProjectTaskMutation.isPending} className="w-full bg-emerald-500/80 text-white hover:bg-emerald-500">Adicionar tarefa</Button>
                      </form>
                      {isProjectTasksLoading && <p className="text-sm text-slate-400">Carregando tarefas persistentes...</p>}
                      {isProjectTasksError && <p className="text-sm text-red-300">Não foi possível carregar tarefas persistentes.</p>}
                      {!isProjectTasksLoading && !isProjectTasksError && (selectedProjectTasks as ProjectTaskRecord[]).length === 0 && <p className="text-sm text-slate-400">Nenhuma tarefa persistente registrada para este projeto.</p>}
                      <div className="space-y-2">
                        {(selectedProjectTasks as ProjectTaskRecord[]).map((task) => (
                          <div key={task.id} className="rounded-lg border border-white/10 bg-slate-950/70 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold text-white">{task.title}</p>
                                <p className="mt-1 text-xs leading-relaxed text-slate-400">{task.description || 'Sem descrição'}</p>
                              </div>
                              <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_COLORS[(task.priority ?? 'media') as Priority]}`}>{task.priority ?? 'media'}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-400">
                              <span>Prazo: {formatDate(task.dueDate)}</span>
                              <select value={task.status ?? 'nao_iniciada'} onChange={(event) => void handleUpdateProjectTaskStatus(task.id, event.target.value as ProjectTaskStatus)} className="rounded border border-white/20 bg-slate-950 px-2 py-1 text-xs text-white outline-none focus:border-emerald-400">
                                {Object.entries(PROJECT_TASK_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-300">Projetos demonstrativos ou ainda não persistidos não recebem tarefas no banco. Crie ou salve o projeto para ativar este fluxo.</p>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold text-white">Mover para fase</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PHASES.map((phase) => <Button key={phase.id} onClick={() => moveProjectToPhase(selectedProject.id, phase.id)} className="bg-white/10 text-xs hover:bg-cyan-500/30">{phase.label}</Button>)}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button onClick={() => openEditForm(selectedProject)} className="bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30"><Pencil className="mr-2 h-4 w-4" /> Editar projeto</Button>
                  <Button onClick={addProjectAction} className="btn-cinema">Registrar avanço</Button>
                </div>
              </div>
            ) : <p className="text-slate-400">Selecione um projeto para ver detalhes.</p>}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
