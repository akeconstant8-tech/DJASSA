import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppView, Language, SellerProfile } from '../types';
import { DJASSA_LOGO, translations } from '../data/mockData';
import { AnimatePresence, m, dropdown, pop, pressable } from '../motion';
import { SmartImage } from './SmartImage';
import { DesktopNav } from './navigation/DesktopNav';
import { LangToggle } from './navigation/LangToggle';
import { MenuToggle } from './navigation/MenuToggle';
import { MobileMenu } from './navigation/MobileMenu';
import type { NavItem } from './navigation/types';

const MOBILE_MENU_ID = 'mobile-menu';
// Aligné sur le breakpoint `lg` : navigation desktop au-dessus, menu mobile en dessous.
const DESKTOP_QUERY = '(min-width: 1024px)';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  lang: Language;
  onToggleLang: (lang: Language) => void;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  seller: SellerProfile;
  onOpenSellerLogin: () => void;
  onLogoutSeller: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  lang,
  onToggleLang,
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  seller,
  onOpenSellerLogin,
  onLogoutSeller
}) => {
  const [showSellerMenu, setShowSellerMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const sellerMenuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const t = translations[lang];

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMenuOpen(false);
    if (restoreFocus) toggleRef.current?.focus({ preventScroll: true });
  }, []);

  // Le menu mobile se referme après chaque changement de page et au passage en affichage desktop.
  useEffect(() => {
    setMenuOpen(false);
    setShowSellerMenu(false);
  }, [currentView]);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  // Le menu vendeur se ferme au clic/tap à l'extérieur et avec Échap.
  useEffect(() => {
    if (!showSellerMenu) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!sellerMenuRef.current?.contains(e.target as Node)) setShowSellerMenu(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSellerMenu(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSellerMenu]);

  // Les pages de paiement et de confirmation ne correspondent à aucune entrée de navigation.
  const activeKey = currentView === 'catalog' ? 'catalog' : currentView === 'seller_admin' ? 'seller' : null;

  // Re-sélectionner la page courante depuis le menu mobile le referme simplement.
  const go = (view: AppView) => {
    if (view === currentView) {
      closeMenu(menuOpen);
      return;
    }
    onNavigate(view);
  };

  const openSellerSpace = () => {
    if (seller.isAuthenticated) {
      go('seller_admin');
      return;
    }
    setMenuOpen(false);
    onOpenSellerLogin();
  };

  const navItems: NavItem[] = [
    { key: 'catalog', label: t.navCatalog, icon: 'storefront', onSelect: () => go('catalog') },
    {
      key: 'seller',
      label: t.navSeller,
      icon: seller.isAuthenticated ? 'inventory_2' : 'lock',
      onSelect: openSellerSpace,
      hint: seller.isAuthenticated ? seller.shopName : t.loginRequired,
      ariaLabel: seller.isAuthenticated ? undefined : `${t.navSeller} — ${t.loginRequired}`
    }
  ];

  const mobileItems: NavItem[] = [
    ...navItems,
    {
      key: 'cart',
      label: t.cart,
      icon: 'shopping_bag',
      badge: cartCount || undefined,
      onSelect: () => {
        setMenuOpen(false);
        onOpenCart();
      }
    }
  ];

  // Même champ de recherche en ligne (grands écrans) et sous l'en-tête (mobile, tablette).
  const renderSearch = (visibilityClass: string) => (
    <div className={`relative flex-1 items-center ${visibilityClass}`}>
      <span className="material-symbols-outlined absolute left-3.5 text-[#94a3b8] text-[18px]" aria-hidden="true">
        search
      </span>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t.searchPlaceholder}
        aria-label={t.searchPlaceholder}
        className="w-full pl-10 pr-9 py-2 bg-[#fffaf5] text-[#0f172a] placeholder:text-[#94a3b8] text-xs font-medium rounded-full border border-[#fed7aa]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/30 focus:border-[#ea580c] transition-all [&::-webkit-search-cancel-button]:hidden"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          aria-label="Effacer la recherche"
          className="absolute right-2 w-7 h-7 rounded-full flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] item-motion"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
        </button>
      )}
    </div>
  );

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#fed7aa]/60 shadow-[0_2px_12px_rgba(234,88,12,0.04)]"
    >
      {/* Top micro promo bar with sleek black gradient */}
      <div className="bg-gradient-dark text-white text-[11px] font-medium py-1.5 px-4 text-center border-b border-zinc-800/80 flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] shrink-0" aria-hidden="true" />
        <span className="tracking-wide">
          <strong className="text-[#f97316]">Djassa Market</strong> • {t.freeDeliveryBadge} • Expédition express Abidjan, Dakar & Lomé
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-2 sm:gap-4">
        {/* Brand Logo with Official User Logo */}
        <button
          type="button"
          onClick={() => go('catalog')}
          aria-label={`Djassa Market — ${t.navCatalog}`}
          className="flex items-center gap-3 shrink-0 text-left group rounded-2xl transition-transform active:scale-98 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ea580c]"
        >
          <div className="w-11 h-11 rounded-2xl overflow-hidden bg-gradient-dark p-0.5 shadow-[0_4px_14px_rgba(0,0,0,0.25)] border border-zinc-800 group-hover:border-[#ea580c] transition-all shrink-0">
            <SmartImage
              src={DJASSA_LOGO}
              alt=""
              priority
              dark
              wrapperClassName="w-full h-full rounded-[14px]"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Masqué sous 360px (le logo reste) : évite le débordement horizontal sur les plus petits écrans */}
          <span className="hidden min-[360px]:block text-xl font-black tracking-tight text-[#0f172a] leading-none">
            Djassa <span className="text-[#ea580c]">Market</span>
          </span>
        </button>

        <DesktopNav items={navItems} activeKey={activeKey} label={t.mainNav} className="hidden lg:flex" />

        {/* Search Bar (visible on catalog) */}
        {currentView === 'catalog' && renderSearch('hidden xl:flex max-w-md')}

        {/* Right Navigation & Controls */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <LangToggle lang={lang} onToggleLang={onToggleLang} className="hidden lg:flex" />

          {/* Cart Trigger */}
          <m.button
            {...pressable}
            type="button"
            onClick={onOpenCart}
            data-cart-target
            className="relative flex items-center gap-1.5 min-h-10 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#fffaf5] hover:bg-[#ffedd5] border border-[#fed7aa] text-[#0f172a] transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea580c]"
            title={t.cart}
            aria-label={cartCount ? `${t.cart} (${cartCount})` : t.cart}
          >
            <span className="material-symbols-outlined text-[20px] text-[#ea580c]" aria-hidden="true">
              shopping_bag
            </span>
            <span className="text-xs font-bold hidden sm:inline">{t.cart}</span>
            {cartCount > 0 && (
              // key={cartCount} : le badge rebondit à chaque changement de quantité.
              <m.span
                key={cartCount}
                variants={pop}
                initial="hidden"
                animate="visible"
                aria-hidden="true"
                className="min-w-[20px] h-5 px-1 rounded-full bg-gradient-orange text-white text-[11px] font-extrabold flex items-center justify-center shadow-xs"
              >
                {cartCount}
              </m.span>
            )}
          </m.button>

          {/* Compte vendeur (grands écrans) — sur mobile, il est dans le menu */}
          {seller.isAuthenticated && (
            <div className="relative hidden lg:block" ref={sellerMenuRef}>
              <button
                type="button"
                onClick={() => setShowSellerMenu(!showSellerMenu)}
                aria-haspopup="menu"
                aria-expanded={showSellerMenu}
                aria-label={`${t.sellerAccount} — ${seller.shopName}`}
                className="flex items-center gap-2 min-h-10 pl-2 pr-3 py-1.5 rounded-full bg-gradient-dark text-white border border-zinc-700 hover:border-[#ea580c] shadow-xs btn-motion"
              >
                {/* Clean vendor icon badge instead of personal photo */}
                <div className="w-6 h-6 rounded-full bg-[#ea580c] text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                  PRO
                </div>
                <div className="text-left hidden xl:block">
                  <span className="text-xs font-bold text-white block leading-tight">
                    {seller.shopName}
                  </span>
                  <span className="text-[10px] text-[#f97316] font-semibold block leading-tight">
                    {t.sellerSpace}
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className={`material-symbols-outlined text-[16px] text-zinc-400 transition-transform duration-300 ease-emphasized ${showSellerMenu ? 'rotate-180' : ''}`}
                >
                  expand_more
                </span>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showSellerMenu && (
                  <m.div
                    key="seller-menu"
                    variants={dropdown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{ transformOrigin: 'top right' }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-[#fed7aa] p-2 z-50"
                  >
                    <div className="px-3 py-2 border-b border-[#fed7aa]/50 bg-[#fffaf5] rounded-xl mb-1">
                      <p className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#ea580c] text-[16px]" aria-hidden="true">
                          verified
                        </span>
                        <span>{seller.name}</span>
                      </p>
                      <p className="text-[11px] text-[#64748b]">{seller.email}</p>
                    </div>
                    <div className="flex flex-col py-1">
                      <button
                        type="button"
                        onClick={() => {
                          go('seller_admin');
                          setShowSellerMenu(false);
                        }}
                        aria-current={currentView === 'seller_admin' ? 'page' : undefined}
                        className="px-3 py-2 text-left text-xs font-semibold text-[#0f172a] hover:bg-[#fff7ed] rounded-xl flex items-center gap-2 item-motion aria-[current=page]:text-[#ea580c]"
                      >
                        <span className="material-symbols-outlined text-[#ea580c] text-[18px]" aria-hidden="true">
                          inventory_2
                        </span>
                        <span>Gérer les stocks</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          go('catalog');
                          setShowSellerMenu(false);
                        }}
                        aria-current={currentView === 'catalog' ? 'page' : undefined}
                        className="px-3 py-2 text-left text-xs font-semibold text-[#0f172a] hover:bg-[#fff7ed] rounded-xl flex items-center gap-2 item-motion aria-[current=page]:text-[#ea580c]"
                      >
                        <span className="material-symbols-outlined text-[#ea580c] text-[18px]" aria-hidden="true">
                          local_mall
                        </span>
                        <span>{t.publicMarketplace}</span>
                      </button>
                      <div className="my-1 border-t border-[#fed7aa]/50" />
                      <button
                        type="button"
                        onClick={() => {
                          onLogoutSeller();
                          setShowSellerMenu(false);
                        }}
                        className="px-3 py-2 text-left text-xs font-semibold text-[#dc2626] hover:bg-[#fee2e2] rounded-xl flex items-center gap-2 item-motion"
                      >
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <MenuToggle
            ref={toggleRef}
            open={menuOpen}
            onToggle={() => setMenuOpen((open) => !open)}
            controlsId={MOBILE_MENU_ID}
            openLabel={t.openMenu}
            closeLabel={t.closeMenu}
            className="lg:hidden"
          />
        </div>
      </div>

      {/* Recherche sous l'en-tête tant que la place manque pour l'afficher en ligne */}
      {currentView === 'catalog' && (
        <div className="xl:hidden max-w-7xl mx-auto px-4 sm:px-6 pb-3">{renderSearch('flex')}</div>
      )}

      <MobileMenu
        id={MOBILE_MENU_ID}
        open={menuOpen}
        onClose={closeMenu}
        anchorRef={headerRef}
        toggleRef={toggleRef}
        items={mobileItems}
        activeKey={activeKey}
        navLabel={t.mainNav}
      >
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#fed7aa]/70 bg-[#fffaf5] px-4 py-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748b]">{t.language}</span>
          <LangToggle lang={lang} onToggleLang={onToggleLang} />
        </div>
        {seller.isAuthenticated && (
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-gradient-dark px-4 py-3 text-white">
            <div className="w-9 h-9 rounded-full bg-[#ea580c] text-white flex items-center justify-center font-black text-[11px] shrink-0">
              PRO
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{seller.shopName}</p>
              <p className="text-[11px] text-zinc-400 truncate">{seller.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onLogoutSeller();
              }}
              aria-label={t.logout}
              className="flex items-center justify-center gap-1.5 min-h-10 min-w-10 px-2.5 rounded-xl text-xs font-bold text-[#fca5a5] shrink-0 item-motion"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
              {/* Libellé masqué sur téléphone pour laisser la place au nom de la boutique */}
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        )}
      </MobileMenu>
    </header>
  );
};
