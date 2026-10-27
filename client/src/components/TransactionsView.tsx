import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowRightLeft,
  Trash2,
  Calendar,
  BookOpen
} from 'lucide-react';
import { Transaction, Account, Category, Currency } from '../types';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  baseCurrency?: Currency;
  onOpenNewTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  categories,
  baseCurrency,
  onOpenNewTransaction,
  onDeleteTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const baseSymbol = baseCurrency?.symbol || '$';

  // Category map
  const catMap = new Map(categories.map((c) => [c.id, c]));

  // Filter transactions
  const filtered = transactions.filter((t) => {
    if (selectedAccount !== 'all' && t.account_id !== selectedAccount && t.destination_account_id !== selectedAccount) {
      return false;
    }
    if (selectedCategory !== 'all' && t.category_id !== selectedCategory) {
      return false;
    }
    if (selectedType !== 'all' && t.type !== selectedType) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchMerchant = t.merchant.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      const matchAccount = t.account_name?.toLowerCase().includes(q);
      if (!matchMerchant && !matchNotes && !matchAccount) return false;
    }
    return true;
  });

  const totalDebits = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount_base, 0);

  const totalCredits = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount_base, 0);

  return (
    <div className="space-y-4">
      {/* Top Ledger Index & Filters Bar */}
      <div className="bg-[#FCFAF5] p-4 border border-[#D7CEBE] shadow-[1px_1px_0px_rgba(22,21,19,0.1)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Folio Search */}
        <div className="relative flex-1">
          <Search size={15} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#857D71]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search journal entries by vendor, memo notes, or account..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-[#ECE6D8]/50 border border-[#D7CEBE] text-[#161513] placeholder:text-[#857D71] focus:outline-none focus:border-[#161513]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 font-mono">
          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:outline-none focus:border-[#161513] cursor-pointer"
          >
            <option value="all">ALL ACCOUNTS</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:outline-none focus:border-[#161513] cursor-pointer"
          >
            <option value="all">ALL CLASSIFICATIONS</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:outline-none focus:border-[#161513] cursor-pointer"
          >
            <option value="all">ALL TYPES</option>
            <option value="expense">DEBITS (EXPENSES)</option>
            <option value="income">CREDITS (INCOME)</option>
            <option value="transfer">TRANSFERS</option>
          </select>

          <button
            onClick={onOpenNewTransaction}
            className="btn-ledger-primary flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer"
          >
            <Plus size={14} strokeWidth={1.75} className="text-[#E5C178]" />
            <span>RECORD DRAFT</span>
          </button>
        </div>
      </div>

      {/* Ledger Table with Columnar Rules */}
      <div className="bg-[#FCFAF5] border-2 border-[#161513] shadow-[2px_2px_0px_rgba(22,21,19,0.15)] overflow-hidden">
        {/* Table Banner */}
        <div className="px-4 py-2 border-b border-[#D7CEBE] bg-[#ECE6D8] flex items-center justify-between text-[11px] font-mono text-[#5C5549]">
          <div className="flex items-center gap-2">
            <BookOpen size={13} strokeWidth={1.75} className="text-[#96681C]" />
            <span className="font-bold tracking-wider text-[#161513]">GENERAL JOURNAL FOLIO</span>
            <span>•</span>
            <span>AUDITED CONTINUOUS RECORD</span>
          </div>
          <span className="font-semibold text-[#161513]">
            {filtered.length} {filtered.length === 1 ? 'RECORD' : 'RECORDS'} MATCHED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b-2 border-[#161513] bg-[#E5DFD0] text-[#161513] text-[10px] tracking-wider uppercase">
                <th className="py-2.5 px-3 border-r border-[#D7CEBE] w-28">FOLIO DATE</th>
                <th className="py-2.5 px-3 border-r border-[#D7CEBE]">PARTICULARS / VENDOR MEMO</th>
                <th className="py-2.5 px-3 border-r border-[#D7CEBE] w-36">CLASSIFICATION</th>
                <th className="py-2.5 px-3 border-r border-[#D7CEBE] w-40">ACCOUNT LEDGER</th>
                <th className="py-2.5 px-3 border-r border-[#D7CEBE] text-right w-32">DEBIT (−)</th>
                <th className="py-2.5 px-3 border-r border-[#D7CEBE] text-right w-32">CREDIT (+)</th>
                <th className="py-2.5 px-2 text-center w-12">AUDIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7CEBE]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#857D71] italic bg-[#FCFAF5]">
                    No journal entries found matching current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const cat = t.category_id ? catMap.get(t.category_id) : null;
                  const isExpense = t.type === 'expense';
                  const isIncome = t.type === 'income';
                  const isTransfer = t.type === 'transfer';

                  return (
                    <tr key={t.id} className="hover:bg-[#ECE6D8]/60 transition-colors">
                      {/* Date */}
                      <td className="py-2.5 px-3 text-[#5C5549] border-r border-[#D7CEBE] whitespace-nowrap">
                        {t.date}
                      </td>

                      {/* Merchant & Memo */}
                      <td className="py-2.5 px-3 border-r border-[#D7CEBE]">
                        <div className="font-semibold text-[#161513]">
                          {t.merchant}
                        </div>
                        {t.notes && (
                          <div className="text-[10px] text-[#857D71] italic line-clamp-1">
                            Note: {t.notes}
                          </div>
                        )}
                      </td>

                      {/* Classification Badge */}
                      <td className="py-2.5 px-3 border-r border-[#D7CEBE] whitespace-nowrap">
                        {isTransfer ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-[#E8EEF5] text-[#1E4268] border border-[#B9CFE5] font-semibold">
                            <ArrowRightLeft size={10} strokeWidth={1.75} /> TRANSFER
                          </span>
                        ) : cat ? (
                          <span className="inline-block text-[10px] px-1.5 py-0.5 bg-[#ECE6D8] text-[#48433B] border border-[#D7CEBE] font-medium">
                            {cat.name.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#857D71] italic">
                            UNCLASSIFIED
                          </span>
                        )}
                      </td>

                      {/* Account */}
                      <td className="py-2.5 px-3 text-[#5C5549] border-r border-[#D7CEBE] whitespace-nowrap">
                        {isTransfer ? (
                          <span className="text-[11px]">
                            {t.account_name} &rarr; {t.destination_account_name || 'Account'}
                          </span>
                        ) : (
                          t.account_name
                        )}
                      </td>

                      {/* Debit Column */}
                      <td className="py-2.5 px-3 text-right font-bold border-r border-[#D7CEBE] whitespace-nowrap text-[#9E2428]">
                        {isExpense ? `${baseSymbol}${t.amount_base.toFixed(2)}` : '—'}
                        {isExpense && t.account_currency && t.account_currency !== baseCurrency?.code && (
                          <span className="block text-[9px] text-[#857D71] font-normal">
                            ({t.amount_native.toFixed(2)} {t.account_currency})
                          </span>
                        )}
                      </td>

                      {/* Credit Column */}
                      <td className="py-2.5 px-3 text-right font-bold border-r border-[#D7CEBE] whitespace-nowrap text-[#1A5333]">
                        {isIncome ? `${baseSymbol}${t.amount_base.toFixed(2)}` : '—'}
                        {isIncome && t.account_currency && t.account_currency !== baseCurrency?.code && (
                          <span className="block text-[9px] text-[#857D71] font-normal">
                            ({t.amount_native.toFixed(2)} {t.account_currency})
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (confirm(`Expunge transaction record "${t.merchant}" from ledger?`)) {
                              onDeleteTransaction(t.id);
                            }
                          }}
                          className="text-[#857D71] hover:text-[#9E2428] p-1 transition-colors cursor-pointer"
                          title="Expunge entry"
                        >
                          <Trash2 size={13} strokeWidth={1.75} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Classical Accounting Double-Rule Balances Footer */}
            <tfoot>
              <tr className="border-t-2 border-[#161513] bg-[#EAE4D5] font-bold text-[#161513]">
                <td colSpan={4} className="py-3 px-3 border-r border-[#D7CEBE] text-right text-[11px] uppercase tracking-wider">
                  JOURNAL SUMMARY TOTALS:
                </td>
                <td className="py-3 px-3 border-r border-[#D7CEBE] text-right text-[#9E2428] font-mono whitespace-nowrap">
                  <div className="inline-block pb-0.5 accounting-double-rule">
                    {baseSymbol}{totalDebits.toFixed(2)}
                  </div>
                </td>
                <td className="py-3 px-3 border-r border-[#D7CEBE] text-right text-[#1A5333] font-mono whitespace-nowrap">
                  <div className="inline-block pb-0.5 accounting-double-rule">
                    {baseSymbol}{totalCredits.toFixed(2)}
                  </div>
                </td>
                <td className="py-3 px-2 text-center text-[10px] text-[#5C5549]">
                  REC
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

