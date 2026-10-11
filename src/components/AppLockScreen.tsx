import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  ScanFace,
  Lock,
  Unlock,
  KeyRound,
  Delete,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  UserPlus,
  LogIn,
  CreditCard,
  Camera,
  Activity,
  Check,
  Loader2,
  ArrowRight,
  Shield,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  Watch,
  User,
  MapPin,
  Globe,
  RotateCcw,
} from 'lucide-react';

interface AppLockScreenProps {
  onUnlock: (authenticatedUser?: {
    name: string;
    email: string;
    nin: string;
    phone?: string;
    passcode?: string;
    paymentPassword?: string;
  }) => void;
  userEmail?: string;
  userName?: string;
  defaultMode?: 'login' | 'signin';
  isEmbeddedWatch?: boolean;
  currentPasscode?: string;
  currentPaymentPassword?: string;
}

// Tactical Web Audio sound effects
const playAuthSound = (type: 'beep' | 'success' | 'fail' | 'scan') => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === 'scan') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } else if (type === 'success') {
      const now = ctx.currentTime;
      [1046.5, 1318.51, 1567.98].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.31);
      });
    } else if (type === 'fail') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.setValueAtTime(110, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    }
  } catch {
    // Ignore audio context errors in restricted environments
  }
};

export const COUNTRY_CODES = [
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', defaultLength: 10, currency: 'NGN' },
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸', defaultLength: 10, currency: 'USD' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', defaultLength: 10, currency: 'GBP' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭', defaultLength: 9, currency: 'GHS' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', defaultLength: 9, currency: 'KES' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', defaultLength: 9, currency: 'ZAR' },
];

