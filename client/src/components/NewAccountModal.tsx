import React, { useState } from 'react';
import { X, BookOpen, Plus } from 'lucide-react';
import { Account, Currency } from '../types';

interface NewAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencies: Currency[];
  onSave: (data: Partial<Account>) => void;
}

export const NewAccountModal: React.FC<NewAccountModalProps> = ({
  isOpen,
  onClose,
  currencies,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('checking');
  const [currency, setCurrency] = useState(currencies[0]?.code || 'USD');
  const [institution, setInstitution] = useState('');
  const [balance, setBalance] = useState('0');
  const [creditLimit, setCreditLimit] = useState('');
  const [apr, setApr] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Account name required');

    onSave({
      name: name.trim(),
      type,
      currency,
      institution: institution.trim() || undefined,
      current_balance: parseFloat(balance) || 0,
      credit_limit: creditLimit ? parseFloat(creditLimit) : undefined,
      apr: apr ? parseFloat(apr) : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#FCFAF5] border-2 border-[#161513] shadow-[4px_4px_0px_rgba(22,21,19,0.35)] w-full max-w-md overflow-hidden">
        {/* Docket Top Banner */}
        <div className="px-5 py-3 border-b-2 border-[#161513] bg-[#ECE6D8] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <BookOpen size={15} strokeWidth={1.75} className="text-[#96681C]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#161513]">
              OPEN ACCOUNT FOLIO // REGISTRY
            </h3>
          </div>
          <button onClick={onClose} className="text-[#5C5549] hover:text-[#161513] p-1 cursor-pointer">
            <X size={15} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161513] mb-1">
              ACCOUNT TITLE / DESIGNATION:
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chase Depository Reserve, Vanguard Trust"
              className="w-full px-3 py-2 text-xs font-mono bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:border-[#161513] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161513] mb-1">
                LEDGER CLASSIFICATION:
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:border-[#161513] focus:outline-none cursor-pointer"
              >
                <option value="checking">Checking Depository</option>
                <option value="savings">Savings / Reserve</option>
                <option value="credit">Revolving Credit Facility</option>
                <option value="investment">Brokerage / Investment</option>
                <option value="cash">Specie / Physical Cash</option>
                <option value="loan">Term Loan</option>
                <option value="mortgage">Real Property Mortgage</option>
                <option value="asset">Tangible Capital Asset</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161513] mb-1">
                DENOMINATED CURRENCY:
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:border-[#161513] focus:outline-none cursor-pointer"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161513] mb-1">
                BANKING INSTITUTION:
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. J.P. Morgan, Fidelity"
                className="w-full px-3 py-2 text-xs font-mono bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:border-[#161513] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161513] mb-1">
                OPENING AUDITED BALANCE:
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-xs font-mono bg-[#ECE6D8]/50 border border-[#161513] text-[#161513] focus:outline-none font-bold"
              />
            </div>
          </div>

          {type === 'credit' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#ECE6D8] border border-[#D7CEBE]">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#161513] mb-1">
                  AUTHORIZED CREDIT LIMIT:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:border-[#161513] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#161513] mb-1">
                  INTEREST RATE APR (%):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={apr}
                  onChange={(e) => setApr(e.target.value)}
                  placeholder="e.g. 19.99"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-[#FCFAF5] border border-[#D7CEBE] text-[#161513] focus:border-[#161513] focus:outline-none"
                />
              </div>
            </div>
          )}

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
              AUTHORIZE & OPEN FOLIO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

