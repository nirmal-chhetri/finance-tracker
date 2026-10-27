import React, { useState } from 'react';
import { X, BookOpen, PenLine } from 'lucide-react';
import { Account, Category, Currency, Transaction } from '../types';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  baseCurrency?: Currency;
  onSave: (data: Partial<Transaction>) => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  baseCurrency,
  onSave,
}) => {
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [destinationAccountId, setDestinationAccountId] = useState<string>(accounts[1]?.id || '');
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return alert('Please enter a valid amount');
    if (!merchant.trim() && type !== 'transfer') return alert('Please enter a merchant or payee');

    onSave({
      account_id: accountId,
      destination_account_id: type === 'transfer' ? destinationAccountId : null,
      category_id: type === 'transfer' ? null : (categoryId || null),
      type,
      amount_native: val,
      date,
      merchant: type === 'transfer' ? `Transfer: ${accounts.find(a => a.id === accountId)?.name} → ${accounts.find(a => a.id === destinationAccountId)?.name}` : merchant.trim(),
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const selectedAcc = accounts.find((a) => a.id === accountId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#FCFAF5] border-2 border-[#161513] shadow-[4px_4px_0px_rgba(22,21,19,0.35)] w-full max-w-md overflow-hidden">
        {/* Docket Top Banner */}
        <div className="px-5 py-3 border-b-2 border-[#161513] bg-[#ECE6D8] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <PenLine size={15} strokeWidth={1.75} className="text-[#96681C]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#161513]">
              RECORD JOURNAL ENTRY // DOCKET
            </h3>
          </div>
          <button onClick={onClose} className="text-[#5C5549] hover:text-[#161513] p-1 cursor-pointer">
            <X size={15} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono">
          {/* Type Toggle Tabs */}
          <div className="grid grid-cols-3 border border-[#161513] bg-[#ECE6D8] p-0.5">
            {(['expense', 'income', 'transfer'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-1.5 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  type === t
                    ? 'bg-[#161513] text-[#FCFAF5]'
                    : 'text-[#5C5549] hover:text-[#161513]'
                }`}
              >
                {t === 'expense' ? 'DEBIT (−)' : t === 'income' ? 'CREDIT (+)' : 'TRANSFER'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161513] mb-1">
              RECORDED VALUATION ({selectedAcc?.currency || 'USD'})
            </label>
            <input
              type="number"
              step="0.01"
              required
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 text-xl font-bold font-mono bg-[#ECE6D8]/50 border border-[#161513] text-[#161513] focus:outline-none"
            />
          </div>

          {/* Source Account */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161513] mb-1">
              {type === 'transfer' ? 'DEBIT FROM ACCOUNT:' : 'POST TO ACCOUNT LEDGER:'}
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:border-[#161513] focus:outline-none cursor-pointer"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name.toUpperCase()} ({a.currency}) — BAL: {a.currency} {a.current_balance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Account (Only for transfers) */}
          {type === 'transfer' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161513] mb-1">
                CREDIT TO DESTINATION ACCOUNT:
              </label>
              <select
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:border-[#161513] focus:outline-none cursor-pointer"
              >
                {accounts
                  .filter((a) => a.id !== accountId)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name.toUpperCase()} ({a.currency})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Merchant (Hidden if Transfer) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161513] mb-1">
                {type === 'income' ? 'PAYER / SOURCE ENTITY:' : 'VENDOR / PAYEE:'}
              </label>
              <input
                type="text"
                required
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder={type === 'income' ? 'Employer, Customer, Dividend Trust' : 'Supplier, Merchant, Institution'}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:border-[#161513] focus:outline-none"
              />
            </div>
          )}

          {/* Category (Hidden if Transfer) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161513] mb-1">
                APPROPRIATION CLASSIFICATION:
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:border-[#161513] focus:outline-none cursor-pointer"
              >
                <option value="">SELECT CLASSIFICATION...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name.toUpperCase()} [{c.group_type.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Memo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161513] mb-1">
                TRANSACTION DATE:
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:border-[#161513] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161513] mb-1">
                MEMORANDUM (OPTIONAL):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Audit notes or ref#"
                className="w-full px-3 py-2 text-xs font-mono bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:border-[#161513] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#D7CEBE] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ledger-secondary px-4 py-2 text-xs font-mono font-semibold cursor-pointer"
            >
              DISCARD
            </button>
            <button
              type="submit"
              className="btn-ledger-primary px-5 py-2 text-xs font-mono font-semibold cursor-pointer"
            >
              COMMIT ENTRY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

