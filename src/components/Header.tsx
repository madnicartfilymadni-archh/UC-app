import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CURRENCIES } from '../lib/constants';
import { CountryCode } from '../types';
import { Shield, Globe, Search, UserCheck, Menu, X, ChevronDown, Lock } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    country,
    currency,
    setCountryAndCurrency,
    activeView,
    setActiveView,
    currentUser,
    isAdmin,
    loginWithGoogle,
    logout,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const countries: CountryCode[] = ['PK', 'GB', 'US'];

  const scrollToSection = (id: string) => {
    setActiveView('store');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080d1a]/95 backdrop-blur-md border-b border-amber-500/20">
      {/* Top micro-announcement banner */}
      <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-amber-600/20 border-b border-amber-500/10 py-1.5 px-4 text-center text-xs font-medium text-amber-300 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Official PUBG Mobile ID Top-Up Partner · 24/7 Instant Delivery within 5–15 mins</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('store')}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0a0f1d] rounded-[7px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-400 fill-amber-400/20" />
              </div>
            </div>
            <div>
              <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-amber-300 transition-colors">
                VORTEX<span className="text-amber-400">.UC</span>
              </span>
              <p className="text-[10px] tracking-wider text-slate-400 uppercase -mt-1 font-mono-nums">
                International Top-Up
              </p>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button
            onClick={() => scrollToSection('hero')}
            className={`hover:text-amber-400 transition-colors cursor-pointer ${
              activeView === 'store' ? 'text-amber-300' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('packages')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            UC Packages
          </button>
          <button
            onClick={() => scrollToSection('how-to-order')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            How to Order
          </button>
          <button
            onClick={() => setActiveView('track')}
            className={`hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'track' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Order Tracking</span>
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Support & FAQ
          </button>
        </nav>

        {/* Zone 3: Actions (Country/Currency Selector + Admin/Auth) */}
        <div className="flex items-center gap-3">
          {/* Country / Currency Selector */}
          <div className="relative">
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="flex items-center gap-2 bg-[#10172a] hover:bg-[#1a233a] border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer"
              title="Select region and currency"
            >
              <span className="text-base">{CURRENCIES[currency].flag}</span>
              <span className="font-mono-nums text-amber-300">{currency}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {currencyDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-[#0c1222] border border-amber-500/30 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setCurrencyDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                  Select Country & Currency
                </div>
                {countries.map((cCode) => {
                  const cfg = CURRENCIES[cCode === 'PK' ? 'PKR' : cCode === 'GB' ? 'GBP' : 'USD'];
                  const isSelected = country === cCode;
                  return (
                    <button
                      key={cCode}
                      onClick={() => {
                        setCountryAndCurrency(cCode);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 text-amber-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cfg.flag}</span>
                        <span>{cfg.countryName}</span>
                      </div>
                      <span className="font-mono-nums text-amber-400 font-semibold">{cfg.code}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin Panel button */}
          <button
            onClick={() => setActiveView(activeView === 'admin' ? 'store' : 'admin')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeView === 'admin'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-900/80 text-amber-300 border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c1222] border-b border-amber-500/20 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-left py-2 px-3 rounded-lg bg-slate-900/60 text-slate-200 hover:text-amber-400"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('packages')}
              className="text-left py-2 px-3 rounded-lg bg-slate-900/60 text-slate-200 hover:text-amber-400"
            >
              UC Packages
            </button>
            <button
              onClick={() => scrollToSection('how-to-order')}
              className="text-left py-2 px-3 rounded-lg bg-slate-900/60 text-slate-200 hover:text-amber-400"
            >
              How to Order
            </button>
            <button
              onClick={() => {
                setActiveView('track');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg bg-slate-900/60 text-amber-300 font-semibold"
            >
              Track Order
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-left py-2 px-3 rounded-lg bg-slate-900/60 text-slate-200 hover:text-amber-400 col-span-2"
            >
              FAQ & Support
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
