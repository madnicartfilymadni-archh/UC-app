import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { getOrderByNumber } from '../lib/db';
import { Order, OrderStatus } from '../types';
import { CURRENCIES } from '../lib/constants';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  ShieldCheck,
  User,
  ArrowLeft,
  RefreshCw,
  XCircle,
  CornerDownRight,
} from 'lucide-react';

export const TrackOrderView: React.FC = () => {
  const { trackingOrderNumber, setTrackingOrderNumber, setActiveView, showToast, siteSettings } = useStore();
  const [orderNumberInput, setOrderNumberInput] = useState(trackingOrderNumber || '');
  const [verifyPlayerId, setVerifyPlayerId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (trackingOrderNumber) {
      setOrderNumberInput(trackingOrderNumber);
      handleSearch(trackingOrderNumber);
    }
  }, [trackingOrderNumber]);

  const handleSearch = async (numToSearch?: string) => {
    const target = (numToSearch || orderNumberInput).trim();
    if (!target) {
      showToast('Please enter an order number', 'error');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const result = await getOrderByNumber(target);
      if (!result) {
        setOrder(null);
        showToast('No order found with this Order Number', 'error');
      } else {
        // If user entered player ID for privacy check, verify
        if (verifyPlayerId.trim() && result.playerId !== verifyPlayerId.trim()) {
          setOrder(null);
          showToast('Player ID does not match this order number', 'error');
        } else {
          setOrder(result);
        }
      }
    } catch (err: any) {
      showToast('Error retrieving order details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepState = (targetStep: number, currentStatus: OrderStatus) => {
    const statusMap: Record<OrderStatus, number> = {
      'Awaiting Payment': 1,
      'Payment Submitted': 2,
      'Pending Verification': 2,
      'Payment Confirmed': 3,
      'Processing': 4,
      'Delivered': 5,
      'Rejected': -1,
      'Refunded': -2,
    };

    const currentStepVal = statusMap[currentStatus] || 1;
    if (currentStepVal < 0) return 'error';
    if (currentStepVal > targetStep) return 'completed';
    if (currentStepVal === targetStep) return 'active';
    return 'pending';
  };

  const timelineSteps = [
    { num: 1, title: 'Order Placed', desc: 'Awaiting customer payment' },
    { num: 2, title: 'Payment Submitted', desc: 'Pending administrator verification' },
    { num: 3, title: 'Payment Confirmed', desc: 'Funds verified in receiving account' },
    { num: 4, title: 'Dispatch Processing', desc: 'Injecting UC via PUBG Official Servers' },
    { num: 5, title: 'Delivered', desc: 'Unknown Cash credited to character mailbox' },
  ];

  return (
    <section className="min-h-screen py-16 bg-[#060913] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          onClick={() => setActiveView('store')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Top-Up Catalog</span>
        </button>

        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
            Live Order Status
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
            Track Your PUBG UC Order
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Enter your order number (e.g. VX-982410) to view real-time verification and fulfillment progress.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-[#0b1020] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
          >
            <div className="sm:col-span-6 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Order Number *
              </label>
              <input
                type="text"
                required
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value.toUpperCase())}
                placeholder="e.g. VX-481920"
                className="w-full px-4 py-3 bg-[#070b16] border border-slate-800 focus:border-amber-400 rounded-xl text-white font-mono-nums text-sm uppercase tracking-wider"
              />
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                PUBG Player ID (Optional)
              </label>
              <input
                type="text"
                value={verifyPlayerId}
                onChange={(e) => setVerifyPlayerId(e.target.value)}
                placeholder="For privacy verify"
                className="w-full px-4 py-3 bg-[#070b16] border border-slate-800 focus:border-amber-400 rounded-xl text-white font-mono-nums text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Track</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search Results Display */}
        {order && (
          <div className="bg-[#0b1020] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-300">
            {/* Order Header Banner */}
            <div className="bg-[#0e162b] p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block font-mono-nums">
                  Order Details
                </span>
                <h2 className="font-display font-extrabold text-xl text-white font-mono-nums">
                  {order.orderNumber}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono-nums ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : order.status === 'Rejected' || order.status === 'Refunded'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : order.status === 'Payment Confirmed' || order.status === 'Processing'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-900 text-slate-300 border border-slate-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {/* Live Progress Timeline */}
            <div className="p-6 sm:p-8 border-b border-slate-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                Fulfillment Timeline
              </h3>

              {order.status === 'Rejected' ? (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3 text-xs text-rose-200">
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm font-bold text-rose-300">Order Verification Rejected</strong>
                    <p className="mt-1">
                      {order.rejectionReason || 'The payment proof or transaction reference could not be verified in the receiving bank account.'}
                    </p>
                    <p className="mt-2 text-rose-300">
                      Please reach out to support on WhatsApp or email with your payment SMS.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 relative z-10">
                    {timelineSteps.map((st) => {
                      const stState = getStepState(st.num, order.status);
                      return (
                        <div key={st.num} className="flex sm:flex-col items-center sm:text-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all font-mono-nums ${
                              stState === 'completed'
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                                : stState === 'active'
                                ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 shadow-md shadow-amber-500/30 animate-pulse'
                                : 'bg-[#070b16] text-slate-500 border border-slate-800'
                            }`}
                          >
                            {stState === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : st.num}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-white">{st.title}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                              {st.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Order Breakdown */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono-nums">
              <div className="space-y-3 bg-[#070b16] p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Player & Package Information
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-400">PUBG Player ID:</span>
                  <span className="text-white font-bold">{order.playerId}</span>
                </div>
                {order.playerNickname && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Player Nickname:</span>
                    <span className="text-amber-300 font-semibold">{order.playerNickname}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Package:</span>
                  <span className="text-white font-bold">{order.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total UC Delivered:</span>
                  <span className="text-amber-400 font-bold">{order.ucAmount + order.bonusUc} UC</span>
                </div>
              </div>

              <div className="space-y-3 bg-[#070b16] p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Billing & Settlement
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Amount:</span>
                  <span className="text-white font-bold">
                    {CURRENCIES[order.currency]?.format(order.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Channel:</span>
                  <span className="text-slate-200 capitalize">
                    {order.paymentMethod === 'card' ? 'Online Debit/Credit Card' : 'Manual Bank/Wallet'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Country:</span>
                  <span className="text-slate-200">
                    {order.country === 'PK' ? 'Pakistan (PKR)' : order.country === 'GB' ? 'United Kingdom (GBP)' : 'United States (USD)'}
                  </span>
                </div>
                {order.deliveryConfirmedAt && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Delivered At:</span>
                    <span className="font-bold">
                      {new Date(order.deliveryConfirmedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {hasSearched && !order && !isLoading && (
          <div className="bg-[#0b1020] border border-slate-800 rounded-2xl p-10 text-center">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-white font-bold text-base">No Order Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Please double check the order number format (e.g. VX-123456). If you just placed the order, wait a few moments.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
