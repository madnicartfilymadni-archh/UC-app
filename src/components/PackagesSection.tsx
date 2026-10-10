import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { UCProduct } from '../types';
import { CURRENCIES } from '../lib/constants';
import { Layers, Flame, Crown, Gift } from 'lucide-react';

export const PackagesSection: React.FC = () => {
  const { products, setSelectedProduct, setIsCheckoutOpen, currency, setCurrency, country } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredProducts = products.filter((p) => {
    if (p.status === 'disabled') return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'popular') return p.category === 'popular' || p.isPromo;
    if (activeCategory === 'royale_pass') return p.category === 'royale_pass';
    if (activeCategory === 'special') return p.category === 'special';
    return true;
  });

  const handleSelectProduct = (product: UCProduct) => {
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
  };

  return (
    <section id="packages" className="py-16 sm:py-20 bg-tactical relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              <span>Catalog & Pricing</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Select Your PUBG UC Package
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Authentic in-game Unknown Cash delivered directly to your character ID. Prices shown in {CURRENCIES[currency].name} ({currency}).
            </p>
          </div>

          {/* Quick Currency Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0a0f1d] border border-slate-800 rounded-xl">
            {(['PKR', 'GBP', 'USD'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currency === curr
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{CURRENCIES[curr].flag}</span>
                <span>{curr}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-[#0f172a]/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Packages ({products.filter((p) => p.status !== 'disabled').length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('popular')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'popular'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-[#0f172a]/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Hot & Promotional Deals</span>
          </button>

          <button
            onClick={() => setActiveCategory('royale_pass')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'royale_pass'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-[#0f172a]/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Royale Pass Editions</span>
          </button>

          <button
            onClick={() => setActiveCategory('special')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'special'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-[#0f172a]/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>Mega Mythic Crates</span>
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={handleSelectProduct}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-[#0c1224] rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">No packages found for this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};
