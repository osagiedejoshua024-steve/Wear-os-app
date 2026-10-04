export interface SmartwatchPayload {
  deviceId: string;
  timestamp: number; // UTC timestamp ms
  nonce: string; // 16-byte random hex
  amount: number; // NGN
  currency: 'NGN';
  merchantId: string;
  merchantName: string;
  recipientAccount?: string; // Recipient NIBSS NIP 10-digit NUBAN
  recipientBank?: string; // Recipient Nigerian Bank
  signature: string; // HMAC-SHA256 hex
}

export interface EncryptedPacket {
  version: '1.0';
  iv: string; // Hex representation of 12-byte GCM IV
  ciphertext: string; // Base64 ciphertext
  tag: string; // Auth tag or bundled with ciphertext
  keyAlias: string;
  platform: 'wear_os' | 'watch_os';
  timestamp: number;
}

export type PaymentMode = 'bluetooth' | 'dynamic_qr';
export type DevicePlatform = 'wear_os' | 'watch_os';
export type SettlementType = 'nibss_nqr' | 'tokenized_card';

export interface LinkedBankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string; // 10-digit NUBAN
  accountName: string;
  balance: number; // In NGN
  isPrimary: boolean;
  isActiveForTransaction: boolean; // Only one active at any time
  colorTheme: string;
  cbnCode: string;
  cardLast4?: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
}

export const INITIAL_LINKED_BANKS: LinkedBankAccount[] = [
  {
    id: 'bank-zenith-01',
    bankName: 'Zenith Bank PLC',
    bankCode: '057',
    accountNumber: '0129484092',
    accountName: 'OSAGIEDE JOSHUA',
    balance: 485250.0,
    isPrimary: true,
    isActiveForTransaction: true,
    colorTheme: 'from-red-600 to-rose-700',
    cbnCode: 'ZENITH-NG',
    cardLast4: '4092',
    tier: 'Tier 3',
  },
  {
    id: 'bank-gtb-02',
    bankName: 'Guaranty Trust Bank (GTBank)',
    bankCode: '058',
    accountNumber: '0238194721',
    accountName: 'OSAGIEDE JOSHUA',
    balance: 194800.5,
    isPrimary: false,
    isActiveForTransaction: false,
    colorTheme: 'from-amber-600 to-orange-700',
    cbnCode: 'GTB-NG',
    cardLast4: '8821',
    tier: 'Tier 3',
  },
  {
    id: 'bank-access-03',
    bankName: 'Access Bank PLC',
    bankCode: '044',
    accountNumber: '0719482910',
    accountName: 'OSAGIEDE JOSHUA',
    balance: 312450.0,
    isPrimary: false,
    isActiveForTransaction: false,
    colorTheme: 'from-orange-500 to-amber-600',
    cbnCode: 'ACCESS-NG',
    cardLast4: '1910',
    tier: 'Tier 3',
  },
  {
    id: 'bank-uba-04',
    bankName: 'United Bank for Africa (UBA)',
    bankCode: '033',
    accountNumber: '2049182740',
    accountName: 'OSAGIEDE JOSHUA',
    balance: 87600.25,
    isPrimary: false,
    isActiveForTransaction: false,
    colorTheme: 'from-red-700 to-red-900',
    cbnCode: 'UBA-NG',
    cardLast4: '2740',
    tier: 'Tier 2',
  },
  {
    id: 'bank-firstbank-05',
    bankName: 'First Bank of Nigeria',
    bankCode: '011',
    accountNumber: '3029481923',
    accountName: 'OSAGIEDE JOSHUA',
    balance: 624100.0,
    isPrimary: false,
    isActiveForTransaction: false,
    colorTheme: 'from-blue-700 to-indigo-900',
    cbnCode: 'FBN-NG',
    cardLast4: '1923',
    tier: 'Tier 3',
  },
  {
    id: 'bank-kuda-06',
    bankName: 'Kuda Microfinance Bank',
    bankCode: '090267',
    accountNumber: '1102948201',
    accountName: 'OSAGIEDE JOSHUA',
    balance: 54300.0,
    isPrimary: false,
    isActiveForTransaction: false,
    colorTheme: 'from-purple-600 to-violet-800',
    cbnCode: 'KUDA-NG',
    cardLast4: '8201',
    tier: 'Tier 1',
  },
];

export type FaceIdPolicy = 'cbn_threshold' | 'always' | 'disabled';
export type FaceIdState = 'idle' | 'scanning' | 'authorized' | 'failed' | 'passcode_fallback';

export interface FaceIdAuthResult {
  success: boolean;
  biometryType: 'face_id' | 'touch_id' | 'pin_fallback';
  confidenceScore: number;
  livenessPassed: boolean;
  timestamp: number;
  error?: string;
}

export interface FlutterwaveChargeResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: 'NGN';
    charged_amount: number;
    status: 'successful' | 'pending' | 'failed';
    payment_type: 'qr' | 'card';
    auth_model: string;
    qr_code?: string;
    created_at: string;
  };
}

export interface TransactionHistoryItem {
  id: string;
  date: string; // e.g. "29 Sep 2026"
  time: string; // e.g. "01:14:22 PM"
  rawTimestamp: number;
  amount: number;
  currency: 'NGN';
  recipientName: string;
  recipientAccountNumber: string; // 10-digit NUBAN
  recipientBank: string;
  merchantId: string;
  platform: DevicePlatform;
  mode: PaymentMode;
  settlementType: SettlementType;
  status: 'successful' | 'pending' | 'failed';
  txRef: string;
  flwRef: string;
  nibssSessionId: string;
  payerName: string;
  payerAccountMasked: string;
  faceIdVerified: boolean;
  fee: number;
  terminalId: string;
}

export interface TransactionAuditLog {
  id: string;
  timestamp: string;
  amount: number;
  currency: 'NGN';
  platform: DevicePlatform;
  mode: PaymentMode;
  settlementType: SettlementType;
  status: 'validated' | 'rejected_replay' | 'rejected_nonce' | 'rejected_tamper' | 'biometrics_passed' | 'settled';
  details: string;
  txRef: string;
  flwRef?: string;
  faceIdVerified?: boolean;
}
