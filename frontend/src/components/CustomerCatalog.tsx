import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Product, Language } from '../types';
import { translations } from '../data/mockData';
import {
  AnimatePresence,
  m,
  duration,
  ease,
  flyToCart,
  stagger,
  toast,
  trackSpotlight,
  type Variants
} from '../motion';
import { HomeHero, HOME_INTRO_DURATION } from './HomeHero';
import { Button } from './Button';
import { SmartImage } from './SmartImage';

// Les sections du catalogue enchaînent sur la fin de l'intro du hero.
const SECTION_DELAY = HOME_INTRO_DURATION - 0.15;
const introTransition = { duration: duration.intro, ease: ease.emphasized };

const sidebarVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      ...introTransition,
      delay: SECTION_DELAY,
      delayChildren: stagger(0.07, { startDelay: SECTION_DELAY + 0.1 })
    }
  }
};

const sectionItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: introTransition }
};

const controlsVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { ...introTransition, delay: SECTION_DELAY + 0.05 } }
};

// Révélation au défilement. Les éléments qui entrent ensemble dans le viewport (même frame)
// sont décalés entre eux, quel que soit le nombre de colonnes. Au chargement, ils attendent la fin de l'intro.
function createScrollReveal(mountedAt: number): Variants {
  let lastTrigger = -Infinity;
  let batchIndex = 0;
  return {
    hidden: { opacity: 0, y: 28, scale: 0.97 },
    visible: () => {
      const now = performance.now();
      batchIndex = now - lastTrigger < 50 ? Math.min(batchIndex + 1, 6) : 0;
      lastTrigger = now;
      const wait = Math.max(0, HOME_INTRO_DURATION - (now - mountedAt) / 1000);
      return {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { ...introTransition, delay: wait + batchIndex * 0.08 }
      };
    }
  };
}

// Marge haute quasi infinie : une carte que le navigateur n'a pas vue passer (défilement très rapide
// sur un appareil chargé) compte comme déjà vue et se révèle — aucune carte ne reste invisible.
// Par le bas, la carte se révèle toujours quand 20 % sont à l'écran.
const revealViewport = { once: true, amount: 0.2, margin: '9999px 0px 0px 0px' };

interface CustomerCatalogProps {
  products: Product[];
  // false : tout le stock disponible est déjà dans le panier.
  onAddToCart: (product: Product) => boolean;
  lang: Language;
  globalSearch: string;
}

