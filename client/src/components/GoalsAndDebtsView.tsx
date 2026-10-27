import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  TrendingDown,
  ShieldCheck,
  Flame,
  Snowflake,
  Calculator,
  Trash2,
  DollarSign,
  BookOpen
} from 'lucide-react';
import { SavingsGoal, Debt, DebtStrategyComparison, Currency } from '../types';
import { api } from '../api';

interface GoalsAndDebtsViewProps {
  goals: SavingsGoal[];
  debts: Debt[];
  baseCurrency?: Currency;
  onOpenNewGoal: () => void;
  onDeleteGoal: (id: string) => void;
  onOpenNewDebt: () => void;
  onDeleteDebt: (id: string) => void;
}

export const GoalsAndDebtsView: React.FC<GoalsAndDebtsViewProps> = ({
  goals,
  debts,
  baseCurrency,
  onOpenNewGoal,
  onDeleteGoal,
  onOpenNewDebt,
  onDeleteDebt,
}) => {
  const baseSymbol = baseCurrency?.symbol || '$';
  const [extraPayment, setExtraPayment] = useState<number>(100);
  const [comparison, setComparison] = useState<DebtStrategyComparison | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  useEffect(() => {
    if (debts.length > 0) {
      setLoadingComparison(true);
      api.compareDebtStrategies(extraPayment)
        .then(setComparison)
        .catch(console.error)
        .finally(() => setLoadingComparison(false));
    }
  }, [extraPayment, debts]);

  return (
    <div className="space-y-8">
      {/* 1. Savings Goals & Sinking Funds Section */}
      <div className="bg-[#FCFAF5] border-2 border-[#161513] shadow-[2px_2px_0px_rgba(22,21,19,0.15)] p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-[#D7CEBE] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen size={16} strokeWidth={1.75} className="text-[#96681C]" />
              <h3 className="text-base font-serif font-bold text-[#161513]">
                Sinking Funds & Capital Goals
              </h3>
            </div>
            <p className="text-xs text-[#5C5549] mt-0.5">
              Designated capital reserves for emergency protection, acquisitions, and asset investments.
            </p>
          </div>
          <button
            onClick={onOpenNewGoal}
            className="btn-ledger-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono cursor-pointer"
          >
            <Plus size={14} strokeWidth={1.75} className="text-[#E5C178]" />
            <span>ESTABLISH FUND</span>
          </button>
        </div>

        {goals.length === 0 ? (
          <p className="text-xs font-mono text-[#857D71] py-8 text-center italic">
            No active sinking funds defined in registry. Click &quot;ESTABLISH FUND&quot; to begin.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => (
              <div
                key={g.id}
                className="p-4 bg-[#FCFAF5] border border-[#D7CEBE] shadow-[1px_1px_0px_rgba(22,21,19,0.08)] flex flex-col justify-between hover:border-[#161513] transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between pb-2 border-b border-[#ECE6D8]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#E2ECE5] border border-[#B3D3BE] flex items-center justify-center text-[#1A5333]">
                        <Target size={14} strokeWidth={1.75} />
                      </div>
                      <div>
                        <h4 className="text-xs font-serif font-bold text-[#161513]">
                          {g.name}
                        </h4>
                        <span className="text-[10px] font-mono text-[#857D71]">
                          TARGET: {baseSymbol}{g.target_amount.toLocaleString()} {g.target_date ? `// MATURITY: ${g.target_date}` : ''}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Expunge capital fund goal "${g.name}"?`)) onDeleteGoal(g.id);
                      }}
                      className="text-[#857D71] hover:text-[#9E2428] p-1 transition-colors cursor-pointer"
                      title="Expunge goal"
                    >
                      <Trash2 size={13} strokeWidth={1.75} />
                    </button>
                  </div>

                  <div className="my-3 font-mono">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#161513] font-semibold">
                        {baseSymbol}{g.current_amount.toLocaleString()} ACCUMULATED
                      </span>
                      <span className="text-[#1A5333] font-bold">
                        {g.progress_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-[#ECE6D8] h-3 border border-[#D7CEBE]">
                      <div
                        className="h-full bg-[#1A5333] border-r border-[#161513] transition-all duration-300"
                        style={{ width: `${Math.min(100, g.progress_percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-[#5C5549] pt-2 border-t border-[#ECE6D8]">
                  REMAINING TO CEILING: <strong className="text-[#161513] font-bold">{baseSymbol}{g.remaining_amount.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Debt Elimination Engine (Snowball vs. Avalanche) */}
      <div className="bg-[#FCFAF5] border-2 border-[#161513] shadow-[2px_2px_0px_rgba(22,21,19,0.15)] p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-6 border-b border-[#D7CEBE] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calculator size={16} strokeWidth={1.75} className="text-[#96681C]" />
              <h3 className="text-base font-serif font-bold text-[#161513]">
                Amortization & Debt Elimination Schedule
              </h3>
            </div>
            <p className="text-xs text-[#5C5549] mt-0.5">
              Mathematical amortization model evaluating Snowball (behavioral velocity) versus Avalanche (cost minimization).
            </p>
          </div>
          <button
            onClick={onOpenNewDebt}
            className="btn-ledger-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold cursor-pointer shrink-0"
          >
            <Plus size={14} strokeWidth={1.75} />
            <span>RECORD LIABILITY</span>
          </button>
        </div>

        {debts.length === 0 ? (
          <p className="text-xs font-mono text-[#1A5333] py-8 text-center font-bold">
            ✓ ZERO RECORDED LIABILITIES — LEDGER OF DEBT IS BALANCED & DISCHARGED!
          </p>
        ) : (
          <div className="space-y-6">
            {/* Active Debts List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#161513] bg-[#ECE6D8] text-[#5C5549] text-[10px] tracking-wider uppercase">
                    <th className="py-2.5 px-3 border-r border-[#D7CEBE]">OBLIGATION LEDGER</th>
                    <th className="py-2.5 px-3 border-r border-[#D7CEBE]">PRINCIPAL</th>
                    <th className="py-2.5 px-3 border-r border-[#D7CEBE]">INTEREST APR</th>
                    <th className="py-2.5 px-3 border-r border-[#D7CEBE]">MIN REQUIREMENT</th>
                    <th className="py-2.5 px-3 text-center w-12">DISCHARGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7CEBE]">
                  {debts.map((d) => (
                    <tr key={d.id} className="hover:bg-[#ECE6D8]/50 transition-colors">
                      <td className="py-2.5 px-3 font-serif font-bold text-[#161513] border-r border-[#D7CEBE]">{d.name}</td>
                      <td className="py-2.5 px-3 font-bold text-[#9E2428] border-r border-[#D7CEBE]">
                        {baseSymbol}{d.principal_balance.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-[#5C5549] border-r border-[#D7CEBE]">{d.interest_rate_apr}%</td>
                      <td className="py-2.5 px-3 text-[#5C5549] border-r border-[#D7CEBE]">{baseSymbol}{d.min_monthly_payment}/mo</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onDeleteDebt(d.id)}
                          className="text-[#857D71] hover:text-[#9E2428] p-1 transition-colors cursor-pointer"
                          title="Discharge record"
                        >
                          <Trash2 size={13} strokeWidth={1.75} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Interactive Extra Payment Slider */}
            <div className="bg-[#ECE6D8] p-4 border border-[#D7CEBE] font-mono">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[#161513] uppercase tracking-wide">
                  ACCELERATED PRINCIPAL AMORTIZATION BUDGET:
                </span>
                <span className="text-sm font-bold text-[#1A5333]">
                  +{baseSymbol}{extraPayment}/MONTH
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="25"
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                className="w-full h-2 bg-[#D7CEBE] rounded-none appearance-none cursor-pointer accent-[#161513]"
              />
              <div className="flex justify-between text-[10px] text-[#857D71] mt-1.5 font-mono">
                <span>$0</span>
                <span>$250</span>
                <span>$500</span>
                <span>$750</span>
                <span>$1,000/mo extra</span>
              </div>
            </div>

            {/* Strategy Comparison Cards */}
            {comparison && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                {/* Snowball Card */}
                <div className="p-4 border border-[#D7CEBE] bg-[#FCFAF5] shadow-[1px_1px_0px_rgba(22,21,19,0.08)]">
                  <div className="flex items-center gap-2 pb-2 mb-2 border-b border-[#ECE6D8]">
                    <Snowflake size={15} strokeWidth={1.75} className="text-[#1E4268]" />
                    <h4 className="text-xs font-serif font-bold text-[#161513] uppercase tracking-wider">
                      METHOD I: SNOWBALL (BEHAVIORAL VELOCITY)
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#5C5549] mb-3">
                    Discharges lowest principal balances first to compound psychological momentum.
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between border-b border-[#ECE6D8] pb-1">
                      <span className="text-[#5C5549]">TERM TO FULL DISCHARGE:</span>
                      <strong className="text-[#161513]">{comparison.snowball.months} months</strong>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-[#5C5549]">INTEREST OVER TERM:</span>
                      <strong className="text-[#9E2428]">{baseSymbol}{comparison.snowball.total_interest.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Avalanche Card */}
                <div className="p-4 border border-[#D7CEBE] bg-[#FCFAF5] shadow-[1px_1px_0px_rgba(22,21,19,0.08)]">
                  <div className="flex items-center gap-2 pb-2 mb-2 border-b border-[#ECE6D8]">
                    <Flame size={15} strokeWidth={1.75} className="text-[#96681C]" />
                    <h4 className="text-xs font-serif font-bold text-[#161513] uppercase tracking-wider">
                      METHOD II: AVALANCHE (INTEREST OPTIMIZATION)
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#5C5549] mb-3">
                    Discharges highest APR interest obligations first to mathematically minimize total cost.
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between border-b border-[#ECE6D8] pb-1">
                      <span className="text-[#5C5549]">TERM TO FULL DISCHARGE:</span>
                      <strong className="text-[#161513]">{comparison.avalanche.months} months</strong>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-[#5C5549]">INTEREST OVER TERM:</span>
                      <strong className="text-[#1A5333]">{baseSymbol}{comparison.avalanche.total_interest.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

