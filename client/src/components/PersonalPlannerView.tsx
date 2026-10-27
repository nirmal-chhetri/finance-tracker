import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Plus,
  Trash2,
  Coins,
  Wallet,
  Coffee,
  ShoppingBag,
  Utensils,
  Car,
  Film,
  Tag,
  Calendar,
  Layers,
  ArrowDownRight,
  ShieldCheck
} from 'lucide-react';
import {
  Account,
  Category,
  Currency,
  Transaction,
  RecurringRule,
  SavingsGoal,
  SummaryAnalytics
} from '../types';

interface PersonalPlannerViewProps {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  recurringRules: RecurringRule[];
  goals: SavingsGoal[];
  summary: SummaryAnalytics | null;
  baseCurrency?: Currency;
  onSaveTransaction: (data: Partial<Transaction>) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
}

export const PersonalPlannerView: React.FC<PersonalPlannerViewProps> = ({
  accounts,
  categories,
  transactions,
  recurringRules,
  goals,
  summary,
  baseCurrency,
  onSaveTransaction,
  onDeleteTransaction,
}) => {
  const symbol = baseCurrency?.symbol || '$';

  // Quick Expense Form State
  const [quickAmount, setQuickAmount] = useState<string>('');
  const [quickMerchant, setQuickMerchant] = useState<string>('');
  const [quickCategoryId, setQuickCategoryId] = useState<string>('');
  const [quickAccountId, setQuickAccountId] = useState<string>(accounts[0]?.id || '');
  const [quickDate, setQuickDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [quickNotes, setQuickNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justLoggedMsg, setJustLoggedMsg] = useState<string | null>(null);

  // Monthly Planner Interactive State (defaults based on summary or reasonable estimates)
  const [customIncome, setCustomIncome] = useState<number>(summary?.monthly_income || 4500);
  const [customSavingsTarget, setCustomSavingsTarget] = useState<number>(800);

  // Time calculations
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);
  const todayISO = now.toISOString().split('T')[0];

  // Fixed Monthly Bills from Recurring Rules
  const monthlyFixedBills = recurringRules.reduce((sum, r) => {
    let monthlyEquiv = r.amount;
    if (r.frequency === 'weekly') monthlyEquiv = r.amount * 4.33;
    else if (r.frequency === 'biweekly') monthlyEquiv = r.amount * 2.16;
    else if (r.frequency === 'quarterly') monthlyEquiv = r.amount / 3;
    else if (r.frequency === 'yearly') monthlyEquiv = r.amount / 12;
    return sum + monthlyEquiv;
  }, 0);

  // Effective Income (use custom or summary)
  const plannedIncome = customIncome > 0 ? customIncome : 4500;
  // Discretionary Pool for Month = Income - Fixed Bills - Target Savings
  const plannedFlexiblePool = Math.max(0, plannedIncome - monthlyFixedBills - customSavingsTarget);

  // Actual Spending to Date this month
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const thisMonthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonthPrefix)
  );
  const totalSpentThisMonth = thisMonthExpenses.reduce((sum, t) => sum + t.amount_base, 0);

  // Today's Spent
  const todayExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date === todayISO
  );
  const totalSpentToday = todayExpenses.reduce((sum, t) => sum + t.amount_base, 0);

  // Remaining Flexible Pool
  // We approximate variable spend by subtracting fixed recurring from total expenses
  const remainingFlexiblePool = Math.max(0, plannedFlexiblePool - totalSpentThisMonth);

  // Dynamic Safe-to-Spend
  const safeToSpendToday = remainingFlexiblePool / daysRemaining;
  const safeToSpendThisWeek = safeToSpendToday * Math.min(7, daysRemaining);
  const todayRemainingAllowance = safeToSpendToday - totalSpentToday;

  // Category quick shortcuts
  const quickCategories = [
    { label: 'Food & Groceries', icon: Utensils, match: ['groceries', 'food'] },
    { label: 'Coffee & Dining', icon: Coffee, match: ['dining', 'coffee', 'restaurants'] },
    { label: 'Transit & Gas', icon: Car, match: ['transportation', 'transit', 'gas'] },
    { label: 'Shopping', icon: ShoppingBag, match: ['shopping', 'gadgets'] },
    { label: 'Entertainment', icon: Film, match: ['entertainment', 'media'] },
  ];

  // Resolve Category IDs for quick chips
  const getCategoryId = (keywords: string[]) => {
    const found = categories.find((c) =>
      keywords.some((k) => c.name.toLowerCase().includes(k))
    );
    return found ? found.id : categories[0]?.id || '';
  };

  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(quickAmount);
    if (isNaN(val) || val <= 0) return alert('Please enter a valid expense amount');
    if (!quickMerchant.trim()) return alert('Please specify what or where this was spent (e.g. Lunch, Coffee)');

    setIsSubmitting(true);
    try {
      await onSaveTransaction({
        account_id: quickAccountId || accounts[0]?.id,
        category_id: quickCategoryId || getCategoryId(['dining', 'food', 'groceries']),
        type: 'expense',
        amount_native: val,
        date: quickDate,
        merchant: quickMerchant.trim(),
        notes: quickNotes.trim() || undefined,
      });

      setJustLoggedMsg(`Logged ${symbol}${val.toFixed(2)} for "${quickMerchant.trim()}"`);
      setQuickAmount('');
      setQuickMerchant('');
      setQuickNotes('');
      setTimeout(() => setJustLoggedMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error recording expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for quick amount chips
  const addQuickAmount = (val: number) => {
    const curr = parseFloat(quickAmount) || 0;
    setQuickAmount((curr + val).toFixed(2));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Dynamic Safe-to-Spend Dials */}
      <div className="bg-[#FCFAF5] border-2 border-[#161513] shadow-[2px_2px_0px_rgba(22,21,19,0.15)] p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#D7CEBE] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Zap size={18} strokeWidth={1.75} className="text-[#96681C]" />
              <h2 className="text-lg font-serif font-bold text-[#161513]">
                Daily Personal Planner & Pocket Log
              </h2>
            </div>
            <p className="text-xs text-[#5C5549] mt-0.5">
              Frictionless daily expense recording with dynamic Safe-to-Spend allowances and monthly cash waterfall.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-[#ECE6D8] px-2.5 py-1 border border-[#D7CEBE] text-[#161513] font-semibold">
              DAY {currentDay} OF {totalDaysInMonth} ({daysRemaining}d REMAINING)
            </span>
          </div>
        </div>

        {/* 3 Large KPI Dials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 font-mono">
          {/* Safe-to-Spend Today */}
          <div className="p-4 bg-[#FCFAF5] border border-[#161513] shadow-[1px_1px_0px_rgba(22,21,19,0.12)] relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] tracking-wider uppercase text-[#857D71] mb-1">
              <span className="flex items-center gap-1 font-bold text-[#161513]">
                <Sparkles size={12} strokeWidth={1.75} className="text-[#96681C]" /> SAFE-TO-SPEND TODAY
              </span>
              <span className="text-[9px] bg-[#E2ECE5] text-[#1A5333] px-1.5 py-0.5 border border-[#B3D3BE] font-bold">
                DAILY CEILING
              </span>
            </div>
            <div className="text-3xl font-bold text-[#1A5333] pb-1 inline-block accounting-double-rule">
              {symbol}{safeToSpendToday.toFixed(2)}
            </div>
            <div className="mt-2 text-[11px] text-[#5C5549] flex items-center justify-between border-t border-[#ECE6D8] pt-2">
              <span>Spent today: <strong>{symbol}{totalSpentToday.toFixed(2)}</strong></span>
              <span className={todayRemainingAllowance >= 0 ? 'text-[#1A5333] font-bold' : 'text-[#9E2428] font-bold'}>
                {todayRemainingAllowance >= 0
                  ? `${symbol}${todayRemainingAllowance.toFixed(2)} left`
                  : `${symbol}${Math.abs(todayRemainingAllowance).toFixed(2)} over quota`}
              </span>
            </div>
          </div>

          {/* Safe-to-Spend This Week */}
          <div className="p-4 bg-[#FCFAF5] border border-[#D7CEBE] shadow-[1px_1px_0px_rgba(22,21,19,0.08)]">
            <div className="flex items-center justify-between text-[10px] tracking-wider uppercase text-[#857D71] mb-1">
              <span className="flex items-center gap-1 font-bold text-[#5C5549]">
                <Clock size={12} strokeWidth={1.75} className="text-[#1E4268]" /> SAFE THIS WEEK (7-DAY)
              </span>
              <span className="text-[9px] bg-[#E8EEF5] text-[#1E4268] px-1.5 py-0.5 border border-[#B9CFE5] font-bold">
                WEEKLY PACE
              </span>
            </div>
            <div className="text-3xl font-bold text-[#1E4268] pb-1 inline-block accounting-double-rule">
              {symbol}{safeToSpendThisWeek.toFixed(2)}
            </div>
            <div className="mt-2 text-[11px] text-[#857D71] border-t border-[#ECE6D8] pt-2">
              Smooth buffer across the next 7 calendar days
            </div>
          </div>

          {/* Monthly Discretionary Remaining */}
          <div className="p-4 bg-[#FCFAF5] border border-[#D7CEBE] shadow-[1px_1px_0px_rgba(22,21,19,0.08)]">
            <div className="flex items-center justify-between text-[10px] tracking-wider uppercase text-[#857D71] mb-1">
              <span className="flex items-center gap-1 font-bold text-[#5C5549]">
                <Wallet size={12} strokeWidth={1.75} className="text-[#96681C]" /> REMAINING FLEXIBLE POOL
              </span>
              <span className="text-[9px] bg-[#ECE6D8] text-[#161513] px-1.5 py-0.5 border border-[#D7CEBE] font-bold">
                MONTH POOL
              </span>
            </div>
            <div className="text-3xl font-bold text-[#161513] pb-1 inline-block accounting-double-rule">
              {symbol}{remainingFlexiblePool.toFixed(2)}
            </div>
            <div className="mt-2 text-[11px] text-[#857D71] border-t border-[#ECE6D8] pt-2">
              From {symbol}{plannedFlexiblePool.toFixed(2)} total monthly discretionary allowance
            </div>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side: Fast 1-Click Expense Logger & Visual Waterfall Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FAST EXPENSE LOGGER (5 cols) */}
        <div className="lg:col-span-5 bg-[#FCFAF5] border-2 border-[#161513] shadow-[2px_2px_0px_rgba(22,21,19,0.15)] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D7CEBE]">
              <div className="flex items-center gap-2">
                <Zap size={16} strokeWidth={1.75} className="text-[#96681C]" />
                <h3 className="text-sm font-serif font-bold text-[#161513] uppercase tracking-wide">
                  Quick Pocket Expense Logger
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#857D71]">INSTANT LOG</span>
            </div>

            {justLoggedMsg && (
              <div className="p-2.5 mb-4 bg-[#E2ECE5] border border-[#B3D3BE] text-xs font-mono text-[#1A5333] flex items-center gap-2">
                <CheckCircle2 size={14} strokeWidth={1.75} />
                <span>{justLoggedMsg}</span>
              </div>
            )}

            <form onSubmit={handleQuickLog} className="space-y-4 font-mono text-xs">
              {/* Big Focus Amount */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#161513] mb-1">
                  AMOUNT SPENT ({symbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-bold text-[#857D71]">
                    {symbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-2xl font-bold bg-[#ECE6D8]/60 border-2 border-[#161513] text-[#161513] focus:outline-none focus:bg-[#FCFAF5]"
                  />
                </div>

                {/* Quick Add Increment Chips */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-[#857D71] mr-1">Quick:</span>
                  {[5, 10, 20, 50, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => addQuickAmount(val)}
                      className="px-2 py-0.5 bg-[#ECE6D8] hover:bg-[#D7CEBE] text-[10px] font-semibold text-[#161513] border border-[#D7CEBE] cursor-pointer"
                    >
                      +{symbol}{val}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setQuickAmount('')}
                    className="text-[10px] text-[#857D71] hover:text-[#9E2428] ml-auto cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Where / Payee / Merchant */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#161513] mb-1">
                  WHAT / WHERE (VENDOR OR PURPOSE)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Coffee, Grocery Run, Fuel, Lunch"
                  value={quickMerchant}
                  onChange={(e) => setQuickMerchant(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FCFAF5] border border-[#161513] text-[#161513] text-xs focus:outline-none"
                />
              </div>

              {/* Quick Category Chips */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#161513] mb-1.5">
                  CATEGORY SHORTCUT:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {quickCategories.map((qc) => {
                    const catId = getCategoryId(qc.match);
                    const isSelected = quickCategoryId === catId;
                    const Icon = qc.icon;
                    return (
                      <button
                        key={qc.label}
                        type="button"
                        onClick={() => setQuickCategoryId(catId)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 text-[10px] border transition-colors cursor-pointer text-left truncate ${
                          isSelected
                            ? 'bg-[#161513] text-[#FCFAF5] border-[#161513] font-bold'
                            : 'bg-[#ECE6D8]/50 text-[#5C5549] border-[#D7CEBE] hover:border-[#161513]'
                        }`}
                      >
                        <Icon size={12} strokeWidth={1.75} />
                        <span className="truncate">{qc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Account & Date Inlines */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#857D71] mb-1">
                    CHARGED ACCOUNT
                  </label>
                  <select
                    value={quickAccountId}
                    onChange={(e) => setQuickAccountId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#FCFAF5] border border-[#D7CEBE] text-xs text-[#161513] cursor-pointer"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.currency})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#857D71] mb-1">
                    RECORD DATE
                  </label>
                  <input
                    type="date"
                    value={quickDate}
                    onChange={(e) => setQuickDate(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#FCFAF5] border border-[#D7CEBE] text-xs text-[#161513]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 btn-ledger-primary py-2.5 text-xs font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus size={15} strokeWidth={1.75} className="text-[#E5C178]" />
                <span>{isSubmitting ? 'RECORDING TO LEDGER...' : 'LOG EXPENSE NOW'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* VISUAL MONTHLY CASH WATERFALL PLANNER (7 cols) */}
        <div className="lg:col-span-7 bg-[#FCFAF5] border-2 border-[#161513] shadow-[2px_2px_0px_rgba(22,21,19,0.15)] p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-[#D7CEBE] gap-2">
              <div className="flex items-center gap-2">
                <Layers size={16} strokeWidth={1.75} className="text-[#96681C]" />
                <h3 className="text-sm font-serif font-bold text-[#161513] uppercase tracking-wide">
                  Monthly Cash Waterfall & Budget Plan
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#857D71]">INCOME → BILLS → SAVINGS → SPEND</span>
            </div>

            <p className="text-xs text-[#5C5549] mb-4 font-sans">
              Plan your month by peeling away obligations first: starting with your monthly paycheck, subtracting known bills and your target savings, leaving your true flexible daily spending money.
            </p>

            {/* Waterfall Steps */}
            <div className="space-y-3 font-mono text-xs">
              {/* Step 1: Expected Monthly Income */}
              <div className="p-3 bg-[#E2ECE5]/50 border border-[#B3D3BE] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-none bg-[#1A5333] text-[#FCFAF5] font-bold text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-[#161513] block">TOTAL MONTHLY INCOME / PAYCHECK</span>
                    <span className="text-[10px] text-[#5C5549]">Net incoming cashflow available this month</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#1A5333]">+{symbol}</span>
                  <input
                    type="number"
                    value={customIncome}
                    onChange={(e) => setCustomIncome(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 text-right font-bold font-mono bg-[#FCFAF5] border border-[#1A5333] text-[#1A5333] focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 2: Fixed Mandates & Bills */}
              <div className="p-3 bg-[#FCFAF5] border border-[#D7CEBE] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-none bg-[#161513] text-[#FCFAF5] font-bold text-[11px] flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-[#161513] block">− FIXED BILLS & STANDING MANDATES</span>
                    <span className="text-[10px] text-[#857D71]">
                      Rent, utilities, subscriptions ({recurringRules.length} registered mandates)
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#9E2428]">
                  −{symbol}{monthlyFixedBills.toFixed(2)}
                </span>
              </div>

              {/* Step 3: Target Savings & Goals */}
              <div className="p-3 bg-[#FCFAF5] border border-[#D7CEBE] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-none bg-[#96681C] text-[#FCFAF5] font-bold text-[11px] flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-[#161513] block">− TARGET SAVINGS & SINKING FUNDS</span>
                    <span className="text-[10px] text-[#857D71]">
                      Emergency cushion and long-term investments
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#96681C]">−{symbol}</span>
                  <input
                    type="number"
                    value={customSavingsTarget}
                    onChange={(e) => setCustomSavingsTarget(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-right font-bold font-mono bg-[#FCFAF5] border border-[#96681C] text-[#96681C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 4: Resulting Monthly Pocket Money */}
              <div className="p-3 bg-[#ECE6D8] border-2 border-[#161513] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-none bg-[#1E4268] text-[#FCFAF5] font-bold text-[11px] flex items-center justify-center">
                    =
                  </span>
                  <div>
                    <span className="font-bold text-[#161513] block">MONTHLY FLEXIBLE POCKET MONEY</span>
                    <span className="text-[10px] text-[#5C5549]">
                      Freely spendable pool = <strong>{symbol}{(plannedFlexiblePool / totalDaysInMonth).toFixed(2)}/day average</strong>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-[#161513] block">
                    {symbol}{plannedFlexiblePool.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Proportional Waterfall Bar */}
            <div className="mt-5 pt-4 border-t border-[#D7CEBE] font-mono">
              <div className="flex justify-between text-[10px] text-[#857D71] mb-1.5 uppercase font-bold">
                <span>INCOME ALLOCATION PROPORTION:</span>
                <span>
                  BILLS {Math.round((monthlyFixedBills / plannedIncome) * 100)}% • SAVINGS {Math.round((customSavingsTarget / plannedIncome) * 100)}% • SPEND {Math.round((plannedFlexiblePool / plannedIncome) * 100)}%
                </span>
              </div>
              <div className="w-full h-4 bg-[#ECE6D8] border border-[#161513] flex overflow-hidden">
                <div
                  title="Fixed Bills"
                  className="bg-[#9E2428] h-full transition-all"
                  style={{ width: `${Math.min(100, (monthlyFixedBills / plannedIncome) * 100)}%` }}
                />
                <div
                  title="Target Savings"
                  className="bg-[#96681C] h-full transition-all"
                  style={{ width: `${Math.min(100, (customSavingsTarget / plannedIncome) * 100)}%` }}
                />
                <div
                  title="Flexible Spend"
                  className="bg-[#1A5333] h-full transition-all"
                  style={{ width: `${Math.max(0, 100 - (monthlyFixedBills / plannedIncome) * 100 - (customSavingsTarget / plannedIncome) * 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-4 text-[10px] text-[#5C5549] mt-2">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-[#9E2428] inline-block" /> Fixed Bills
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-[#96681C] inline-block" /> Target Savings
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-[#1A5333] inline-block" /> Pocket Money
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Today's & This Week's Quick Feed of Logged Expenses */}
      <div className="bg-[#FCFAF5] border-2 border-[#161513] shadow-[2px_2px_0px_rgba(22,21,19,0.15)] p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D7CEBE]">
          <div>
            <div className="flex items-center gap-2">
              <Clock size={16} strokeWidth={1.75} className="text-[#96681C]" />
              <h3 className="text-sm font-serif font-bold text-[#161513] uppercase tracking-wide">
                Recent Daily Expenses (This Week)
              </h3>
            </div>
            <p className="text-xs text-[#5C5549] mt-0.5 font-sans">
              Chronological feed of your everyday purchases with 1-click ledger removal.
            </p>
          </div>
          <span className="text-xs font-mono bg-[#ECE6D8] px-2.5 py-1 border border-[#D7CEBE] text-[#161513]">
            {thisMonthExpenses.length} EXPENSES THIS MONTH
          </span>
        </div>

        {thisMonthExpenses.length === 0 ? (
          <p className="text-xs font-mono text-[#857D71] py-8 text-center italic">
            No expenses recorded yet this period. Use the Quick Pocket Expense Logger above to log your first coffee, lunch, or grocery trip!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-[#ECE6D8] border-b border-[#161513] text-[#5C5549] text-[10px] uppercase">
                  <th className="py-2 px-3 border-r border-[#D7CEBE] w-28">DATE</th>
                  <th className="py-2 px-3 border-r border-[#D7CEBE]">ITEM / PAYEE</th>
                  <th className="py-2 px-3 border-r border-[#D7CEBE]">ACCOUNT</th>
                  <th className="py-2 px-3 text-right w-32 border-r border-[#D7CEBE]">AMOUNT</th>
                  <th className="py-2 px-2 text-center w-12">DISCHARGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7CEBE]">
                {thisMonthExpenses.slice(0, 8).map((t) => (
                  <tr key={t.id} className="hover:bg-[#ECE6D8]/50 transition-colors">
                    <td className="py-2 px-3 text-[#5C5549] border-r border-[#D7CEBE] whitespace-nowrap">
                      {t.date === todayISO ? (
                        <span className="font-bold text-[#1A5333] bg-[#E2ECE5] px-1.5 py-0.5 border border-[#B3D3BE]">
                          TODAY
                        </span>
                      ) : (
                        t.date
                      )}
                    </td>
                    <td className="py-2 px-3 font-semibold text-[#161513] border-r border-[#D7CEBE]">
                      {t.merchant}
                      {t.notes && <span className="text-[10px] text-[#857D71] block font-normal italic">{t.notes}</span>}
                    </td>
                    <td className="py-2 px-3 text-[#5C5549] border-r border-[#D7CEBE] whitespace-nowrap">
                      {t.account_name}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-[#9E2428] border-r border-[#D7CEBE] whitespace-nowrap">
                      −{symbol}{t.amount_base.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (confirm(`Expunge "${t.merchant}" entry from ledger?`)) {
                            onDeleteTransaction(t.id);
                          }
                        }}
                        className="text-[#857D71] hover:text-[#9E2428] p-1 cursor-pointer transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 size={13} strokeWidth={1.75} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
