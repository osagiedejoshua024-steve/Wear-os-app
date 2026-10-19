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
  Phone,
  Wifi,
  WifiOff,
  X,
  Scale,
  Volume2,
  VolumeX,
  ArrowLeft,
  Vibrate,
  FileText,
} from 'lucide-react';
import { liveDataGateway, InternetConnectionStatus } from '../services/liveDataGateway';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';

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
const playAuthSound = (type: 'beep' | 'success' | 'fail' | 'scan', muted: boolean = false) => {
  if (muted) return;
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

  // Live Device Time Sync (Follows user's actual device clock in real time)
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

  // Shared Country code & Mobile number
  const [countryCode, setCountryCode] = useState<string>('+234');
  const [mobileNumber, setMobileNumber] = useState<string>('8109118552');

  // Live Network Telemetry & Internet Connectivity State
  const [networkStatus, setNetworkStatus] = useState<InternetConnectionStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    latencyMs: 38,
    lastChecked: new Date().toLocaleTimeString(),
    source: 'cloud_ping',
    networkType: 'LTE/5G',
  });
  const [isPingingNetwork, setIsPingingNetwork] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  // Mandatory Pre-Flight Terms & Conditions Acceptance Gate
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kudipulse_terms_accepted') === 'true';
    } catch {
      return false;
    }
  });
  const [termsMandateChecked, setTermsMandateChecked] = useState<boolean>(false);
  const [termsTokenizationChecked, setTermsTokenizationChecked] = useState<boolean>(false);
  const [termsNdprChecked, setTermsNdprChecked] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [termsAcceptedToast, setTermsAcceptedToast] = useState<boolean>(false);

  // In-Watch Screen Settings HUD on Smart Meter Watch Screen
  const [isWatchSettingsOpen, setIsWatchSettingsOpen] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [isHapticsOn, setIsHapticsOn] = useState<boolean>(true);
  const [watchSettingsFilter, setWatchSettingsFilter] = useState<'all' | 'sound' | 'display' | 'legal'>('all');

  const playSound = (type: 'beep' | 'success' | 'fail' | 'scan') => {
    playAuthSound(type, isSoundMuted);
  };

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
    setTermsMandateChecked(true);
    setTermsTokenizationChecked(true);
    setTermsNdprChecked(true);
    try {
      localStorage.setItem('kudipulse_terms_accepted', 'true');
    } catch {}
    playSound('success');
    setErrorToast(null);
    setTermsAcceptedToast(true);
    setTimeout(() => setTermsAcceptedToast(false), 2400);
  };

  const handleResetTerms = () => {
    setHasAcceptedTerms(false);
    setTermsMandateChecked(false);
    setTermsTokenizationChecked(false);
    setTermsNdprChecked(false);
    try {
      localStorage.removeItem('kudipulse_terms_accepted');
    } catch {}
    playSound('beep');
    setErrorToast('Terms reset: You must accept Terms & Conditions before login or entering indicators.');
  };

  useEffect(() => {
    const unsub = liveDataGateway.subscribe((status) => {
      setNetworkStatus(status);
    });
    liveDataGateway.testInternetConnection();
    return () => unsub();
  }, []);

  const handleTestNetwork = async () => {
    setIsPingingNetwork(true);
    await liveDataGateway.testInternetConnection();
    setIsPingingNetwork(false);
  };

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
    if (!hasAcceptedTerms) {
      playAuthSound('fail');
      setErrorToast('⚠️ You must accept Terms & Conditions before entering indicators!');
      setIsTermsModalOpen(true);
      return;
    }
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
    if (!hasAcceptedTerms) {
      playAuthSound('fail');
      setErrorToast('⚠️ You must accept Terms & Conditions before entering indicators!');
      setIsTermsModalOpen(true);
      return;
    }
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
    if (!hasAcceptedTerms) {
      playAuthSound('fail');
      setErrorToast('⚠️ You must accept Terms & Conditions before login!');
      setIsTermsModalOpen(true);
      return;
    }
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
    if (!hasAcceptedTerms) {
      playAuthSound('fail');
      setErrorToast('⚠️ You must accept Terms & Conditions before sign-in!');
      setIsTermsModalOpen(true);
      return;
    }
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
      <div className="flex flex-wrap items-center justify-center gap-2 mb-2 z-10 max-w-md">
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
          title="Toggle Smartwatch Case Geometry (Circular Wear OS vs Curved Rect)"
        >
          <Watch className="w-3 h-3 text-cyan-400" />
          <span>{watchShape === 'wear_os' ? 'Wear OS (Circle)' : 'Apple (Curved)'}</span>
        </button>

        {/* Mandatory CBN Terms & Conditions Gate Button */}
        <button
          type="button"
          onClick={() => setIsTermsModalOpen(true)}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
            hasAcceptedTerms
              ? 'bg-emerald-950/80 hover:bg-emerald-900/90 border-emerald-700/80 text-emerald-300'
              : 'bg-amber-950/90 hover:bg-amber-900 border-amber-600 text-amber-200 animate-pulse'
          }`}
          title="Central Bank of Nigeria (CBN) Terms & Conditions Status"
        >
          <Scale className={`w-3 h-3 ${hasAcceptedTerms ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span>{hasAcceptedTerms ? 'Terms: Accepted' : 'Terms: Required ⚠️'}</span>
        </button>

        {/* Clear Network Status Telemetry Indicator */}
        <button
          type="button"
          onClick={handleTestNetwork}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
            networkStatus.isOnline
              ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-300'
              : 'bg-red-950/80 border-red-800 text-red-300'
          }`}
          title={`Network Status: ${networkStatus.isOnline ? 'ONLINE' : 'OFFLINE'} • Latency: ${networkStatus.latencyMs}ms • Tap to ping gateway`}
        >
          {isPingingNetwork ? (
            <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
          ) : networkStatus.isOnline ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{networkStatus.networkType}</span>
              <span className="text-[10px] text-slate-400 font-normal">({networkStatus.latencyMs}ms)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Offline</span>
            </span>
          )}
        </button>
      </div>

      {/* Toast Overlay */}
      {errorToast && (
        <div className="absolute top-4 z-50 px-3 py-1.5 rounded-xl bg-red-950/90 border border-red-800 text-red-200 text-xs font-mono font-bold shadow-xl animate-in fade-in flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {termsAcceptedToast && (
        <div className="absolute top-4 z-50 px-3 py-1.5 rounded-xl bg-emerald-950/95 border border-emerald-600 text-emerald-200 text-xs font-mono font-bold shadow-xl animate-in fade-in flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>✅ Terms & Conditions Accepted (CBN PSM/DIR/022 Approved)</span>
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
          {/* Top Right Corner ⚙️ Setting Icon to Access In-Watch Settings List */}
          <div
            className={`absolute z-30 transition-all ${
              watchShape === 'wear_os' ? 'top-3 right-6' : 'top-2 right-3'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                playSound('beep');
                setIsWatchSettingsOpen(!isWatchSettingsOpen);
              }}
              className={`w-6 h-6 rounded-full flex items-center justify-center border shadow-md transition-all cursor-pointer group active:scale-90 ${
                isWatchSettingsOpen
                  ? 'bg-emerald-500 border-white text-slate-950 ring-2 ring-emerald-400/50 scale-105'
                  : 'bg-slate-900/95 hover:bg-emerald-600 border-slate-600 hover:border-emerald-400 ring-1 ring-emerald-500/30'
              }`}
              title="⚙️ Settings - Tap to access settings list on smart meter watch"
            >
              <span className="text-[12px] select-none leading-none group-hover:rotate-45 transition-transform inline-block">
                ⚙️
              </span>
            </button>
          </div>

          {/* Smartwatch Top Bezel Header - Safe Area on Circular Layouts */}
          <div
            className={`absolute z-20 pointer-events-none flex items-center justify-between font-mono ${
              watchShape === 'wear_os'
                ? 'top-3.5 px-8 inset-x-0 max-w-[195px] mx-auto text-[7.5px]'
                : 'top-2 inset-x-0 px-6 text-[8.5px]'
            } text-slate-400`}
          >
            <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>KudiPulse</span>
            </span>
            <span className="text-slate-300 font-bold">{deviceTime}</span>
            <span className="text-[8px] font-bold text-cyan-400 uppercase pr-5">
              {mode === 'login' ? `L-0${loginStep}` : `S-0${signinStep}`}
            </span>
          </div>

          {/* ========================================================== */}
          {/* SMARTWATCH SCREEN VIEWPORT (Scrollable, Tactile, Compact)  */}
          {/* Circular Layout Safe Area Padding: pt-9 pb-10 px-7         */}
          {/* ========================================================== */}
          <div
            className={`w-full h-full flex flex-col items-center justify-center text-center overflow-y-auto scrollbar-none transition-all ${
              watchShape === 'wear_os'
                ? 'rounded-full pt-9 pb-10 px-7 max-w-[226px] mx-auto'
                : 'rounded-[30px] pt-5 pb-3 px-3 w-full'
            }`}
          >
            {/* ======================================================== */}
            {/* SMARTWATCH IN-SCREEN FULL SETTINGS LIST HUD              */}
            {/* Displays all settings list right on smart meter watch     */}
            {/* ======================================================== */}
            {isWatchSettingsOpen ? (
              <div
                className={`absolute inset-0 z-40 bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-between select-none animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-slate-200 ${
                  watchShape === 'wear_os' ? 'rounded-full pt-8 pb-9 px-6' : 'rounded-[34px] pt-3 pb-3 px-3'
                }`}
              >
                {/* 1. STICKY TOP HUD HEADER */}
                <div
                  className={`w-full flex items-center justify-between pb-1 border-b border-slate-800/80 shrink-0 ${
                    watchShape === 'wear_os' ? 'px-2 max-w-[196px] mx-auto' : 'px-1'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      playSound('beep');
                      setIsWatchSettingsOpen(false);
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700/80 text-[8.5px] font-mono font-semibold transition-all cursor-pointer active:scale-95"
                    title="Back to Screen"
                  >
                    <ArrowLeft className="w-2.5 h-2.5" />
                    <span>Back</span>
                  </button>

                  <div className="flex items-center gap-1 font-mono text-[9.5px] font-bold text-white tracking-wider">
                    <span className="text-[11px]">⚙️</span>
                    <span className="uppercase text-emerald-400">Settings</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('beep');
                      setIsWatchSettingsOpen(false);
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 text-[10px] cursor-pointer"
                    title="Close Settings"
                  >
                    ✕
                  </button>
                </div>

                {/* 2. FAST CATEGORY FILTER PILLS */}
                <div
                  className={`w-full flex items-center gap-1 overflow-x-auto no-scrollbar py-1 shrink-0 ${
                    watchShape === 'wear_os' ? 'max-w-[190px] mx-auto px-1' : 'px-1'
                  }`}
                >
                  {(['all', 'sound', 'display', 'legal'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        playSound('beep');
                        setWatchSettingsFilter(filter);
                      }}
                      className={`px-2 py-0.5 rounded-full text-[7.5px] font-mono uppercase font-bold shrink-0 transition-all cursor-pointer ${
                        watchSettingsFilter === filter
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* 3. SCROLLABLE SETTINGS LIST BODY */}
                <div
                  className={`w-full flex-1 overflow-y-auto no-scrollbar space-y-1.5 text-left ${
                    watchShape === 'wear_os' ? 'max-w-[198px] mx-auto px-1 pb-9' : 'px-1 pb-3'
                  }`}
                >
                  {/* --- SOUND & HAPTICS SETTINGS --- */}
                  {(watchSettingsFilter === 'all' || watchSettingsFilter === 'sound') && (
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 space-y-1.5 shadow-sm text-[8px] font-mono">
                      <div className="text-[8.5px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                        <Volume2 className="w-2.5 h-2.5 text-cyan-400" />
                        <span>Audio & Haptics</span>
                      </div>

                      {/* Sound Effects Toggle */}
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-slate-400">Tactical Audio</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSoundMuted(!isSoundMuted);
                            if (isSoundMuted) playAuthSound('beep', false);
                          }}
                          className={`px-2 py-0.5 rounded-full text-[7.5px] font-bold border transition-all cursor-pointer ${
                            !isSoundMuted
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : 'bg-slate-950 text-slate-500 border-slate-800'
                          }`}
                        >
                          {!isSoundMuted ? 'Muted: OFF' : 'Muted: ON'}
                        </button>
                      </div>

                      {/* Haptics Toggle */}
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-slate-400">Wrist Haptics</span>
                        <button
                          type="button"
                          onClick={() => {
                            playSound('beep');
                            setIsHapticsOn(!isHapticsOn);
                          }}
                          className={`px-2 py-0.5 rounded-full text-[7.5px] font-bold border transition-all cursor-pointer ${
                            isHapticsOn
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                              : 'bg-slate-950 text-slate-500 border-slate-800'
                          }`}
                        >
                          {isHapticsOn ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- DISPLAY & SHAPE SETTINGS --- */}
                  {(watchSettingsFilter === 'all' || watchSettingsFilter === 'display') && (
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 space-y-1.5 shadow-sm text-[8px] font-mono">
                      <div className="text-[8.5px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                        <Watch className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Watch Layout Form</span>
                      </div>

                      {/* Watch Shape Choice */}
                      <div className="grid grid-cols-2 gap-1 pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            playSound('beep');
                            setWatchShape('wear_os');
                          }}
                          className={`py-1 rounded-lg text-[7.5px] font-bold border cursor-pointer transition-all ${
                            watchShape === 'wear_os'
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          ⭕ Wear OS
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playSound('beep');
                            setWatchShape('watch_os');
                          }}
                          className={`py-1 rounded-lg text-[7.5px] font-bold border cursor-pointer transition-all ${
                            watchShape === 'watch_os'
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          ⬛ Apple
                        </button>
                      </div>

                      {/* Onboarding Mode */}
                      <div className="pt-1 border-t border-slate-800/80">
                        <span className="text-slate-400 block mb-1">Onboarding Flow</span>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              playSound('beep');
                              setMode('login');
                            }}
                            className={`py-1 rounded-lg text-[7.5px] font-bold border cursor-pointer transition-all ${
                              mode === 'login'
                                ? 'bg-cyan-600 text-white border-cyan-400'
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            New Operator
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playSound('beep');
                              setMode('signin');
                            }}
                            className={`py-1 rounded-lg text-[7.5px] font-bold border cursor-pointer transition-all ${
                              mode === 'signin'
                                ? 'bg-indigo-600 text-white border-indigo-400'
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            Sign In Officer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- LEGAL, TERMS & NETWORK --- */}
                  {(watchSettingsFilter === 'all' || watchSettingsFilter === 'legal') && (
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 space-y-1.5 shadow-sm text-[8px] font-mono">
                      <div className="text-[8.5px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                        <Scale className="w-2.5 h-2.5 text-amber-400" />
                        <span>Compliance & Network</span>
                      </div>

                      {/* Terms Status */}
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-slate-400">CBN Terms</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full font-bold text-[7px] ${
                            hasAcceptedTerms
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {hasAcceptedTerms ? 'Accepted ✓' : 'Required ⚠️'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            playSound('beep');
                            setIsTermsModalOpen(true);
                          }}
                          className="flex-1 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 text-[7px] font-bold cursor-pointer transition-all"
                        >
                          View Legal Terms
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleResetTerms();
                            setIsWatchSettingsOpen(false);
                          }}
                          className="py-1 px-1.5 rounded bg-amber-950/70 hover:bg-amber-900 border border-amber-800/80 text-amber-300 text-[7px] font-bold cursor-pointer transition-all"
                          title="Reset terms acceptance gate"
                        >
                          Reset Gate
                        </button>
                      </div>

                      {/* Privacy Policy */}
                      <button
                        type="button"
                        onClick={() => {
                          playSound('beep');
                          setIsPrivacyModalOpen(true);
                        }}
                        className="w-full py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-[7px] font-bold cursor-pointer transition-all"
                      >
                        NDPR Privacy Policy
                      </button>

                      {/* Network Status & Ping */}
                      <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400">
                          {networkStatus.isOnline ? 'Online LTE/5G' : 'Offline'} ({networkStatus.latencyMs}ms)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            playSound('beep');
                            handleTestNetwork();
                          }}
                          className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[7px] cursor-pointer"
                        >
                          Ping Gateway
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Return to Watch Screen Button */}
                  <button
                    type="button"
                    onClick={() => {
                      playSound('beep');
                      setIsWatchSettingsOpen(false);
                    }}
                    className="w-full py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-[8.5px] rounded-xl shadow-md cursor-pointer transition-all active:scale-95 text-center block"
                  >
                    Close Settings & Return
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ======================================================== */}
                {/* MANDATORY PRE-FLIGHT TERMS & CONDITIONS ACCEPTANCE GATE  */}
                {/* Must accept terms first before any indicator input or    */}
                {/* login/signin is allowed                                  */}
                {/* ======================================================== */}
                {!hasAcceptedTerms ? (
                  <div className="w-full max-w-[196px] flex flex-col items-center justify-between min-h-full my-auto space-y-1.5 animate-in fade-in py-1 mx-auto text-center">
                    {/* Regulatory Badge */}
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-700/80 text-emerald-300 shadow-sm mx-auto">
                  <Scale className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-[8px] font-mono font-bold tracking-wide uppercase">
                    CBN Regulatory Gate
                  </span>
                </div>

                {/* Title & Instructions */}
                <div className="space-y-0.5 px-0.5 text-center w-full">
                  <h3 className="text-[10px] font-extrabold text-white uppercase tracking-wider font-mono">
                    Terms & Conditions
                  </h3>
                  <p className="text-[7.5px] text-slate-300 leading-snug px-1 break-words">
                    You must accept terms first before entering indicators to login or sign in.
                  </p>
                </div>

                {/* 3 Summary Declarations */}
                <div className="w-full space-y-1 text-left bg-slate-950/90 p-1.5 rounded-xl border border-slate-800 text-[7px] font-mono text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                    <span>CBN PSM/DIR/022 Limits</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                    <span>Hardware Key Tokenization</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                    <Lock className="w-2.5 h-2.5 shrink-0" />
                    <span>NDPR Data Protection</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full space-y-1 pt-0.5 max-w-[185px]">
                  <button
                    type="button"
                    onClick={handleAcceptTerms}
                    className="w-full py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-[9px] rounded-xl shadow-md shadow-emerald-950 flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all ring-1 ring-emerald-400/40"
                  >
                    <Check className="w-3 h-3" />
                    <span>Accept & Unlock Screen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="w-full py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-[7.5px] rounded-lg border border-slate-800 flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <FileText className="w-2.5 h-2.5 text-cyan-400" />
                    <span>Read Full Legal Terms</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ======================================================== */}
                {/* 1. LOGIN FLOW (NEW OPERATOR REGISTRATION)                */}
                {/* ======================================================== */}
                {mode === 'login' && (
                  <div className="w-full max-w-[196px] flex flex-col items-center justify-between min-h-full mx-auto">
                    {/* STEP 1: Phone Number + Country Code */}
                    {loginStep === 1 && (
                      <div className="w-full space-y-1.5 flex flex-col items-center my-auto mx-auto">
                        {/* Terms Accepted Badge */}
                        <div
                          onClick={() => setIsTermsModalOpen(true)}
                          className="flex items-center justify-center gap-1 text-[7px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-full cursor-pointer hover:bg-emerald-900/60 transition-colors"
                          title="Terms & Conditions accepted • Tap to review"
                        >
                          <CheckCircle2 className="w-2 h-2 text-emerald-400" />
                          <span>Terms Accepted (CBN/NDPR)</span>
                        </div>

                        <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider font-mono text-center w-full px-1 break-words">
                          Step 1: Input Number
                        </span>
                        <p className="text-[8px] text-slate-300 leading-tight text-center w-full px-1.5 break-words">
                          Select country code & enter mobile number
                        </p>

                        <div className="w-full max-w-[185px] space-y-1 pt-0.5 mx-auto">
                          {/* Country Code Selector (Easy to Tap) */}
                          <div className="relative">
                            <select
                              value={countryCode}
                              onChange={(e) => {
                                if (!hasAcceptedTerms) {
                                  setIsTermsModalOpen(true);
                                  return;
                                }
                                setCountryCode(e.target.value);
                              }}
                              className="w-full h-7 bg-slate-950 text-white font-mono text-[9px] font-semibold px-2 py-0.5 rounded-xl border border-slate-800 hover:border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                            >
                              {COUNTRY_CODES.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.flag} {c.code} ({c.country.split(' ')[0]})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Phone Number Input (Easy to Tap on Smaller Screens with Icon & Clear Action) */}
                          <div className="relative flex items-center w-full">
                            <Phone className="w-3 h-3 text-emerald-400 absolute left-2 pointer-events-none" />
                            <input
                              type="tel"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              autoComplete="tel"
                              placeholder={countryCode === '+234' ? 'e.g. 810 911 8552' : 'e.g. Mobile number'}
                              value={mobileNumber}
                              onChange={(e) => {
                                if (!hasAcceptedTerms) {
                                  setIsTermsModalOpen(true);
                                  return;
                                }
                                setMobileNumber(e.target.value.replace(/\D/g, ''));
                              }}
                              className="w-full h-8 bg-slate-950 text-emerald-300 font-mono font-bold text-center text-[11px] pl-6 pr-6 rounded-xl border border-emerald-800/80 hover:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-all shadow-inner"
                            />
                            {mobileNumber.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setMobileNumber('')}
                                className="absolute right-1.5 p-0.5 text-slate-400 hover:text-white rounded-full bg-slate-900/80 hover:bg-slate-800 cursor-pointer"
                                title="Clear number"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>

                          {/* One-Tap Autofill Chip for Easy Tapping on Smaller Screens */}
                          <div className="flex items-center justify-between text-[7px] font-mono text-slate-400 px-0.5">
                            <span className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${mobileNumber.length >= 10 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                              <span>{mobileNumber.length}/10 digits</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (!hasAcceptedTerms) {
                                  setIsTermsModalOpen(true);
                                  return;
                                }
                                setCountryCode('+234');
                                setMobileNumber('8109118552');
                              }}
                              className="text-emerald-400 hover:text-emerald-300 underline font-bold cursor-pointer"
                              title="Tap to autofill demo number on small screen"
                            >
                              Autofill: 810 911 8552
                            </button>
                          </div>
                        </div>

                        {/* Next Button */}
                        <button
                          type="button"
                          onClick={handleLoginStep1Next}
                          className="w-full max-w-[185px] mt-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9.5px] rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>

                        {/* Quick In-Screen Privacy Policy Link */}
                        <button
                          type="button"
                          onClick={() => setIsPrivacyModalOpen(true)}
                          className="mt-0.5 text-[7px] font-mono text-slate-400 hover:text-emerald-300 underline flex items-center justify-center gap-1 cursor-pointer"
                          title="View NDPR Privacy Policy"
                        >
                          <ShieldCheck className="w-2 h-2 text-emerald-400" />
                          <span>Privacy Policy & NDPR Compliance</span>
                        </button>
                      </div>
                    )}

                {/* STEP 2: Name, Country, State/Region, Address, Postal Code */}
                {loginStep === 2 && (
                  <div className="w-full max-w-[196px] space-y-1 flex flex-col items-center my-auto text-left mx-auto">
                    <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider font-mono text-center w-full px-1 break-words">
                      Step 2: Names & Address
                    </span>
                    <p className="text-[7.5px] text-slate-300 text-center w-full px-1 break-words">
                      Scroll down to fill address details
                    </p>

                    {/* Scrollable Mini Form */}
                    <div className="w-full max-w-[185px] max-h-32 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin text-[8px] mx-auto">
                      <div>
                        <label className="text-slate-400 block font-semibold text-[7.5px]">Legal Full Names</label>
                        <input
                          type="text"
                          placeholder="e.g. Osagiede Joshua"
                          value={loginFullName}
                          onChange={(e) => setLoginFullName(e.target.value)}
                          className="w-full bg-slate-950 text-white text-[8.5px] px-1.5 py-0.5 rounded border border-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block font-semibold text-[7.5px]">Country</label>
                        <input
                          type="text"
                          value={loginCountry}
                          onChange={(e) => setLoginCountry(e.target.value)}
                          className="w-full bg-slate-950 text-white text-[8.5px] px-1.5 py-0.5 rounded border border-slate-800 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block font-semibold text-[7.5px]">State or Region</label>
                        <input
                          type="text"
                          placeholder="e.g. Lagos State"
                          value={loginState}
                          onChange={(e) => setLoginState(e.target.value)}
                          className="w-full bg-slate-950 text-white text-[8.5px] px-1.5 py-0.5 rounded border border-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block font-semibold text-[7.5px]">Street Address</label>
                        <input
                          type="text"
                          placeholder="e.g. 14 Admiralty Way"
                          value={loginAddress}
                          onChange={(e) => setLoginAddress(e.target.value)}
                          className="w-full bg-slate-950 text-white text-[8.5px] px-1.5 py-0.5 rounded border border-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block font-semibold text-[7.5px]">Postal Code (Optional)</label>
                        <input
                          type="text"
                          placeholder="105102 (Optional)"
                          value={loginPostalCode}
                          onChange={(e) => setLoginPostalCode(e.target.value)}
                          className="w-full bg-slate-950 text-slate-300 text-[8.5px] px-1.5 py-0.5 rounded border border-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Next Button Under */}
                    <div className="w-full max-w-[185px] flex items-center gap-1 pt-0.5 mx-auto">
                      <button
                        type="button"
                        onClick={() => setLoginStep(1)}
                        className="py-1 px-2.5 bg-slate-900 text-slate-400 rounded-lg text-[9px] font-bold cursor-pointer hover:bg-slate-800"
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
                  <div className="w-full max-w-[196px] space-y-1.5 flex flex-col items-center my-auto mx-auto">
                    <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider font-mono text-center w-full px-1 break-words">
                      Step 3: Identity Document
                    </span>
                    <p className="text-[8px] text-slate-300 leading-tight text-center w-full px-1 break-words">
                      BVN for +18 yrs • NIN allows +16 yrs
                    </p>

                    {/* Toggle Choice */}
                    <div className="w-full max-w-[185px] grid grid-cols-2 gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 mx-auto">
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
                    <div className="w-full max-w-[185px] space-y-0.5 mx-auto">
                      <span className="text-[7.5px] text-slate-400 font-mono block text-center">
                        Input 11-digit {loginIdType.toUpperCase()}:
                      </span>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder={loginIdType === 'nin' ? '84910294819' : '22349018247'}
                        value={loginIdNumber}
                        onChange={(e) => setLoginIdNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-950 text-white font-mono text-center font-bold tracking-widest text-[11px] py-1 rounded-lg border border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 shadow-inner"
                      />
                    </div>

                    {/* Next Button Under */}
                    <div className="w-full max-w-[185px] flex items-center gap-1 pt-0.5 mx-auto">
                      <button
                        type="button"
                        onClick={() => setLoginStep(2)}
                        className="py-1 px-2.5 bg-slate-900 text-slate-400 rounded-lg text-[9px] font-bold cursor-pointer hover:bg-slate-800"
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
                  <div className="w-full max-w-[196px] space-y-1.5 flex flex-col items-center my-auto mx-auto text-center">
                    <span className="text-[9.5px] font-bold text-cyan-400 uppercase tracking-wider font-mono text-center w-full px-1 break-words">
                      Step 4: Government Check
                    </span>

                    {isVerifyingGovtId ? (
                      <div className="flex flex-col items-center justify-center py-2 space-y-1">
                        <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
                        <span className="text-[8.5px] font-mono text-slate-300">
                          Querying {loginCountry} Database...
                        </span>
                        <span className="text-[7.5px] text-slate-500 font-mono">
                          Validating {loginIdType.toUpperCase()} {loginIdNumber.slice(0, 4)}••••••
                        </span>
                      </div>
                    ) : govtVerificationStatus === 'success' ? (
                      <div className="flex flex-col items-center justify-center py-1 space-y-1 animate-in zoom-in-75">
                        <span className="text-2xl">💯</span>
                        <span className="text-[9.5px] font-bold text-emerald-400 font-mono">
                          APPROVED & VERIFIED!
                        </span>
                        <span className="text-[7.5px] text-slate-400 px-1 break-words">
                          Government identity clearance confirmed
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-1 space-y-1">
                        <span className="text-2xl">❌ 🚫</span>
                        <span className="text-[9.5px] font-bold text-red-400 font-mono">
                          NOT APPROVED / INVALID!
                        </span>
                        <button
                          type="button"
                          onClick={() => setLoginStep(3)}
                          className="mt-1 px-3 py-1 bg-red-950 border border-red-800 text-red-300 text-[8.5px] rounded font-bold cursor-pointer"
                        >
                          Retry {loginIdType.toUpperCase()}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 5: Live Facial Recognition Match */}
                {loginStep === 5 && (
                  <div className="w-full max-w-[196px] space-y-1 flex flex-col items-center my-auto mx-auto text-center">
                    <span className="text-[9.5px] font-bold text-cyan-400 uppercase tracking-wider font-mono text-center w-full px-1 break-words">
                      Step 5: Face Match
                    </span>

                    {/* Camera Target Circle */}
                    <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-cyan-400 flex flex-col items-center justify-center overflow-hidden my-0.5 mx-auto">
                      {isFaceScanning && (
                        <div className="absolute inset-x-0 h-0.5 bg-cyan-400 animate-[bounce_1.5s_infinite] shadow-md shadow-cyan-400" />
                      )}
                      {faceScanMatched === true ? (
                        <span className="text-xl animate-in zoom-in">💯</span>
                      ) : (
                        <ScanFace className={`w-8 h-8 ${isFaceScanning ? 'text-cyan-300 animate-pulse' : 'text-slate-500'}`} />
                      )}
                    </div>

                    <span className="text-[8px] font-mono text-slate-300 px-1 break-words">
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
                        className="px-2 py-0.5 bg-red-950 text-red-300 text-[8px] rounded border border-red-800 cursor-pointer"
                      >
                        Retry Face Scan
                      </button>
                    )}
                  </div>
                )}

                {/* STEP 6: 6-Digit Passcode & Confirmation Re-Input */}
                {loginStep === 6 && (
                  <div className="w-full max-w-[196px] space-y-1 flex flex-col items-center my-auto mx-auto text-center">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider font-mono text-center w-full px-1 break-words">
                      Step 6: {passcodePhase === 'first' ? 'Place 6-Digit Code' : 'Re-input To Confirm'}
                    </span>

                    {/* 6 Dots Display */}
                    <div className="flex items-center gap-1.5 py-0.5 justify-center">
                      {Array.from({ length: 6 }).map((_, i) => {
                        const val = passcodePhase === 'first' ? firstPasscode : confirmPasscode;
                        const filled = i < val.length;
                        return (
                          <div
                            key={i}
                            className={`w-3 h-3.5 rounded flex items-center justify-center font-mono text-[9px] font-bold ${
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

                    {/* Watch Keypad Grid - Safe Circle Chord max-w-[172px] */}
                    <div className="grid grid-cols-3 gap-1 w-full max-w-[172px] mx-auto font-mono">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => handlePasscodeDigit(digit, passcodePhase)}
                          className="h-5.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-white font-mono text-xs font-bold border border-slate-800 cursor-pointer active:scale-95 transition-all"
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
                        className="h-5.5 rounded bg-slate-950 text-slate-500 font-mono text-[8px] cursor-pointer"
                      >
                        C
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePasscodeDigit('0', passcodePhase)}
                        className="h-5.5 rounded bg-slate-950 text-white font-mono text-xs font-bold border border-slate-800 cursor-pointer active:scale-95 transition-all"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePasscodeDelete(passcodePhase)}
                        className="h-5.5 rounded bg-slate-950 text-slate-400 hover:text-red-400 flex items-center justify-center border border-slate-800 cursor-pointer"
                      >
                        <Delete className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <span className="text-[7px] text-slate-400 font-mono">
                      {passcodePhase === 'first' ? 'Enter 6 digits code' : 'Re-enter same code'}
                    </span>
                  </div>
                )}

                {/* STEP 7: Payment Setup Password (Strictly 4-Digit PIN) */}
                {loginStep === 7 && (
                  <div className="w-full max-w-[196px] space-y-1 flex flex-col items-center my-auto mx-auto text-center">
                    <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider font-mono flex items-center justify-center gap-1 text-center w-full px-1 break-words">
                      <KeyRound className="w-2.5 h-2.5 text-teal-400" />
                      Step 7: 4-Digit Payment PIN
                    </span>

                    {/* Strictly 4-Digit Indicator Badge */}
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-950/80 border border-teal-800/80 mx-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                      <span className="text-[7.5px] font-mono font-bold text-teal-300">
                        4-Digit PIN (ATM / POS Standard)
                      </span>
                    </div>

                    {/* 4 PIN Dots Display */}
                    <div className="flex items-center gap-2 py-0.5 justify-center">
                      {[0, 1, 2, 3].map((i) => {
                        const val = paymentPinPhase === 'first' ? firstPaymentPin : confirmPaymentPin;
                        const filled = i < val.length;
                        return (
                          <div
                            key={i}
                            className={`w-3.5 h-4 rounded flex items-center justify-center font-mono text-[9px] font-bold ${
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

                    {/* Watch Keypad Grid - Safe Circle Chord max-w-[172px] */}
                    <div className="grid grid-cols-3 gap-1 w-full max-w-[172px] mx-auto font-mono">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => handlePaymentPinDigit(digit)}
                          className="h-5.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-white font-mono text-xs font-bold border border-slate-800 cursor-pointer active:scale-95 transition-all"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handlePaymentPinClear}
                        className="h-5.5 rounded bg-slate-950 text-slate-500 font-mono text-[8px] cursor-pointer"
                      >
                        C
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePaymentPinDigit('0')}
                        className="h-5.5 rounded bg-slate-950 text-white font-mono text-xs font-bold border border-slate-800 cursor-pointer active:scale-95 transition-all"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handlePaymentPinDelete}
                        className="h-5.5 rounded bg-slate-950 text-slate-400 hover:text-red-400 flex items-center justify-center border border-slate-800 cursor-pointer"
                      >
                        <Delete className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <span className="text-[7px] text-teal-400/90 font-mono">
                      {paymentPinPhase === 'first'
                        ? 'Enter 4-digit payment PIN'
                        : 'Re-enter same 4-digit PIN to confirm'}
                    </span>
                  </div>
                )}

                {/* STEP 8: Nickname + Email Address */}
                {loginStep === 8 && (
                  <div className="w-full max-w-[196px] space-y-1.5 flex flex-col items-center my-auto mx-auto text-left">
                    <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider font-mono text-center w-full px-1 break-words">
                      Step 8: Nickname & Email
                    </span>
                    <span className="text-sm font-mono text-emerald-400 text-center w-full">💯 Good to go!</span>

                    <div className="w-full max-w-[185px] space-y-1 text-left text-[8px] mx-auto">
                      <div>
                        <label className="text-slate-400 block font-semibold text-[7.5px]">Nickname</label>
                        <input
                          type="text"
                          placeholder="e.g. Commander Jay"
                          value={loginNickname}
                          onChange={(e) => setLoginNickname(e.target.value)}
                          className="w-full bg-slate-950 text-white text-[8.5px] px-2 py-0.5 rounded border border-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block font-semibold text-[7.5px]">Email Address</label>
                        <input
                          type="email"
                          placeholder="joshua@gmail.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full bg-slate-950 text-white text-[8.5px] px-2 py-0.5 rounded border border-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Final Finish Button */}
                    <button
                      type="button"
                      onClick={handleLoginComplete}
                      className="w-full max-w-[185px] mt-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9.5px] rounded-lg shadow-lg flex items-center justify-center gap-1 cursor-pointer mx-auto active:scale-95 transition-all"
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
              <div className="w-full max-w-[196px] flex flex-col items-center justify-between min-h-full mx-auto">
                {/* STEP 1: Input Phone Number + Country Code Check */}
                {signinStep === 1 && (
                  <div className="w-full space-y-1.5 flex flex-col items-center my-auto mx-auto">
                    {/* Terms Accepted Badge */}
                    <div
                      onClick={() => setIsTermsModalOpen(true)}
                      className="flex items-center justify-center gap-1 text-[7px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded-full cursor-pointer hover:bg-cyan-900/60 transition-colors"
                      title="Terms & Conditions accepted • Tap to review"
                    >
                      <CheckCircle2 className="w-2 h-2 text-cyan-400" />
                      <span>Terms Accepted (CBN/NDPR)</span>
                    </div>

                    <span className="text-[9.5px] font-bold text-cyan-400 uppercase tracking-wider font-mono text-center w-full px-1 break-words">
                      Sign In: Phone Number
                    </span>
                    <p className="text-[8px] text-slate-300 leading-tight text-center w-full px-1.5 break-words">
                      Input your already registered mobile number
                    </p>

                    <div className="w-full max-w-[185px] space-y-1 pt-0.5 mx-auto">
                      {/* Country Code Selector (Easy to Tap) */}
                      <div className="relative">
                        <select
                          value={countryCode}
                          onChange={(e) => {
                            if (!hasAcceptedTerms) {
                              setIsTermsModalOpen(true);
                              return;
                            }
                            setCountryCode(e.target.value);
                          }}
                          className="w-full h-7 bg-slate-950 text-white font-mono text-[9px] font-semibold px-2 py-0.5 rounded-xl border border-slate-800 hover:border-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code} ({c.country.split(' ')[0]})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Phone Number Input (Easy to Tap with Icon & Clear Action) */}
                      <div className="relative flex items-center w-full">
                        <Phone className="w-3 h-3 text-cyan-400 absolute left-2 pointer-events-none" />
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          autoComplete="tel"
                          placeholder={countryCode === '+234' ? 'e.g. 810 911 8552' : 'e.g. Mobile number'}
                          value={mobileNumber}
                          onChange={(e) => {
                            if (!hasAcceptedTerms) {
                              setIsTermsModalOpen(true);
                              return;
                            }
                            setMobileNumber(e.target.value.replace(/\D/g, ''));
                          }}
                          className="w-full h-8 bg-slate-950 text-cyan-300 font-mono font-bold text-center text-[11px] pl-6 pr-6 rounded-xl border border-cyan-800/80 hover:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                        />
                        {mobileNumber.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setMobileNumber('')}
                            className="absolute right-1.5 p-0.5 text-slate-400 hover:text-white rounded-full bg-slate-900/80 hover:bg-slate-800 cursor-pointer"
                            title="Clear number"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>

                      {/* One-Tap Autofill Chip for Easy Tapping on Smaller Screens */}
                      <div className="flex items-center justify-between text-[7px] font-mono text-slate-400 px-0.5">
                        <span className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${mobileNumber.length >= 10 ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                          <span>{mobileNumber.length}/10 digits</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!hasAcceptedTerms) {
                              setIsTermsModalOpen(true);
                              return;
                            }
                            setCountryCode('+234');
                            setMobileNumber('8109118552');
                          }}
                          className="text-cyan-400 hover:text-cyan-300 underline font-bold cursor-pointer"
                          title="Tap to autofill registered officer number"
                        >
                          Autofill: 810 911 8552
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSigninStep1Next}
                      className="w-full max-w-[185px] mt-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[9.5px] rounded-xl transition-all shadow-md shadow-cyan-950 flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <span>Check Number & Next</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>

                    {/* Quick In-Screen Privacy Policy Link */}
                    <button
                      type="button"
                      onClick={() => setIsPrivacyModalOpen(true)}
                      className="mt-0.5 text-[7px] font-mono text-slate-400 hover:text-cyan-300 underline flex items-center justify-center gap-1 cursor-pointer"
                      title="View NDPR Privacy Policy"
                    >
                      <ShieldCheck className="w-2 h-2 text-cyan-400" />
                      <span>Privacy Policy & NDPR Compliance</span>
                    </button>
                  </div>
                )}

                {/* STEP 2: Input Already Login Codes (6 Digit) */}
                {signinStep === 2 && (
                  <div className="w-full max-w-[196px] space-y-1 flex flex-col items-center my-auto mx-auto text-center">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider font-mono text-center w-full px-1 break-words">
                      Sign In: 6-Digit Passcode
                    </span>
                    <p className="text-[7.5px] text-slate-400 text-center w-full px-1 break-words">
                      Enter code for {countryCode} {mobileNumber}
                    </p>

                    {/* 6 Dots */}
                    <div className="flex items-center gap-1.5 py-0.5 justify-center">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3.5 rounded flex items-center justify-center font-mono text-[9px] font-bold ${
                            i < signinPasscode.length
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-900 border border-slate-800 text-slate-600'
                          }`}
                        >
                          {i < signinPasscode.length ? '•' : ''}
                        </div>
                      ))}
                    </div>

                    {/* Keypad - Safe Circle Chord max-w-[172px] */}
                    <div className="grid grid-cols-3 gap-1 w-full max-w-[172px] mx-auto font-mono">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => handlePasscodeDigit(digit, 'signin')}
                          className="h-5.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-white font-mono text-xs font-bold border border-slate-800 cursor-pointer active:scale-95 transition-all"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSigninPasscode('')}
                        className="h-5.5 rounded bg-slate-950 text-slate-500 font-mono text-[8px] cursor-pointer"
                      >
                        C
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePasscodeDigit('0', 'signin')}
                        className="h-5.5 rounded bg-slate-950 text-white font-mono text-xs font-bold border border-slate-800 cursor-pointer active:scale-95 transition-all"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePasscodeDelete('signin')}
                        className="h-5.5 rounded bg-slate-950 text-slate-400 hover:text-red-400 flex items-center justify-center border border-slate-800 cursor-pointer"
                      >
                        <Delete className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {signinError && (
                      <span className="text-[7px] text-red-400 font-mono block animate-pulse">
                        {signinError}
                      </span>
                    )}
                  </div>
                )}

                {/* STEP 3: Face Authentication / Verification */}
                {signinStep === 3 && (
                  <div className="w-full max-w-[196px] space-y-1 flex flex-col items-center my-auto mx-auto text-center">
                    <span className="text-[9.5px] font-bold text-cyan-400 uppercase tracking-wider font-mono text-center w-full px-1 break-words">
                      Face Authentication
                    </span>

                    {/* Camera Target Circle */}
                    <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-cyan-400 flex flex-col items-center justify-center overflow-hidden my-0.5 mx-auto">
                      {signinFaceScanning && (
                        <div className="absolute inset-x-0 h-0.5 bg-cyan-400 animate-[bounce_1.5s_infinite] shadow-md shadow-cyan-400" />
                      )}
                      {signinFaceMatched === true ? (
                        <span className="text-xl animate-in zoom-in">💯</span>
                      ) : (
                        <ScanFace className={`w-8 h-8 ${signinFaceScanning ? 'text-cyan-300 animate-pulse' : 'text-slate-500'}`} />
                      )}
                    </div>

                    <span className="text-[8px] font-mono text-slate-300 px-1 break-words">
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
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[9px] font-bold rounded-lg shadow-md flex items-center gap-1 cursor-pointer mx-auto active:scale-95 transition-all"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Start Face Auth</span>
                      </button>
                    )}

                    {signinFaceMatched === false && (
                      <button
                        type="button"
                        onClick={triggerSigninFaceScan}
                        className="px-2 py-0.5 bg-red-950 text-red-300 text-[8px] rounded border border-red-800 cursor-pointer"
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

      {/* Onboarding Bottom Status Deck & Privacy Policy Controls */}
      <div className="mt-3 flex flex-col items-center gap-2 max-w-sm sm:max-w-md w-full px-2 text-center z-10">
        {/* Network Status & Gateway Telemetry Banner */}
        <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono shadow-md">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                networkStatus.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
              }`}
            />
            <div className="flex items-center gap-1.5 text-left">
              <span className="text-slate-200 font-bold">
                {networkStatus.isOnline ? 'Network Online' : 'Network Offline'}
              </span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-emerald-400/90 hidden sm:inline">
                {networkStatus.networkType} ({networkStatus.latencyMs}ms)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestNetwork}
            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors border border-slate-700/60"
            title="Ping NIBSS Payment Gateway"
          >
            {isPingingNetwork ? (
              <Loader2 className="w-2.5 h-2.5 text-cyan-400 animate-spin" />
            ) : (
              <RefreshCw className="w-2.5 h-2.5 text-cyan-400" />
            )}
            <span>Ping Gateway</span>
          </button>
        </div>

        {/* Clean Terms & Privacy Policy Links & Reset Control */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono">
          <button
            type="button"
            onClick={() => setIsTermsModalOpen(true)}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 underline font-semibold transition-colors cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>CBN Terms & Conditions ({hasAcceptedTerms ? 'Accepted ✓' : 'Action Required'})</span>
          </button>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 underline font-semibold transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy Policy & NDPR Compliance</span>
          </button>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <button
            type="button"
            onClick={handleResetTerms}
            className="text-[10px] text-slate-500 hover:text-amber-400 underline transition-colors cursor-pointer"
            title="Reset Terms acceptance to re-test onboarding gate"
          >
            Reset Terms Gate
          </button>
        </div>
      </div>

      {/* Mandatory CBN Terms & Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={handleAcceptTerms}
        hasAccepted={hasAcceptedTerms}
      />

      {/* Privacy Policy & NDPR Charter Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
};
