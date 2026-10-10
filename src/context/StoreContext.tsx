import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { CountryCode, CurrencyCode, SiteSettings, UCProduct } from '../types';
import { ADMIN_EMAIL, CURRENCIES, DEFAULT_SITE_SETTINGS, INITIAL_PRODUCTS } from '../lib/constants';
import { getProducts, getSiteSettings, seedProductsIfEmpty } from '../lib/db';

interface StoreContextType {
  country: CountryCode;
  currency: CurrencyCode;
  setCountryAndCurrency: (c: CountryCode) => void;
  setCurrency: (c: CurrencyCode) => void;
  playerId: string;
  setPlayerId: (id: string) => void;
  playerNickname: string;
  setPlayerNickname: (name: string) => void;
  products: UCProduct[];
  refreshProducts: () => Promise<void>;
  siteSettings: SiteSettings;
  refreshSettings: () => Promise<void>;
  selectedProduct: UCProduct | null;
  setSelectedProduct: (p: UCProduct | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  activeView: 'store' | 'track' | 'admin';
  setActiveView: (view: 'store' | 'track' | 'admin') => void;
  trackingOrderNumber: string;
  setTrackingOrderNumber: (num: string) => void;
  currentUser: User | null;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [country, setCountry] = useState<CountryCode>('PK');
  const [currency, setCurrencyState] = useState<CurrencyCode>('PKR');
  const [playerId, setPlayerId] = useState<string>('');
  const [playerNickname, setPlayerNickname] = useState<string>('');
  const [products, setProducts] = useState<UCProduct[]>(INITIAL_PRODUCTS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [selectedProduct, setSelectedProduct] = useState<UCProduct | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeView, setActiveView] = useState<'store' | 'track' | 'admin'>('store');
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync country and currency together
  const setCountryAndCurrency = (c: CountryCode) => {
    setCountry(c);
    if (c === 'PK') setCurrencyState('PKR');
    else if (c === 'GB') setCurrencyState('GBP');
    else if (c === 'US') setCurrencyState('USD');
  };

  const setCurrency = (curr: CurrencyCode) => {
    setCurrencyState(curr);
    if (curr === 'PKR') setCountry('PK');
    else if (curr === 'GBP') setCountry('GB');
    else if (curr === 'USD') setCountry('US');
  };

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const isAdmin = Boolean(
    currentUser &&
    (currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
     currentUser.email?.toLowerCase().includes('admin'))
  );

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Logged in successfully', 'success');
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      showToast(err.message || 'Failed to sign in with Google', 'error');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      showToast('Logged out successfully', 'info');
    } catch (err: any) {
      showToast('Failed to log out', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const refreshProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.warn('Failed to load products, using defaults', err);
      setProducts(INITIAL_PRODUCTS);
    }
  };

  const refreshSettings = async () => {
    try {
      const s = await getSiteSettings();
      setSiteSettings(s);
    } catch (err) {
      console.warn('Failed to load settings', err);
    }
  };

  useEffect(() => {
    // Initial load & seed
    seedProductsIfEmpty().then(() => {
      refreshProducts();
    });
    refreshSettings();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        country,
        currency,
        setCountryAndCurrency,
        setCurrency,
        playerId,
        setPlayerId,
        playerNickname,
        setPlayerNickname,
        products,
        refreshProducts,
        siteSettings,
        refreshSettings,
        selectedProduct,
        setSelectedProduct,
        isCheckoutOpen,
        setIsCheckoutOpen,
        activeView,
        setActiveView,
        trackingOrderNumber,
        setTrackingOrderNumber,
        currentUser,
        isAdmin,
        loginWithGoogle,
        logout,
        showToast,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-300">
          <div
            className={`px-4 py-3 rounded-lg shadow-xl text-sm font-semibold flex items-center gap-2 border ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-500/50'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-200 border-rose-500/50'
                : 'bg-slate-900 text-amber-200 border-amber-500/50'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
