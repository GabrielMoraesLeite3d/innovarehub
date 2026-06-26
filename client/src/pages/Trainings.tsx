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
import { Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number;
  startDate: string;
  endDate: string;
  participants: string[];
  status: 'planejado' | 'em_andamento' | 'concluido';
  createdAt: string;
}

const TEAM_MEMBERS = ['Gabriel', 'Larissa', 'Nicolly', 'Amanda', 'Yasmim', 'Davi', 'Gabriel N.', 'Vinícius', 'Laura'];

export default function Trainings() {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Modelagem 3D Avançada com Fusion 360',
      description: 'Curso avançado de modelagem 3D para projetos de engenharia',
      instructor: 'Gabriel',
      duration: 40,
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      participants: ['Larissa', 'Nicolly', 'Amanda'],
      status: 'em_andamento',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: 'Gabriel',
    duration: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'planejado' as const,
  });

  const handleCreateCourse = () => {
    if (!formData.title || !formData.description || formData.duration <= 0 || selectedParticipants.length === 0) {
      toast.error('Preencha todos os campos e selecione participantes');
      return;
    }

    const newCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      participants: selectedParticipants,
      createdAt: new Date().toISOString(),
    };

    setCourses([...courses, newCourse]);
    setFormData({
      title: '',
      description: '',
      instructor: 'Gabriel',
      duration: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: 'planejado',
    });
    setSelectedParticipants([]);
    setShowForm(false);
    toast.success('✅ Curso criado!');
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    toast.success('✅ Curso deletado!');
  };

  const handleUpdateStatus = (id: string, newStatus: Course['status']) => {
    setCourses(courses.map(c => (c.id === id ? { ...c, status: newStatus } : c)));
    toast.success('✅ Status atualizado!');
  };

  const toggleParticipant = (member: string) => {
    setSelectedParticipants(prev =>
      prev.includes(member) ? prev.filter(m => m !== member) : [...prev, member]
    );
  };

  const totalCourses = courses.length;
  const coursesInProgress = courses.filter(c => c.status === 'em_andamento').length;
  const completedCourses = courses.filter(c => c.status === 'concluido').length;
  const totalParticipants = new Set(courses.flatMap(c => c.participants)).size;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-cyan-400">📚 Treinamentos & Capacitação</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Curso
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50 p-6">
            <p className="text-gray-400 text-sm">Total de Cursos</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">{totalCourses}</p>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700/50 p-6">
            <p className="text-gray-400 text-sm">Em Andamento</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">{coursesInProgress}</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50 p-6">
            <p className="text-gray-400 text-sm">Concluídos</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{completedCourses}</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50 p-6">
            <p className="text-gray-400 text-sm">Participantes</p>
            <p className="text-3xl font-bold text-purple-400 mt-2">{totalParticipants}</p>
          </Card>
        </div>

        {showForm && (
          <Card className="bg-gray-900/50 border-gray-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Criar Novo Curso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-gray-300">Título do Curso *</Label>
                <Input
                  placeholder="Ex: Modelagem 3D Avançada"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-gray-300">Descrição *</Label>
                <Input
                  placeholder="Descrição do curso"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Instrutor</Label>
                <Select value={formData.instructor} onValueChange={(value) => setFormData({ ...formData, instructor: value })}>
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
                <Label className="text-gray-300">Duração (horas) *</Label>
                <Input
                  type="number"
                  placeholder="40"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Data de Início *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Data de Término *</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-gray-300">Participantes *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {TEAM_MEMBERS.map(member => (
                    <button
                      key={member}
                      onClick={() => toggleParticipant(member)}
                      className={`p-2 rounded text-sm font-medium transition ${
                        selectedParticipants.includes(member)
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {member}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreateCourse} className="bg-green-600 hover:bg-green-700 text-white">
                ✅ Criar Curso
              </Button>
              <Button onClick={() => setShowForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white">
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white">📖 Cursos Disponíveis</h2>
          {courses.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-700/50 p-6 text-center">
              <p className="text-gray-400">Nenhum curso criado</p>
            </Card>
          ) : (
            courses.map(course => (
              <Card key={course.id} className="bg-gray-900/50 border-gray-700/50 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {course.status === 'concluido' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-400" />
                      )}
                      <h3 className="font-bold text-white text-lg">{course.title}</h3>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{course.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      👨‍🏫 {course.instructor} • ⏱️ {course.duration}h • 📅 {course.startDate} a {course.endDate}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {course.participants.map(p => (
                        <span key={p} className="px-2 py-1 bg-cyan-600/30 text-cyan-300 text-xs rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-xs px-2 py-1 rounded ${
                      course.status === 'planejado'
                        ? 'bg-gray-500/20 text-gray-300'
                        : course.status === 'em_andamento'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-green-500/20 text-green-300'
                    }`}>
                      {course.status === 'planejado' ? 'Planejado' : course.status === 'em_andamento' ? 'Em Andamento' : 'Concluído'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Select value={course.status} onValueChange={(value: any) => handleUpdateStatus(course.id, value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="planejado" className="text-white">Planejado</SelectItem>
                      <SelectItem value="em_andamento" className="text-white">Em Andamento</SelectItem>
                      <SelectItem value="concluido" className="text-white">Concluído</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => handleDeleteCourse(course.id)}
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
