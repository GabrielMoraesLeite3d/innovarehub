import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Plus, Wrench, AlertCircle } from "lucide-react";

const STATUS_COLORS = {
  disponivel: 'bg-green-500/20 text-green-300',
  em_uso: 'bg-cyan-500/20 text-cyan-300',
  manutencao: 'bg-yellow-500/20 text-yellow-300',
  defeito: 'bg-red-500/20 text-red-300',
  inativo: 'bg-gray-500/20 text-gray-300',
};

const RESOURCE_TYPES = [
  { id: 'impressora_3d', label: 'Impressora 3D', icon: '🖨️' },
  { id: 'prototipagem', label: 'Prototipagem', icon: '⚙️' },
  { id: 'ferramentas', label: 'Ferramentas', icon: '🔧' },
  { id: 'equipamento', label: 'Equipamento', icon: '⚡' },
  { id: 'software', label: 'Software', icon: '💻' },
  { id: 'materiais', label: 'Materiais', icon: '📦' },
];

export default function Resources() {
  const { data: resources = [] } = trpc.resources.list.useQuery();

  const resourcesByType = RESOURCE_TYPES.map(type => ({
    ...type,
    items: resources.filter((r: any) => r.type === type.id),
  }));

  const availableCount = resources.filter((r: any) => r.status === 'disponivel').length;
  const inUseCount = resources.filter((r: any) => r.status === 'em_uso').length;
  const maintenanceCount = resources.filter((r: any) => r.status === 'manutencao').length;
  const defectCount = resources.filter((r: any) => r.status === 'defeito').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-cyan-400" />
              <h1 className="text-4xl font-bold text-gradient">Recursos & Infraestrutura</h1>
            </div>
            <p className="text-slate-400 mt-2">Gestão de equipamentos, impressão 3D e prototipagem</p>
          </div>
          <Button className="btn-cinema">
            <Plus className="w-5 h-5 mr-2" />
            Novo Recurso
          </Button>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Total de Recursos</p>
            <p className="text-3xl font-bold text-white">{resources.length}</p>
          </Card>
          <Card className="backdrop-blur-md bg-green-500/10 border border-green-500/30 p-6 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Disponíveis</p>
            <p className="text-3xl font-bold text-green-400">{availableCount}</p>
          </Card>
          <Card className="backdrop-blur-md bg-cyan-500/10 border border-cyan-500/30 p-6 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Em Uso</p>
            <p className="text-3xl font-bold text-cyan-400">{inUseCount}</p>
          </Card>
          <Card className="backdrop-blur-md bg-red-500/10 border border-red-500/30 p-6 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Defeitos/Manutenção</p>
            <p className="text-3xl font-bold text-red-400">{maintenanceCount + defectCount}</p>
          </Card>
        </div>

        {/* Resources by Type */}
        <div className="space-y-6">
          {resourcesByType.map((type) => (
            <Card key={type.id} className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{type.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{type.label}</h2>
                  <p className="text-sm text-slate-400">{type.items.length} recurso(s)</p>
                </div>
              </div>

              {type.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {type.items.map((resource: any) => (
                    <div
                      key={resource.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white text-sm">{resource.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                          STATUS_COLORS[resource.status as keyof typeof STATUS_COLORS]
                        }`}>
                          {resource.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {resource.description && (
                        <p className="text-xs text-slate-400 mb-2">{resource.description}</p>
                      )}

                      <div className="space-y-1 text-xs text-slate-400">
                        {resource.location && (
                          <p>📍 {resource.location}</p>
                        )}
                        {resource.lastMaintenance && (
                          <p>🔧 Manutenção: {new Date(resource.lastMaintenance).toLocaleDateString('pt-BR')}</p>
                        )}
                        {resource.nextMaintenance && (
                          <p>📅 Próxima: {new Date(resource.nextMaintenance).toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>

                      {resource.status === 'defeito' && (
                        <div className="mt-3 p-2 rounded bg-red-500/20 border border-red-500/30 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-red-300">{resource.defectDescription || 'Defeito registrado'}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Nenhum recurso deste tipo</p>
              )}
            </Card>
          ))}
        </div>

        {/* Maintenance Schedule */}
        <Card className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-6">Cronograma de Manutenção</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold">Recurso</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold">Tipo</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold">Última Manutenção</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold">Próxima Manutenção</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {resources
                  .filter((r: any) => r.lastMaintenance || r.nextMaintenance)
                  .map((resource: any) => (
                    <tr key={resource.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{resource.name}</td>
                      <td className="py-3 px-4 text-slate-400">{resource.type}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {resource.lastMaintenance
                          ? new Date(resource.lastMaintenance).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {resource.nextMaintenance
                          ? new Date(resource.nextMaintenance).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          STATUS_COLORS[resource.status as keyof typeof STATUS_COLORS]
                        }`}>
                          {resource.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
