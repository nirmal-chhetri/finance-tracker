import React, { useState } from 'react';
import {
  PieChart,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Calendar,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Budget, Currency } from '../types';

interface BudgetsViewProps {
  budgets: Budget[];
  baseCurrency?: Currency;
  onSetBudget: (categoryId: string, targetAmount: number) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  baseCurrency,
  onSetBudget,
}) => {
  const baseSymbol = baseCurrency?.symbol || '$';
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [targetInput, setTargetInput] = useState<string>('');

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.target_amount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.actual_spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;

  const handleStartEdit = (b: Budget) => {
    setEditingCatId(b.category_id);
    setTargetInput(b.target_amount > 0 ? String(b.target_amount) : '');
  };

  const handleSave = (catId: string) => {
    const val = parseFloat(targetInput);
    if (!isNaN(val) && val >= 0) {
      onSetBudget(catId, val);
    }
    setEditingCatId(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Monthly Budget Health Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Monthly Budget */}
        <div className="bg-[#FCFAF5] p-5 border border-[#D7CEBE] shadow-[1px_1px_0px_rgba(22,21,19,0.12)]">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-[#857D71] mb-1">
            <span>APPROPRIATION CEILING</span>
            <span className="bg-[#ECE6D8] px-1.5 py-0.5 border border-[#D7CEBE] text-[#161513]">PERIOD TOTAL</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#161513] pb-0.5 inline-block accounting-double-rule">
            {baseSymbol}{totalBudgeted.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] font-mono text-[#857D71] block mt-1">Authorized across all envelopes</span>
        </div>

        {/* Total Spent to Date */}
        <div className="bg-[#FCFAF5] p-5 border border-[#D7CEBE] shadow-[1px_1px_0px_rgba(22,21,19,0.12)]">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-[#857D71] mb-1">
            <span>TOTAL DISBURSED</span>
            <span className="bg-[#ECE6D8] px-1.5 py-0.5 border border-[#D7CEBE] text-[#161513]">OUTFLOW</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#161513] pb-0.5 inline-block accounting-double-rule">
            {baseSymbol}{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] font-mono text-[#857D71] block mt-1">
            {totalBudgeted > 0 ? `${Math.round((totalSpent / totalBudgeted) * 100)}% of ceiling expended` : 'No limits established'}
          </span>
        </div>

        {/* Remaining Cushion */}
        <div className="bg-[#FCFAF5] p-5 border border-[#D7CEBE] shadow-[1px_1px_0px_rgba(22,21,19,0.12)]">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-[#857D71] mb-1">
            <span>TREASURY CUSHION</span>
            <span className={`px-1.5 py-0.5 border font-bold ${
              totalRemaining < 0 
                ? 'bg-[#FCE8E8] text-[#9E2428] border-[#F3BABA]' 
                : 'bg-[#E2ECE5] text-[#1A5333] border-[#B3D3BE]'
            }`}>
              {totalRemaining < 0 ? 'DEFICIT' : 'SURPLUS'}
            </span>
          </div>
          <div className={`text-2xl font-bold font-mono pb-0.5 inline-block accounting-double-rule ${
            totalRemaining < 0 ? 'text-[#9E2428]' : 'text-[#1A5333]'
          }`}>
            {baseSymbol}{Math.abs(totalRemaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            {totalRemaining < 0 && ' OVER'}
          </div>
          <span className="text-[11px] font-mono text-[#857D71] block mt-1">
            {totalRemaining >= 0 ? 'Safe remaining period allowance' : 'Appropriation exceeded'}
          </span>
        </div>
      </div>

      {/* 2. Budget Category Envelope Cards */}
      <div className="bg-[#FCFAF5] border-2 border-[#161513] shadow-[2px_2px_0px_rgba(22,21,19,0.15)] p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-6 border-b border-[#D7CEBE] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen size={16} strokeWidth={1.75} className="text-[#96681C]" />
              <h3 className="text-base font-serif font-bold text-[#161513]">
                Category Envelopes & Velocity Pacing
              </h3>
            </div>
            <p className="text-xs text-[#5C5549] mt-0.5 font-sans">
              Real-time velocity monitor auditing whether expenditure acceleration exceeds calendar day burn.
            </p>
          </div>
          <span className="text-xs font-mono bg-[#ECE6D8] px-3 py-1 border border-[#D7CEBE] text-[#161513] font-semibold">
            {budgets[0]?.days_remaining ?? 15} DAYS REMAINING
          </span>
        </div>

        <div className="space-y-4">
          {budgets.map((b) => {
            const isEditing = editingCatId === b.category_id;
            const isOver = b.is_overspent;
            const isAccelerated = b.is_warning;

            return (
              <div
                key={b.category_id}
                className="p-4 bg-[#FCFAF5] border border-[#D7CEBE] hover:border-[#161513] transition-colors shadow-[1px_1px_0px_rgba(22,21,19,0.06)]"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 font-mono">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif font-bold text-sm text-[#161513]">
                      {b.category_name}
                    </span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#ECE6D8] border border-[#D7CEBE] text-[#5C5549]">
                      {b.group_type}
                    </span>

                    {/* Status Badge */}
                    {isOver ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#9E2428] bg-[#FCE8E8] border border-[#F3BABA] px-2 py-0.5">
                        <AlertTriangle size={11} strokeWidth={1.75} /> DEFICIT // OVERSPENT
                      </span>
                    ) : isAccelerated ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#96681C] bg-[#FFF8EB] border border-[#E8D4A8] px-2 py-0.5">
                        <TrendingDown size={11} strokeWidth={1.75} /> BURNING FAST ({b.pacing_index}x)
                      </span>
                    ) : b.target_amount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1A5333] bg-[#E2ECE5] border border-[#B3D3BE] px-2 py-0.5">
                        <CheckCircle2 size={11} strokeWidth={1.75} /> IN QUOTA
                      </span>
                    ) : null}
                  </div>

                  {/* Right: Target & Spent info */}
                  <div className="flex items-center gap-3 text-xs">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#857D71] font-mono">{baseSymbol}</span>
                        <input
                          type="number"
                          value={targetInput}
                          onChange={(e) => setTargetInput(e.target.value)}
                          placeholder="Limit"
                          autoFocus
                          className="w-24 px-2 py-1 text-xs font-mono bg-[#ECE6D8] border border-[#161513] text-[#161513] focus:outline-none"
                        />
                        <button
                          onClick={() => handleSave(b.category_id)}
                          className="btn-ledger-primary px-2.5 py-1 text-[11px] cursor-pointer"
                        >
                          SAVE
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="text-[#857D71] hover:text-[#161513] text-[11px] cursor-pointer ml-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-[#5C5549]">
                          Disbursed: <strong className="text-[#161513]">{baseSymbol}{b.actual_spent.toFixed(2)}</strong> of {baseSymbol}{b.target_amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleStartEdit(b)}
                          className="text-[11px] font-semibold text-[#161513] hover:underline cursor-pointer"
                        >
                          [{b.target_amount > 0 ? 'ADJUST' : '+ SET LIMIT'}]
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Ruled Meter */}
                <div className="w-full bg-[#ECE6D8] h-3 border border-[#D7CEBE] mb-2">
                  <div
                    className={`h-full border-r border-[#161513] transition-all duration-300 ${
                      isOver
                        ? 'bg-[#9E2428]'
                        : isAccelerated
                        ? 'bg-[#96681C]'
                        : 'bg-[#1A5333]'
                    }`}
                    style={{ width: `${Math.min(100, b.burn_percentage)}%` }}
                  />
                </div>

                {/* Safe Daily Spend & Remaining Info */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[#5C5549]">
                  <span>
                    BALANCE REMAINING: <strong className={isOver ? 'text-[#9E2428]' : 'text-[#161513]'}>
                      {baseSymbol}{b.remaining_amount.toFixed(2)}
                    </strong>
                  </span>
                  {b.target_amount > 0 && !isOver && (
                    <span className="flex items-center gap-1 text-[#5C5549]">
                      <Sparkles size={11} strokeWidth={1.75} className="text-[#96681C]" />
                      Safe daily burn allowance: <strong className="text-[#161513]">{baseSymbol}{b.safe_daily_spend.toFixed(2)}/day</strong>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

