import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Users } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const DEMO_USERS = [
  { id: 1, name: 'Gabriel', email: 'gabriel@innovare.com', teamType: 'innovare_team', role: 'admin' },
  { id: 2, name: 'Larissa', email: 'larissa@innovare.com', teamType: 'innovare_team', role: 'user' },
  { id: 3, name: 'Nicolly', email: 'nicolly@innovare.com', teamType: 'innovare_team', role: 'user' },
  { id: 4, name: 'Amanda', email: 'amanda@innovare.com', teamType: 'innovare_team', role: 'user' },
  { id: 5, name: 'Yasmim', email: 'yasmim@innovare.com', teamType: 'innovare_team', role: 'user' },
  { id: 6, name: 'Davi', email: 'davi@innovare.com', teamType: 'innovare_team', role: 'user' },
  { id: 7, name: 'Gabriel N.', email: 'gabrieln@innovare.com', teamType: 'innovare_team', role: 'user' },
  { id: 8, name: 'Vinícius', email: 'vinicius@innovare.com', teamType: 'innovare_team', role: 'user' },
  { id: 9, name: 'Laura', email: 'laura@innovare.com', teamType: 'innovare_team', role: 'user' },
  { id: 10, name: 'Rocket User 1', email: 'rocket1@example.com', teamType: 'rocket_team', role: 'user' },
  { id: 11, name: 'Rocket User 2', email: 'rocket2@example.com', teamType: 'rocket_team', role: 'user' },
];

export default function Admin() {
  const [users, setUsers] = useState(DEMO_USERS);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', teamType: 'innovare_team', role: 'user' });

  const handleAddUser = () => {
    if (formData.name && formData.email) {
      const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...formData,
      };
      setUsers([...users, newUser]);
      setFormData({ name: '', email: '', teamType: 'innovare_team', role: 'user' });
      setShowForm(false);
    }
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const innovareTeam = users.filter(u => u.teamType === 'innovare_team');
  const rocketTeam = users.filter(u => u.teamType === 'rocket_team');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Gerenciamento de Usuários</h1>
            <p className="text-slate-400 mt-2">Gerencie acessos e permissões do sistema</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="btn-cinema gap-2">
            <Plus className="w-4 h-4" />
            Novo Usuário
          </Button>
        </div>

        {/* Add User Form */}
        {showForm && (
          <Card className="p-6 backdrop-blur-md bg-white/5 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Adicionar Novo Usuário</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={formData.teamType}
                onChange={(e) => setFormData({ ...formData, teamType: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="innovare_team" className="bg-slate-900">Innovare Team</option>
                <option value="rocket_team" className="bg-slate-900">Rocket Team</option>
              </select>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="user" className="bg-slate-900">Usuário</option>
                <option value="admin" className="bg-slate-900">Admin</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddUser} className="btn-cinema">Adicionar</Button>
              <Button onClick={() => setShowForm(false)} variant="outline">Cancelar</Button>
            </div>
          </Card>
        )}

        {/* Innovare Team */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Innovare Team ({innovareTeam.length})</h2>
            <span className="text-sm text-slate-400">Acesso total ao sistema</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {innovareTeam.map(user => (
              <Card key={user.id} className="p-4 backdrop-blur-md bg-white/5 border border-cyan-500/30 hover:border-cyan-500/60 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white">{user.name}</h3>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'admin' ? 'bg-orange-500/20 text-orange-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                    {user.role === 'admin' ? 'Admin' : 'Usuário'}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Remover
                </button>
              </Card>
            ))}
          </div>
        </div>

        {/* Rocket Team */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Rocket Team ({rocketTeam.length})</h2>
            <span className="text-sm text-slate-400">Acesso apenas ao módulo Rocket</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rocketTeam.map(user => (
              <Card key={user.id} className="p-4 backdrop-blur-md bg-white/5 border border-orange-500/30 hover:border-orange-500/60 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white">{user.name}</h3>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-500/20 text-orange-300">
                    Usuário
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Remover
                </button>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <Card className="p-4 backdrop-blur-md bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-blue-300">
            <strong>Innovare Team:</strong> Acesso total a todos os 10 módulos (Dashboard, Projetos, CRM, Pessoas, Financeiro, P&D, Rocket, Recursos, Treinamentos, Contraprovas)<br />
            <strong>Rocket Team:</strong> Acesso APENAS ao módulo Innovare Rocket, sem visualizar nenhum outro módulo ou dado
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
