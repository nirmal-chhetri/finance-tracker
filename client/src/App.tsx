import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AccountsView } from './components/AccountsView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { SubscriptionsView } from './components/SubscriptionsView';
import { GoalsAndDebtsView } from './components/GoalsAndDebtsView';
import { CSVImportView } from './components/CSVImportView';
import { PersonalPlannerView } from './components/PersonalPlannerView';
import { NewTransactionModal } from './components/NewTransactionModal';
import { NewAccountModal } from './components/NewAccountModal';

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
  CategoryBreakdown
} from './types';
import { api } from './api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Core Data State
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  // Analytics State
  const [summary, setSummary] = useState<SummaryAnalytics | null>(null);
  const [cashflow, setCashflow] = useState<CashflowTrend[]>([]);
  const [rule503020, setRule503020] = useState<Rule503020 | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);

  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data
  const refreshAllData = async () => {
    try {
      const [
        currs,
        accs,
        cats,
        txns,
        bdgs,
        recs,
        gls,
        dbts,
        sum,
        cflow,
        r50,
        cbreak,
        fc
      ] = await Promise.all([
        api.getCurrencies(),
        api.getAccounts(),
        api.getCategories(),
        api.getTransactions({ limit: 100 }),
        api.getBudgets(),
        api.getRecurring(),
        api.getGoals(),
        api.getDebts(),
        api.getSummary(),
        api.getCashflowTrends(6),
        api.getRule503020(),
        api.getCategoryBreakdown('month'),
        api.getForecast(90)
      ]);

      setCurrencies(currs);
      setAccounts(accs);
      setCategories(cats);
      setTransactions(txns);
      setBudgets(bdgs);
      setRecurringRules(recs);
      setGoals(gls);
      setDebts(dbts);
      setSummary(sum);
      setCashflow(cflow);
      setRule503020(r50);
      setCategoryBreakdown(cbreak);
      setForecast(fc);
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const baseCurrency = currencies.find((c) => c.is_base) || currencies[0];

  const handleSelectBaseCurrency = async (code: string) => {
    try {
      await api.updateCurrency(code, { is_base: true });
      await refreshAllData();
    } catch (err) {
      console.error('Failed to change base currency:', err);
    }
  };

  const handleSaveTransaction = async (data: Partial<Transaction>) => {
    try {
      await api.createTransaction(data);
      await refreshAllData();
    } catch (err: any) {
      alert(err.message || 'Error saving transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      await refreshAllData();
    } catch (err: any) {
      alert(err.message || 'Error deleting transaction');
    }
  };

  const handleSaveAccount = async (data: Partial<Account>) => {
    try {
      await api.createAccount(data);
      await refreshAllData();
    } catch (err: any) {
      alert(err.message || 'Error creating account');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await api.deleteAccount(id);
      await refreshAllData();
    } catch (err: any) {
      alert(err.message || 'Error archiving account');
    }
  };

  const handleSetBudget = async (categoryId: string, targetAmount: number) => {
    try {
      const curMonth = new Date().toISOString().slice(0, 7);
      await api.setBudget({
        category_id: categoryId,
        period: curMonth,
        target_amount: targetAmount
      });
      await refreshAllData();
    } catch (err: any) {
      alert(err.message || 'Error updating budget');
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    try {
      await api.deleteRecurring(id);
      await refreshAllData();
    } catch (err: any) {
      alert(err.message || 'Error deleting subscription');
    }
  };

  const handleCreateGoal = async () => {
    const name = prompt('Goal Name (e.g. Vacation, Down Payment):');
    if (!name) return;
    const target = parseFloat(prompt('Target Amount:') || '0');
    if (!target) return;
    try {
      await api.createGoal({ name, target_amount: target, current_amount: 0 });
      await refreshAllData();
    } catch (err: any) {
      alert(err.message || 'Error creating goal');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await api.deleteGoal(id);
      await refreshAllData();
    } catch (err: any) {
      alert(err.message || 'Error deleting goal');
    }
  };

  const handleCreateDebt = async () => {
    const name = prompt('Debt / Loan Name (e.g. Student Loan, Auto Loan):');
    if (!name) return;
    const balance = parseFloat(prompt('Principal Balance:') || '0');
    const apr = parseFloat(prompt('APR Interest Rate (%):') || '0');
    const minPay = parseFloat(prompt('Minimum Monthly Payment:') || '0');
    if (!balance) return;
    try {
      await api.createDebt({
        name,
        principal_balance: balance,
        interest_rate_apr: apr,
        min_monthly_payment: minPay
      });
      await refreshAllData();
    } catch (err: any) {
      alert(err.message || 'Error creating debt entry');
    }
  };

  const handleDeleteDebt = async (id: string) => {
    try {
      await api.deleteDebt(id);
      await refreshAllData();
    } catch (err: any) {
      alert(err.message || 'Error deleting debt entry');
    }
  };

  const getTabTitleAndSubtitle = () => {
    switch (currentTab) {
      case 'planner':
        return { title: 'Personal Expense Planner & Pocket Log', subtitle: 'Dynamic Safe-to-Spend allowances, 1-click rapid expense logging, and monthly cash waterfall' };
      case 'accounts':
        return { title: 'Account Registry & Portfolios', subtitle: 'Depository holdings, credit facilities, brokerage accounts, and obligations' };
      case 'transactions':
        return { title: 'General Journal & Ledger', subtitle: 'Chronological double-entry record of all credits, debits, and transfers' };
      case 'budgets':
        return { title: 'Appropriations & Expenditure Ledger', subtitle: 'Fiscal envelopes with pacing acceleration velocity and variance indicators' };
      case 'recurring':
        return { title: 'Standing Orders & Cash Forecast', subtitle: 'Scheduled recurring drafts and 30/60/90-day liquid position projections' };
      case 'goals':
        return { title: 'Sinking Funds & Debt Amortization', subtitle: 'Capital accumulation milestones and Snowball vs Avalanche payoff engine' };
      case 'import':
        return { title: 'Statement Ingestion & Audit', subtitle: 'Raw statement ingestion with cryptographic deduplication and audit trail' };
      default:
        return { title: 'Statement of Financial Condition', subtitle: 'Comprehensive audited balance sheet and capital flow overview' };
    }
  };

  const { title, subtitle } = getTabTitleAndSubtitle();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-6 select-none">
        <div className="bg-[#FCFAF5] border border-[#D7CEBE] p-8 max-w-sm w-full text-center shadow-[2px_2px_0px_rgba(22,21,19,0.12)]">
          <div className="w-12 h-12 border-2 border-[#D7CEBE] border-t-[#161513] mx-auto animate-spin mb-4" />
          <h2 className="font-masthead text-xs tracking-[0.2em] uppercase font-bold text-[#161513]">
            ARCHIVAL LEDGER
          </h2>
          <p className="text-[11px] font-mono text-[#857D71] mt-2 tracking-wide uppercase">
            CALCULATING AUDITED LEDGER BALANCES...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {/* Slender Notion/Apple style Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currencies={currencies}
        baseCurrency={baseCurrency}
        onSelectBaseCurrency={handleSelectBaseCurrency}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
          onOpenNewAccount={() => setIsAccountModalOpen(true)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                summary={summary}
                cashflow={cashflow}
                rule503020={rule503020}
                categoryBreakdown={categoryBreakdown}
                upcomingBills={recurringRules}
                recentTransactions={transactions}
                onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
              />
            )}

            {currentTab === 'planner' && (
              <PersonalPlannerView
                accounts={accounts}
                categories={categories}
                transactions={transactions}
                recurringRules={recurringRules}
                goals={goals}
                summary={summary}
                baseCurrency={baseCurrency}
                onSaveTransaction={handleSaveTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}

            {currentTab === 'accounts' && (
              <AccountsView
                accounts={accounts}
                baseCurrency={baseCurrency}
                onOpenNewAccount={() => setIsAccountModalOpen(true)}
                onOpenTransfer={() => setIsTransactionModalOpen(true)}
                onDeleteAccount={handleDeleteAccount}
              />
            )}

            {currentTab === 'transactions' && (
              <TransactionsView
                transactions={transactions}
                accounts={accounts}
                categories={categories}
                baseCurrency={baseCurrency}
                onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}

            {currentTab === 'budgets' && (
              <BudgetsView
                budgets={budgets}
                baseCurrency={baseCurrency}
                onSetBudget={handleSetBudget}
              />
            )}

            {currentTab === 'recurring' && (
              <SubscriptionsView
                recurringRules={recurringRules}
                forecast={forecast}
                baseCurrency={baseCurrency}
                accounts={accounts}
                onOpenNewRecurring={() => {
                  const name = prompt('Subscription Name (e.g. Netflix, Gym):');
                  if (!name) return;
                  const amt = parseFloat(prompt('Recurring Amount:') || '0');
                  if (!amt) return;
                  api.createRecurring({
                    name,
                    account_id: accounts[0]?.id,
                    amount: amt,
                    frequency: 'monthly',
                    next_due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
                  }).then(refreshAllData);
                }}
                onDeleteRecurring={handleDeleteRecurring}
              />
            )}

            {currentTab === 'goals' && (
              <GoalsAndDebtsView
                goals={goals}
                debts={debts}
                baseCurrency={baseCurrency}
                onOpenNewGoal={handleCreateGoal}
                onDeleteGoal={handleDeleteGoal}
                onOpenNewDebt={handleCreateDebt}
                onDeleteDebt={handleDeleteDebt}
              />
            )}

            {currentTab === 'import' && (
              <CSVImportView
                accounts={accounts}
                baseCurrency={baseCurrency}
                onImportSuccess={refreshAllData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <NewTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        accounts={accounts}
        categories={categories}
        baseCurrency={baseCurrency}
        onSave={handleSaveTransaction}
      />

      <NewAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currencies={currencies}
        onSave={handleSaveAccount}
      />
    </div>
  );
}

export default App;
