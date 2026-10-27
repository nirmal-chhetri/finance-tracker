import React from 'react';
import {
  Landmark,
  CreditCard,
  TrendingUp,
  Wallet,
  Building,
  Plus,
  ArrowRightLeft,
  Trash2,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { Account, Currency } from '../types';

interface AccountsViewProps {
  accounts: Account[];
  baseCurrency?: Currency;
  onOpenNewAccount: () => void;
  onOpenTransfer: () => void;
  onDeleteAccount: (id: string) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  baseCurrency,
  onOpenNewAccount,
  onOpenTransfer,
  onDeleteAccount,
}) => {
  const baseSymbol = baseCurrency?.symbol || '$';

  // Group accounts by category
  const cashAccounts = accounts.filter((a) => ['checking', 'savings', 'cash'].includes(a.type));
  const creditAccounts = accounts.filter((a) => a.type === 'credit');
  const investmentAccounts = accounts.filter((a) => ['investment', 'asset'].includes(a.type));
  const liabilityAccounts = accounts.filter((a) => ['loan', 'mortgage'].includes(a.type));

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <CreditCard size={16} strokeWidth={1.75} className="text-[#9E2428]" />;
      case 'investment':
      case 'asset':
        return <TrendingUp size={16} strokeWidth={1.75} className="text-[#1A5333]" />;
      case 'loan':
      case 'mortgage':
        return <Building size={16} strokeWidth={1.75} className="text-[#96681C]" />;
      default:
        return <Landmark size={16} strokeWidth={1.75} className="text-[#1E4268]" />;
    }
  };

  const renderAccountCard = (acc: Account) => {
    const isMultiCurrency = acc.currency !== baseCurrency?.code;
    const isCredit = acc.type === 'credit';

    return (
      <div
        key={acc.id}
        className="bg-[#FCFAF5] p-5 border border-[#D7CEBE] shadow-[1px_1px_0px_rgba(22,21,19,0.12)] flex flex-col justify-between relative group hover:border-[#161513] transition-colors"
      >
        <div>
          {/* Card Top Stamp */}
          <div className="flex items-start justify-between pb-3 border-b border-[#ECE6D8]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#ECE6D8] border border-[#D7CEBE]">
                {getAccountIcon(acc.type)}
              </div>
              <div>
                <h4 className="text-sm font-serif font-bold text-[#161513] leading-tight">
                  {acc.name}
                </h4>
                <span className="text-[10px] font-mono uppercase text-[#857D71] block mt-0.5">
                  {acc.institution || 'INSTITUTION'} • {acc.currency}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm(`Archive and close ledger folio for "${acc.name}"?`)) {
                  onDeleteAccount(acc.id);
                }
              }}
              title="Archive Account"
              className="text-[#857D71] hover:text-[#9E2428] p-1 transition-colors cursor-pointer"
            >
              <Trash2 size={13} strokeWidth={1.75} />
            </button>
          </div>

          {/* Statement Balance */}
          <div className="my-4">
            <span className="text-[9px] font-mono tracking-widest uppercase text-[#857D71] block mb-1">
              RECORDED FOLIO BALANCE
            </span>
            <div className="text-2xl font-bold font-mono tracking-tight text-[#161513] inline-block accounting-double-rule pb-0.5">
              {acc.currency} {acc.current_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {isMultiCurrency && (
              <div className="text-[11px] font-mono text-[#857D71] mt-1.5">
                ≈ {baseSymbol}{(acc.balance_base ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {baseCurrency?.code}
              </div>
            )}
          </div>
        </div>

        {/* Credit Card Specific Details */}
        {isCredit && (
          <div className="pt-3 border-t border-[#D7CEBE] mt-1 font-mono">
            <div className="flex justify-between text-[10px] text-[#5C5549] mb-1">
              <span className="uppercase">UTILIZATION FACTOR:</span>
              <span className={`font-bold ${
                (acc.utilization_percent ?? 0) > 30 ? 'text-[#9E2428]' : 'text-[#1A5333]'
              }`}>
                {acc.utilization_percent ?? 0}%
              </span>
            </div>
            <div className="w-full bg-[#ECE6D8] h-2.5 border border-[#D7CEBE]">
              <div
                className={`h-full ${
                  (acc.utilization_percent ?? 0) > 30 ? 'bg-[#9E2428]' : 'bg-[#1A5333]'
                }`}
                style={{ width: `${Math.min(100, acc.utilization_percent ?? 0)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#857D71] mt-2 pt-1 border-t border-[#ECE6D8]">
              <span>LIMIT: {acc.currency} {acc.credit_limit?.toLocaleString() || 'N/A'}</span>
              <span>APR: {acc.apr || 0}%</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#D7CEBE] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen size={16} strokeWidth={1.75} className="text-[#96681C]" />
            <h2 className="text-lg font-serif font-bold text-[#161513]">
              Account Portfolios & Balances
            </h2>
          </div>
          <p className="text-xs text-[#5C5549] mt-0.5">
            Depository accounts, revolving lines, investment trusts, and multi-currency registers.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={onOpenTransfer}
            className="btn-ledger-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowRightLeft size={13} strokeWidth={1.75} />
            <span>INTER-ACCOUNT TRANSFER</span>
          </button>
          <button
            onClick={onOpenNewAccount}
            className="btn-ledger-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
          >
            <Plus size={14} strokeWidth={1.75} className="text-[#E5C178]" />
            <span>OPEN FOLIO</span>
          </button>
        </div>
      </div>

      {/* 1. Cash & Depository Accounts */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#161513]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#161513]">
            SECTION I: DEPOSITORY & LIQUID ASSETS ({cashAccounts.length})
          </h3>
          <span className="text-[10px] font-mono text-[#857D71]">DEMAND DEPOSITS</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cashAccounts.map(renderAccountCard)}
        </div>
      </div>

      {/* 2. Credit Cards */}
      {creditAccounts.length > 0 && (
        <div>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#161513]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9E2428]">
              SECTION II: REVOLVING CREDIT LIABILITIES ({creditAccounts.length})
            </h3>
            <span className="text-[10px] font-mono text-[#857D71]">SHORT-TERM CREDIT</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditAccounts.map(renderAccountCard)}
          </div>
        </div>
      )}

      {/* 3. Investments & Brokerages */}
      {investmentAccounts.length > 0 && (
        <div>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#161513]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A5333]">
              SECTION III: CAPITAL INVESTMENTS & ASSETS ({investmentAccounts.length})
            </h3>
            <span className="text-[10px] font-mono text-[#857D71]">LONG-TERM HOLDINGS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investmentAccounts.map(renderAccountCard)}
          </div>
        </div>
      )}

      {/* 4. Loans & Liabilities */}
      {liabilityAccounts.length > 0 && (
        <div>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#161513]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#5C5549]">
              SECTION IV: FIXED-TERM OBLIGATIONS & MORTGAGES ({liabilityAccounts.length})
            </h3>
            <span className="text-[10px] font-mono text-[#857D71]">AMORTIZING DEBT</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liabilityAccounts.map(renderAccountCard)}
          </div>
        </div>
      )}
    </div>
  );
};

