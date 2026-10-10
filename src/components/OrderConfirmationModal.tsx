import React, { useState } from 'react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { CURRENCIES } from '../lib/constants';
import {
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Search,
  X,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order;
  onClose: () => void;
  onTrack: (orderNumber: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onTrack,
}) => {
  const { siteSettings, showToast } = useStore();
  const [copied, setCopied] = useState(false);

  const currencyConfig = CURRENCIES[order.currency];

  const handleCopy = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    showToast('Order Number copied!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0b1020] border border-amber-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 gold-glow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h3 className="font-display font-extrabold text-2xl text-white tracking-tight">
          Order Successfully Placed!
        </h3>

        <p className="text-xs text-slate-300 mt-2">
          Your PUBG Mobile UC request has been recorded in our dispatch system.
        </p>

        {/* Order Number Box */}
        <div className="my-5 p-4 rounded-xl bg-[#070b16] border border-amber-500/30 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider font-mono-nums">
              Order Number
            </span>
            <span className="text-xl font-black text-white font-mono-nums tracking-wide">
              {order.orderNumber}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Order Breakdown */}
        <div className="bg-[#0e162b] rounded-xl p-4 text-xs space-y-2 text-left mb-6 border border-slate-800 font-mono-nums">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Package:</span>
            <span className="font-bold text-white">{order.productName}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">PUBG Player ID:</span>
            <span className="font-bold text-amber-300">{order.playerId}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Amount Paid:</span>
            <span className="font-bold text-white">{currencyConfig.format(order.amount)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Payment Status:</span>
            <span className="font-bold text-emerald-400 uppercase tracking-wider">{order.status}</span>
          </div>
          <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
            <span className="text-slate-500">Est. Fulfillment:</span>
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>5–15 Minutes</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onTrack(order.orderNumber);
              onClose();
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Search className="w-4 h-4" />
            <span>Track Live Order Status</span>
          </button>

          {siteSettings.supportWhatsapp && (
            <a
              href={`https://wa.me/${siteSettings.supportWhatsapp.replace(/\D/g, '')}?text=Hi,%20I%20placed%20PUBG%20UC%20order%20${order.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact Live Support on WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
