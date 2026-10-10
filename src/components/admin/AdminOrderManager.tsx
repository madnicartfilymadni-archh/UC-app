import React, { useState, useEffect } from 'react';
import {
  getAllOrders,
  getAllSubmissions,
  updateOrderStatus,
  reviewPaymentSubmission,
  addAuditLog,
} from '../../lib/db';
import { Order, OrderStatus, PaymentSubmission } from '../../types';
import { CURRENCIES, ADMIN_EMAIL } from '../../lib/constants';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Building2,
  CreditCard,
  X,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export const AdminOrderManager: React.FC = () => {
  const { currentUser, showToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [matchingSubmission, setMatchingSubmission] = useState<PaymentSubmission | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [o, s] = await Promise.all([getAllOrders(), getAllSubmissions()]);
      setOrders(o);
      setSubmissions(s);
    } catch (err) {
      console.warn('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setAdminNoteInput(order.adminNote || '');
    setRejectionReasonInput('');
    // Look up matching submission for this order number
    const sub = submissions.find(
      (s) => s.orderNumber?.toUpperCase() === order.orderNumber?.toUpperCase() || s.orderId === order.id
    );
    setMatchingSubmission(sub || null);
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!selectedOrder || !selectedOrder.id) return;
    setIsUpdating(true);
    const adminEmail = currentUser?.email || ADMIN_EMAIL;

    try {
      await updateOrderStatus(selectedOrder.id, newStatus, {
        adminNote: adminNoteInput.trim() || undefined,
        rejectionReason: newStatus === 'Rejected' ? rejectionReasonInput.trim() || 'Fulfillment rejected by admin' : undefined,
        deliveredBy: newStatus === 'Delivered' ? adminEmail : undefined,
      });

      await addAuditLog(
        `Order Status -> ${newStatus}`,
        adminEmail,
        `Status updated from ${selectedOrder.status} to ${newStatus}. Note: ${adminNoteInput}`,
        selectedOrder.orderNumber
      );

      showToast(`Order status updated to ${newStatus}`, 'success');
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus,
        adminNote: adminNoteInput.trim() || selectedOrder.adminNote,
      });
      loadData();
    } catch (err: any) {
      showToast('Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Review manual receipt approval/rejection
  const handleReviewSubmission = async (approved: boolean) => {
    if (!selectedOrder || !selectedOrder.id || !matchingSubmission || !matchingSubmission.id) return;
    setIsUpdating(true);
    const adminEmail = currentUser?.email || ADMIN_EMAIL;

    try {
      const result = await reviewPaymentSubmission(
        matchingSubmission.id,
        selectedOrder.id,
        approved,
        adminEmail,
        rejectionReasonInput.trim() || 'Invalid or unverifiable payment receipt'
      );

      if (!result.success) {
        showToast(result.error || 'Failed to review submission', 'error');
        setIsUpdating(false);
        return;
      }

      await addAuditLog(
        approved ? 'Approved Manual Payment' : 'Rejected Manual Payment',
        adminEmail,
        `Ref ID: ${matchingSubmission.transactionId}. Payer: ${matchingSubmission.payerName}.`,
        selectedOrder.orderNumber
      );

      showToast(
        approved
          ? 'Payment verified! Order marked as Payment Confirmed.'
          : 'Payment receipt rejected.',
        approved ? 'success' : 'info'
      );

      loadData();
      openOrderModal({
        ...selectedOrder,
        status: approved ? 'Payment Confirmed' : 'Rejected',
      });
    } catch (err: any) {
      showToast('Error reviewing submission', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (countryFilter !== 'all' && o.country !== countryFilter) return false;
    if (paymentMethodFilter !== 'all' && o.paymentMethod !== paymentMethodFilter) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchOrder = o.orderNumber?.toLowerCase().includes(term);
      const matchPlayer = o.playerId?.toLowerCase().includes(term);
      const matchEmail = o.customerEmail?.toLowerCase().includes(term);
      const matchName = o.productName?.toLowerCase().includes(term);
      return matchOrder || matchPlayer || matchEmail || matchName;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white">Order Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Search, verify receipts, update fulfillment state, and manage player deliveries.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-[#0c1224] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-[#0b1020] border border-slate-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Order#, Player ID, Email..."
            className="w-full pl-9 pr-3 py-2 bg-[#070b16] border border-slate-800 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 font-mono-nums"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 focus:border-amber-400 rounded-xl text-slate-300 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Awaiting Payment">Awaiting Payment</option>
            <option value="Payment Submitted">Payment Submitted (Pending Review)</option>
            <option value="Payment Confirmed">Payment Confirmed</option>
            <option value="Processing">Processing Dispatch</option>
            <option value="Delivered">Delivered</option>
            <option value="Rejected">Rejected</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        {/* Country Filter */}
        <div>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 focus:border-amber-400 rounded-xl text-slate-300 cursor-pointer"
          >
            <option value="all">All Countries</option>
            <option value="PK">🇵🇰 Pakistan (PKR)</option>
            <option value="GB">🇬🇧 United Kingdom (GBP)</option>
            <option value="US">🇺🇸 United States (USD)</option>
          </select>
        </div>

        {/* Payment Method Filter */}
        <div>
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 focus:border-amber-400 rounded-xl text-slate-300 cursor-pointer"
          >
            <option value="all">All Payment Methods</option>
            <option value="manual">Manual Bank / JazzCash / Easypaisa</option>
            <option value="card">Card Payment (Visa/Mastercard)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0b1020] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-nums">
            <thead className="bg-[#0e162b] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Order Number</th>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">PUBG Player ID</th>
                <th className="px-4 py-3.5">Package</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Channel</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3.5 font-bold text-white">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                    {new Date(order.createdAt).toLocaleDateString()}{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3.5 text-amber-300 font-bold">
                    {order.playerId}
                  </td>
                  <td className="px-4 py-3.5 text-slate-200">
                    {order.productName}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-white">
                    {CURRENCIES[order.currency]?.format(order.amount)}
                  </td>
                  <td className="px-4 py-3.5 capitalize text-slate-400">
                    {order.paymentMethod === 'card' ? 'Online Card' : 'Manual'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : order.status === 'Payment Submitted' || order.status === 'Pending Verification'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30 animate-pulse'
                          : order.status === 'Payment Confirmed' || order.status === 'Processing'
                          ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => openOrderModal(order)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    No matching orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Verification Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0b1020] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#0e162b] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 font-mono-nums block">
                  Order Management
                </span>
                <h3 className="font-display font-bold text-xl text-white font-mono-nums">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Order Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#070b16] border border-slate-800 text-xs font-mono-nums">
                <div>
                  <span className="text-slate-500 block text-[10px]">PUBG Character ID</span>
                  <span className="font-bold text-amber-300 text-sm">{selectedOrder.playerId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Nickname</span>
                  <span className="font-semibold text-white">{selectedOrder.playerNickname || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Package</span>
                  <span className="font-semibold text-white">{selectedOrder.productName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Amount</span>
                  <span className="font-bold text-amber-400">
                    {CURRENCIES[selectedOrder.currency]?.format(selectedOrder.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Payment Method</span>
                  <span className="font-semibold text-white capitalize">{selectedOrder.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Current Status</span>
                  <span className="font-bold text-emerald-400">{selectedOrder.status}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Customer Email</span>
                  <span className="font-semibold text-slate-300">{selectedOrder.customerEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Customer Phone</span>
                  <span className="font-semibold text-slate-300">{selectedOrder.customerPhone || 'N/A'}</span>
                </div>
              </div>

              {/* Manual Payment Verification Section (if manual payment) */}
              {matchingSubmission && (
                <div className="p-4 rounded-xl bg-[#0e162b] border border-amber-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white text-xs uppercase tracking-wider">
                        Manual Payment Submission
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono-nums ${
                        matchingSubmission.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-300'
                          : matchingSubmission.status === 'rejected'
                          ? 'bg-rose-950 text-rose-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {matchingSubmission.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono-nums">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Payer Name</span>
                      <span className="font-semibold text-white">{matchingSubmission.payerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Transaction ID (TID)</span>
                      <span className="font-bold text-amber-300">{matchingSubmission.transactionId}</span>
                    </div>
                  </div>

                  {/* Receipt Preview */}
                  {matchingSubmission.receiptUrl && (
                    <div className="space-y-1.5">
                      <span className="text-slate-400 text-xs block">Attached Payment Receipt:</span>
                      <div className="flex items-center gap-3">
                        <img
                          src={matchingSubmission.receiptUrl}
                          alt="Payment Receipt"
                          onClick={() => setLightboxImage(matchingSubmission.receiptUrl)}
                          className="h-24 w-auto rounded-lg border border-slate-700 object-cover cursor-pointer hover:border-amber-400 transition-colors shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => setLightboxImage(matchingSubmission.receiptUrl)}
                          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Full Size Receipt</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Approval Actions if still pending */}
                  {matchingSubmission.status === 'pending' && (
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => handleReviewSubmission(true)}
                        disabled={isUpdating}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Payment & Confirm Order</span>
                      </button>

                      <button
                        onClick={() => handleReviewSubmission(false)}
                        disabled={isUpdating}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-rose-600/20"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Payment</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Status Updater Actions */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Update Fulfillment Lifecycle
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange('Payment Confirmed')}
                    disabled={isUpdating}
                    className="px-3 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900 border border-blue-500/40 text-blue-200 text-xs font-semibold cursor-pointer"
                  >
                    Mark Paid
                  </button>
                  <button
                    onClick={() => handleStatusChange('Processing')}
                    disabled={isUpdating}
                    className="px-3 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-200 text-xs font-semibold cursor-pointer"
                  >
                    Mark Processing
                  </button>
                  <button
                    onClick={() => handleStatusChange('Delivered')}
                    disabled={isUpdating}
                    className="px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-xs font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm UC Delivered</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('Rejected')}
                    disabled={isUpdating}
                    className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-semibold cursor-pointer"
                  >
                    Mark Rejected
                  </button>
                  <button
                    onClick={() => handleStatusChange('Refunded')}
                    disabled={isUpdating}
                    className="px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-semibold cursor-pointer"
                  >
                    Mark Refunded
                  </button>
                </div>
              </div>

              {/* Internal Admin Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Internal Staff Note (Audit Record)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="e.g. Dispatched via Midasbuy Batch #4892"
                    className="flex-1 px-3 py-2 bg-[#070b16] border border-slate-800 rounded-xl text-white text-xs"
                  />
                  <button
                    onClick={() => handleStatusChange(selectedOrder.status)}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              {/* Rejection reason input if rejecting */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Rejection Reason (Shown to customer on tracking screen)
                </label>
                <input
                  type="text"
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Transaction ID was not found on bank statement"
                  className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for Payment Receipt */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxImage}
              alt="Receipt zoom"
              className="max-h-[85vh] w-auto rounded-xl object-contain shadow-2xl border border-slate-800"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
