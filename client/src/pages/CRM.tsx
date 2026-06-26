import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Archive, Edit3, MessageSquare, Plus } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type LeadStatus = 'entrada' | 'triagem' | 'aguardando_briefing' | 'orcamento_elaboracao' | 'proposta_enviada' | 'negociacao' | 'aprovado' | 'recusado' | 'virou_projeto' | 'arquivado';
type InteractionType = 'email' | 'telefone' | 'reuniao' | 'proposta' | 'acompanhamento' | 'outro';

interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  estimatedValue: number;
  assignedTo: string;
  createdAt: string | Date;
  interactions: Interaction[];
}

interface Interaction {
  id: number;
  type: InteractionType;
  content: string;
  date: string | Date;
  author: string;
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  entrada: 'bg-blue-500/20 text-blue-300',
  triagem: 'bg-cyan-500/20 text-cyan-300',
  aguardando_briefing: 'bg-purple-500/20 text-purple-300',
  orcamento_elaboracao: 'bg-orange-500/20 text-orange-300',
  proposta_enviada: 'bg-pink-500/20 text-pink-300',
  negociacao: 'bg-yellow-500/20 text-yellow-300',
  aprovado: 'bg-green-500/20 text-green-300',
  recusado: 'bg-red-500/20 text-red-300',
  virou_projeto: 'bg-indigo-500/20 text-indigo-300',
  arquivado: 'bg-gray-500/20 text-gray-300',
};

const TEAM_MEMBERS = ['Gabriel', 'Larissa', 'Nicolly', 'Amanda', 'Yasmim', 'Davi', 'Gabriel N.', 'Vinícius', 'Laura'];

const STATUSES: Array<{ value: LeadStatus; label: string }> = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'triagem', label: 'Triagem' },
  { value: 'aguardando_briefing', label: 'Aguardando Briefing' },
  { value: 'orcamento_elaboracao', label: 'Orçamento em Elaboração' },
  { value: 'proposta_enviada', label: 'Proposta Enviada' },
  { value: 'negociacao', label: 'Negociação' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'recusado', label: 'Recusado' },
  { value: 'virou_projeto', label: 'Virou Projeto' },
  { value: 'arquivado', label: 'Arquivado' },
];

const INTERACTION_TYPES: Array<{ value: InteractionType; label: string }> = [
  { value: 'email', label: 'Email' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'reuniao', label: 'Reunião' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'acompanhamento', label: 'Acompanhamento' },
  { value: 'outro', label: 'Nota' },
];

