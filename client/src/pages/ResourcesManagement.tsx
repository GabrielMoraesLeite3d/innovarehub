import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Calendar, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { trpc } from '@/lib/trpc';

type ResourceStatus = 'disponivel' | 'em_uso' | 'manutencao' | 'descartado';

type ResourceFormData = {
  name: string;
  category: string;
  location: string;
  status: ResourceStatus;
  notes: string;
};

type ScheduleFormData = {
  resourceId: number;
  userId: number;
  startDate: string;
  endDate: string;
  purpose: string;
};

type ResourceItem = {
  id: number;
  name: string;
  category: string;
  status: ResourceStatus | null;
  location: string | null;
  notes?: string | null;
};

const DEMO_RESOURCES: ResourceItem[] = [
  { id: 1, name: 'Creality K2 Pro', category: 'Impressão 3D', status: 'disponivel', location: 'Lab 1' },
  { id: 2, name: 'Ender 5 S1 Pro', category: 'Impressão 3D', status: 'em_uso', location: 'Lab 1' },
  { id: 3, name: 'K2 Combo/CFS', category: 'Impressão 3D', status: 'disponivel', location: 'Lab 2' },
  { id: 4, name: 'Microretífica', category: 'Prototipagem', status: 'disponivel', location: 'Lab 2' },
  { id: 5, name: 'Solda MIG/MAG', category: 'Prototipagem', status: 'manutencao', location: 'Lab 3' },
];

const TEAM_MEMBERS = [
  { id: 1, name: 'Gabriel' },
  { id: 2, name: 'Larissa' },
  { id: 3, name: 'Nicolly' },
  { id: 4, name: 'Amanda' },
  { id: 5, name: 'Yasmim' },
  { id: 6, name: 'Davi' },
  { id: 7, name: 'Gabriel N.' },
  { id: 8, name: 'Vinícius' },
  { id: 9, name: 'Laura' },
];

const emptyForm: ResourceFormData = {
  name: '',
  category: 'Impressão 3D',
  location: '',
  status: 'disponivel',
  notes: '',
};

const emptySchedule: ScheduleFormData = {
  resourceId: 0,
  userId: 1,
  startDate: '',
  endDate: '',
  purpose: '',
};

