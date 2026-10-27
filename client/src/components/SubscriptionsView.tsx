import React from 'react';
import {
  CalendarClock,
  Plus,
  AlertTriangle,
  TrendingDown,
  Trash2,
  CheckCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { RecurringRule, Currency, Account } from '../types';

interface SubscriptionsViewProps {
  recurringRules: RecurringRule[];
  forecast: { date: string; projected_balance: number; events_count: number; has_alert: boolean }[];
  baseCurrency?: Currency;
  accounts: Account[];
  onOpenNewRecurring: () => void;
  onDeleteRecurring: (id: string) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  recurringRules,
  forecast,
  baseCurrency,
  accounts,
  onOpenNewRecurring,
  onDeleteRecurring,
}) => {
  const baseSymbol = baseCurrency?.symbol || '$';

  const totalMonthlyCommitment = recurringRules.reduce((sum, r) => {
    let monthlyEquiv = r.amount;
    if (r.frequency === 'weekly') monthlyEquiv = r.amount * 4.33;
    else if (r.frequency === 'biweekly') monthlyEquiv = r.amount * 2.16;
    else if (r.frequency === 'quarterly') monthlyEquiv = r.amount / 3;
    else if (r.frequency === 'yearly') monthlyEquiv = r.amount / 12;
    return sum + monthlyEquiv;
  }, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Overview & 30/60/90 Day Cashflow Forecast Chart */}
      <div className="bg-[#FCFAF5] p-6 border border-[#D7CEBE] shadow-[1px_1px_0px_rgba(22,21,19,0.12)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-[#D7CEBE] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen size={16} strokeWidth={1.75} className="text-[#96681C]" />
              <h3 className="text-base font-serif font-bold text-[#161513]">
                30 / 60 / 90 Day Liquid Specie Forecast
              </h3>
            </div>
            <p className="text-xs text-[#5C5549] mt-0.5">
              Simulated future depository balance accounting for all standing orders, recurring drafts, and receivables.
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] tracking-wider uppercase text-[#857D71] block">FIXED PERIOD COMMITMENT</span>
            <div className="text-lg font-bold text-[#161513] inline-block accounting-double-rule pb-0.5">
              {baseSymbol}{totalMonthlyCommitment.toFixed(2)}/mo
            </div>
          </div>
        </div>

        {/* Forecast Area Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="archivalInkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E4268" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1E4268" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ECE6D8" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={{ stroke: '#D7CEBE' }}
                axisLine={{ stroke: '#D7CEBE' }}
                tick={{ fontSize: 10, fill: '#5C5549', fontFamily: 'JetBrains Mono' }}
              />
              <YAxis
                tickLine={{ stroke: '#D7CEBE' }}
                axisLine={{ stroke: '#D7CEBE' }}
                tick={{ fontSize: 10, fill: '#5C5549', fontFamily: 'JetBrains Mono' }}
              />
              <Tooltip
                formatter={(val: any) => [`${baseSymbol}${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'PROJECTED BALANCE']}
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
              <Area
                type="monotone"
                dataKey="projected_balance"
                stroke="#1E4268"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#archivalInkGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Subscriptions & Bills List */}
      <div className="bg-[#FCFAF5] border-2 border-[#161513] shadow-[2px_2px_0px_rgba(22,21,19,0.15)] p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-[#D7CEBE] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CalendarClock size={16} strokeWidth={1.75} className="text-[#96681C]" />
              <h3 className="text-base font-serif font-bold text-[#161513]">
                Standing Orders & Recurring Obligations
              </h3>
            </div>
            <p className="text-xs text-[#5C5549] mt-0.5">
              Chronological register of recurring payment mandates sorted by due date
            </p>
          </div>
          <button
            onClick={onOpenNewRecurring}
            className="btn-ledger-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs cursor-pointer font-mono"
          >
            <Plus size={14} strokeWidth={1.75} className="text-[#E5C178]" />
            <span>NEW MANDATE</span>
          </button>
        </div>

        {recurringRules.length === 0 ? (
          <p className="text-xs font-mono text-[#857D71] py-8 text-center italic">
            No active standing orders registered. Click &quot;NEW MANDATE&quot; to establish recurring rules.
          </p>
        ) : (
          <div className="divide-y divide-[#D7CEBE] font-mono">
            {recurringRules.map((rule) => (
              <div
                key={rule.id}
                className="py-3 flex items-center justify-between hover:bg-[#ECE6D8]/50 px-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#ECE6D8] border border-[#D7CEBE] flex items-center justify-center text-[#5C5549]">
                    <Clock size={15} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="text-xs font-serif font-bold text-[#161513]">
                      {rule.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-[#857D71] mt-0.5">
                      <span>{rule.account_name}</span>
                      <span>•</span>
                      <span className="uppercase">{rule.frequency}</span>
                      <span>•</span>
                      <span className={rule.days_until_due <= 5 ? 'text-[#9E2428] font-bold' : ''}>
                        DUE: {rule.next_due_date} ({rule.days_until_due}d remaining)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-[#9E2428] block">
                      {rule.account_currency || baseSymbol} {rule.amount.toFixed(2)}
                    </span>
                    <span className="text-[9px] uppercase text-[#857D71] tracking-wider">
                      {rule.frequency}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Expunge standing mandate "${rule.name}"?`)) {
                        onDeleteRecurring(rule.id);
                      }
                    }}
                    className="text-[#857D71] hover:text-[#9E2428] p-1 transition-colors cursor-pointer"
                    title="Expunge rule"
                  >
                    <Trash2 size={13} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