function parseContact(contact?: string | null) {
  const [email = '', phone = ''] = String(contact || '').split(' • ');
  return { email, phone };
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeLead(lead: any): Lead {
  const contact = parseContact(lead.contact);
  return {
    id: Number(lead.id),
    name: lead.name || 'Lead sem nome',
    company: lead.company || 'Empresa não informada',
    email: contact.email || lead.email || 'email-nao-informado@innovare.local',
    phone: contact.phone || lead.phone || '',
    status: (lead.status || 'entrada') as LeadStatus,
    estimatedValue: toNumber(lead.estimatedValue),
    assignedTo: lead.personInCharge || lead.assignedTo || 'Gabriel',
    createdAt: lead.createdAt || new Date().toISOString(),
    interactions: (lead.interactions || []).map((interaction: any) => ({
      id: Number(interaction.id),
      type: (interaction.type || 'email') as InteractionType,
      content: interaction.description || interaction.content || '',
      date: interaction.interactionDate || interaction.date || interaction.createdAt || new Date().toISOString(),
      author: interaction.userId ? `Usuário #${interaction.userId}` : interaction.author || 'Equipe Innovare',
    })),
  };
}

export default function CRM() {
  const utils = trpc.useUtils();
  const { data: dbLeads = [], isLoading, isError, error } = trpc.crm.leads.useQuery();
  const createLeadMutation = trpc.crm.createLead.useMutation();
  const updateLeadMutation = trpc.crm.updateLead.useMutation();
  const updateLeadStatusMutation = trpc.crm.updateLeadStatus.useMutation();
  const addInteractionMutation = trpc.crm.addInteraction.useMutation();
  const createCommissionMutation = trpc.crm.createCommission.useMutation();

  const leads = useMemo<Lead[]>(() => (dbLeads as any[]).map(normalizeLead), [dbLeads]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<number | null>(null);
  const [showInteractionForm, setShowInteractionForm] = useState<number | null>(null);

  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'entrada' as LeadStatus,
    estimatedValue: 0,
    assignedTo: 'Gabriel',
  });

  const [interactionForm, setInteractionForm] = useState({
    type: 'email' as InteractionType,
    content: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const resetLeadForm = () => {
    setLeadForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      status: 'entrada',
      estimatedValue: 0,
      assignedTo: 'Gabriel',
    });
    setEditingLeadId(null);
  };

  const openCreateLeadForm = () => {
    resetLeadForm();
    setShowLeadForm(true);
  };

  const openEditLeadForm = (lead: Lead) => {
    setLeadForm({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      estimatedValue: lead.estimatedValue,
      assignedTo: lead.assignedTo,
    });
    setEditingLeadId(lead.id);
    setShowInteractionForm(null);
    setShowLeadForm(true);
  };

  const closeLeadForm = () => {
    resetLeadForm();
    setShowLeadForm(false);
  };

  const handleSaveLead = async () => {
    if (!leadForm.name || !leadForm.company || !leadForm.email) {
      toast.error('Preencha nome, empresa e email');
      return;
    }

    try {
      if (editingLeadId) {
        await updateLeadMutation.mutateAsync({ id: editingLeadId, ...leadForm });
        toast.success('Lead atualizado e persistido com sucesso.');
      } else {
        await createLeadMutation.mutateAsync(leadForm);
        toast.success('Lead criado e persistido com sucesso.');
      }
      await utils.crm.leads.invalidate();
      closeLeadForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : editingLeadId ? 'Não foi possível atualizar o lead.' : 'Não foi possível criar o lead.';
      toast.error(message);
    }
  };

  const handleAddInteraction = async (leadId: number) => {
    if (!interactionForm.content.trim()) {
      toast.error('Preencha o conteúdo da interação');
      return;
    }

    try {
      await addInteractionMutation.mutateAsync({
        leadId,
        type: interactionForm.type,
        description: interactionForm.content,
        date: new Date(`${interactionForm.date}T12:00:00`),
        notes: interactionForm.notes || null,
      });
      await utils.crm.leads.invalidate();
      setInteractionForm({ type: 'email', content: '', date: new Date().toISOString().slice(0, 10), notes: '' });
      setShowInteractionForm(null);
      toast.success('Interação registrada no histórico do lead.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível registrar a interação.';
      toast.error(message);
    }
  };

  const handleUpdateStatus = async (lead: Lead, newStatus: LeadStatus) => {
    try {
      await updateLeadStatusMutation.mutateAsync({ id: lead.id, status: newStatus });
      if (newStatus === 'virou_projeto' && lead.status !== 'virou_projeto') {
        await createCommissionMutation.mutateAsync({
          leadId: lead.id,
          value: Number(calculateCommission(lead.estimatedValue)),
          percentage: 5,
        });
      }
      await utils.crm.leads.invalidate();
      toast.success(newStatus === 'virou_projeto' ? 'Lead convertido e comissão prevista registrada.' : 'Status atualizado.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível atualizar o status.';
      toast.error(message);
    }
  };

  const handleArchiveLead = async (lead: Lead) => {
    await handleUpdateStatus(lead, 'arquivado');
  };

  const calculateCommission = (value: number) => (value * 0.05).toFixed(2);

  const totalValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const conversionRate = leads.length > 0
    ? ((leads.filter(l => l.status === 'virou_projeto').length / leads.length) * 100).toFixed(1)
    : 0;
  const totalCommission = leads
    .filter(l => l.status === 'virou_projeto')
    .reduce((sum, lead) => sum + parseFloat(calculateCommission(lead.estimatedValue)), 0)
    .toFixed(2);
  const isMutating = createLeadMutation.isPending || updateLeadMutation.isPending || updateLeadStatusMutation.isPending || addInteractionMutation.isPending || createCommissionMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">CRM & Comissões</h1>
            <p className="text-sm text-gray-400 mt-1">Leads, interações, conversões e comissões agora são sincronizados com o banco via tRPC.</p>
          </div>
          <Button
            onClick={openCreateLeadForm}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50 p-6">
            <p className="text-gray-400 text-sm">Total de Leads</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">{leads.length}</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50 p-6">
            <p className="text-gray-400 text-sm">Taxa de Conversão</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{conversionRate}%</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50 p-6">
            <p className="text-gray-400 text-sm">Comissões Totais</p>
            <p className="text-3xl font-bold text-purple-400 mt-2">R$ {Number(totalCommission).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/50 border-cyan-700/50 p-6">
            <p className="text-gray-400 text-sm">Valor em Pipeline</p>
            <p className="text-3xl font-bold text-cyan-400 mt-2">R$ {totalValue.toLocaleString('pt-BR')}</p>
          </Card>
        </div>

        {showLeadForm && (
          <Card className="bg-gray-900/50 border-gray-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">{editingLeadId ? 'Editar Lead' : 'Criar Novo Lead'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Nome *</Label>
                <Input
                  placeholder="Nome do contato"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Empresa *</Label>
                <Input
                  placeholder="Nome da empresa"
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Email *</Label>
                <Input
                  type="email"
                  placeholder="email@empresa.com"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Telefone</Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Valor Estimado (R$)</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={leadForm.estimatedValue}
                  onChange={(e) => setLeadForm({ ...leadForm, estimatedValue: parseFloat(e.target.value) || 0 })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Status inicial</Label>
                <Select value={leadForm.status} onValueChange={(value) => setLeadForm({ ...leadForm, status: value as LeadStatus })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value} className="text-white">
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Atribuir a</Label>
                <Select value={leadForm.assignedTo} onValueChange={(value) => setLeadForm({ ...leadForm, assignedTo: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {TEAM_MEMBERS.map(member => (
                      <SelectItem key={member} value={member} className="text-white">
                        {member}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleSaveLead} disabled={createLeadMutation.isPending || updateLeadMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-60">
                {editingLeadId ? (updateLeadMutation.isPending ? 'Salvando...' : 'Salvar Alterações') : (createLeadMutation.isPending ? 'Criando...' : 'Criar Lead')}
              </Button>
              <Button onClick={closeLeadForm} className="bg-gray-700 hover:bg-gray-600 text-white">
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {STATUSES.map(status => {
            const count = leads.filter(l => l.status === status.value).length;
            return (
              <Card key={status.value} className={`p-3 text-center transition-opacity ${STATUS_COLORS[status.value]}`}>
                <p className="text-xs font-bold">{status.label}</p>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </Card>
            );
          })}
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <Card className="bg-gray-900/50 border-gray-700/50 p-6 text-center">
              <p className="text-gray-400">Carregando leads persistidos...</p>
            </Card>
          ) : isError ? (
            <Card className="bg-red-950/40 border-red-800/60 p-6 text-center">
              <p className="text-red-300 font-semibold">Não foi possível carregar os leads persistidos.</p>
              <p className="text-red-200/80 text-sm mt-2">{error?.message || 'Verifique a conexão com o banco e tente novamente.'}</p>
            </Card>
          ) : leads.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-700/50 p-6 text-center">
              <p className="text-gray-400">Nenhum lead criado. Cadastre o primeiro lead para iniciar o pipeline comercial.</p>
            </Card>
          ) : (
            leads.map(lead => (
              <Card key={lead.id} className={`p-4 border-l-4 ${STATUS_COLORS[lead.status]} bg-gray-900/50`}>
                <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{lead.name}</h3>
                    <p className="text-sm text-gray-300">{lead.company}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {lead.email} • {lead.phone || 'Telefone não informado'} • Responsável: {lead.assignedTo}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-lg font-bold text-cyan-400">R$ {lead.estimatedValue.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-purple-400">Comissão prevista: R$ {Number(calculateCommission(lead.estimatedValue)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <Select value={lead.status} onValueChange={(value) => handleUpdateStatus(lead, value as LeadStatus)} disabled={isMutating}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value} className="text-white">
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-bold text-gray-400 mb-2">Interações ({lead.interactions.length})</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {lead.interactions.length === 0 ? (
                      <p className="text-xs text-gray-500">Nenhuma interação registrada.</p>
                    ) : lead.interactions.map(interaction => (
                      <div key={interaction.id} className="bg-gray-800/50 border border-gray-700 rounded p-2">
                        <p className="text-xs font-bold text-cyan-400">{interaction.type.toUpperCase()}</p>
                        <p className="text-xs text-gray-300">{interaction.content}</p>
                        <p className="text-xs text-gray-500">{new Date(interaction.date).toLocaleString('pt-BR')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {showInteractionForm === lead.id ? (
                  <div className="bg-gray-800/50 border border-gray-700 rounded p-3 mb-3 space-y-2">
                    <Select value={interactionForm.type} onValueChange={(value) => setInteractionForm({ ...interactionForm, type: value as InteractionType })}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {INTERACTION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value} className="text-white">{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="date"
                      value={interactionForm.date}
                      onChange={(e) => setInteractionForm({ ...interactionForm, date: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white text-sm"
                    />

                    <Input
                      placeholder="Descreva a interação..."
                      value={interactionForm.content}
                      onChange={(e) => setInteractionForm({ ...interactionForm, content: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white text-sm"
                    />

                    <Input
                      placeholder="Notas adicionais ou próximos passos"
                      value={interactionForm.notes}
                      onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white text-sm"
                    />

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddInteraction(lead.id)}
                        disabled={addInteractionMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm flex-1 disabled:opacity-60"
                      >
                        {addInteractionMutation.isPending ? 'Registrando...' : 'Registrar'}
                      </Button>
                      <Button
                        onClick={() => setShowInteractionForm(null)}
                        className="bg-gray-700 hover:bg-gray-600 text-white text-sm"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowInteractionForm(lead.id)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-sm mb-3"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Registrar Interação
                  </Button>
                )}

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <Button
                    onClick={() => openEditLeadForm(lead)}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                    disabled={isMutating}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar Lead
                  </Button>
                  <Button
                    onClick={() => handleArchiveLead(lead)}
                    variant="destructive"
                    className="w-full"
                    disabled={isMutating || lead.status === 'arquivado'}
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    {lead.status === 'arquivado' ? 'Lead Arquivado' : 'Arquivar Lead'}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
