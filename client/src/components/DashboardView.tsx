import React from 'react';
import {
  Wallet,
  Building,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle,
  Scale,
  FileText,
  Coins,
  ScrollText,
  Clock,
  TrendingUp,
  PenLine
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  SummaryAnalytics,
  CashflowTrend,
  Rule503020,
  CategoryBreakdown,
  RecurringRule,
  Transaction
} from '../types';

interface DashboardViewProps {
  summary: SummaryAnalytics | null;
  cashflow: CashflowTrend[];
  rule503020: Rule503020 | null;
  categoryBreakdown: CategoryBreakdown[];
  upcomingBills: RecurringRule[];
  recentTransactions: Transaction[];
  onOpenNewTransaction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  cashflow,
  rule503020,
  categoryBreakdown,
  upcomingBills,
  recentTransactions,
  onOpenNewTransaction,
}) => {
  const symbol = summary?.base_symbol || '$';

  const formatMoney = (val?: number) => {
    if (val === undefined || val === null) return `${symbol}0.00`;
    return `${symbol}${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Core Statement of Condition: Ruled Balance Sheet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Net Worth Equity */}
        <div className="bg-[#FCFAF5] p-5 border border-[#D7CEBE] lg:col-span-2 flex flex-col justify-between shadow-[1px_1px_0px_rgba(22,21,19,0.1)] relative">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-[#857D71]">
            <span className="uppercase font-semibold text-[#5C5549] flex items-center gap-1.5">
              <Scale size={14} strokeWidth={1.75} className="text-[#96681C]" /> STATEMENT OF EQUITY
            </span>
            <span className="bg-[#ECE6D8] px-2 py-0.5 border border-[#D7CEBE] text-[#161513] font-bold">
              ASSETS − LIABILITIES
            </span>
          </div>

          <div className="my-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#857D71] block">
              TOTAL AUDITED NET WORTH
            </span>
            <div className="text-3xl font-bold font-mono tracking-tight text-[#161513] pb-1 inline-block accounting-double-rule">
              {formatMoney(summary?.net_worth)}
            </div>
            <div className="flex items-center gap-4 text-xs font-mono mt-2 text-[#5C5549]">
              <span className="flex items-center gap-1">
                <span className="text-[#857D71]">Assets:</span>
                <strong className="text-[#1A5333] font-semibold">{formatMoney(summary?.total_assets)}</strong>
              </span>
              <span className="text-[#D7CEBE]">|</span>
              <span className="flex items-center gap-1">
                <span className="text-[#857D71]">Obligations:</span>
                <strong className="text-[#9E2428] font-semibold">{formatMoney(summary?.total_liabilities)}</strong>
              </span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-[#857D71] border-t border-[#ECE6D8] pt-2">
            Consolidated valuation across all depository, brokerage & credit ledgers
          </div>
        </div>

        {/* Liquid Specie & Bank Balances */}
        <div className="bg-[#FCFAF5] p-5 border border-[#D7CEBE] flex flex-col justify-between shadow-[1px_1px_0px_rgba(22,21,19,0.1)]">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#857D71]">
            <span className="uppercase font-semibold text-[#5C5549] flex items-center gap-1.5">
              <Coins size={13} strokeWidth={1.75} className="text-[#1A5333]" /> LIQUID SPECIE
            </span>
            <span className="text-[9px] bg-[#E2ECE5] text-[#1A5333] px-1.5 py-0.5 border border-[#B3D3BE] font-bold">
              ASSET
            </span>
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-bold font-mono text-[#161513]">
              {formatMoney(summary?.cash_total)}
            </h3>
            <span className="text-[11px] font-mono text-[#857D71] block mt-0.5">Checking & Savings</span>
          </div>
          <div className="text-[10px] font-mono text-[#1A5333] font-medium pt-2 border-t border-[#ECE6D8] flex items-center gap-1">
            ✓ Readily deployable reserves
          </div>
        </div>

        {/* Current Credit Debt */}
        <div className="bg-[#FCFAF5] p-5 border border-[#D7CEBE] flex flex-col justify-between shadow-[1px_1px_0px_rgba(22,21,19,0.1)]">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#857D71]">
            <span className="uppercase font-semibold text-[#5C5549] flex items-center gap-1.5">
              <CreditCard size={13} strokeWidth={1.75} className="text-[#9E2428]" /> CREDIT OWED
            </span>
            <span className="text-[9px] bg-[#FCE8E8] text-[#9E2428] px-1.5 py-0.5 border border-[#F3BABA] font-bold">
              DEBT
            </span>
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-bold font-mono text-[#9E2428]">
              {formatMoney(summary?.credit_debt_total)}
            </h3>
            <span className="text-[11px] font-mono text-[#857D71] block mt-0.5">Revolving card credit</span>
          </div>
          <div className="text-[10px] font-mono text-[#857D71] pt-2 border-t border-[#ECE6D8]">
            Payable in current monthly cycle
          </div>
        </div>

        {/* Monthly Surplus Ratio */}
        <div className="bg-[#FCFAF5] p-5 border border-[#D7CEBE] flex flex-col justify-between shadow-[1px_1px_0px_rgba(22,21,19,0.1)]">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#857D71]">
            <span className="uppercase font-semibold text-[#5C5549] flex items-center gap-1.5">
              <TrendingUp size={13} strokeWidth={1.75} className="text-[#1E4268]" /> SURPLUS RATIO
            </span>
            <span className="text-[9px] bg-[#E8EEF5] text-[#1E4268] px-1.5 py-0.5 border border-[#B9CFE5] font-bold">
              SAVINGS
            </span>
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-bold font-mono text-[#161513]">
              {summary?.savings_rate_pct ?? 0}%
            </h3>
            <span className="text-[11px] font-mono text-[#5C5549] block mt-0.5">
              Net: <strong className="text-[#1A5333]">{formatMoney(summary?.net_savings)}</strong>
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#857D71] pt-2 border-t border-[#ECE6D8] truncate">
            In {formatMoney(summary?.monthly_income)} • Out {formatMoney(summary?.monthly_expenses)}
          </div>
        </div>
      </div>

      {/* 2. Visual Charts Row (Cashflow Trends & 50/30/20 Rule) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Trends Bar Chart */}
        <div className="bg-[#FCFAF5] p-6 border border-[#D7CEBE] shadow-[1px_1px_0px_rgba(22,21,19,0.1)] lg:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-[#D7CEBE] gap-2">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#857D71] block">
                AUDIT LOG RECORD
              </span>
              <h3 className="text-base font-serif font-bold text-[#161513]">
                Six-Month Cashflow Trajectory
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#5C5549]">
                <span className="w-3 h-3 bg-[#1A5333] border border-[#161513]"></span> Credits (Income)
              </span>
              <span className="flex items-center gap-1.5 text-[#5C5549]">
                <span className="w-3 h-3 bg-[#9E2428] border border-[#161513]"></span> Debits (Expenses)
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflow} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#ECE6D8" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month_label"
                  tickLine={{ stroke: '#D7CEBE' }}
                  axisLine={{ stroke: '#D7CEBE' }}
                  tick={{ fontSize: 11, fill: '#5C5549', fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  tickLine={{ stroke: '#D7CEBE' }}
                  axisLine={{ stroke: '#D7CEBE' }}
                  tick={{ fontSize: 11, fill: '#5C5549', fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip
                  formatter={(val: any) => [`${symbol}${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, '']}
                  contentStyle={{
                    backgroundColor: '#FCFAF5',
                    borderRadius: '0px',
                    border: '1px solid #161513',
                    boxShadow: '2px 2px 0px rgba(22, 21, 19, 0.2)',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                    color: '#161513'
                  }}
                />
                <Bar dataKey="income" fill="#1A5333" stroke="#161513" strokeWidth={1} maxBarSize={28} />
                <Bar dataKey="expense" fill="#9E2428" stroke="#161513" strokeWidth={1} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 50/30/20 Rule Analysis */}
        <div className="bg-[#FCFAF5] p-6 border border-[#D7CEBE] shadow-[1px_1px_0px_rgba(22,21,19,0.1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#D7CEBE]">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#857D71] block">
                  CAPITAL RATIOS
                </span>
                <h3 className="text-base font-serif font-bold text-[#161513]">
                  50/30/20 Appropriation
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-[#ECE6D8] px-2 py-0.5 border border-[#D7CEBE] text-[#161513] font-semibold">
                STANDARD
              </span>
            </div>

            <p className="text-xs text-[#5C5549] mb-4">
              Structural distribution of current monthly expenditures against balanced targets:
            </p>

            <div className="space-y-4 font-mono">
              {/* Needs */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#161513]">
                    Essential Needs (50% Target)
                  </span>
                  <span className="text-[#5C5549]">
                    {formatMoney(rule503020?.needs_amount)} ({rule503020?.needs_pct ?? 0}%)
                  </span>
                </div>
                <div className="w-full bg-[#ECE6D8] h-3 border border-[#D7CEBE]">
                  <div
                    className="bg-[#1E4268] h-full transition-all duration-300 border-r border-[#161513]"
                    style={{ width: `${Math.min(100, rule503020?.needs_pct ?? 0)}%` }}
                  />
                </div>
              </div>

              {/* Wants */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#161513]">
                    Discretionary (30% Target)
                  </span>
                  <span className="text-[#5C5549]">
                    {formatMoney(rule503020?.wants_amount)} ({rule503020?.wants_pct ?? 0}%)
                  </span>
                </div>
                <div className="w-full bg-[#ECE6D8] h-3 border border-[#D7CEBE]">
                  <div
                    className="bg-[#5A2A48] h-full transition-all duration-300 border-r border-[#161513]"
                    style={{ width: `${Math.min(100, rule503020?.wants_pct ?? 0)}%` }}
                  />
                </div>
              </div>

              {/* Savings & Debt */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#161513]">
                    Savings & Principal (20% Target)
                  </span>
                  <span className="text-[#5C5549]">
                    {formatMoney(rule503020?.savings_amount)} ({rule503020?.savings_pct ?? 0}%)
                  </span>
                </div>
                <div className="w-full bg-[#ECE6D8] h-3 border border-[#D7CEBE]">
                  <div
                    className="bg-[#1A5333] h-full transition-all duration-300 border-r border-[#161513]"
                    style={{ width: `${Math.min(100, rule503020?.savings_pct ?? 0)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#D7CEBE] text-[11px] font-mono text-[#5C5549] flex items-center justify-between">
            <span>PERIOD EXPENDITURES:</span>
            <strong className="text-[#161513] font-bold">{formatMoney(rule503020?.total_spent)}</strong>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Upcoming Bills & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bills Widget */}
        <div className="bg-[#FCFAF5] p-6 border border-[#D7CEBE] shadow-[1px_1px_0px_rgba(22,21,19,0.1)]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D7CEBE]">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#857D71] block">
                STANDING OBLIGATIONS
              </span>
              <div className="flex items-center gap-2">
                <Clock size={15} strokeWidth={1.75} className="text-[#96681C]" />
                <h3 className="text-base font-serif font-bold text-[#161513]">
                  Upcoming Drafts
                </h3>
              </div>
            </div>
            <span className="text-[11px] font-mono bg-[#ECE6D8] px-2 py-0.5 border border-[#D7CEBE] text-[#5C5549]">
              30 DAYS
            </span>
          </div>

          {upcomingBills.length === 0 ? (
            <p className="text-xs font-mono text-[#857D71] py-8 text-center italic">
              No recurring drafts scheduled in current register.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingBills.slice(0, 4).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-2.5 bg-[#ECE6D8]/60 border border-[#D7CEBE]"
                >
                  <div>
                    <span className="text-xs font-medium text-[#161513] block">
                      {bill.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#857D71]">
                      DUE: {bill.next_due_date} ({bill.days_until_due}d remaining)
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono text-[#9E2428]">
                    {symbol}{bill.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions List */}
        <div className="bg-[#FCFAF5] p-6 border border-[#D7CEBE] shadow-[1px_1px_0px_rgba(22,21,19,0.1)] lg:col-span-2">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D7CEBE]">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#857D71] block">
                GENERAL JOURNAL
              </span>
              <div className="flex items-center gap-2">
                <ScrollText size={15} strokeWidth={1.75} className="text-[#96681C]" />
                <h3 className="text-base font-serif font-bold text-[#161513]">
                  Latest Recorded Entries
                </h3>
              </div>
            </div>
            <button
              onClick={onOpenNewTransaction}
              className="text-xs font-mono font-semibold text-[#161513] hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <PenLine size={13} strokeWidth={1.75} className="text-[#96681C]" />
              <span>+ NEW JOURNAL ENTRY</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b-2 border-[#161513] text-[#5C5549] text-[10px] tracking-wider uppercase bg-[#ECE6D8]">
                  <th className="p-2 border-r border-[#D7CEBE]">FOLIO DATE</th>
                  <th className="p-2 border-r border-[#D7CEBE]">RECORD DESCRIPTION</th>
                  <th className="p-2 border-r border-[#D7CEBE]">ACCOUNT</th>
                  <th className="p-2 text-right">AMOUNT (BASE)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7CEBE]">
                {recentTransactions.slice(0, 5).map((t) => {
                  const isExpense = t.type === 'expense';
                  const isIncome = t.type === 'income';
                  return (
                    <tr key={t.id} className="hover:bg-[#ECE6D8]/50 transition-colors">
                      <td className="p-2 text-[#5C5549] border-r border-[#D7CEBE] whitespace-nowrap">{t.date}</td>
                      <td className="p-2 font-medium text-[#161513] border-r border-[#D7CEBE]">{t.merchant}</td>
                      <td className="p-2 text-[#5C5549] border-r border-[#D7CEBE]">{t.account_name}</td>
                      <td className={`p-2 text-right font-bold whitespace-nowrap ${
                        isIncome ? 'text-[#1A5333]' : isExpense ? 'text-[#9E2428]' : 'text-[#1E4268]'
                      }`}>
                        {isIncome ? '+ ' : isExpense ? '- ' : ''}
                        {symbol}{t.amount_base.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

