import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  RotateCcw,
  Sparkles,
  Check,
  X,
  Scan,
} from 'lucide-react';
import { FaceIdAuthResult, FaceIdState } from '../types/payment';

interface Props {
  isOpen: boolean;
  amount: number;
  merchantName: string;
  onSuccess: (result: FaceIdAuthResult) => void;
  onCancel: () => void;
}

// Tactical Web Audio API sound generator for authentic Apple Pay / Face ID chime
const playFaceIdSound = (type: 'scan' | 'success' | 'fail') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'scan') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else if (type === 'success') {
      // Signature Apple Pay double-tone ding (high clean bell)
      const now = ctx.currentTime;
      [1046.5, 1318.51].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.12, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.36);
      });
    } else if (type === 'fail') {
      // Haptic buzz tone
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.26);
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
};

export const FaceIdScannerModal: React.FC<Props> = ({
  isOpen,
  amount,
  merchantName,
  onSuccess,
  onCancel,
}) => {
  const [state, setState] = useState<FaceIdState>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [livenessConfirmed, setLivenessConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setState('idle');
      setScanProgress(0);
      setEnteredPin('');
      setErrorMessage('');
      setLivenessConfirmed(false);
      // Auto-trigger initial scan after small delay
      const timer = setTimeout(() => {
        triggerScan(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerScan = (simulateSuccess = true) => {
    setState('scanning');
    setScanProgress(0);
    setErrorMessage('');
    playFaceIdSound('scan');

    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        clearInterval(interval);
        setScanProgress(100);

        if (simulateSuccess) {
          setState('authorized');
          setLivenessConfirmed(true);
          playFaceIdSound('success');
          setTimeout(() => {
            onSuccess({
              success: true,
              biometryType: 'face_id',
              confidenceScore: 0.998,
              livenessPassed: true,
              timestamp: Date.now(),
            });
          }, 650);
        } else {
          setState('failed');
          setErrorMessage('Face Not Recognized. Ensure camera is unobstructed and face is in frame.');
          playFaceIdSound('fail');
        }
      } else {
        setScanProgress(current);
      }
    }, 70);
  };

  const handlePinSubmit = () => {
    if (enteredPin === '1234' || enteredPin.length === 4) {
      playFaceIdSound('success');
      setState('authorized');
      setTimeout(() => {
        onSuccess({
          success: true,
          biometryType: 'pin_fallback',
          confidenceScore: 1.0,
          livenessPassed: true,
          timestamp: Date.now(),
        });
      }, 500);
    } else {
      playFaceIdSound('fail');
      setErrorMessage('Incorrect PIN. Try 1234.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* iOS Style Face ID HUD Card */}
      <div className="w-full max-w-sm rounded-[36px] bg-slate-900 border-2 border-slate-700/80 shadow-2xl p-6 relative overflow-hidden text-center ring-1 ring-slate-600/40">
        {/* Dynamic Island Pill / Sensor Notch */}
        <div className="w-28 h-5 bg-black rounded-full mx-auto mb-4 flex items-center justify-between px-3">
          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[8px] font-mono text-slate-400">IR 30K</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-indigo-900/60 ring-1 ring-indigo-500/40"></div>
        </div>

        {/* Header / Amount context */}
        <div className="mb-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">
            Biometric Authorization
          </span>
          <h2 className="text-xl font-black text-white mt-0.5">
            ₦{amount.toLocaleString('en-NG')} NGN
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Merchant: <span className="text-slate-200 font-medium">{merchantName}</span>
          </p>
        </div>

        {/* Center Face ID Scanning Reticle Area */}
        <div className="my-5 relative flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
            {/* 3D Facial Mesh Grid Background */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:8px_8px]"></div>

            {/* Sweep Laser Line during scanning */}
            {state === 'scanning' && (
              <div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] transition-all duration-75"
                style={{ top: `${scanProgress}%` }}
              ></div>
            )}

            {/* Face ID Icon Graphic (Apple Face ID bracket shape) */}
            <div className="relative z-10">
              {state === 'idle' || state === 'scanning' ? (
                <div
                  className={`w-20 h-20 border-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    state === 'scanning'
                      ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] scale-105'
                      : 'border-slate-500 text-slate-400'
                  }`}
                >
                  {/* Eyes */}
                  <div className="flex gap-6 mb-2">
                    <div
                      className={`w-2 h-2.5 rounded-full transition-all ${
                        state === 'scanning' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                      }`}
                    ></div>
                    <div
                      className={`w-2 h-2.5 rounded-full transition-all ${
                        state === 'scanning' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                      }`}
                    ></div>
                  </div>
                  {/* Nose line */}
                  <div
                    className={`w-1 h-3 rounded-full mb-1 transition-all ${
                      state === 'scanning' ? 'bg-emerald-400' : 'bg-slate-400'
                    }`}
                  ></div>
                  {/* Smile */}
                  <div
                    className={`w-7 h-3 border-b-2 rounded-b-full transition-all ${
                      state === 'scanning' ? 'border-emerald-400' : 'border-slate-400'
                    }`}
                  ></div>
                </div>
              ) : state === 'authorized' ? (
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)] animate-in zoom-in-75">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
              ) : state === 'failed' ? (
                <div className="w-20 h-20 rounded-2xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-in shake">
                  <X className="w-10 h-10 stroke-[3]" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-amber-400">
                  <KeyRound className="w-8 h-8" />
                </div>
              )}
            </div>

            {/* Corner Alignment Reticles (Camera viewfinder corners) */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-400/70"></div>
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-400/70"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-400/70"></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-400/70"></div>
          </div>

          {/* Status Label */}
          <div className="mt-3">
            {state === 'scanning' && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Scan className="w-3.5 h-3.5 animate-spin" />
                TrueDepth 3D Dot Projection Scanning...
              </div>
            )}
            {state === 'authorized' && (
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Biometrics Confirmed (Secure Enclave)
              </div>
            )}
            {state === 'failed' && (
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-red-400">
                <ShieldAlert className="w-4 h-4" />
                Face Verification Unsuccessful
              </div>
            )}
            {state === 'passcode_fallback' && (
              <div className="text-xs font-semibold text-amber-300">
                Enter Backup Security PIN
              </div>
            )}
            {state === 'idle' && (
              <div className="text-xs text-slate-400">
                Position your face directly in front of the TrueDepth camera.
              </div>
            )}
          </div>
        </div>

        {/* Error message description */}
        {errorMessage && (
          <p className="text-[11px] text-red-300 bg-red-950/60 border border-red-800/60 p-2 rounded-xl mb-3 text-left">
            {errorMessage}
          </p>
        )}

        {/* PIN Fallback View */}
        {state === 'passcode_fallback' ? (
          <div className="space-y-3 mb-2">
            <input
              type="password"
              maxLength={4}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder="••••"
              className="w-32 mx-auto text-center text-xl font-mono tracking-widest py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setState('idle')}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Back to Face
              </button>
              <button
                onClick={handlePinSubmit}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Submit PIN
              </button>
            </div>
          </div>
        ) : (
          /* Face ID Simulator Action Controls */
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => triggerScan(true)}
                disabled={state === 'scanning'}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Scan Face (Pass)
              </button>

              <button
                onClick={() => triggerScan(false)}
                disabled={state === 'scanning'}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-red-300 font-semibold text-xs border border-red-900/40 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Simulate Fail
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setState('passcode_fallback')}
                className="text-[11px] text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" /> Use Passcode
              </button>
              <button
                onClick={onCancel}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Cancel Payment
              </button>
            </div>
          </div>
        )}

        {/* Security Specs Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Policy: LAContext.faceID</span>
          <span className="text-emerald-400/90 font-mono">Enclave: kSecAccessBiometry</span>
        </div>
      </div>
    </div>
  );
};
