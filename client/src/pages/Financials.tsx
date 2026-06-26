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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Trash2, TrendingUp, TrendingDown, Loader2, CircleDollarSign, BarChart3, Search } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

type FinancialType = 'receita' | 'despesa' | 'comissao';
type FinancialStatus = 'previsto' | 'confirmado' | 'pago';
type PeriodFilter = 'todos' | 'mes_atual' | 'trimestre' | 'ano_atual' | 'customizado';

type FinancialRecord = {
  id: number;
  type: FinancialType | 'reembolso' | 'aporte';
  category: string | null;
  description: string;
  amount: string | number;
  date: Date | string;
  status: FinancialStatus | null;
  notes: string | null;
  createdAt?: Date | string;
};

type FinancialFormData = {
  type: FinancialType;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: FinancialStatus;
  notes: string;
};

const REVENUE_CATEGORIES = ['Projetos', 'Consultoria', 'Treinamentos', 'Licenças', 'Parcerias', 'Outros'];
const EXPENSE_CATEGORIES = ['Salários', 'Equipamentos', 'Materiais', 'Viagens', 'Serviços', 'Impostos', 'Outros'];
const COMMISSION_CATEGORIES = ['Comissões Comerciais', 'Indicação', 'Parceria Estratégica', 'Bônus Técnico', 'Outros'];

const STATUS_LABELS: Record<FinancialStatus, string> = {
  previsto: 'Previsto',
  confirmado: 'Confirmado',
  pago: 'Pago',
};

const STATUS_STYLES: Record<FinancialStatus, string> = {
  previsto: 'bg-yellow-500/20 text-yellow-300',
  confirmado: 'bg-blue-500/20 text-blue-300',
  pago: 'bg-green-500/20 text-green-300',
};

const TYPE_LABELS: Record<FinancialType, string> = {
  receita: 'Receita',
  despesa: 'Despesa',
  comissao: 'Comissão',
};

function getInitialFormData(): FinancialFormData {
  return {
    type: 'receita',
    category: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'confirmado',
    notes: '',
  };
}

