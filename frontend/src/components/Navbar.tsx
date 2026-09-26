import React, { useState } from 'react';
import { AppView, Language, SellerProfile } from '../types';
import { DJASSA_LOGO, translations } from '../data/mockData';

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
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#fed7aa]/60 shadow-[0_2px_12px_rgba(234,88,12,0.04)]">
      {/* Top micro promo bar with sleek black gradient */}
      <div className="bg-gradient-dark text-white text-[11px] font-medium py-1.5 px-4 text-center border-b border-zinc-800/80 flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse" />
        <span className="tracking-wide">
          <strong className="text-[#f97316]">Djassa Market</strong> • {t.freeDeliveryBadge} • Expédition express Abidjan, Dakar & Lomé
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo with Official User Logo */}
        <button
          onClick={() => onNavigate('catalog')}
          className="flex items-center gap-3 text-left group transition-transform active:scale-98"
        >
          <div className="w-11 h-11 rounded-2xl overflow-hidden bg-gradient-dark p-0.5 shadow-[0_4px_14px_rgba(0,0,0,0.25)] border border-zinc-800 group-hover:border-[#ea580c] transition-all shrink-0">
            <img
              src={DJASSA_LOGO}
              alt="Djassa Market Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-[#0f172a] block leading-none">
              Djassa <span className="text-[#ea580c]">Market</span>
            </span>
          </div>
        </button>

        {/* Search Bar (visible on catalog) */}
        {currentView === 'catalog' && (
          <div className="relative flex-1 max-w-md hidden md:flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[#94a3b8] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-9 py-2 bg-[#fffaf5] text-[#0f172a] placeholder:text-[#94a3b8] text-xs font-medium rounded-full border border-[#fed7aa]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/30 focus:border-[#ea580c] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-[#94a3b8] hover:text-[#0f172a]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        )}

        {/* Right Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* FR / EN Toggle with Official France and UK Flags */}
          <div className="flex items-center bg-[#fffaf5] p-0.5 rounded-full border border-[#fed7aa]/80 text-xs font-bold shadow-2xs">
            <button
              onClick={() => onToggleLang('FR')}
              className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                lang === 'FR'
                  ? 'bg-gradient-orange text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
              title="Français"
            >
              <svg
                className="w-3.5 h-2.5 rounded-2xs shrink-0 shadow-2xs overflow-hidden"
                viewBox="0 0 640 480"
                aria-hidden="true"
              >
                <g fillRule="evenodd" strokeWidth="1pt">
                  <path fill="#fff" d="M0 0h640v480H0z" />
                  <path fill="#002654" d="M0 0h213.3v480H0z" />
                  <path fill="#ce1126" d="M426.7 0H640v480H426.7z" />
                </g>
              </svg>
              <span>FR</span>
            </button>
            <button
              onClick={() => onToggleLang('EN')}
              className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                lang === 'EN'
                  ? 'bg-gradient-orange text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
              title="English"
            >
              <svg
                className="w-3.5 h-2.5 rounded-2xs shrink-0 shadow-2xs overflow-hidden"
                viewBox="0 0 640 480"
                aria-hidden="true"
              >
                <path fill="#012169" d="M0 0h640v480H0z" />
                <path
                  fill="#FFF"
                  d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-179L0 60V0h75z"
                />
                <path
                  fill="#C8102E"
                  d="m424 288 216 159v33h-44L366 312l58-24zM640 0v10L443 157l54 22L640 41V0zm-186 90 56 21L82 480H26l216-160 54 21L82 480H26L454 90zM0 440v40h42L220 327l-52-22L0 440zM0 0l225 166-50 20L0 42V0z"
                />
                <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
                <path fill="#C8102E" d="M267 0v480h106V0H267zM0 187v106h640V187H0z" />
              </svg>
              <span>EN</span>
            </button>
          </div>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fffaf5] hover:bg-[#ffedd5] border border-[#fed7aa] text-[#0f172a] transition-all shadow-xs"
            title={t.cart}
          >
            <span className="material-symbols-outlined text-[20px] text-[#ea580c]">
              shopping_bag
            </span>
            <span className="text-xs font-bold hidden sm:inline">{t.cart}</span>
            {cartCount > 0 && (
              <span className="min-w-[20px] h-5 px-1 rounded-full bg-gradient-orange text-white text-[11px] font-extrabold flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* Seller Space Trigger - NO PERSON PHOTO */}
          {seller.isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowSellerMenu(!showSellerMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gradient-dark text-white border border-zinc-700 hover:border-[#ea580c] transition-colors shadow-xs"
              >
                {/* Clean vendor icon badge instead of personal photo */}
                <div className="w-6 h-6 rounded-full bg-[#ea580c] text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                  PRO
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-white block leading-tight">
                    {seller.shopName}
                  </span>
                  <span className="text-[10px] text-[#f97316] font-semibold block leading-tight">
                    {t.sellerSpace}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-zinc-400">
                  expand_more
                </span>
              </button>

              {/* Dropdown Menu */}
              {showSellerMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-[#fed7aa] p-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-[#fed7aa]/50 bg-[#fffaf5] rounded-xl mb-1">
                    <p className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#ea580c] text-[16px]">
                        verified
                      </span>
                      <span>{seller.name}</span>
                    </p>
                    <p className="text-[11px] text-[#64748b]">{seller.email}</p>
                  </div>
                  <div className="flex flex-col py-1">
                    <button
                      onClick={() => {
                        onNavigate('seller_admin');
                        setShowSellerMenu(false);
                      }}
                      className="px-3 py-2 text-left text-xs font-semibold text-[#0f172a] hover:bg-[#fff7ed] rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#ea580c] text-[18px]">
                        inventory_2
                      </span>
                      <span>Gérer les stocks</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('catalog');
                        setShowSellerMenu(false);
                      }}
                      className="px-3 py-2 text-left text-xs font-semibold text-[#0f172a] hover:bg-[#fff7ed] rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#ea580c] text-[18px]">
                        local_mall
                      </span>
                      <span>{t.publicMarketplace}</span>
                    </button>
                    <div className="my-1 border-t border-[#fed7aa]/50" />
                    <button
                      onClick={() => {
                        onLogoutSeller();
                        setShowSellerMenu(false);
                      }}
                      className="px-3 py-2 text-left text-xs font-semibold text-[#dc2626] hover:bg-[#fee2e2] rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenSellerLogin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-dark hover:bg-zinc-900 border border-zinc-700 text-xs font-bold text-white shadow-xs hover:border-[#ea580c] transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ea580c]">
                admin_panel_settings
              </span>
              <span>{t.sellerAccess}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

