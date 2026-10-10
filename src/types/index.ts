export type CountryCode = 'PK' | 'GB' | 'US';
export type CurrencyCode = 'PKR' | 'GBP' | 'USD';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  country: CountryCode;
  countryName: string;
  flag: string;
  format: (amount: number) => string;
}

export interface UCProduct {
  id: string;
  name: string;
  ucAmount: number;
  bonusUc: number;
  image: string;
  category: 'standard' | 'popular' | 'royale_pass' | 'special';
  prices: {
    PKR: number;
    GBP: number;
    USD: number;
  };
  promoPrices?: {
    PKR?: number;
    GBP?: number;
    USD?: number;
  };
  isPromo?: boolean;
  status: 'active' | 'disabled';
  badge?: string;
  sortOrder: number;
}

export type OrderStatus =
  | 'Awaiting Payment'
  | 'Payment Submitted'
  | 'Pending Verification'
  | 'Payment Confirmed'
  | 'Processing'
  | 'Delivered'
  | 'Rejected'
  | 'Refunded';

export type PaymentMethodType = 'card' | 'manual';

export interface Order {
  id?: string;
  orderNumber: string;
  playerId: string;
  playerNickname?: string;
  productId: string;
  productName: string;
  ucAmount: number;
  bonusUc: number;
  country: CountryCode;
  currency: CurrencyCode;
  amount: number;
  paymentMethod: PaymentMethodType;
  status: OrderStatus;
  customerEmail: string;
  customerPhone?: string;
  adminNote?: string;
  rejectionReason?: string;
  deliveryConfirmedAt?: string;
  deliveredBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSubmission {
  id?: string;
  orderNumber: string;
  orderId?: string;
  payerName: string;
  transactionId: string;
  amount: number;
  currency: CurrencyCode;
  receiptUrl: string;
  paymentNote?: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInstructions {
  PKR: {
    jazzCash: { title: string; number: string; instructions: string };
    easyPaisa: { title: string; number: string; instructions: string };
    bankTransfer?: { bankName: string; accountTitle: string; accountNumber: string; iban: string };
  };
  paypal: { email: string; accountName: string; instructions: string };
  payoneer: { email: string; accountName: string; instructions: string };
  GBP: {
    bankTransfer: { bankName: string; accountName: string; sortCode: string; accountNumber: string; iban: string };
    revolutTag: string;
  };
  USD: {
    bankTransfer: { bankName: string; routingNumber: string; accountNumber: string; swiftBic: string };
    zelleOrWise: string;
  };
}

export interface GatewayConfig {
  testMode: boolean;
  enabledCurrencies: CurrencyCode[];
  merchantName: string;
  supportedCards: string[];
}

export interface SiteSettings {
  storeName: string;
  supportEmail: string;
  supportWhatsapp: string;
  announcement: string;
  paymentInstructions: PaymentInstructions;
  gatewayConfig: GatewayConfig;
  deliveryEstimateMinutes: number;
  updatedAt?: string;
}

export interface AuditLog {
  id?: string;
  action: string;
  performedBy: string;
  orderNumber?: string;
  details: string;
  timestamp: string;
}