function parseAmount(amount: string | number) {
  return typeof amount === 'number' ? amount : Number.parseFloat(amount || '0');
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getRecordDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function formatDate(value: Date | string) {
  const date = getRecordDate(value);
  if (Number.isNaN(date.getTime())) return 'Data inválida';
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatMonth(value: Date) {
  return value.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' }).replace('.', '');
}

function getCategories(type: FinancialType) {
  if (type === 'receita') return REVENUE_CATEGORIES;
  if (type === 'despesa') return EXPENSE_CATEGORIES;
  return COMMISSION_CATEGORIES;
}

function getDefaultStatus(type: FinancialType): FinancialStatus {
  if (type === 'despesa') return 'pago';
  if (type === 'comissao') return 'previsto';
  return 'confirmado';
}

function isWithinPeriod(record: FinancialRecord, period: PeriodFilter, startDate: string, endDate: string, referenceDate: Date) {
  if (period === 'todos') return true;

  const recordDate = getRecordDate(record.date);
  if (Number.isNaN(recordDate.getTime())) return false;

  if (period === 'customizado') {
    const start = startDate ? new Date(`${startDate}T00:00:00.000Z`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59.999Z`) : null;
    if (start && recordDate < start) return false;
    if (end && recordDate > end) return false;
    return true;
  }

  const currentYear = referenceDate.getUTCFullYear();
  const currentMonth = referenceDate.getUTCMonth();
  const recordYear = recordDate.getUTCFullYear();
  const recordMonth = recordDate.getUTCMonth();

  if (period === 'mes_atual') return recordYear === currentYear && recordMonth === currentMonth;
  if (period === 'ano_atual') return recordYear === currentYear;

  const currentQuarter = Math.floor(currentMonth / 3);
  const recordQuarter = Math.floor(recordMonth / 3);
  return recordYear === currentYear && recordQuarter === currentQuarter;
}

export default function Financials() {
  const utils = trpc.useUtils();
  const financialsQuery = trpc.financials.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FinancialFormData>(() => getInitialFormData());
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const referenceDate = useMemo(() => new Date(), []);

  const invalidateFinancials = () => utils.financials.list.invalidate();

  const addRevenue = trpc.financials.addRevenue.useMutation({
    onSuccess: () => {
      invalidateFinancials();
      toast.success('Receita registrada com persistência.');
      resetForm();
    },
    onError: (error) => toast.error(error.message || 'Não foi possível registrar a receita.'),
  });

  const addExpense = trpc.financials.addExpense.useMutation({
    onSuccess: () => {
      invalidateFinancials();
      toast.success('Despesa registrada com persistência.');
      resetForm();
    },
    onError: (error) => toast.error(error.message || 'Não foi possível registrar a despesa.'),
  });

  const addCommission = trpc.financials.addCommission.useMutation({
    onSuccess: () => {
      invalidateFinancials();
      toast.success('Comissão registrada com persistência.');
      resetForm();
    },
    onError: (error) => toast.error(error.message || 'Não foi possível registrar a comissão.'),
  });

  const updateStatus = trpc.financials.updateStatus.useMutation({
    onMutate: async ({ id, status }) => {
      await utils.financials.list.cancel();
      const previous = utils.financials.list.getData();
      utils.financials.list.setData(undefined, (old) =>
        old?.map((record) => (record.id === id ? { ...record, status } : record)),
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      utils.financials.list.setData(undefined, context?.previous);
      toast.error(error.message || 'Não foi possível atualizar o status.');
    },
    onSuccess: () => toast.success('Status financeiro atualizado.'),
    onSettled: () => invalidateFinancials(),
  });

  const removeFinancial = trpc.financials.remove.useMutation({
    onMutate: async ({ id }) => {
      await utils.financials.list.cancel();
      const previous = utils.financials.list.getData();
      utils.financials.list.setData(undefined, (old) => old?.filter((record) => record.id !== id));
      return { previous };
    },
    onError: (error, _variables, context) => {
      utils.financials.list.setData(undefined, context?.previous);
      toast.error(error.message || 'Não foi possível excluir a movimentação.');
    },
    onSuccess: () => toast.success('Movimentação financeira excluída.'),
    onSettled: () => invalidateFinancials(),
  });

  const transactions = useMemo(() => {
    return ((financialsQuery.data || []) as FinancialRecord[]).filter((record) =>
      ['receita', 'despesa', 'comissao'].includes(record.type),
    );
  }, [financialsQuery.data]);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return transactions
      .filter((record) => isWithinPeriod(record, periodFilter, customStartDate, customEndDate, referenceDate))
      .filter((record) => {
        if (!normalizedSearch) return true;
        const searchable = [record.description, record.category, record.notes, record.type].filter(Boolean).join(' ').toLowerCase();
        return searchable.includes(normalizedSearch);
      });
  }, [transactions, periodFilter, customStartDate, customEndDate, referenceDate, searchTerm]);

  const totals = useMemo(() => {
    const totalReceita = filteredTransactions
      .filter((item) => item.type === 'receita' && item.status === 'confirmado')
      .reduce((sum, item) => sum + parseAmount(item.amount), 0);

    const totalDespesa = filteredTransactions
      .filter((item) => item.type === 'despesa' && item.status === 'pago')
      .reduce((sum, item) => sum + parseAmount(item.amount), 0);

    const totalComissoes = filteredTransactions
      .filter((item) => item.type === 'comissao')
      .reduce((sum, item) => sum + parseAmount(item.amount), 0);

    const pendencias = filteredTransactions
      .filter((item) => item.status === 'previsto')
      .reduce((sum, item) => sum + (item.type === 'despesa' ? -parseAmount(item.amount) : parseAmount(item.amount)), 0);

    return {
      totalReceita,
      totalDespesa,
      totalComissoes,
      lucroLiquido: totalReceita - totalDespesa - totalComissoes,
      pendencias,
    };
  }, [filteredTransactions]);

  const chartRows = useMemo(() => {
    const grouped = new Map<string, { label: string; receita: number; despesa: number; comissao: number; sortKey: string }>();

    filteredTransactions.forEach((record) => {
      const date = getRecordDate(record.date);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      const current = grouped.get(key) || { label: formatMonth(date), receita: 0, despesa: 0, comissao: 0, sortKey: key };
      const amount = parseAmount(record.amount);
      if (record.type === 'receita') current.receita += amount;
      if (record.type === 'despesa') current.despesa += amount;
      if (record.type === 'comissao') current.comissao += amount;
      grouped.set(key, current);
    });

    return Array.from(grouped.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [filteredTransactions]);

  const maxChartValue = Math.max(1, ...chartRows.flatMap((row) => [row.receita, row.despesa, row.comissao]));
  const categories = getCategories(formData.type);
  const isSubmitting = addRevenue.isPending || addExpense.isPending || addCommission.isPending;

  function resetForm() {
    setFormData(getInitialFormData());
    setShowForm(false);
  }

  function handleTypeChange(type: FinancialType) {
    setFormData({
      ...formData,
      type,
      category: '',
      status: getDefaultStatus(type),
    });
  }

  function handleCreateTransaction() {
    if (!formData.category || !formData.description.trim() || formData.amount <= 0 || !formData.date) {
      toast.error('Preencha tipo, categoria, descrição, valor e data antes de registrar.');
      return;
    }

    const payload = {
      description: formData.description.trim(),
      amount: formData.amount,
      date: new Date(`${formData.date}T00:00:00.000Z`),
      category: formData.category,
      status: formData.status,
      notes: formData.notes.trim() || undefined,
    };

    if (formData.type === 'receita') {
      addRevenue.mutate(payload);
      return;
    }

    if (formData.type === 'despesa') {
      addExpense.mutate(payload);
      return;
    }

    addCommission.mutate(payload);
  }

  function handleUpdateStatus(id: number, status: FinancialStatus) {
    updateStatus.mutate({ id, status });
  }

  function handleDeleteTransaction(id: number) {
    removeFinancial.mutate({ id });
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/70">Gestão financeira</p>
            <h1 className="text-3xl font-bold text-cyan-400">Financeiro & Administrativo</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-400">
              Registre receitas, despesas e comissões em base persistente para alimentar o histórico financeiro, os filtros por período e os gráficos executivos do Innovare OS.
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-cyan-600 text-white hover:bg-cyan-700">
            <Plus className="mr-2 h-4 w-4" />
            Nova movimentação
          </Button>
        </div>

        <Card className="border-gray-700/50 bg-gray-950/70 p-5">
          <div className="mb-4 flex items-center gap-3">
            <Search className="h-5 w-5 text-cyan-300" />
            <div>
              <h2 className="text-lg font-semibold text-white">Filtros por período e busca</h2>
              <p className="text-sm text-gray-400">Os indicadores, gráficos e histórico abaixo usam apenas os lançamentos filtrados.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div>
              <Label className="text-gray-300">Período</Label>
              <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as PeriodFilter)}>
                <SelectTrigger className="border-gray-700 bg-gray-900 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-900">
                  <SelectItem value="todos" className="text-white">Todos os períodos</SelectItem>
                  <SelectItem value="mes_atual" className="text-white">Mês atual</SelectItem>
                  <SelectItem value="trimestre" className="text-white">Trimestre atual</SelectItem>
                  <SelectItem value="ano_atual" className="text-white">Ano atual</SelectItem>
                  <SelectItem value="customizado" className="text-white">Intervalo personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300">Busca</Label>
              <Input
                placeholder="Descrição, categoria, tipo ou observações"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="border-gray-700 bg-gray-900 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Início</Label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(event) => setCustomStartDate(event.target.value)}
                disabled={periodFilter !== 'customizado'}
                className="border-gray-700 bg-gray-900 text-white disabled:opacity-50"
              />
            </div>
            <div>
              <Label className="text-gray-300">Fim</Label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(event) => setCustomEndDate(event.target.value)}
                disabled={periodFilter !== 'customizado'}
                className="border-gray-700 bg-gray-900 text-white disabled:opacity-50"
              />
            </div>
          </div>
          <p className="mt-3 text-sm text-cyan-200/80">
            {filteredTransactions.length} de {transactions.length} movimentações exibidas pelos filtros atuais.
          </p>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <Card className="border-green-700/50 bg-gradient-to-br from-green-950/60 to-green-900/30 p-6">
            <p className="text-sm text-gray-400">Receita Confirmada</p>
            <p className="mt-2 text-2xl font-bold text-green-400">{formatCurrency(totals.totalReceita)}</p>
          </Card>
          <Card className="border-red-700/50 bg-gradient-to-br from-red-950/60 to-red-900/30 p-6">
            <p className="text-sm text-gray-400">Despesa Paga</p>
            <p className="mt-2 text-2xl font-bold text-red-400">{formatCurrency(totals.totalDespesa)}</p>
          </Card>
          <Card className="border-fuchsia-700/50 bg-gradient-to-br from-fuchsia-950/60 to-fuchsia-900/30 p-6">
            <p className="text-sm text-gray-400">Comissões</p>
            <p className="mt-2 text-2xl font-bold text-fuchsia-300">{formatCurrency(totals.totalComissoes)}</p>
          </Card>
          <Card className="border-blue-700/50 bg-gradient-to-br from-blue-950/60 to-blue-900/30 p-6">
            <p className="text-sm text-gray-400">Lucro Líquido</p>
            <p className={`mt-2 text-2xl font-bold ${totals.lucroLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(totals.lucroLiquido)}
            </p>
          </Card>
          <Card className="border-yellow-700/50 bg-gradient-to-br from-yellow-950/60 to-yellow-900/30 p-6">
            <p className="text-sm text-gray-400">Saldo Previsto</p>
            <p className="mt-2 text-2xl font-bold text-yellow-300">{formatCurrency(totals.pendencias)}</p>
          </Card>
        </div>

        <Card className="border-gray-700/50 bg-gray-950/70 p-6">
          <div className="mb-5 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-cyan-300" />
            <div>
              <h2 className="text-xl font-bold text-white">Gráficos de receita, despesa e comissões</h2>
              <p className="text-sm text-gray-400">Comparativo mensal calculado a partir das movimentações filtradas.</p>
            </div>
          </div>
          {chartRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center text-gray-400">
              Nenhum dado disponível para os filtros atuais.
            </div>
          ) : (
            <div className="space-y-5">
              {chartRows.map((row) => (
                <div key={row.sortKey} className="grid grid-cols-1 gap-3 lg:grid-cols-[90px_1fr] lg:items-center">
                  <p className="text-sm font-semibold uppercase tracking-wide text-gray-300">{row.label}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-xs text-green-300">Receita</span>
                      <div className="h-3 flex-1 rounded-full bg-gray-800">
                        <div className="h-3 rounded-full bg-green-500" style={{ width: `${Math.max(4, (row.receita / maxChartValue) * 100)}%` }} />
                      </div>
                      <span className="w-28 text-right text-xs text-gray-300">{formatCurrency(row.receita)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-xs text-red-300">Despesa</span>
                      <div className="h-3 flex-1 rounded-full bg-gray-800">
                        <div className="h-3 rounded-full bg-red-500" style={{ width: `${Math.max(4, (row.despesa / maxChartValue) * 100)}%` }} />
                      </div>
                      <span className="w-28 text-right text-xs text-gray-300">{formatCurrency(row.despesa)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-xs text-fuchsia-300">Comissão</span>
                      <div className="h-3 flex-1 rounded-full bg-gray-800">
                        <div className="h-3 rounded-full bg-fuchsia-500" style={{ width: `${Math.max(4, (row.comissao / maxChartValue) * 100)}%` }} />
                      </div>
                      <span className="w-28 text-right text-xs text-gray-300">{formatCurrency(row.comissao)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {showForm && (
          <Card className="border-gray-700/50 bg-gray-950/70 p-6 shadow-xl shadow-cyan-950/10">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
                <CircleDollarSign className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Registrar movimentação persistente</h2>
                <p className="text-sm text-gray-400">O lançamento será gravado no banco e refletido no dashboard financeiro.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="text-gray-300">Tipo *</Label>
                <Select value={formData.type} onValueChange={(value) => handleTypeChange(value as FinancialType)}>
                  <SelectTrigger className="border-gray-700 bg-gray-900 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-900">
                    <SelectItem value="receita" className="text-white">Receita</SelectItem>
                    <SelectItem value="despesa" className="text-white">Despesa</SelectItem>
                    <SelectItem value="comissao" className="text-white">Comissão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Categoria *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="border-gray-700 bg-gray-900 text-white"><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-900">
                    {categories.map((category) => <SelectItem key={category} value={category} className="text-white">{category}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-gray-300">Descrição *</Label>
                <Input placeholder="Ex.: Parcela 1 do projeto industrial, aquisição de material ou comissão de indicação" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} className="border-gray-700 bg-gray-900 text-white" />
              </div>
              <div>
                <Label className="text-gray-300">Valor (R$) *</Label>
                <Input type="number" min="0" step="0.01" placeholder="0,00" value={formData.amount || ''} onChange={(event) => setFormData({ ...formData, amount: Number.parseFloat(event.target.value) || 0 })} className="border-gray-700 bg-gray-900 text-white" />
              </div>
              <div>
                <Label className="text-gray-300">Data *</Label>
                <Input type="date" value={formData.date} onChange={(event) => setFormData({ ...formData, date: event.target.value })} className="border-gray-700 bg-gray-900 text-white" />
              </div>
              <div>
                <Label className="text-gray-300">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as FinancialStatus })}>
                  <SelectTrigger className="border-gray-700 bg-gray-900 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-900">
                    <SelectItem value="previsto" className="text-white">Previsto</SelectItem>
                    <SelectItem value="confirmado" className="text-white">Confirmado</SelectItem>
                    <SelectItem value="pago" className="text-white">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Observações</Label>
                <Input placeholder="Notas internas, referência comercial ou condição de pagamento" value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} className="border-gray-700 bg-gray-900 text-white" />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={handleCreateTransaction} disabled={isSubmitting} className="bg-green-600 text-white hover:bg-green-700">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar movimentação
              </Button>
              <Button onClick={resetForm} disabled={isSubmitting} className="bg-gray-700 text-white hover:bg-gray-600">Cancelar</Button>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold text-white">Histórico financeiro persistente</h2>
            {financialsQuery.isFetching && <span className="flex items-center gap-2 text-sm text-cyan-300"><Loader2 className="h-4 w-4 animate-spin" /> Atualizando dados</span>}
          </div>

          {financialsQuery.isError && (
            <Alert className="border-red-700/50 bg-red-950/30 text-red-100">
              <AlertTitle>Não foi possível carregar o financeiro</AlertTitle>
              <AlertDescription>{financialsQuery.error.message}</AlertDescription>
            </Alert>
          )}

          {financialsQuery.isLoading ? (
            <Card className="border-gray-700/50 bg-gray-900/50 p-6 text-center text-gray-400"><Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-cyan-300" />Carregando movimentações financeiras...</Card>
          ) : filteredTransactions.length === 0 ? (
            <Card className="border-gray-700/50 bg-gray-900/50 p-6 text-center"><p className="text-gray-300">Nenhuma movimentação financeira encontrada.</p><p className="mt-1 text-sm text-gray-500">Ajuste os filtros ou crie uma receita, despesa ou comissão.</p></Card>
          ) : (
            filteredTransactions.map((transaction) => {
              const type = transaction.type as FinancialType;
              const status = (transaction.status || 'previsto') as FinancialStatus;
              const amount = parseAmount(transaction.amount);
              const isExpense = type === 'despesa';
              const isCommission = type === 'comissao';
              return (
                <Card key={transaction.id} className={`border-l-4 bg-gray-950/60 p-4 ${isExpense ? 'border-red-700/70' : isCommission ? 'border-fuchsia-700/70' : 'border-green-700/70'}`}>
                  <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {isExpense ? <TrendingDown className="h-5 w-5 shrink-0 text-red-400" /> : <TrendingUp className={`h-5 w-5 shrink-0 ${isCommission ? 'text-fuchsia-300' : 'text-green-400'}`} />}
                        <h3 className="truncate text-lg font-bold text-white">{transaction.description}</h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-300">{TYPE_LABELS[type]} • {transaction.category || 'Sem categoria'} • {formatDate(transaction.date)}</p>
                      {transaction.notes && <p className="mt-2 text-sm text-gray-500">{transaction.notes}</p>}
                    </div>
                    <div className="text-left lg:text-right">
                      <p className={`text-2xl font-bold ${isExpense ? 'text-red-400' : isCommission ? 'text-fuchsia-300' : 'text-green-400'}`}>{isExpense ? '-' : '+'} {formatCurrency(amount)}</p>
                      <p className={`mt-1 inline-flex rounded px-2 py-1 text-xs ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select value={status} onValueChange={(value) => handleUpdateStatus(transaction.id, value as FinancialStatus)}>
                      <SelectTrigger className="flex-1 border-gray-700 bg-gray-900 text-sm text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-gray-700 bg-gray-900">
                        <SelectItem value="previsto" className="text-white">Previsto</SelectItem>
                        <SelectItem value="confirmado" className="text-white">Confirmado</SelectItem>
                        <SelectItem value="pago" className="text-white">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => handleDeleteTransaction(transaction.id)} variant="destructive" size="sm" disabled={removeFinancial.isPending} aria-label={`Excluir movimentação ${transaction.description}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
