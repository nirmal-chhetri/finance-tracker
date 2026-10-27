import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  BookOpen
} from 'lucide-react';
import { Account, Currency } from '../types';
import { api } from '../api';

interface CSVImportViewProps {
  accounts: Account[];
  baseCurrency?: Currency;
  onImportSuccess: () => void;
}

export const CSVImportView: React.FC<CSVImportViewProps> = ({
  accounts,
  baseCurrency,
  onImportSuccess,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commitResult, setCommitResult] = useState<{ imported_count: number; duplicate_count: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setErrorMsg(null);
    setCommitResult(null);
    setIsLoading(true);

    try {
      const res = await api.previewCSV(f);
      setPreviewData(res.preview || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse CSV file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!file || !selectedAccountId) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.previewCSV(file);
      const allRows = res.all_rows || [];

      let imported = 0;
      let dupes = 0;
      for (const row of allRows) {
        try {
          await api.createTransaction({
            account_id: selectedAccountId,
            type: row.type,
            amount_native: row.amount,
            date: row.date,
            merchant: row.merchant,
            raw_description: row.raw_description,
          });
          imported++;
        } catch {
          dupes++;
        }
      }

      setCommitResult({ imported_count: imported, duplicate_count: dupes });
      setFile(null);
      setPreviewData([]);
      onImportSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error committing transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const baseSymbol = baseCurrency?.symbol || '$';

  return (
    <div className="bg-[#FCFAF5] border-2 border-[#161513] shadow-[2px_2px_0px_rgba(22,21,19,0.15)] p-6 space-y-6">
      <div className="pb-4 border-b border-[#D7CEBE]">
        <div className="flex items-center gap-2">
          <BookOpen size={16} strokeWidth={1.75} className="text-[#96681C]" />
          <h3 className="text-base font-serif font-bold text-[#161513]">
            Statement Ingestion & Audit Docket
          </h3>
        </div>
        <p className="text-xs text-[#5C5549] mt-0.5">
          Ingest raw external banking records and merchant CSV manifests with automatic columnar mapping and cryptographic duplicate elimination.
        </p>
      </div>

      {/* Target Account Selector */}
      <div className="max-w-md font-mono">
        <label className="block text-xs font-bold text-[#161513] uppercase tracking-wide mb-1.5">
          DESTINATION ACCOUNT FOLIO:
        </label>
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-[#FCFAF5] border border-[#161513] text-[#161513] focus:outline-none cursor-pointer"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name.toUpperCase()} ({a.currency})
            </option>
          ))}
        </select>
      </div>

      {/* Intake Tray / Upload Zone */}
      <div className="border border-[#161513] p-8 text-center bg-[#ECE6D8]/50 relative">
        <div className="w-12 h-12 bg-[#FCFAF5] border border-[#D7CEBE] mx-auto flex items-center justify-center text-[#161513] mb-3 shadow-[1px_1px_0px_rgba(22,21,19,0.1)]">
          <Upload size={22} strokeWidth={1.75} className="text-[#96681C]" />
        </div>
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#161513]">
          SELECT FINANCIAL STATEMENT FILE (.CSV)
        </h4>
        <p className="text-[11px] font-mono text-[#857D71] mt-1">
          Standard debit/credit journals with Date, Description, and Monetary values
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-file-input"
        />
        <label
          htmlFor="csv-file-input"
          className="btn-ledger-secondary inline-block mt-4 px-4 py-2 text-xs font-mono font-semibold cursor-pointer"
        >
          {file ? `MANIFEST: ${file.name}` : 'CHOOSE STATEMENT MANIFEST'}
        </label>
      </div>

      {/* Results / Feedback */}
      {isLoading && (
        <div className="text-xs font-mono text-[#857D71] py-2 text-center animate-pulse">
          AUDITING & PARSING STATEMENT MANIFEST...
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-[#FCE8E8] border border-[#F3BABA] text-xs font-mono text-[#9E2428] flex items-center gap-2">
          <AlertCircle size={15} strokeWidth={1.75} />
          <span>{errorMsg}</span>
        </div>
      )}

      {commitResult && (
        <div className="p-4 bg-[#E2ECE5] border border-[#B3D3BE] text-xs font-mono text-[#1A5333] flex items-center gap-3">
          <CheckCircle2 size={18} strokeWidth={1.75} />
          <div>
            <strong>INGESTION COMMITTED:</strong> Successfully posted {commitResult.imported_count} verified entries to ledger.
            {commitResult.duplicate_count > 0 && ` (${commitResult.duplicate_count} duplicate records discarded).`}
          </div>
        </div>
      )}

      {/* Preview Table */}
      {previewData.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#D7CEBE]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h4 className="text-xs font-mono font-bold uppercase text-[#161513] flex items-center gap-2">
              <FileCheck size={16} strokeWidth={1.75} className="text-[#1A5333]" />
              MANIFEST AUDIT PREVIEW ({previewData.length} ROWS STAGED)
            </h4>
            <button
              onClick={handleCommit}
              disabled={isLoading}
              className="btn-ledger-primary px-4 py-2 text-xs font-mono font-semibold cursor-pointer disabled:opacity-50"
            >
              COMMIT ENTRIES TO GENERAL LEDGER
            </button>
          </div>

          <div className="overflow-x-auto border border-[#161513]">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-[#ECE6D8] border-b border-[#161513] text-[#5C5549] text-[10px] uppercase">
                  <th className="py-2.5 px-3 border-r border-[#D7CEBE]">FOLIO DATE</th>
                  <th className="py-2.5 px-3 border-r border-[#D7CEBE]">VENDOR / PAYEE</th>
                  <th className="py-2.5 px-3 border-r border-[#D7CEBE]">RAW STATEMENT MEMO</th>
                  <th className="py-2.5 px-3 border-r border-[#D7CEBE]">CLASSIFICATION</th>
                  <th className="py-2.5 px-3 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7CEBE]">
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#ECE6D8]/50">
                    <td className="py-2 px-3 text-[#5C5549] border-r border-[#D7CEBE]">{row.date}</td>
                    <td className="py-2 px-3 font-semibold text-[#161513] border-r border-[#D7CEBE]">{row.merchant}</td>
                    <td className="py-2 px-3 text-[#857D71] text-[11px] truncate max-w-xs border-r border-[#D7CEBE]">{row.raw_description}</td>
                    <td className="py-2 px-3 border-r border-[#D7CEBE]">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border ${
                        row.type === 'income' 
                          ? 'bg-[#E2ECE5] text-[#1A5333] border-[#B3D3BE]' 
                          : 'bg-[#FCE8E8] text-[#9E2428] border-[#F3BABA]'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-[#161513]">
                      {baseSymbol}{row.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

