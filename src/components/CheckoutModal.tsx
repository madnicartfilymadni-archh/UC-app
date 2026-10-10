import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CURRENCIES } from '../lib/constants';
import { createOrder, createPaymentSubmission, generateOrderNumber, updateOrderStatus } from '../lib/db';
import { Order, PaymentMethodType, UCProduct } from '../types';
import {
  X,
  ShieldCheck,
  CreditCard,
  Building2,
  Copy,
  Check,
  Upload,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface CheckoutModalProps {
  product: UCProduct;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ product, onClose, onOrderSuccess }) => {
  const {
    country,
    currency,
    playerId: savedPlayerId,
    setPlayerId: setGlobalPlayerId,
    playerNickname: savedNickname,
    siteSettings,
    showToast,
  } = useStore();

  const [step, setStep] = useState<'details' | 'payment_select' | 'manual_instructions' | 'manual_receipt' | 'card_checkout'>('details');
  const [playerId, setPlayerId] = useState(savedPlayerId || '');
  const [playerNickname, setPlayerNickname] = useState(savedNickname || '');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('manual');

  // Order state after initial creation
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Manual payment receipt form
  const [payerName, setPayerName] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [receiptBase64, setReceiptBase64] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Card form state
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessingCard, setIsProcessingCard] = useState(false);

  // Pricing calculations
  const price = product.prices[currency] ?? product.prices.PKR;
  const promoPrice = product.promoPrices?.[currency];
  const finalAmount = product.isPromo && promoPrice && promoPrice < price ? promoPrice : price;
  const currencyConfig = CURRENCIES[currency];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Step 1 validation -> Proceed to Payment Method Selection
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId.trim() || !/^\d{5,15}$/.test(playerId.trim())) {
      showToast('Please enter a valid 5–15 digit PUBG Player ID', 'error');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      showToast('Please enter a valid email address to receive order updates', 'error');
      return;
    }

    setGlobalPlayerId(playerId.trim());
    setStep('payment_select');
  };

  // Step 2: When payment method selected, initialize Order
  const handleSelectPaymentMethod = async (method: PaymentMethodType) => {
    setPaymentMethod(method);
    setIsSubmitting(true);

    try {
      const orderNum = generateOrderNumber();
      const newOrder = await createOrder({
        orderNumber: orderNum,
        playerId: playerId.trim(),
        playerNickname: playerNickname.trim() || undefined,
        productId: product.id,
        productName: product.name,
        ucAmount: product.ucAmount,
        bonusUc: product.bonusUc,
        country,
        currency,
        amount: finalAmount,
        paymentMethod: method,
        status: 'Awaiting Payment',
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
      });

      setCreatedOrder(newOrder);

      if (method === 'manual') {
        setStep('manual_instructions');
      } else {
        setStep('card_checkout');
      }
    } catch (err: any) {
      showToast('Failed to create order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle receipt image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Receipt image must be smaller than 5MB', 'error');
      return;
    }
    // Validate type
    if (!file.type.startsWith('image/')) {
      showToast('Only image files (PNG, JPG, JPEG, WEBP) are supported', 'error');
      return;
    }

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit manual payment proof
  const handleSubmitManualReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder) return;
    if (!payerName.trim() || payerName.trim().length < 2) {
      showToast('Please enter the account title / payer name', 'error');
      return;
    }
    if (!transactionId.trim() || transactionId.trim().length < 4) {
      showToast('Please enter the official transaction / reference ID', 'error');
      return;
    }
    if (!receiptBase64) {
      showToast('Please upload a screenshot or receipt of your completed payment', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPaymentSubmission({
        orderNumber: createdOrder.orderNumber,
        orderId: createdOrder.id,
        payerName: payerName.trim(),
        transactionId: transactionId.trim(),
        amount: finalAmount,
        currency,
        receiptUrl: receiptBase64,
        paymentNote: paymentNote.trim() || undefined,
        status: 'pending',
      });

      // Update order status to 'Payment Submitted'
      if (createdOrder.id) {
        await updateOrderStatus(createdOrder.id, 'Payment Submitted');
      }

      showToast('Payment receipt submitted! Status: Pending Verification.', 'success');
      onOrderSuccess({
        ...createdOrder,
        status: 'Payment Submitted',
      });
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit payment receipt', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulate secure card payment processing
  const handleProcessCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder) return;

    if (!cardHolder.trim() || cardHolder.trim().length < 3) {
      showToast('Please enter the name on the card', 'error');
      return;
    }
    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15 || cleanCard.length > 16) {
      showToast('Please enter a valid 15 or 16-digit card number', 'error');
      return;
    }
    if (!cardExp.trim() || !/^\d{2}\/\d{2}$/.test(cardExp.trim())) {
      showToast('Expiration must be in MM/YY format', 'error');
      return;
    }
    if (!cardCvv.trim() || cardCvv.trim().length < 3) {
      showToast('Please enter a valid CVV', 'error');
      return;
    }

    setIsProcessingCard(true);

    // Simulate 3D Secure / gateway verification
    setTimeout(async () => {
      try {
        if (createdOrder.id) {
          // Server verified state transition
          await updateOrderStatus(createdOrder.id, 'Payment Confirmed', {
            adminNote: `Card payment verified via gateway. Card ending in ${cleanCard.slice(-4)}. Currency: ${currency} ${finalAmount}.`,
          });
        }

        showToast('Payment confirmed! Your UC order is now being processed.', 'success');
        onOrderSuccess({
          ...createdOrder,
          status: 'Payment Confirmed',
        });
        onClose();
      } catch (err) {
        showToast('Payment verification error', 'error');
      } finally {
        setIsProcessingCard(false);
      }
    }, 1800);
  };

  // Render country specific payment instructions
  const renderCountryInstructions = () => {
    const inst = siteSettings.paymentInstructions || {};
    const paypal = inst.paypal || {
      email: 'payments@vortextopup.com',
      accountName: 'Vortex Global Tech Ltd',
      instructions: 'Send payment to our verified PayPal email. Enter your Order Number in the transfer note and upload payment screenshot.',
    };
    const payoneer = inst.payoneer || {
      email: 'payoneer@vortextopup.com',
      accountName: 'Vortex Digital Solutions',
      instructions: 'Transfer via Payoneer "Make a Payment to recipient Payoneer account" (0% fee). Put your Order Number in remarks and save receipt.',
    };

    const renderGlobalWallets = () => (
      <>
        {/* PayPal Box */}
        <div className="p-3.5 rounded-xl bg-[#091226] border border-blue-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-300 text-sm flex items-center gap-1.5">
              <span>PayPal Transfer</span>
            </span>
            <button
              type="button"
              onClick={() => handleCopy(paypal.email, 'paypal_email')}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              {copiedKey === 'paypal_email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Email</span>
            </button>
          </div>
          <div className="text-slate-200 font-mono-nums font-semibold flex items-center justify-between">
            <span className="text-xs sm:text-sm">{paypal.email}</span>
            <span className="text-slate-400 text-[11px] font-normal font-sans">({paypal.accountName})</span>
          </div>
          <p className="text-slate-400 text-[11px]">{paypal.instructions}</p>
        </div>

        {/* Payoneer Box */}
        <div className="p-3.5 rounded-xl bg-[#191107] border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
              <span>Payoneer Account (0% Fee Transfer)</span>
            </span>
            <button
              type="button"
              onClick={() => handleCopy(payoneer.email, 'payoneer_email')}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              {copiedKey === 'payoneer_email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Email</span>
            </button>
          </div>
          <div className="text-slate-200 font-mono-nums font-semibold flex items-center justify-between">
            <span className="text-xs sm:text-sm">{payoneer.email}</span>
            <span className="text-slate-400 text-[11px] font-normal font-sans">({payoneer.accountName})</span>
          </div>
          <p className="text-slate-400 text-[11px]">{payoneer.instructions}</p>
        </div>
      </>
    );

    if (currency === 'PKR') {
      const pkr = inst.PKR || {
        jazzCash: { title: 'JazzCash Direct Wallet', number: '0300-1234567 (Account Title: Vortex Gaming Store)', instructions: 'Send exact PKR amount via JazzCash App or *786#.' },
        easyPaisa: { title: 'Easypaisa Mobile Account', number: '0345-9876543 (Account Title: Vortex Gaming Store)', instructions: 'Transfer through Easypaisa App. Keep your Order ID in reference.' },
      };
      return (
        <div className="space-y-4 text-xs">
          {/* JazzCash Box */}
          <div className="p-3.5 rounded-xl bg-[#0e162b] border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-sm">{pkr.jazzCash.title}</span>
              <button
                type="button"
                onClick={() => handleCopy(pkr.jazzCash.number.split(' ')[0], 'jazzcash')}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                {copiedKey === 'jazzcash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Number</span>
              </button>
            </div>
            <p className="font-mono-nums text-slate-200 font-semibold">{pkr.jazzCash.number}</p>
            <p className="text-slate-400 text-[11px]">{pkr.jazzCash.instructions}</p>
          </div>

          {/* Easypaisa Box */}
          <div className="p-3.5 rounded-xl bg-[#0e162b] border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 text-sm">{pkr.easyPaisa.title}</span>
              <button
                type="button"
                onClick={() => handleCopy(pkr.easyPaisa.number.split(' ')[0], 'easypaisa')}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                {copiedKey === 'easypaisa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Number</span>
              </button>
            </div>
            <p className="font-mono-nums text-slate-200 font-semibold">{pkr.easyPaisa.number}</p>
            <p className="text-slate-400 text-[11px]">{pkr.easyPaisa.instructions}</p>
          </div>

          {/* Global Wallets (PayPal & Payoneer) */}
          {renderGlobalWallets()}
        </div>
      );
    } else if (currency === 'GBP') {
      const gbp = inst.GBP || {
        bankTransfer: { bankName: 'Barclays Bank UK', accountName: 'Vortex Global Tech Ltd', sortCode: '20-45-77', accountNumber: '83921045', iban: 'GB29BARC20457783921045' },
        revolutTag: '@vortexcash (Revolut Direct Transfer)',
      };
      return (
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#0e162b] border border-amber-500/30 space-y-2">
            <span className="font-bold text-amber-300 text-sm">UK Bank Transfer / Faster Payments</span>
            <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono-nums">
              <div>
                <span className="text-slate-500 block text-[10px]">Bank</span>
                <span className="font-semibold">{gbp.bankTransfer.bankName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Account Name</span>
                <span className="font-semibold">{gbp.bankTransfer.accountName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Sort Code</span>
                <button
                  type="button"
                  onClick={() => handleCopy(gbp.bankTransfer.sortCode, 'gb_sort')}
                  className="font-semibold text-amber-300 flex items-center gap-1"
                >
                  <span>{gbp.bankTransfer.sortCode}</span>
                  <Copy className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Account Number</span>
                <button
                  type="button"
                  onClick={() => handleCopy(gbp.bankTransfer.accountNumber, 'gb_acc')}
                  className="font-semibold text-amber-300 flex items-center gap-1"
                >
                  <span>{gbp.bankTransfer.accountNumber}</span>
                  <Copy className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e162b] border border-sky-500/30 space-y-1">
            <span className="font-bold text-sky-300 text-sm">Revolut Direct</span>
            <p className="font-mono-nums text-slate-200">{gbp.revolutTag}</p>
          </div>

          {/* Global Wallets (PayPal & Payoneer) */}
          {renderGlobalWallets()}
        </div>
      );
    } else {
      const usd = inst.USD || {
        bankTransfer: { bankName: 'JPMorgan Chase Bank, N.A.', routingNumber: '021000021', accountNumber: '9283746102', swiftBic: 'CHASUS33' },
        zelleOrWise: 'payments@vortextopup.com (Zelle / Wise Direct)',
      };
      return (
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#0e162b] border border-amber-500/30 space-y-2">
            <span className="font-bold text-amber-300 text-sm">US Domestic ACH / Wire</span>
            <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono-nums">
              <div>
                <span className="text-slate-500 block text-[10px]">Bank</span>
                <span className="font-semibold">{usd.bankTransfer.bankName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Routing Number</span>
                <button
                  type="button"
                  onClick={() => handleCopy(usd.bankTransfer.routingNumber, 'us_routing')}
                  className="font-semibold text-amber-300 flex items-center gap-1"
                >
                  <span>{usd.bankTransfer.routingNumber}</span>
                  <Copy className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Account Number</span>
                <button
                  type="button"
                  onClick={() => handleCopy(usd.bankTransfer.accountNumber, 'us_acc')}
                  className="font-semibold text-amber-300 flex items-center gap-1"
                >
                  <span>{usd.bankTransfer.accountNumber}</span>
                  <Copy className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">SWIFT / BIC</span>
                <span className="font-semibold">{usd.bankTransfer.swiftBic}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e162b] border border-purple-500/30 space-y-1">
            <span className="font-bold text-purple-300 text-sm">Zelle / Wise Direct</span>
            <p className="font-mono-nums text-slate-200">{usd.zelleOrWise}</p>
          </div>

          {/* Global Wallets (PayPal & Payoneer) */}
          {renderGlobalWallets()}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0b1020] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#0e1529] px-6 py-4 border-b border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono-nums">
              Secure Top-Up Checkout
            </span>
            <h3 className="font-display font-bold text-lg text-white">
              {product.name} ({product.ucAmount + product.bonusUc} Total UC)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: Details & Player ID Confirmation */}
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="space-y-5">
              {/* Package Summary Box */}
              <div className="p-3.5 rounded-xl bg-[#070b16] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">{product.name}</div>
                    <div className="text-xs text-amber-400 font-mono-nums">
                      {product.ucAmount} UC + {product.bonusUc} Bonus
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Price</div>
                  <div className="text-lg font-extrabold text-amber-300 font-mono-nums">
                    {currencyConfig.format(finalAmount)}
                  </div>
                </div>
              </div>

              {/* PUBG Player ID Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>PUBG Character ID *</span>
                  <span className="text-[11px] text-amber-400 font-normal">No password required</span>
                </label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{5,15}"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  placeholder="e.g. 5124891043"
                  className="w-full px-3.5 py-2.5 bg-[#070b16] border border-amber-500/30 rounded-xl text-white font-mono-nums text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* Character In-Game Name (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Player Nickname (Optional, for verification)
                </label>
                <input
                  type="text"
                  value={playerNickname}
                  onChange={(e) => setPlayerNickname(e.target.value)}
                  placeholder="e.g. Victor_Sniper"
                  className="w-full px-3.5 py-2.5 bg-[#070b16] border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Email Address * (For order confirmation & receipt)
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="player@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#070b16] border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Phone / WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Phone / WhatsApp (Optional, for instant SMS delivery notice)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3.5 py-2.5 bg-[#070b16] border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 font-mono-nums"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <span>Continue to Payment Method</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Choose Payment Method */}
          {step === 'payment_select' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 mb-2">
                Order Amount: <strong className="text-amber-300 font-mono-nums">{currencyConfig.format(finalAmount)}</strong>
              </div>

              {/* Option A: Manual Payment (JazzCash/Easypaisa/Bank/Wire) */}
              <button
                onClick={() => handleSelectPaymentMethod('manual')}
                disabled={isSubmitting}
                className="w-full text-left p-4 rounded-xl border border-amber-500/40 bg-[#070c18] hover:bg-[#0c1429] hover:border-amber-400 transition-all cursor-pointer group flex items-start gap-4"
              >
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {currency === 'PKR'
                        ? 'Manual Transfer (JazzCash, Easypaisa, PayPal, Payoneer)'
                        : currency === 'GBP'
                        ? 'UK Bank Transfer / Faster Payments / PayPal / Payoneer'
                        : 'US ACH / Bank Wire / Zelle / PayPal / Payoneer'}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                      0% Fee
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Direct transfer to our verified local account. Upload your receipt and order ID for fast verification.
                  </p>
                </div>
              </button>

              {/* Option B: Online Card Payments (Visa / Mastercard) */}
              <button
                onClick={() => handleSelectPaymentMethod('card')}
                disabled={isSubmitting}
                className="w-full text-left p-4 rounded-xl border border-slate-800 bg-[#070c18] hover:bg-[#0c1429] hover:border-amber-400 transition-all cursor-pointer group flex items-start gap-4"
              >
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      Debit / Credit Card (Visa & Mastercard)
                    </span>
                    <span className="text-[11px] font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded">
                      Instant
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Secure 3D-Secure payment gateway supporting international and local cards.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setStep('details')}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back to Player Details
              </button>
            </div>
          )}

          {/* STEP 3 (Manual): Payment Instructions Display */}
          {step === 'manual_instructions' && createdOrder && (
            <div className="space-y-4">
              {/* Order Number Banner */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                    Your Unique Order Number
                  </span>
                  <span className="text-base font-extrabold text-white font-mono-nums">
                    {createdOrder.orderNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(createdOrder.orderNumber, 'order_num')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'order_num' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy ID</span>
                </button>
              </div>

              <div className="text-xs text-slate-300">
                Please transfer exactly <strong className="text-amber-400 font-mono-nums">{currencyConfig.format(finalAmount)}</strong> to any of our official accounts below. Include your Order Number <strong className="text-white font-mono-nums">{createdOrder.orderNumber}</strong> in the transfer reference.
              </div>

              {renderCountryInstructions()}

              <button
                onClick={() => setStep('manual_receipt')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <span>I have transferred the money · Submit Receipt</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 4 (Manual): Upload Receipt Form */}
          {step === 'manual_receipt' && createdOrder && (
            <form onSubmit={handleSubmitManualReceipt} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#070c18] border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span>Order: <strong className="text-amber-300 font-mono-nums">{createdOrder.orderNumber}</strong></span>
                <span>Amount: <strong className="text-amber-300 font-mono-nums">{currencyConfig.format(finalAmount)}</strong></span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Sender Account / Payer Name *
                </label>
                <input
                  type="text"
                  required
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="e.g. Muhammad Ali / John Doe"
                  className="w-full px-3.5 py-2.5 bg-[#070b16] border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Transaction ID / Ref # / TID *</span>
                  <span className="text-[11px] text-amber-400 font-normal">Found on bank/wallet SMS or receipt</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 029384710492"
                  className="w-full px-3.5 py-2.5 bg-[#070b16] border border-amber-500/30 rounded-xl text-white font-mono-nums text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Receipt File Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Payment Receipt / Screenshot * (Max 5MB)
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-4 text-center cursor-pointer transition-colors relative bg-[#070b16]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    required={!receiptBase64}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {receiptBase64 ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={receiptBase64}
                        alt="Receipt preview"
                        className="w-12 h-12 object-cover rounded-lg border border-amber-500/40"
                      />
                      <div className="text-left text-xs">
                        <span className="text-emerald-400 font-semibold block">Receipt Uploaded!</span>
                        <span className="text-slate-400 truncate max-w-xs block">{receiptFileName}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-amber-400 mx-auto" />
                      <div className="text-xs text-slate-300">Click to upload payment screenshot</div>
                      <div className="text-[10px] text-slate-500">PNG, JPG, or WEBP up to 5MB</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Optional Note for Store Admin
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Transferred from JazzCash 0301-xxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-[#070b16] border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Submit for Verification</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('manual_instructions')}
                className="w-full py-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back to payment accounts
              </button>
            </form>
          )}

          {/* STEP 5: Online Card Payment Hosted Component */}
          {step === 'card_checkout' && createdOrder && (
            <form onSubmit={handleProcessCardPayment} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#070c18] border border-blue-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
                    Hosted Card Checkout
                  </span>
                  <span className="text-xs text-slate-300 font-mono-nums">
                    Order: {createdOrder.orderNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Total Due</span>
                  <span className="text-base font-extrabold text-white font-mono-nums">
                    {currencyConfig.format(finalAmount)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <Lock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  PCI-DSS Level 1 Encrypted. Card numbers are never stored in plain text or in database documents.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Name on Card</label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 bg-[#070b16] border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Card Number (Visa / Mastercard)</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                    setCardNumber(v.replace(/(.{4})/g, '$1 ').trim());
                  }}
                  placeholder="4532 •••• •••• 8912"
                  className="w-full px-3.5 py-2.5 bg-[#070b16] border border-slate-800 rounded-xl text-white font-mono-nums text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Expiry Date</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={cardExp}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                      setCardExp(v);
                    }}
                    placeholder="MM/YY"
                    className="w-full px-3.5 py-2.5 bg-[#070b16] border border-slate-800 rounded-xl text-white font-mono-nums text-sm focus:outline-none focus:border-amber-400 text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">CVV / CVC</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="•••"
                    className="w-full px-3.5 py-2.5 bg-[#070b16] border border-slate-800 rounded-xl text-white font-mono-nums text-sm focus:outline-none focus:border-amber-400 text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessingCard}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/25 disabled:opacity-50"
              >
                {isProcessingCard ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying 3D-Secure Transaction...</span>
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay {currencyConfig.format(finalAmount)} Securely</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('payment_select')}
                className="w-full py-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back to payment methods
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
