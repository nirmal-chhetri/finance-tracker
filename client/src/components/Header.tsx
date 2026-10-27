import React from 'react';
import { Plus, PenLine, FileText } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  onOpenNewTransaction: () => void;
  onOpenNewAccount: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenNewTransaction,
  onOpenNewAccount,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="h-18 px-8 border-b border-[#D7CEBE] bg-[#FCFAF5] flex items-center justify-between shrink-0 shadow-[0_1px_0_rgba(22,21,19,0.04)]">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#857D71] bg-[#ECE6D8] px-1.5 py-0.5 border border-[#D7CEBE]">
            FOLIO REGISTRY
          </span>
          <h1 className="font-serif text-xl font-bold text-[#161513] tracking-tight">
            {title}
          </h1>
        </div>
        <p className="text-xs text-[#5C5549] mt-0.5 font-sans tracking-normal">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-[#5C5549] bg-[#ECE6D8] px-3 py-1.5 border border-[#D7CEBE]">
          <span className="text-[#857D71]">ENTRY DATE:</span>
          <span className="font-semibold text-[#161513]">{todayFormatted.toUpperCase()}</span>
        </div>

        <button
          onClick={onOpenNewAccount}
          className="btn-ledger-secondary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
        >
          <Plus size={14} strokeWidth={1.75} className="text-[#5C5549]" />
          <span>New Account</span>
        </button>

        <button
          onClick={onOpenNewTransaction}
          className="btn-ledger-primary flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold cursor-pointer"
        >
          <PenLine size={14} strokeWidth={1.75} className="text-[#E5C178]" />
          <span>Record Journal Entry</span>
        </button>
      </div>
    </header>
  );
};

