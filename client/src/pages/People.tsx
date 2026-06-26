'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Edit2, Trash2, ChevronRight, Award, Briefcase, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const AREAS = ['Aviónica', 'Estrutura', 'Motor', 'Propulsão', 'Recuperação', 'Energia', 'Telemetria', 'Payload', 'Liderança', 'Administração', 'Financeiro', 'Marketing', 'Projetos', 'Tecnologia'];
const DEPARTMENTS = ['Engenharia', 'Administração', 'Financeiro', 'Marketing', 'Projetos', 'P&D', 'Operações', 'Liderança'];
const COMPETENCIES = ['Modelagem 3D', 'Eletrônica', 'Mecânica', 'Programação', 'Gestão de Projetos', 'Liderança', 'Comunicação', 'Análise de Dados', 'CAD', 'Prototipagem'];

const INITIAL_TEAM = [
  { id: 1, name: 'Gabriel Moraes Leite', email: 'gabriel@innovare.com', area: 'Liderança', department: 'Liderança', jobTitle: 'CEO / Diretor Geral', responsibilities: 'Estratégia geral, visão de negócio, tomada de decisão', competencies: { 'Liderança': 5, 'Modelagem 3D': 4, 'Gestão de Projetos': 4 } },
  { id: 2, name: 'Larissa Ramalho Silva', email: 'larissa@innovare.com', area: 'Administração', department: 'Administração', jobTitle: 'Sócia Formal', responsibilities: 'Administração, governança, compliance', competencies: { 'Gestão de Projetos': 5, 'Comunicação': 5, 'Liderança': 4 } },
  { id: 3, name: 'Nicolly Ilcon', email: 'nicolly@innovare.com', area: 'Financeiro', department: 'Financeiro', jobTitle: 'CFO / Diretora Financeira', responsibilities: 'Gestão financeira, planejamento orçamentário, controladoria', competencies: { 'Análise de Dados': 5, 'Gestão de Projetos': 4, 'Comunicação': 4 } },
  { id: 4, name: 'Amanda Morais Leite', email: 'amanda@innovare.com', area: 'Marketing', department: 'Marketing', jobTitle: 'CMO / Marketing & Growth', responsibilities: 'Marketing estratégico, branding, comunicação', competencies: { 'Comunicação': 5, 'Liderança': 3, 'Análise de Dados': 3 } },
  { id: 5, name: 'Yasmim Morais Leite Veloso', email: 'yasmim@innovare.com', area: 'Projetos', department: 'Projetos', jobTitle: 'CX / Projetos & Experiência', responsibilities: 'Gestão de projetos, experiência do cliente, briefing', competencies: { 'Gestão de Projetos': 5, 'Comunicação': 5, 'Liderança': 4 } },
  { id: 6, name: 'Davi Matheus Pacito', email: 'davi@innovare.com', area: 'Projetos', department: 'Projetos', jobTitle: 'PM / Gerente de Projetos', responsibilities: 'Planejamento, execução, controle de qualidade', competencies: { 'Gestão de Projetos': 5, 'Programação': 3, 'Eletrônica': 2 } },
  { id: 7, name: 'Gabriel Nunes Veloso', email: 'gabriel.nunes@innovare.com', area: 'Tecnologia', department: 'Tecnologia', jobTitle: 'CTO / Tecnologia & P&D', responsibilities: 'Arquitetura de sistemas, eletrônica, satélites', competencies: { 'Eletrônica': 5, 'Programação': 5, 'Modelagem 3D': 4 } },
  { id: 8, name: 'Vinícius Goulart', email: 'vinicius@innovare.com', area: 'Engenharia', department: 'Engenharia', jobTitle: 'Engenheiro de Estruturas', responsibilities: 'Projeto estrutural, análise de resistência, prototipagem', competencies: { 'Mecânica': 5, 'CAD': 5, 'Prototipagem': 4 } },
  { id: 9, name: 'Laura Martins', email: 'laura@innovare.com', area: 'Engenharia', department: 'Engenharia', jobTitle: 'Engenheira de Aviónica', responsibilities: 'Sistemas de aviónica, eletrônica embarcada, testes', competencies: { 'Eletrônica': 5, 'Programação': 4, 'Análise de Dados': 3 } },
];

