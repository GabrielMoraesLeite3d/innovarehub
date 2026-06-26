import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const financialsSource = readFileSync(resolve(process.cwd(), 'client/src/pages/Financials.tsx'), 'utf8');

describe('Financials UI wiring', () => {
  it('usa tRPC para listar, criar e atualizar movimentações financeiras persistentes', () => {
    expect(financialsSource).toContain('trpc.financials.list.useQuery');
    expect(financialsSource).toContain('trpc.financials.addRevenue.useMutation');
    expect(financialsSource).toContain('trpc.financials.addExpense.useMutation');
    expect(financialsSource).toContain('trpc.financials.addCommission.useMutation');
    expect(financialsSource).toContain('trpc.financials.updateStatus.useMutation');
    expect(financialsSource).toContain('trpc.financials.remove.useMutation');
  });

  it('expõe o formulário persistente para receitas, despesas e comissões', () => {
    expect(financialsSource).toContain('Registrar movimentação persistente');
    expect(financialsSource).toContain('value="receita"');
    expect(financialsSource).toContain('value="despesa"');
    expect(financialsSource).toContain('value="comissao"');
    expect(financialsSource).toContain('Histórico financeiro persistente');
  });

  it('mantém atualização otimista e invalidação do cache financeiro', () => {
    expect(financialsSource).toContain('onMutate');
    expect(financialsSource).toContain('utils.financials.list.setData');
    expect(financialsSource).toContain('utils.financials.list.invalidate');
  });

  it('expõe filtros por período, busca textual e intervalo personalizado', () => {
    expect(financialsSource).toContain("type PeriodFilter = 'todos' | 'mes_atual' | 'trimestre' | 'ano_atual' | 'customizado'");
    expect(financialsSource).toContain('Filtros por período e busca');
    expect(financialsSource).toContain('value="mes_atual"');
    expect(financialsSource).toContain('value="trimestre"');
    expect(financialsSource).toContain('value="ano_atual"');
    expect(financialsSource).toContain('value="customizado"');
    expect(financialsSource).toContain('searchTerm');
    expect(financialsSource).toContain('customStartDate');
    expect(financialsSource).toContain('customEndDate');
    expect(financialsSource).toContain('isWithinPeriod(record, periodFilter, customStartDate, customEndDate, referenceDate)');
  });

  it('calcula gráficos mensais de receita, despesa e comissões a partir das movimentações filtradas', () => {
    expect(financialsSource).toContain('const chartRows = useMemo');
    expect(financialsSource).toContain('filteredTransactions.forEach');
    expect(financialsSource).toContain('Gráficos de receita, despesa e comissões');
    expect(financialsSource).toContain('Comparativo mensal calculado a partir das movimentações filtradas.');
    expect(financialsSource).toContain('row.receita / maxChartValue');
    expect(financialsSource).toContain('row.despesa / maxChartValue');
    expect(financialsSource).toContain('row.comissao / maxChartValue');
  });
});
