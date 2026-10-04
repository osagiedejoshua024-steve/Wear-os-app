import React, { useState } from 'react';
import { TransactionHistoryItem } from '../types/payment';
import { TransactionReceiptModal } from './TransactionReceiptModal';
import {
  History,
  Receipt,
  Search,
  Filter,
  ArrowUpRight,
  Building2,
  Calendar,
  Clock,
  ScanFace,
  CreditCard,
  CheckCircle2,
  Download,
  Share2,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface Props {
  transactions: TransactionHistoryItem[];
  onSelectReceipt?: (tx: TransactionHistoryItem) => void;
}

export const TransactionHistoryView: React.FC<Props> = ({
  transactions,
  onSelectReceipt,
}) => {
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<TransactionHistoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  const filteredList = transactions.filter((tx) => {
    const matchesSearch =
      tx.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.recipientAccountNumber.includes(searchQuery) ||
      tx.recipientBank.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.txRef.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform =
      filterPlatform === 'all' || tx.platform === filterPlatform;

    return matchesSearch && matchesPlatform;
  });

  const handleOpenReceipt = (tx: TransactionHistoryItem) => {
    setSelectedTxForReceipt(tx);
    onSelectReceipt?.(tx);
  };

  return (
    <div className="space-y-4">
      {/* Full Transaction Receipt Modal */}
      <TransactionReceiptModal
        isOpen={!!selectedTxForReceipt}
        transaction={selectedTxForReceipt}
        onClose={() => setSelectedTxForReceipt(null)}
      />

      {/* Header & Quick Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Transaction History & Receipts</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                {transactions.length} Records
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Audit trail with date, time, recipient NUBAN account number, and instant digital receipts.
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recipient, bank, NUBAN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-52"
            />
          </div>

          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Devices</option>
            <option value="wear_os">Wear OS</option>
            <option value="watch_os">Apple watchOS</option>
          </select>
        </div>
      </div>

      {/* Transaction Records List */}
      {filteredList.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/80 p-6 space-y-2">
          <History className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-400">No transactions match your search filter</p>
          <p className="text-[11px] text-slate-500">
            Initiate a tap-to-pay transaction on the smartwatch to populate real-time history.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredList.map((tx) => (
            <div
              key={tx.id}
              className="group bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Column: Icon + Recipient info */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-sm">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white tracking-wide">
                      {tx.recipientName}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {tx.platform === 'wear_os' ? 'Wear OS' : 'watchOS'}
                    </span>
                    {tx.faceIdVerified && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/80 flex items-center gap-1 font-semibold">
                        <ScanFace className="w-3 h-3 text-indigo-400" /> Face ID Verified
                      </span>
                    )}
                  </div>

                  {/* Recipient Account Details (Date, Time, Recipient Account Number) */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400">
                    {/* Recipient Account Number & Bank */}
                    <div className="flex items-center gap-1 font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                      <Building2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="font-bold">{tx.recipientAccountNumber}</span>
                      <span className="text-slate-400">({tx.recipientBank})</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-slate-300">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{tx.date}</span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-1 text-slate-300 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{tx.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Amount + Receipt Prompt Section */}
              <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                <div className="text-left md:text-right">
                  <div className="text-base font-black text-white font-mono">
                    -₦{tx.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono flex items-center md:justify-end gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Settled via NIBSS
                  </div>
                </div>

                {/* Specific dedicated part to ask for receipt */}
                <div className="pl-3 border-l border-slate-800">
                  <button
                    onClick={() => handleOpenReceipt(tx)}
                    className="group/btn relative px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-emerald-600/90 text-slate-200 hover:text-white border border-slate-700/80 hover:border-emerald-500 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-emerald-950"
                    title="View full electronic payment receipt"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-400 group-hover/btn:text-white transition-colors" />
                    <span>View Receipt</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all" />
                  </button>
                  <p className="text-[9px] text-slate-500 mt-1 text-center font-mono">
                    Full audit receipt
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