export const REGISTERED_NUMBERS = [
  '8109118552',
  '8031234567',
  '7012345678',
  '9012345678',
  '8123456789',
];

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  onUnlock,
  userEmail = 'osagiedejoshua024@gmail.com',
  userName = 'Col. Osagiede Joshua',
  defaultMode = 'login',
  isEmbeddedWatch = false,
  currentPasscode = '',
  currentPaymentPassword = '',
}) => {
  // Mode Selection: Login (Registration of New Account) vs Sign In (Existing Registered Member Access)
  const [mode, setMode] = useState<'login' | 'signin'>(defaultMode);

  // Watch Screen Form Factor Toggle (Wear OS circular vs Apple watchOS curved rect)
  const [watchShape, setWatchShape] = useState<'wear_os' | 'watch_os'>('wear_os');

  // Shared Country code & Mobile number
  const [countryCode, setCountryCode] = useState<string>('+234');
  const [mobileNumber, setMobileNumber] = useState<string>('8109118552');

  // ==========================================
  // FLOW 1: LOGIN (New Account Onboarding)
  // Step 1: Phone + Country Code
  // Step 2: Full Name, Country, State/Region, Address, Postal Code (optional)
  // Step 3: NIN (16+) or BVN (18+) selection + 11-digit input
  // Step 4: Govt Verification Check (❌ / 🚫 vs 💯)
  // Step 5: Live Facial Recognition Match
  // Step 6: 6-digit Login Password creation & re-input confirmation
  // Step 7: Payment Setup Password (4 or 6-digit transaction PIN) creation & confirmation
  // Step 8: Nickname + Email input
  // ==========================================
  const [loginStep, setLoginStep] = useState<number>(1);
  const [loginFullName, setLoginFullName] = useState<string>('Col. Osagiede Joshua');
  const [loginCountry, setLoginCountry] = useState<string>('Nigeria');
  const [loginState, setLoginState] = useState<string>('Lagos State');
  const [loginAddress, setLoginAddress] = useState<string>('Plot 14 Admiralty Way, Lekki Phase 1');
  const [loginPostalCode, setLoginPostalCode] = useState<string>('105102');

  // ID Selection: NIN (16+) or BVN (18+)
  const [loginIdType, setLoginIdType] = useState<'nin' | 'bvn'>('nin');
  const [loginIdNumber, setLoginIdNumber] = useState<string>('84910294819');

  // Govt Database Verification Simulation
  const [isVerifyingGovtId, setIsVerifyingGovtId] = useState<boolean>(false);
  const [govtVerificationStatus, setGovtVerificationStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  // Facial Recognition States
  const [isFaceScanning, setIsFaceScanning] = useState<boolean>(false);
  const [faceScanProgress, setFaceScanProgress] = useState<number>(0);
  const [faceScanMatched, setFaceScanMatched] = useState<boolean | null>(null);

  // 6-Digit Login Passcode & Confirmation (Step 6)
  const [firstPasscode, setFirstPasscode] = useState<string>('');
  const [confirmPasscode, setConfirmPasscode] = useState<string>('');
  const [passcodePhase, setPasscodePhase] = useState<'first' | 'confirm'>('first');
  const [verifiedPasscode, setVerifiedPasscode] = useState<string>('');

  // Payment Setup Password & Confirmation (Step 7) - Strictly 4-digit PIN (ATM / POS Standard)
  const paymentPinLength = 4;
  const [firstPaymentPin, setFirstPaymentPin] = useState<string>('');
  const [confirmPaymentPin, setConfirmPaymentPin] = useState<string>('');
  const [paymentPinPhase, setPaymentPinPhase] = useState<'first' | 'confirm'>('first');
  const [verifiedPaymentPin, setVerifiedPaymentPin] = useState<string>('');

  // Final Profile details (Step 8)
  const [loginNickname, setLoginNickname] = useState<string>('Commander Jay');
  const [loginEmail, setLoginEmail] = useState<string>(userEmail);

  // ==========================================
  // FLOW 2: SIGN IN (Existing Account Access)
  // Step 1: Phone Number + Country Code (Checks if registered)
  // Step 2: 6-Digit existing login code check
  // Step 3: Face Authentication / Verification match
  // ==========================================
  const [signinStep, setSigninStep] = useState<number>(1);
  const [signinPasscode, setSigninPasscode] = useState<string>('');
  const [signinError, setSigninError] = useState<string | null>(null);
  const [signinFaceScanning, setSigninFaceScanning] = useState<boolean>(false);
  const [signinFaceMatched, setSigninFaceMatched] = useState<boolean | null>(null);

  // Common UI Feedback
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Clear toast after delay
  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  // Keypad Helper for 6-Digit Login Passcode on smartwatch
  const handlePasscodeDigit = (digit: string, target: 'first' | 'confirm' | 'signin') => {
    playAuthSound('beep');
    if (target === 'first') {
      if (firstPasscode.length < 6) {
        const next = firstPasscode + digit;
        setFirstPasscode(next);
        if (next.length === 6) {
          setTimeout(() => setPasscodePhase('confirm'), 250);
        }
      }
    } else if (target === 'confirm') {
      if (confirmPasscode.length < 6) {
        const next = confirmPasscode + digit;
        setConfirmPasscode(next);
        if (next.length === 6) {
          if (next === firstPasscode) {
            playAuthSound('success');
            setVerifiedPasscode(next);
            try {
              localStorage.setItem('kudipulse_app_passcode', next);
            } catch {
              // ignore
            }
            // Move directly to Step 7: Payment Setup Password
            setTimeout(() => setLoginStep(7), 350);
          } else {
            playAuthSound('fail');
            setErrorToast('❌ Codes do not match! Please re-enter.');
            setTimeout(() => {
              setConfirmPasscode('');
              setPasscodePhase('first');
              setFirstPasscode('');
            }, 900);
          }
        }
      }
    } else if (target === 'signin') {
      if (signinPasscode.length < 6) {
        const next = signinPasscode + digit;
        setSigninPasscode(next);
        setSigninError(null);
        if (next.length === 6) {
          // Strictly resolve stored passcode (purging old defaults like 200007)
          let targetCode = currentPasscode || '';
          try {
            const ls = localStorage.getItem('kudipulse_app_passcode');
            if (ls && ls !== '200007' && ls !== '709240' && ls !== '000000' && ls !== '2468') {
              targetCode = ls;
            }
          } catch {
            // ignore
          }

          if (targetCode) {
            // Match against user's custom created passcode
            if (next === targetCode) {
              playAuthSound('success');
              setVerifiedPasscode(next);
              setTimeout(() => setSigninStep(3), 300);
            } else {
              playAuthSound('fail');
              setSigninError('❌ Passcode incorrect. Try again.');
              setTimeout(() => setSigninPasscode(''), 800);
            }
          } else {
            // No default password exists - whatever 6-digit code user logs in with becomes their app passcode!
            playAuthSound('success');
            setVerifiedPasscode(next);
            try {
              localStorage.setItem('kudipulse_app_passcode', next);
            } catch {
              // ignore
            }
            setTimeout(() => setSigninStep(3), 300);
          }
        }
      }
    }
  };

  const handlePasscodeDelete = (target: 'first' | 'confirm' | 'signin') => {
    playAuthSound('beep');
    if (target === 'first') setFirstPasscode((prev) => prev.slice(0, -1));
    else if (target === 'confirm') setConfirmPasscode((prev) => prev.slice(0, -1));
    else if (target === 'signin') setSigninPasscode((prev) => prev.slice(0, -1));
  };

  // Payment Setup Password Handlers (Step 7)
  const handlePaymentPinDigit = (digit: string) => {
    playAuthSound('beep');
    if (paymentPinPhase === 'first') {
      if (firstPaymentPin.length < paymentPinLength) {
        const next = firstPaymentPin + digit;
        setFirstPaymentPin(next);
        if (next.length === paymentPinLength) {
          setTimeout(() => setPaymentPinPhase('confirm'), 250);
        }
      }
    } else if (paymentPinPhase === 'confirm') {
      if (confirmPaymentPin.length < paymentPinLength) {
        const next = confirmPaymentPin + digit;
        setConfirmPaymentPin(next);
        if (next.length === paymentPinLength) {
          if (next === firstPaymentPin) {
            playAuthSound('success');
            setVerifiedPaymentPin(next);
            try {
              localStorage.setItem('kudipulse_payment_password', next);
            } catch {
              // ignore
            }
            setTimeout(() => setLoginStep(8), 350);
          } else {
            playAuthSound('fail');
            setErrorToast('❌ Payment PINs do not match! Please re-enter.');
            setTimeout(() => {
              setConfirmPaymentPin('');
              setPaymentPinPhase('first');
              setFirstPaymentPin('');
            }, 900);
          }
        }
      }
    }
  };

  const handlePaymentPinDelete = () => {
    playAuthSound('beep');
    if (paymentPinPhase === 'first') setFirstPaymentPin((prev) => prev.slice(0, -1));
    else setConfirmPaymentPin((prev) => prev.slice(0, -1));
  };

  const handlePaymentPinClear = () => {
    playAuthSound('beep');
    if (paymentPinPhase === 'first') setFirstPaymentPin('');
    else setConfirmPaymentPin('');
  };

  // ------------------------------------------
  // FLOW 1 HANDLERS (LOGIN / REGISTRATION)
  // ------------------------------------------
  const handleLoginStep1Next = () => {
    const cleaned = mobileNumber.replace(/\D/g, '');
    if (cleaned.length < 8) {
      playAuthSound('fail');
      setErrorToast('Please enter a valid phone number');
      return;
    }
    playAuthSound('beep');
    setLoginStep(2);
  };

  const handleLoginStep2Next = () => {
    if (!loginFullName.trim()) {
      playAuthSound('fail');
      setErrorToast('Please enter your full legal name');
      return;
    }
    if (!loginState.trim() || !loginAddress.trim()) {
      playAuthSound('fail');
      setErrorToast('Please input State and Address');
      return;
    }
    playAuthSound('beep');
    setLoginStep(3);
  };

  const handleLoginStep3Next = () => {
    const cleaned = loginIdNumber.replace(/\D/g, '');
    if (cleaned.length !== 11) {
      playAuthSound('fail');
      setErrorToast(`Please enter an 11-digit ${loginIdType.toUpperCase()}`);
      return;
    }
    playAuthSound('scan');
    setLoginStep(4);
    setIsVerifyingGovtId(true);
    setGovtVerificationStatus('idle');

    // Simulate Government Database Approval (NIMC / NIBSS)
    setTimeout(() => {
      setIsVerifyingGovtId(false);
      // If ends with 0000 simulate failure for test, else approve
      if (cleaned === '00000000000') {
        playAuthSound('fail');
        setGovtVerificationStatus('failed');
      } else {
        playAuthSound('success');
        setGovtVerificationStatus('success');
        setTimeout(() => {
          setLoginStep(5);
          triggerLoginFaceScan();
        }, 1200);
      }
    }, 1500);
  };

  const triggerLoginFaceScan = () => {
    setIsFaceScanning(true);
    setFaceScanProgress(15);
    setFaceScanMatched(null);
    playAuthSound('scan');

    const interval = setInterval(() => {
      setFaceScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setIsFaceScanning(false);
          setFaceScanProgress(100);
          setFaceScanMatched(true);
          playAuthSound('success');
          setTimeout(() => {
            setLoginStep(6);
          }, 1100);
          return 100;
        }
        return prev + 20;
      });
    }, 280);
  };

  const handleLoginComplete = () => {
    if (!loginNickname.trim() || !loginEmail.trim()) {
      playAuthSound('fail');
      setErrorToast('Please enter nickname and email');
      return;
    }
    const finalCode = firstPasscode || verifiedPasscode;
    const finalPayment = firstPaymentPin || verifiedPaymentPin;
    try {
      if (finalCode) {
        localStorage.setItem('kudipulse_app_passcode', finalCode);
      }
      if (finalPayment) {
        localStorage.setItem('kudipulse_payment_password', finalPayment);
      }
    } catch {
      // ignore
    }
    playAuthSound('success');
    onUnlock({
      name: loginFullName,
      email: loginEmail,
      nin: loginIdNumber,
      phone: `${countryCode} ${mobileNumber}`,
      passcode: finalCode,
      paymentPassword: finalPayment,
    });
  };

  // ------------------------------------------
  // FLOW 2 HANDLERS (SIGN IN / RETURNING MEMBER)
  // ------------------------------------------
  const handleSigninStep1Next = () => {
    const cleaned = mobileNumber.replace(/\D/g, '');
    if (cleaned.length < 8) {
      playAuthSound('fail');
      setErrorToast('Please enter a valid phone number');
      return;
    }

    // Check if phone number is registered to this app
    const isRegistered =
      REGISTERED_NUMBERS.includes(cleaned) ||
      cleaned === '8109118552' ||
      cleaned.endsWith('8552') ||
      cleaned.length >= 10; // Allow test numbers

    if (!isRegistered) {
      playAuthSound('fail');
      setErrorToast('❌ Number is not registered to this app. Please try again or switch to Login.');
      return;
    }

    playAuthSound('beep');
    setSigninStep(2);
    setSigninPasscode('');
    setSigninError(null);
  };

  const triggerSigninFaceScan = () => {
    setSigninFaceScanning(true);
    setSigninFaceMatched(null);
    playAuthSound('scan');

    setTimeout(() => {
      setSigninFaceScanning(false);
      setSigninFaceMatched(true);
      playAuthSound('success');
      const finalCode = verifiedPasscode || signinPasscode;
      let existingPaymentPin = '';
      try {
        if (finalCode) {
          localStorage.setItem('kudipulse_app_passcode', finalCode);
        }
        existingPaymentPin = localStorage.getItem('kudipulse_payment_password') || '';
      } catch {
        // ignore
      }
      setTimeout(() => {
        onUnlock({
          name: userName,
          email: userEmail,
          nin: '84910294819',
          phone: `${countryCode} ${mobileNumber}`,
          passcode: finalCode,
          paymentPassword: existingPaymentPin || finalCode,
        });
      }, 1000);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-3 select-none overflow-y-auto">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Outer Watch Controller Toolbar */}
      <div className="flex items-center gap-2 mb-2 z-10">
        {/* Switch Mode: Login vs Sign In */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginStep(1);
              setErrorToast(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              mode === 'login'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3 h-3" />
            <span>Login (New)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setSigninStep(1);
              setErrorToast(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              mode === 'signin'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3 h-3" />
            <span>Sign In (Existing)</span>
          </button>
        </div>

        {/* Watch Shape: Wear OS (Circle) vs Apple Watch (Curved Rect) */}
        <button
          type="button"
          onClick={() => setWatchShape(watchShape === 'wear_os' ? 'watch_os' : 'wear_os')}
          className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1 cursor-pointer"
          title="Toggle Smartwatch Case Geometry"
        >
          <Watch className="w-3 h-3 text-cyan-400" />
          <span>{watchShape === 'wear_os' ? 'Wear OS (Circle)' : 'Apple (Curved)'}</span>
        </button>
      </div>

      {/* Toast Overlay */}
      {errorToast && (
        <div className="absolute top-4 z-50 px-3 py-1.5 rounded-xl bg-red-950/90 border border-red-800 text-red-200 text-xs font-mono font-bold shadow-xl animate-in fade-in flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* SMARTWATCH HARDWARE CHASSIS CONTAINER                         */}
      {/* Exact physical dimensions of smartwatch: 288px × 288px         */}
      {/* ============================================================ */}
      <div className="relative">
        {/* Top Strap */}
        <div className="w-28 h-5 bg-gradient-to-b from-slate-900 to-slate-800 mx-auto rounded-t-xl border-t border-x border-slate-700/60 opacity-90" />

        {/* Watch Body Frame */}
        <div
          className={`relative p-3 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-2xl border-4 ${
            watchShape === 'wear_os'
              ? 'w-72 h-72 rounded-full border-slate-700'
              : 'w-68 h-80 rounded-[38px] border-slate-600'
          } flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ring-2 ring-emerald-500/30`}
        >
          {/* Smartwatch Top Bezel Header */}
          <div className="absolute top-2 inset-x-0 px-6 flex items-center justify-between text-[8.5px] text-slate-400 font-mono z-20 pointer-events-none">
            <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>KudiPulse</span>
            </span>
            <span className="text-slate-400">12:00</span>
            <span className="text-[8px] font-bold text-cyan-400 uppercase">
              {mode === 'login' ? `L-0${loginStep}` : `S-0${signinStep}`}
            </span>
          </div>

          {/* ========================================================== */}
          {/* SMARTWATCH SCREEN VIEWPORT (Scrollable, Tactile, Compact)  */}
          {/* ========================================================== */}
          <div
            className={`w-full h-full flex flex-col items-center justify-center pt-5 pb-3 px-3 text-center overflow-y-auto scrollbar-none ${
              watchShape === 'wear_os' ? 'rounded-full' : 'rounded-[30px]'
            }`}
          >
            {/* ======================================================== */}
            {/* 1. LOGIN FLOW (NEW OPERATOR REGISTRATION)                */}
            {/* ======================================================== */}
            {mode === 'login' && (
              <div className="w-full flex flex-col items-center justify-between min-h-full">
                {/* STEP 1: Phone Number + Country Code */}
                {loginStep === 1 && (
                  <div className="w-full space-y-1.5 flex flex-col items-center my-auto">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      Step 1: Input Number
                    </span>
                    <p className="text-[8.5px] text-slate-400 leading-tight">
                      Select country code & enter mobile number
                    </p>

                    <div className="w-full space-y-1 pt-1">
                      {/* Country Code Selector */}
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full bg-slate-950 text-white font-mono text-[10px] px-2 py-1 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code} ({c.country.split(' ')[0]})
                          </option>
                        ))}
                      </select>

                      {/* Phone Number Input */}
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="810 911 8552"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-950 text-emerald-300 font-mono font-bold text-center text-xs px-2 py-1.5 rounded-lg border border-emerald-800/80 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>
                    </div>

                    {/* Next Button Under */}
                    <button
                      type="button"
                      onClick={handleLoginStep1Next}
                      className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* STEP 2: Name, Country, State/Region, Address, Postal Code */}
                {loginStep === 2 && (
                  <div className="w-full space-y-1 flex flex-col items-center my-auto text-left">
                    <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider font-mono text-center w-full">
                      Step 2: Names & Address
                    </span>
                    <p className="text-[7.5px] text-slate-400 text-center w-full">
                      Scroll down to fill address details
                    </p>

                    {/* Scrollable Mini Form */}
                    <div className="w-full max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin text-[8.5px]">
                      <div>
                        <label className="text-slate-400 block font-semibold text-[8px]">Legal Full Names</label>
                        <input
                          type="text"
                          placeholder="e.g. Osagiede Joshua"
                          value={loginFullName}
                          onChange={(e) => setLoginFullName(e.target.value)}
                          className="w-full bg-slate-950 text-white text-[9px] px-1.5 py-1 rounded border border-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block font-semibold text-[8px]">Country</label>
                        <input
                          type="text"
                          value={loginCountry}
                          onChange={(e) => setLoginCountry(e.target.value)}
                          className="w-full bg-slate-950 text-white text-[9px] px-1.5 py-1 rounded border border-slate-800 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block font-semibold text-[8px]">State or Region</label>
                        <input
                          type="text"
                          placeholder="e.g. Lagos State"
                          value={loginState}
                          onChange={(e) => setLoginState(e.target.value)}
                          className="w-full bg-slate-950 text-white text-[9px] px-1.5 py-1 rounded border border-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block font-semibold text-[8px]">Street Address</label>
                        <input
                          type="text"
                          placeholder="e.g. 14 Admiralty Way"
                          value={loginAddress}
                          onChange={(e) => setLoginAddress(e.target.value)}
                          className="w-full bg-slate-950 text-white text-[9px] px-1.5 py-1 rounded border border-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block font-semibold text-[8px]">Postal Code (Optional)</label>
                        <input
                          type="text"
                          placeholder="105102 (Optional)"
                          value={loginPostalCode}
                          onChange={(e) => setLoginPostalCode(e.target.value)}
                          className="w-full bg-slate-950 text-slate-300 text-[9px] px-1.5 py-1 rounded border border-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Next Button Under */}
                    <div className="w-full flex items-center gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setLoginStep(1)}
                        className="py-1 px-2 bg-slate-900 text-slate-400 rounded-lg text-[9px] font-bold"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleLoginStep2Next}
                        className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9.5px] rounded-lg transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Select between NIN (+16) or BVN (+18) */}
                {loginStep === 3 && (
                  <div className="w-full space-y-1.5 flex flex-col items-center my-auto">
                    <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      Step 3: Identity Document
                    </span>
                    <p className="text-[8px] text-slate-400 leading-tight">
                      BVN for +18 yrs • NIN allows +16 yrs
                    </p>

                    {/* Toggle Choice */}
                    <div className="w-full grid grid-cols-2 gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setLoginIdType('nin')}
                        className={`py-1 rounded text-[9px] font-bold transition-all cursor-pointer ${
                          loginIdType === 'nin'
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>NIN (+16 yrs)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginIdType('bvn')}
                        className={`py-1 rounded text-[9px] font-bold transition-all cursor-pointer ${
                          loginIdType === 'bvn'
                            ? 'bg-cyan-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>BVN (+18 yrs)</span>
                      </button>
                    </div>

                    {/* Digits Input */}
                    <div className="w-full space-y-0.5">
                      <span className="text-[8px] text-slate-400 font-mono block">
                        Input 11-digit {loginIdType.toUpperCase()}:
                      </span>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder={loginIdType === 'nin' ? '84910294819' : '22349018247'}
                        value={loginIdNumber}
                        onChange={(e) => setLoginIdNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-950 text-white font-mono text-center font-bold tracking-widest text-xs py-1 rounded-lg border border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>

                    {/* Next Button Under */}
                    <div className="w-full flex items-center gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setLoginStep(2)}
                        className="py-1 px-2 bg-slate-900 text-slate-400 rounded-lg text-[9px] font-bold"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleLoginStep3Next}
                        className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9.5px] rounded-lg transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Verify & Next</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Govt Verification Check (❌ / 🚫 vs 💯) */}
                {loginStep === 4 && (
                  <div className="w-full space-y-1.5 flex flex-col items-center my-auto">
                    <span className="text-[9.5px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                      Step 4: Government Check
                    </span>

                    {isVerifyingGovtId ? (
                      <div className="flex flex-col items-center justify-center py-2 space-y-1">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                        <span className="text-[9px] font-mono text-slate-300">
                          Querying {loginCountry} Database...
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono">
                          Validating {loginIdType.toUpperCase()} {loginIdNumber.slice(0, 4)}••••••
                        </span>
                      </div>
                    ) : govtVerificationStatus === 'success' ? (
                      <div className="flex flex-col items-center justify-center py-1 space-y-1 animate-in zoom-in-75">
                        <span className="text-3xl">💯</span>
                        <span className="text-[10px] font-bold text-emerald-400 font-mono">
                          APPROVED & VERIFIED!
                        </span>
                        <span className="text-[8px] text-slate-400">
                          Government identity clearance confirmed
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-1 space-y-1">
                        <span className="text-3xl">❌ 🚫</span>
                        <span className="text-[10px] font-bold text-red-400 font-mono">
                          NOT APPROVED / INVALID!
                        </span>
                        <button
                          type="button"
                          onClick={() => setLoginStep(3)}
                          className="mt-1 px-3 py-1 bg-red-950 border border-red-800 text-red-300 text-[9px] rounded font-bold"
                        >
                          Retry {loginIdType.toUpperCase()}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 5: Live Facial Recognition Match */}
                {loginStep === 5 && (
                  <div className="w-full space-y-1 flex flex-col items-center my-auto">
                    <span className="text-[9.5px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                      Step 5: Face Match
                    </span>

                    {/* Camera Target Circle */}
                    <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-cyan-400 flex flex-col items-center justify-center overflow-hidden my-1">
                      {isFaceScanning && (
                        <div className="absolute inset-x-0 h-0.5 bg-cyan-400 animate-[bounce_1.5s_infinite] shadow-md shadow-cyan-400" />
                      )}
                      {faceScanMatched === true ? (
                        <span className="text-2xl animate-in zoom-in">💯</span>
                      ) : (
                        <ScanFace className={`w-10 h-10 ${isFaceScanning ? 'text-cyan-300 animate-pulse' : 'text-slate-500'}`} />
                      )}
                    </div>

                    <span className="text-[8.5px] font-mono text-slate-300">
                      {isFaceScanning
                        ? `Matching with ${loginIdType.toUpperCase()}... (${faceScanProgress}%)`
                        : faceScanMatched === true
                        ? 'Face Verified 100% Match!'
                        : 'Align face in camera reticle'}
                    </span>

                    {faceScanMatched === false && (
                      <button
                        type="button"
                        onClick={triggerLoginFaceScan}
                        className="px-2 py-0.5 bg-red-950 text-red-300 text-[8px] rounded border border-red-800"
                      >
                        Retry Face Scan
                      </button>
                    )}
                  </div>
                )}

                {/* STEP 6: 6-Digit Passcode & Confirmation Re-Input */}
                {loginStep === 6 && (
                  <div className="w-full space-y-1 flex flex-col items-center my-auto">
                    <span className="text-[9.5px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                      Step 6: {passcodePhase === 'first' ? 'Place 6-Digit Code' : 'Re-input To Confirm'}
                    </span>

                    {/* 6 Dots Display */}
                    <div className="flex items-center gap-1.5 py-1">
                      {Array.from({ length: 6 }).map((_, i) => {
                        const val = passcodePhase === 'first' ? firstPasscode : confirmPasscode;
                        const filled = i < val.length;
                        return (
                          <div
                            key={i}
                            className={`w-3.5 h-4 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                              filled
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-900 border border-slate-800 text-slate-600'
                            }`}
                          >
                            {filled ? '•' : ''}
                          </div>
                        );
                      })}
                    </div>

                    {/* Watch Keypad Grid */}
                    <div className="grid grid-cols-3 gap-1 w-full max-w-[190px]">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => handlePasscodeDigit(digit, passcodePhase)}
                          className="h-6 rounded bg-slate-950 hover:bg-slate-800 text-white font-mono text-xs font-bold border border-slate-800"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          if (passcodePhase === 'first') setFirstPasscode('');
                          else setConfirmPasscode('');
                        }}
                        className="h-6 rounded bg-slate-950 text-slate-500 font-mono text-[8px]"
                      >
                        C
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePasscodeDigit('0', passcodePhase)}
                        className="h-6 rounded bg-slate-950 text-white font-mono text-xs font-bold border border-slate-800"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePasscodeDelete(passcodePhase)}
                        className="h-6 rounded bg-slate-950 text-slate-400 hover:text-red-400 flex items-center justify-center border border-slate-800"
                      >
                        <Delete className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-[7.5px] text-slate-500 font-mono">
                      {passcodePhase === 'first' ? 'Enter 6 digits code' : 'Re-enter same code'}
                    </span>
                  </div>
                )}

                {/* STEP 7: Payment Setup Password (Strictly 4-Digit PIN) */}
                {loginStep === 7 && (
                  <div className="w-full space-y-1 flex flex-col items-center my-auto">
                    <span className="text-[9.5px] font-bold text-teal-400 uppercase tracking-wider font-mono flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-teal-400" />
                      Step 7: 4-Digit Payment PIN
                    </span>

                    {/* Strictly 4-Digit Indicator Badge */}
                    <div className="flex items-center gap-1.5 my-0.5 px-2 py-0.5 rounded-full bg-teal-950/80 border border-teal-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                      <span className="text-[8.5px] font-mono font-bold text-teal-300">
                        4-Digit PIN (ATM / POS Standard)
                      </span>
                    </div>

                    {/* 4 PIN Dots Display */}
                    <div className="flex items-center gap-2 py-0.5">
                      {[0, 1, 2, 3].map((i) => {
                        const val = paymentPinPhase === 'first' ? firstPaymentPin : confirmPaymentPin;
                        const filled = i < val.length;
                        return (
                          <div
                            key={i}
                            className={`w-3.5 h-4 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                              filled
                                ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/50'
                                : 'bg-slate-900 border border-slate-800 text-slate-600'
                            }`}
                          >
                            {filled ? '•' : ''}
                          </div>
                        );
                      })}
                    </div>

                    {/* Watch Keypad Grid */}
                    <div className="grid grid-cols-3 gap-1 w-full max-w-[190px]">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => handlePaymentPinDigit(digit)}
                          className="h-6 rounded bg-slate-950 hover:bg-slate-800 text-white font-mono text-xs font-bold border border-slate-800"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handlePaymentPinClear}
                        className="h-6 rounded bg-slate-950 text-slate-500 font-mono text-[8px]"
                      >
                        C
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePaymentPinDigit('0')}
                        className="h-6 rounded bg-slate-950 text-white font-mono text-xs font-bold border border-slate-800"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handlePaymentPinDelete}
                        className="h-6 rounded bg-slate-950 text-slate-400 hover:text-red-400 flex items-center justify-center border border-slate-800"
                      >
                        <Delete className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-[7.5px] text-teal-400/90 font-mono">
                      {paymentPinPhase === 'first'
                        ? 'Enter 4-digit payment PIN'
                        : 'Re-enter same 4-digit PIN to confirm'}
                    </span>
                  </div>
                )}

                {/* STEP 8: Nickname + Email Address */}
                {loginStep === 8 && (
                  <div className="w-full space-y-1.5 flex flex-col items-center my-auto">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      Step 8: Nickname & Email
                    </span>
                    <span className="text-xl">💯 Good to go!</span>

                    <div className="w-full space-y-1 text-left text-[8px]">
                      <div>
                        <label className="text-slate-400 block font-semibold">Nickname</label>
                        <input
                          type="text"
                          placeholder="e.g. Commander Jay"
                          value={loginNickname}
                          onChange={(e) => setLoginNickname(e.target.value)}
                          className="w-full bg-slate-950 text-white text-[9px] px-2 py-1 rounded border border-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block font-semibold">Email Address</label>
                        <input
                          type="email"
                          placeholder="joshua@gmail.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full bg-slate-950 text-white text-[9px] px-2 py-1 rounded border border-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Final Finish Button */}
                    <button
                      type="button"
                      onClick={handleLoginComplete}
                      className="w-full mt-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Complete Login & Enter</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* 2. SIGN IN FLOW (EXISTING MEMBER ACCESS)                 */}
            {/* ======================================================== */}
            {mode === 'signin' && (
              <div className="w-full flex flex-col items-center justify-between min-h-full">
                {/* STEP 1: Input Phone Number + Country Code Check */}
                {signinStep === 1 && (
                  <div className="w-full space-y-1.5 flex flex-col items-center my-auto">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                      Sign In: Phone Number
                    </span>
                    <p className="text-[8.5px] text-slate-400 leading-tight">
                      Input your already registered mobile number
                    </p>

                    <div className="w-full space-y-1 pt-1">
                      {/* Country Code */}
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full bg-slate-950 text-white font-mono text-[10px] px-2 py-1 rounded-lg border border-slate-800 focus:outline-none"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code} ({c.country.split(' ')[0]})
                          </option>
                        ))}
                      </select>

                      {/* Phone Number Input */}
                      <input
                        type="tel"
                        placeholder="810 911 8552"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-950 text-cyan-300 font-mono font-bold text-center text-xs px-2 py-1.5 rounded-lg border border-cyan-800/80 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSigninStep1Next}
                      className="w-full mt-2 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] rounded-lg transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Check Number & Next</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* STEP 2: Input Already Login Codes (6 Digit) */}
                {signinStep === 2 && (
                  <div className="w-full space-y-1 flex flex-col items-center my-auto">
                    <span className="text-[9.5px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                      Sign In: 6-Digit Passcode
                    </span>
                    <p className="text-[8px] text-slate-400">
                      Enter code for {countryCode} {mobileNumber}
                    </p>

                    {/* 6 Dots */}
                    <div className="flex items-center gap-1.5 py-0.5">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3.5 h-4 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                            i < signinPasscode.length
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-900 border border-slate-800 text-slate-600'
                          }`}
                        >
                          {i < signinPasscode.length ? '•' : ''}
                        </div>
                      ))}
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-1 w-full max-w-[190px]">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => handlePasscodeDigit(digit, 'signin')}
                          className="h-6 rounded bg-slate-950 hover:bg-slate-800 text-white font-mono text-xs font-bold border border-slate-800"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSigninPasscode('')}
                        className="h-6 rounded bg-slate-950 text-slate-500 font-mono text-[8px]"
                      >
                        C
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePasscodeDigit('0', 'signin')}
                        className="h-6 rounded bg-slate-950 text-white font-mono text-xs font-bold border border-slate-800"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePasscodeDelete('signin')}
                        className="h-6 rounded bg-slate-950 text-slate-400 hover:text-red-400 flex items-center justify-center border border-slate-800"
                      >
                        <Delete className="w-3 h-3" />
                      </button>
                    </div>

                    {signinError && (
                      <span className="text-[7.5px] text-red-400 font-mono block animate-pulse">
                        {signinError}
                      </span>
                    )}
                  </div>
                )}

                {/* STEP 3: Face Authentication / Verification */}
                {signinStep === 3 && (
                  <div className="w-full space-y-1.5 flex flex-col items-center my-auto">
                    <span className="text-[9.5px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                      Face Authentication
                    </span>

                    {/* Camera Target Circle */}
                    <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-cyan-400 flex flex-col items-center justify-center overflow-hidden my-1">
                      {signinFaceScanning && (
                        <div className="absolute inset-x-0 h-0.5 bg-cyan-400 animate-[bounce_1.5s_infinite] shadow-md shadow-cyan-400" />
                      )}
                      {signinFaceMatched === true ? (
                        <span className="text-2xl animate-in zoom-in">💯</span>
                      ) : (
                        <ScanFace className={`w-10 h-10 ${signinFaceScanning ? 'text-cyan-300 animate-pulse' : 'text-slate-500'}`} />
                      )}
                    </div>

                    <span className="text-[8.5px] font-mono text-slate-300">
                      {signinFaceScanning
                        ? 'Verifying face biometrics...'
                        : signinFaceMatched === true
                        ? 'Authenticated! Entering account...'
                        : 'Tap button to authenticate face'}
                    </span>

                    {!signinFaceScanning && signinFaceMatched !== true && (
                      <button
                        type="button"
                        onClick={triggerSigninFaceScan}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[9px] font-bold rounded-lg shadow-md flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Start Face Auth</span>
                      </button>
                    )}

                    {signinFaceMatched === false && (
                      <button
                        type="button"
                        onClick={triggerSigninFaceScan}
                        className="px-2 py-0.5 bg-red-950 text-red-300 text-[8px] rounded border border-red-800"
                      >
                        Please retry again
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Strap */}
        <div className="w-28 h-5 bg-gradient-to-t from-slate-900 to-slate-800 mx-auto rounded-b-xl border-b border-x border-slate-700/60 opacity-90" />
      </div>

      {/* Screen Size Metadata Callout */}
      <div className="mt-2 text-center text-[10px] font-mono text-slate-500">
        <span>Smartwatch Screen Form Factor (288px × 288px) • Dual-OS Multi-Step Onboarding</span>
      </div>
    </div>
  );
};
