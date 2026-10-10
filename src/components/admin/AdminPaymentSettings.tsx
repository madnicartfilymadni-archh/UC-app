import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { saveSiteSettings, addAuditLog } from '../../lib/db';
import { PaymentInstructions, GatewayConfig } from '../../types';
import { Building2, CreditCard, ShieldCheck, Save, Check } from 'lucide-react';
import { ADMIN_EMAIL } from '../../lib/constants';

export const AdminPaymentSettings: React.FC = () => {
  const { siteSettings, refreshSettings, showToast, currentUser } = useStore();
  const [instructions, setInstructions] = useState<PaymentInstructions>(() => {
    const raw = siteSettings.paymentInstructions || {};
    return {
      PKR: {
        jazzCash: raw.PKR?.jazzCash || {
          title: 'JazzCash Direct Wallet',
          number: '0300-1234567 (Account Title: Vortex Gaming Store)',
          instructions: 'Send exact PKR amount via JazzCash App or *786#. In the reference/purpose, enter your Order Number.',
        },
        easyPaisa: raw.PKR?.easyPaisa || {
          title: 'Easypaisa Mobile Account',
          number: '0345-9876543 (Account Title: Vortex Gaming Store)',
          instructions: 'Transfer through Easypaisa App. Keep your Order ID in reference.',
        },
      },
      paypal: raw.paypal || {
        email: 'payments@vortextopup.com',
        accountName: 'Vortex Global Tech Ltd',
        instructions: 'Send payment to our verified PayPal email. Enter your Order Number in the transfer note and upload payment screenshot.',
      },
      payoneer: raw.payoneer || {
        email: 'payoneer@vortextopup.com',
        accountName: 'Vortex Digital Solutions',
        instructions: 'Transfer via Payoneer "Make a Payment to recipient Payoneer account" (0% fee). Put your Order Number in remarks and save receipt.',
      },
      GBP: raw.GBP || {
        bankTransfer: {
          bankName: 'Barclays Bank UK',
          accountName: 'Vortex Global Tech Ltd',
          sortCode: '20-45-77',
          accountNumber: '83921045',
          iban: 'GB29BARC20457783921045',
        },
        revolutTag: '@vortexcash (Revolut Direct Transfer)',
      },
      USD: raw.USD || {
        bankTransfer: {
          bankName: 'JPMorgan Chase Bank, N.A.',
          routingNumber: '021000021',
          accountNumber: '9283746102',
          swiftBic: 'CHASUS33',
        },
        zelleOrWise: 'payments@vortextopup.com (Zelle / Wise Direct)',
      },
    };
  });
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig>(siteSettings.gatewayConfig);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const adminEmail = currentUser?.email || ADMIN_EMAIL;

    try {
      await saveSiteSettings({
        paymentInstructions: instructions,
        gatewayConfig,
      });

      await addAuditLog(
        'Updated Payment Settings',
        adminEmail,
        'Modified manual bank accounts and card gateway preferences.'
      );

      showToast('Payment instructions saved successfully!', 'success');
      refreshSettings();
    } catch (err: any) {
      showToast('Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white">Payment Configuration</h2>
          <p className="text-xs text-slate-400 mt-1">
            Update account titles, wallet numbers, and bank details displayed to customers during manual checkout.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50 self-start"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* 1. Pakistan (PKR) Accounts */}
      <div className="bg-[#0b1020] border border-amber-500/30 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span className="text-xl">🇵🇰</span>
          <h3 className="font-bold text-white text-base">Pakistan Accounts (PKR)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* JazzCash */}
          <div className="p-4 rounded-xl bg-[#070b16] border border-slate-800 space-y-2">
            <span className="font-bold text-amber-300 block">JazzCash Mobile Wallet</span>
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px]">Display Title</label>
              <input
                type="text"
                value={instructions.PKR.jazzCash.title}
                onChange={(e) =>
                  setInstructions({
                    ...instructions,
                    PKR: {
                      ...instructions.PKR,
                      jazzCash: { ...instructions.PKR.jazzCash, title: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 bg-[#0b1020] border border-slate-800 rounded-lg text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px]">Account Number & Title</label>
              <input
                type="text"
                value={instructions.PKR.jazzCash.number}
                onChange={(e) =>
                  setInstructions({
                    ...instructions,
                    PKR: {
                      ...instructions.PKR,
                      jazzCash: { ...instructions.PKR.jazzCash, number: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 bg-[#0b1020] border border-slate-800 rounded-lg text-white font-mono-nums"
              />
            </div>
          </div>

          {/* Easypaisa */}
          <div className="p-4 rounded-xl bg-[#070b16] border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-300 block">Easypaisa Mobile Account</span>
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px]">Display Title</label>
              <input
                type="text"
                value={instructions.PKR.easyPaisa.title}
                onChange={(e) =>
                  setInstructions({
                    ...instructions,
                    PKR: {
                      ...instructions.PKR,
                      easyPaisa: { ...instructions.PKR.easyPaisa, title: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 bg-[#0b1020] border border-slate-800 rounded-lg text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px]">Account Number & Title</label>
              <input
                type="text"
                value={instructions.PKR.easyPaisa.number}
                onChange={(e) =>
                  setInstructions({
                    ...instructions,
                    PKR: {
                      ...instructions.PKR,
                      easyPaisa: { ...instructions.PKR.easyPaisa, number: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 bg-[#0b1020] border border-slate-800 rounded-lg text-white font-mono-nums"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 2. Global Digital Wallets: PayPal & Payoneer */}
      <div className="bg-[#0b1020] border border-blue-500/30 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span className="text-xl">🌐</span>
          <h3 className="font-bold text-white text-base">Global Wallets: PayPal & Payoneer</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* PayPal */}
          <div className="p-4 rounded-xl bg-[#070b16] border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300 text-sm">PayPal Account</span>
              <span className="text-[10px] font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded">
                International
              </span>
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px]">PayPal Email Address</label>
              <input
                type="email"
                value={instructions.paypal?.email || ''}
                onChange={(e) =>
                  setInstructions({
                    ...instructions,
                    paypal: {
                      ...(instructions.paypal || { accountName: '', instructions: '' }),
                      email: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-[#0b1020] border border-slate-800 rounded-lg text-white font-mono-nums"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px]">Account / Business Name</label>
              <input
                type="text"
                value={instructions.paypal?.accountName || ''}
                onChange={(e) =>
                  setInstructions({
                    ...instructions,
                    paypal: {
                      ...(instructions.paypal || { email: '', instructions: '' }),
                      accountName: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-[#0b1020] border border-slate-800 rounded-lg text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px]">Customer Transfer Instructions</label>
              <textarea
                rows={2}
                value={instructions.paypal?.instructions || ''}
                onChange={(e) =>
                  setInstructions({
                    ...instructions,
                    paypal: {
                      ...(instructions.paypal || { email: '', accountName: '' }),
                      instructions: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-[#0b1020] border border-slate-800 rounded-lg text-white text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Payoneer */}
          <div className="p-4 rounded-xl bg-[#070b16] border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-sm">Payoneer Account</span>
              <span className="text-[10px] font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded">
                0% Fee Transfer
              </span>
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px]">Payoneer Email Address / ID</label>
              <input
                type="email"
                value={instructions.payoneer?.email || ''}
                onChange={(e) =>
                  setInstructions({
                    ...instructions,
                    payoneer: {
                      ...(instructions.payoneer || { accountName: '', instructions: '' }),
                      email: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-[#0b1020] border border-slate-800 rounded-lg text-white font-mono-nums"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px]">Receiving Account Name</label>
              <input
                type="text"
                value={instructions.payoneer?.accountName || ''}
                onChange={(e) =>
                  setInstructions({
                    ...instructions,
                    payoneer: {
                      ...(instructions.payoneer || { email: '', instructions: '' }),
                      accountName: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-[#0b1020] border border-slate-800 rounded-lg text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px]">Customer Transfer Instructions</label>
              <textarea
                rows={2}
                value={instructions.payoneer?.instructions || ''}
                onChange={(e) =>
                  setInstructions({
                    ...instructions,
                    payoneer: {
                      ...(instructions.payoneer || { email: '', accountName: '' }),
                      instructions: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-[#0b1020] border border-slate-800 rounded-lg text-white text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. United Kingdom (GBP) Accounts */}
      <div className="bg-[#0b1020] border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span className="text-xl">🇬🇧</span>
          <h3 className="font-bold text-white text-base">United Kingdom Accounts (GBP)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">UK Bank Name</label>
            <input
              type="text"
              value={instructions.GBP.bankTransfer.bankName}
              onChange={(e) =>
                setInstructions({
                  ...instructions,
                  GBP: {
                    ...instructions.GBP,
                    bankTransfer: { ...instructions.GBP.bankTransfer, bankName: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 rounded-lg text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Sort Code</label>
            <input
              type="text"
              value={instructions.GBP.bankTransfer.sortCode}
              onChange={(e) =>
                setInstructions({
                  ...instructions,
                  GBP: {
                    ...instructions.GBP,
                    bankTransfer: { ...instructions.GBP.bankTransfer, sortCode: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 rounded-lg text-white font-mono-nums"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Account Number</label>
            <input
              type="text"
              value={instructions.GBP.bankTransfer.accountNumber}
              onChange={(e) =>
                setInstructions({
                  ...instructions,
                  GBP: {
                    ...instructions.GBP,
                    bankTransfer: { ...instructions.GBP.bankTransfer, accountNumber: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 rounded-lg text-white font-mono-nums"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Revolut Tag / Handle</label>
            <input
              type="text"
              value={instructions.GBP.revolutTag}
              onChange={(e) =>
                setInstructions({
                  ...instructions,
                  GBP: { ...instructions.GBP, revolutTag: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 rounded-lg text-white font-mono-nums"
            />
          </div>
        </div>
      </div>

      {/* 3. United States (USD) Accounts */}
      <div className="bg-[#0b1020] border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span className="text-xl">🇺🇸</span>
          <h3 className="font-bold text-white text-base">United States Accounts (USD)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">US Bank Name</label>
            <input
              type="text"
              value={instructions.USD.bankTransfer.bankName}
              onChange={(e) =>
                setInstructions({
                  ...instructions,
                  USD: {
                    ...instructions.USD,
                    bankTransfer: { ...instructions.USD.bankTransfer, bankName: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 rounded-lg text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Routing Number (ABA)</label>
            <input
              type="text"
              value={instructions.USD.bankTransfer.routingNumber}
              onChange={(e) =>
                setInstructions({
                  ...instructions,
                  USD: {
                    ...instructions.USD,
                    bankTransfer: { ...instructions.USD.bankTransfer, routingNumber: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 rounded-lg text-white font-mono-nums"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Account Number</label>
            <input
              type="text"
              value={instructions.USD.bankTransfer.accountNumber}
              onChange={(e) =>
                setInstructions({
                  ...instructions,
                  USD: {
                    ...instructions.USD,
                    bankTransfer: { ...instructions.USD.bankTransfer, accountNumber: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 rounded-lg text-white font-mono-nums"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Zelle / Wise Email or Tag</label>
            <input
              type="text"
              value={instructions.USD.zelleOrWise}
              onChange={(e) =>
                setInstructions({
                  ...instructions,
                  USD: { ...instructions.USD, zelleOrWise: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 rounded-lg text-white font-mono-nums"
            />
          </div>
        </div>
      </div>

      {/* 4. Payment Gateway Settings & Status */}
      <div className="bg-[#0b1020] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Online Card Gateway</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 font-mono-nums">
            {gatewayConfig.testMode ? 'SANDBOX / TEST MODE' : 'LIVE PRODUCTION'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2 p-4 rounded-xl bg-[#070b16] border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">Gateway Test / Sandbox Mode</label>
              <input
                type="checkbox"
                checked={gatewayConfig.testMode}
                onChange={(e) =>
                  setGatewayConfig({ ...gatewayConfig, testMode: e.target.checked })
                }
                className="w-4 h-4 rounded text-amber-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              When enabled, checkout executes safely in simulated sandbox mode without charging live customer cards.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-[#070b16] border border-slate-800">
            <label className="text-slate-300 font-semibold block">Merchant Identity</label>
            <input
              type="text"
              value={gatewayConfig.merchantName}
              onChange={(e) =>
                setGatewayConfig({ ...gatewayConfig, merchantName: e.target.value })
              }
              className="w-full px-3 py-2 bg-[#0b1020] border border-slate-800 rounded-lg text-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
