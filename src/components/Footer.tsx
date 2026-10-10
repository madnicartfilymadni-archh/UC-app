import React from 'react';
import { Shield, Lock, Globe, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { setActiveView } = useStore();

  return (
    <footer className="bg-[#050811] border-t border-slate-800/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Disclaimer */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#0a0f1d] rounded-[6px] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <span className="font-display font-extrabold text-lg text-white">
                VORTEX<span className="text-amber-400">.UC</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Premier international PUBG Mobile Unknown Cash top-up service. Delivering authentic,
              ban-free digital top-ups directly via PUBG Player ID to gamers in Pakistan, the United Kingdom, and the United States.
            </p>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Disclaimer: Vortex UC is an independent retailer and is not directly affiliated with, authorized, or endorsed by PUBG Mobile, Krafton Inc., Tencent Games, or Level Infinite. All game trademarks belong to their respective owners.
            </p>
          </div>

          {/* Col 2: Fast Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono-nums">
              Store Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setActiveView('store');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Home & Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('track')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Order Tracking
                </button>
              </li>
              <li>
                <a href="#how-to-order" className="hover:text-amber-400 transition-colors">
                  How to Order Guide
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-amber-400 transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('admin')}
                  className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Supported Regions & Gateways */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono-nums">
              Supported Regions
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span>🇵🇰</span>
                <span className="text-slate-300">Pakistan — PKR (JazzCash / Easypaisa / PayPal / Payoneer)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🇬🇧</span>
                <span className="text-slate-300">United Kingdom — GBP (Faster Payments / Revolut / PayPal)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🇺🇸</span>
                <span className="text-slate-300">United States — USD (ACH / Wire / Zelle / Payoneer)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🌐</span>
                <span className="text-amber-300">Worldwide — PayPal & Payoneer Verified Transfers</span>
              </div>
            </div>

            <div className="pt-3">
              <h5 className="font-bold text-slate-300 text-[11px] mb-1.5">Payment Security</h5>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Vortex UC Store. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition-colors">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-slate-400 transition-colors">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-slate-400 transition-colors">Refund Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
