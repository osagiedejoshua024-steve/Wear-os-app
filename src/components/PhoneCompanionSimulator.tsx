import React, { useState } from 'react';
import {
  EncryptedPacket,
  SmartwatchPayload,
  SettlementType,
  FlutterwaveChargeResponse,
  FaceIdPolicy,
  FaceIdAuthResult,
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
  Lock,
  Zap,
  CreditCard,
  QrCode,
  ScanFace,
  Sliders,
  Sparkles,
  Building2,
  Receipt,
  FileText,
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
}

export const PhoneCompanionSimulator: React.FC<Props> = ({
  packet,
  onClearPacket,
  onTransactionSuccess,
  onTransactionFailed,
  onViewReceiptRequest,
  onOpenSettings,
}) => {
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
  const lastProcessedPacketRef = React.useRef<EncryptedPacket | null>(null);

  // When a new packet arrives from smartwatch
  React.useEffect(() => {
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

      // 1. Decrypt AES-256-GCM
      const decryptResult = await cryptoEngine.decryptPayload(packet);
      if (!decryptResult.success || !decryptResult.payload) {
        const err = decryptResult.error || 'Decryption failed';
        setErrorStatus(err);
        onTransactionFailed(err);
        return;
      }

      const payload = decryptResult.payload;
      setDecryptedPayload(payload);

      // 2. Validate HMAC Signature
      const isSignatureValid = await cryptoEngine.verifyHmacSignature(payload);
      if (!isSignatureValid) {
        const err = 'HMAC-SHA256 signature verification failed! Payload integrity compromised.';
        setErrorStatus(err);
        onTransactionFailed(err);
        return;
      }

      // 3. Replay attack and Nonce verification
      const securityCheck = cryptoEngine.validateSecurityRules(payload);
      if (!securityCheck.valid) {
        const err = securityCheck.reason || 'Security rules violated';
        setErrorStatus(err);
        onTransactionFailed(err);
        return;
      }

      // 4. Biometric decision gate: Check Face ID policy
      const shouldRequireFaceId =
        faceIdPolicy === 'always' ||
        (faceIdPolicy === 'cbn_threshold' && payload.amount > 5000);

      if (shouldRequireFaceId) {
        setRequiresBiometrics(true);
        setBiometricsPassed(false);
        setIsFaceIdModalOpen(true); // Automatically present Face ID scanner modal!
      } else {
        setRequiresBiometrics(false);
        setBiometricsPassed(true);
        executeSettlement(payload, false);
      }
    };

    processPacket();
  }, [packet, faceIdPolicy]);

  const handleFaceIdSuccess = (result: FaceIdAuthResult) => {
    setLastFaceIdResult(result);
    setBiometricsPassed(true);
    setRequiresBiometrics(false);
    setIsFaceIdModalOpen(false);

    if (decryptedPayload) {
      executeSettlement(decryptedPayload, true);
    }
  };

  const executeSettlement = async (payload: SmartwatchPayload, usedFaceId: boolean) => {
    setIsSettling(true);
    setSettlementStep('Initiating Flutterwave v3 API charge...');

    try {
      const chargeRes = await flutterwaveSimulator.initiateCharge({
        amount: payload.amount,
        currency: 'NGN',
        email: 'tactical.payer@kudipulse.ng',
        txRef: `KUDI-${Date.now()}-${payload.nonce.slice(0, 6)}`,
        type: settlementType,
        merchantName: payload.merchantName,
        deviceId: payload.deviceId,
      });

      setSettlementStep('Polling Flutterwave settlement confirmation...');
      const verifiedRes = await flutterwaveSimulator.pollTransactionVerification(
        chargeRes.data.id,
        payload.amount,
        (step) => setSettlementStep(step)
      );

      setCompletedCharge(verifiedRes);
      setIsSettling(false);
      onTransactionSuccess(verifiedRes.data.id, payload.amount, payload, verifiedRes, usedFaceId);

      // Trigger victory celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10B981', '#064E3B', '#3B82F6', '#F59E0B'],
        });
      } catch {
        // Confetti fallback
      }
    } catch (e: any) {
      setIsSettling(false);
      setErrorStatus(e.message || 'Settlement failed');
      onTransactionFailed(e.message || 'Settlement error');
    }
  };

  return (
    <div className="flex flex-col items-center">
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

      {/* Phone Hardware Container */}
      <div className="w-80 rounded-[44px] bg-slate-950 border-4 border-slate-700/80 shadow-2xl p-4 flex flex-col justify-between min-h-[610px] relative ring-1 ring-slate-800">
        {/* Dynamic Island / TrueDepth Sensor Notch */}
        <div
          onClick={() => setIsFaceIdModalOpen(true)}
          title="Click to trigger Face ID TrueDepth Scan"
          className="cursor-pointer group w-28 h-5 bg-slate-900 hover:bg-slate-800 mx-auto rounded-full mb-3 flex items-center justify-between px-2.5 transition-all ring-1 ring-slate-800"
        >
          <div className="w-2 h-2 rounded-full bg-slate-800 group-hover:bg-emerald-400 transition-colors"></div>
          <div className="flex items-center gap-1">
            <ScanFace className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-mono text-slate-400 group-hover:text-emerald-300">
              Face ID
            </span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-950 ring-1 ring-indigo-500/40"></div>
        </div>

        {/* Companion App Screen Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white tracking-wide">
              KudiPulse Companion
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
              {packet ? packet.platform.toUpperCase() : 'BLE/DATA READY'}
            </span>
          </div>
        </div>

        {/* Face ID Policy Selector Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
            <Sliders className="w-3 h-3 text-cyan-400" />
            <span>Face ID Gate:</span>
          </div>
          <div className="flex gap-1 text-[9px] font-bold">
            <button
              onClick={() => setFaceIdPolicy('cbn_threshold')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                faceIdPolicy === 'cbn_threshold'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              &gt; ₦5k (CBN)
            </button>
            <button
              onClick={() => setFaceIdPolicy('always')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                faceIdPolicy === 'always'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Every Tap
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center text-center">
          {!packet && (
            <div className="py-8 px-2 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-300">
                  Listening for Smartwatch Signal
                </h4>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Wear OS DataLayer & Apple WCSession background daemon active. Initiate payment on the smartwatch.
                </p>
              </div>

              {/* Quick Face ID Test Button */}
              <div className="pt-2">
                <button
                  onClick={() => setIsFaceIdModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-indigo-300 hover:text-indigo-200 transition-colors font-semibold"
                >
                  <ScanFace className="w-3.5 h-3.5 text-indigo-400" />
                  Test Face ID Scan
                </button>
              </div>
            </div>
          )}

          {packet && (
            <div className="space-y-2.5">
              {/* Recipient Account Details in Companion */}
              {decryptedPayload && (
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-left space-y-1 font-mono text-[10px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-500">
                      <Building2 className="w-3 h-3 text-cyan-400" /> Beneficiary:
                    </span>
                    <span className="text-emerald-400 font-bold">₦{decryptedPayload.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-xs font-bold text-white truncate font-sans">
                    {decryptedPayload.merchantName}
                  </div>
                  <div className="text-[10px] text-slate-300 flex items-center justify-between">
                    <span>Acct: <strong className="text-emerald-400">{decryptedPayload.recipientAccount || '0129482710'}</strong></span>
                    <span className="text-slate-400">{decryptedPayload.recipientBank || 'Zenith Bank PLC'}</span>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorStatus && (
                <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-2xl text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-red-300 text-xs font-bold">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                    Security Gate Block
                  </div>
                  <p className="text-[10px] text-red-200 leading-tight">{errorStatus}</p>
                  <button
                    onClick={onClearPacket}
                    className="w-full mt-2 py-1 bg-red-900 hover:bg-red-800 text-white rounded-lg text-[10px] font-semibold"
                  >
                    Dismiss & Reset
                  </button>
                </div>
              )}

              {/* Face ID Status */}
              {requiresBiometrics && !biometricsPassed && (
                <div className="p-3 bg-indigo-950/50 border border-indigo-500/40 rounded-2xl text-center space-y-2">
                  <ScanFace className="w-6 h-6 text-indigo-400 animate-pulse mx-auto" />
                  <div className="text-xs font-bold text-indigo-200">
                    Face ID Biometric Gate
                  </div>
                  <p className="text-[10px] text-indigo-300/80 leading-tight">
                    Transaction amount exceeds CBN threshold. Scanning face in TrueDepth module.
                  </p>
                  <button
                    onClick={() => setIsFaceIdModalOpen(true)}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-950 flex items-center justify-center gap-1"
                  >
                    <ScanFace className="w-3.5 h-3.5" /> Open Face ID Scanner
                  </button>
                </div>
              )}

              {biometricsPassed && lastFaceIdResult && (
                <div className="p-2 bg-emerald-950/50 border border-emerald-500/40 rounded-xl flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                    <ScanFace className="w-3.5 h-3.5 text-emerald-400" />
                    Face ID Authorized
                  </span>
                  <span className="font-mono text-emerald-400 text-[9px]">
                    Score: {(lastFaceIdResult.confidenceScore * 100).toFixed(1)}%
                  </span>
                </div>
              )}

              {/* In-Flight Settlement Progress */}
              {isSettling && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-600/40 rounded-2xl text-center space-y-1.5">
                  <Zap className="w-5 h-5 text-emerald-400 animate-bounce mx-auto" />
                  <div className="text-xs font-bold text-emerald-300">
                    Flutterwave v3 Settlement
                  </div>
                  <div className="text-[10px] text-emerald-200/80 font-mono">
                    {settlementStep}
                  </div>
                </div>
              )}

              {/* Completed Settlement Receipt Card with View Receipt CTA */}
              {completedCharge && (
                <div className="p-3 bg-slate-900 border border-emerald-500 rounded-2xl text-left space-y-2 shadow-xl animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Payment Settled
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: #{completedCharge.data.id}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-300">
                    TxRef: <span className="text-cyan-300">{completedCharge.data.tx_ref}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-300">
                    Settlement: <span className="text-emerald-300">₦{completedCharge.data.charged_amount.toLocaleString()} NGN</span>
                  </div>

                  {/* Ask for Full Receipt Button right inside companion */}
                  {onViewReceiptRequest && (
                    <button
                      onClick={onViewReceiptRequest}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View Full Transaction Receipt</span>
                    </button>
                  )}

                  <button
                    onClick={onClearPacket}
                    className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all"
                  >
                    New Transaction
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Phone Bottom Navigation Bar */}
        <div className="pt-2 border-t border-slate-900 flex items-center justify-around text-slate-500 text-[10px]">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Zap className="w-3 h-3" /> Tap-to-Pay
          </span>
          <button
            onClick={() => setIsFaceIdModalOpen(true)}
            className="hover:text-emerald-300 flex items-center gap-1"
          >
            <ScanFace className="w-3 h-3" /> Face ID
          </button>
          <span>Cards & BVN</span>
          <button
            onClick={onOpenSettings}
            className="hover:text-emerald-300 flex items-center gap-1 transition-colors"
            title="Open Terminal Settings (*Language)"
          >
            <span>*Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
