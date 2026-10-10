import { CountryCode, CurrencyCode, CurrencyConfig, SiteSettings, UCProduct } from '../types';

export const HERO_BANNER_IMG = '/src/assets/images/pubg_hero_banner_1791224409856.jpg';
export const UC_CHEST_IMG = '/src/assets/images/uc_coins_chest_1791224425460.jpg';
export const UC_STACK_IMG = '/src/assets/images/uc_coins_stack_1791224441585.jpg';
export const ROYALE_PASS_IMG = '/src/assets/images/pubg_royale_pass_1791224456309.jpg';

export const ADMIN_EMAIL = 'princemadni88@gmail.com';
export const ADMIN_ACCESS_CODES = ['madnijamrahi', '8899', '7860'];

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  PKR: {
    code: 'PKR',
    name: 'Pakistani Rupee',
    symbol: '₨',
    country: 'PK',
    countryName: 'Pakistan',
    flag: '🇵🇰',
    format: (amount: number) => `₨ ${amount.toLocaleString()}`,
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    country: 'GB',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    format: (amount: number) => `£${amount.toFixed(2)}`,
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    country: 'US',
    countryName: 'United States',
    flag: '🇺🇸',
    format: (amount: number) => `$${amount.toFixed(2)}`,
  },
};

export const INITIAL_PRODUCTS: UCProduct[] = [
  {
    id: 'uc_60',
    name: '60 UC',
    ucAmount: 60,
    bonusUc: 0,
    image: UC_STACK_IMG,
    category: 'standard',
    prices: {
      PKR: 290,
      GBP: 0.89,
      USD: 0.99,
    },
    status: 'active',
    sortOrder: 1,
  },
  {
    id: 'uc_325',
    name: '300 + 25 UC',
    ucAmount: 300,
    bonusUc: 25,
    image: UC_STACK_IMG,
    category: 'popular',
    badge: 'Popular',
    prices: {
      PKR: 1390,
      GBP: 4.29,
      USD: 4.99,
    },
    promoPrices: {
      PKR: 1320,
      GBP: 3.99,
      USD: 4.49,
    },
    isPromo: true,
    status: 'active',
    sortOrder: 2,
  },
  {
    id: 'uc_660',
    name: '600 + 60 UC',
    ucAmount: 600,
    bonusUc: 60,
    image: ROYALE_PASS_IMG,
    category: 'royale_pass',
    badge: 'Royale Pass',
    prices: {
      PKR: 2690,
      GBP: 8.49,
      USD: 9.99,
    },
    promoPrices: {
      PKR: 2550,
      GBP: 7.99,
      USD: 9.29,
    },
    isPromo: true,
    status: 'active',
    sortOrder: 3,
  },
  {
    id: 'uc_1800',
    name: '1500 + 300 UC',
    ucAmount: 1500,
    bonusUc: 300,
    image: UC_CHEST_IMG,
    category: 'standard',
    badge: '+20% Extra',
    prices: {
      PKR: 6690,
      GBP: 20.99,
      USD: 24.99,
    },
    status: 'active',
    sortOrder: 4,
  },
  {
    id: 'uc_3850',
    name: '3000 + 850 UC',
    ucAmount: 3000,
    bonusUc: 850,
    image: UC_CHEST_IMG,
    category: 'popular',
    badge: 'Best Value',
    prices: {
      PKR: 13290,
      GBP: 41.99,
      USD: 49.99,
    },
    promoPrices: {
      PKR: 12800,
      GBP: 39.99,
      USD: 47.99,
    },
    isPromo: true,
    status: 'active',
    sortOrder: 5,
  },
  {
    id: 'uc_8100',
    name: '6000 + 2100 UC',
    ucAmount: 6000,
    bonusUc: 2100,
    image: UC_CHEST_IMG,
    category: 'special',
    badge: 'Mega Bundle',
    prices: {
      PKR: 25990,
      GBP: 82.99,
      USD: 99.99,
    },
    status: 'active',
    sortOrder: 6,
  },
  {
    id: 'rp_elite_plus',
    name: 'Royale Pass Elite Plus',
    ucAmount: 1800,
    bonusUc: 0,
    image: ROYALE_PASS_IMG,
    category: 'royale_pass',
    badge: 'Elite Pass +25 Ranks',
    prices: {
      PKR: 7990,
      GBP: 24.99,
      USD: 29.99,
    },
    status: 'active',
    sortOrder: 7,
  },
  {
    id: 'uc_16200',
    name: '12000 + 4200 UC (Mythic Crate)',
    ucAmount: 12000,
    bonusUc: 4200,
    image: UC_CHEST_IMG,
    category: 'special',
    badge: 'Mythic Pack',
    prices: {
      PKR: 51900,
      GBP: 164.99,
      USD: 199.99,
    },
    status: 'active',
    sortOrder: 8,
  },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  storeName: 'Vortex UC Store',
  supportEmail: 'support@vortextopup.com',
  supportWhatsapp: '+92 300 1234567',
  announcement: '⚡ Instant Automated Processing: All UC packs dispatched directly via Official PUBG Player ID within 5–15 minutes!',
  deliveryEstimateMinutes: 10,
  paymentInstructions: {
    PKR: {
      jazzCash: {
        title: 'JazzCash Direct Wallet',
        number: '0300-1234567 (Account Title: Vortex Gaming Store)',
        instructions: 'Send exact PKR amount via JazzCash App or *786#. In the reference/purpose, enter your Order Number. Take a screenshot of the confirmation SMS or app receipt.',
      },
      easyPaisa: {
        title: 'Easypaisa Mobile Account',
        number: '0345-9876543 (Account Title: Vortex Gaming Store)',
        instructions: 'Transfer through Easypaisa App. Keep your Order ID in reference. Save receipt screenshot and Transaction ID.',
      },
    },
    paypal: {
      email: 'payments@vortextopup.com',
      accountName: 'Vortex Global Tech Ltd',
      instructions: 'Send payment to our verified PayPal email. Enter your Order Number in the transfer note and upload payment screenshot.',
    },
    payoneer: {
      email: 'payoneer@vortextopup.com',
      accountName: 'Vortex Digital Solutions',
      instructions: 'Transfer via Payoneer "Make a Payment to recipient Payoneer account" (0% fee). Put your Order Number in remarks and save receipt.',
    },
    GBP: {
      bankTransfer: {
        bankName: 'Barclays Bank UK',
        accountName: 'Vortex Global Tech Ltd',
        sortCode: '20-45-77',
        accountNumber: '83921045',
        iban: 'GB29BARC20457783921045',
      },
      revolutTag: '@vortexcash (Revolut Direct Transfer)',
    },
    USD: {
      bankTransfer: {
        bankName: 'JPMorgan Chase Bank, N.A.',
        routingNumber: '021000021',
        accountNumber: '9283746102',
        swiftBic: 'CHASUS33',
      },
      zelleOrWise: 'payments@vortextopup.com (Zelle / Wise Direct)',
    },
  },
  gatewayConfig: {
    testMode: true,
    merchantName: 'Vortex Payments International',
    enabledCurrencies: ['PKR', 'GBP', 'USD'],
    supportedCards: ['Visa', 'Mastercard', 'UnionPay'],
  },
};