export default function ResourcesManagement() {
  const utils = trpc.useUtils();
  const resourcesQuery = trpc.resources.list.useQuery();
  const createResource = trpc.resources.create.useMutation({
    onSuccess: async () => {
      await utils.resources.list.invalidate();
      setFormData(emptyForm);
      setShowForm(false);
    },
  });
  const updateResource = trpc.resources.update.useMutation({
    onSuccess: async () => {
      await utils.resources.list.invalidate();
    },
  });
  const removeResource = trpc.resources.remove.useMutation({
    onSuccess: async () => {
      await utils.resources.list.invalidate();
    },
  });
  const createAssignment = trpc.resources.createAssignment.useMutation({
    onSuccess: async () => {
      await utils.resources.list.invalidate();
      setScheduleData(emptySchedule);
      setShowScheduleForm(false);
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [formData, setFormData] = useState<ResourceFormData>(emptyForm);
  const [scheduleData, setScheduleData] = useState<ScheduleFormData>(emptySchedule);

  const resources = useMemo<ResourceItem[]>(() => {
    if (resourcesQuery.data && resourcesQuery.data.length > 0) {
      return resourcesQuery.data.map((resource) => ({
        id: resource.id,
        name: resource.name,
        category: resource.category,
        status: (resource.status ?? 'disponivel') as ResourceStatus,
        location: resource.location,
        notes: resource.notes,
      }));
    }
    return DEMO_RESOURCES;
  }, [resourcesQuery.data]);

  const isMutating = createResource.isPending || updateResource.isPending || removeResource.isPending || createAssignment.isPending;

  const handleAddResource = async () => {
    if (!formData.name.trim() || !formData.location.trim()) return;
    await createResource.mutateAsync({
      name: formData.name.trim(),
      category: formData.category,
      location: formData.location.trim(),
      status: formData.status,
      notes: formData.notes.trim() || null,
    });
  };

  const handleScheduleResource = async () => {
    if (!scheduleData.resourceId || !scheduleData.userId || !scheduleData.startDate || !scheduleData.endDate || !scheduleData.purpose.trim()) return;
    await createAssignment.mutateAsync({
      resourceId: scheduleData.resourceId,
      userId: scheduleData.userId,
      startDate: new Date(`${scheduleData.startDate}T09:00:00`),
      endDate: new Date(`${scheduleData.endDate}T18:00:00`),
      purpose: scheduleData.purpose.trim(),
      status: 'planejado',
    });
  };

  const handleDeleteResource = async (id: number) => {
    await removeResource.mutateAsync({ id });
  };

  const handleStatusChange = async (id: number, status: ResourceStatus) => {
    await updateResource.mutateAsync({ id, status });
  };

  const openScheduleFor = (resourceId: number) => {
    setScheduleData((current) => ({ ...current, resourceId }));
    setShowScheduleForm(true);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'disponivel':
        return 'bg-green-500/20 text-green-300';
      case 'em_uso':
        return 'bg-orange-500/20 text-orange-300';
      case 'manutencao':
        return 'bg-red-500/20 text-red-300';
      case 'descartado':
        return 'bg-slate-500/20 text-slate-300';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'disponivel':
        return 'Disponível';
      case 'em_uso':
        return 'Em uso';
      case 'manutencao':
        return 'Manutenção';
      case 'descartado':
        return 'Descartado';
      default:
        return 'Indefinido';
    }
  };

  const impressoras3d = resources.filter((resource) => resource.category === 'Impressão 3D');
  const prototipagem = resources.filter((resource) => resource.category === 'Prototipagem');
  const outrosRecursos = resources.filter((resource) => !['Impressão 3D', 'Prototipagem'].includes(resource.category));

  const renderResourceCard = (resource: ResourceItem, accent: 'cyan' | 'orange' | 'violet') => {
    const borderClass = accent === 'cyan' ? 'border-cyan-500/30 hover:border-cyan-500/60' : accent === 'orange' ? 'border-orange-500/30 hover:border-orange-500/60' : 'border-violet-500/30 hover:border-violet-500/60';
    const actionClass = accent === 'cyan' ? 'text-cyan-400 hover:text-cyan-300' : accent === 'orange' ? 'text-orange-400 hover:text-orange-300' : 'text-violet-400 hover:text-violet-300';

    return (
      <Card key={resource.id} className={`p-4 backdrop-blur-md bg-white/5 border ${borderClass} transition-all`}>
        <div className="flex items-start justify-between mb-3 gap-3">
          <div>
            <h3 className="font-bold text-white">{resource.name}</h3>
            <p className="text-xs text-slate-400">{resource.location || 'Sem localização definida'}</p>
            {resource.notes && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{resource.notes}</p>}
          </div>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(resource.status)}`}>
            {getStatusLabel(resource.status)}
          </span>
        </div>
        <select
          value={resource.status ?? 'disponivel'}
          onChange={(event) => handleStatusChange(resource.id, event.target.value as ResourceStatus)}
          disabled={isMutating}
          className="w-full mb-3 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50"
        >
          <option value="disponivel" className="bg-slate-900">Disponível</option>
          <option value="em_uso" className="bg-slate-900">Em uso</option>
          <option value="manutencao" className="bg-slate-900">Manutenção</option>
          <option value="descartado" className="bg-slate-900">Descartado</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => openScheduleFor(resource.id)}
            disabled={isMutating}
            className={`flex-1 ${actionClass} text-sm flex items-center justify-center gap-1 py-2 rounded hover:bg-white/5 disabled:opacity-50`}
          >
            <Calendar className="w-3 h-3" />
            Agendar
          </button>
          <button
            onClick={() => handleDeleteResource(resource.id)}
            disabled={isMutating}
            className="text-red-400 hover:text-red-300 text-sm flex items-center justify-center gap-1 py-2 rounded hover:bg-white/5 flex-1 disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
            Remover
          </button>
        </div>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Recursos e Infraestrutura</h1>
            <p className="text-slate-400 mt-2">Gerencie equipamentos, agendamentos e atribuições com persistência no banco.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(!showForm)} className="btn-cinema gap-2" disabled={isMutating}>
              <Plus className="w-4 h-4" />
              Novo Recurso
            </Button>
            <Button onClick={() => setShowScheduleForm(!showScheduleForm)} className="btn-cinema gap-2" variant="outline" disabled={isMutating}>
              <Calendar className="w-4 h-4" />
              Agendar
            </Button>
          </div>
        </div>

        {resourcesQuery.isLoading && (
          <Card className="p-4 backdrop-blur-md bg-white/5 border border-white/10 text-slate-300 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Carregando recursos persistentes...
          </Card>
        )}

        {resourcesQuery.isError && (
          <Card className="p-4 backdrop-blur-md bg-red-500/10 border border-red-500/30 text-red-200">
            Não foi possível carregar os recursos persistentes. Dados demonstrativos permanecem visíveis para referência.
          </Card>
        )}

        {(createResource.error || updateResource.error || removeResource.error || createAssignment.error) && (
          <Card className="p-4 backdrop-blur-md bg-red-500/10 border border-red-500/30 text-red-200">
            {createResource.error?.message || updateResource.error?.message || removeResource.error?.message || createAssignment.error?.message}
          </Card>
        )}

        {showForm && (
          <Card className="p-6 backdrop-blur-md bg-white/5 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Adicionar Novo Recurso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome do Recurso"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={formData.category}
                onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Impressão 3D" className="bg-slate-900">Impressão 3D</option>
                <option value="Prototipagem" className="bg-slate-900">Prototipagem</option>
                <option value="Ferramentas" className="bg-slate-900">Ferramentas</option>
                <option value="Infraestrutura" className="bg-slate-900">Infraestrutura</option>
              </select>
              <input
                type="text"
                placeholder="Localização"
                value={formData.location}
                onChange={(event) => setFormData({ ...formData, location: event.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={formData.status}
                onChange={(event) => setFormData({ ...formData, status: event.target.value as ResourceStatus })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="disponivel" className="bg-slate-900">Disponível</option>
                <option value="em_uso" className="bg-slate-900">Em uso</option>
                <option value="manutencao" className="bg-slate-900">Manutenção</option>
                <option value="descartado" className="bg-slate-900">Descartado</option>
              </select>
              <textarea
                placeholder="Observações técnicas, manutenção prevista ou restrições"
                value={formData.notes}
                onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 md:col-span-2"
                rows={2}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddResource} className="btn-cinema" disabled={isMutating || !formData.name || !formData.location}>
                {createResource.isPending ? 'Salvando...' : 'Adicionar'}
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline" disabled={isMutating}>Cancelar</Button>
            </div>
          </Card>
        )}

        {showScheduleForm && (
          <Card className="p-6 backdrop-blur-md bg-white/5 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Agendar Recurso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={scheduleData.resourceId}
                onChange={(event) => setScheduleData({ ...scheduleData, resourceId: Number(event.target.value) })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value={0} className="bg-slate-900">Selecione um recurso</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id} className="bg-slate-900">{resource.name}</option>
                ))}
              </select>
              <select
                value={scheduleData.userId}
                onChange={(event) => setScheduleData({ ...scheduleData, userId: Number(event.target.value) })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cyan-500"
              >
                {TEAM_MEMBERS.map((member) => (
                  <option key={member.id} value={member.id} className="bg-slate-900">{member.name}</option>
                ))}
              </select>
              <input
                type="date"
                value={scheduleData.startDate}
                onChange={(event) => setScheduleData({ ...scheduleData, startDate: event.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cyan-500"
              />
              <input
                type="date"
                value={scheduleData.endDate}
                onChange={(event) => setScheduleData({ ...scheduleData, endDate: event.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cyan-500"
              />
              <textarea
                placeholder="Propósito do uso"
                value={scheduleData.purpose}
                onChange={(event) => setScheduleData({ ...scheduleData, purpose: event.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 md:col-span-2"
                rows={2}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleScheduleResource} className="btn-cinema" disabled={isMutating || !scheduleData.resourceId || !scheduleData.startDate || !scheduleData.endDate || !scheduleData.purpose}>
                {createAssignment.isPending ? 'Agendando...' : 'Agendar'}
              </Button>
              <Button onClick={() => setShowScheduleForm(false)} variant="outline" disabled={isMutating}>Cancelar</Button>
            </div>
          </Card>
        )}

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Impressão 3D</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {impressoras3d.map((resource) => renderResourceCard(resource, 'cyan'))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Prototipagem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prototipagem.map((resource) => renderResourceCard(resource, 'orange'))}
          </div>
        </div>

        {outrosRecursos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Outros Recursos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {outrosRecursos.map((resource) => renderResourceCard(resource, 'violet'))}
            </div>
          </div>
        )}

        <Card className="p-4 backdrop-blur-md bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-blue-300">
            <strong>Dica:</strong> use o botão Agendar para atribuir recursos a pessoas com datas específicas. O agendamento é salvo no banco e o recurso passa para status em uso.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
