import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../lib/db';
import { AuditLog } from '../../types';
import { FileText, RefreshCw, Shield, Search } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.warn('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      l.action?.toLowerCase().includes(term) ||
      l.performedBy?.toLowerCase().includes(term) ||
      l.orderNumber?.toLowerCase().includes(term) ||
      l.details?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white">System Audit Trail</h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of administrator actions, payment approvals, status transitions, and store settings updates.
          </p>
        </div>
        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-[#0c1224] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter audit logs..."
          className="w-full pl-9 pr-3 py-2 bg-[#070b16] border border-slate-800 rounded-xl text-white text-xs font-mono-nums"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-[#0b1020] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-nums">
            <thead className="bg-[#0e162b] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-bold text-amber-300">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {log.performedBy}
                  </td>
                  <td className="px-4 py-3 text-white font-bold">
                    {log.orderNumber || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px] max-w-xs truncate">
                    {log.details}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
