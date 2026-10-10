import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { saveProduct, deleteProduct, seedProductsIfEmpty } from '../../lib/db';
import { UCProduct } from '../../types';
import {
  HERO_BANNER_IMG,
  UC_CHEST_IMG,
  UC_STACK_IMG,
  ROYALE_PASS_IMG,
  INITIAL_PRODUCTS,
} from '../../lib/constants';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  X,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

export const AdminProductManager: React.FC = () => {
  const { products, refreshProducts, showToast } = useStore();
  const [editingProduct, setEditingProduct] = useState<Partial<UCProduct> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const availableImages = [
    { label: 'UC Coin Stack', path: UC_STACK_IMG },
    { label: 'UC Treasure Chest', path: UC_CHEST_IMG },
    { label: 'Royale Pass Emblem', path: ROYALE_PASS_IMG },
    { label: 'Battlefield Key Art', path: HERO_BANNER_IMG },
  ];

  const handleOpenAdd = () => {
    setEditingProduct({
      id: `uc_custom_${Date.now()}`,
      name: '',
      ucAmount: 600,
      bonusUc: 60,
      image: UC_STACK_IMG,
      category: 'standard',
      prices: {
        PKR: 2500,
        GBP: 7.99,
        USD: 9.99,
      },
      promoPrices: {},
      isPromo: false,
      status: 'active',
      sortOrder: products.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: UCProduct) => {
    setEditingProduct({ ...product });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (product: UCProduct) => {
    const updatedStatus = product.status === 'active' ? 'disabled' : 'active';
    try {
      await saveProduct({ ...product, status: updatedStatus });
      showToast(`Package "${product.name}" is now ${updatedStatus}`, 'info');
      refreshProducts();
    } catch (err) {
      showToast('Error toggling package status', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete package "${name}"?`)) return;
    try {
      await deleteProduct(id);
      showToast(`Deleted "${name}" successfully`, 'success');
      refreshProducts();
    } catch (err) {
      showToast('Error deleting package', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.id || !editingProduct.name) {
      showToast('Please provide package name and valid details', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await saveProduct(editingProduct as UCProduct);
      showToast('Package saved successfully!', 'success');
      setIsModalOpen(false);
      setEditingProduct(null);
      refreshProducts();
    } catch (err) {
      showToast('Failed to save product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!window.confirm('Reset all UC packages to official baseline prices?')) return;
    setIsSaving(true);
    try {
      for (const p of INITIAL_PRODUCTS) {
        await saveProduct(p);
      }
      showToast('Reset packages to default catalog', 'success');
      refreshProducts();
    } catch (err) {
      showToast('Error resetting catalog', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white">UC Packages Catalog</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure Unknown Cash bundles, custom country prices (PKR, GBP, USD), promotional discounts, and availability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Package</span>
          </button>
        </div>
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => {
          const isAct = p.status === 'active';
          return (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isAct
                  ? 'bg-[#0b1020] border-slate-800 hover:border-amber-500/40'
                  : 'bg-[#080c18] border-slate-900 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-12 h-12 object-contain rounded-lg bg-[#070b16] p-1 border border-slate-800"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{p.name}</h4>
                      <p className="text-xs text-amber-400 font-mono-nums">
                        {p.ucAmount} UC {p.bonusUc > 0 && `(+${p.bonusUc} Bonus)`}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono-nums ${
                      isAct ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                {/* Country Pricing Breakdown */}
                <div className="p-3 rounded-xl bg-[#070b16] border border-slate-800/80 text-xs font-mono-nums space-y-1 mb-4">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">🇵🇰 Pakistan:</span>
                    <span className="font-bold text-amber-300">
                      ₨ {p.prices?.PKR?.toLocaleString()}
                      {p.promoPrices?.PKR && (
                        <span className="text-slate-500 text-[10px] line-through ml-1.5">
                          (Promo: ₨ {p.promoPrices.PKR})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">🇬🇧 UK:</span>
                    <span className="font-bold text-white">
                      £{p.prices?.GBP?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">🇺🇸 USA:</span>
                    <span className="font-bold text-white">
                      ${p.prices?.USD?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                <button
                  onClick={() => handleToggleStatus(p)}
                  className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {isAct ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isAct ? 'Disable' : 'Enable'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    title="Edit Package"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 cursor-pointer"
                    title="Delete Package"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0b1020] border border-amber-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="font-display font-bold text-lg text-white">
                {editingProduct.name ? `Edit "${editingProduct.name}"` : 'Create New UC Package'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Package Title *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. 600 + 60 UC Royale Pass Pack"
                  className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 rounded-xl text-white font-mono-nums"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Base UC Quantity *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.ucAmount || 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, ucAmount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 rounded-xl text-white font-mono-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Bonus Extra UC</label>
                  <input
                    type="number"
                    value={editingProduct.bonusUc || 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, bonusUc: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#070b16] border border-slate-800 rounded-xl text-white font-mono-nums"
                  />
                </div>
              </div>

              {/* Country Specific Pricing */}
              <div className="p-3.5 rounded-xl bg-[#070c18] border border-amber-500/20 space-y-3">
                <span className="font-bold text-amber-300 block uppercase tracking-wider text-[10px]">
                  Configured Country Prices
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-1">🇵🇰 Pakistan (PKR)</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.prices?.PKR ?? 0}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          prices: { ...editingProduct.prices!, PKR: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-[#0b1020] border border-slate-800 rounded-lg text-white font-mono-nums"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-1">🇬🇧 UK (GBP)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingProduct.prices?.GBP ?? 0}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          prices: { ...editingProduct.prices!, GBP: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-[#0b1020] border border-slate-800 rounded-lg text-white font-mono-nums"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-1">🇺🇸 USA (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingProduct.prices?.USD ?? 0}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          prices: { ...editingProduct.prices!, USD: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-[#0b1020] border border-slate-800 rounded-lg text-white font-mono-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Promotional Price (Optional) */}
              <div className="p-3 rounded-xl bg-[#070c18] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">Enable Promotional Deal</label>
                  <input
                    type="checkbox"
                    checked={editingProduct.isPromo || false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isPromo: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                  />
                </div>
                {editingProduct.isPromo && (
                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono-nums">
                    <div>
                      <span className="text-[10px] text-slate-500 block">PKR Promo</span>
                      <input
                        type="number"
                        value={editingProduct.promoPrices?.PKR || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            promoPrices: {
                              ...editingProduct.promoPrices,
                              PKR: Number(e.target.value),
                            },
                          })
                        }
                        placeholder="Discounted PKR"
                        className="w-full px-2 py-1 bg-[#0b1020] border border-slate-800 rounded text-white text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">GBP Promo</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.promoPrices?.GBP || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            promoPrices: {
                              ...editingProduct.promoPrices,
                              GBP: Number(e.target.value),
                            },
                          })
                        }
                        placeholder="Discounted GBP"
                        className="w-full px-2 py-1 bg-[#0b1020] border border-slate-800 rounded text-white text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">USD Promo</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.promoPrices?.USD || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            promoPrices: {
                              ...editingProduct.promoPrices,
                              USD: Number(e.target.value),
                            },
                          })
                        }
                        placeholder="Discounted USD"
                        className="w-full px-2 py-1 bg-[#0b1020] border border-slate-800 rounded text-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Image Selection */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Select 3D Coin Image Asset</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableImages.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, image: img.path })}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        editingProduct.image === img.path
                          ? 'border-amber-400 bg-amber-500/10'
                          : 'border-slate-800 bg-[#070b16] opacity-70'
                      }`}
                    >
                      <img src={img.path} alt={img.label} className="w-10 h-10 object-contain mx-auto mb-1" />
                      <span className="text-[9px] text-slate-300 block truncate">{img.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
