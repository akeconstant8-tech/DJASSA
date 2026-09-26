/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AppView, Language, Product, CartItem, ConfirmedOrder, SellerProfile } from './types';
import { initialProducts, defaultSellerProfile } from './data/mockData';
import { Navbar } from './components/Navbar';
import { CustomerCatalog } from './components/CustomerCatalog';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderConfirmationPage } from './components/OrderConfirmationPage';
import { SellerLoginModal } from './components/SellerLoginModal';
import { SellerAdminStock } from './components/SellerAdminStock';
import { NewProductModal } from './components/NewProductModal';

export default function App() {
  // Starts strictly on the client product catalog as requested
  const [currentView, setCurrentView] = useState<AppView>('catalog');
  const [lang, setLang] = useState<Language>('FR');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([
    { product: initialProducts[0], quantity: 1 }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Customer order confirmation state
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  // Seller profile & authentication
  const [seller, setSeller] = useState<SellerProfile>(defaultSellerProfile);
  const [isSellerLoginOpen, setIsSellerLoginOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  // Cart total count
  const cartCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  // Handlers for cart
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id === productId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  // Checkout flow
  const handleProceedToCheckout = () => {
    setCurrentView('checkout');
  };

  const handleOrderConfirmed = (order: ConfirmedOrder) => {
    // Deduct stock from purchased products
    setProducts((prev) =>
      prev.map((p) => {
        const itemInOrder = order.items.find((it) => it.product.id === p.id);
        if (itemInOrder) {
          return { ...p, stock: Math.max(0, p.stock - itemInOrder.quantity) };
        }
        return p;
      })
    );
    setCart([]);
    setConfirmedOrder(order);
    setCurrentView('confirmation');
  };

  // Seller Admin Stock Handlers
  const handleUpdateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  const handleToggleProductVisibility = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, visibility: !p.visibility } : p))
    );
  };

  const handleSaveNewProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleSellerLoginSuccess = (profile: SellerProfile) => {
    setSeller(profile);
    setCurrentView('seller_admin');
  };

  const handleSellerLogout = () => {
    setSeller({ ...seller, isAuthenticated: false });
    setCurrentView('catalog');
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#0f172a] flex flex-col font-sans selection:bg-[#ffedd5] selection:text-[#ea580c]">
      {/* Top Navbar with Orange Accents & Language Toggle */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        lang={lang}
        onToggleLang={setLang}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        seller={seller}
        onOpenSellerLogin={() => setIsSellerLoginOpen(true)}
        onLogoutSeller={handleSellerLogout}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full pb-16">
        {/* 1. Public Customer Catalog (Landing View) */}
        {currentView === 'catalog' && (
          <CustomerCatalog
            products={products}
            onAddToCart={handleAddToCart}
            lang={lang}
            globalSearch={searchQuery}
          />
        )}

        {/* 2. Customer Checkout & Payment Page */}
        {currentView === 'checkout' && (
          <CheckoutPage
            cartItems={cart}
            lang={lang}
            onBackToCatalog={() => setCurrentView('catalog')}
            onOrderConfirmed={handleOrderConfirmed}
          />
        )}

        {/* 3. Order Confirmation Screen */}
        {currentView === 'confirmation' && confirmedOrder && (
          <OrderConfirmationPage
            order={confirmedOrder}
            lang={lang}
            onBackToCatalog={() => setCurrentView('catalog')}
          />
        )}

        {/* 4. Seller Admin Stock Management Console */}
        {currentView === 'seller_admin' && (
          <SellerAdminStock
            products={products}
            onUpdateProductStock={handleUpdateProductStock}
            onToggleProductVisibility={handleToggleProductVisibility}
            onOpenNewProduct={() => setIsNewProductModalOpen(true)}
            onBackToMarketplace={() => setCurrentView('catalog')}
            seller={seller}
            lang={lang}
          />
        )}
      </main>

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
        lang={lang}
      />

      {/* Seller Authentication Modal */}
      <SellerLoginModal
        isOpen={isSellerLoginOpen}
        onClose={() => setIsSellerLoginOpen(false)}
        onLoginSuccess={handleSellerLoginSuccess}
      />

      {/* New Product Creation Modal */}
      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onSave={handleSaveNewProduct}
      />
    </div>
  );
}
