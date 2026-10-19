import React, { useState, useEffect, useRef } from 'react';
import {
  EncryptedPacket,
  SmartwatchPayload,
  SettlementType,
  FlutterwaveChargeResponse,
  FaceIdPolicy,
  FaceIdAuthResult,
  LinkedBankAccount,
  TransactionHistoryItem,
  INITIAL_LINKED_BANKS,
} from '../types/payment';
import { cryptoEngine } from '../services/cryptoEngine';
import { flutterwaveSimulator } from '../services/flutterwaveSimulator';
import { FaceIdScannerModal } from './FaceIdScannerModal';
import confetti from 'canvas-confetti';
import {
  Smartphone,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  Lock,
  Unlock,
  Zap,
  CreditCard,
  QrCode,
  ScanFace,
  Sliders,
  Sparkles,
  Building2,
  Receipt,
  FileText,
  Eye,
  EyeOff,
  ArrowRightLeft,
  Wifi,
  PhoneCall,
  PiggyBank,
  Plus,
  Send,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  X,
  ChevronRight,
  ChevronLeft,
  Clock,
  User,
  Phone,
  Check,
  Shield,
  KeyRound,
  ArrowUpRight,
  Delete,
  Loader2,
  Settings,
} from 'lucide-react';

interface Props {
  packet: EncryptedPacket | null;
  onClearPacket: () => void;
  onTransactionSuccess: (
    txId: number,
    amount: number,
    payload: SmartwatchPayload,
    chargeResponse: FlutterwaveChargeResponse,
    faceIdVerified: boolean
  ) => void;
  onTransactionFailed: (reason: string) => void;
  onViewReceiptRequest?: () => void;
  onOpenSettings?: () => void;
  accountBalance?: number;
  linkedBanks?: LinkedBankAccount[];
  activeBank?: LinkedBankAccount;
  onSwitchActiveBank?: (bankId: string) => void;
  onLinkBank?: (bank: LinkedBankAccount) => void;
  transactions?: TransactionHistoryItem[];
  userName?: string;
  userEmail?: string;
  userPasscode?: string;
  paymentPin?: string;
  onUpdateCredentials?: (passcode?: string, pin?: string) => void;
  duressLockUntil?: number | null;
  onTriggerDuressLock?: (hours?: number) => void;
  onClearDuressLock?: () => void;
  duressPin?: string;
  onUpdateDuressPin?: (pin: string) => void;
}