export const CustomerCatalog: React.FC<CustomerCatalogProps> = ({
  products,
  onAddToCart,
  lang,
  globalSearch
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [scrollReveal] = useState(() => createScrollReveal(performance.now()));
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const t = translations[lang];

  // Retour visuel sur le bouton lui-même après un ajout au panier (en plus du toast).
  const renderAddToCartLabel = (productId: string, iconClass: string) =>
    justAddedId === productId ? (
      <span key="added" className="inline-flex items-center gap-2 animate-scale-in">
        <span className={`material-symbols-outlined ${iconClass}`} aria-hidden="true">
          check_circle
        </span>
        <span>{lang === 'FR' ? 'Ajouté' : 'Added'}</span>
      </span>
    ) : (
      <span key="idle" className="inline-flex items-center gap-2 animate-fade-in">
        <span className={`material-symbols-outlined ${iconClass}`} aria-hidden="true">
          shopping_bag
        </span>
        <span>{t.addToCart}</span>
      </span>
    );

  // Les produits masqués par leur vendeur ne comptent pas dans les catégories.
  const visibleProducts = useMemo(() => products.filter((p) => p.visibility), [products]);

  // Category counts
  const categoriesList = useMemo(() => {
    const map = new Map<string, number>();
    visibleProducts.forEach((p) => {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [visibleProducts]);

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.visibility) return false;

      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

      // Price
      if (p.price > maxPrice) return false;

      // Stock
      if (stockFilter === 'in_stock' && p.stock <= 0) return false;
      if (stockFilter === 'low_stock' && (p.stock <= 0 || p.stock >= 10)) return false;

      // Search
      if (globalSearch) {
        const q = globalSearch.toLowerCase();
        const matchName = (p.name + ' ' + p.nameEn).toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchShop = p.sellerShopName.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchCat && !matchShop) return false;
      }

      return true;
    });
  }, [products, selectedCategory, maxPrice, stockFilter, globalSearch]);

  // Sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }
    return list;
  }, [filteredProducts, sortBy]);

  // Un seul minuteur actif : un nouveau message n'est plus effacé par le minuteur du précédent.
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const showToast = (message: string) => {
    clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(() => setToastMessage(null), 3000);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const handleAddToCart = (product: Product, button?: HTMLElement) => {
    const name = lang === 'FR' ? product.name : product.nameEn;
    if (!onAddToCart(product)) {
      showToast(
        lang === 'FR'
          ? `Stock maximum atteint pour ${name} (${product.stock} disponibles).`
          : `Maximum stock reached for ${name} (${product.stock} available).`
      );
      return;
    }
    showToast(lang === 'FR' ? `${name} ajouté au panier !` : `${name} added to cart!`);
    if (button) flyToCart(button, product.image);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId((id) => (id === product.id ? null : id)), 1400);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setMaxPrice(150000);
    setStockFilter('all');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <m.div
            key={toastMessage}
            variants={toast}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="status"
            className="fixed bottom-6 right-6 max-w-[calc(100vw-3rem)] bg-[#0f172a] text-white px-4 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-3 border border-[#ea580c]"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-orange text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </div>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </m.div>
        )}
      </AnimatePresence>

      {/* Hero Welcome Minimalist Banner with black gradient (dégradé noir) & official logo */}
      <HomeHero title={t.catalogTitle} subtitle={t.catalogSubtitle} />

      {/* Main Grid: Filters + Products */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Left Filter Sidebar */}
        <m.aside
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-64 shrink-0 flex flex-col gap-5"
        >
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#fed7aa]/60 flex flex-col gap-5">
            <m.div variants={sectionItem} className="flex items-center justify-between border-b border-[#fed7aa]/50 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-[#0f172a]">
                <span className="material-symbols-outlined text-[#ea580c] text-[20px]">
                  tune
                </span>
                <span>{t.filters}</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#ea580c] hover:underline"
              >
                {t.resetFilters}
              </button>
            </m.div>

            {/* Categories */}
            <m.div variants={sectionItem} className="flex flex-col gap-2">
              <span className="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider">
                {t.categories}
              </span>
              <div className="flex flex-col gap-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl item-motion ${
                    selectedCategory === 'all'
                      ? 'bg-[#fff7ed] text-[#ea580c] font-bold border border-[#fed7aa]'
                      : 'text-[#64748b] hover:bg-[#fffaf5]'
                  }`}
                >
                  <span>{t.all}</span>
                  <span className="text-[11px] text-[#94a3b8]">{visibleProducts.length}</span>
                </button>

                {categoriesList.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl item-motion ${
                      selectedCategory === cat.name
                        ? 'bg-[#fff7ed] text-[#ea580c] font-bold border border-[#fed7aa]'
                        : 'text-[#64748b] hover:bg-[#fffaf5]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] text-[#94a3b8]">{cat.count}</span>
                  </button>
                ))}
              </div>
            </m.div>

            {/* Price Range Slider in XOF */}
            <m.div variants={sectionItem} className="flex flex-col gap-2 border-t border-[#fed7aa]/50 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#0f172a] uppercase tracking-wider">
                  {t.priceRange}
                </span>
                <span className="font-bold text-[#ea580c]">
                  ≤ {maxPrice.toLocaleString()} XOF
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="150000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#ea580c] h-1.5 bg-[#fed7aa] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#94a3b8]">
                <span>10 000 XOF</span>
                <span>150 000 XOF</span>
              </div>
            </m.div>

            {/* Stock status */}
            <m.div variants={sectionItem} className="flex flex-col gap-2 border-t border-[#fed7aa]/50 pt-4">
              <span className="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider">
                {t.stockStatus}
              </span>
              <div className="flex flex-col gap-1.5 text-xs text-[#64748b]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stock"
                    checked={stockFilter === 'all'}
                    onChange={() => setStockFilter('all')}
                    className="accent-[#ea580c]"
                  />
                  <span>{t.all}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stock"
                    checked={stockFilter === 'in_stock'}
                    onChange={() => setStockFilter('in_stock')}
                    className="accent-[#ea580c]"
                  />
                  <span>{t.onlyInStock}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stock"
                    checked={stockFilter === 'low_stock'}
                    onChange={() => setStockFilter('low_stock')}
                    className="accent-[#ea580c]"
                  />
                  <span>{t.lowStockOnly}</span>
                </label>
              </div>
            </m.div>
          </div>
        </m.aside>

        {/* Right Content Area: Products */}
        <div className="flex-1 w-full flex flex-col gap-5">
          {/* Controls Bar: Sort, Counts & Grid/List switcher */}
          <m.div
            variants={controlsVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl p-4 shadow-xs border border-[#fed7aa]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <span className="text-xs font-bold text-[#64748b]">
              <strong className="text-[#0f172a] font-extrabold">{sortedProducts.length}</strong>{' '}
              {lang === 'FR' ? 'articles disponibles' : 'items available'}
            </span>

            <div className="flex items-center gap-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#64748b] hidden sm:inline">{t.sortBy}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#fffaf5] text-[#0f172a] text-xs font-bold py-1.5 px-3 rounded-xl border border-[#fed7aa] focus:outline-none cursor-pointer"
                >
                  <option value="popular">{t.popular}</option>
                  <option value="price_asc">{t.priceAsc}</option>
                  <option value="price_desc">{t.priceDesc}</option>
                  <option value="rating">{t.bestRated}</option>
                </select>
              </div>

              {/* Grid / List Switcher */}
              <div className="flex items-center bg-[#fffaf5] p-1 rounded-xl border border-[#fed7aa]">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  aria-label={t.viewGrid}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center item-motion ${
                    viewMode === 'grid'
                      ? 'bg-gradient-orange text-white shadow-xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                  title={t.viewGrid}
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  aria-label={t.viewList}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center item-motion ${
                    viewMode === 'list'
                      ? 'bg-gradient-orange text-white shadow-xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                  title={t.viewList}
                >
                  <span className="material-symbols-outlined text-[18px]">view_list</span>
                </button>
              </div>
            </div>
          </m.div>

          {/* Products Display: Grid or List Mode */}
          {viewMode === 'grid' ? (
            <div key="grid" onPointerMove={trackSpotlight} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProducts.map((product) => {
                const isLowStock = product.stock > 0 && product.stock < 10;
                const isOutOfStock = product.stock <= 0;

                return (
                  // Deux niveaux : l'extérieur gère la révélation au scroll (motion, style inline),
                  // l'intérieur l'élévation au survol (CSS card-motion), qui serait sinon écrasée.
                  <m.div
                    key={product.id}
                    variants={scrollReveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                    className="h-full"
                  >
                  <div className="card-motion card-spotlight group h-full bg-white rounded-3xl p-4 shadow-xs border border-[#fed7aa]/60 hover:border-[#ea580c]/50 flex flex-col justify-between">
                    <div>
                      {/* Product Image Frame */}
                      <div className="relative w-full h-52 bg-gradient-orange-subtle rounded-2xl flex items-center justify-center p-4 overflow-hidden border border-[#fed7aa]/30">
                        <SmartImage
                          src={product.image}
                          alt={lang === 'FR' ? product.name : product.nameEn}
                          wrapperClassName="h-full w-full rounded-xl"
                          className="object-contain h-full w-full motion-safe:group-hover:scale-105"
                        />
                        {/* Stock status badge */}
                        <div className="absolute top-3 left-3">
                          {isOutOfStock ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#fee2e2] text-[#dc2626] text-[10px] font-extrabold uppercase tracking-wide">
                              {t.outOfStock}
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#ffedd5] text-[#c2410c] text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" />
                              {product.stock} {t.units} restants
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#16a34a] text-[10px] font-extrabold uppercase tracking-wide">
                              {t.inStock}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="pt-4 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px] text-[#94a3b8]">
                          <span className="font-mono">SKU: {product.sku}</span>
                          <span>{product.category}</span>
                        </div>

                        <h3 className="text-sm font-bold text-[#0f172a] group-hover:text-[#ea580c] transition-colors line-clamp-1">
                          {lang === 'FR' ? product.name : product.nameEn}
                        </h3>

                        <span className="inline-flex items-center gap-1 text-[11px] text-[#64748b]">
                          <span className="material-symbols-outlined text-[14px] text-[#ea580c]" aria-hidden="true">
                            storefront
                          </span>
                          {t.soldBy}{' '}
                          <strong className="font-bold text-[#0f172a]">{product.sellerShopName}</strong>
                        </span>

                        {/* Rating */}
                        <div className="flex items-center gap-1 text-[11px] text-[#f59e0b]">
                          <span className="material-symbols-outlined text-[15px] material-symbols-filled">
                            star
                          </span>
                          <span className="font-bold text-[#0f172a]">
                            {product.rating.toFixed(1)}
                          </span>
                          <span className="text-[#94a3b8]">({product.reviewsCount})</span>
                        </div>

                        {/* Price in XOF */}
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-lg font-black text-[#0f172a]">
                            {product.price.toLocaleString()} XOF
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-[#94a3b8] line-through">
                              {product.originalPrice.toLocaleString()} XOF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart CTA Button */}
                    <Button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => handleAddToCart(product, e.currentTarget)}
                      className="w-full mt-4 py-2.5 rounded-2xl bg-gradient-orange text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      {renderAddToCartLabel(product.id, 'text-[18px]')}
                    </Button>
                  </div>
                  </m.div>
                );
              })}
            </div>
          ) : (
            /* List View Mode (like Image 2 & requested by user) */
            <div className="bg-white rounded-3xl shadow-xs border border-[#fed7aa]/60 overflow-hidden">
              <div key="list" className="divide-y divide-[#fed7aa]/40">
                {sortedProducts.map((product) => {
                  const isLowStock = product.stock > 0 && product.stock < 10;
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <m.div
                      key={product.id}
                      variants={scrollReveal}
                      initial="hidden"
                      whileInView="visible"
                      viewport={revealViewport}
                      className="group p-4 sm:p-5 hover:bg-[#fffaf5] transition-colors flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-20 h-20 bg-gradient-orange-subtle rounded-2xl p-2 shrink-0 border border-[#fed7aa]/30 flex items-center justify-center">
                          <SmartImage
                            src={product.image}
                            alt={product.name}
                            wrapperClassName="h-full w-full rounded-xl"
                            className="w-full h-full object-contain motion-safe:group-hover:scale-105"
                          />
                        </div>

                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 text-[11px] text-[#94a3b8]">
                            <span className="font-mono">SKU: {product.sku}</span>
                            <span>•</span>
                            <span>{product.category}</span>
                          </div>
                          <h4 className="text-sm font-bold text-[#0f172a] truncate">
                            {lang === 'FR' ? product.name : product.nameEn}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#64748b]">
                            <span className="material-symbols-outlined text-[14px] text-[#ea580c]" aria-hidden="true">
                              storefront
                            </span>
                            {t.soldBy}{' '}
                            <strong className="font-bold text-[#0f172a]">{product.sellerShopName}</strong>
                          </span>
                          <p className="text-xs text-[#64748b] line-clamp-1">
                            {lang === 'FR' ? product.description : product.descriptionEn}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-extrabold text-[#0f172a]">
                              {product.price.toLocaleString()} XOF
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isOutOfStock
                                  ? 'bg-[#fee2e2] text-[#dc2626]'
                                  : isLowStock
                                  ? 'bg-[#ffedd5] text-[#c2410c]'
                                  : 'bg-[#dcfce7] text-[#16a34a]'
                              }`}
                            >
                              {isOutOfStock
                                ? t.outOfStock
                                : `${product.stock} ${t.units}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto flex items-center justify-end">
                        <Button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={(e) => handleAddToCart(product, e.currentTarget)}
                          className="w-full sm:w-auto sm:min-w-42 px-5 py-2.5 rounded-2xl bg-gradient-orange text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2"
                        >
                          {renderAddToCartLabel(product.id, 'text-[17px]')}
                        </Button>
                      </div>
                    </m.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
