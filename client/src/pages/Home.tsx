import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Users, Briefcase, DollarSign, AlertCircle, CheckCircle } from "lucide-react";

export default function Home() {
  const { data: projects = [] } = trpc.projects.list.useQuery();
  const { data: leads = [] } = trpc.crm.leads.useQuery();
  const { data: financials = [] } = trpc.financials.list.useQuery();

  // Calcular KPIs
  const activeProjects = projects.filter((p: any) => p.status === 'em_andamento').length;
  const totalLeads = leads.length;
  const totalRevenue = financials
    .filter((f: any) => f.type === 'receita' && f.status === 'confirmado')
    .reduce((sum: number, f: any) => sum + parseFloat(f.amount || 0), 0);
  const pendingTasks = leads.filter((l: any) => l.status === 'triagem' || l.status === 'orcamento_elaboracao').length;

  const kpis = [
    {
      title: 'Projetos Ativos',
      value: activeProjects,
      icon: Briefcase,
      color: 'from-cyan-400 to-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Leads em Andamento',
      value: pendingTasks,
      icon: Users,
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Receita Confirmada',
      value: `R$ ${(totalRevenue / 1000).toFixed(1)}k`,
      icon: DollarSign,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total de Leads',
      value: totalLeads,
      icon: TrendingUp,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gradient">Dashboard Geral</h1>
          <p className="text-slate-400">Visão consolidada da Innovare Hub</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className={`p-6 ${kpi.bgColor} border border-white/10 rounded-lg hover:border-accent/50 transition-all duration-300`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">{kpi.title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${kpi.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projetos Recentes */}
          <Card className="backdrop-blur-md bg-white/5 border border-white/10 lg:col-span-2 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Projetos Recentes</h2>
              <a href="/projects" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                Ver todos →
              </a>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 5).map((project: any) => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-white">{project.name}</p>
                    <p className="text-sm text-slate-400">{project.client}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'em_andamento'
                        ? 'badge-active'
                        : project.status === 'concluido'
                        ? 'badge-completed'
                        : 'badge-pending'
                    }`}>
                      {project.phase.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Status Overview */}
          <Card className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-6">Status Geral</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-slate-400">Concluídos</span>
                </div>
                <span className="font-bold text-white">{projects.filter((p: any) => p.status === 'concluido').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-slate-400">Em Andamento</span>
                </div>
                <span className="font-bold text-white">{activeProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-slate-400">Pendentes</span>
                </div>
                <span className="font-bold text-white">{projects.filter((p: any) => p.status === 'backlog').length}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Leads Pipeline */}
        <Card className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Pipeline de Leads</h2>
            <a href="/crm" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
              Ver CRM →
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['entrada', 'triagem', 'orcamento_elaboracao', 'proposta_enviada', 'aprovado'].map((status) => {
              const count = leads.filter((l: any) => l.status === status).length;
              return (
                <div key={status} className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                  <p className="text-xs text-slate-400 mb-2">{status.replace(/_/g, ' ')}</p>
                  <p className="text-2xl font-bold text-cyan-400">{count}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
