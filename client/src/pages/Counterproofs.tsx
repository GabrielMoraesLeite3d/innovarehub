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
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';

interface Counterproof {
  id: string;
  title: string;
  description: string;
  responsible: string;
  date: string;
  status: 'planejada' | 'em_execucao' | 'concluida' | 'validada' | 'reprovada';
  result: string;
  details: string;
  createdAt: string;
}

const TEAM_MEMBERS = ['Gabriel', 'Larissa', 'Nicolly', 'Amanda', 'Yasmim', 'Davi', 'Gabriel N.', 'Vinícius', 'Laura'];

export default function Counterproofs() {
  const [counterproofs, setCounterproofs] = useState<Counterproof[]>([
    {
      id: '1',
      title: 'Teste de Resistência - Estrutura Modular',
      description: 'Validação de resistência mecânica da estrutura modular',
      responsible: 'Gabriel N.',
      date: '2026-04-15',
      status: 'validada',
      result: 'Aprovado',
      details: 'Estrutura suportou 150% da carga esperada sem deformação',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsible: 'Gabriel',
    date: new Date().toISOString().split('T')[0],
    status: 'planejada' as const,
    result: '',
    details: '',
  });

  const handleCreateCounterproof = () => {
    if (!formData.title || !formData.description) {
      toast.error('Preencha título e descrição');
      return;
    }

    const newCounterproof: Counterproof = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    setCounterproofs([...counterproofs, newCounterproof]);
    setFormData({
      title: '',
      description: '',
      responsible: 'Gabriel',
      date: new Date().toISOString().split('T')[0],
      status: 'planejada',
      result: '',
      details: '',
    });
    setShowForm(false);
    toast.success('✅ Contraprova registrada!');
  };

  const handleDeleteCounterproof = (id: string) => {
    setCounterproofs(counterproofs.filter(c => c.id !== id));
    toast.success('✅ Contraprova deletada!');
  };

  const handleUpdateStatus = (id: string, newStatus: Counterproof['status']) => {
    setCounterproofs(counterproofs.map(c => (c.id === id ? { ...c, status: newStatus } : c)));
    toast.success('✅ Status atualizado!');
  };

  const validatedCount = counterproofs.filter(c => c.status === 'validada').length;
  const inProgressCount = counterproofs.filter(c => c.status === 'em_execucao').length;
  const plannedCount = counterproofs.filter(c => c.status === 'planejada').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-cyan-400">✅ Contraprovas Técnicas</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Contraprova
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50 p-6">
            <p className="text-gray-400 text-sm">Total</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">{counterproofs.length}</p>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700/50 p-6">
            <p className="text-gray-400 text-sm">Planejadas</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">{plannedCount}</p>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/50 border-cyan-700/50 p-6">
            <p className="text-gray-400 text-sm">Em Execução</p>
            <p className="text-3xl font-bold text-cyan-400 mt-2">{inProgressCount}</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50 p-6">
            <p className="text-gray-400 text-sm">Validadas</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{validatedCount}</p>
          </Card>
        </div>

        {showForm && (
          <Card className="bg-gray-900/50 border-gray-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Registrar Nova Contraprova</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-gray-300">Título *</Label>
                <Input
                  placeholder="Ex: Teste de Resistência - Estrutura"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-gray-300">Descrição *</Label>
                <Input
                  placeholder="Descrição do teste"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Responsável</Label>
                <Select value={formData.responsible} onValueChange={(value) => setFormData({ ...formData, responsible: value })}>
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

              <div>
                <Label className="text-gray-300">Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="planejada" className="text-white">Planejada</SelectItem>
                    <SelectItem value="em_execucao" className="text-white">Em Execução</SelectItem>
                    <SelectItem value="concluida" className="text-white">Concluída</SelectItem>
                    <SelectItem value="validada" className="text-white">Validada</SelectItem>
                    <SelectItem value="reprovada" className="text-white">Reprovada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Resultado</Label>
                <Input
                  placeholder="Ex: Aprovado, Reprovado"
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-gray-300">Detalhes</Label>
                <Input
                  placeholder="Detalhes do resultado"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreateCounterproof} className="bg-green-600 hover:bg-green-700 text-white">
                ✅ Registrar
              </Button>
              <Button onClick={() => setShowForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white">
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white">📋 Contraprovas Registradas</h2>
          {counterproofs.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-700/50 p-6 text-center">
              <p className="text-gray-400">Nenhuma contraprova registrada</p>
            </Card>
          ) : (
            counterproofs.map(cp => (
              <Card key={cp.id} className="bg-gray-900/50 border-gray-700/50 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {cp.status === 'validada' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : cp.status === 'em_execucao' ? (
                        <Clock className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-blue-400" />
                      )}
                      <h3 className="font-bold text-white text-lg">{cp.title}</h3>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{cp.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      👤 {cp.responsible} • 📅 {cp.date}
                    </p>
                    {cp.result && (
                      <p className="text-sm text-cyan-300 mt-2">
                        <strong>Resultado:</strong> {cp.result}
                      </p>
                    )}
                    {cp.details && (
                      <p className="text-sm text-gray-300 mt-1">
                        <strong>Detalhes:</strong> {cp.details}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className={`text-xs px-2 py-1 rounded ${
                      cp.status === 'planejada'
                        ? 'bg-blue-500/20 text-blue-300'
                        : cp.status === 'em_execucao'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : cp.status === 'validada'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {cp.status.replace(/_/g, ' ').toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Select value={cp.status} onValueChange={(value: any) => handleUpdateStatus(cp.id, value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="planejada" className="text-white">Planejada</SelectItem>
                      <SelectItem value="em_execucao" className="text-white">Em Execução</SelectItem>
                      <SelectItem value="concluida" className="text-white">Concluída</SelectItem>
                      <SelectItem value="validada" className="text-white">Validada</SelectItem>
                      <SelectItem value="reprovada" className="text-white">Reprovada</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => handleDeleteCounterproof(cp.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
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
