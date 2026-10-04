import React, { useState, useRef, useEffect } from 'react';
import {
  DevicePlatform,
  EncryptedPacket,
  SmartwatchPayload,
  TransactionAuditLog,
  TransactionHistoryItem,
  FlutterwaveChargeResponse,
  LinkedBankAccount,
  INITIAL_LINKED_BANKS,
} from './types/payment';
import { SmartwatchSimulator } from './components/SmartwatchSimulator';
import { PhoneCompanionSimulator } from './components/PhoneCompanionSimulator';
import { SecurityConsole } from './components/SecurityConsole';
import { CodeViewer } from './components/CodeViewer';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { FaqView } from './components/FaqView';
import { SettingsView } from './components/SettingsView';
import { AppLockScreen } from './components/AppLockScreen';
import { ALL_LANGUAGES, LanguageOption } from './data/languages';
import { liveDataGateway, InternetConnectionStatus } from './services/liveDataGateway';
import {
  Shield,
  Zap,
  Radio,
  FileCode,
  Layers,
  Terminal,
  Activity,
  Cpu,
  Lock,
  Globe2,
  CheckCircle2,
  FileCheck2,
  ScanFace,
  History,
  Receipt,
  HelpCircle,
  Settings as SettingsIcon,
  Wifi,
  WifiOff,
  Globe,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const INITIAL_TRANSACTIONS: TransactionHistoryItem[] = [
  {
    id: 'tx-hist-1',
    date: '29 Sep 2026',
    time: '12:45:10 PM',
    rawTimestamp: Date.now() - 1000 * 60 * 18,
    amount: 12500,
    currency: 'NGN',
    recipientName: 'The Palms Lekki Lagos',
    recipientAccountNumber: '2048192049',
    recipientBank: 'Access Bank PLC',
    merchantId: 'MERCH-LEK-4022',
    platform: 'watch_os',
    mode: 'bluetooth',
    settlementType: 'nibss_nqr',
    status: 'successful',
    txRef: 'KUDI-TX-9021482',
    flwRef: 'FLW-VERIFIED-9021482',
    nibssSessionId: '999026260929124510000084920194',
    payerName: 'Col. O. Joshua',
    payerAccountMasked: '•••• •••• •••• 4092 (Zenith)',
    faceIdVerified: true,
    fee: 10.75,
    terminalId: 'POS-LEK-042',
  },
  {
    id: 'tx-hist-2',
    date: '29 Sep 2026',
    time: '11:15:44 AM',
    rawTimestamp: Date.now() - 1000 * 60 * 110,
    amount: 3500,
    currency: 'NGN',
    recipientName: 'Shoprite Ikeja City Mall',
    recipientAccountNumber: '0129482710',
    recipientBank: 'Zenith Bank PLC',
    merchantId: 'MERCH-LOS-8891',
    platform: 'wear_os',
    mode: 'bluetooth',
    settlementType: 'nibss_nqr',
    status: 'successful',
    txRef: 'KUDI-TX-7738291',
    flwRef: 'FLW-VERIFIED-7738291',
    nibssSessionId: '999026260929111544000031920481',
    payerName: 'Col. O. Joshua',
    payerAccountMasked: '•••• •••• •••• 4092 (Zenith)',
    faceIdVerified: false,
    fee: 10.75,
    terminalId: 'POS-IKJ-019',
  },
  {
    id: 'tx-hist-3',
    date: '28 Sep 2026',
    time: '04:30:20 PM',
    rawTimestamp: Date.now() - 1000 * 60 * 60 * 20,
    amount: 25000,
    currency: 'NGN',
    recipientName: 'Transcorp Hilton Abuja',
    recipientAccountNumber: '0039281745',
    recipientBank: 'GTBank (Guaranty Trust)',
    merchantId: 'MERCH-ABJ-1109',
    platform: 'wear_os',
    mode: 'dynamic_qr',
    settlementType: 'nibss_nqr',
    status: 'successful',
    txRef: 'KUDI-TX-6629104',
    flwRef: 'FLW-VERIFIED-6629104',
    nibssSessionId: '999026260928163020000074819205',
    payerName: 'Col. O. Joshua',
    payerAccountMasked: '•••• •••• •••• 4092 (Zenith)',
    faceIdVerified: true,
    fee: 25.0,
    terminalId: 'POS-ABJ-108',
  },
  {
    id: 'tx-hist-4',
    date: '27 Sep 2026',
    time: '08:22:15 PM',
    rawTimestamp: Date.now() - 1000 * 60 * 60 * 42,
    amount: 18000,
    currency: 'NGN',
    recipientName: 'Hard Rock Cafe Victoria Island',
    recipientAccountNumber: '1019283746',
    recipientBank: 'First Bank of Nigeria',
    merchantId: 'MERCH-VI-7731',
    platform: 'watch_os',
    mode: 'bluetooth',
    settlementType: 'nibss_nqr',
    status: 'successful',
    txRef: 'KUDI-TX-5519203',
    flwRef: 'FLW-VERIFIED-5519203',
    nibssSessionId: '999026260927202215000091827462',
    payerName: 'Col. O. Joshua',
    payerAccountMasked: '•••• •••• •••• 4092 (Zenith)',
    faceIdVerified: true,
    fee: 10.75,
    terminalId: 'POS-VI-088',
  },
];

export default function App() {
  const [platform, setPlatform] = useState<DevicePlatform>('wear_os');
  const [activeTab, setActiveTab] = useState<'simulator' | 'history' | 'architecture' | 'code' | 'cbn' | 'faq' | 'settings'>('simulator');
  const [accountBalance, setAccountBalance] = useState<number>(485250.0);
  const [linkedBanks, setLinkedBanks] = useState<LinkedBankAccount[]>(INITIAL_LINKED_BANKS);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(true);
  const [inFlightPacket, setInFlightPacket] = useState<EncryptedPacket | null>(null);
  const [lastRawPayload, setLastRawPayload] = useState<SmartwatchPayload | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastWatchStatus, setLastWatchStatus] = useState<string>('READY');
  const [auditLogs, setAuditLogs] = useState<TransactionAuditLog[]>([]);
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>(INITIAL_TRANSACTIONS);
  const [activeReceiptModalTx, setActiveReceiptModalTx] = useState<TransactionHistoryItem | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>(ALL_LANGUAGES[0]);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [transactionPin, setTransactionPin] = useState<string>('2468');
  const [pinRequiredThreshold, setPinRequiredThreshold] = useState<number>(0); // 0 means required for all, or e.g. CBN threshold
  // Military Authentication Gate: Web shell stays unlocked so smartwatch wrist lock gate is directly testable
  const [isAppUnlocked, setIsAppUnlocked] = useState<boolean>(true);
  const logCounterRef = useRef<number>(0);

  // Global Internet & Cloud Data Access State
  const [globalInternetStatus, setGlobalInternetStatus] = useState<InternetConnectionStatus>({
    isOnline: true,
    latencyMs: 38,
    lastChecked: new Date().toLocaleTimeString(),
    source: 'cloud_ping',
    networkType: 'LTE/5G',
  });
  const [isPingingInternet, setIsPingingInternet] = useState<boolean>(false);

  useEffect(() => {
    const unsub = liveDataGateway.subscribe((status) => {
      setGlobalInternetStatus(status);
    });
    // Initial internet verification
    liveDataGateway.testInternetConnection();
    return () => unsub();
  }, []);

  const handleGlobalInternetPing = async () => {
    setIsPingingInternet(true);
    try {
      await liveDataGateway.testInternetConnection();
    } finally {
      setIsPingingInternet(false);
    }
  };

  // Single active bank resolution
  const activeBank = linkedBanks.find((b) => b.isActiveForTransaction) || linkedBanks[0];

  // Handler to ensure only ONE account is activated for transaction at a time
  const handleActivateBank = (bankId: string) => {
    setLinkedBanks((prev) =>
      prev.map((bank) => ({
        ...bank,
        isActiveForTransaction: bank.id === bankId,
      }))
    );
  };

  const generateUniqueLogId = (prefix: string = 'log') => {
    logCounterRef.current += 1;
    return `${prefix}-${Date.now()}-${logCounterRef.current}-${Math.random().toString(36).slice(2, 7)}`;
  };

  // When watch transmits
  const handleTransmitPacket = (packet: EncryptedPacket, rawPayload: SmartwatchPayload) => {
    setInFlightPacket(packet);
    setLastRawPayload(rawPayload);
    setIsProcessing(true);
    setLastWatchStatus('DATA_LAYER_SENT');

    // Add initial log
    const initialLog: TransactionAuditLog = {
      id: generateUniqueLogId('log-tx'),
      timestamp: new Date().toLocaleTimeString(),
      amount: rawPayload.amount,
      currency: 'NGN',
      platform: packet.platform,
      mode: 'bluetooth',
      settlementType: 'nibss_nqr',
      status: 'validated',
      details: `Dispatched over ${packet.platform === 'wear_os' ? 'DataClient' : 'WCSession'} to ${rawPayload.merchantName}`,
      txRef: `KUDI-${Date.now()}`,
    };
    setAuditLogs((prev) => [initialLog, ...prev.slice(0, 19)]);
  };

  // Transaction success from phone companion
  const handleTransactionSuccess = (
    txId: number,
    amount: number,
    payload: SmartwatchPayload,
    chargeResponse: FlutterwaveChargeResponse,
    faceIdVerified: boolean
  ) => {
    setIsProcessing(false);
    setLastWatchStatus('SETTLED_SUCCESS_HAPTIC');

    // Deduct settled amount from active transaction bank and update general balance
    setLinkedBanks((prev) =>
      prev.map((bank) =>
        bank.isActiveForTransaction
          ? { ...bank, balance: Math.max(0, bank.balance - amount) }
          : bank
      )
    );
    setAccountBalance((prev) => Math.max(0, prev - amount));

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    // Create complete transaction history record
    const newTxItem: TransactionHistoryItem = {
      id: `tx-${Date.now()}-${txId}-${Math.random().toString(36).slice(2, 6)}`,
      date: dateFormatted,
      time: timeFormatted,
      rawTimestamp: Date.now(),
      amount,
      currency: 'NGN',
      recipientName: payload.merchantName || 'Verified Merchant',
      recipientAccountNumber: payload.recipientAccount || '0129482710',
      recipientBank: payload.recipientBank || 'Zenith Bank PLC',
      merchantId: payload.merchantId || 'MERCH-01',
      platform,
      mode: 'bluetooth',
      settlementType: 'nibss_nqr',
      status: 'successful',
      txRef: chargeResponse.data.tx_ref || `KUDI-TX-${txId}`,
      flwRef: chargeResponse.data.flw_ref || `FLW-VERIFIED-${txId}`,
      nibssSessionId: `999026${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      payerName: 'Col. O. Joshua',
      payerAccountMasked: `•••• •••• •••• ${activeBank.accountNumber.slice(-4)} (${activeBank.bankName.split(' ')[0]})`,
      faceIdVerified,
      fee: 10.75,
      terminalId: `POS-${payload.merchantId.slice(0, 7)}`,
    };

    setTransactions((prev) => [newTxItem, ...prev]);

    setAuditLogs((prev) => [
      {
        id: generateUniqueLogId('log-settled'),
        timestamp: timeFormatted,
        amount,
        currency: 'NGN',
        platform,
        mode: 'bluetooth',
        settlementType: 'nibss_nqr',
        status: 'settled',
        details: `Settled via Flutterwave v3 API (#${txId}) to ${newTxItem.recipientAccountNumber}${faceIdVerified ? ' [Face ID Verified]' : ''}`,
        txRef: newTxItem.txRef,
        flwRef: newTxItem.flwRef,
        faceIdVerified,
      },
      ...prev.slice(0, 19),
    ]);
  };

  // Transaction failed or rejected
  const handleTransactionFailed = (reason: string) => {
    setIsProcessing(false);
    setLastWatchStatus('TX_REJECTED');

    setAuditLogs((prev) => [
      {
        id: generateUniqueLogId('log-reject'),
        timestamp: new Date().toLocaleTimeString(),
        amount: lastRawPayload?.amount || 0,
        currency: 'NGN',
        platform,
        mode: 'bluetooth',
        settlementType: 'nibss_nqr',
        status: reason.includes('Replay')
          ? 'rejected_replay'
          : reason.includes('Nonce')
          ? 'rejected_nonce'
          : 'rejected_tamper',
        details: reason,
        txRef: 'REJECTED',
      },
      ...prev.slice(0, 19),
    ]);
  };

  const handleClearPacket = () => {
    setInFlightPacket(null);
    setLastWatchStatus('READY');
  };

  const handleInjectTampered = (packet: EncryptedPacket) => {
    setInFlightPacket(packet);
    setLastWatchStatus('TAMPER_INJECTED');
  };

  // Open receipt for the latest transaction
  const handleOpenLatestReceipt = () => {
    if (transactions.length > 0) {
      setActiveReceiptModalTx(transactions[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Military Authentication Gate: App blocked until 6-digit password or biometric scan verified */}
      {!isAppUnlocked && (
        <AppLockScreen
          onUnlock={() => setIsAppUnlocked(true)}
          userEmail="osagiedejoshua024@gmail.com"
          userName="Col. Osagiede Joshua"
        />
      )}

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        isOpen={!!activeReceiptModalTx}
        transaction={activeReceiptModalTx}
        onClose={() => setActiveReceiptModalTx(null)}
      />

      {/* Tactical Top Command Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Callout */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950 ring-1 ring-emerald-400/40">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold tracking-wider text-white uppercase font-mono">
                  KudiPulse Tactical Mobile Pay
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE OPS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Dual-Device Smartwatch Tap-to-Pay Architecture (Wear OS • watchOS • Flutter • Flutterwave v3 • NIBSS)
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex-wrap">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Live Dual-Watch Simulator
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              Transaction History & Receipts ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'architecture'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              System Architecture
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'code'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Code Deliverables
            </button>
            <button
              onClick={() => setActiveTab('cbn')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'cbn'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              CBN Compliance
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'faq'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              FAQ
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>*Settings</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-emerald-300">
                {currentLanguage.flag} {currentLanguage.code}
              </span>
            </button>
            <button
              onClick={() => setIsAppUnlocked(false)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 transition-all cursor-pointer"
              title="Lock app immediately (Requires 6-Digit Password or Biometric Scan)"
            >
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Lock App</span>
            </button>

            {/* Top Bar Internet Access Indicator */}
            <button
              type="button"
              onClick={handleGlobalInternetPing}
              disabled={isPingingInternet}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                globalInternetStatus.isOnline
                  ? 'bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border-emerald-900/50'
                  : 'bg-red-950/80 hover:bg-red-900 text-red-300 border-red-800'
              }`}
              title={`Internet Gateway: ${globalInternetStatus.isOnline ? 'ONLINE' : 'OFFLINE'} • Latency: ${globalInternetStatus.latencyMs}ms • Click to Ping Cloud`}
            >
              {isPingingInternet ? (
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              ) : globalInternetStatus.isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
              )}
              <span className="hidden md:inline">
                {isPingingInternet ? 'Pinging...' : globalInternetStatus.isOnline ? `${globalInternetStatus.latencyMs}ms` : 'Offline'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Operational Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* TAB 1: LIVE SIMULATOR & DEFENSIVE OPERATIONS */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            {/* Mission Brief Banner */}
            <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">
                  <strong className="text-white">Tactical Mission Status: </strong>
                  Dual-device encrypted pipeline active. Select recipient merchant and payment amount on watch, execute tap-to-pay, and view immediate settlement receipts.
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <button
                  onClick={() => setActiveTab('history')}
                  className="flex items-center gap-1 text-cyan-300 hover:text-cyan-200 font-bold underline cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-cyan-400" /> View All Receipts ({transactions.length})
                </button>
                <button
                  onClick={() => setActiveTab('faq')}
                  className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold underline cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> FAQs
                </button>
                <span className="flex items-center gap-1 text-emerald-300 font-bold">
                  <ScanFace className="w-3.5 h-3.5 text-emerald-400" /> Face ID 3D Reticle
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" /> AES-256-GCM
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-cyan-400" /> HMAC-SHA256
                </span>
              </div>
            </div>

            {/* Side-by-Side Dual Device Interactive Emulators */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Smartwatch Emulator (Wear OS / watchOS) */}
              <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Device 01: Smartwatch Screen
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Standalone UI
                  </span>
                </div>
                <SmartwatchSimulator
                  platform={platform}
                  setPlatform={setPlatform}
                  onTransmitPacket={handleTransmitPacket}
                  isProcessing={isProcessing}
                  lastWatchStatus={lastWatchStatus}
                  accountBalance={activeBank ? activeBank.balance : accountBalance}
                  transactionPin={transactionPin}
                  pinRequiredThreshold={pinRequiredThreshold}
                  linkedBanks={linkedBanks}
                  activeBank={activeBank}
                  onSwitchActiveBank={handleActivateBank}
                />
              </div>

              {/* Right Column: Phone Companion Emulator (Android / iOS) */}
              <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Device 02: Companion Phone & Flutter Engine
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Settlement Bridge
                  </span>
                </div>
                <PhoneCompanionSimulator
                  packet={inFlightPacket}
                  onClearPacket={handleClearPacket}
                  onTransactionSuccess={handleTransactionSuccess}
                  onTransactionFailed={handleTransactionFailed}
                  onViewReceiptRequest={handleOpenLatestReceipt}
                  onOpenSettings={() => setActiveTab('settings')}
                />
              </div>
            </div>

            {/* Security Console & Replay Attack Lab */}
            <SecurityConsole
              latestPacket={inFlightPacket}
              onInjectTamperedPacket={handleInjectTampered}
              auditLogs={auditLogs}
              onClearLogs={() => setAuditLogs([])}
              onViewReceipt={handleOpenLatestReceipt}
            />
          </div>
        )}

        {/* TAB 2: TRANSACTION HISTORY & OFFICIAL DIGITAL RECEIPTS */}
        {activeTab === 'history' && (
          <TransactionHistoryView
            transactions={transactions}
            onSelectReceipt={(tx) => setActiveReceiptModalTx(tx)}
          />
        )}

        {/* TAB 3: SYSTEM ARCHITECTURE */}
        {activeTab === 'architecture' && <ArchitectureDiagram />}

        {/* TAB 4: CODE DELIVERABLES REPOSITORY */}
        {activeTab === 'code' && <CodeViewer />}

        {/* TAB 5: CBN REGULATORY COMPLIANCE */}
        {activeTab === 'cbn' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Central Bank of Nigeria (CBN) Mobile & Wearable Payment Regulatory Matrix
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Compliance mapping for Circular BSD/DIR/GEN/LAB/11/025, NIBSS EMVCo NQR Specs, and PCI-DSS 4.0 Wearable Tokenization.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Tier 1 (Basic / NIN / BVN)
                  </div>
                  <div className="text-2xl font-black text-white">₦50,000</div>
                  <p className="text-xs text-slate-400">Single transaction ceiling</p>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div>• Daily cumulative: <strong>₦100,000</strong></div>
                    <div>• Low-value tap without biometric: <strong>&le; ₦5,000</strong></div>
                    <div>• High-value tap requires 2FA: <strong>Mandatory Face ID</strong></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Tier 2 (ID Verified)
                  </div>
                  <div className="text-2xl font-black text-white">₦200,000</div>
                  <p className="text-xs text-slate-400">Single transaction ceiling</p>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div>• Daily cumulative: <strong>₦500,000</strong></div>
                    <div>• Identity: Verified Gov ID + BVN match</div>
                    <div>• Biometrics required for all wearable taps</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Tier 3 (Full KYC / Merchant)
                  </div>
                  <div className="text-2xl font-black text-white">₦1,000,000+</div>
                  <p className="text-xs text-slate-400">Single transaction ceiling</p>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div>• Daily cumulative: <strong>₦5,000,000</strong></div>
                    <div>• Real-time AML & Sanctions screening</div>
                    <div>• Direct NIBSS Instant Payments (NIP) route</div>
                  </div>
                </div>
              </div>

              {/* Security Specs Checklist */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Mandatory Payment Security Mandates Enforced in KudiPulse
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    <span><strong>Anti-Replay 60s Window:</strong> Rejects smartwatch packets exceeding 60-second latency or duplicate CSPRNG nonces.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    <span><strong>Hardware Cryptographic Enclaves:</strong> Android KeyStore with StrongBox and Apple Secure Enclave ensure keys never touch user-space RAM.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    <span><strong>No Plaintext Cardholder Data:</strong> Card PAN and CVV never stored on the smartwatch; only ephemeral cryptograms and Flutterwave tokens are transmitted.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    <span><strong>NIBSS EMVCo 010212 Compliance:</strong> Generated dynamic QR payloads adhere strictly to Nigerian national QR payment standards.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: FREQUENTLY ASKED QUESTIONS */}
        {activeTab === 'faq' && <FaqView />}

        {/* TAB 7: TERMINAL SETTINGS (*LANGUAGE & LOCALIZATION) */}
        {activeTab === 'settings' && (
          <SettingsView
            currentLanguage={currentLanguage}
            onSelectLanguage={(lang) => setCurrentLanguage(lang)}
            hapticEnabled={hapticEnabled}
            onToggleHaptic={() => setHapticEnabled(!hapticEnabled)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            transactionPin={transactionPin}
            onChangeTransactionPin={(pin) => setTransactionPin(pin)}
            pinRequiredThreshold={pinRequiredThreshold}
            onChangePinRequiredThreshold={(threshold) => setPinRequiredThreshold(threshold)}
            linkedBanks={linkedBanks}
            onActivateBank={handleActivateBank}
            hasAcceptedTerms={hasAcceptedTerms}
            onAcceptTerms={() => setHasAcceptedTerms(true)}
          />
        )}
      </main>

      {/* Tactical Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        KudiPulse Tactical Smartwatch Tap-to-Pay System • Engineering Deliverable for Wear OS, watchOS, Flutter & Flutterwave v3
      </footer>
    </div>
  );
}
