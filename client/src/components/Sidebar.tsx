import React from 'react';
import {
  Scale,
  Landmark,
  ScrollText,
  Coins,
  Clock,
  Compass,
  FolderDown,
  ShieldCheck,
  BookOpen,
  Zap
} from 'lucide-react';
import { Currency } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currencies: Currency[];
  baseCurrency?: Currency;
  onSelectBaseCurrency: (code: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currencies,
  baseCurrency,
  onSelectBaseCurrency,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Balance Sheet & Overview', code: 'SEC. 01', icon: Scale },
    { id: 'planner', label: 'Daily Planner & Quick Log', code: 'DAILY', icon: Zap },
    { id: 'accounts', label: 'Account Portfolios', code: 'SEC. 02', icon: Landmark },
    { id: 'transactions', label: 'Journal & Ledger Log', code: 'SEC. 03', icon: ScrollText },
    { id: 'budgets', label: 'Budget Appropriations', code: 'SEC. 04', icon: Coins },
    { id: 'recurring', label: 'Standing Orders & Drafts', code: 'SEC. 05', icon: Clock },
    { id: 'goals', label: 'Sinking Funds & Debts', code: 'SEC. 06', icon: Compass },
    { id: 'import', label: 'Statement Ingestion', code: 'SEC. 07', icon: FolderDown },
  ];

  return (
    <aside className="w-68 border-r-2 border-[#161513] bg-[#1A1815] text-[#ECE6D8] flex flex-col justify-between shrink-0 select-none shadow-[2px_0_0_rgba(0,0,0,0.15)] z-20">
      <div>
        {/* Archival Spine Masthead */}
        <div className="p-5 border-b border-[#2C2822] bg-[#141210]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[#96681C] bg-[#221E18] flex items-center justify-center p-1 shadow-inner shrink-0">
              <img src="/favicon.svg" alt="Archival Ledger" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-masthead font-bold text-xs tracking-[0.16em] text-[#FCFAF5] block uppercase">
                  Archival Ledger
                </span>
              </div>
              <span className="text-[10px] tracking-wider text-[#9E9585] block font-mono mt-0.5">
                RECORD FOLIO • VOL. IV
              </span>
            </div>
          </div>
        </div>

        {/* Bound Spine Index Tabs */}
        <div className="px-3 pt-4 pb-2">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#736B5E] px-2 block mb-2">
            Table of Ledgers
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition-all relative ${
                    isActive
                      ? 'bg-[#F5F1E8] text-[#161513] font-semibold border-l-4 border-[#96681C] shadow-[1px_1px_0px_rgba(0,0,0,0.5)]'
                      : 'text-[#AFA799] hover:text-[#FCFAF5] hover:bg-[#25221D] border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      size={15}
                      strokeWidth={1.75}
                      className={isActive ? 'text-[#161513]' : 'text-[#7D7567]'}
                    />
                    <span className="truncate tracking-tight">{item.label}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono tracking-widest ${
                      isActive ? 'text-[#736B5E]' : 'text-[#5A5347]'
                    }`}
                  >
                    {item.code}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Base Currency & Audit Seal Footer */}
      <div className="p-4 border-t border-[#2C2822] bg-[#141210]">
        <div className="flex items-center justify-between text-xs text-[#AFA799] mb-3">
          <span className="flex items-center gap-1.5 font-medium text-[11px] font-mono tracking-wide">
            <Coins size={13} className="text-[#96681C]" /> STANDARD VALUATION:
          </span>
          <select
            value={baseCurrency?.code || 'USD'}
            onChange={(e) => onSelectBaseCurrency(e.target.value)}
            className="bg-[#24201A] border border-[#3E382F] text-[#FCFAF5] px-2 py-1 text-xs font-mono font-semibold focus:outline-none focus:border-[#96681C] cursor-pointer"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code} className="bg-[#1A1815] text-[#FCFAF5]">
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2.5 border-t border-[#26221C] flex items-center justify-between text-[10px] font-mono text-[#736B5E]">
          <span className="flex items-center gap-1 text-[#8C8474]">
            <ShieldCheck size={12} className="text-[#1A5333]" /> SEALED & BALANCED
          </span>
          <span className="tracking-widest text-[#5A5347]">ACT-1894</span>
        </div>
      </div>
    </aside>
  );
};

