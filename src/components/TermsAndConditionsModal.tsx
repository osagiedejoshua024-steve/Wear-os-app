import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Check,
  X,
  Lock,
  Landmark,
  Scale,
  AlertTriangle,
  Building,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  hasAccepted?: boolean;
}

export const TermsAndConditionsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAccept,
  hasAccepted = false,
}) => {
  const [agreedToMandate, setAgreedToMandate] = useState<boolean>(hasAccepted);
  const [agreedToCbn, setAgreedToCbn] = useState<boolean>(hasAccepted);
  const [agreedToTokenization, setAgreedToTokenization] = useState<boolean>(hasAccepted);

  if (!isOpen) return null;

  const allAgreed = agreedToMandate && agreedToCbn && agreedToTokenization;

  const handleConfirmAcceptance = () => {
    if (allAgreed && onAccept) {
      onAccept();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-emerald-500/20">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span>Terms & Conditions</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  CBN Regulated
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                KudiPulse Wearable Tap-to-Pay & Multi-Bank Linkage Mandate
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 scrollbar-thin">
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-white text-xs">
                Legal Governance & Regulatory Authority
              </div>
              <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                By enabling the KudiPulse Contactless Tap-to-Pay system on Wear OS, Apple watchOS, and linking commercial bank accounts, you explicitly agree to the directives outlined in the <strong>Central Bank of Nigeria (CBN) Circular PSM/DIR/CON/CWO/08/022 (Guidelines for Contactless Payments in Nigeria)</strong> and the <strong>Nigeria Inter-Bank Settlement System (NIBSS) NIP Rules</strong>.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 text-cyan-400">
              <span>1. Multi-Bank Account Linkage & Primary Account Hierarchy</span>
            </h4>
            <p className="leading-relaxed text-slate-400 text-[11px]">
              Users may link up to six (6) licensed Nigerian commercial bank accounts to their primary KudiPulse profile. Each bank account represents a legitimate NUBAN verified via NIBSS Name Inquiry API.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-400">
              <li><strong>Single Active Account Rule:</strong> For maximum financial safety, exactly ONE bank account may be activated for wearable tap-to-pay settlement at any given moment. Switching active accounts requires device authorization.</li>
              <li><strong>Real-Time Balance Display:</strong> Account balances displayed adjacent to each linked bank reflect live ledger balances retrieved via Open Banking NIBSS read-only inquiry endpoints.</li>
              <li><strong>Primary Account Anchor:</strong> The designated Primary Bank serves as the fallback routing anchor for automated refund returns, merchant chargebacks, and dispute reconciliations.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 text-emerald-400">
              <span>2. Contactless Transaction Limits & 2FA Mandate</span>
            </h4>
            <p className="leading-relaxed text-slate-400 text-[11px]">
              Transactions initiated from the smartwatch simulator or physical wearable hardware adhere strictly to the tiered ceilings established by the CBN Contactless Framework:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-emerald-400 font-bold">Tap Ceiling (&le; ₦5,000):</span>
                <p className="text-slate-400">Permitted via smartwatch tap with on-watch 4-Digit Security PIN.</p>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-cyan-400 font-bold">High Value (&gt; ₦5,000):</span>
                <p className="text-slate-400">Mandatory TrueDepth Face ID / Android BiometricPrompt companion verification.</p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 text-indigo-400">
              <span>3. Hardware Cryptographic Enclaves & Zero PAN Storage</span>
            </h4>
            <p className="leading-relaxed text-slate-400 text-[11px]">
              KudiPulse does not store plaintext bank account passwords, ATM debit card Primary Account Numbers (PAN), or CVV security codes on any wearable device or cloud relay.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-400">
              <li>Transactions generate ephemeral CSPRNG nonces (16-byte random hex) valid for a strict 60-second transmission window.</li>
              <li>Cryptograms are sealed using AES-256-GCM and signed with device-specific HMAC-SHA256 hardware keys held in Android KeyStore (StrongBox) or Apple Secure Enclave.</li>
              <li>Attempted replay packets, duplicate nonces, or tampered payload signatures result in immediate transaction abortion and automatic security logging.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 text-amber-400">
              <span>4. Fraud Liability, Dispute Resolution & Instant Settlement</span>
            </h4>
            <p className="leading-relaxed text-slate-400 text-[11px]">
              Settlements executed via Flutterwave v3 or NIBSS NQR are final once an instant payment confirmation notification is generated. In the event of an unauthorized wearable tap due to device theft, immediate remote token revocation is accessible via the <strong>*Security centre</strong> dashboard.
            </p>
          </div>

          {/* User Consent Checkboxes */}
          <div className="pt-3 border-t border-slate-800 space-y-2.5 bg-slate-950/60 p-4 rounded-2xl border">
            <div className="text-xs font-bold text-white mb-1">Mandatory User Declarations:</div>
            
            <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-300">
              <input
                type="checkbox"
                checked={agreedToMandate}
                onChange={(e) => setAgreedToMandate(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
              />
              <span>
                I authorize KudiPulse to link my commercial bank accounts and acknowledge that <strong>only one account may be active for payments at any given time</strong>.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-300">
              <input
                type="checkbox"
                checked={agreedToCbn}
                onChange={(e) => setAgreedToCbn(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
              />
              <span>
                I agree to the Central Bank of Nigeria (CBN) contactless single-transaction ceiling (&le; ₦5,000 tap / biometric confirmation above threshold).
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-300">
              <input
                type="checkbox"
                checked={agreedToTokenization}
                onChange={(e) => setAgreedToTokenization(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
              />
              <span>
                I authorize cryptographic hardware key provisioning in Wear OS KeyStore / Apple Secure Enclave for contactless transaction signing.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Document Ref: KP-CBN-TC-2026-v4</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleConfirmAcceptance}
              disabled={!allAgreed}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950"
            >
              <Check className="w-4 h-4" />
              <span>Accept Terms & Conditions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
