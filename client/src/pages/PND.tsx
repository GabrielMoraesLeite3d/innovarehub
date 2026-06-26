import { useState } from 'react';
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
import { Plus, Trash2, Lock } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';

interface Patent {
  id: string;
  name: string;
  description: string;
  status: 'rascunho' | 'em_analise' | 'depositada' | 'concedida' | 'rejeitada';
  filingDate: string;
  inventors: string[];
  confidential: boolean;
  createdAt: string;
}

interface Research {
  id: string;
  title: string;
  description: string;
  status: 'planejamento' | 'em_andamento' | 'concluida' | 'publicada';
  team: string[];
  startDate: string;
  endDate: string;
  confidential: boolean;
  createdAt: string;
}

const TEAM_MEMBERS = ['Gabriel', 'Larissa', 'Nicolly', 'Amanda', 'Yasmim', 'Davi', 'Gabriel N.', 'Vinícius', 'Laura'];

const STATUS_COLORS: Record<string, string> = {
  'rascunho': 'bg-gray-500/20 text-gray-300',
  'em_analise': 'bg-blue-500/20 text-blue-300',
  'depositada': 'bg-cyan-500/20 text-cyan-300',
  'concedida': 'bg-green-500/20 text-green-300',
  'rejeitada': 'bg-red-500/20 text-red-300',
  'planejamento': 'bg-yellow-500/20 text-yellow-300',
  'em_andamento': 'bg-purple-500/20 text-purple-300',
  'concluida': 'bg-green-500/20 text-green-300',
  'publicada': 'bg-indigo-500/20 text-indigo-300',
};

