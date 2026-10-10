import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { saveSiteSettings, addAuditLog } from '../../lib/db';
import { SiteSettings } from '../../types';
import { Save, Settings, MessageCircle, Mail, AlertCircle } from 'lucide-react';
import { ADMIN_EMAIL } from '../../lib/constants';

export const AdminSiteSettings: React.FC = () => {
  const { siteSettings, refreshSettings, showToast, currentUser } = useStore();
  const [settings, setSettings] = useState<SiteSettings>(siteSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const adminEmail = currentUser?.email || ADMIN_EMAIL;

    try {
      await saveSiteSettings(settings);
      await addAuditLog('Updated Site Settings', adminEmail, 'Modified store name, announcements, and contact channels.');
      showToast('Store settings updated!', 'success');
      refreshSettings();
    } catch (err) {
      showToast('Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white">Store & Brand Settings</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure customer service contacts, header announcement text, and fulfillment estimates.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50 self-start"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="bg-[#0b1020] border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Store Brand Name</label>
            <input
              type="text"
              required
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#070b16] border border-slate-800 rounded-xl text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Fulfillment Estimate (Minutes)</label>
            <input
              type="number"
              required
              value={settings.deliveryEstimateMinutes}
              onChange={(e) =>
                setSettings({ ...settings, deliveryEstimateMinutes: Number(e.target.value) })
              }
              className="w-full px-3.5 py-2.5 bg-[#070b16] border border-slate-800 rounded-xl text-white font-mono-nums"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Customer Support Email</span>
            </label>
            <input
              type="email"
              required
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#070b16] border border-slate-800 rounded-xl text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Support WhatsApp Number</span>
            </label>
            <input
              type="text"
              required
              value={settings.supportWhatsapp}
              onChange={(e) => setSettings({ ...settings, supportWhatsapp: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#070b16] border border-slate-800 rounded-xl text-white font-mono-nums"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-slate-300 font-semibold">Top Header Announcement Bar</label>
          <textarea
            rows={2}
            value={settings.announcement}
            onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
            className="w-full px-3.5 py-2 bg-[#070b16] border border-slate-800 rounded-xl text-white leading-relaxed"
          />
        </div>
      </div>
    </form>
  );
};
