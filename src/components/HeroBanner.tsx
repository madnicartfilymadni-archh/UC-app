import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { HERO_BANNER_IMG } from '../lib/constants';
import { Zap, ShieldCheck, HelpCircle, ArrowRight, CheckCircle2, User } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { playerId, setPlayerId, playerNickname, setPlayerNickname, showToast } = useStore();
  const [inputVal, setInputVal] = useState(playerId);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showIdGuide, setShowIdGuide] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputVal.trim();
    if (!clean) {
      showToast('Please enter your PUBG Player ID', 'error');
      return;
    }
    if (!/^\d{5,15}$/.test(clean)) {
      showToast('PUBG Player ID must be between 5 to 15 digits', 'error');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setPlayerId(clean);
      // Generate a simulated verified gamer tag preview based on the ID
      const previewTag = `Player_${clean.slice(-4)}`;
      setPlayerNickname(previewTag);
      setIsVerifying(false);
      showToast(`Player ID ${clean} confirmed! Select your UC package below.`, 'success');
      const el = document.getElementById('packages');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  };

  return (
    <section id="hero" className="relative w-full overflow-hidden bg-[#060913]">
      {/* Cinematic Backdrop with Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BANNER_IMG}
          alt="PUBG Mobile Battle Royale promotional key art"
          className="w-full h-full object-cover object-center opacity-40 scale-105 transform motion-safe:transition-transform motion-safe:duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-[#060913]/80 to-[#060913]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060913] via-[#060913]/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Official Global Server Top-Up · 100% Ban-Free</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] text-balance">
              Instant <span className="text-gold-gradient">PUBG Mobile UC</span> Direct to Account
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              Fast, secure Unknown Cash refills for players in Pakistan, the UK, and the USA.
              Top up via Player ID in under 5 minutes with zero password requirements.
            </p>

            {/* Trust Pillars */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No Password Needed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>5–15 Min Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Verified Receipts</span>
              </div>
            </div>
          </div>

          {/* Right Column: Player ID Direct Action Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl gold-glow relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono-nums">
                    Step 1: Player ID
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIdGuide(!showIdGuide)}
                  className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Where is my ID?</span>
                </button>
              </div>

              <h2 className="text-lg font-bold text-white mb-2">Enter Your PUBG Character ID</h2>
              <p className="text-xs text-slate-400 mb-5">
                We only need your numeric Player ID. Your account remains 100% secure.
              </p>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="e.g. 5124891043"
                    maxLength={15}
                    className="w-full pl-10 pr-4 py-3 bg-[#070b16] border border-amber-500/40 rounded-xl text-white placeholder-slate-500 font-mono-nums text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                </div>

                {playerId && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300">
                    <span className="font-mono-nums">Active ID: <strong>{playerId}</strong></span>
                    {playerNickname && <span className="text-emerald-400 font-semibold">{playerNickname}</span>}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirm ID & Choose Package</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* ID helper accordion */}
              {showIdGuide && (
                <div className="mt-4 p-3.5 rounded-xl bg-[#070c18] border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
                  <p className="font-semibold text-amber-300">How to locate your PUBG Mobile ID:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>Launch PUBG Mobile on your phone or tablet.</li>
                    <li>Tap your Profile Avatar icon in the top-left corner.</li>
                    <li>Your numeric Player ID is displayed right under your nickname.</li>
                    <li>Tap the small copy icon to paste it here.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