export default function People() {
  const [team, setTeam] = useState<typeof INITIAL_TEAM>(INITIAL_TEAM as any);
  const [showForm, setShowForm] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<(typeof INITIAL_TEAM)[0] | null>(null);
  const [editingCompetencies, setEditingCompetencies] = useState(false);
  const [formData, setFormData] = useState<{ name: string; email: string; area: string; department: string; jobTitle: string; responsibilities: string }>({ name: '', email: '', area: '', department: '', jobTitle: '', responsibilities: '' });

  const handleAddPerson = () => {
    if (!formData.name || !formData.email || !formData.area) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    const newPerson = {
      id: Math.max(...team.map(p => p.id)) + 1,
      ...formData,
      competencies: {} as any
    } as any;
    setTeam([...team, newPerson]);
    setFormData({ name: '', email: '', area: '', department: '', jobTitle: '', responsibilities: '' });
    setShowForm(false);
    toast.success(`${newPerson.name} adicionado com sucesso!`);
  };

  const handleDeletePerson = (id: number) => {
    setTeam(team.filter(p => p.id !== id));
    toast.success('Pessoa removida');
  };

  const handleUpdateCompetency = (personId: number, skill: string, level: number) => {
    setTeam(team.map(p => 
      p.id === personId 
        ? { ...p, competencies: { ...(p.competencies as any), [skill]: level } }
        : p
    ) as any);
  };

  const handleUpdatePerson = (personId: number, field: string, value: string) => {
    setTeam(team.map(p => 
      p.id === personId 
        ? { ...p, [field]: value }
        : p
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Gestão de Pessoas</h1>
              <p className="text-cyan-300 text-sm">Equipe Innovare Hub</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Pessoa
          </Button>
        </div>

        {/* Formulário de Adição */}
        {showForm && (
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Adicionar Nova Pessoa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400"
              />
              <select
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              >
                <option value="">Selecione a Área</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              >
                <option value="">Selecione o Departamento</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input
                type="text"
                placeholder="Cargo/Função no CNPJ"
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 md:col-span-2"
              />
              <textarea
                placeholder="Responsabilidades"
                value={formData.responsibilities}
                onChange={(e) => setFormData({...formData, responsibilities: e.target.value})}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 md:col-span-2 h-20"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddPerson} className="bg-green-600 hover:bg-green-700">Adicionar</Button>
              <Button onClick={() => setShowForm(false)} className="bg-slate-600 hover:bg-slate-700">Cancelar</Button>
            </div>
          </Card>
        )}

        {/* Grid de Pessoas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map(person => (
            <Card key={person.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-cyan-500 transition cursor-pointer" onClick={() => setSelectedPerson(person)}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{person.name}</h3>
                    <p className="text-cyan-400 text-sm">{person.jobTitle}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedPerson(person); setEditingCompetencies(true); }} className="p-1 hover:bg-slate-700 rounded">
                      <Edit2 className="w-4 h-4 text-orange-400" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeletePerson(person.id); }} className="p-1 hover:bg-slate-700 rounded">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>{person.area}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Briefcase className="w-4 h-4 text-orange-400" />
                    <span>{person.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Award className="w-4 h-4 text-green-400" />
                    <span>{Object.keys(person.competencies || {}).length} competências</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{person.email}</span>
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Perfil Detalhado */}
        {selectedPerson && !editingCompetencies && (
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedPerson.name}</h2>
              <Button onClick={() => setSelectedPerson(null)} className="bg-slate-600 hover:bg-slate-700">Fechar</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-cyan-400 font-bold mb-3">Informações Profissionais</h3>
                <div className="space-y-2 text-slate-300">
                  <div><span className="text-slate-400">Email:</span> {selectedPerson.email}</div>
                  <div><span className="text-slate-400">Área:</span> {selectedPerson.area}</div>
                  <div><span className="text-slate-400">Departamento:</span> {selectedPerson.department}</div>
                  <div><span className="text-slate-400">Cargo:</span> {selectedPerson.jobTitle}</div>
                </div>
              </div>

              <div>
                <h3 className="text-cyan-400 font-bold mb-3">Responsabilidades</h3>
                <p className="text-slate-300 text-sm">{selectedPerson.responsibilities || 'Não definidas'}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-cyan-400 font-bold mb-3">Competências</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(selectedPerson?.competencies || {}).map(([skill, level]: [string, number]) => (
                  <div key={skill} className="bg-slate-700/50 p-3 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">{skill}</span>
                      <span className="text-cyan-400 text-xs">{level}/5</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-500 to-orange-500 h-2 rounded-full" style={{width: `${(level/5)*100}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Edição de Competências */}
        {editingCompetencies && selectedPerson && (
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Editar Competências - {selectedPerson.name}</h2>
              <Button onClick={() => { setEditingCompetencies(false); setSelectedPerson(null); }} className="bg-slate-600 hover:bg-slate-700">Fechar</Button>
            </div>

            <div className="space-y-4">
              {COMPETENCIES.map(skill => (
                <div key={skill} className="bg-slate-700/50 p-4 rounded">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">{skill}</span>
                    <span className="text-cyan-400 text-sm">{(selectedPerson?.competencies as any)?.[skill] || 0}/5</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={((selectedPerson?.competencies as any)?.[skill] || 0) as number}
                    onChange={(e) => selectedPerson && handleUpdateCompetency(selectedPerson.id, skill, parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <Button onClick={() => { setEditingCompetencies(false); toast.success('Competências atualizadas!'); }} className="bg-green-600 hover:bg-green-700">Salvar</Button>
              <Button onClick={() => { setEditingCompetencies(false); setSelectedPerson(null); }} className="bg-slate-600 hover:bg-slate-700">Cancelar</Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
