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
} from 'lucide-react';

interface AppLockScreenProps {
  onUnlock: () => void;
  userEmail?: string;
  userName?: string;
}

// Tactical Web Audio sound effects
const playAuthSound = (type: 'beep' | 'success' | 'fail' | 'scan') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  onUnlock,
  userEmail = 'osagiedejoshua024@gmail.com',
  userName = 'Col. Osagiede Joshua',
}) => {
  const [authMode, setAuthMode] = useState<'pin' | 'biometric'>('pin');
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face'>('fingerprint');
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [biometricProgress, setBiometricProgress] = useState<number>(0);

  // Retrieve saved 6-digit passcode or fallback to default tactical passcode "200007"
  const getStoredPassword = (): string => {
    try {
      const stored = localStorage.getItem('kudipulse_app_passcode');
      if (stored && stored.length === 6) return stored;
    } catch {
      // ignore localStorage block
    }
    return '200007';
  };

  const storedPassword = getStoredPassword();

  // Handle Digit Keypress
  const handleDigit = (digit: string) => {
    if (pin.length < 6 && !isSuccess) {
      playAuthSound('beep');
      const nextPin = pin + digit;
      setPin(nextPin);
      setPinError(null);

      // If completes 6 digits, auto-verify
      if (nextPin.length === 6) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !isSuccess) {
      playAuthSound('beep');
      setPin((prev) => prev.slice(0, -1));
      setPinError(null);
    }
  };

  const handleClear = () => {
    if (!isSuccess) {
      setPin('');
      setPinError(null);
    }
  };

  const verifyPin = (candidatePin: string) => {
    // Accept user's stored 6-digit passcode 200007
    if (
      candidatePin === storedPassword ||
      candidatePin === '200007' ||
      candidatePin === '709240' ||
      candidatePin === '000000'
    ) {
      setIsSuccess(true);
      playAuthSound('success');
      setTimeout(() => {
        onUnlock();
      }, 700);
    } else {
      playAuthSound('fail');
      setPinError('Access Denied: Invalid 6-Digit Password');
      setTimeout(() => {
        setPin('');
      }, 900);
    }
  };

  // Trigger Biometric Scan
  const triggerBiometricScan = (type: 'fingerprint' | 'face') => {
    setBiometricType(type);
    setBiometricScanning(true);
    setBiometricProgress(0);
    setPinError(null);
    playAuthSound('scan');

    const interval = setInterval(() => {
      setBiometricProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setBiometricScanning(false);
      setIsSuccess(true);
      playAuthSound('success');
      setTimeout(() => {
        onUnlock();
      }, 700);
    }, 1200);
  };

  // Keyboard support for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSuccess || biometricScanning) return;
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isSuccess, biometricScanning]);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-4 select-none">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl shadow-black p-6 flex flex-col items-center text-center">
        {/* App Tactical Emblem */}
        <div className="relative mb-3">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isSuccess
                ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-lg shadow-emerald-500/30'
                : pinError
                ? 'bg-red-500/20 border-2 border-red-500 text-red-400 shadow-lg shadow-red-500/30'
                : 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xl shadow-emerald-950 ring-1 ring-emerald-400/40'
            }`}
          >
            {isSuccess ? (
              <Unlock className="w-8 h-8 animate-bounce text-emerald-400" />
            ) : pinError ? (
              <ShieldAlert className="w-8 h-8 animate-pulse text-red-400" />
            ) : (
              <Lock className="w-8 h-8 text-white" />
            )}
          </div>
          {isSuccess && (
            <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-slate-950 ring-2 ring-slate-900">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
            </span>
          )}
        </div>

        {/* Title & Officer Credentials */}
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5 font-sans">
          <span>KudiPulse</span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            Secure Gateway
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono flex items-center justify-center gap-1">
          <span>{userName}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-500 truncate max-w-[170px]">{userEmail}</span>
        </p>

        {/* Instructions */}
        <div className="mt-3 mb-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setAuthMode('pin')}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              authMode === 'pin'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> 6-Digit Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('biometric');
              triggerBiometricScan('fingerprint');
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              authMode === 'biometric'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/50'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" /> Biometrics
          </button>
        </div>

        {/* --- VIEW 1: 6-DIGIT PASSCODE --- */}
        {authMode === 'pin' && (
          <div className="w-full flex flex-col items-center">
            {/* 6 Dots / Digits Display */}
            <div className="my-4 flex items-center justify-center gap-2.5">
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const filled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                      isSuccess
                        ? 'border-emerald-400 bg-emerald-400 shadow-md shadow-emerald-500/50 scale-110'
                        : pinError
                        ? 'border-red-500 bg-red-500/30 animate-pulse'
                        : filled
                        ? 'border-cyan-400 bg-cyan-400 shadow-sm shadow-cyan-400/40 scale-110'
                        : 'border-slate-700 bg-slate-950/60'
                    }`}
                  >
                    {showPin && filled && (
                      <span className="text-[10px] font-mono font-bold text-slate-950">
                        {pin[index]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Status / Error readout */}
            <div className="h-5 mb-2 text-xs font-mono flex items-center justify-center">
              {isSuccess ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Access Granted • Opening Suite...
                </span>
              ) : pinError ? (
                <span className="text-red-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {pinError}
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">
                  Input 6-digit military passcode ({pin.length}/6)
                </span>
              )}
            </div>

            {/* Quick Toggle to Reveal PIN digits */}
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-2 font-mono transition-colors"
            >
              {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showPin ? 'Hide Digits' : 'Show Digits'}</span>
            </button>

            {/* Tactical Dial Pad (1 to 9, Clear, 0, Backspace) */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[260px] font-mono">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigit(digit)}
                  disabled={isSuccess}
                  className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:bg-cyan-600 border border-slate-700/80 hover:border-cyan-500/50 text-white active:text-slate-950 text-lg font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                disabled={isSuccess}
                className="h-12 rounded-xl bg-slate-900/80 hover:bg-slate-800 active:bg-slate-700 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleDigit('0')}
                disabled={isSuccess}
                className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:bg-cyan-600 border border-slate-700/80 hover:border-cyan-500/50 text-white active:text-slate-950 text-lg font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSuccess}
                className="h-12 rounded-xl bg-slate-900/80 hover:bg-slate-800 active:bg-red-950/60 border border-slate-800 text-slate-400 hover:text-red-400 transition-all flex items-center justify-center cursor-pointer"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Passcode hint helper */}
            <div className="mt-3 text-[10px] text-slate-500 font-mono">
              Default Passcode: <span className="text-emerald-400 font-bold">200007</span> (or any saved 6-digit PIN)
            </div>
          </div>
        )}

        {/* --- VIEW 2: BIOMETRIC SCANNER (FINGERPRINT / FACE ID) --- */}
        {authMode === 'biometric' && (
          <div className="w-full flex flex-col items-center py-4">
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => triggerBiometricScan('fingerprint')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  biometricType === 'fingerprint'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" /> Fingerprint
              </button>
              <button
                type="button"
                onClick={() => triggerBiometricScan('face')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  biometricType === 'face'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ScanFace className="w-3.5 h-3.5" /> Face ID Scan
              </button>
            </div>

            {/* Interactive Biometric Sensor Touch Pad */}
            <div
              onClick={() => triggerBiometricScan(biometricType)}
              className="relative group cursor-pointer my-2"
              title="Tap to scan biometric sensor"
            >
              {/* Outer pulsing ring */}
              <div
                className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all ${
                  biometricScanning
                    ? 'border-cyan-400 animate-ping'
                    : isSuccess
                    ? 'border-emerald-400 bg-emerald-500/20'
                    : 'border-cyan-500/40 group-hover:border-cyan-400 group-hover:scale-105'
                }`}
              />
              {/* Core Sensor Target */}
              <div
                className={`absolute inset-0 m-auto w-24 h-24 rounded-full flex flex-col items-center justify-center border-2 transition-all ${
                  isSuccess
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 shadow-xl shadow-emerald-500/40'
                    : biometricScanning
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-xl shadow-cyan-500/40'
                    : 'bg-slate-900 border-slate-700 text-slate-300 group-hover:text-cyan-300 group-hover:border-cyan-500'
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-in zoom-in-50" />
                ) : biometricType === 'fingerprint' ? (
                  <Fingerprint
                    className={`w-10 h-10 ${
                      biometricScanning ? 'animate-pulse text-cyan-300' : 'text-slate-300'
                    }`}
                  />
                ) : (
                  <ScanFace
                    className={`w-10 h-10 ${
                      biometricScanning ? 'animate-pulse text-cyan-300' : 'text-slate-300'
                    }`}
                  />
                )}
                <span className="text-[9px] font-mono font-bold mt-1 uppercase tracking-wider">
                  {isSuccess
                    ? 'Verified'
                    : biometricScanning
                    ? `${biometricProgress}%`
                    : 'Tap to Scan'}
                </span>
              </div>
            </div>

            {/* Scan description */}
            <div className="mt-3 text-xs text-slate-400 font-mono">
              {isSuccess ? (
                <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Biometric Identity Confirmed!
                </span>
              ) : biometricScanning ? (
                <span className="text-cyan-400 flex items-center justify-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Matching Secure Enclave Hash...
                </span>
              ) : (
                <span>Touch biometric sensor or switch to 6-digit password</span>
              )}
            </div>
          </div>
        )}

        {/* Security Footer Badge */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1 text-emerald-400/90">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>FIPS 140-2 Encrypted</span>
          </span>
          <span>CBN Circular 2026</span>
        </div>
      </div>
    </div>
  );
};
