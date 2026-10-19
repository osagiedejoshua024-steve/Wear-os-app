import React from 'react';
import {
  ShieldCheck,
  Lock,
  Scale,
  FileText,
  X,
  CheckCircle2,
  ExternalLink,
  Cpu,
  KeyRound,
  EyeOff,
  Building,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-emerald-500/20 text-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span>Privacy Policy & NDPR Charter</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 hidden sm:inline-block">
                  NDPR 2024 Compliant
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                KudiPulse Wearable Offline Payment Architecture • Data Protection Policy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close Privacy Policy"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed scrollbar-thin">
          {/* Quick Regulatory Summary Callout */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-xs sm:text-sm font-mono">
                Nigeria Data Protection Act (NDPA 2023) & CBN PSV2020 Certified
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200/90 mt-0.5">
                KudiPulse operates on a zero-knowledge cryptographic model. Your biometric data, 4-digit payment PINs, and 6-digit access codes never leave your physical device unencrypted.
              </p>
            </div>
          </div>

          {/* Section 1: Information We Collect & Why */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold font-mono text-xs sm:text-sm">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>1. Information We Collect During Onboarding</span>
            </div>
            <p className="text-slate-400 text-xs">
              During mobile onboarding and smartwatch registration, the system gathers strictly required regulatory KYC artifacts:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
              <li>
                <strong className="text-slate-100">Mobile Phone Number:</strong> Used exclusively for SMS OTP verification, two-factor authentication, and account routing across Nigerian banking switches (NIBSS Instant Payment).
              </li>
              <li>
                <strong className="text-slate-100">NIN / BVN Verification:</strong> Verified against the National Identity Management Commission (NIMC) and Central Bank of Nigeria (CBN) databases via encrypted tokenized hashes. Plaintext identity numbers are never sold or shared.
              </li>
              <li>
                <strong className="text-slate-100">Legal Name & Residential Address:</strong> Required to fulfill Tier-3 regulatory KYC limits under the CBN National Financial Inclusion Strategy.
              </li>
            </ul>
          </div>

          {/* Section 2: Biometrics & Zero Plaintext Storage */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold font-mono text-xs sm:text-sm">
              <EyeOff className="w-4 h-4 text-cyan-400" />
              <span>2. Biometrics & On-Device Cryptographic Enclave</span>
            </div>
            <p className="text-slate-400 text-xs">
              Your biometric authentication (Face ID and optical wrist sensor) executes 100% on-device utilizing the local hardware secure element (Android Keystore / iOS Secure Enclave).
            </p>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div>• Raw facial scans and fingerprint templates are <strong>NEVER transmitted over the internet or cellular network</strong>.</div>
              <div>• 4-Digit payment PINs are hashed using PBKDF2 with HMAC-SHA256 and salted per device.</div>
              <div>• Even in offline transmission (BLE, NFC, Sound Waves), only time-stamped, single-use encrypted payloads (Ed25519 signed) are broadcast.</div>
            </div>
          </div>

          {/* Section 3: Data Protection & NDPR Rights */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold font-mono text-xs sm:text-sm">
              <Scale className="w-4 h-4 text-purple-400" />
              <span>3. Your Rights Under the Nigeria Data Protection Act</span>
            </div>
            <p className="text-slate-400 text-xs">
              In strict accordance with the NDPA 2023 and NDPR, all registered operators have irrevocable rights:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
              <li><strong className="text-slate-100">Right to Audit:</strong> View all transaction audit logs and transmitted cryptographic packets in the Security Console.</li>
              <li><strong className="text-slate-100">Right to Erase / Reset:</strong> Wipe all locally cached tokens, linked bank accounts, and PINs via the Settings menu at any time.</li>
              <li><strong className="text-slate-100">Right to Restrict Processing:</strong> Adjust your CBN contactless payment threshold or enforce PIN validation for every single transaction.</li>
            </ul>
          </div>

          {/* Section 4: Network & Telemetry Monitoring */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold font-mono text-xs sm:text-sm">
              <Cpu className="w-4 h-4 text-teal-400" />
              <span>4. Network Status & Gateway Telemetry</span>
            </div>
            <p className="text-slate-400 text-xs">
              The live network status indicator on your onboarding screen monitors ping latency against authorized NIBSS payment gateways. In offline environments (airplane mode, rural deployments, power grid outages), KudiPulse automatically toggles to offline mesh mode without storing your credentials in vulnerable cloud servers.
            </p>
          </div>

          {/* Regulatory Contacts */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-200">Data Protection Officer (DPO):</span> dpo@kudipulse.ng
              <br />
              <span>Central Bank of Nigeria Regulatory Sandbox • Abuja, Nigeria</span>
            </div>
            <div className="font-mono text-emerald-400 text-[10px] uppercase font-bold shrink-0">
              Rev 2026.10 • Active
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted • NDPR Compliant</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center gap-1.5 cursor-pointer"
          >
            <span>I Understand & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
