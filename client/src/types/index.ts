export interface Currency {
  code: string;
  symbol: string;
  name: string;
  exchange_rate_to_base: number;
  is_base: boolean;
  updated_at: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'loan' | 'mortgage' | 'asset';
  currency: string;
  institution?: string;
  current_balance: number;
  credit_limit?: number;
  apr?: number;
  billing_cycle_day?: number;
  due_day?: number;
  color?: string;
  icon?: string;
  is_archived: boolean;
  balance_base?: number;
  exchange_rate?: number;
  utilization_percent?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id?: string | null;
  group_type: 'needs' | 'wants' | 'savings_debt' | 'income';
  color?: string;
  icon?: string;
  is_system: boolean;
}

export interface Transaction {
  id: string;
  account_id: string;
  destination_account_id?: string | null;
  category_id?: string | null;
  type: 'income' | 'expense' | 'transfer';
  amount_native: number;
  amount_base: number;
  exchange_rate: number;
  date: string;
  merchant: string;
  raw_description?: string;
  notes?: string;
  status: 'cleared' | 'pending' | 'reconciled';
  tags?: string;
  account_name?: string;
  account_currency?: string;
  destination_account_name?: string | null;
  created_at: string;
}

export interface Budget {
  category_id: string;
  category_name: string;
  group_type: string;
  icon?: string;
  color?: string;
  budget_id?: string | null;
  period: string;
  target_amount: number;
  actual_spent: number;
  remaining_amount: number;
  burn_percentage: number;
  pacing_index: number;
  is_overspent: boolean;
  is_warning: boolean;
  safe_daily_spend: number;
  days_remaining: number;
}

export interface RecurringRule {
  id: string;
  name: string;
  account_id: string;
  category_id?: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  next_due_date: string;
  auto_record: boolean;
  is_active: boolean;
  account_name?: string;
  account_currency?: string;
  category_name?: string;
  days_until_due: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  icon?: string;
  color?: string;
  progress_percentage: number;
  remaining_amount: number;
}

export interface Debt {
  id: string;
  name: string;
  principal_balance: number;
  interest_rate_apr: number;
  min_monthly_payment: number;
  due_day_of_month?: number;
}

export interface SummaryAnalytics {
  base_currency: string;
  base_symbol: string;
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
  cash_total: number;
  investments_total: number;
  credit_debt_total: number;
  monthly_income: number;
  monthly_expenses: number;
  net_savings: number;
  savings_rate_pct: number;
}

export interface CashflowTrend {
  period: string;
  month_label: string;
  income: number;
  expense: number;
  savings: number;
}

export interface Rule503020 {
  needs_amount: number;
  needs_pct: number;
  wants_amount: number;
  wants_pct: number;
  savings_amount: number;
  savings_pct: number;
  uncategorized_amount: number;
  total_spent: number;
}

export interface CategoryBreakdown {
  category_id: string;
  category_name: string;
  amount: number;
  color: string;
}

export interface DebtStrategyComparison {
  snowball: {
    total_interest: number;
    months: number;
    schedule: { month: number; remaining_balance: number; interest_accrued: number }[];
  };
  avalanche: {
    total_interest: number;
    months: number;
    schedule: { month: number; remaining_balance: number; interest_accrued: number }[];
  };
  interest_difference: number;
  months_difference: number;
}
