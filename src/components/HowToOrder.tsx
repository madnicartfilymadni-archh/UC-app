import React from 'react';
import { UserCheck, PackageCheck, CreditCard, Send } from 'lucide-react';

export const HowToOrder: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Enter Player ID',
      desc: 'Type your 5–15 digit PUBG Mobile Character ID. Never provide your password or social media login.',
      icon: UserCheck,
    },
    {
      step: '02',
      title: 'Select UC Package',
      desc: 'Pick your preferred Unknown Cash bundle or Royale Pass upgrade. Check available bonuses.',
      icon: PackageCheck,
    },
    {
      step: '03',
      title: 'Pay with Local Currency',
      desc: 'Choose Card Checkout or direct Manual Payment via JazzCash, Easypaisa, PayPal, Payoneer, or Bank Transfer.',
      icon: CreditCard,
    },
    {
      step: '04',
      title: 'Receive UC in 5–15 Mins',
      desc: 'Once payment is verified, UC is automatically injected to your game mailbox. Check balance in PUBG!',
      icon: Send,
    },
  ];

  return (
    <section id="how-to-order" className="py-16 sm:py-20 bg-[#080d1a] border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
            Simple 4-Step Process
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
            How to Top Up Your Account
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            No complicated verifications or account handovers. Just your character ID and seamless checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="relative bg-[#0c1224] p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono-nums text-2xl font-black text-slate-700 group-hover:text-amber-500/40 transition-colors">
                      {st.step}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Step {idx + 1} of 4</span>
                  <span className="text-amber-400 font-semibold">Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
