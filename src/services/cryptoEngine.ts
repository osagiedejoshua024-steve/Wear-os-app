import { SmartwatchPayload, EncryptedPacket, DevicePlatform } from '../types/payment';

// Master shared demo secret key (in real production, derived via ECDH & hardware KeyStore / Secure Enclave)
const SHARED_HMAC_SECRET = 'KudiPulse_TacOps_HMAC_MasterSecret_NGN_2026_SecAuth';
const SHARED_AES_HEX = 'a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff00';

class CryptoEngine {
  private nonceCache: Set<string> = new Set();
  private hmacKeyPromise: Promise<CryptoKey> | null = null;
  private aesKeyPromise: Promise<CryptoKey> | null = null;

  constructor() {
    this.initKeys();
  }

  private async initKeys() {
    // Import HMAC Key
    const enc = new TextEncoder();
    this.hmacKeyPromise = window.crypto.subtle.importKey(
      'raw',
      enc.encode(SHARED_HMAC_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    // Import AES-256 Key
    const rawAes = new Uint8Array(
      SHARED_AES_HEX.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    this.aesKeyPromise = window.crypto.subtle.importKey(
      'raw',
      rawAes,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  public generateNonce(): string {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  public async computeHmacSignature(
    deviceId: string,
    timestamp: number,
    nonce: string,
    amount: number,
    merchantId: string
  ): Promise<string> {
    const key = await this.hmacKeyPromise!;
    const message = `${deviceId}|${timestamp}|${nonce}|${amount.toFixed(2)}|${merchantId}`;
    const enc = new TextEncoder();
    const signatureBuffer = await window.crypto.subtle.sign(
      'HMAC',
      key,
      enc.encode(message)
    );
    return Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  public async verifyHmacSignature(payload: SmartwatchPayload): Promise<boolean> {
    const expectedSig = await this.computeHmacSignature(
      payload.deviceId,
      payload.timestamp,
      payload.nonce,
      payload.amount,
      payload.merchantId
    );
    return expectedSig === payload.signature;
  }

  public async encryptPayload(
    payload: SmartwatchPayload,
    platform: DevicePlatform
  ): Promise<EncryptedPacket> {
    const key = await this.aesKeyPromise!;
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const plaintext = enc.encode(JSON.stringify(payload));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128,
      },
      key,
      plaintext
    );

    const ciphertext = btoa(
      String.fromCharCode(...new Uint8Array(encryptedBuffer))
    );
    const ivHex = Array.from(iv)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return {
      version: '1.0',
      iv: ivHex,
      ciphertext,
      tag: '128-bit-GCM-Tag-Integrated',
      keyAlias: platform === 'wear_os' ? 'AndroidKeyStore:KudiTapMasterKey' : 'AppleSecureEnclave:KudiTapEnclaveKey',
      platform,
      timestamp: Date.now(),
    };
  }

  public async decryptPayload(packet: EncryptedPacket): Promise<{
    success: boolean;
    payload?: SmartwatchPayload;
    error?: string;
  }> {
    try {
      const key = await this.aesKeyPromise!;
      const iv = new Uint8Array(
        packet.iv.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
      );
      const binaryString = atob(packet.ciphertext);
      const encryptedBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        encryptedBytes[i] = binaryString.charCodeAt(i);
      }

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128,
        },
        key,
        encryptedBytes
      );

      const dec = new TextDecoder();
      const payload: SmartwatchPayload = JSON.parse(dec.decode(decryptedBuffer));
      return { success: true, payload };
    } catch (e: any) {
      return {
        success: false,
        error: `AES-256-GCM Decryption Failure: Tampered ciphertext or invalid authentication tag (${e.message || 'Tag verification error'})`,
      };
    }
  }

  public validateSecurityRules(
    payload: SmartwatchPayload,
    toleranceMs: number = 60000
  ): {
    valid: boolean;
    reason?: string;
    code?: 'EXPIRED_TIMESTAMP' | 'DUPLICATE_NONCE' | 'INVALID_SIGNATURE' | 'OK';
  } {
    const now = Date.now();
    const age = now - payload.timestamp;

    // 1. Replay attack check: reject timestamps older than tolerance or future drifted > 10s
    if (age > toleranceMs) {
      return {
        valid: false,
        reason: `Replay Attack Alert: Timestamp age is ${(age / 1000).toFixed(1)}s (Threshold limit: 60s). Packet dropped per CBN mobile protocol.`,
        code: 'EXPIRED_TIMESTAMP',
      };
    }
    if (age < -10000) {
      return {
        valid: false,
        reason: `Clock Drift Anomaly: Smartwatch clock is in the future by ${Math.abs(age / 1000).toFixed(1)}s.`,
        code: 'EXPIRED_TIMESTAMP',
      };
    }

    // 2. Duplicate nonce check: reject duplicate nonces
    if (this.nonceCache.has(payload.nonce)) {
      return {
        valid: false,
        reason: `Duplicate Nonce Detected: Nonce '${payload.nonce.slice(0, 10)}...' was previously spent. Anti-replay enforcement active.`,
        code: 'DUPLICATE_NONCE',
      };
    }

    // Record nonce in sliding cache
    this.nonceCache.add(payload.nonce);
    // Keep cache bounded
    if (this.nonceCache.size > 2000) {
      const first = this.nonceCache.values().next().value;
      if (first) this.nonceCache.delete(first);
    }

    return { valid: true, code: 'OK' };
  }

  public resetNonceCache() {
    this.nonceCache.clear();
  }
}

export const cryptoEngine = new CryptoEngine();
