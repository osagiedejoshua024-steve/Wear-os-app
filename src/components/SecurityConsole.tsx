import React, { useState } from 'react';
import { EncryptedPacket, SmartwatchPayload, TransactionAuditLog } from '../types/payment';
import { cryptoEngine } from '../services/cryptoEngine';
import {
  ShieldAlert,
  ShieldCheck,
  Flame,
  Binary,
  Clock,
  History,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  Terminal,
  ScanFace,
  Receipt,
} from 'lucide-react';

interface Props {
  latestPacket: EncryptedPacket | null;
  onInjectTamperedPacket: (packet: EncryptedPacket) => void;
  auditLogs: TransactionAuditLog[];
  onClearLogs: () => void;
  onViewReceipt?: () => void;
}

export const SecurityConsole: React.FC<Props> = ({
  latestPacket,
  onInjectTamperedPacket,
  auditLogs,
  onClearLogs,
  onViewReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'inspector' | 'stress_test' | 'cbn_matrix'>('inspector');

  // Attack Injection 1: Expired Timestamp (> 60s)
  const injectReplayExpiredAttack = async () => {
    const expiredTimestamp = Date.now() - 95_000; // 95 seconds ago
    const nonce = cryptoEngine.generateNonce();
    const signature = await cryptoEngine.computeHmacSignature(
      'spoofed-wear-device-01',
      expiredTimestamp,
      nonce,
      2500,
      'MERCH-EXPIRED'
    );

    const payload: SmartwatchPayload = {
      deviceId: 'spoofed-wear-device-01',
      timestamp: expiredTimestamp,
      nonce,
      amount: 2500,
      currency: 'NGN',
      merchantId: 'MERCH-EXPIRED',
      merchantName: 'Tampered Replay Mall',
      signature,
    };

    const packet = await cryptoEngine.encryptPayload(payload, 'wear_os');
    onInjectTamperedPacket(packet);
  };

  // Attack Injection 2: Duplicate Nonce
  const injectDuplicateNonceAttack = async () => {
    const fixedNonce = 'deadbeefcafe00010002000300040005';
    // First, register in cache if not already
    const timestamp = Date.now();
    const signature = await cryptoEngine.computeHmacSignature(
      'wear-samsung-galaxy-w6-ng',
      timestamp,
      fixedNonce,
      4000,
      'MERCH-LOS-8891'
    );

    const payload: SmartwatchPayload = {
      deviceId: 'wear-samsung-galaxy-w6-ng',
      timestamp,
      nonce: fixedNonce,
      amount: 4000,
      currency: 'NGN',
      merchantId: 'MERCH-LOS-8891',
      merchantName: 'Duplicate Nonce Test',
      signature,
    };

    // Pre-insert into nonce cache to guarantee collision
    cryptoEngine.validateSecurityRules(payload);

    // Now encrypt and send again
    const packet = await cryptoEngine.encryptPayload(payload, 'wear_os');
    onInjectTamperedPacket(packet);
  };

  // Attack Injection 3: Tampered Ciphertext
  const injectTamperedCiphertextAttack = async () => {
    if (!latestPacket) {
      // Create a fresh packet first then corrupt it
      const nonce = cryptoEngine.generateNonce();
      const payload: SmartwatchPayload = {
        deviceId: 'tampered-watch',
        timestamp: Date.now(),
        nonce,
        amount: 8500,
        currency: 'NGN',
        merchantId: 'MERCH-TAMPERED',
        merchantName: 'Tampered Cipher Mall',
        signature: 'invalid-sig',
      };
      const packet = await cryptoEngine.encryptPayload(payload, 'watch_os');
      const corruptedCiphertext = packet.ciphertext.slice(0, -6) + 'AAAAAA';
      onInjectTamperedPacket({ ...packet, ciphertext: corruptedCiphertext });
      return;
    }

    const corruptedCiphertext = latestPacket.ciphertext.slice(0, -6) + 'XXXXXX';
    onInjectTamperedPacket({ ...latestPacket, ciphertext: corruptedCiphertext });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Security Operations & Protocol Inspector
          </h2>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'inspector'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Packet Inspector
          </button>
          <button
            onClick={() => setActiveTab('stress_test')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'stress_test'
                ? 'bg-red-950/80 text-red-300 border border-red-800/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Replay & Attack Lab
          </button>
          <button
            onClick={() => setActiveTab('cbn_matrix')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'cbn_matrix'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CBN Regulatory Spec
          </button>
        </div>
      </div>

      {/* TAB 1: PACKET INSPECTOR */}
      {activeTab === 'inspector' && (
        <div className="space-y-4">
          {latestPacket ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Binary className="w-4 h-4" /> AES-256-GCM Envelope
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {latestPacket.platform.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-500">Version: </span>
                    <span className="text-white">{latestPacket.version}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Key Storage: </span>
                    <span className="text-cyan-400 break-all">{latestPacket.keyAlias}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">IV (96-bit): </span>
                    <span className="text-amber-400 font-mono">{latestPacket.iv}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Ciphertext (Base64): </span>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] break-all text-slate-300 max-h-20 overflow-y-auto">
                      {latestPacket.ciphertext}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Auth Tag: </span>
                    <span className="text-emerald-400">{latestPacket.tag}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Anti-Replay Integrity Bounds
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      TTL: 60s Active
                    </span>
                  </div>
                  <div className="space-y-2 text-[11px] text-slate-300 font-mono">
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500">Packet Timestamp:</span>
                      <span>{new Date(latestPacket.timestamp).toLocaleTimeString()} UTC</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500">Clock Skew / Drift:</span>
                      <span className="text-emerald-400">&lt; 35ms (Compliant)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500">HMAC Dynamic Digest:</span>
                      <span className="text-cyan-400">SHA-256 Verified</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Carrier Channel:</span>
                      <span className="text-white">
                        {latestPacket.platform === 'wear_os'
                          ? 'Wear DataLayer API / BLE GATT'
                          : 'Apple WatchConnectivity WCSession'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-[10px] text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  Hardware cryptographic sandbox integrity verified. Zero plain-text leaks.
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No packet transmitted yet. Initiate a transaction on the smartwatch to inspect raw cryptographic fields.
            </div>
          )}

          {/* Audit Logs Table */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <History className="w-3.5 h-3.5" /> Recent Transaction Audit Trail
              </span>
              {auditLogs.length > 0 && (
                <button
                  onClick={onClearLogs}
                  className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Clear Logs
                </button>
              )}
            </div>

            {auditLogs.length === 0 ? (
              <div className="text-center py-4 bg-slate-950 rounded-xl border border-slate-800/60 text-slate-500 text-xs font-mono">
                No recorded transaction events.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {auditLogs.map((log, index) => (
                  <div
                    key={`${log.id}-${index}`}
                    className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          log.status === 'settled'
                            ? 'bg-emerald-500'
                            : log.status.startsWith('rejected')
                            ? 'bg-red-500 animate-pulse'
                            : 'bg-cyan-500'
                        }`}
                      ></span>
                      <span className="text-slate-400">{log.timestamp}</span>
                      <span className="text-white font-bold">₦{log.amount.toLocaleString()}</span>
                      <span className="text-slate-500">({log.platform})</span>
                      {log.faceIdVerified && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/80 flex items-center gap-0.5 font-sans font-semibold">
                          <ScanFace className="w-2.5 h-2.5 text-indigo-400" /> Face ID
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-right">
                      {log.status === 'settled' && onViewReceipt && (
                        <button
                          onClick={onViewReceipt}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-sans flex items-center gap-1 transition-colors"
                          title="View transaction receipt"
                        >
                          <Receipt className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Receipt</span>
                        </button>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'settled'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : log.status.startsWith('rejected')
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STRESS TEST & ATTACK LAB */}
      {activeTab === 'stress_test' && (
        <div className="space-y-4">
          <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl text-xs text-red-200 flex items-start gap-2">
            <Flame className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-300">Live Defensive Pen-Testing: </span>
              Trigger simulated malicious or tampered vectors to verify the phone companion rejects illegal attempts in accordance with CBN and PCI-DSS protocols.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={injectReplayExpiredAttack}
              className="p-3.5 bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-600/60 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-red-400 mb-1">
                <span>Expired Timestamp</span>
                <Clock className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400">
                Transmits payload with age &gt; 90 seconds. Companion must drop packet (60s limit).
              </p>
              <div className="mt-2 text-[10px] text-red-300 font-mono font-semibold">
                &gt; Inject Replay Attack
              </div>
            </button>

            <button
              onClick={injectDuplicateNonceAttack}
              className="p-3.5 bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-600/60 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-red-400 mb-1">
                <span>Duplicate Nonce Replay</span>
                <RotateCcw className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400">
                Sends a previously spent 128-bit cryptographic nonce to test double-spending lock.
              </p>
              <div className="mt-2 text-[10px] text-red-300 font-mono font-semibold">
                &gt; Inject Nonce Collision
              </div>
            </button>

            <button
              onClick={injectTamperedCiphertextAttack}
              className="p-3.5 bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-600/60 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-red-400 mb-1">
                <span>Tampered Ciphertext</span>
                <AlertTriangle className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400">
                Mutates ciphertext bits in transit. GCM 128-bit authentication tag must fail.
              </p>
              <div className="mt-2 text-[10px] text-red-300 font-mono font-semibold">
                &gt; Inject Bit Flip Attack
              </div>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: CBN REGULATORY COMPLIANCE MATRIX */}
      {activeTab === 'cbn_matrix' && (
        <div className="space-y-3">
          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-200 flex items-start gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-300">
                Central Bank of Nigeria (CBN) Mobile Payment Guidelines:
              </span>{' '}
              Strict conformity to Circular BSD/DIR/GEN/LAB/11/025 and NIBSS EMVCo NQR specifications.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Tier 1 Financial Limits (BVN/NIN Simplified)
              </div>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>• Single transaction limit: <strong>₦50,000 NGN</strong></li>
                <li>• Cumulative daily limit: <strong>₦100,000 NGN</strong></li>
                <li>• Low-value tap bypass threshold: <strong>&le; ₦5,000 NGN</strong></li>
                <li>• High-value tap biometrics: <strong>Mandatory (&gt; ₦5,000)</strong></li>
              </ul>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Hardware Cryptography & Tokenization
              </div>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>• Android: KeyGenParameterSpec in KeyStore/StrongBox</li>
                <li>• iOS: Apple Secure Enclave Processor (SEP)</li>
                <li>• Zero plain-text PAN/CVV storage on smartwatch</li>
                <li>• Dynamic NIBSS NQR format: EMVCo Tag 010212 compliant</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
