import { FlutterwaveChargeResponse, SettlementType } from '../types/payment';

class FlutterwaveSimulator {
  private secretKeyMasked = 'FLWSECK_TEST-7a91***90b-X';

  public async initiateCharge(params: {
    amount: number;
    currency: 'NGN';
    email: string;
    txRef: string;
    type: SettlementType;
    merchantName: string;
    deviceId: string;
  }): Promise<FlutterwaveChargeResponse> {
    // Simulate network roundtrip latency to Flutterwave Lagos edge
    await new Promise((resolve) => setTimeout(resolve, 600));

    const id = Math.floor(1000000 + Math.random() * 9000000);
    const flwRef = `FLW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (params.type === 'nibss_nqr') {
      // Generate standard EMVCo/NIBSS compliant NQR specification string
      const nqrRaw = `00020101021226580010ng.nibss.nqr0114KUDIPULSE_MERCH0208${params.txRef}52045311530356654${params.amount.toFixed(2).length.toString().padStart(2, '0')}${params.amount.toFixed(2)}5802NG5915${params.merchantName.slice(0, 15)}6005LAGOS6304`;
      
      return {
        status: 'success',
        message: 'NIBSS NQR charge initiated successfully',
        data: {
          id,
          tx_ref: params.txRef,
          flw_ref: flwRef,
          amount: params.amount,
          currency: 'NGN',
          charged_amount: params.amount,
          status: 'pending',
          payment_type: 'qr',
          auth_model: 'NIBSS_INSTANT_PAYMENT_NIP',
          qr_code: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%230F172A"/><text x="100" y="100" fill="%2310B981" font-size="12" text-anchor="middle">NIBSS NQR: ₦${params.amount.toLocaleString()}</text></svg>`,
          created_at: new Date().toISOString(),
        },
      };
    } else {
      // Direct tokenized charge flow
      return {
        status: 'success',
        message: 'Charge initiated with pre-authorized device token',
        data: {
          id,
          tx_ref: params.txRef,
          flw_ref: flwRef,
          amount: params.amount,
          currency: 'NGN',
          charged_amount: params.amount,
          status: 'pending',
          payment_type: 'card',
          auth_model: 'HARDWARE_TOKEN_AUTH',
          created_at: new Date().toISOString(),
        },
      };
    }
  }

  public async pollTransactionVerification(
    transactionId: number,
    expectedAmount: number,
    onStepUpdate?: (step: string) => void
  ): Promise<FlutterwaveChargeResponse> {
    onStepUpdate?.('Connecting to Flutterwave Switch (Lagos AWS af-south-1)...');
    await new Promise((r) => setTimeout(r, 450));

    onStepUpdate?.('Verifying interbank settlement against NIBSS / Central Bank RTGS...');
    await new Promise((r) => setTimeout(r, 600));

    onStepUpdate?.('Dispatching cryptographic receipt confirmation to smartwatch DataLayer...');
    await new Promise((r) => setTimeout(r, 400));

    return {
      status: 'success',
      message: 'Tx fetched successfully',
      data: {
        id: transactionId,
        tx_ref: `KUDI-TX-${transactionId}`,
        flw_ref: `FLW-VERIFIED-${transactionId}`,
        amount: expectedAmount,
        currency: 'NGN',
        charged_amount: expectedAmount,
        status: 'successful',
        payment_type: 'qr',
        auth_model: 'AUTH_COMPLETED_SUCCESS',
        created_at: new Date().toISOString(),
      },
    };
  }

  public getSecretKeyMasked(): string {
    return this.secretKeyMasked;
  }
}

export const flutterwaveSimulator = new FlutterwaveSimulator();
