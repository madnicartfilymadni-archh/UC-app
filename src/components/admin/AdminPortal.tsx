import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ADMIN_EMAIL, ADMIN_ACCESS_CODES } from '../../lib/constants';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Settings,
  ShieldAlert,
  LogOut,
  ArrowLeft,
  FileText,
  Lock,
  UserCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminOrderManager } from './AdminOrderManager';
import { AdminProductManager } from './AdminProductManager';
import { AdminPaymentSettings } from './AdminPaymentSettings';
import { AdminSiteSettings } from './AdminSiteSettings';
import { AdminAuditLogs } from './AdminAuditLogs';

export const AdminPortal: React.FC = () => {
  const { currentUser, isAdmin, loginWithGoogle, logout, setActiveView, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'payment_settings' | 'site_settings' | 'audit'>('overview');
  const [adminPin, setAdminPin] = useState('');
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);

  const [showCode, setShowCode] = useState(false);

  // Allow authorized access if Google user matches ADMIN_EMAIL or if master admin session is validated
  const isAuthorized = isAdmin || isPinUnlocked;

  const handlePinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = adminPin.trim().toLowerCase();
    // Authorized administrative verification codes (including madnijamrahi)
    if (ADMIN_ACCESS_CODES.map((c) => c.toLowerCase()).includes(cleanCode)) {
      setIsPinUnlocked(true);
      showToast('Admin session unlocked successfully', 'success');
    } else {
      showToast('Invalid administrator access code', 'error');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0b1020] border border-amber-500/30 rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h2 className="font-display font-bold text-2xl text-white">Vortex Admin Portal</h2>
            <p className="text-xs text-slate-400 mt-1">
              Restricted area. Authorized store administrators only.
            </p>
          </div>

          {/* Option 1: Google OAuth Sign-In */}
          <div className="space-y-3">
            <button
              onClick={loginWithGoogle}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google Admin Account</span>
            </button>
            <p className="text-[11px] text-slate-500 font-mono-nums">
              Authorized admin: {ADMIN_EMAIL}
            </p>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase tracking-widest font-mono-nums">
              Or Admin Code / PIN
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Option 2: Admin Security Code / PIN */}
          <form onSubmit={handlePinUnlock} className="space-y-3">
            <div className="relative">
              <input
                type={showCode ? 'text' : 'password'}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Enter Admin Code (e.g. madnijamrahi)"
                autoComplete="current-password"
                className="w-full px-4 py-2.5 pr-10 bg-[#070b16] border border-slate-800 focus:border-amber-400 rounded-xl text-white text-center font-mono-nums text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-pointer"
                title={showCode ? 'Hide code' : 'Show code'}
              >
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <button
            onClick={() => setActiveView('store')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer Store</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a14] text-slate-200 flex flex-col">
      {/* Admin Top Navigation */}
      <header className="bg-[#0b1020] border-b border-amber-500/20 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('store')}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Return to customer store"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display font-extrabold text-base text-white flex items-center gap-2">
              <span>Vortex Command Center</span>
              <span className="text-[10px] uppercase font-mono-nums px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                Admin
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono-nums">
              Session: {currentUser?.email || 'Master Administrator'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentUser) logout();
              setIsPinUnlocked(false);
              setActiveView('store');
            }}
            className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Admin Main Body with Sidebar Tabs */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-[#090e1c] border-r border-slate-800/80 p-4 space-y-1 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Order Management</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>UC Packages Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('payment_settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'payment_settings'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment Instructions</span>
          </button>

          <button
            onClick={() => setActiveTab('site_settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'site_settings'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store & Policies</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail Logs</span>
          </button>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
          {activeTab === 'overview' && <AdminDashboardOverview onNavigateTab={setActiveTab} />}
          {activeTab === 'orders' && <AdminOrderManager />}
          {activeTab === 'products' && <AdminProductManager />}
          {activeTab === 'payment_settings' && <AdminPaymentSettings />}
          {activeTab === 'site_settings' && <AdminSiteSettings />}
          {activeTab === 'audit' && <AdminAuditLogs />}
        </main>
      </div>
    </div>
  );
};