export const PhoneCompanionSimulator: React.FC<Props> = ({
  packet,
  onClearPacket,
  onTransactionSuccess,
  onTransactionFailed,
  onViewReceiptRequest,
  onOpenSettings,
  accountBalance = 485250,
  linkedBanks = INITIAL_LINKED_BANKS,
  activeBank,
  onSwitchActiveBank,
  onLinkBank,
  transactions = [],
  userName = 'Col. Osagiede Joshua',
  userEmail = 'osagiedejoshua024@gmail.com',
  userPasscode = '123456',
  paymentPin = '1234',
  onUpdateCredentials,
  duressLockUntil,
  onTriggerDuressLock,
  onClearDuressLock,
  duressPin = '2468',
  onUpdateDuressPin,
}) => {
  // Authentication State for Phone Companion
  const [isPhoneLoggedIn, setIsPhoneLoggedIn] = useState<boolean>(true);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Multi-step Registration (Mirroring Smart Watch 8 steps)
  const [regStep, setRegStep] = useState<number>(1);
  const [countryCode, setCountryCode] = useState<string>('+234');
  const [mobileNumber, setMobileNumber] = useState<string>('8109118552');
  const [fullName, setFullName] = useState<string>('Col. Osagiede Joshua');
  const [country, setCountry] = useState<string>('Nigeria');
  const [regionState, setRegionState] = useState<string>('Lagos State');
  const [streetAddress, setStreetAddress] = useState<string>('14 Admiralty Way, Lekki');
  const [postalCode, setPostalCode] = useState<string>('105102');
  const [idType, setIdType] = useState<'nin' | 'bvn'>('nin');
  const [idNumber, setIdNumber] = useState<string>('84910294819');
  const [isVerifyingGovt, setIsVerifyingGovt] = useState<boolean>(false);
  const [govtVerified, setGovtVerified] = useState<boolean>(true);
  const [isFaceMatching, setIsFaceMatching] = useState<boolean>(false);
  const [faceMatched, setFaceMatched] = useState<boolean>(true);
  const [regPasscode, setRegPasscode] = useState<string>('123456');
  const [regConfirmPasscode, setRegConfirmPasscode] = useState<string>('123456');
  const [regPaymentPin, setRegPaymentPin] = useState<string>('1234');
  const [regConfirmPaymentPin, setRegConfirmPaymentPin] = useState<string>('1234');
  const [regNickname, setRegNickname] = useState<string>('Commander Jay');
  const [regEmail, setRegEmail] = useState<string>('osagiedejoshua024@gmail.com');
  const [authError, setAuthError] = useState<string | null>(null);

  // Sign In Flow (Mirroring Smart Watch 3 steps)
  const [signinStep, setSigninStep] = useState<number>(1);
  const [signinPasscode, setSigninPasscode] = useState<string>('');
  const [isSigninFaceScanning, setIsSigninFaceScanning] = useState<boolean>(false);
  const [signinFaceMatched, setSigninFaceMatched] = useState<boolean | null>(null);

  // Duress PIN and Inverse Stop Code Logic
  // Formula: Whatever code is set (e.g. 2468), stop code is inverse (8642). Example 2165 -> 5612!
  const getInverseCode = (code: string) => code.split('').reverse().join('');
  const expectedDisarmCode = getInverseCode(duressPin);

  const [duressInputPin, setDuressInputPin] = useState<string>('');
  const [duressAlertToast, setDuressAlertToast] = useState<string | null>(null);
  const [isDisarmModalOpen, setIsDisarmModalOpen] = useState<boolean>(false);
  const [disarmCodeInput, setDisarmCodeInput] = useState<string>('');
  const [disarmError, setDisarmError] = useState<string | null>(null);

  // Configuration Modal for setting new Duress PIN
  const [isDuressConfigModalOpen, setIsDuressConfigModalOpen] = useState<boolean>(false);
  const [customDuressPinInput, setCustomDuressPinInput] = useState<string>(duressPin);

  // Forgot Password / PIN Modal State
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState<boolean>(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [recoveryTarget, setRecoveryTarget] = useState<string>('8109118552');
  const [recoveryOtp, setRecoveryOtp] = useState<string>('');
  const [newPasscode, setNewPasscode] = useState<string>('');
  const [newPaymentPin, setNewPaymentPin] = useState<string>('');

  // Balance Visibility
  const [showBalance, setShowBalance] = useState<boolean>(true);

  // Modals for Quick Action Icons & Savings
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [transferBank, setTransferBank] = useState<string>('First Bank of Nigeria');
  const [transferAccountNumber, setTransferAccountNumber] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferNarration, setTransferNarration] = useState<string>('');
  const [transferError, setTransferError] = useState<string | null>(null);

  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);
  const [dataNetwork, setDataNetwork] = useState<string>('MTN');
  const [dataPlan, setDataPlan] = useState<string>('2.5GB 30 Days - ₦1,500');
  const [dataPhone, setDataPhone] = useState<string>('8109118552');

  const [isAirtimeModalOpen, setIsAirtimeModalOpen] = useState<boolean>(false);
  const [airtimeNetwork, setAirtimeNetwork] = useState<string>('MTN');
  const [airtimeAmount, setAirtimeAmount] = useState<number>(1000);
  const [airtimePhone, setAirtimePhone] = useState<string>('8109118552');

  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState<boolean>(false);
  const [savingsPlanType, setSavingsPlanType] = useState<'safelock' | 'emergency' | 'target'>('safelock');
  const [savingsTargetAmount, setSavingsTargetAmount] = useState<string>('100000');
  const [savingsFrequency, setSavingsFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Link New Bank Modal
  const [isLinkBankModalOpen, setIsLinkBankModalOpen] = useState<boolean>(false);
  const [newBankName, setNewBankName] = useState<string>('Keystone Bank Limited');
  const [newBankAccount, setNewBankAccount] = useState<string>('');
  const [newBankResolvedName, setNewBankResolvedName] = useState<string>('OSAGIEDE JOSHUA');

  // Smartwatch In-Flight Signal & Settlement State
  const [decryptedPayload, setDecryptedPayload] = useState<SmartwatchPayload | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [requiresBiometrics, setRequiresBiometrics] = useState<boolean>(false);
  const [biometricsPassed, setBiometricsPassed] = useState<boolean>(false);
  const [lastFaceIdResult, setLastFaceIdResult] = useState<FaceIdAuthResult | null>(null);
  const [isFaceIdModalOpen, setIsFaceIdModalOpen] = useState<boolean>(false);
  const [faceIdPolicy, setFaceIdPolicy] = useState<FaceIdPolicy>('cbn_threshold');
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [settlementStep, setSettlementStep] = useState<string>('');
  const [settlementType, setSettlementType] = useState<SettlementType>('nibss_nqr');
  const [completedCharge, setCompletedCharge] = useState<FlutterwaveChargeResponse | null>(null);
  const lastProcessedPacketRef = useRef<EncryptedPacket | null>(null);

  // Live Device Time Sync
  const [deviceTime, setDeviceTime] = useState<string>(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  useEffect(() => {
    const updateTime = () => {
      setDeviceTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format countdown for 12-hour duress lock
  const [duressRemainingText, setDuressRemainingText] = useState<string>('');
  useEffect(() => {
    if (!duressLockUntil || Date.now() >= duressLockUntil) {
      setDuressRemainingText('');
      return;
    }
    const updateCountdown = () => {
      const remainingMs = duressLockUntil - Date.now();
      if (remainingMs <= 0) {
        setDuressRemainingText('');
        onClearDuressLock?.();
        return;
      }
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
      setDuressRemainingText(`${hours}h ${minutes}m ${seconds}s`);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [duressLockUntil, onClearDuressLock]);

  // CRITICAL USER DIRECTIVE:
  // "and if being click (login or register) the duress payment freeze countdown time if already counting would be removed because of a new login user therefore the counter time for the duress payments only works with the active account"
  const handleAuthModeSwitch = (mode: 'signin' | 'register') => {
    setAuthMode(mode);
    setAuthError(null);
    setRegStep(1);
    setSigninStep(1);

    // Remove duress freeze countdown when clicking login or register for a new user
    if (duressLockUntil) {
      onClearDuressLock?.();
      setDuressAlertToast('🔄 New login user session: Duress countdown timer removed from active account.');
      setTimeout(() => setDuressAlertToast(null), 4000);
    }
  };

  // When clicking "Lock Phone" or returning to auth screen
  const handleInitiateAuthScreen = () => {
    setIsPhoneLoggedIn(false);
    // Remove countdown on new login attempt per user instruction
    if (duressLockUntil) {
      onClearDuressLock?.();
      setDuressAlertToast('🔄 Account sign-in active: Duress payment countdown cleared for incoming user.');
      setTimeout(() => setDuressAlertToast(null), 4000);
    }
  };

  // Smartwatch Packet Listener
  useEffect(() => {
    if (!packet) {
      lastProcessedPacketRef.current = null;
      setDecryptedPayload(null);
      setErrorStatus(null);
      setRequiresBiometrics(false);
      setBiometricsPassed(false);
      setCompletedCharge(null);
      return;
    }

    if (lastProcessedPacketRef.current === packet) {
      return;
    }
    lastProcessedPacketRef.current = packet;

    const processPacket = async () => {
      setErrorStatus(null);

      // Check if 12-Hour Coercion Lock is active
      if (duressLockUntil && Date.now() < duressLockUntil) {
        const lockMsg = '🚨 EMERGENCY COERCION LOCKDOWN ACTIVE: Outbound payment rejected under 12-hour freeze.';
        setErrorStatus(lockMsg);
        onTransactionFailed(lockMsg);
        return;
      }

      try {
        const decryptResult = await cryptoEngine.decryptPayload(packet);
        if (!decryptResult.success || !decryptResult.payload) {
          setErrorStatus(decryptResult.error || 'Failed to decrypt smartwatch payload');
          onTransactionFailed(decryptResult.error || 'Decryption failure');
          return;
        }
        const decrypted = decryptResult.payload;
        setDecryptedPayload(decrypted);

        const isFaceIdMandated =
          faceIdPolicy === 'always' ||
          (faceIdPolicy === 'cbn_threshold' && decrypted.amount > 5000);

        if (isFaceIdMandated) {
          setRequiresBiometrics(true);
          setBiometricsPassed(false);
          setIsFaceIdModalOpen(true);
        } else {
          setRequiresBiometrics(false);
          setBiometricsPassed(false);
          settleDirectly(decrypted, false);
        }
      } catch (err: unknown) {
        const errorMsg = (err as Error).message || 'Decryption/Verification failure';
        setErrorStatus(errorMsg);
        onTransactionFailed(errorMsg);
      }
    };

    processPacket();
  }, [packet, faceIdPolicy, duressLockUntil, onTransactionFailed]);

  // Biometric authorization handler
  const handleFaceIdSuccess = (result: FaceIdAuthResult) => {
    setLastFaceIdResult(result);
    setBiometricsPassed(true);
    setIsFaceIdModalOpen(false);

    if (decryptedPayload) {
      settleDirectly(decryptedPayload, true);
    }
  };

  // Execute settlement with Flutterwave/NIBSS
  const settleDirectly = async (payload: SmartwatchPayload, faceIdUsed: boolean) => {
    if (duressLockUntil && Date.now() < duressLockUntil) {
      setErrorStatus('Payment aborted: 12-Hour Emergency Coercion Lock is active.');
      onTransactionFailed('Coercion lock active');
      return;
    }

    setIsSettling(true);
    setSettlementStep('Forming NIBSS NIP ISO-8583 settlement packet...');

    try {
      await new Promise((r) => setTimeout(r, 400));
      setSettlementStep('Transmitting to Flutterwave v3 Live API Gateway...');

      const initialCharge = await flutterwaveSimulator.initiateCharge({
        amount: payload.amount,
        currency: 'NGN',
        email: userEmail || 'operator@kudipulse.ng',
        txRef: `KUDI-TX-${Date.now()}`,
        type: settlementType,
        merchantName: payload.merchantName,
        deviceId: payload.deviceId,
      });

      const response = await flutterwaveSimulator.pollTransactionVerification(
        initialCharge.data.id,
        payload.amount,
        (step) => setSettlementStep(step)
      );

      setCompletedCharge(response);
      setIsSettling(false);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}

      onTransactionSuccess(
        response.data.id,
        payload.amount,
        payload,
        response,
        faceIdUsed
      );
    } catch (err: unknown) {
      setIsSettling(false);
      const e = err as Error;
      setErrorStatus(e.message || 'Settlement failed');
      onTransactionFailed(e.message || 'Settlement error');
    }
  };

  // Activate Duress Freeze PIN (e.g. 2468, or custom code)
  const handleTriggerEmergencyPin = () => {
    if (duressInputPin === duressPin || duressInputPin === '2468') {
      onTriggerDuressLock?.(12);
      setDuressInputPin('');
      setDuressAlertToast(`🚨 EMERGENCY COERCION ACTIVATED: Code ${duressPin} engaged. All payments frozen for 12 hours.`);
      setTimeout(() => setDuressAlertToast(null), 5000);
    } else {
      setDuressAlertToast(`⚠️ Invalid Emergency PIN. Default freeze PIN is 2468.`);
      setTimeout(() => setDuressAlertToast(null), 4000);
    }
  };

  // Disarm Duress Freeze using Inverse Code (e.g. 8642 for 2468, 5612 for 2165)
  const handleDisarmDuress = () => {
    setDisarmError(null);
    if (disarmCodeInput === expectedDisarmCode) {
      onClearDuressLock?.();
      setIsDisarmModalOpen(false);
      setDisarmCodeInput('');
      setDuressAlertToast(`✅ COERCION FREEZE STOPPED: Inverse code ${expectedDisarmCode} verified. Payments restored!`);
      setTimeout(() => setDuressAlertToast(null), 5000);
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 } });
      } catch {}
    } else {
      setDisarmError(`❌ Incorrect disarm code! Expected inverse form of ${duressPin} (${expectedDisarmCode}).`);
    }
  };

  // Handle Quick Bank Transfer Submission
  const handleExecuteTransfer = () => {
    setTransferError(null);
    if (duressLockUntil && Date.now() < duressLockUntil) {
      setTransferError('🚨 Transfer rejected: 12-Hour Coercion Freeze is active.');
      return;
    }
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      setTransferError('Please enter a valid amount');
      return;
    }
    if (amt > accountBalance) {
      setTransferError('Insufficient funds in active bank account');
      return;
    }
    if (transferAccountNumber.length < 10) {
      setTransferError('Please enter a valid 10-digit NUBAN account number');
      return;
    }

    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch {}

    setIsTransferModalOpen(false);
    setTransferAmount('');
    setTransferAccountNumber('');
    setTransferNarration('');
    alert(`✅ Transfer of ₦${amt.toLocaleString()} to ${transferBank} (${transferAccountNumber}) successful! NIBSS Ref: NIP-${Date.now()}`);
  };

  // Handle Quick Data Purchase
  const handleExecuteData = () => {
    if (duressLockUntil && Date.now() < duressLockUntil) {
      alert('🚨 Data top-up blocked: 12-Hour Coercion Freeze is active.');
      return;
    }
    try {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    } catch {}
    setIsDataModalOpen(false);
    alert(`✅ Data Top-up Successful! ${dataPlan} loaded to ${dataNetwork} ${dataPhone}.`);
  };

  // Handle Quick Airtime Purchase
  const handleExecuteAirtime = () => {
    if (duressLockUntil && Date.now() < duressLockUntil) {
      alert('🚨 Airtime recharge blocked: 12-Hour Coercion Freeze is active.');
      return;
    }
    try {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    } catch {}
    setIsAirtimeModalOpen(false);
    alert(`✅ Airtime Recharge of ₦${airtimeAmount.toLocaleString()} to ${airtimeNetwork} (${airtimePhone}) successful!`);
  };

  // Handle Link Bank Account
  const handleAddLinkedBank = () => {
    if (newBankAccount.length < 10) {
      alert('Please enter a valid 10-digit NUBAN account number');
      return;
    }
    const newBankObj: LinkedBankAccount = {
      id: `bank-${Date.now()}`,
      bankName: newBankName,
      bankCode: '082',
      accountNumber: newBankAccount,
      accountName: newBankResolvedName,
      balance: 150000.0,
      isPrimary: false,
      isActiveForTransaction: true,
      colorTheme: 'from-blue-600 to-indigo-800',
      cbnCode: 'CBN-LINKED',
      cardLast4: newBankAccount.slice(-4),
      tier: 'Tier 3',
    };
    onLinkBank?.(newBankObj);
    onSwitchActiveBank?.(newBankObj.id);
    setIsLinkBankModalOpen(false);
    setNewBankAccount('');
    alert(`✅ ${newBankName} account successfully linked & set as active funding source!`);
  };

  const currentActive = activeBank || linkedBanks[0];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Face ID Scanner Interactive Modal */}
      <FaceIdScannerModal
        isOpen={isFaceIdModalOpen}
        amount={decryptedPayload?.amount || 7500}
        merchantName={decryptedPayload?.merchantName || 'The Palms Lekki Lagos'}
        onSuccess={handleFaceIdSuccess}
        onCancel={() => {
          setIsFaceIdModalOpen(false);
          if (requiresBiometrics) {
            setErrorStatus('Face ID Authorization cancelled by user');
            onTransactionFailed('Biometric authorization cancelled');
          }
        }}
      />

      {/* ============================================================ */}
      {/* PHONE HARDWARE CHASSIS CONTAINER                             */}
      {/* ============================================================ */}
      <div className="w-full max-w-sm sm:max-w-md rounded-[44px] bg-slate-950 border-4 border-slate-700/80 shadow-2xl p-4 flex flex-col justify-between min-h-[660px] relative ring-1 ring-slate-800 transition-all">
        {/* Phone Top Status Bar (Device Time & Island) */}
        <div className="flex items-center justify-between px-3 pt-0.5 pb-2">
          <span className="text-[10px] font-mono font-bold text-slate-200 tracking-tight">
            {deviceTime}
          </span>

          {/* Dynamic Island / TrueDepth Sensor Notch */}
          <div
            onClick={() => setIsFaceIdModalOpen(true)}
            title="Click to trigger Face ID TrueDepth Scan"
            className="cursor-pointer group w-24 h-4.5 bg-slate-900 hover:bg-slate-800 rounded-full flex items-center justify-between px-2 transition-all ring-1 ring-slate-800"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-emerald-400 transition-colors"></div>
            <div className="flex items-center gap-1">
              <ScanFace className="w-2.5 h-2.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[7.5px] font-mono text-slate-400 group-hover:text-emerald-300">
                Face ID
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-indigo-950 ring-1 ring-indigo-500/40"></div>
          </div>

          <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-slate-400 font-bold">
            <span className="text-emerald-400">5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Companion App Screen Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white tracking-wide">
              KudiPulse Companion & Flutter Engine
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
              {packet ? packet.platform.toUpperCase() : 'BLE/DATA READY'}
            </span>

            {/* Lock / Unlock Phone App Toggle */}
            <button
              type="button"
              onClick={handleInitiateAuthScreen}
              className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[9px] font-semibold border border-slate-700/80 transition-all cursor-pointer flex items-center gap-1"
              title={isPhoneLoggedIn ? 'Lock Phone App & Switch User' : 'Already on Auth Screen'}
            >
              {isPhoneLoggedIn ? <Lock className="w-2.5 h-2.5 text-amber-400" /> : <Unlock className="w-2.5 h-2.5 text-emerald-400" />}
              <span>{isPhoneLoggedIn ? 'Lock' : 'Auth'}</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {duressAlertToast && (
          <div className="p-2 mb-2 rounded-xl bg-red-950/90 border border-red-800 text-red-200 text-xs font-mono font-bold animate-in fade-in flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-[10px] leading-tight">{duressAlertToast}</span>
          </div>
        )}

        {/* 12-Hour Coercion / Duress Lock Active Banner with Inverse Disarm */}
        {duressLockUntil && Date.now() < duressLockUntil && (
          <div className="p-2.5 mb-2.5 rounded-2xl bg-red-950/90 border border-red-700 text-red-200 text-left space-y-1.5 shadow-lg animate-pulse">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-red-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                12-HR COERCION LOCKDOWN ACTIVE
              </span>
              <span className="text-[9px] font-mono text-red-300 font-extrabold bg-red-900/60 px-1.5 py-0.5 rounded-full">
                {duressRemainingText}
              </span>
            </div>
            <p className="text-[9px] text-red-200/90 leading-tight">
              All outbound payments, transfers & smartwatch tap-to-pay are frozen (Triggered by PIN: <span className="font-mono font-bold text-amber-300">{duressPin}</span>).
            </p>
            <div className="pt-1 flex items-center justify-between border-t border-red-800/80">
              <span className="text-[8px] font-mono text-red-300">
                Disarm code: Inverse of {duressPin} (<strong className="text-amber-300">{expectedDisarmCode}</strong>)
              </span>
              <button
                type="button"
                onClick={() => {
                  setDisarmError(null);
                  setDisarmCodeInput('');
                  setIsDisarmModalOpen(true);
                }}
                className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[8.5px] font-bold cursor-pointer transition-all active:scale-95 shadow"
              >
                Disarm Freeze ({expectedDisarmCode})
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CONDITIONAL: PHONE LOGIN / SIGN IN (SAME AS WATCH PROCESS)   */}
        {/* ============================================================ */}
        {!isPhoneLoggedIn ? (
          <div className="flex-1 flex flex-col justify-between text-left space-y-2 py-1 animate-in fade-in overflow-y-auto no-scrollbar">
            {/* Top Auth Banner & Mode Switch */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-bold shadow-md">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white font-mono uppercase">
                      Officer Portal
                    </h3>
                    <p className="text-[8.5px] text-slate-400">
                      Companion Phone & Flutter Engine
                    </p>
                  </div>
                </div>

                {/* Duress Pin Settings Trigger */}
                <button
                  type="button"
                  onClick={() => setIsDuressConfigModalOpen(true)}
                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[8px] font-mono text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  title="Configure Freeze PIN and view Inverse Stop Code"
                >
                  <KeyRound className="w-2.5 h-2.5 text-amber-400" />
                  <span>PIN: {duressPin} ({expectedDisarmCode})</span>
                </button>
              </div>

              {/* Mode Toggle: Sign In vs Register (New User) */}
              {/* NOTE: Clicking either removes countdown per user directive */}
              <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-900 rounded-xl border border-slate-800 text-[9.5px] font-semibold font-mono">
                <button
                  type="button"
                  onClick={() => handleAuthModeSwitch('signin')}
                  className={`py-1 rounded-lg transition-all cursor-pointer ${
                    authMode === 'signin' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In (Existing)
                </button>
                <button
                  type="button"
                  onClick={() => handleAuthModeSwitch('register')}
                  className={`py-1 rounded-lg transition-all cursor-pointer ${
                    authMode === 'register' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register (NIN/BVN)
                </button>
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* 1. SIGN IN FLOW (Same as watch 3 steps)                  */}
            {/* -------------------------------------------------------- */}
            {authMode === 'signin' && (
              <div className="space-y-2 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between text-[8px] font-mono text-cyan-400">
                  <span>Sign In Step 0{signinStep} of 03</span>
                  <span>Officer Authentication</span>
                </div>

                {/* Signin Step 1: Phone Number */}
                {signinStep === 1 && (
                  <div className="space-y-2 text-[10px]">
                    <div>
                      <label className="text-slate-400 block mb-0.5">Mobile Number</label>
                      <div className="flex gap-1">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="h-8 bg-slate-950 text-white font-mono text-[9px] px-1.5 rounded-xl border border-slate-800"
                        >
                          <option value="+234">🇳🇬 +234</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                        </select>
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="810 911 8552"
                          className="flex-1 h-8 bg-slate-950 text-white font-mono text-xs px-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSigninStep(2)}
                      className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
                    >
                      <span>Next: Enter Passcode</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Signin Step 2: 6-Digit Passcode */}
                {signinStep === 2 && (
                  <div className="space-y-2 text-[10px]">
                    <div>
                      <label className="text-slate-400 block mb-0.5">Enter 6-Digit Login Passcode</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={signinPasscode}
                        onChange={(e) => setSigninPasscode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full h-8 bg-slate-950 text-white font-mono text-center tracking-widest text-xs px-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSigninStep(1)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setSigninStep(3)}
                        className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
                      >
                        <span>Next: Face Authentication</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Signin Step 3: Face Authentication */}
                {signinStep === 3 && (
                  <div className="space-y-2 text-center py-2">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-cyan-400 flex items-center justify-center mx-auto text-cyan-400">
                      <ScanFace className="w-7 h-7 animate-pulse" />
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      Face Match with Registered Officer Record
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPhoneLoggedIn(true);
                        setSigninPasscode('');
                        alert('✅ Officer Face Authenticated! Companion Phone unlocked.');
                      }}
                      className="w-full py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all active:scale-95"
                    >
                      Authenticate & Access Phone Dashboard
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* 2. REGISTRATION FLOW (Same as watch 8 steps: NIN or BVN) */}
            {/* -------------------------------------------------------- */}
            {authMode === 'register' && (
              <div className="space-y-2 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-[10px]">
                <div className="flex items-center justify-between text-[8px] font-mono text-emerald-400 border-b border-slate-800 pb-1">
                  <span>Registration Step 0{regStep} of 08</span>
                  <span>Govt NIN/BVN Clearance</span>
                </div>

                {/* Step 1: Mobile Number */}
                {regStep === 1 && (
                  <div className="space-y-1.5">
                    <label className="text-slate-400 block">Step 1: Mobile Number</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full h-8 bg-slate-950 text-white px-2.5 rounded-xl border border-slate-800 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                    >
                      Next: Legal Address
                    </button>
                  </div>
                )}

                {/* Step 2: Names & Address */}
                {regStep === 2 && (
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Step 2: Full Legal Names & Address</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Names"
                      className="w-full h-7 bg-slate-950 text-white text-[9px] px-2 rounded-lg border border-slate-800"
                    />
                    <input
                      type="text"
                      value={regionState}
                      onChange={(e) => setRegionState(e.target.value)}
                      placeholder="State or Region"
                      className="w-full h-7 bg-slate-950 text-white text-[9px] px-2 rounded-lg border border-slate-800"
                    />
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Street Address"
                      className="w-full h-7 bg-slate-950 text-white text-[9px] px-2 rounded-lg border border-slate-800"
                    />
                    <div className="flex gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setRegStep(1)}
                        className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[9px]"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegStep(3)}
                        className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[9px]"
                      >
                        Next: Identity Doc
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Identity Document (NIN or BVN) */}
                {regStep === 3 && (
                  <div className="space-y-1.5">
                    <label className="text-slate-400 block">Step 3: Identity Document Choice</label>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setIdType('nin')}
                        className={`py-1 rounded-lg font-bold ${
                          idType === 'nin' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        NIN (+16 yrs)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIdType('bvn')}
                        className={`py-1 rounded-lg font-bold ${
                          idType === 'bvn' ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        BVN (+18 yrs)
                      </button>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[8.5px] block mb-0.5">
                        Input 11-digit {idType.toUpperCase()}:
                      </span>
                      <input
                        type="text"
                        maxLength={11}
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-8 bg-slate-950 text-white text-center font-mono font-bold tracking-widest text-xs px-2 rounded-xl border border-emerald-800"
                      />
                    </div>
                    <div className="flex gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setRegStep(2)}
                        className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[9px]"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegStep(4)}
                        className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[9px]"
                      >
                        Next: Govt Check
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Govt Check (100% Approved) */}
                {regStep === 4 && (
                  <div className="space-y-1.5 text-center py-1">
                    <span className="text-2xl">💯</span>
                    <div className="text-[10px] font-bold text-emerald-400 font-mono">
                      APPROVED & VERIFIED!
                    </div>
                    <p className="text-[8.5px] text-slate-400">
                      National identity clearance confirmed for {idType.toUpperCase()} {idNumber.slice(0, 4)}••••••
                    </p>
                    <button
                      type="button"
                      onClick={() => setRegStep(5)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl mt-1"
                    >
                      Next: Face Match
                    </button>
                  </div>
                )}

                {/* Step 5: Live Facial Recognition */}
                {regStep === 5 && (
                  <div className="space-y-1.5 text-center py-1">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-cyan-400 flex items-center justify-center mx-auto text-cyan-400">
                      <ScanFace className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="text-[10px] font-bold text-cyan-300 font-mono">
                      Face Match 100% Score
                    </div>
                    <button
                      type="button"
                      onClick={() => setRegStep(6)}
                      className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl mt-1"
                    >
                      Next: Set 6-Digit Passcode
                    </button>
                  </div>
                )}

                {/* Step 6: 6-Digit Passcode */}
                {regStep === 6 && (
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Step 6: Place 6-Digit Passcode</label>
                    <input
                      type="password"
                      maxLength={6}
                      value={regPasscode}
                      onChange={(e) => setRegPasscode(e.target.value.replace(/\D/g, ''))}
                      className="w-full h-8 bg-slate-950 text-white text-center font-mono tracking-widest text-xs rounded-xl border border-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setRegStep(7)}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl mt-1"
                    >
                      Next: Set 4-Digit Payment PIN
                    </button>
                  </div>
                )}

                {/* Step 7: 4-Digit Payment PIN */}
                {regStep === 7 && (
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Step 7: 4-Digit Payment PIN (ATM/POS)</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={regPaymentPin}
                      onChange={(e) => setRegPaymentPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full h-8 bg-slate-950 text-teal-400 text-center font-mono font-bold tracking-widest text-xs rounded-xl border border-teal-800"
                    />
                    <button
                      type="button"
                      onClick={() => setRegStep(8)}
                      className="w-full py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl mt-1"
                    >
                      Next: Nickname & Email
                    </button>
                  </div>
                )}

                {/* Step 8: Nickname & Email -> Finish */}
                {regStep === 8 && (
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Step 8: Final Profile Credentials</label>
                    <input
                      type="text"
                      value={regNickname}
                      onChange={(e) => setRegNickname(e.target.value)}
                      placeholder="Nickname"
                      className="w-full h-7 bg-slate-950 text-white text-[9px] px-2 rounded-lg border border-slate-800"
                    />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full h-7 bg-slate-950 text-white text-[9px] px-2 rounded-lg border border-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateCredentials?.(regPasscode, regPaymentPin);
                        setIsPhoneLoggedIn(true);
                        alert(`✅ Registration Complete for ${fullName}! Welcome to KudiPulse Companion.`);
                      }}
                      className="w-full py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow cursor-pointer mt-1"
                    >
                      Complete Registration & Enter
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Additional Features Section at Bottom of Auth Screen */}
            <div className="space-y-2 pt-1 border-t border-slate-900">
              {/* Forgot Password Link */}
              <div className="flex items-center justify-between text-[9px] font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordModalOpen(true);
                    setForgotStep('request');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer"
                >
                  Forgot Password or PIN?
                </button>
                <button
                  type="button"
                  onClick={() => setIsFaceIdModalOpen(true)}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <ScanFace className="w-2.5 h-2.5" />
                  <span>Test Biometrics</span>
                </button>
              </div>

              {/* Emergency Duress PIN Field (Default 2468, Inverse Stop 8642) */}
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-800/60 text-left space-y-1">
                <div className="flex items-center justify-between text-[9px] font-bold text-amber-300">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    Forced to Pay? Emergency Freeze
                  </span>
                  <span className="font-mono text-[8px] text-amber-400/90">
                    PIN: {duressPin}
                  </span>
                </div>
                <p className="text-[8px] text-slate-300 leading-tight">
                  Enter payment lock PIN ({duressPin}) to freeze payments for 12 hours. Unlock code is inverse: <strong className="text-amber-300">{expectedDisarmCode}</strong>.
                </p>
                <div className="flex items-center gap-1 pt-0.5">
                  <input
                    type="password"
                    maxLength={4}
                    value={duressInputPin}
                    onChange={(e) => setDuressInputPin(e.target.value.replace(/\D/g, ''))}
                    placeholder={`e.g. ${duressPin}`}
                    className="flex-1 h-6 bg-slate-950 text-amber-300 text-[10px] font-mono px-2 rounded-lg border border-amber-800/80 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTriggerEmergencyPin}
                    className="px-2 py-1 bg-red-900 hover:bg-red-800 text-white font-mono text-[8px] font-bold rounded-lg cursor-pointer transition-all active:scale-95 shrink-0"
                  >
                    Lock 12hrs
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* MAIN COMPANION PHONE DASHBOARD (UNLOCKED)                     */
          /* ============================================================ */
          <div className="flex-1 flex flex-col space-y-2.5 text-left overflow-y-auto no-scrollbar pr-0.5 pb-2">
            {/* Smartwatch In-Flight Signal Card (If Smartwatch transmitted packet) */}
            {packet && (
              <div className="p-2.5 bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500 rounded-2xl space-y-2 shadow-xl animate-in zoom-in-95">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    Incoming Smartwatch Tap-to-Pay Signal
                  </span>
                  <button
                    type="button"
                    onClick={onClearPacket}
                    className="text-slate-400 hover:text-white text-[10px]"
                  >
                    ✕
                  </button>
                </div>

                {decryptedPayload && (
                  <div className="space-y-1 font-mono text-[10px] text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Beneficiary:</span>
                      <span className="text-white font-bold">{decryptedPayload.merchantName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Amount:</span>
                      <span className="text-emerald-400 font-bold text-xs">
                        ₦{decryptedPayload.amount.toLocaleString()} NGN
                      </span>
                    </div>
                  </div>
                )}

                {/* Settle or Face ID Gate Button */}
                {requiresBiometrics && !biometricsPassed ? (
                  <button
                    type="button"
                    onClick={() => setIsFaceIdModalOpen(true)}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 shadow-md cursor-pointer"
                  >
                    <ScanFace className="w-3.5 h-3.5" />
                    <span>Authorize Face ID (&gt; ₦5,000 threshold)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => decryptedPayload && settleDirectly(decryptedPayload, biometricsPassed)}
                    disabled={isSettling}
                    className="w-full py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 shadow-md cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isSettling ? 'Settling with NIBSS...' : 'Confirm & Settle via Flutterwave'}</span>
                  </button>
                )}
              </div>
            )}

            {/* 1. ACCOUNT BALANCE CARD */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-emerald-400" />
                  Account Balance
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDuressConfigModalOpen(true)}
                    className="text-[8px] font-mono text-amber-300 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded cursor-pointer"
                    title="View / Change Coercion Freeze Code"
                  >
                    Freeze PIN: {duressPin}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Toggle balance visibility"
                  >
                    {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-xl font-black text-white font-mono tracking-tight">
                  {showBalance ? `₦${accountBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : '••••••••••'}
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 font-semibold">
                  Tier 3 Verified
                </span>
              </div>

              {/* Active Bank Chip */}
              <div className="flex items-center justify-between text-[9px] font-mono pt-1 border-t border-slate-800/80 text-slate-400">
                <span className="flex items-center gap-1 text-slate-300">
                  <Building2 className="w-2.5 h-2.5 text-cyan-400" />
                  <span>{currentActive.bankName}</span>
                </span>
                <span className="text-slate-500">
                  Acct: •••• {currentActive.accountNumber.slice(-4)}
                </span>
              </div>
            </div>

            {/* 2. LINKING OF BANKS (First, GT, Kuda, Keystone, etc.) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-cyan-400" />
                  Linked Banks
                </span>
                <button
                  type="button"
                  onClick={() => setIsLinkBankModalOpen(true)}
                  className="text-[9px] font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>Link Bank</span>
                </button>
              </div>

              {/* Scrollable Bank Cards: First, GT, Kuda, Keystone, Zenith, Access, UBA */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {linkedBanks.map((bank) => {
                  const isCurrent = bank.id === currentActive.id;
                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => onSwitchActiveBank?.(bank.id)}
                      className={`px-2.5 py-1.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer font-mono ${
                        isCurrent
                          ? 'bg-gradient-to-r from-emerald-950 to-slate-900 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/40'
                          : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[9px] font-bold truncate max-w-[120px]">
                        <span>{bank.bankName.split(' ')[0]}</span>
                        {isCurrent && <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />}
                      </div>
                      <div className="text-[8px] text-slate-500">
                        •••• {bank.accountNumber.slice(-4)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. RECENT TRANSACTIONS */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  Recent Transactions
                </span>
                {onViewReceiptRequest && (
                  <button
                    type="button"
                    onClick={onViewReceiptRequest}
                    className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                  >
                    View All
                  </button>
                )}
              </div>

              <div className="space-y-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-2">
                {transactions.slice(0, 3).map((tx) => (
                  <div
                    key={tx.id}
                    onClick={onViewReceiptRequest}
                    className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-b-0 cursor-pointer hover:bg-slate-800/40 px-1 rounded transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="text-[9.5px] font-bold text-white truncate max-w-[150px]">
                        {tx.recipientName}
                      </div>
                      <div className="text-[7.5px] font-mono text-slate-500">
                        {tx.time} • {tx.mode.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9.5px] font-mono font-bold text-emerald-400">
                        -₦{tx.amount.toLocaleString()}
                      </div>
                      <span className="text-[7px] font-mono text-emerald-400/90 bg-emerald-950 px-1 py-0.2 rounded">
                        Settled ✓
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. THREE ACTION ICONS: 1. Bank transfer 2. Data 3. Airtime */}
            <div className="pt-1">
              <div className="grid grid-cols-3 gap-2">
                {/* 1st Icon: Bank transfer */}
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(true)}
                  className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/60 flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer active:scale-95 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-200 group-hover:text-white">
                    Bank Transfer
                  </span>
                </button>

                {/* 2nd Icon: Data */}
                <button
                  type="button"
                  onClick={() => setIsDataModalOpen(true)}
                  className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/60 flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer active:scale-95 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-200 group-hover:text-white">
                    Data
                  </span>
                </button>

                {/* 3rd Icon: Airtime */}
                <button
                  type="button"
                  onClick={() => setIsAirtimeModalOpen(true)}
                  className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/60 flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer active:scale-95 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-200 group-hover:text-white">
                    Airtime
                  </span>
                </button>
              </div>
            </div>

            {/* 5. RECTANGULAR BLOCK: "saving for the future is an important aspect that can help you in difficult times that finances would be needed. Click here to set up your save option" */}
            <div
              onClick={() => setIsSavingsModalOpen(true)}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/50 hover:border-emerald-400 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group text-left mt-1"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-emerald-400 mt-0.5">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      KudiPulse Wealth Vault
                    </span>
                    <span className="text-[8px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-bold">
                      15.5% p.a.
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-200 leading-snug font-medium">
                    saving for the future is an important aspect that can help you in difficult times that finances would be needed. Click here to set up your save option
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phone Bottom Navigation Bar */}
        <div className="pt-2 border-t border-slate-900 flex items-center justify-around text-slate-500 text-[10px]">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Zap className="w-3 h-3" /> Tap-to-Pay
          </span>
          <button
            onClick={() => setIsFaceIdModalOpen(true)}
            className="hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <ScanFace className="w-3 h-3" /> Face ID
          </button>
          <button
            onClick={() => setIsLinkBankModalOpen(true)}
            className="hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <CreditCard className="w-3 h-3" /> Banks
          </button>
          <button
            onClick={onOpenSettings}
            className="hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
            title="Open Terminal Settings"
          >
            <span>*Settings</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: DISARM DURESS FREEZE USING INVERSE CODE                */}
      {/* ============================================================ */}
      {isDisarmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-red-800 rounded-3xl p-5 shadow-2xl text-left space-y-3 font-mono animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-red-800/80 pb-2">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Stop 12-Hour Coercion Freeze
              </span>
              <button
                type="button"
                onClick={() => setIsDisarmModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[10px]">
              <p className="text-slate-300 leading-tight">
                To disarm the freeze, input the exact <strong>inverse (reversed) form</strong> of the freeze PIN.
              </p>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[9px] text-slate-300 space-y-0.5">
                <div>Active Freeze PIN: <strong className="text-white font-mono">{duressPin}</strong></div>
                <div>Calculated Disarm Code (Inverse): <strong className="text-emerald-400 font-mono">{expectedDisarmCode}</strong></div>
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Enter Disarm Code</label>
                <input
                  type="text"
                  maxLength={duressPin.length}
                  value={disarmCodeInput}
                  onChange={(e) => setDisarmCodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder={`e.g. ${expectedDisarmCode}`}
                  className="w-full h-8 bg-slate-900 text-emerald-400 font-mono text-center font-bold tracking-widest text-sm px-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {disarmError && (
                <span className="text-[9px] text-red-400 block">{disarmError}</span>
              )}

              <button
                type="button"
                onClick={handleDisarmDuress}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl cursor-pointer shadow-md mt-1"
              >
                Verify Inverse Code & Stop Freeze
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CONFIGURE DURESS PIN & INVERSE FORM FORMULA            */}
      {/* ============================================================ */}
      {isDuressConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl text-left space-y-3 font-mono animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                Duress Coercion PIN & Inverse Protocol
              </span>
              <button
                type="button"
                onClick={() => setIsDuressConfigModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[10px]">
              <p className="text-slate-300 leading-tight">
                When forced to pay under duress, enter your Freeze PIN. To stop the 12-hour freeze, the system automatically uses its <strong>inverse form</strong>.
              </p>

              <div>
                <label className="text-slate-400 block mb-0.5">Set Duress Payment Freeze PIN</label>
                <input
                  type="text"
                  maxLength={6}
                  value={customDuressPinInput}
                  onChange={(e) => setCustomDuressPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 2468 or 2165"
                  className="w-full h-8 bg-slate-900 text-amber-300 font-mono text-center font-bold tracking-widest text-sm px-2 rounded-xl border border-amber-800/80"
                />
              </div>

              {/* Dynamic Inverse Calculation Display */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[8.5px]">Inverse Algorithm Preview:</div>
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-amber-300">PIN: {customDuressPinInput || '----'}</span>
                  <span className="text-slate-500">➔ Inverse ➔</span>
                  <span className="text-emerald-400">
                    Stop Code: {customDuressPinInput ? getInverseCode(customDuressPinInput) : '----'}
                  </span>
                </div>
                <div className="text-[8px] text-slate-500">
                  e.g. 2468 ➔ 8642 | 2165 ➔ 5612
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (customDuressPinInput.length >= 3) {
                    onUpdateDuressPin?.(customDuressPinInput);
                    setIsDuressConfigModalOpen(false);
                    alert(`✅ Duress Freeze PIN set to ${customDuressPinInput}! The code to stop freeze is automatically ${getInverseCode(customDuressPinInput)}.`);
                  } else {
                    alert('Please enter at least 3 digits');
                  }
                }}
                className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl cursor-pointer mt-1"
              >
                Save Freeze PIN & Inverse Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: FORGOT PASSWORD OR PIN RECOVERY MODAL                 */}
      {/* ============================================================ */}
      {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl text-left space-y-3 font-mono animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                Reset Password or Payment PIN
              </span>
              <button
                type="button"
                onClick={() => setIsForgotPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {forgotStep === 'request' && (
              <div className="space-y-3 text-[10px]">
                <p className="text-slate-300 leading-tight">
                  Enter your registered mobile number or email to receive an instant verification OTP.
                </p>
                <input
                  type="text"
                  value={recoveryTarget}
                  onChange={(e) => setRecoveryTarget(e.target.value)}
                  placeholder="810 911 8552 or email"
                  className="w-full h-8 bg-slate-900 text-white px-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('verify');
                    setRecoveryOtp('849201');
                  }}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Send 6-Digit OTP Code
                </button>
              </div>
            )}

            {forgotStep === 'verify' && (
              <div className="space-y-3 text-[10px]">
                <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-300">
                  <span>Demo OTP Code: <strong>849201</strong> sent to {recoveryTarget}</span>
                </div>
                <div>
                  <label className="text-slate-400 block mb-0.5">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={recoveryOtp}
                    onChange={(e) => setRecoveryOtp(e.target.value)}
                    className="w-full h-8 bg-slate-900 text-white px-2.5 rounded-xl border border-slate-800 text-center font-bold tracking-widest text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForgotStep('reset')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Verify OTP & Proceed
                </button>
              </div>
            )}

            {forgotStep === 'reset' && (
              <div className="space-y-2.5 text-[10px]">
                <div>
                  <label className="text-slate-400 block mb-0.5">New 6-Digit Login Passcode</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 654321"
                    className="w-full h-8 bg-slate-900 text-white px-2.5 rounded-xl border border-slate-800 text-center font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-0.5">New 4-Digit Payment PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPaymentPin}
                    onChange={(e) => setNewPaymentPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 4321"
                    className="w-full h-8 bg-slate-900 text-white px-2.5 rounded-xl border border-slate-800 text-center font-bold text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (newPasscode.length === 6 || newPaymentPin.length === 4) {
                      onUpdateCredentials?.(newPasscode || undefined, newPaymentPin || undefined);
                      alert('✅ Passcode and Payment PIN updated successfully!');
                      setIsForgotPasswordModalOpen(false);
                      setIsPhoneLoggedIn(true);
                    } else {
                      alert('Please input a 6-digit passcode or 4-digit PIN');
                    }
                  }}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl cursor-pointer mt-1"
                >
                  Update & Access Phone App
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: BANK TRANSFER MODAL                                   */}
      {/* ============================================================ */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl text-left space-y-3 font-mono animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                NIBSS Instant Bank Transfer
              </span>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[10px]">
              <div>
                <label className="text-slate-400 block mb-0.5">Select Destination Bank</label>
                <select
                  value={transferBank}
                  onChange={(e) => setTransferBank(e.target.value)}
                  className="w-full h-8 bg-slate-900 text-white px-2 rounded-xl border border-slate-800"
                >
                  <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                  <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                  <option value="Kuda Microfinance Bank">Kuda Microfinance Bank</option>
                  <option value="Keystone Bank Limited">Keystone Bank Limited</option>
                  <option value="Zenith Bank PLC">Zenith Bank PLC</option>
                  <option value="Access Bank PLC">Access Bank PLC</option>
                  <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                  <option value="OPay Digital Services">OPay Digital Services</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">10-Digit NUBAN Account</label>
                <input
                  type="text"
                  maxLength={10}
                  value={transferAccountNumber}
                  onChange={(e) => setTransferAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 0129482710"
                  className="w-full h-8 bg-slate-900 text-white px-2 rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Amount (NGN)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full h-8 bg-slate-900 text-emerald-400 font-bold px-2 rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Narration / Note</label>
                <input
                  type="text"
                  value={transferNarration}
                  onChange={(e) => setTransferNarration(e.target.value)}
                  placeholder="e.g. Tactical supply settlement"
                  className="w-full h-8 bg-slate-900 text-white px-2 rounded-xl border border-slate-800"
                />
              </div>

              {transferError && (
                <span className="text-[9px] text-red-400 block">{transferError}</span>
              )}

              <button
                type="button"
                onClick={handleExecuteTransfer}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl cursor-pointer mt-1"
              >
                Send Bank Transfer (NIBSS Instant)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DATA TOP-UP MODAL                                     */}
      {/* ============================================================ */}
      {isDataModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl text-left space-y-3 font-mono animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-cyan-400" />
                Mobile Internet Data Bundle
              </span>
              <button
                type="button"
                onClick={() => setIsDataModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[10px]">
              <div>
                <label className="text-slate-400 block mb-0.5">Select Telecom Provider</label>
                <div className="grid grid-cols-4 gap-1">
                  {['MTN', 'Airtel', 'Glo', '9mobile'].map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setDataNetwork(net)}
                      className={`py-1 rounded-lg border text-center font-bold ${
                        dataNetwork === net
                          ? 'bg-cyan-600 text-white border-cyan-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Phone Number</label>
                <input
                  type="tel"
                  value={dataPhone}
                  onChange={(e) => setDataPhone(e.target.value)}
                  className="w-full h-8 bg-slate-900 text-white px-2 rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Select Data Bundle Plan</label>
                <select
                  value={dataPlan}
                  onChange={(e) => setDataPlan(e.target.value)}
                  className="w-full h-8 bg-slate-900 text-white px-2 rounded-xl border border-slate-800"
                >
                  <option value="1.5GB 30 Days - ₦1,200">1.5GB Monthly - ₦1,200</option>
                  <option value="2.5GB 30 Days - ₦1,500">2.5GB Monthly - ₦1,500</option>
                  <option value="10GB 30 Days - ₦3,500">10GB Monthly - ₦3,500</option>
                  <option value="25GB 30 Days - ₦6,500">25GB Monthly - ₦6,500</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleExecuteData}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl cursor-pointer mt-1"
              >
                Purchase Data Bundle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: AIRTIME RECHARGE MODAL                                */}
      {/* ============================================================ */}
      {isAirtimeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl text-left space-y-3 font-mono animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-amber-400" />
                Instant Airtime Recharge
              </span>
              <button
                type="button"
                onClick={() => setIsAirtimeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[10px]">
              <div>
                <label className="text-slate-400 block mb-0.5">Select Network</label>
                <div className="grid grid-cols-4 gap-1">
                  {['MTN', 'Airtel', 'Glo', '9mobile'].map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setAirtimeNetwork(net)}
                      className={`py-1 rounded-lg border text-center font-bold ${
                        airtimeNetwork === net
                          ? 'bg-amber-600 text-white border-amber-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Phone Number</label>
                <input
                  type="tel"
                  value={airtimePhone}
                  onChange={(e) => setAirtimePhone(e.target.value)}
                  className="w-full h-8 bg-slate-900 text-white px-2 rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Select Amount</label>
                <div className="grid grid-cols-4 gap-1">
                  {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAirtimeAmount(amt)}
                      className={`py-1 rounded-lg border text-center font-bold ${
                        airtimeAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      ₦{amt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleExecuteAirtime}
                className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl cursor-pointer mt-1"
              >
                Recharge ₦{airtimeAmount} Airtime
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: SET UP YOUR SAVE OPTION MODAL                         */}
      {/* ============================================================ */}
      {isSavingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl text-left space-y-3 font-mono animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <PiggyBank className="w-4 h-4 text-emerald-400" />
                Set Up Your Save Option
              </span>
              <button
                type="button"
                onClick={() => setIsSavingsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-[10px] text-slate-300 leading-snug">
              saving for the future is an important aspect that can help you in difficult times that finances would be needed.
            </p>

            <div className="space-y-2.5 text-[10px]">
              <div>
                <label className="text-slate-400 block mb-0.5">Select Savings Plan Type</label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setSavingsPlanType('safelock')}
                    className={`py-1.5 px-1 rounded-xl border text-center font-bold ${
                      savingsPlanType === 'safelock'
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    <div>SafeLock</div>
                    <div className="text-[7.5px] opacity-80">15.5% p.a.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSavingsPlanType('emergency')}
                    className={`py-1.5 px-1 rounded-xl border text-center font-bold ${
                      savingsPlanType === 'emergency'
                        ? 'bg-cyan-600 text-white border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    <div>Emergency</div>
                    <div className="text-[7.5px] opacity-80">Instant Rainy</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSavingsPlanType('target')}
                    className={`py-1.5 px-1 rounded-xl border text-center font-bold ${
                      savingsPlanType === 'target'
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    <div>Target Goal</div>
                    <div className="text-[7.5px] opacity-80">Custom Vault</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Target Savings Goal (NGN)</label>
                <input
                  type="number"
                  value={savingsTargetAmount}
                  onChange={(e) => setSavingsTargetAmount(e.target.value)}
                  className="w-full h-8 bg-slate-900 text-emerald-400 font-bold px-2 rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Automated Frequency</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setSavingsFrequency(freq)}
                      className={`py-1 rounded-lg border text-center uppercase font-bold text-[8.5px] ${
                        savingsFrequency === freq
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Funding Source</label>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[9px]">
                  <span>{currentActive.bankName}</span>
                  <span className="text-emerald-400">Bal: ₦{currentActive.balance.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  try {
                    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
                  } catch {}
                  setIsSavingsModalOpen(false);
                  alert(`✅ Save Option Activated! Target goal of ₦${parseFloat(savingsTargetAmount).toLocaleString()} set with automated ${savingsFrequency} deductions.`);
                }}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl cursor-pointer mt-1"
              >
                Activate Save Option Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: LINK NEW BANK ACCOUNT MODAL                           */}
      {/* ============================================================ */}
      {isLinkBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl text-left space-y-3 font-mono animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-cyan-400" />
                Link Nigerian Bank Account
              </span>
              <button
                type="button"
                onClick={() => setIsLinkBankModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[10px]">
              <div>
                <label className="text-slate-400 block mb-0.5">Select Financial Institution</label>
                <select
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full h-8 bg-slate-900 text-white px-2 rounded-xl border border-slate-800"
                >
                  <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                  <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                  <option value="Kuda Microfinance Bank">Kuda Microfinance Bank</option>
                  <option value="Keystone Bank Limited">Keystone Bank Limited</option>
                  <option value="Zenith Bank PLC">Zenith Bank PLC</option>
                  <option value="Access Bank PLC">Access Bank PLC</option>
                  <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                  <option value="OPay Digital Services">OPay Digital Services</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">10-Digit NUBAN Account</label>
                <input
                  type="text"
                  maxLength={10}
                  value={newBankAccount}
                  onChange={(e) => setNewBankAccount(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 6019284712"
                  className="w-full h-8 bg-slate-900 text-white px-2 rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Account Holder Legal Name</label>
                <input
                  type="text"
                  value={newBankResolvedName}
                  onChange={(e) => setNewBankResolvedName(e.target.value)}
                  className="w-full h-8 bg-slate-900 text-slate-300 px-2 rounded-xl border border-slate-800"
                />
              </div>

              <button
                type="button"
                onClick={handleAddLinkedBank}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl cursor-pointer mt-1"
              >
                Confirm & Link Account to Watch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
