import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { PackagesSection } from './components/PackagesSection';
import { HowToOrder } from './components/HowToOrder';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { TrackOrderView } from './components/TrackOrderView';
import { AdminPortal } from './components/admin/AdminPortal';
import { Order } from './types';

const MainLayout: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedProduct,
    setSelectedProduct,
    isCheckoutOpen,
    setIsCheckoutOpen,
    setTrackingOrderNumber,
  } = useStore();

  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const handleOrderSuccess = (order: Order) => {
    setIsCheckoutOpen(false);
    setSelectedProduct(null);
    setConfirmedOrder(order);
  };

  const handleTrackOrder = (orderNum: string) => {
    setTrackingOrderNumber(orderNum);
    setActiveView('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Header stays persistent */}
      <Header />

      {/* Dynamic View Body */}
      <main className="flex-1">
        {activeView === 'admin' ? (
          <AdminPortal />
        ) : activeView === 'track' ? (
          <TrackOrderView />
        ) : (
          <>
            <HeroBanner />
            <PackagesSection />
            <HowToOrder />
            <FaqSection />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Checkout Modal */}
      {isCheckoutOpen && selectedProduct && (
        <CheckoutModal
          product={selectedProduct}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedProduct(null);
          }}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* Order Confirmation Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onTrack={handleTrackOrder}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
