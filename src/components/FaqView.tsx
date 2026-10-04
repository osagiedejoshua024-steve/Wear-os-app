import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Watch,
  Smartphone,
  Lock,
  Zap,
  CreditCard,
  Building2,
  ScanFace,
  Receipt,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'general' | 'security' | 'smartwatch' | 'receipts_history' | 'flutterwave_nibss';
  question: string;
  answer: string;
  badge?: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: 'How does KudiPulse Smartwatch Tap-to-Pay operate in Nigeria?',
    answer:
      'KudiPulse enables dual-device contactless payment. You initiate or select a transaction amount directly on your Wear OS (Samsung Galaxy/Pixel) or Apple watchOS device. The smartwatch cryptographically signs an encrypted payload and passes it via Bluetooth Low Energy (BLE) or DataLayer to your paired companion phone. The companion phone verifies the payload, prompts for Face ID (if above ₦5,000 per CBN rules), and routes the payment through Flutterwave v3 into the Nigerian Inter-Bank Settlement System (NIBSS) for immediate merchant credit.',
    badge: 'Core Workflow',
  },
  {
    id: 'faq-2',
    category: 'smartwatch',
    question: 'Do I need cellular data or internet on my smartwatch for Tap-to-Pay to work?',
    answer:
      'Negative! The smartwatch communicates with your paired companion phone using local Bluetooth Low Energy (BLE) or the Google Wearable DataClient / Apple WatchConnectivity (WCSession) bus. The smartwatch creates hardware-encrypted cryptograms offline. The paired phone handles internet connectivity to Flutterwave APIs.',
    badge: 'Offline Watch',
  },
  {
    id: 'faq-3',
    category: 'security',
    question: 'What happens if someone attempts a replay attack by copying my smartwatch transmission?',
    answer:
      'Every smartwatch packet includes a 128-bit CSPRNG unique Nonce and a UTC millisecond timestamp signed with HMAC-SHA256. The phone companion enforces an atomic sliding-window cache: packets older than 60 seconds are dropped immediately, and any re-transmitted nonce is rejected as duplicate with an audit alarm.',
    badge: '60s Anti-Replay',
  },
  {
    id: 'faq-4',
    category: 'security',
    question: 'Why does Face ID appear for certain smartwatch payments?',
    answer:
      'Under Central Bank of Nigeria (CBN) Tier-1 mobile payment guidelines (Circular BSD/DIR/GEN/LAB/11/025), contactless payments over ₦5,000 require Step-Up Biometric Two-Factor Authentication (2FA). KudiPulse invokes native iOS Face ID (LAContext) or Android Strong Biometrics (BiometricPrompt) with TrueDepth infrared 3D mesh scanning. For payments under ₦5,000, fast-tap mode is supported unless you enable "Every Tap" strict security.',
    badge: 'CBN Mandate',
  },
  {
    id: 'faq-5',
    category: 'receipts_history',
    question: 'Where can I find the recipient account number, date, time, and receipt for a past payment?',
    answer:
      'Navigate to the "Transaction History & Receipts" tab. Each record prominently details the exact date (e.g., 29 Sep 2026), timestamp (e.g., 12:45:10 PM WAT), and the beneficiary 10-digit NUBAN account number along with destination bank (e.g. 2048192049 Access Bank). Clicking the dedicated "View Receipt" button displays an all-encompassing official digital receipt complete with NIBSS Session ID, Flutterwave reference, Face ID audit status, and 1-click Thermal/A4 print options.',
    badge: 'Audit & Receipts',
  },
  {
    id: 'faq-6',
    category: 'receipts_history',
    question: 'Can I print or share electronic payment receipts for merchant accounting?',
    answer:
      'Affirmative! Opening any transaction receipt gives you two primary actions: "Print Receipt" (which formats the receipt into clean, thermal or PDF print media for paper/PDF export) and "Copy Details" (which copies a cryptographically verified JSON audit payload to your clipboard for accounting integration).',
    badge: 'Print & Export',
  },
  {
    id: 'faq-7',
    category: 'flutterwave_nibss',
    question: 'How are merchant bank accounts credited in Nigeria?',
    answer:
      'Flutterwave v3 API connects directly with the NIBSS Instant Payments (NIP) and NIBSS NQR switch. Transactions are routed via POST /v3/charges?type=nibss_qr or tokenized charges, providing sub-3-second real-time gross settlement directly into the merchant’s commercial bank account (Zenith, Access, GTBank, First Bank, etc.).',
    badge: 'Sub-3s Settlement',
  },
  {
    id: 'faq-8',
    category: 'smartwatch',
    question: 'Does KudiPulse store my plaintext debit card number (PAN) on the watch?',
    answer:
      'No cap, never! Storing raw card PANs or CVVs on wearable devices violates PCI-DSS 4.0 and CBN guidelines. KudiPulse uses ephemeral hardware-bound device cryptograms and Flutterwave device tokens. Even if the smartwatch is physically seized, no readable card data exists in memory.',
    badge: 'Zero-PAN Storage',
  },
  {
    id: 'faq-9',
    category: 'general',
    question: 'Which smartwatches are supported?',
    answer:
      'KudiPulse is engineered for cross-platform dual-ecosystem deployment: Samsung Galaxy Watch (4, 5, 6, 7), Google Pixel Watch (1, 2, 3), and all Wear OS 3.0+ hardware, alongside Apple Watch Series 6 through Ultra 2 running watchOS 9.0+ paired with iPhone iOS 16+.',
    badge: 'Hardware Support',
  },
  {
    id: 'faq-10',
    category: 'security',
    question: 'What cryptographic ciphers protect the transmission between watch and phone?',
    answer:
      'The transmission is enveloped in authenticated AES-256-GCM encryption with 96-bit unique IVs and 128-bit authentication tags, backed by hardware keys provisioned in Android KeyStore (StrongBox Keymaster) and Apple Secure Enclave Processor (SEP).',
    badge: 'AES-256-GCM',
  },
];

export const FaqView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'general', label: 'General & Workflow' },
    { id: 'security', label: 'Security & Face ID' },
    { id: 'smartwatch', label: 'Wear OS & watchOS' },
    { id: 'receipts_history', label: 'History & Receipts' },
    { id: 'flutterwave_nibss', label: 'Flutterwave & NIBSS' },
  ];

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.badge && item.badge.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* FAQ Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span>Frequently Asked Questions</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                KudiPulse Intel
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tactical knowledge base on dual-watch architecture, Face ID gates, NIBSS settlement, and receipt generation.
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No matching questions found. Try searching for terms like "Face ID", "Receipt", "NUBAN", or "Offline".
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-md"
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-900/90 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                    <span className="text-sm font-bold text-white tracking-wide">
                      {faq.question}
                    </span>
                    {faq.badge && (
                      <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700 font-semibold">
                        {faq.badge}
                      </span>
                    )}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 bg-slate-950/40 animate-in fade-in duration-150">
                    <p className="mt-2">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Help Card */}
      <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Need specialized architecture documentation or integration support?</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 font-semibold">
          <span>Engineered for CBN Circular BSD/DIR/GEN/LAB/11/025</span>
        </div>
      </div>
    </div>
  );
};
