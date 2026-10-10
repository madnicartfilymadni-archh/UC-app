import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldAlert, MessageCircle, Mail } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const FaqSection: React.FC = () => {
  const { siteSettings } = useStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is this top-up method 100% safe for my PUBG Mobile account?',
      a: 'Yes, absolutely. We use official player ID top-up channels (similar to authorized distributors like Midasbuy/UniPin). We never ask for your account password, email login, or two-factor authentication codes. Your account is 100% ban-free and secure.',
    },
    {
      q: 'How long does UC delivery take after payment?',
      a: 'Card payments and approved manual payments are delivered within 5 to 15 minutes. During peak Royale Pass release hours, fulfillment might occasionally take up to 30 minutes.',
    },
    {
      q: 'What payment methods are supported for customers in Pakistan?',
      a: 'Pakistani and international gamers can pay seamlessly using JazzCash, Easypaisa, PayPal, Payoneer, as well as Visa and Mastercard debit/credit cards.',
    },
    {
      q: 'How do customers in the UK and USA complete payments?',
      a: 'UK customers can use instant UK Faster Payments, Revolut, PayPal, or Payoneer. US customers can use ACH transfer, Zelle, Wise, PayPal, Payoneer, or Visa/Mastercard.',
    },
    {
      q: 'What if I entered an incorrect PUBG Player ID?',
      a: 'If your order has not been dispatched yet, contact our live WhatsApp or email support immediately with your Order Number and corrected Character ID. Once UC is successfully dispatched to an ID on PUBG servers, it cannot be reversed.',
    },
    {
      q: 'How do manual payment approvals work?',
      a: 'After you transfer funds to our displayed account, enter your Transaction ID (TID) and upload a receipt screenshot. Our 24/7 administrative team cross-references the bank ledger and approves your order.',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-20 bg-[#060913] relative border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Everything you need to know about international PUBG Mobile Unknown Cash top-ups.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#0b1020] border border-slate-800/80 hover:border-amber-500/30 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-semibold text-sm text-white hover:text-amber-300 transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-amber-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="mt-12 p-6 rounded-2xl bg-[#0c1326] border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="font-bold text-white text-sm">Need immediate assistance with an active order?</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Our 24/7 support operators are ready to verify receipts or check delivery status.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {siteSettings.supportWhatsapp && (
              <a
                href={`https://wa.me/${siteSettings.supportWhatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            )}
            <a
              href={`mailto:${siteSettings.supportEmail}`}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" />
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
