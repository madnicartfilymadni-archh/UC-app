import React from 'react';
import { UCProduct } from '../types';
import { useStore } from '../context/StoreContext';
import { CURRENCIES } from '../lib/constants';
import { Sparkles, ShoppingBag, Plus } from 'lucide-react';

interface ProductCardProps {
  product: UCProduct;
  onSelect: (product: UCProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { currency, country } = useStore();

  const price = product.prices[currency] ?? product.prices.PKR;
  const promoPrice = product.promoPrices?.[currency];
  const hasPromo = product.isPromo && promoPrice && promoPrice < price;

  const currencyConfig = CURRENCIES[currency];
  const formattedPrice = currencyConfig.format(hasPromo ? promoPrice : price);
  const formattedOriginalPrice = hasPromo ? currencyConfig.format(price) : null;

  return (
    <div className="group relative bg-[#0c1224] rounded-2xl border border-slate-800/80 hover:border-amber-500/60 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1">
      {/* Top Banner Tag */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md">
            {product.badge}
          </span>
        </div>
      )}

      {/* Product Image Area */}
      <div className="relative h-44 sm:h-48 w-full bg-[#080d1a] overflow-hidden flex items-center justify-center p-4">
        {/* Ambient glow behind coin */}
        <div className="absolute inset-0 bg-radial from-amber-500/15 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

        <img
          src={product.image}
          alt={`${product.name} PUBG Mobile Top-Up`}
          className="relative z-10 max-h-36 w-auto object-contain transform group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Graceful fallback to styled SVG
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {product.bonusUc > 0 && (
          <div className="absolute bottom-2 right-3 z-10 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono-nums">
            <Plus className="w-3 h-3" />
            <span>{product.bonusUc} Bonus UC</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
              {product.name}
            </h3>
            <span className="text-xs text-slate-400 font-medium">PUBG Global</span>
          </div>

          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono-nums">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Total: <strong>{product.ucAmount + product.bonusUc} Unknown Cash</strong></span>
          </p>
        </div>

        {/* Price & Buy Button Row */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            {hasPromo && formattedOriginalPrice && (
              <span className="text-[11px] text-slate-500 line-through font-mono-nums">
                {formattedOriginalPrice}
              </span>
            )}
            <span className="text-lg sm:text-xl font-extrabold text-amber-400 font-mono-nums">
              {formattedPrice}
            </span>
          </div>

          <button
            onClick={() => onSelect(product)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Top Up</span>
          </button>
        </div>
      </div>
    </div>
  );
};