export default function PND() {
  const [patents, setPatents] = useState<Patent[]>([
    {
      id: '1',
      name: 'Sistema de Recuperação Modular',
      description: 'Sistema inovador de recuperação para foguetes',
      status: 'depositada',
      filingDate: '2026-01-15',
      inventors: ['Gabriel', 'Nicolly'],
      confidential: true,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [research, setResearch] = useState<Research[]>([
    {
      id: '1',
      title: 'Análise de Materiais Compósitos',
      description: 'Pesquisa sobre materiais compósitos para estruturas aeroespaciais',
      status: 'em_andamento',
      team: ['Larissa', 'Davi'],
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      confidential: false,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [showPatentForm, setShowPatentForm] = useState(false);
  const [showResearchForm, setShowResearchForm] = useState(false);

  const [patentForm, setPatentForm] = useState({
    name: '',
    description: '',
    status: 'rascunho' as const,
    filingDate: new Date().toISOString().split('T')[0],
    inventors: [] as string[],
    confidential: true,
  });

  const [researchForm, setResearchForm] = useState({
    title: '',
    description: '',
    status: 'planejamento' as const,
    team: [] as string[],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    confidential: false,
  });

  // Criar Patente
  const handleCreatePatent = () => {
    if (!patentForm.name || !patentForm.description) {
      toast.error('Preencha nome e descrição da patente');
      return;
    }

    const newPatent: Patent = {
      id: Math.random().toString(36).substr(2, 9),
      ...patentForm,
      createdAt: new Date().toISOString(),
    };

    setPatents([...patents, newPatent]);
    setPatentForm({
      name: '',
      description: '',
      status: 'rascunho',
      filingDate: new Date().toISOString().split('T')[0],
      inventors: [],
      confidential: true,
    });
    setShowPatentForm(false);
    toast.success('✅ Patente criada!');
  };

  // Criar Pesquisa
  const handleCreateResearch = () => {
    if (!researchForm.title || !researchForm.description) {
      toast.error('Preencha título e descrição da pesquisa');
      return;
    }

    const newResearch: Research = {
      id: Math.random().toString(36).substr(2, 9),
      ...researchForm,
      createdAt: new Date().toISOString(),
    };

    setResearch([...research, newResearch]);
    setResearchForm({
      title: '',
      description: '',
      status: 'planejamento',
      team: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      confidential: false,
    });
    setShowResearchForm(false);
    toast.success('✅ Pesquisa criada!');
  };

  // Deletar Patente
  const handleDeletePatent = (patentId: string) => {
    setPatents(patents.filter(p => p.id !== patentId));
    toast.success('✅ Patente deletada!');
  };

  // Deletar Pesquisa
  const handleDeleteResearch = (researchId: string) => {
    setResearch(research.filter(r => r.id !== researchId));
    toast.success('✅ Pesquisa deletada!');
  };

  // Atualizar Status
  const handleUpdatePatentStatus = (patentId: string, newStatus: Patent['status']) => {
    setPatents(patents.map(p => (p.id === patentId ? { ...p, status: newStatus } : p)));
    toast.success('✅ Status atualizado!');
  };

  const handleUpdateResearchStatus = (researchId: string, newStatus: Research['status']) => {
    setResearch(research.map(r => (r.id === researchId ? { ...r, status: newStatus } : r)));
    toast.success('✅ Status atualizado!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-cyan-400">🔬 P&D, Patentes & Sigilo</h1>

        {/* Patentes */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">📜 Patentes</h2>
            <Button
              onClick={() => setShowPatentForm(!showPatentForm)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Patente
            </Button>
          </div>

          {showPatentForm && (
            <Card className="bg-gray-900/50 border-gray-700/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Registrar Nova Patente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-gray-300">Nome da Patente *</Label>
                  <Input
                    placeholder="Ex: Sistema de Recuperação Modular"
                    value={patentForm.name}
                    onChange={(e) => setPatentForm({ ...patentForm, name: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-gray-300">Descrição *</Label>
                  <Input
                    placeholder="Descrição da patente"
                    value={patentForm.description}
                    onChange={(e) => setPatentForm({ ...patentForm, description: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Status</Label>
                  <Select value={patentForm.status} onValueChange={(value: any) => setPatentForm({ ...patentForm, status: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="rascunho" className="text-white">Rascunho</SelectItem>
                      <SelectItem value="em_analise" className="text-white">Em Análise</SelectItem>
                      <SelectItem value="depositada" className="text-white">Depositada</SelectItem>
                      <SelectItem value="concedida" className="text-white">Concedida</SelectItem>
                      <SelectItem value="rejeitada" className="text-white">Rejeitada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Data de Depósito</Label>
                  <Input
                    type="date"
                    value={patentForm.filingDate}
                    onChange={(e) => setPatentForm({ ...patentForm, filingDate: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-gray-300">Inventores</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-800 border border-gray-700 rounded p-2">
                    {TEAM_MEMBERS.map(member => (
                      <label key={member} className="flex items-center gap-2 text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={patentForm.inventors.includes(member)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPatentForm({ ...patentForm, inventors: [...patentForm.inventors, member] });
                            } else {
                              setPatentForm({ ...patentForm, inventors: patentForm.inventors.filter(m => m !== member) });
                            }
                          }}
                          className="w-4 h-4"
                        />
                        {member}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={patentForm.confidential}
                      onChange={(e) => setPatentForm({ ...patentForm, confidential: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Lock className="w-4 h-4" />
                    Documento Sigiloso
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreatePatent} className="bg-green-600 hover:bg-green-700 text-white">
                  ✅ Registrar Patente
                </Button>
                <Button onClick={() => setShowPatentForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white">
                  Cancelar
                </Button>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {patents.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-700/50 p-6 text-center">
                <p className="text-gray-400">Nenhuma patente registrada</p>
              </Card>
            ) : (
              patents.map(patent => (
                <Card key={patent.id} className={`p-4 border-l-4 ${STATUS_COLORS[patent.status]} bg-gray-900/50`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-lg">{patent.name}</h3>
                        {patent.confidential && <Lock className="w-4 h-4 text-red-400" />}
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{patent.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        👥 {patent.inventors.join(', ')} • 📅 {patent.filingDate}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleDeletePatent(patent.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <Select value={patent.status} onValueChange={(value: any) => handleUpdatePatentStatus(patent.id, value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="rascunho" className="text-white">Rascunho</SelectItem>
                      <SelectItem value="em_analise" className="text-white">Em Análise</SelectItem>
                      <SelectItem value="depositada" className="text-white">Depositada</SelectItem>
                      <SelectItem value="concedida" className="text-white">Concedida</SelectItem>
                      <SelectItem value="rejeitada" className="text-white">Rejeitada</SelectItem>
                    </SelectContent>
                  </Select>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Pesquisas */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">📚 Pesquisas</h2>
            <Button
              onClick={() => setShowResearchForm(!showResearchForm)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Pesquisa
            </Button>
          </div>

          {showResearchForm && (
            <Card className="bg-gray-900/50 border-gray-700/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Iniciar Nova Pesquisa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-gray-300">Título *</Label>
                  <Input
                    placeholder="Ex: Análise de Materiais Compósitos"
                    value={researchForm.title}
                    onChange={(e) => setResearchForm({ ...researchForm, title: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-gray-300">Descrição *</Label>
                  <Input
                    placeholder="Descrição da pesquisa"
                    value={researchForm.description}
                    onChange={(e) => setResearchForm({ ...researchForm, description: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Status</Label>
                  <Select value={researchForm.status} onValueChange={(value: any) => setResearchForm({ ...researchForm, status: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="planejamento" className="text-white">Planejamento</SelectItem>
                      <SelectItem value="em_andamento" className="text-white">Em Andamento</SelectItem>
                      <SelectItem value="concluida" className="text-white">Concluída</SelectItem>
                      <SelectItem value="publicada" className="text-white">Publicada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Data de Início</Label>
                  <Input
                    type="date"
                    value={researchForm.startDate}
                    onChange={(e) => setResearchForm({ ...researchForm, startDate: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Data de Término</Label>
                  <Input
                    type="date"
                    value={researchForm.endDate}
                    onChange={(e) => setResearchForm({ ...researchForm, endDate: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-gray-300">Equipe</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-800 border border-gray-700 rounded p-2">
                    {TEAM_MEMBERS.map(member => (
                      <label key={member} className="flex items-center gap-2 text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={researchForm.team.includes(member)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setResearchForm({ ...researchForm, team: [...researchForm.team, member] });
                            } else {
                              setResearchForm({ ...researchForm, team: researchForm.team.filter(m => m !== member) });
                            }
                          }}
                          className="w-4 h-4"
                        />
                        {member}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={researchForm.confidential}
                      onChange={(e) => setResearchForm({ ...researchForm, confidential: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Lock className="w-4 h-4" />
                    Pesquisa Confidencial
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateResearch} className="bg-green-600 hover:bg-green-700 text-white">
                  ✅ Iniciar Pesquisa
                </Button>
                <Button onClick={() => setShowResearchForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white">
                  Cancelar
                </Button>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {research.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-700/50 p-6 text-center">
                <p className="text-gray-400">Nenhuma pesquisa iniciada</p>
              </Card>
            ) : (
              research.map(r => (
                <Card key={r.id} className={`p-4 border-l-4 ${STATUS_COLORS[r.status]} bg-gray-900/50`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-lg">{r.title}</h3>
                        {r.confidential && <Lock className="w-4 h-4 text-red-400" />}
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{r.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        👥 {r.team.join(', ')} • 📅 {r.startDate} a {r.endDate}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleDeleteResearch(r.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <Select value={r.status} onValueChange={(value: any) => handleUpdateResearchStatus(r.id, value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="planejamento" className="text-white">Planejamento</SelectItem>
                      <SelectItem value="em_andamento" className="text-white">Em Andamento</SelectItem>
                      <SelectItem value="concluida" className="text-white">Concluída</SelectItem>
                      <SelectItem value="publicada" className="text-white">Publicada</SelectItem>
                    </SelectContent>
                  </Select>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
