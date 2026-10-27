import {
  Currency,
  Account,
  Category,
  Transaction,
  Budget,
  RecurringRule,
  SavingsGoal,
  Debt,
  SummaryAnalytics,
  CashflowTrend,
  Rule503020,
  CategoryBreakdown,
  DebtStrategyComparison
} from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'API request failed');
  }
  return res.json();
}

export const api = {
  // Currencies
  getCurrencies: () => fetchJSON<Currency[]>('/currencies'),
  updateCurrency: (code: string, data: Partial<Currency>) =>
    fetchJSON<Currency>(`/currencies/${code}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Accounts
  getAccounts: (includeArchived = false) =>
    fetchJSON<Account[]>(`/accounts?include_archived=${includeArchived}`),
  createAccount: (data: Partial<Account>) =>
    fetchJSON<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAccount: (id: string, data: Partial<Account>) =>
    fetchJSON<Account>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAccount: (id: string) =>
    fetchJSON<{ message: string }>(`/accounts/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => fetchJSON<Category[]>('/categories'),
  createCategory: (data: Partial<Category>) =>
    fetchJSON<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Transactions
  getTransactions: (params?: {
    account_id?: string;
    category_id?: string;
    txn_type?: string;
    search?: string;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.account_id) query.set('account_id', params.account_id);
    if (params?.category_id) query.set('category_id', params.category_id);
    if (params?.txn_type) query.set('txn_type', params.txn_type);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    return fetchJSON<Transaction[]>(`/transactions?${query.toString()}`);
  },
  createTransaction: (data: Partial<Transaction>) =>
    fetchJSON<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteTransaction: (id: string) =>
    fetchJSON<{ message: string }>(`/transactions/${id}`, { method: 'DELETE' }),

  // Budgets
  getBudgets: (month?: string) =>
    fetchJSON<Budget[]>(`/budgets${month ? `?month=${month}` : ''}`),
  setBudget: (data: { category_id: string; period: string; target_amount: number; rollover_enabled?: boolean }) =>
    fetchJSON<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Recurring & Forecast
  getRecurring: () => fetchJSON<RecurringRule[]>('/recurring'),
  createRecurring: (data: Partial<RecurringRule>) =>
    fetchJSON<RecurringRule>('/recurring', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteRecurring: (id: string) =>
    fetchJSON<{ message: string }>(`/recurring/${id}`, { method: 'DELETE' }),
  getForecast: (days = 90) =>
    fetchJSON<{ date: string; projected_balance: number; events_count: number; has_alert: boolean }[]>(
      `/recurring/forecast?days=${days}`
    ),

  // Goals
  getGoals: () => fetchJSON<SavingsGoal[]>('/goals'),
  createGoal: (data: Partial<SavingsGoal>) =>
    fetchJSON<SavingsGoal>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateGoal: (id: string, data: Partial<SavingsGoal>) =>
    fetchJSON<SavingsGoal>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteGoal: (id: string) =>
    fetchJSON<{ message: string }>(`/goals/${id}`, { method: 'DELETE' }),

  // Debts
  getDebts: () => fetchJSON<Debt[]>('/debts'),
  createDebt: (data: Partial<Debt>) =>
    fetchJSON<Debt>('/debts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteDebt: (id: string) =>
    fetchJSON<{ message: string }>(`/debts/${id}`, { method: 'DELETE' }),
  compareDebtStrategies: (extraPayment = 0) =>
    fetchJSON<DebtStrategyComparison>(`/debts/compare-strategies?extra_payment=${extraPayment}`),

  // Analytics
  getSummary: () => fetchJSON<SummaryAnalytics>('/analytics/summary'),
  getCashflowTrends: (months = 6) =>
    fetchJSON<CashflowTrend[]>(`/analytics/cashflow-trends?months=${months}`),
  getRule503020: () => fetchJSON<Rule503020>('/analytics/rule-50-30-20'),
  getCategoryBreakdown: (period = 'month') =>
    fetchJSON<CategoryBreakdown[]>(`/analytics/category-breakdown?period=${period}`),

  // CSV Import
  previewCSV: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/import/preview`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to preview CSV');
    return res.json();
  },
};
