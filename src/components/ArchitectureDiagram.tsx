import React, { useState } from 'react';
import {
  Watch,
  Smartphone,
  ShieldCheck,
  Server,
  Building2,
  ArrowRight,
  Radio,
  Fingerprint,
  Lock,
  Zap,
  CheckCircle,
  Cpu,
} from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  const [activeNode, setActiveNode] = useState<number>(1);

  const nodes = [
    {
      step: 1,
      title: 'Smartwatch Enclave',
      subtitle: 'Wear OS & watchOS',
      icon: <Watch className="w-5 h-5 text-emerald-400" />,
      detailTitle: 'Edge Hardware & Payload Cryptography',
      detailDesc:
        'The user selects an amount in Nigerian Naira (NGN). The watch generates a 128-bit CSPRNG nonce, captures UTC epoch, signs via HMAC-SHA256, and encrypts using AES-256-GCM via Android KeyStore or Apple Secure Enclave.',
      specs: [
        'Cipher: AES-256-GCM (96-bit IV, 128-bit Tag)',
        'Integrity: HMAC-SHA256',
        'Hardware: Android StrongBox / Apple SEP',
      ],
    },
    {
      step: 2,
      title: 'Wireless Bridge',
      subtitle: 'DataLayer / WCSession',
      icon: <Radio className="w-5 h-5 text-cyan-400" />,
      detailTitle: 'Secure Transport & Fallback Layer',
      detailDesc:
        'Packets are transmitted via high-speed, local dual-device protocols. Android utilizes Google Play Services DataClient with BLE GATT peripheral fallback. iOS utilizes WatchConnectivity WCSession with transferUserInfo queue.',
      specs: [
        'Android: DataClient.putDataItem() (Urgent)',
        'iOS: WCSession.default.sendMessage()',
        'Offline Fallback: BLE GATT Peripheral',
      ],
    },
    {
      step: 3,
      title: 'Phone Companion',
      subtitle: 'Anti-Replay & Biometrics',
      icon: <Smartphone className="w-5 h-5 text-blue-400" />,
      detailTitle: 'Security Verification & Biometric Gate',
      detailDesc:
        'Background listeners receive the encrypted packet. Validates timestamp freshness (rejects > 60s per CBN rule) and duplicate nonces. If amount exceeds ₦5,000, prompts Face ID / Fingerprint via local_auth.',
      specs: [
        'Anti-Replay TTL: 60,000 ms sliding window',
        'Duplicate Nonce rejection cache',
        'Biometric Gate: Triggered when Amount > ₦5,000',
      ],
    },
    {
      step: 4,
      title: 'Flutterwave v3 API',
      subtitle: 'Settlement Engine',
      icon: <Server className="w-5 h-5 text-amber-400" />,
      detailTitle: 'NQR & Direct Settlement Dispatch',
      detailDesc:
        'Calls Flutterwave v3 endpoints with Bearer FLWSECK token. Generates dynamic NIBSS NQR or executes card token charge. Runs resilient polling loop on /v3/transactions/:id/verify before returning haptic confirmation.',
      specs: [
        'Dynamic NQR: POST /v3/charges?type=nibss_qr',
        'Tokenized Card: POST /v3/tokenized-charges',
        'Verification: GET /v3/transactions/:id/verify',
      ],
    },
    {
      step: 5,
      title: 'NIBSS & Switch',
      subtitle: 'CBN Interbank Settlement',
      icon: <Building2 className="w-5 h-5 text-purple-400" />,
      detailTitle: 'Central Bank & Interbank Clearing',
      detailDesc:
        'Nigeria Inter-Bank Settlement System (NIBSS) clears the transaction via NIP (NIBSS Instant Payments) or EMVCo NQR switch directly crediting the merchant store account.',
      specs: [
        'Switch: NIBSS Instant Payments (NIP)',
        'Clearing Speed: Sub-second RTGS settlement',
        'CBN Tier Compliance: Full audit logging',
      ],
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Dual-Device Smartwatch Tap-to-Pay System Architecture
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          End-to-end cryptographic and settlement pipeline across Wear OS, watchOS, Flutter Companion, and Flutterwave v3 / NIBSS.
        </p>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 relative">
        {nodes.map((node) => (
          <button
            key={node.step}
            onClick={() => setActiveNode(node.step)}
            className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
              activeNode === node.step
                ? 'bg-slate-800 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white font-mono">
                  0{node.step}
                </span>
                {node.icon}
              </div>
              <div className="text-xs font-bold text-white leading-snug">
                {node.title}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {node.subtitle}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
              <span>{activeNode === node.step ? 'Active Spec' : 'Inspect'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>

      {/* Selected Node Deep Dive Inspector */}
      {(() => {
        const current = nodes.find((n) => n.step === activeNode) || nodes[0];
        return (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">
                  {current.step}
                </span>
                <span className="text-sm font-bold text-white">
                  {current.detailTitle}
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
                {current.subtitle}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {current.detailDesc}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
              {current.specs.map((spec, i) => (
                <div
                  key={i}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{spec}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
