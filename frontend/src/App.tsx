/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppView,
  Language,
  Product,
  CartItem,
  ConfirmedOrder,
  SellerProfile,
  NewProductInput,
  PaymentMethod
} from './types';
import { initialProducts, defaultSellerProfile, translations } from './data/mockData';
import { Navbar } from './components/Navbar';
import { CustomerCatalog } from './components/CustomerCatalog';
import { CartDrawer } from './components/CartDrawer';
import {
  CheckoutSkeleton,
  ConfirmationSkeleton,
  OverlayLoader,
  SellerAdminSkeleton
} from './components/skeletons/PageSkeletons';
import {
  CheckoutPage,
  NewProductModal,
  OrderConfirmationPage,
  SellerAdminStock,
  SellerLoginModal,
  prefetchBuyerScreensWhenIdle,
  prefetchScreens
} from './lazyScreens';
import { AnimatePresence, PageTransition } from './motion';

// Titre de l'onglet par page (utile aussi aux lecteurs d'écran à chaque changement de page).
const PAGE_TITLES: Record<AppView, Record<Language, string>> = {
  catalog: { FR: 'Catalogue', EN: 'Catalog' },
  checkout: { FR: 'Paiement', EN: 'Checkout' },
  confirmation: { FR: 'Commande confirmée', EN: 'Order confirmed' },
  seller_admin: { FR: 'Espace vendeur', EN: 'Seller space' }
};

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
  // Moyen de paiement choisi depuis le raccourci du panier, présélectionné au checkout.
  const [preferredPayment, setPreferredPayment] = useState<PaymentMethod | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title = `${PAGE_TITLES[currentView][lang]} — Djassa Market`;
  }, [currentView, lang]);

  const t = translations[lang];

  // Après une transition de page : retour en haut, et focus sur le contenu pour le clavier et les lecteurs d'écran.
  const handlePageExitComplete = () => {
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  };

  // Customer order confirmation state
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  // Seller profile & authentication
  const [seller, setSeller] = useState<SellerProfile>(defaultSellerProfile);
  const [isSellerLoginOpen, setIsSellerLoginOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  useEffect(() => {
    prefetchBuyerScreensWhenIdle();
  }, []);

  // Préchargement sur intention : le panier ouvert mène au paiement, la connexion à l'espace vendeur.
  useEffect(() => {
    if (isCartOpen) prefetchScreens('checkout');
  }, [isCartOpen]);
  useEffect(() => {
    if (isSellerLoginOpen) prefetchScreens('sellerAdmin', 'newProduct');
  }, [isSellerLoginOpen]);

  // Cart total count
  const cartCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  const sellerProducts = useMemo(
    () => products.filter((p) => p.sellerId === seller.id),
    [products, seller.id]
  );

  // Stock actuel (et non l'instantané stocké dans le panier) : la quantité ne peut jamais le dépasser (RG-01).
  const currentStock = (productId: string) => products.find((p) => p.id === productId)?.stock ?? 0;

  // Handlers for cart
  // Renvoie false si le stock disponible est déjà entièrement dans le panier.
  const handleAddToCart = (product: Product): boolean => {
    const stock = currentStock(product.id);
    const inCart = cart.find((i) => i.product.id === product.id)?.quantity ?? 0;
    if (inCart >= stock) return false;

    setCart((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: Math.min(i.quantity + 1, stock) } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    return true;
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    const stock = currentStock(productId);
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id === productId) {
            const nextQty = Math.min(i.quantity + delta, stock);
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
  const handleProceedToCheckout = (method?: PaymentMethod) => {
    setPreferredPayment(method ?? null);
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
  const isOwnedBySeller = (p: Product) => seller.isAuthenticated && p.sellerId === seller.id;

  const handleUpdateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId && isOwnedBySeller(p) ? { ...p, stock: newStock } : p
      )
    );
  };

  const handleToggleProductVisibility = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId && isOwnedBySeller(p) ? { ...p, visibility: !p.visibility } : p
      )
    );
  };

  // Le vendeur est déduit de la session, jamais du formulaire.
  const handleSaveNewProduct = (input: NewProductInput) => {
    if (!seller.isAuthenticated) return;
    const newProduct: Product = {
      ...input,
      sellerId: seller.id,
      sellerName: seller.name,
      sellerShopName: seller.shopName
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleSellerLoginSuccess = (profile: SellerProfile) => {
    setSeller(profile);
    setCurrentView('seller_admin');
  };

  const handleSellerLogout = () => {
    setSeller(defaultSellerProfile);
    setCurrentView('catalog');
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#0f172a] flex flex-col font-sans selection:bg-[#ffedd5] selection:text-[#ea580c]">
      {/* Lien d'évitement : premier élément atteint au clavier, visible seulement au focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-[#0f172a] focus:text-white focus:text-xs focus:font-bold focus:shadow-xl focus:outline-2 focus:outline-offset-2 focus:outline-[#ea580c]"
      >
        {translations[lang].skipToContent}
      </a>

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
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="flex-1 w-full pb-16 overflow-x-clip focus:outline-none"
      >
        {/* La page sortante s'efface avant l'entrée de la suivante. */}
        <AnimatePresence mode="wait" onExitComplete={handlePageExitComplete}>
          {/* 1. Public Customer Catalog (Landing View) */}
          {currentView === 'catalog' && (
            <PageTransition key="catalog">
              <CustomerCatalog
                products={products}
                onAddToCart={handleAddToCart}
                lang={lang}
                globalSearch={searchQuery}
              />
            </PageTransition>
          )}

          {/* 2. Customer Checkout & Payment Page */}
          {currentView === 'checkout' && (
            <PageTransition key="checkout">
              <Suspense fallback={<CheckoutSkeleton label={t.loadingPage} />}>
                <CheckoutPage
                  cartItems={cart}
                  lang={lang}
                  initialPaymentMethod={preferredPayment}
                  onBackToCatalog={() => setCurrentView('catalog')}
                  onOrderConfirmed={handleOrderConfirmed}
                />
              </Suspense>
            </PageTransition>
          )}

          {/* 3. Order Confirmation Screen */}
          {currentView === 'confirmation' && confirmedOrder && (
            <PageTransition key="confirmation">
              <Suspense fallback={<ConfirmationSkeleton label={t.loadingPage} />}>
                <OrderConfirmationPage
                  order={confirmedOrder}
                  lang={lang}
                  onBackToCatalog={() => setCurrentView('catalog')}
                />
              </Suspense>
            </PageTransition>
          )}

          {/* 4. Seller Admin Stock Management Console */}
          {currentView === 'seller_admin' && seller.isAuthenticated && (
            <PageTransition key="seller_admin">
              <Suspense fallback={<SellerAdminSkeleton label={t.loadingPage} />}>
                <SellerAdminStock
                  products={sellerProducts}
                  onUpdateProductStock={handleUpdateProductStock}
                  onToggleProductVisibility={handleToggleProductVisibility}
                  onOpenNewProduct={() => setIsNewProductModalOpen(true)}
                  onBackToMarketplace={() => setCurrentView('catalog')}
                  seller={seller}
                  lang={lang}
                />
              </Suspense>
            </PageTransition>
          )}
        </AnimatePresence>
      </main>

      {/* Overlays montés sous AnimatePresence pour jouer leur animation de sortie */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            key="cart-drawer"
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cart}
            getStock={currentStock}
            onUpdateQuantity={handleUpdateCartQty}
            onRemoveItem={handleRemoveFromCart}
            onProceedToCheckout={handleProceedToCheckout}
            lang={lang}
          />
        )}
      </AnimatePresence>

      {/* Fenêtres chargées à la demande : indicateur discret le temps du premier téléchargement */}
      <Suspense fallback={<OverlayLoader label={t.loadingWindow} />}>
        <AnimatePresence>
          {isSellerLoginOpen && (
            <SellerLoginModal
              key="seller-login"
              isOpen={isSellerLoginOpen}
              onClose={() => setIsSellerLoginOpen(false)}
              onLoginSuccess={handleSellerLoginSuccess}
            />
          )}
        </AnimatePresence>
      </Suspense>

      <Suspense fallback={<OverlayLoader label={t.loadingWindow} />}>
        <AnimatePresence>
          {isNewProductModalOpen && (
            <NewProductModal
              key="new-product"
              isOpen={isNewProductModalOpen}
              onClose={() => setIsNewProductModalOpen(false)}
              onSave={handleSaveNewProduct}
            />
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  );
}
