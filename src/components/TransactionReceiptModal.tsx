import React, { useRef } from 'react';
import { TransactionHistoryItem } from '../types/payment';
import {
  Receipt,
  X,
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  Building2,
  CreditCard,
  ScanFace,
  Clock,
  Calendar,
  Share2,
  Copy,
  Check,
} from 'lucide-react';

interface Props {
  transaction: TransactionHistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<Props> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaction) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 ring-1 ring-emerald-500/20">
        {/* Receipt Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  Official Transaction Receipt
                </h3>
              </div>
              <p className="text-[10px] text-emerald-400 font-mono">
                NIBSS Instant Payment (NIP) / Flutterwave v3
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div ref={printRef} className="p-6 space-y-5 text-slate-200 font-sans">
          {/* Status & Amount Highlight */}
          <div className="text-center pb-4 border-b border-dashed border-slate-800">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Transaction Successful
            </div>
            <div className="text-3xl font-black text-white tracking-tight font-mono">
              ₦{transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Convenience Fee: <span className="text-slate-300 font-mono">₦{transaction.fee.toFixed(2)}</span> • Total Charged: <span className="text-emerald-300 font-mono font-bold">₦{(transaction.amount + transaction.fee).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Recipient Details Section */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-cyan-400" /> Beneficiary / Recipient
              </span>
              <span className="text-emerald-400 font-mono">Verified NUBAN</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Recipient Name</span>
              <span className="text-xs font-bold text-white text-right">{transaction.recipientName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Account Number</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-xs font-extrabold text-emerald-400 tracking-wider">
                  {transaction.recipientAccountNumber}
                </span>
                <button
                  onClick={() => handleCopy(transaction.recipientAccountNumber, 'nuban')}
                  title="Copy account number"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {copiedField === 'nuban' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Destination Bank</span>
              <span className="text-xs font-medium text-slate-200">{transaction.recipientBank}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Merchant Code</span>
              <span className="text-[11px] font-mono text-slate-400">{transaction.merchantId}</span>
            </div>
          </div>

          {/* Date, Time & Security Verification */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" /> Temporal & Cryptographic Record
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" /> Transaction Date
              </span>
              <span className="font-mono font-medium text-slate-200">{transaction.date}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" /> Time (West Africa / UTC+1)
              </span>
              <span className="font-mono font-medium text-slate-200">{transaction.time}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <ScanFace className="w-3 h-3 text-indigo-400" /> Biometric Authorization
              </span>
              <span
                className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                  transaction.faceIdVerified
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {transaction.faceIdVerified ? 'Face ID Authenticated' : 'Standard PIN/Token'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Initiating Device</span>
              <span className="font-mono text-[11px] text-cyan-400">
                {transaction.platform === 'wear_os' ? 'Wear OS (Samsung Galaxy/Pixel)' : 'Apple watchOS (Ultra)'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Transmission Medium</span>
              <span className="font-mono text-[11px] text-slate-300 uppercase">
                {transaction.mode === 'bluetooth' ? 'Bluetooth Low Energy / DataClient' : 'Dynamic NIBSS NQR'}
              </span>
            </div>
          </div>

          {/* Reference Numbers & NIBSS Audit */}
          <div className="space-y-1.5 text-[11px] font-mono bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Transaction Ref:</span>
              <span className="text-slate-300">{transaction.txRef}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Flutterwave Ref:</span>
              <span className="text-slate-300">{transaction.flwRef}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">NIBSS Session ID:</span>
              <span className="text-slate-400 truncate max-w-[210px]">{transaction.nibssSessionId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">POS Terminal ID:</span>
              <span className="text-slate-400">{transaction.terminalId}</span>
            </div>
          </div>

          {/* Regulatory Compliance Footer */}
          <div className="pt-2 text-center border-t border-dashed border-slate-800 text-[10px] text-slate-500 leading-relaxed font-mono">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5" /> CENTRAL BANK OF NIGERIA (CBN) COMPLIANT
            </div>
            Settled instantly via NIBSS NIP & Flutterwave Switching Service. 
            All cryptographic signatures hardware-verified via Android KeyStore / Apple Secure Enclave.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => handleCopy(JSON.stringify(transaction, null, 2), 'json')}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            {copiedField === 'json' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied JSON
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                Copy Details
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
