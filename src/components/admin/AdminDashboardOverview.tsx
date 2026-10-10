import React, { useState, useEffect } from 'react';
import { getAllOrders, getAllSubmissions } from '../../lib/db';
import { Order, PaymentSubmission } from '../../types';
import { CURRENCIES } from '../../lib/constants';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  XCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface Props {
  onNavigateTab: (tab: 'orders' | 'products' | 'payment_settings') => void;
}

export const AdminDashboardOverview: React.FC<Props> = ({ onNavigateTab }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [o, s] = await Promise.all([getAllOrders(), getAllSubmissions()]);
      setOrders(o);
      setSubmissions(s);
    } catch (err) {
      console.warn('Error loading dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics
  const totalOrders = orders.length;
  const pendingManual = orders.filter((o) => o.status === 'Payment Submitted' || o.status === 'Pending Verification').length;
  const pendingCard = orders.filter((o) => o.status === 'Awaiting Payment' && o.paymentMethod === 'card').length;
  const paidOrders = orders.filter((o) => o.status === 'Payment Confirmed').length;
  const processingOrders = orders.filter((o) => o.status === 'Processing').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const rejectedOrders = orders.filter((o) => o.status === 'Rejected' || o.status === 'Refunded').length;

  // Revenue totals by currency (only counting confirmed, processing, or delivered)
  const revenuePKR = orders
    .filter((o) => o.currency === 'PKR' && ['Payment Confirmed', 'Processing', 'Delivered'].includes(o.status))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const revenueGBP = orders
    .filter((o) => o.currency === 'GBP' && ['Payment Confirmed', 'Processing', 'Delivered'].includes(o.status))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const revenueUSD = orders
    .filter((o) => o.currency === 'USD' && ['Payment Confirmed', 'Processing', 'Delivered'].includes(o.status))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Header and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white">Operations Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time fulfillment metrics, manual payment verification queue, and international revenues.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-[#0c1224] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Revenue by Currency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0b1020] border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono-nums">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span>🇵🇰</span> Pakistan (PKR)
            </span>
            <span className="text-[11px] text-amber-400 font-semibold">Net Settled</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono-nums">
            {CURRENCIES.PKR.format(revenuePKR)}
          </div>
        </div>

        <div className="bg-[#0b1020] border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono-nums">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span>🇬🇧</span> United Kingdom (GBP)
            </span>
            <span className="text-[11px] text-amber-400 font-semibold">Net Settled</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono-nums">
            {CURRENCIES.GBP.format(revenueGBP)}
          </div>
        </div>

        <div className="bg-[#0b1020] border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono-nums">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span>🇺🇸</span> United States (USD)
            </span>
            <span className="text-[11px] text-amber-400 font-semibold">Net Settled</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono-nums">
            {CURRENCIES.USD.format(revenueUSD)}
          </div>
        </div>
      </div>

      {/* Primary KPI Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0c1224] border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 block">Total Orders</span>
          <span className="text-2xl font-black text-white font-mono-nums mt-1 block">
            {totalOrders}
          </span>
        </div>

        <div className="bg-[#0c1224] border border-amber-500/30 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Verification</span>
          </span>
          <span className="text-2xl font-black text-amber-400 font-mono-nums mt-1 block">
            {pendingManual}
          </span>
        </div>

        <div className="bg-[#0c1224] border border-blue-500/30 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-blue-300">Paid / Confirmed</span>
          <span className="text-2xl font-black text-blue-400 font-mono-nums mt-1 block">
            {paidOrders}
          </span>
        </div>

        <div className="bg-[#0c1224] border border-indigo-500/30 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-indigo-300">Processing</span>
          <span className="text-2xl font-black text-indigo-400 font-mono-nums mt-1 block">
            {processingOrders}
          </span>
        </div>

        <div className="bg-[#0c1224] border border-emerald-500/30 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono-nums mt-1 block">
            {deliveredOrders}
          </span>
        </div>

        <div className="bg-[#0c1224] border border-rose-500/30 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-rose-300 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected / Cancel</span>
          </span>
          <span className="text-2xl font-black text-rose-400 font-mono-nums mt-1 block">
            {rejectedOrders}
          </span>
        </div>
      </div>

      {/* Manual Payment Verification Alert Banner if items pending */}
      {pendingManual > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-sm font-bold text-amber-300 block">
                {pendingManual} Manual Payment {pendingManual === 1 ? 'Submission' : 'Submissions'} Awaiting Verification
              </strong>
              <p className="text-xs text-slate-300">
                Customers have uploaded payment receipts for JazzCash / Easypaisa / PayPal / Payoneer.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            Review Orders
          </button>
        </div>
      )}

      {/* Recent Orders Feed */}
      <div className="bg-[#0b1020] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">Recent Orders</h3>
            <p className="text-xs text-slate-400">Latest customer purchases and top-up dispatches</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80 overflow-x-auto">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 flex items-center justify-between gap-4 text-xs font-mono-nums hover:bg-slate-800/20 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-[140px]">
                <div className="w-8 h-8 rounded-lg bg-[#070b16] border border-slate-800 flex items-center justify-center font-bold text-amber-400 text-[11px]">
                  {order.country}
                </div>
                <div>
                  <span className="font-bold text-white block">{order.orderNumber}</span>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="min-w-[120px]">
                <span className="text-slate-300 font-semibold">{order.productName}</span>
                <span className="text-slate-500 block text-[10px]">ID: {order.playerId}</span>
              </div>

              <div className="text-right min-w-[90px]">
                <span className="font-bold text-white">
                  {CURRENCIES[order.currency]?.format(order.amount)}
                </span>
                <span className="text-[10px] text-slate-400 block capitalize">{order.paymentMethod}</span>
              </div>

              <div className="min-w-[110px] text-right">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      : order.status === 'Payment Submitted' || order.status === 'Pending Verification'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      : order.status === 'Payment Confirmed' || order.status === 'Processing'
                      ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}

          {recentOrders.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No orders placed yet. Place a test order from the store catalog!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
